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
  alerts: Alert[];
  fuelTypes: FuelTypeOption[];
  lastUpdated: string | null;
};
