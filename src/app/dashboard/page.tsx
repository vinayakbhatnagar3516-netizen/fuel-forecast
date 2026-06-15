"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DecisionData, MetricCard } from "@/lib/api-types";

/* ─── Loader ─── */
function MetricSkeleton() {
  return (
    <Card className="border-border rounded-sm shadow-none">
      <CardHeader className="pb-2">
        <Skeleton className="h-3 w-24 bg-muted" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-20 bg-muted mb-2" />
        <Skeleton className="h-3 w-36 bg-muted" />
      </CardContent>
    </Card>
  );
}

function BannerSkeleton() {
  return (
    <div className="decision-banner bg-[#F0F7F4] border-l-sage">
      <Skeleton className="h-5 w-72 bg-muted mb-2" />
      <Skeleton className="h-4 w-56 bg-muted" />
    </div>
  );
}

/* ─── Ornament ─── */
function KolamOrnament() {
  return (
    <div className="kolam-ornament flex items-center justify-center gap-1">
      <svg width="48" height="12" viewBox="0 0 48 12" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
        <circle cx="20" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
        <circle cx="32" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ─── Metric card ─── */
function MetricCardView({ data, label }: { data: MetricCard; label: string }) {
  const trendColor =
    data.trend === "up" && (label.includes("profit") || label.includes("Confidence"))
      ? "text-green-600"
      : data.trend === "up"
        ? "text-burgundy"
        : data.trend === "down" && (label.includes("risk") || label.includes("loss") || label.includes("VaR"))
          ? "text-green-600"
          : "text-[#1A1F2E]";

  return (
    <Card className="border-border rounded-sm shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-medium tracking-tight ${trendColor}`}>
          {data.value !== "—" ? `${data.unit === "%" ? "" : data.unit === "₹" ? "₹" : ""}${data.value}${data.unit === "%" ? "%" : data.unit === "L" ? " L" : ""}` : "—"}
        </p>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          {data.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

/* ─── Main component ─── */
export default function DashboardHome() {
  const [data, setData] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/decision", { signal: controller.signal })
      .then((r) => r.json() as Promise<DecisionData>)
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Failed to fetch decision data:", err);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-3">
            Today
          </h1>
          <KolamOrnament />
          <p className="mt-2 text-sm text-muted-foreground">Loading your decision screen…</p>
        </div>
        <BannerSkeleton />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </div>
      </div>
    );
  }

  /* ── No data ── */
  if (!data || data.decision.action === "NO_DATA") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-3">
            Today
          </h1>
          <KolamOrnament />
          <p className="mt-2 text-sm text-muted-foreground">
            What you need to do, in one screen.
          </p>
        </div>

        <div className="decision-banner bg-[#F0F7F4] border-l-sage">
          <p className="headline font-heading text-lg font-semibold text-[#1A1F2E] relative">
            Good morning — no forecast data yet
          </p>
          <p className="sub text-sm text-muted-foreground relative mt-1">
            Run the forecast pipeline to see your order recommendation.{" "}
            <span className="text-[#C47335] font-medium">Go to Diagnostics</span> to get started.
          </p>
        </div>

        {/* Three empty metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Expected demand", desc: "What we predict you'll sell today. Run a forecast to see data." },
            { label: "Stockout risk", desc: "Chance of running out before the next delivery. Lower is safer." },
            { label: "Forecast confidence", desc: "How reliable the model thinks this forecast is. Based on prediction interval width." },
          ].map((m) => (
            <Card key={m.label} className="border-border rounded-sm shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {m.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-medium text-[#1A1F2E] tracking-tight">—</p>
                <CardDescription className="text-xs text-muted-foreground mt-1">{m.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty P&L */}
        <div>
          <h2 className="font-heading text-base font-semibold text-[#2C3E50] mt-8 mb-4">
            Profit &amp; Loss
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Expected daily profit", desc: "What you'll likely earn each day after costs." },
              { label: "Expected monthly profit", desc: "Projected earnings over 30 days." },
              { label: "Chance of loss", desc: "Probability that a day's profit is negative." },
              { label: "Worst case (5%)", desc: "On your worst 5% of days, you'll lose at least this much." },
            ].map((m) => (
              <Card key={m.label} className="border-border rounded-sm shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {m.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-medium text-[#1A1F2E] tracking-tight">—</p>
                  <CardDescription className="text-xs text-muted-foreground mt-1">{m.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Seasonal alert placeholder */}
        <div className="decision-banner bg-[#F5F7FA] border-l-slate">
          <p className="headline font-heading text-base font-semibold text-[#1A1F2E] relative">
            What's coming
          </p>
          <p className="sub text-sm text-muted-foreground relative mt-1">
            No seasonal alerts yet. They'll appear here when a season change or weather event is imminent.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-xs text-muted-foreground italic">
            This is the pilot dashboard shell. Real data will appear here once connected to the forecast
            engine. Go to <span className="text-[#C47335] font-medium">Diagnostics</span> to generate
            your first forecast.
          </p>
        </div>
      </div>
    );
  }

  /* ── Real data view ── */
  const { decision, metrics, pnl, alerts } = data;

  const decisionBgColor =
    decision.action === "BUY"
      ? "bg-[#F0F7F4] border-l-sage"
      : decision.action === "HOLD"
        ? "bg-[#FFF8E7] border-l-[#DAA520]"
        : "bg-[#F0F7F4] border-l-sage";

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-3">
          Today
        </h1>
        <KolamOrnament />
        <p className="mt-2 text-sm text-muted-foreground">
          What you need to do, in one screen.
        </p>
      </div>

      {/* Decision banner */}
      <div className={`decision-banner ${decisionBgColor}`}>
        <p className="headline font-heading text-lg font-semibold text-[#1A1F2E] relative">
          {decision.headline}
        </p>
        <p className="sub text-sm text-muted-foreground relative mt-1">
          {decision.sub}
        </p>
      </div>

      {/* Three key metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCardView data={metrics.expectedDemand} label="Expected demand" />
        <MetricCardView data={metrics.stockoutRisk} label="Stockout risk" />
        <MetricCardView data={metrics.forecastConfidence} label="Forecast confidence" />
      </div>

      {/* P&L snapshot */}
      <div>
        <h2 className="font-heading text-base font-semibold text-[#2C3E50] mt-8 mb-4">
          Profit &amp; Loss
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCardView data={pnl.expectedDailyProfit} label="Expected daily profit" />
          <MetricCardView data={pnl.expectedMonthlyProfit} label="Expected monthly profit" />
          <MetricCardView data={pnl.pLoss} label="Chance of loss" />
          <MetricCardView data={pnl.var5} label="Worst case (5%)" />
        </div>
      </div>

      {/* Seasonal alerts */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const bgColor =
            alert.severity === "warning"
              ? "bg-[#FFF8E7] border-l-[#DAA520]"
              : alert.severity === "critical"
                ? "bg-[#FFF0F0] border-l-burgundy"
                : "bg-[#F5F7FA] border-l-slate";
          return (
            <div key={alert.title} className={`decision-banner ${bgColor}`}>
              <p className="headline font-heading text-base font-semibold text-[#1A1F2E] relative">
                {alert.title}
              </p>
              <p className="sub text-sm text-muted-foreground relative mt-1">
                {alert.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
