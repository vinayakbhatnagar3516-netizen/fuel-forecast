import { NextResponse } from "next/server";
import { db } from "@/db";
import { dailyForecastQuantiles, dailyFinancialSummary, dailyOrderRecommendation } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import type { DecisionData, MetricCard, Alert, FuelTypeOption, PnLHistoryPoint } from "@/lib/api-types";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(request: Request) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const fuelType = searchParams.get("fuelType") || "combined";

    // Validate fuel type
    const validFuelTypes = ["combined", "Petrol", "High-Speed Diesel"];
    const ft = validFuelTypes.includes(fuelType) ? fuelType : "combined";

    // Get the latest forecast date from the database
    const latestDateResult = await db
      .select({ maxDate: sql<string>`MAX(forecast_date)` })
      .from(dailyForecastQuantiles);

    const latestDate = latestDateResult[0]?.maxDate;

    if (!latestDate) {
      return NextResponse.json(emptyState());
    }

    // Fetch quantile forecast
    const forecast = await db
      .select()
      .from(dailyForecastQuantiles)
      .where(
        and(
          eq(dailyForecastQuantiles.forecastDate, latestDate),
          eq(dailyForecastQuantiles.fuelType, ft),
        ),
      )
      .limit(1);

    if (forecast.length === 0) {
      return NextResponse.json(emptyState());
    }

    const f = forecast[0];

    // Fetch financial summary
    const financial = await db
      .select()
      .from(dailyFinancialSummary)
      .where(
        and(
          eq(dailyFinancialSummary.forecastDate, latestDate),
          eq(dailyFinancialSummary.fuelType, ft),
        ),
      )
      .limit(1);

    // Fetch order recommendations (all 3 policies)
    const orders = await db
      .select()
      .from(dailyOrderRecommendation)
      .where(
        and(
          eq(dailyOrderRecommendation.forecastDate, latestDate),
          eq(dailyOrderRecommendation.fuelType, ft),
        ),
      )
      .orderBy(dailyOrderRecommendation.policy);

    // Compute forecast confidence (narrower PI = more confident)
    const q95 = parseFloat(f.q95 ?? "0");
    const q05 = parseFloat(f.q05 ?? "0");
    const forecastPoint = parseFloat(f.forecastPoint ?? f.q50 ?? "0");
    const piWidth = q95 - q05;
    const confidence = piWidth > 0
      ? Math.round(Math.max(0, Math.min(100, 100 - (piWidth / forecastPoint) * 50)))
      : 50;

    // Determine action from balanced policy
    const balancedOrder = orders.find((o) => o.policy === "balanced");
    const conservativeOrder = orders.find((o) => o.policy === "conservative");

    let action: DecisionData["decision"]["action"] = "HOLD";
    let headline = "No urgent action needed";
    let sub = "Check back after the next forecast run.";

    if (balancedOrder) {
      const recQty = parseFloat(balancedOrder.recommendedOrder ?? "0");
      const pStockout = parseFloat(balancedOrder.pStockout ?? "0");

      if (recQty > 0) {
        action = "BUY";
        headline = `Order ${recQty.toLocaleString("en-IN")}L — balanced policy`;
        const conservativeQty = conservativeOrder
          ? parseFloat(conservativeOrder.recommendedOrder ?? "0")
          : 0;
        sub = `Conservative recommends ${conservativeQty.toLocaleString("en-IN")}L. Stockout risk: ${(pStockout * 100).toFixed(1)}%.`;
      } else if (pStockout > 0.3) {
        action = "HOLD";
        headline = "Monitor closely — stockout risk elevated";
        sub = `Balanced policy shows ${(pStockout * 100).toFixed(0)}% stockout probability. Consider an early order.`;
      }
    }

    // Build fuel type options
    const fuelTypeOptions: FuelTypeOption[] = [
      { value: "combined", label: "Combined", active: true },
      { value: "Petrol", label: "Petrol", active: true },
      { value: "High-Speed Diesel", label: "High-Speed Diesel", active: true },
    ];

    // Build seasonal alerts
    const currentMonth = new Date().getMonth();
    const alerts: Alert[] = [];
    if (currentMonth >= 6 && currentMonth <= 8) {
      alerts.push({
        title: "Monsoon period active",
        description: "Stockout costs are 1.3× normal. Maintain higher safety stock.",
        severity: "warning",
      });
    } else if (currentMonth >= 2 && currentMonth <= 5) {
      alerts.push({
        title: "Summer peak season",
        description: "Demand expected 1.2× normal. Stockout costs are 1.5× normal.",
        severity: "info",
      });
    } else {
      alerts.push({
        title: "Normal season",
        description: "Standard demand and cost multipliers apply.",
        severity: "info",
      });
    }

    const fin = financial[0];
    const pnl: DecisionData["pnl"] = {
      expectedDailyProfit: {
        value: fin?.expectedDailyProfit
          ? formatInr(parseFloat(fin.expectedDailyProfit))
          : "—",
        unit: "₹",
        description: "What you'll likely earn each day after costs.",
        trend: "neutral",
      },
      expectedMonthlyProfit: {
        value: fin?.expectedMonthlyProfit
          ? formatInr(parseFloat(fin.expectedMonthlyProfit))
          : "—",
        unit: "₹",
        description: "Projected earnings over 30 days.",
        trend: "neutral",
      },
      pLoss: {
        value: fin?.pLoss
          ? `${(parseFloat(fin.pLoss) * 100).toFixed(1)}`
          : "—",
        unit: "%",
        description: "Probability that a day's profit is negative.",
        trend: parseFloat(fin?.pLoss ?? "0") > 0.15 ? "up" : "stable",
      },
      var5: {
        value: fin?.var5
          ? formatInr(Math.abs(parseFloat(fin.var5)))
          : "—",
        unit: "₹",
        description: "On your worst 5% of days, you'll lose at least this much.",
        trend: "down",
      },
    };

    const metrics: DecisionData["metrics"] = {
      expectedDemand: {
        value: forecastPoint.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
        unit: "L",
        description: "What we predict you'll sell today.",
        trend: "stable",
      },
      stockoutRisk: {
        value: balancedOrder
          ? `${(parseFloat(balancedOrder.pStockout ?? "0") * 100).toFixed(1)}`
          : "—",
        unit: "%",
        description: "Chance of running out before the next delivery.",
        trend:
          parseFloat(balancedOrder?.pStockout ?? "0") > 0.2
            ? "up"
            : parseFloat(balancedOrder?.pStockout ?? "0") < 0.1
              ? "down"
              : "stable",
      },
      forecastConfidence: {
        value: `${confidence}`,
        unit: "%",
        description: "How reliable the model thinks this forecast is. Based on prediction interval width.",
        trend: confidence > 70 ? "stable" : "down",
      },
    };

    // Fetch 7-day P&L history for the chart
    const historyRows = await db
      .select({
        forecastDate: dailyFinancialSummary.forecastDate,
        expectedDailyProfit: dailyFinancialSummary.expectedDailyProfit,
        expectedMonthlyProfit: dailyFinancialSummary.expectedMonthlyProfit,
      })
      .from(dailyFinancialSummary)
      .where(
        and(
          eq(dailyFinancialSummary.fuelType, ft),
        ),
      )
      .orderBy(desc(dailyFinancialSummary.forecastDate))
      .limit(7);

    const pnlHistory: PnLHistoryPoint[] = [];
    let cumulative = 0;
    for (let i = historyRows.length - 1; i >= 0; i--) {
      const row = historyRows[i];
      const profit = parseFloat(row.expectedDailyProfit ?? "0");
      cumulative += profit;
      // Estimate components from profit (proxy: commission ≈ profit × 1.26, opex ≈ profit × 0.24)
      const commission = Math.round(profit * 1.26);
      const opex = Math.round(profit * 0.24);
      const nonFuel = Math.round(profit * 0.11);
      pnlHistory.push({
        date: dateLabel(row.forecastDate),
        dateFull: row.forecastDate,
        dailyProfit: profit,
        commission,
        nonFuel,
        opex,
        cumulative,
      });
    }

    // Build order recommendation data for all 3 policies
    const defaultPolicy = "balanced";
    const perLiterPrice = 94.50; // TODO: fetch from cost matrix
    const orderRec = buildOrderRecommendation(orders, forecastPoint, perLiterPrice);

    return NextResponse.json({
      decision: { action, headline, sub },
      metrics,
      pnl,
      pnlHistory,
      alerts,
      fuelTypes: fuelTypeOptions,
      lastUpdated: f.createdAt?.toISOString() ?? null,
      orderRecommendation: orderRec,
    });
  } catch (error) {
    console.error("Decision API error:", error);
    // Return 500 with empty state rather than 200 with empty state —
    // the client can distinguish "no data" from "server error"
    return NextResponse.json(
      { ...emptyState(), _error: "Failed to load decision data" },
      { status: 500 },
    );
  }
}

/** Build order recommendation for all 3 policies from DB rows. */
function buildOrderRecommendation(
  orders: typeof dailyOrderRecommendation.$inferSelect[],
  forecastPoint: number,
  perLiterPrice: number,
): DecisionData["orderRecommendation"] {
  const policies: DecisionData["orderRecommendation"]["policies"] = {
    conservative: null,
    balanced: null,
    aggressive: null,
  };

  for (const order of orders) {
    const policy = order.policy as "conservative" | "balanced" | "aggressive";
    const reorderPt = parseFloat(order.reorderPoint ?? "0");
    const recQty = parseFloat(order.recommendedOrder ?? "0");
    const pStockout = parseFloat(order.pStockout ?? "0");
    const orderQty = parseFloat(order.orderQuantity ?? "0");
    const expCost = parseFloat(order.expectedCost ?? "0");
    const safetyBuffer = Math.max(0, reorderPt - forecastPoint);

    policies[policy] = {
      recommendedOrder: recQty.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      reorderPoint: reorderPt.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      pStockout: (pStockout * 100).toFixed(1),
      orderQuantity: orderQty.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      expectedCost: expCost.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      safetyBuffer: safetyBuffer.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
    };
  }

  const bal = policies.balanced;
  const totalCost = bal
    ? (parseFloat(bal.recommendedOrder.replace(/,/g, "")) * perLiterPrice)
        .toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : "—";

  return {
    defaultPolicy: "balanced",
    perLiterPrice: perLiterPrice.toFixed(2),
    totalCost,
    policies,
  };
}

function emptyState(): DecisionData {
  return {
    decision: {
      action: "NO_DATA",
      headline: "Good morning — no forecast data yet",
      sub: "Run the forecast pipeline to see your order recommendation.",
    },
    metrics: {
      expectedDemand: {
        value: "—",
        unit: "L",
        description: "What we predict you'll sell today. Run a forecast to see data.",
        trend: "neutral",
      },
      stockoutRisk: {
        value: "—",
        unit: "%",
        description: "Chance of running out before the next delivery. Lower is safer.",
        trend: "neutral",
      },
      forecastConfidence: {
        value: "—",
        unit: "%",
        description: "How reliable the model thinks this forecast is. Based on prediction interval width.",
        trend: "neutral",
      },
    },
    pnl: {
      expectedDailyProfit: {
        value: "—",
        unit: "₹",
        description: "What you'll likely earn each day after costs.",
        trend: "neutral",
      },
      expectedMonthlyProfit: {
        value: "—",
        unit: "₹",
        description: "Projected earnings over 30 days.",
        trend: "neutral",
      },
      pLoss: {
        value: "—",
        unit: "%",
        description: "Probability that a day's profit is negative.",
        trend: "neutral",
      },
      var5: {
        value: "—",
        unit: "₹",
        description: "On your worst 5% of days, you'll lose at least this much.",
        trend: "neutral",
      },
    },
    alerts: [
      {
        title: "No forecast data",
        description: "Generate your first forecast to see seasonal alerts.",
        severity: "info",
      },
    ],
    fuelTypes: [
      { value: "combined", label: "Combined", active: true },
      { value: "Petrol", label: "Petrol", active: false },
      { value: "High-Speed Diesel", label: "High-Speed Diesel", active: false },
    ],
    lastUpdated: null,
    pnlHistory: [],
    orderRecommendation: {
      defaultPolicy: "balanced",
      perLiterPrice: "—",
      totalCost: "—",
      policies: { conservative: null, balanced: null, aggressive: null },
    },
  };
}

function formatInr(value: number): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** Format YYYY-MM-DD to "15 Jun" style label. */
function dateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
