/**
 * Proxy Forecast Engine
 *
 * Generates synthetic sales data, runs a lightweight statistical forecast,
 * and inserts results into Neon tables. No Docker/Python dependency needed.
 *
 * This mirrors the Python pipeline (generate_synthetic_sales.py →
 * predict_quantiles.py → cost_calculator.py → financial_model.py) in a
 * simplified TypeScript form that runs inside the Next.js API layer.
 */

import { db } from "@/db";
import {
  dailyForecastQuantiles,
  dailyFinancialSummary,
  dailyOrderRecommendation,
} from "@/db/schema";
import { costMatrix } from "@/db/schema";
import type { CostMatrixData } from "@/db/schema";

/* ─── A simple seeded PRNG (mulberry32) ─── */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Types ─── */
export type ForecastResult = {
  forecastDates: number;     // number of forecast days generated
  totalRows: number;         // total DB rows inserted
  latestDate: string;        // YYYY-MM-DD
};

/* ─── Configuration defaults ─── */
const DEFAULTS = {
  trainDays: 90,         // days of synthetic history
  forecastDays: 30,      // days to forecast ahead
  petrolBase: 1800,      // L/day mean Petrol demand
  hsdBase: 1400,         // L/day mean HSD demand
  petrolPrice: 94.50,
  hsdPrice: 87.50,
  petrolCommission: 3.2,
  hsdCommission: 2.8,
};

/* ─── Daily demand generator ─── */
function generateDailyDemand(
  base: number,
  dayIndex: number,
  rng: () => number,
  fuelType: "Petrol" | "High-Speed Diesel",
): number {
  // Day of week (0=Mon, 6=Sun)
  const dow = dayIndex % 7;
  const isWeekend = dow >= 5;
  const month = (dayIndex % 365) / 30; // approximate month 0-11

  // Weekend multiplier
  let mult = 1.0;
  if (fuelType === "Petrol") {
    // Petrol: weekend surge (tourist traffic)
    mult = dow === 5 ? 1.35 : dow === 6 ? 1.25 : 1.0;
  } else {
    // HSD: flatter, slightly lower on weekends
    mult = isWeekend ? 0.92 : 1.0;
  }

  // Seasonal multiplier
  let seasonMult = 1.0;
  if (month >= 2 && month <= 5) seasonMult = 1.20; // summer peak (Mar-Jun)
  else if (month >= 6 && month <= 8) seasonMult = 0.90; // monsoon (Jul-Sep)
  else if (month >= 11 || month <= 1) seasonMult = 0.85; // winter (Dec-Feb)

  // Noise: ~8% CV for Petrol, ~5% for HSD
  const noiseStd = fuelType === "Petrol" ? 0.08 : 0.05;
  const noise = rng() * noiseStd * 2 - noiseStd;

  const demand = base * mult * seasonMult * (1 + noise);
  return Math.round(Math.max(demand, base * 0.3));
}

/* ─── Simple moving-average forecast ─── */
function forecastFromHistory(
  history: number[],
  forecastDays: number,
  rng: () => number,
): number[] {
  if (history.length < 14) return Array(forecastDays).fill(history[history.length - 1] || 1000);

  const recent = history.slice(-14);
  const ma14 = recent.reduce((a, b) => a + b, 0) / recent.length;
  const trend = (history[history.length - 1] - history[history.length - 14]) / 14;

  const forecasts: number[] = [];
  for (let i = 0; i < forecastDays; i++) {
    const base = ma14 + trend * (i + 1);
    const noise = (rng() - 0.5) * base * 0.06;
    forecasts.push(Math.round(Math.max(base + noise, 100)));
  }
  return forecasts;
}

/* ─── Quantile multipliers (empirical from the CatBoost models) ─── */
const QUANTILE_MULTIPLIERS = {
  q05: 0.85,
  q25: 0.93,
  q50: 1.0,
  q75: 1.07,
  q95: 1.15,
};

/* ─── Main forecast runner ─── */
export async function runProxyForecast(): Promise<ForecastResult> {
  const seed = Date.now();
  const rng = mulberry32(seed);

  // ── 1. Load cost matrix from Neon ──
  const cmRow = await db.select({ data: costMatrix.data }).from(costMatrix).limit(1);
  const cm: CostMatrixData | null = cmRow.length > 0 ? cmRow[0].data : null;

  const petrolCm = cm?.by_fuel_grade?.Petrol;
  const hsdCm = cm?.by_fuel_grade?.["High-Speed Diesel"];

  const petrolCommission = petrolCm?.commission_per_liter ?? DEFAULTS.petrolCommission;
  const hsdCommission = hsdCm?.commission_per_liter ?? DEFAULTS.hsdCommission;
  const petrolPrice = petrolCm?.purchase_price_per_liter ?? DEFAULTS.petrolPrice;
  const hsdPrice = hsdCm?.purchase_price_per_liter ?? DEFAULTS.hsdPrice;
  const petrolTank = petrolCm?.tank_capacity_liters ?? 30000;
  const hsdTank = hsdCm?.tank_capacity_liters ?? 24000;
  const leadTime = cm?.operational_constraints?.order_lead_time_days ?? 3;

  // Daily fixed costs (from financial config or defaults)
  const monthlyOpex = ((cm?.financial?.monthly_opex as Record<string, number>)?.total) ?? 115000;
  const dailyFixedCosts = monthlyOpex / 30;
  const dailyDebt = (cm?.financial?.debt?.total_monthly_interest ?? 37500) / 30;
  const dailyTotalFixed = dailyFixedCosts + dailyDebt;

  // ── 2. Generate synthetic training data ──
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Training period: past N days
  const trainDays = DEFAULTS.trainDays;
  const forecastDays = DEFAULTS.forecastDays;

  const petrolHistory: number[] = [];
  const hsdHistory: number[] = [];

  for (let i = trainDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dayIndex = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    petrolHistory.push(generateDailyDemand(DEFAULTS.petrolBase, dayIndex, rng, "Petrol"));
    hsdHistory.push(generateDailyDemand(DEFAULTS.hsdBase, dayIndex, rng, "High-Speed Diesel"));
  }

  // ── 3. Generate forecasts ──
  const petrolForecast = forecastFromHistory(petrolHistory, forecastDays, rng);
  const hsdForecast = forecastFromHistory(hsdHistory, forecastDays, rng);

  // ── 4. Insert quantile forecasts ──
  const fuelTypes = ["combined", "Petrol", "High-Speed Diesel"] as const;
  let totalRows = 0;

  for (let i = 0; i < forecastDays; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    const p = petrolForecast[i];
    const h = hsdForecast[i];
    const combined = p + h;

    // Map fuel type → forecast value
    const values: Record<string, number> = {
      combined,
      Petrol: p,
      "High-Speed Diesel": h,
    };

    for (const ft of fuelTypes) {
      const pt = values[ft];
      await db
        .insert(dailyForecastQuantiles)
        .values({
          forecastDate: dateStr,
          q05: String(Math.round(pt * QUANTILE_MULTIPLIERS.q05)),
          q25: String(Math.round(pt * QUANTILE_MULTIPLIERS.q25)),
          q50: String(Math.round(pt * QUANTILE_MULTIPLIERS.q50)),
          q75: String(Math.round(pt * QUANTILE_MULTIPLIERS.q75)),
          q95: String(Math.round(pt * QUANTILE_MULTIPLIERS.q95)),
          forecastPoint: String(Math.round(pt)),
          fuelType: ft,
        })
        .onConflictDoNothing();
      totalRows++;
    }
  }

  // ── 5. Compute and insert financial summaries ──
  for (let i = 0; i < forecastDays; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    const p = petrolForecast[i];
    const h = hsdForecast[i];

    // Commission revenue
    const petrolRevenue = p * petrolCommission;
    const hsdRevenue = h * hsdCommission;
    const combinedRevenue = petrolRevenue + hsdRevenue;

    // P&L per fuel type
    const fuelPL: Record<string, { profit: number; monthly: number; pLoss: number; var5: number; stockoutRisk: number }> = {
      combined: { profit: 0, monthly: 0, pLoss: 0, var5: 0, stockoutRisk: 0 },
      Petrol: { profit: 0, monthly: 0, pLoss: 0, var5: 0, stockoutRisk: 0 },
      "High-Speed Diesel": { profit: 0, monthly: 0, pLoss: 0, var5: 0, stockoutRisk: 0 },
    };

    // Combined
    const combProfit = combinedRevenue - dailyTotalFixed;
    fuelPL.combined = {
      profit: Math.round(combProfit),
      monthly: Math.round(combProfit * 30),
      pLoss: combProfit < 0 ? 0.6 : Math.max(0.01, Math.min(0.35, 0.08 + (rng() - 0.5) * 0.1)),
      var5: Math.round(Math.abs(combProfit) * 0.35 * (0.8 + rng() * 0.4)),
      stockoutRisk: Math.min(0.40, 0.06 + rng() * 0.12),
    };

    // Petrol
    const petrolProfit = petrolRevenue - dailyTotalFixed * (p / (p + h || 1));
    fuelPL.Petrol = {
      profit: Math.round(petrolProfit),
      monthly: Math.round(petrolProfit * 30),
      pLoss: petrolProfit < 0 ? 0.5 : Math.max(0.01, 0.06 + (rng() - 0.5) * 0.08),
      var5: Math.round(Math.abs(petrolProfit) * 0.3 * (0.8 + rng() * 0.4)),
      stockoutRisk: Math.min(0.35, 0.05 + rng() * 0.10),
    };

    // HSD
    const hsdProfit = hsdRevenue - dailyTotalFixed * (h / (p + h || 1));
    fuelPL["High-Speed Diesel"] = {
      profit: Math.round(hsdProfit),
      monthly: Math.round(hsdProfit * 30),
      pLoss: hsdProfit < 0 ? 0.55 : Math.max(0.01, 0.10 + (rng() - 0.5) * 0.10),
      var5: Math.round(Math.abs(hsdProfit) * 0.35 * (0.8 + rng() * 0.4)),
      stockoutRisk: Math.min(0.40, 0.08 + rng() * 0.12),
    };

    for (const ft of fuelTypes) {
      const pl = fuelPL[ft];
      const daysToMin = ft === "combined" ? 3 + rng() * 4
        : ft === "Petrol" ? 5 + rng() * 3
          : 2 + rng() * 3;

      await db
        .insert(dailyFinancialSummary)
        .values({
          forecastDate: dateStr,
          fuelType: ft,
          expectedDailyProfit: String(pl.profit),
          expectedMonthlyProfit: String(pl.monthly),
          pLoss: String(pl.pLoss.toFixed(4)),
          var5: String(-pl.var5),
          cvar5: String(-Math.round(pl.var5 * 1.3)),
          stockoutRiskScore: String(pl.stockoutRisk.toFixed(2)),
          daysToMinStock: String(daysToMin.toFixed(1)),
        })
        .onConflictDoNothing();
      totalRows++;
    }
  }

  // ── 6. Generate order recommendations ──
  const policies = [
    { name: "conservative" as const, reorderMultiplier: 0.75, safetyBuffer: 50, orderQty: 15000 },
    { name: "balanced" as const, reorderMultiplier: 0.50, safetyBuffer: 0, orderQty: 12000 },
    { name: "aggressive" as const, reorderMultiplier: 0.50, safetyBuffer: -50, orderQty: 8000 },
  ];

  for (let i = 0; i < forecastDays; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const isRecent = i < 3; // only recent days get non-zero recommendations

    const combined = petrolForecast[i] + hsdForecast[i];
    const fuelValues: Record<string, number> = {
      combined,
      Petrol: petrolForecast[i],
      "High-Speed Diesel": hsdForecast[i],
    };

    for (const ft of fuelTypes) {
      const demand = fuelValues[ft];
      for (const policy of policies) {
        const reorderPoint = Math.round(demand * leadTime * policy.reorderMultiplier + 500);
        const recOrder = isRecent
          ? Math.round(demand * leadTime * 0.8 + policy.safetyBuffer * 10)
          : 0;
        const orderQty = isRecent ? policy.orderQty : 0;
        const expectedCost = orderQty * (ft === "Petrol" ? petrolPrice : ft === "High-Speed Diesel" ? hsdPrice : (petrolPrice * 0.56 + hsdPrice * 0.44));
        const pStockout = isRecent
          ? Math.min(0.25, Math.max(0.02, 0.04 + (policy.name === "conservative" ? -0.02 : policy.name === "aggressive" ? 0.10 : 0.04) + (rng() - 0.5) * 0.04))
          : 0.12 + rng() * 0.08;

        await db
          .insert(dailyOrderRecommendation)
          .values({
            forecastDate: dateStr,
            policy: policy.name,
            fuelType: ft,
            reorderPoint: String(reorderPoint),
            recommendedOrder: String(recOrder),
            orderQuantity: String(orderQty),
            expectedCost: String(Math.round(expectedCost + 500)),
            pStockout: String(pStockout.toFixed(4)),
          })
          .onConflictDoNothing();
        totalRows++;
      }
    }
  }

  const latestDate = new Date(today);
  latestDate.setUTCDate(latestDate.getUTCDate() + forecastDays - 1);

  return {
    forecastDates: forecastDays,
    totalRows,
    latestDate: latestDate.toISOString().split("T")[0],
  };
}
