import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  dailyForecastQuantiles,
  dailyFuelSummary,
  weatherData,
} from "@/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

const VALID_FUEL_TYPES = ["combined", "Petrol", "High-Speed Diesel"];

export type TrendPoint = {
  date: string;
  q05: number;
  q25: number;
  q50: number;
  q75: number;
  q95: number;
  forecastPoint: number;
};

export type ActualPoint = {
  date: string;
  totalLiters: number;
  totalRevenue: number;
  totalTransactions: number;
};

export type WeatherPoint = {
  date: string;
  tempHigh: number | null;
  tempLow: number | null;
  rainfallMm: number | null;
  condition: string | null;
};

export async function GET(request: Request) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const fuelType = searchParams.get("fuelType") || "combined";
    const horizon = parseInt(searchParams.get("horizon") || "30", 10);
    const ft = VALID_FUEL_TYPES.includes(fuelType) ? fuelType : "combined";
    const days = Math.min(Math.max(horizon, 7), 90);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    // Forecast history
    const forecastRows = await db
      .select({
        forecastDate: dailyForecastQuantiles.forecastDate,
        q05: dailyForecastQuantiles.q05,
        q25: dailyForecastQuantiles.q25,
        q50: dailyForecastQuantiles.q50,
        q75: dailyForecastQuantiles.q75,
        q95: dailyForecastQuantiles.q95,
        forecastPoint: dailyForecastQuantiles.forecastPoint,
      })
      .from(dailyForecastQuantiles)
      .where(
        and(
          eq(dailyForecastQuantiles.fuelType, ft),
          gte(dailyForecastQuantiles.forecastDate, cutoffStr),
        ),
      )
      .orderBy(dailyForecastQuantiles.forecastDate);

    const forecastHistory: TrendPoint[] = forecastRows.map((r) => ({
      date: r.forecastDate,
      q05: parseFloat(r.q05 ?? "0"),
      q25: parseFloat(r.q25 ?? "0"),
      q50: parseFloat(r.q50 ?? "0"),
      q75: parseFloat(r.q75 ?? "0"),
      q95: parseFloat(r.q95 ?? "0"),
      forecastPoint: parseFloat(r.forecastPoint ?? r.q50 ?? "0"),
    }));

    // Actual sales history (when pump is open / test data entered)
    const actualRows = await db
      .select({
        summaryDate: dailyFuelSummary.summaryDate,
        totalLiters: dailyFuelSummary.totalLiters,
        totalRevenue: dailyFuelSummary.totalRevenue,
        totalTransactions: dailyFuelSummary.totalTransactions,
      })
      .from(dailyFuelSummary)
      .where(
        and(
          eq(dailyFuelSummary.fuelType, ft),
          gte(dailyFuelSummary.summaryDate, cutoffStr),
        ),
      )
      .orderBy(dailyFuelSummary.summaryDate);

    const actualSales: ActualPoint[] = actualRows.map((r) => ({
      date: r.summaryDate,
      totalLiters: parseFloat(r.totalLiters ?? "0"),
      totalRevenue: parseFloat(r.totalRevenue ?? "0"),
      totalTransactions: r.totalTransactions ?? 0,
    }));

    // Weather history for the same window
    const weatherRows = await db
      .select({
        recordedDate: weatherData.recordedDate,
        temperatureHigh: weatherData.temperatureHigh,
        temperatureLow: weatherData.temperatureLow,
        rainfallMm: weatherData.rainfallMm,
        weatherCondition: weatherData.weatherCondition,
      })
      .from(weatherData)
      .where(gte(weatherData.recordedDate, cutoffStr))
      .orderBy(weatherData.recordedDate);

    const weather: WeatherPoint[] = weatherRows.map((r) => ({
      date: r.recordedDate,
      tempHigh: r.temperatureHigh ? parseFloat(r.temperatureHigh) : null,
      tempLow: r.temperatureLow ? parseFloat(r.temperatureLow) : null,
      rainfallMm: r.rainfallMm ? parseFloat(r.rainfallMm) : null,
      condition: r.weatherCondition,
    }));

    // Simple accuracy: where actual sales exist for a forecast date
    const actualMap = new Map(actualSales.map((a) => [a.date, a.totalLiters]));
    let totalPctError = 0;
    let comparisons = 0;
    let covered = 0;

    for (const f of forecastHistory) {
      const actual = actualMap.get(f.date);
      if (actual && actual > 0) {
        const error = Math.abs(f.forecastPoint - actual);
        const pctError = actual > 0 ? error / actual : 0;
        totalPctError += pctError;
        comparisons += 1;
        if (actual >= f.q05 && actual <= f.q95) {
          covered += 1;
        }
      }
    }

    const mape = comparisons > 0 ? (totalPctError / comparisons) * 100 : null;
    const coverage = comparisons > 0 ? (covered / comparisons) * 100 : null;

    return NextResponse.json({
      fuelType: ft,
      horizon: days,
      forecastHistory,
      actualSales,
      weather,
      accuracy: {
        mape: mape ? Number(mape.toFixed(2)) : null,
        coverage: coverage ? Number(coverage.toFixed(1)) : null,
        comparisons,
      },
    });
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json(
      { error: "Failed to load trends data" },
      { status: 500 },
    );
  }
}
