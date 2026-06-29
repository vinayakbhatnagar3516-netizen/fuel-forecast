"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DecisionData } from "@/lib/api-types";

const FUEL_TABS = [
  { value: "combined", label: "Combined" },
  { value: "Petrol", label: "Petrol" },
  { value: "High-Speed Diesel", label: "HSD" },
] as const;

function todayDisplay() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatTime(iso: string | null) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

function StatCard({ value, unit, label, description, accent }: {
  value: string; unit: string; label: string; description: string; accent?: "green" | "amber" | "red" | "neutral";
}) {
  const isReal = value !== "—";
  const display = isReal ? `${unit === "₹" ? "₹" : ""}${value}${unit === "%" ? "%" : unit === "L" ? " L" : ""}` : "—";
  const color = !accent || accent === "neutral" || !isReal ? "text-[#2D2A26]"
    : accent === "green" ? "text-[#2D6A4F]" : accent === "amber" ? "text-[#C8913A]" : "text-[#A04040]";
  return (
    <div className="card-slate hover:border-[#D4834A] transition-colors" data-tip={description}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color} mt-1`}>{display}</div>
      <div className="stat-meta mt-1">{description}</div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    BUY: { bg: "bg-[#2D6A4F]", text: "text-white", label: "PLACE ORDER" },
    HOLD: { bg: "bg-[#C8913A]", text: "text-white", label: "HOLD" },
    SELL: { bg: "bg-[#A04040]", text: "text-white", label: "REDUCE" },
    NO_DATA: { bg: "bg-[#A0988C]", text: "text-white", label: "NO DATA" },
  };
  const s = styles[action] ?? styles.NO_DATA;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}>{s.label}</span>;
}

function AlertCard({ alert }: { alert: DecisionData["alerts"][number] }) {
  const border = alert.severity === "warning" ? "border-l-[#C8913A]" : "border-l-[#4A6FA5]";
  const bg = alert.severity === "warning" ? "bg-[#FAF3E8]" : "bg-[#F0EDE6]";
  return (
    <div className={`${bg} border-l-3 ${border} rounded-sm p-4`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[#A0988C]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {alert.severity === "warning" ? (
              <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
            ) : (
              <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>
            )}
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D2A26]">{alert.title}</p>
          <p className="text-[13px] text-[#7A6F65] mt-0.5">{alert.description}</p>
        </div>
      </div>
    </div>
  );
}

function WeatherWidget() {
  const [weather, setWeather] = useState<{ temperatureHigh: string; temperatureLow: string; rainfallMm: string; weatherCondition: string; recordedDate: string; } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/weather").then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setWeather(d[0]); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading || !weather) return null;
  const isRainy = weather.weatherCondition?.toLowerCase().includes("rain") || weather.weatherCondition?.toLowerCase().includes("drizzle");
  const isCloudy = weather.weatherCondition?.toLowerCase().includes("cloud");
  return (
    <div className="card-slate flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#F0EDE6] flex items-center justify-center">
          {isRainy ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6F65" strokeWidth="2"><path d="M8 13h.01M16 13h.01M12 13h.01M12 17h.01M8 21h8"/></svg>
          ) : isCloudy ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6F65" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4834A" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D2A26]">{weather.temperatureHigh || "—"}° / {weather.temperatureLow || "—"}°</p>
          <p className="text-[12px] text-[#7A6F65] capitalize">{weather.weatherCondition || "Unknown"} · {weather.recordedDate}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[11px] uppercase tracking-wider text-[#7A6F65] font-semibold">Rain</p>
        <p className="text-sm font-semibold text-[#2D2A26]">{weather.rainfallMm ? `${parseFloat(weather.rainfallMm).toFixed(1)} mm` : "0 mm"}</p>
      </div>
    </div>
  );
}

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7A6F65]">Today</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[14px] text-[#7A6F65] font-[family-name:var(--font-source-serif)] italic">{todayDisplay()}</p>
          {data?.lastUpdated && <span className="text-[11px] text-[#A0988C]">· Updated {formatTime(data.lastUpdated)}</span>}
        </div>
      </div>
      <div className="flex gap-2">
        {FUEL_TABS.map((tab) => (
          <button key={tab.value}
            onClick={() => handleFuelTypeChange(tab.value)}
            className={`fuel-pill ${activeFuelType === tab.value ? "active" : ""}`}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading && !data) {
    return (
      <div className="space-y-6">
        {header}
        <div className="grid-stats">
          {[1,2,3,4].map(i => (
            <div key={i} className="card-slate"><Skeleton className="h-3 w-24 bg-[#E0D6CC] mb-2" /><Skeleton className="h-6 w-32 bg-[#E0D6CC]" /><Skeleton className="h-3 w-40 bg-[#E0D6CC] mt-2" /></div>
          ))}
        </div>
        <div className="grid-2">
          <div className="card-slate"><Skeleton className="h-40 w-full bg-[#E0D6CC]" /></div>
          <div className="card-slate"><Skeleton className="h-40 w-full bg-[#E0D6CC]" /></div>
        </div>
      </div>
    );
  }

  if (!data || data.decision.action === "NO_DATA") {
    return (
      <div className="space-y-6">
        {header}
        <div className="card-slate text-center py-12">
          <p className="heading-lg">No forecast data yet</p>
          <p className="text-[#7A6F65] mt-2">Run the forecast engine to generate predictions and order recommendations.</p>
        </div>
        <div>
          <p className="stat-label mb-3">Key Metrics</p>
          <div className="grid-stats">
            {["Expected demand", "Stockout risk", "Forecast confidence", "Daily commission"].map(l => (
              <div key={l} className="card-slate"><div className="stat-label">{l}</div><div className="stat-value text-[#A0988C] mt-1">—</div></div>
            ))}
          </div>
        </div>
        <div>
          <p className="stat-label mb-3">Profit &amp; Loss</p>
          <div className="grid-2">
            {["Expected daily profit", "Expected monthly profit", "Chance of loss", "Worst case (5% VaR)"].map(l => (
              <div key={l} className="card-slate"><div className="stat-label">{l}</div><div className="stat-value text-[#A0988C] mt-1">—</div></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { decision, metrics, pnl, alerts, orderRecommendation } = data;
  const activeOrder = orderRecommendation.policies[orderRecommendation.defaultPolicy];
  const bannerColor = decision.action === "BUY" ? "border-l-[#2D6A4F]" : decision.action === "HOLD" ? "border-l-[#C8913A]" : "border-l-[#4A6FA5]";

  return (
    <div className="space-y-6">
      {header}

      {/* Decision Banner */}
      <div className={`banner ${bannerColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2>{decision.action === "BUY" ? "Order " : ""}<span className="hl">{decision.headline}</span></h2>
            <p>{decision.sub}</p>
          </div>
          <ActionBadge action={decision.action} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid-stats">
        <StatCard {...metrics.expectedDemand} label="Expected demand" accent="neutral" />
        <StatCard {...metrics.stockoutRisk} label="Stockout risk"
          accent={metrics.stockoutRisk.value === "—" ? "neutral" : parseFloat(metrics.stockoutRisk.value) > 20 ? "red" : parseFloat(metrics.stockoutRisk.value) > 10 ? "amber" : "green"} />
        <StatCard {...metrics.forecastConfidence} label="Forecast confidence"
          accent={metrics.forecastConfidence.value === "—" ? "neutral" : parseFloat(metrics.forecastConfidence.value) > 70 ? "green" : parseFloat(metrics.forecastConfidence.value) > 50 ? "amber" : "red"} />
        <StatCard {...{value: pnl.expectedDailyProfit.value !== "—" ? `₹${pnl.expectedDailyProfit.value}` : "—", unit: "₹", description: "Projected daily earnings from operations.", trend: "neutral"}} label="Daily commission"
          accent={pnl.expectedDailyProfit.value !== "—" ? "green" : "neutral"} />
      </div>

      {/* Order Recommendation + P&L */}
      <div className="grid-2">
        <div className="card-slate">
          <div className="flex items-center justify-between mb-3">
            <h3 className="heading-sm">Order Recommendation</h3>
            <div className="policy-pills">
              <button className="policy-pill" data-tip="Q95 + 500L buffer">Conservative</button>
              <button className="policy-pill active" data-tip="Q75 + 200L buffer">Balanced</button>
              <button className="policy-pill" data-tip="Q50 − 100L buffer">Aggressive</button>
            </div>
          </div>
          <div className="text-center py-4">
            <div className="text-[42px] font-[family-name:var(--font-instrument-serif)] font-[400] italic text-[#D4834A] tracking-tight" data-tip="Recommended order volume">{activeOrder ? `${activeOrder.recommendedOrder} L` : "— L"}</div>
            <div className="text-[12px] text-[#7A6F65] mt-1">{activeOrder ? `at ₹${orderRecommendation.perLiterPrice}/L · total ₹${orderRecommendation.totalCost}` : "No recommendation data"}</div>
          </div>
          <div className="grid-3 text-center mt-2 pt-3 border-t border-[#E0D6CC]">
            <div data-tip="Probability of stockout before next delivery"><div className="stat-label">Stockout Risk</div><div className={`text-[18px] font-mono font-semibold ${activeOrder ? parseFloat(activeOrder.pStockout) > 20 ? "text-[#A04040]" : parseFloat(activeOrder.pStockout) > 10 ? "text-[#C8913A]" : "text-[#2D6A4F]" : "text-[#A0988C]"}`}>{activeOrder ? `${activeOrder.pStockout}%` : "—"}</div></div>
            <div data-tip="Demand level triggering reorder"><div className="stat-label">Reorder Point</div><div className="text-[18px] font-mono font-semibold text-[#2D2A26]">{activeOrder ? `${activeOrder.reorderPoint} L` : "—"}</div></div>
            <div data-tip="Extra stock above reorder point"><div className="stat-label">Safety Buffer</div><div className="text-[18px] font-mono font-semibold text-[#C8913A]">{activeOrder ? `${activeOrder.safetyBuffer} L` : "—"}</div></div>
          </div>
        </div>

        <div className="card-slate">
          <h3 className="heading-sm mb-3">P&amp;L · This Week</h3>
          <div className="w-full h-[200px]">
            <svg viewBox="0 0 560 200" preserveAspectRatio="none" className="w-full h-full">
              <line x1="0" y1="40" x2="560" y2="40" stroke="#E0D6CC" strokeWidth="0.5"/>
              <line x1="0" y1="80" x2="560" y2="80" stroke="#E0D6CC" strokeWidth="0.5"/>
              <line x1="0" y1="120" x2="560" y2="120" stroke="#E0D6CC" strokeWidth="0.5"/>
              <line x1="0" y1="160" x2="560" y2="160" stroke="#E0D6CC" strokeWidth="0.5"/>
              {data.pnlHistory.map((d, i) => {
                const barW = 56; const gap = 12; const x = 14 + i * (barW + gap);
                const maxProfit = Math.max(...data.pnlHistory.map(h => h.dailyProfit), 1);
                const hScale = (val: number) => Math.max((val / (maxProfit * 1.3)) * 120, 4);
                const profitH = hScale(d.dailyProfit);
                const yBase = 165;
                return (
                  <g key={i}>
                    <rect x={x} y={yBase - profitH} width={barW} height={profitH} fill="rgba(45,106,79,0.35)" stroke="#2D6A4F" strokeWidth="1" rx="2"/>
                    {d.dailyProfit > 0 && <text x={x + barW/2} y={yBase - profitH - 4} fontFamily="monospace" fontSize="6.5" fill="#2D6A4F" textAnchor="middle" fontWeight="600">{(d.dailyProfit/1000).toFixed(1)}K</text>}
                    <text x={x + barW/2} y={yBase + 14} fontFamily="monospace" fontSize="7.5" fill="#A0988C" textAnchor="middle">{d.date}</text>
                  </g>
                );
              })}
              <text x="4" y="43" fontFamily="monospace" fontSize="6" fill="#A0988C">₹{(Math.max(...data.pnlHistory.map(h=>h.dailyProfit),1)*1.3/1000).toFixed(0)}K</text>
              <text x="4" y="83" fontFamily="monospace" fontSize="6" fill="#A0988C">₹{(Math.max(...data.pnlHistory.map(h=>h.dailyProfit),1)*0.87/1000).toFixed(0)}K</text>
              <text x="4" y="123" fontFamily="monospace" fontSize="6" fill="#A0988C">₹{(Math.max(...data.pnlHistory.map(h=>h.dailyProfit),1)*0.43/1000).toFixed(0)}K</text>
              <text x="4" y="163" fontFamily="monospace" fontSize="6" fill="#A0988C">₹0</text>
            </svg>
          </div>
          <div className="flex gap-3 text-[11px] font-mono text-[#A0988C] mt-2">
            <span><span className="inline-block w-2.5 h-2.5 bg-[rgba(45,106,79,0.35)] border border-[#2D6A4F] rounded-sm mr-1"></span>Daily Profit</span>
            <span className="ml-auto font-semibold text-[#2D2A26]">Today: <span className="text-[#2D6A4F]">₹{parseInt(data.pnl.expectedDailyProfit.value).toLocaleString("en-IN")}</span></span>
          </div>
        </div>
      </div>

      {/* Alerts + Action Summary */}
      <div className="grid-2">
        <div className="card-accent accent-amber">
          <h3 className="heading-sm mb-3">What&apos;s Coming</h3>
          <div className="space-y-2">
            {alerts.map((a) => <AlertCard key={a.title} alert={a} />)}
          </div>
        </div>
        <div className="card-accent accent-green">
          <h3 className="heading-sm mb-3">Action Summary</h3>
          <div className="grid-3">
            <div data-tip="Balanced policy recommendation">
              <div className="stat-label">Action</div>
              <div className="mt-2">
                <span className={`badge ${decision.action === "BUY" ? "badge-blue" : "badge-gray"}`}>
                  {activeOrder ? `${decision.action === "BUY" ? "PLACE ORDER" : "HOLD"} · ${activeOrder.recommendedOrder} L` : "NO DATA"}
                </span>
              </div>
              <div className="stat-meta mt-2">{decision.action === "BUY" ? "Balanced · min. expected cost" : decision.sub}</div>
            </div>
            <div data-tip="Stockout probability before next tanker">
              <div className="stat-label">Risk</div>
              <div className="mt-2">
                <span className={`badge ${activeOrder && parseFloat(activeOrder.pStockout) <= 10 ? "badge-green" : activeOrder && parseFloat(activeOrder.pStockout) <= 20 ? "badge-amber" : "badge-gray"}`}>
                  {activeOrder ? `${parseFloat(activeOrder.pStockout) <= 10 ? "LOW" : parseFloat(activeOrder.pStockout) <= 20 ? "MEDIUM" : "HIGH"} · ${activeOrder.pStockout}% stockout` : "—"}
                </span>
              </div>
              <div className="stat-meta mt-2">{activeOrder ? `Safety buffer: ${activeOrder.safetyBuffer} L` : ""}</div>
            </div>
            <div data-tip="Latest date to place order">
              <div className="stat-label">Delivery</div>
              <div className="mt-2"><span className="badge badge-blue">RUN FORECAST</span></div>
              <div className="stat-meta mt-2">Generate a forecast to see delivery estimates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather */}
      <div>
        <p className="stat-label mb-2">Weather</p>
        <WeatherWidget />
      </div>
    </div>
  );
}
