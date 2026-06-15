"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { DecisionData, MetricCard } from "@/lib/api-types";

/* ─── Constants ─── */
const FUEL_TABS = [
  { value: "combined", label: "Combined" },
  { value: "Petrol", label: "Petrol" },
  { value: "High-Speed Diesel", label: "HSD" },
] as const;

/* ─── Helpers ─── */
function todayDisplay(): string {
  const d = new Date();
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/* ─── Loader Skeleton ─── */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-24 bg-muted mb-2" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </div>
        <Skeleton className="h-8 w-48 bg-muted rounded-full" />
      </div>
      <Skeleton className="h-28 w-full bg-muted rounded-sm" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border rounded-sm shadow-none">
            <CardHeader className="pb-2"><Skeleton className="h-3 w-20 bg-muted" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-24 bg-muted mb-2" /><Skeleton className="h-3 w-36 bg-muted" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border rounded-sm shadow-none">
            <CardHeader className="pb-2"><Skeleton className="h-3 w-20 bg-muted" /></CardHeader>
            <CardContent><Skeleton className="h-7 w-20 bg-muted mb-2" /><Skeleton className="h-3 w-28 bg-muted" /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Kolam Ornament ─── */
function KolamOrnament() {
  return (
    <div className="kolam-ornament flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <svg key={i} width="32" height="8" viewBox="0 0 32 8" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="4" r="1.2" fill="#C47335" opacity={0.3 + i * 0.1} />
          <circle cx="16" cy="4" r="1.2" fill="#C47335" opacity={0.3 + i * 0.1} />
          <circle cx="26" cy="4" r="1.2" fill="#C47335" opacity={0.3 + i * 0.1} />
        </svg>
      ))}
    </div>
  );
}

/* ─── Fuel Type Tab ─── */
function FuelTab({ value, label, active, onClick }: {
  value: string; label: string; active: boolean; onClick: (v: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
        active
          ? "bg-[#C47335] text-white shadow-sm"
          : "bg-white text-muted-foreground border border-border hover:border-[#C47335]/40 hover:text-[#C47335]"
      }`}
    >
      {label}
    </button>
  );
}

/* ─── Metric Card ─── */
function MetricCardView({ data, label, accent }: { data: MetricCard; label: string; accent?: "green" | "amber" | "red" | "neutral" }) {
  const displayValue = data.value !== "—"
    ? `${data.unit === "₹" ? "₹" : ""}${data.value}${data.unit === "%" ? "%" : data.unit === "L" ? " L" : data.unit === "₹" ? "" : ""}`
    : "—";

  const valueColor = !accent || accent === "neutral" || data.value === "—"
    ? "text-[#1A1F2E]"
    : accent === "green"
      ? "text-green-700"
      : accent === "red"
        ? "text-red-600"
        : "text-amber-600";

  return (
    <Card className="border-border rounded-sm shadow-none hover:shadow-sm transition-shadow duration-200">
      <CardHeader className="pb-1.5">
        <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-semibold tracking-tight ${valueColor}`}>
          {displayValue}
        </p>
        <CardDescription className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
          {data.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

/* ─── Action Badge ─── */
function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    BUY: { bg: "bg-green-100", text: "text-green-800", label: "Order recommended" },
    SELL: { bg: "bg-red-100", text: "text-red-800", label: "Reduce inventory" },
    HOLD: { bg: "bg-amber-100", text: "text-amber-800", label: "No action needed" },
    NO_DATA: { bg: "bg-slate-100", text: "text-slate-500", label: "No data" },
  };
  const s = styles[action] ?? styles.NO_DATA;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${action === "BUY" ? "bg-green-500" : action === "HOLD" ? "bg-amber-500" : "bg-slate-400"}`} />
      {s.label}
    </span>
  );
}

/* ─── Decision Banner ─── */
function DecisionBanner({ decision }: { decision: DecisionData["decision"] }) {
  const borderColor =
    decision.action === "BUY" ? "border-l-green-600" :
    decision.action === "HOLD" ? "border-l-amber-500" :
    "border-l-slate";

  const bgColor =
    decision.action === "BUY" ? "bg-green-50" :
    decision.action === "HOLD" ? "bg-amber-50" :
    "bg-[#F5F7FA]";

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} rounded-sm p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <ActionBadge action={decision.action} />
          </div>
          <p className="font-heading text-base font-semibold text-[#1A1F2E] leading-snug mt-2">
            {decision.headline}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {decision.sub}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── P&L Card ─── */
function PnLCard({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: "green" | "amber" | "red" | "neutral" }) {
  const displayValue = value !== "—"
    ? `${unit === "₹" ? "₹" : ""}${value}${unit === "%" ? "%" : ""}`
    : "—";

  const color = !accent || accent === "neutral" || value === "—"
    ? "text-[#1A1F2E]"
    : accent === "green"
      ? "text-green-700"
      : accent === "amber"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <Card className="border-border rounded-sm shadow-none">
      <CardHeader className="pb-1.5">
        <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-xl font-semibold tracking-tight ${color}`}>{displayValue}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Seasonal Alert ─── */
function AlertCard({ alert }: { alert: DecisionData["alerts"][number] }) {
  const borderColor = alert.severity === "warning" ? "border-l-amber-500" : "border-l-slate";
  const bgColor = alert.severity === "warning" ? "bg-amber-50" : "bg-[#F5F7FA]";
  const iconColor = alert.severity === "warning" ? "text-amber-600" : "text-slate-500";

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} rounded-sm p-4`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColor}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {alert.severity === "warning" ? (
              <>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </>
            ) : (
              <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>
            )}
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1A1F2E]">{alert.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════════════ */
export default function DashboardHome() {
  const [data, setData] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFuelType, setActiveFuelType] = useState<string>("combined");

  const fetchData = useCallback(async (fuelType: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/decision?fuelType=${encodeURIComponent(fuelType)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DecisionData = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch decision data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeFuelType);
  }, [activeFuelType, fetchData]);

  /* ── Loading (no cached data) ── */
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-1">
              Today
            </h1>
            <p className="text-sm text-muted-foreground">{todayDisplay()}</p>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  /* ── No Data ── */
  if (!data || data.decision.action === "NO_DATA") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-1">
            Today
          </h1>
          <KolamOrnament />
          <p className="mt-2 text-sm text-muted-foreground">{todayDisplay()}</p>
        </div>

        <div className="bg-[#F5F7FA] border-l-4 border-l-slate rounded-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
            </div>
            <div>
              <p className="font-heading text-base font-semibold text-[#1A1F2E]">No forecast data yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Run the forecast pipeline to see your order recommendation.
              </p>
              <Button className="mt-3 bg-[#C47335] hover:bg-[#A85F2A] text-white rounded-sm text-xs h-8">
                Generate forecast
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Expected demand", desc: "What we predict you'll sell today." },
            { label: "Stockout risk", desc: "Chance of running out before the next delivery." },
            { label: "Forecast confidence", desc: "How reliable the model thinks this forecast is." },
          ].map((m) => (
            <Card key={m.label} className="border-border rounded-sm shadow-none">
              <CardHeader className="pb-1.5">
                <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-[#1A1F2E] tracking-tight">—</p>
                <CardDescription className="text-[11px] text-muted-foreground mt-1.5">{m.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold text-[#2C3E50] mt-6 mb-3">Profit &amp; Loss</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {["Expected daily profit", "Expected monthly profit", "Chance of loss", "Worst case (5%)"].map((l) => (
              <Card key={l} className="border-border rounded-sm shadow-none">
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{l}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold text-[#1A1F2E] tracking-tight">—</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic pt-2">
          Go to <span className="text-[#C47335] font-medium">Settings</span> to configure your pump financials.
        </p>
      </div>
    );
  }

  /* ── Real Data View ── */
  const { decision, metrics, pnl, alerts, lastUpdated } = data;

  const handleFuelTypeChange = useCallback((value: string) => {
    setActiveFuelType(value);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with fuel type tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-1">
            Today
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{todayDisplay()}</p>
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground/60">
                · Updated {formatTime(lastUpdated)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-full p-1 border border-border self-start">
          {FUEL_TABS.map((tab) => (
            <FuelTab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              active={activeFuelType === tab.value}
              onClick={handleFuelTypeChange}
            />
          ))}
        </div>
      </div>

      <KolamOrnament />

      {/* Loading overlay for fuel type switch */}
      <div className={`transition-opacity duration-200 ${loading ? "opacity-50" : "opacity-100"}`}>
        {/* Decision banner */}
        <DecisionBanner decision={decision} />

        {/* Three key metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-6">
          <MetricCardView data={metrics.expectedDemand} label="Expected demand" accent="neutral" />
          <MetricCardView
            data={metrics.stockoutRisk}
            label="Stockout risk"
            accent={
              metrics.stockoutRisk.value === "—" ? "neutral" :
              parseFloat(metrics.stockoutRisk.value) > 20 ? "red" :
              parseFloat(metrics.stockoutRisk.value) > 10 ? "amber" : "green"
            }
          />
          <MetricCardView
            data={metrics.forecastConfidence}
            label="Forecast confidence"
            accent={
              metrics.forecastConfidence.value === "—" ? "neutral" :
              parseFloat(metrics.forecastConfidence.value) > 70 ? "green" :
              parseFloat(metrics.forecastConfidence.value) > 50 ? "amber" : "red"
            }
          />
        </div>

        {/* P&L Snapshot */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-heading text-sm font-semibold text-[#2C3E50]">Profit &amp; Loss</h2>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <PnLCard
              label="Expected daily profit"
              value={pnl.expectedDailyProfit.value}
              unit={pnl.expectedDailyProfit.unit}
              accent={pnl.expectedDailyProfit.value !== "—" && parseInt(pnl.expectedDailyProfit.value) > 0 ? "green" : "red"}
            />
            <PnLCard
              label="Expected monthly profit"
              value={pnl.expectedMonthlyProfit.value}
              unit={pnl.expectedMonthlyProfit.unit}
              accent="green"
            />
            <PnLCard
              label="Chance of loss"
              value={pnl.pLoss.value}
              unit={pnl.pLoss.unit}
              accent={
                pnl.pLoss.value === "—" ? "neutral" :
                parseFloat(pnl.pLoss.value) > 20 ? "red" :
                parseFloat(pnl.pLoss.value) > 10 ? "amber" : "green"
              }
            />
            <PnLCard
              label="Worst case (5% VaR)"
              value={pnl.var5.value}
              unit={pnl.var5.unit}
              accent="red"
            />
          </div>
        </div>

        {/* Seasonal Alerts */}
        <div className="mt-8 space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-heading text-sm font-semibold text-[#2C3E50]">What&apos;s coming</h2>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          {alerts.map((alert) => (
            <AlertCard key={alert.title} alert={alert} />
          ))}
        </div>
      </div>
    </div>
  );
}
