"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DecisionData } from "@/lib/api-types";

/* ─── Constants ─── */
const FUEL_TABS = [
  { value: "combined", label: "Combined" },
  { value: "Petrol", label: "Petrol" },
  { value: "High-Speed Diesel", label: "HSD" },
] as const;

/* ─── Helpers ─── */
function todayDisplay(): string {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatTime(iso: string | null): string {
  if (!iso) return "";
  try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

/* ─── Skeleton ─── */
function DashboardSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="h-32 bg-muted rounded-md" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="design-card shadow-none">
            <CardHeader className="pb-2"><Skeleton className="h-3 w-20 bg-muted" /></CardHeader>
            <CardContent><Skeleton className="h-12 w-28 bg-muted mb-2" /><Skeleton className="h-3 w-36 bg-muted" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="design-card shadow-none">
            <CardHeader className="pb-2"><Skeleton className="h-3 w-20 bg-muted" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-20 bg-muted mb-2" /><Skeleton className="h-3 w-28 bg-muted" /></CardContent>
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

/* ─── Fuel Tabs ─── */
function FuelTab({ value, label, active, onClick }: { value: string; label: string; active: boolean; onClick: (v: string) => void }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-1.5 text-[13px] font-medium transition-all duration-200
        ${active ? "fuel-tab-active" : "fuel-tab-inactive"}`}
    >
      {label}
    </button>
  );
}
function FuelTabsBar({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-50/60 rounded-full p-1 border border-hairline">
      {FUEL_TABS.map((tab) => (
        <FuelTab key={tab.value} value={tab.value} label={tab.label} active={active === tab.value} onClick={onChange} />
      ))}
    </div>
  );
}

/* ─── Action Badge ─── */
function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    BUY: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", dot: "bg-sage", label: "PLACE ORDER" },
    HOLD:  { bg: "bg-[#FFF8E1]", text: "text-[#946C00]", dot: "bg-amber", label: "HOLD" },
    SELL: { bg: "bg-[#FFEBEE]", text: "text-[#8B3A3A]", dot: "bg-burgundy", label: "REDUCE" },
    NO_DATA: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400", label: "NO DATA" },
  };
  const s = styles[action] ?? styles.NO_DATA;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}

/* ─── Stat Metric Card ─── */
function StatCard({ value, unit, label, description, accent }: {
  value: string; unit: string; label: string; description: string; accent?: "green" | "amber" | "red" | "neutral";
}) {
  const isReal = value !== "—";
  const display = isReal
    ? `${unit === "₹" ? "₹" : ""}${value}${unit === "%" ? "%" : unit === "L" ? "L" : ""}`
    : "—";
  const clr = !accent || accent === "neutral" || !isReal ? "text-ink"
    : accent === "green" ? "text-sage" : accent === "amber" ? "text-amber" : "text-burgundy";

  return (
    <Card className="design-card shadow-none hover:border-hairline-dim transition-colors">
      <CardHeader className="pb-1.5">
        <CardTitle className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest font-[family-name:var(--font-inter)]">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`stat-metric ${clr}`}>{display}</p>
        <CardDescription className="body-prose text-[13px] text-ink-muted mt-2">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

/* ─── P&L Card ─── */
function PnLCard({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: "green" | "amber" | "red" | "neutral" }) {
  const isReal = value !== "—";
  const display = isReal ? `${unit === "₹" ? "₹" : ""}${value}${unit === "%" ? "%" : ""}` : "—";
  const clr = !accent || accent === "neutral" || !isReal ? "text-ink"
    : accent === "green" ? "text-sage" : accent === "amber" ? "text-amber" : "text-burgundy";
  return (
    <Card className="design-card shadow-none">
      <CardHeader className="pb-1.5">
        <CardTitle className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest font-[family-name:var(--font-inter)]">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-[400] tracking-tight font-[family-name:var(--font-inter)] tabular-nums" style={{ color: "var(--color-ink)" }}>
          <span className={clr}>{display}</span>
        </p>
      </CardContent>
    </Card>
  );
}

/* ─── Alert Card ─── */
function AlertCard({ alert }: { alert: DecisionData["alerts"][number] }) {
  const bc = alert.severity === "warning" ? "border-l-amber" : "border-l-slate";
  const bg = alert.severity === "warning" ? "bg-[#FFF8E1]" : "bg-[#F5F7FA]";
  return (
    <div className={`${bg} border-l-4 ${bc} rounded-sm p-4`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-ink-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {alert.severity === "warning" ? (
              <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
            ) : (
              <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>
            )}
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink font-[family-name:var(--font-inter)]">{alert.title}</p>
          <p className="body-prose text-[13px] text-ink-muted mt-0.5">{alert.description}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Weather Widget ─── */
function WeatherWidget() {
  const [weather, setWeather] = useState<{ temperatureHigh: string; temperatureLow: string; rainfallMm: string; weatherCondition: string; recordedDate: string; } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/weather").then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setWeather(d[0]); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading || !weather) return null;
  const c = weather.weatherCondition?.toLowerCase() || "";
  const isRainy = c.includes("rain") || c.includes("drizzle");
  const isCloudy = c.includes("cloud");
  return (
    <div className="mt-16">
      <p className="eyebrow mb-3">Weather</p>
      <div className="design-card flex items-center justify-between shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            {isRainy ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M8 13h.01M16 13h.01M12 13h.01M12 17h.01M8 21h8"/></svg>
            ) : isCloudy ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C47335" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink font-[family-name:var(--font-inter)]">{weather.temperatureHigh || "—"}°C / {weather.temperatureLow || "—"}°C</p>
            <p className="body-prose text-[12px] text-ink-muted capitalize">{weather.weatherCondition || "Unknown"} · {weather.recordedDate}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-ink-muted font-[family-name:var(--font-inter)]">Rainfall</p>
          <p className="text-sm font-semibold text-ink">{weather.rainfallMm ? `${parseFloat(weather.rainfallMm).toFixed(1)} mm` : "0 mm"}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════ */
export default function DashboardHome() {
  const [data, setData] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFuelType, setActiveFuelType] = useState("combined");
  const handleFuelTypeChange = useCallback((v: string) => setActiveFuelType(v), []);
  const fetchData = useCallback(async (ft: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/decision?fuelType=${encodeURIComponent(ft)}`);
      setData(res.ok ? await res.json() : null);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(activeFuelType); }, [activeFuelType, fetchData]);

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
      <div>
        <p className="eyebrow">Today</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="body-prose text-[14px] text-ink-muted">{todayDisplay()}</p>
          {data?.lastUpdated && <span className="text-[11px] text-ink-dim">· Updated {formatTime(data.lastUpdated)}</span>}
        </div>
      </div>
      <FuelTabsBar active={activeFuelType} onChange={handleFuelTypeChange} />
    </div>
  );

  /* ── Initial Loading ── */
  if (loading && !data) return <div className="space-y-12">{header}<KolamOrnament /><DashboardSkeleton /></div>;

  /* ── No Data ── */
  if (!data || data.decision.action === "NO_DATA") {
    return (
      <div className="space-y-12">
        {header}
        <KolamOrnament />

        <div className="design-card shadow-none">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <div>
              <p className="section-heading font-[family-name:var(--font-inter)] text-ink">No forecast data yet</p>
              <p className="body-prose text-[14px] text-ink-muted mt-1.5">Run the proxy forecast engine to generate predictions, P&L metrics, and order recommendations.</p>
              <button className="btn-pill mt-4">Generate forecast</button>
            </div>
          </div>
        </div>

        <div className="space-y-16">
          <div>
            <p className="eyebrow mb-4">Key Metrics</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {["Expected demand", "Stockout risk", "Forecast confidence"].map((l) => (
                <Card key={l} className="design-card shadow-none">
                  <CardHeader><CardTitle className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest font-[family-name:var(--font-inter)]">{l}</CardTitle></CardHeader>
                  <CardContent><p className="stat-metric text-ink-dim">—</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow mb-4">Profit &amp; Loss</p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {["Expected daily profit", "Expected monthly profit", "Chance of loss", "Worst case (5% VaR)"].map((l) => (
                <Card key={l} className="design-card shadow-none">
                  <CardHeader><CardTitle className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest font-[family-name:var(--font-inter)]">{l}</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-[400] font-[family-name:var(--font-inter)] text-ink-dim">—</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <p className="body-prose text-[13px] text-ink-muted italic">
          Go to <span className="saffron-mark">Diagnostics</span> and click <strong>Generate forecast</strong> to see live data.
        </p>
      </div>
    );
  }

  /* ── Real Data View ── */
  const { decision, metrics, pnl, alerts } = data;
  const bannerBorder = decision.action === "BUY" ? "border-l-sage" : decision.action === "HOLD" ? "border-l-amber" : "border-l-slate";
  const bannerBg = decision.action === "BUY" ? "bg-[#E8F5E9]/40" : decision.action === "HOLD" ? "bg-[#FFF8E1]/40" : "bg-slate-50";

  return (
    <div className="space-y-16">
      {header}
      <KolamOrnament />

      <div className={`transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {/* ── Decision Banner ── */}
        <div className={`decision-banner ${bannerBg} ${bannerBorder}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-2">
              <ActionBadge action={decision.action} />
              <p className="text-lg font-[400] text-ink font-[family-name:var(--font-inter)] leading-snug mt-1">{decision.headline}</p>
              <p className="body-prose text-[14px] text-ink-muted">{decision.sub}</p>
            </div>
          </div>
        </div>

        {/* ── Key Metrics ── */}
        <div className="mt-16">
          <p className="eyebrow mb-4">Key Metrics</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard {...metrics.expectedDemand} label="Expected demand" accent="neutral" />
            <StatCard {...metrics.stockoutRisk} label="Stockout risk"
              accent={metrics.stockoutRisk.value === "—" ? "neutral" : parseFloat(metrics.stockoutRisk.value) > 20 ? "red" : parseFloat(metrics.stockoutRisk.value) > 10 ? "amber" : "green"}
            />
            <StatCard {...metrics.forecastConfidence} label="Forecast confidence"
              accent={metrics.forecastConfidence.value === "—" ? "neutral" : parseFloat(metrics.forecastConfidence.value) > 70 ? "green" : parseFloat(metrics.forecastConfidence.value) > 50 ? "amber" : "red"}
            />
          </div>
        </div>

        {/* ── P&L Snapshot ── */}
        <div className="mt-16">
          <p className="eyebrow mb-4">Profit &amp; Loss</p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <PnLCard label="Expected daily profit" value={pnl.expectedDailyProfit.value} unit={pnl.expectedDailyProfit.unit}
              accent={pnl.expectedDailyProfit.value !== "—" && parseInt(pnl.expectedDailyProfit.value) > 0 ? "green" : "red"} />
            <PnLCard label="Expected monthly profit" value={pnl.expectedMonthlyProfit.value} unit={pnl.expectedMonthlyProfit.unit} accent="green" />
            <PnLCard label="Chance of loss" value={pnl.pLoss.value} unit={pnl.pLoss.unit}
              accent={pnl.pLoss.value === "—" ? "neutral" : parseFloat(pnl.pLoss.value) > 20 ? "red" : parseFloat(pnl.pLoss.value) > 10 ? "amber" : "green"} />
            <PnLCard label="Worst case (5% VaR)" value={pnl.var5.value} unit={pnl.var5.unit} accent="red" />
          </div>
        </div>

        {/* ── Seasonal Alerts ── */}
        <div className="mt-16 space-y-2">
          <p className="eyebrow mb-3">What&apos;s coming</p>
          {alerts.map((a) => <AlertCard key={a.title} alert={a} />)}
        </div>

        {/* ── Weather ── */}
        <WeatherWidget />
      </div>
    </div>
  );
}
