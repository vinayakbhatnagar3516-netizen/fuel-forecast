/** Shared types for the fuel forecast API */

export type MetricCard = {
  value: string;
  unit: string;
  description: string;
  trend: "up" | "down" | "stable" | "neutral";
};

export type Alert = {
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
};

export type FuelTypeOption = {
  value: string;
  label: string;
  active: boolean;
};

/** A single day's P&L data point for the chart */
export type PnLHistoryPoint = {
  date: string;            // "15 Jun"
  dateFull: string;        // "2026-06-15"
  dailyProfit: number;
  commission: number;
  nonFuel: number;
  opex: number;
  cumulative: number;      // running total
};

export type PolicyRecommendation = {
  recommendedOrder: string;
  reorderPoint: string;
  pStockout: string;
  orderQuantity: string;
  expectedCost: string;
  safetyBuffer: string;
};

export type OrderRecommendationData = {
  defaultPolicy: "conservative" | "balanced" | "aggressive";
  perLiterPrice: string;
  totalCost: string;
  policies: {
    conservative: PolicyRecommendation | null;
    balanced: PolicyRecommendation | null;
    aggressive: PolicyRecommendation | null;
  };
};

export type DecisionData = {
  decision: {
    action: "BUY" | "SELL" | "HOLD" | "NO_DATA";
    headline: string;
    sub: string;
  };
  metrics: {
    expectedDemand: MetricCard;
    stockoutRisk: MetricCard;
    forecastConfidence: MetricCard;
  };
  pnl: {
    expectedDailyProfit: MetricCard;
    expectedMonthlyProfit: MetricCard;
    pLoss: MetricCard;
    var5: MetricCard;
  };
  pnlHistory: PnLHistoryPoint[];
  alerts: Alert[];
  fuelTypes: FuelTypeOption[];
  lastUpdated: string | null;
  orderRecommendation: OrderRecommendationData;
};
