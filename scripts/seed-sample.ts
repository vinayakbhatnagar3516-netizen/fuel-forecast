/**
 * Seed sample forecast data into Neon
 *
 * Run: npx tsx scripts/seed-sample.ts
 *
 * This inserts realistic sample data so the dashboard shows
 * live data immediately. Replace with real pipeline data later.
 */
import { db } from "../src/db";
import {
  dailyForecastQuantiles,
  dailyFinancialSummary,
  dailyOrderRecommendation,
} from "../src/db/schema";

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function today(): Date {
  const d = new Date();
  // Use today but ensure date is consistent
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

// ── Realistic pump parameters ──
// Kandaghat-Chail Jio-BP: ~3,200 L/day combined, Petrol ~1,800 L, HSD ~1,400 L

async function main() {
  const t = today();
  const todayStr = formatDate(t);

  // Generate dates: today and 6 days back for trends
  const dates: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(t);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d);
  }

  console.log(`Seeding data for ${dates.length} days starting from ${formatDate(dates[0])}...`);

  // ── Seed daily_forecast_quantiles ──
  const quantileEntries: (typeof dailyForecastQuantiles.$inferInsert)[] = [];

  for (const d of dates) {
    const dStr = formatDate(d);
    const day = d.getUTCDay(); // 0=Sun, 6=Sat
    const weekendFactor = day === 0 || day === 6 ? 0.85 : 1.0;

    // Combined: base ~3,200 L/day
    const baseCombined = Math.round(3200 * weekendFactor * (0.9 + Math.random() * 0.2));
    quantileEntries.push(
      {
        forecastDate: dStr,
        q05: String(Math.round(baseCombined * 0.85)),
        q25: String(Math.round(baseCombined * 0.93)),
        q50: String(Math.round(baseCombined * 1.0)),
        q75: String(Math.round(baseCombined * 1.07)),
        q95: String(Math.round(baseCombined * 1.15)),
        forecastPoint: String(baseCombined),
        fuelType: "combined",
      },
      // Petrol: ~1,800 L/day
      {
        forecastDate: dStr,
        q05: String(Math.round(baseCombined * 0.85 * 0.56)),
        q25: String(Math.round(baseCombined * 0.93 * 0.56)),
        q50: String(Math.round(baseCombined * 1.0 * 0.56)),
        q75: String(Math.round(baseCombined * 1.07 * 0.56)),
        q95: String(Math.round(baseCombined * 1.15 * 0.56)),
        forecastPoint: String(Math.round(baseCombined * 0.56)),
        fuelType: "Petrol",
      },
      // HSD: ~1,400 L/day
      {
        forecastDate: dStr,
        q05: String(Math.round(baseCombined * 0.85 * 0.44)),
        q25: String(Math.round(baseCombined * 0.93 * 0.44)),
        q50: String(Math.round(baseCombined * 1.0 * 0.44)),
        q75: String(Math.round(baseCombined * 1.07 * 0.44)),
        q95: String(Math.round(baseCombined * 1.15 * 0.44)),
        forecastPoint: String(Math.round(baseCombined * 0.44)),
        fuelType: "High-Speed Diesel",
      },
    );
  }

  console.log(`  Inserting ${quantileEntries.length} quantile forecast rows...`);
  for (const entry of quantileEntries) {
    await db.insert(dailyForecastQuantiles).values(entry).onConflictDoNothing();
  }
  console.log(`  ✓ daily_forecast_quantiles seeded`);

  // ── Seed daily_financial_summary ──
  const financialEntries: (typeof dailyFinancialSummary.$inferInsert)[] = [];

  for (const d of dates) {
    const dStr = formatDate(d);
    const day = d.getUTCDay();
    const weekendFactor = day === 0 || day === 6 ? 0.85 : 1.0;
    const baseCombined = Math.round(3200 * weekendFactor * (0.9 + Math.random() * 0.2));

    // Commission: Petrol ₹3.2/L, HSD ₹2.8/L => avg ~₹3.0/L
    // Monthly opex ₹115k, daily opex ~₹3,833
    // Debt interest ₹22,500/month = ₹750/day
    // Daily revenue = 3200 * 3.0 = ₹9,600 commission
    // Daily costs = ₹3,833 + ₹750 = ₹4,583
    // Expected daily profit ~₹5,000

    const expectedDaily = Math.round(baseCombined * 3.0 - 4583);
    const expectedMonthly = Math.round(expectedDaily * 30);
    const pLoss = Math.max(0.01, Math.min(0.4, 0.08 + Math.random() * 0.1 - 0.05));
    const var5 = Math.round(Math.abs(expectedDaily) * 0.4 * (0.8 + Math.random() * 0.4));
    const stockoutRisk = Math.min(0.45, 0.08 + Math.random() * 0.15);

    financialEntries.push(
      {
        forecastDate: dStr,
        fuelType: "combined",
        expectedDailyProfit: String(expectedDaily),
        expectedMonthlyProfit: String(expectedMonthly),
        pLoss: String(pLoss.toFixed(4)),
        var5: String(-var5),
        cvar5: String(-Math.round(var5 * 1.3)),
        stockoutRiskScore: String(stockoutRisk.toFixed(2)),
        daysToMinStock: String((3 + Math.random() * 4).toFixed(1)),
      },
      {
        forecastDate: dStr,
        fuelType: "Petrol",
        expectedDailyProfit: String(Math.round(expectedDaily * 0.56)),
        expectedMonthlyProfit: String(Math.round(expectedMonthly * 0.56)),
        pLoss: String(Math.max(0.01, pLoss - 0.02).toFixed(4)),
        var5: String(-Math.round(var5 * 0.56)),
        cvar5: String(-Math.round(var5 * 1.3 * 0.56)),
        stockoutRiskScore: String(Math.min(0.45, stockoutRisk * 0.9).toFixed(2)),
        daysToMinStock: String((5 + Math.random() * 3).toFixed(1)),
      },
      {
        forecastDate: dStr,
        fuelType: "High-Speed Diesel",
        expectedDailyProfit: String(Math.round(expectedDaily * 0.44)),
        expectedMonthlyProfit: String(Math.round(expectedMonthly * 0.44)),
        pLoss: String(Math.min(0.4, pLoss + 0.02).toFixed(4)),
        var5: String(-Math.round(var5 * 0.44)),
        cvar5: String(-Math.round(var5 * 1.3 * 0.44)),
        stockoutRiskScore: String(Math.min(0.45, stockoutRisk * 1.1).toFixed(2)),
        daysToMinStock: String((2 + Math.random() * 3).toFixed(1)),
      },
    );
  }

  console.log(`  Inserting ${financialEntries.length} financial summary rows...`);
  for (const entry of financialEntries) {
    await db.insert(dailyFinancialSummary).values(entry).onConflictDoNothing();
  }
  console.log(`  ✓ daily_financial_summary seeded`);

  // ── Seed daily_order_recommendation ──
  const orderEntries: (typeof dailyOrderRecommendation.$inferInsert)[] = [];

  for (const d of dates) {
    const dStr = formatDate(d);
    const isRecent = dates.indexOf(d) >= dates.length - 2;

    // Conservative: order more, lower stockout risk
    orderEntries.push(
      {
        forecastDate: dStr,
        policy: "conservative",
        fuelType: "combined",
        reorderPoint: "12000",
        recommendedOrder: isRecent ? "15000" : "0",
        orderQuantity: "15000",
        expectedCost: String(Math.round(15000 * 94.5 + 500)),
        pStockout: "0.0350",
      },
      // Balanced: moderate order
      {
        forecastDate: dStr,
        policy: "balanced",
        fuelType: "combined",
        reorderPoint: "10000",
        recommendedOrder: isRecent ? "12000" : "0",
        orderQuantity: "12000",
        expectedCost: String(Math.round(12000 * 94.5 + 500)),
        pStockout: isRecent ? "0.0850" : "0.1200",
      },
      // Aggressive: minimal order, higher stockout risk
      {
        forecastDate: dStr,
        policy: "aggressive",
        fuelType: "combined",
        reorderPoint: "8000",
        recommendedOrder: isRecent ? "8000" : "0",
        orderQuantity: "8000",
        expectedCost: String(Math.round(8000 * 94.5 + 500)),
        pStockout: isRecent ? "0.1800" : "0.2500",
      },
      // Per-fuel-type recommendations
      {
        forecastDate: dStr,
        policy: "balanced",
        fuelType: "Petrol",
        reorderPoint: "5500",
        recommendedOrder: isRecent ? "6000" : "0",
        orderQuantity: "6000",
        expectedCost: String(Math.round(6000 * 94.5 + 500)),
        pStockout: isRecent ? "0.0750" : "0.1000",
      },
      {
        forecastDate: dStr,
        policy: "balanced",
        fuelType: "High-Speed Diesel",
        reorderPoint: "4500",
        recommendedOrder: isRecent ? "5000" : "0",
        orderQuantity: "5000",
        expectedCost: String(Math.round(5000 * 87.5 + 500)),
        pStockout: isRecent ? "0.0950" : "0.1300",
      },
    );
  }

  console.log(`  Inserting ${orderEntries.length} order recommendation rows...`);
  for (const entry of orderEntries) {
    await db.insert(dailyOrderRecommendation).values(entry).onConflictDoNothing();
  }
  console.log(`  ✓ daily_order_recommendation seeded`);

  console.log("\n✅ Seeding complete! The dashboard should now show live data.");
  console.log(`   Latest data date: ${todayStr}`);
  console.log("   Visit /dashboard to see the results.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
