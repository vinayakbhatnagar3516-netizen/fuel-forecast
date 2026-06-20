import { NextResponse } from "next/server";
import { db } from "@/db";
import { weatherData } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

export type WeatherRecord = {
  id: string;
  recordedDate: string;
  temperatureHigh: string | null;
  temperatureLow: string | null;
  rainfallMm: string | null;
  weatherCondition: string | null;
};

export async function GET() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const rows = await db
      .select()
      .from(weatherData)
      .orderBy(desc(weatherData.recordedDate))
      .limit(30);

    const data: WeatherRecord[] = rows.map((r) => ({
      id: r.id,
      recordedDate: r.recordedDate,
      temperatureHigh: r.temperatureHigh,
      temperatureLow: r.temperatureLow,
      rainfallMm: r.rainfallMm,
      weatherCondition: r.weatherCondition,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/weather error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
