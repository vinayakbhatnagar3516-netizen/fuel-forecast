"use client";

import { useEffect, useMemo, useState } from "react";

const FUEL_TYPES = [
  { value: "combined", label: "Combined" },
  { value: "Petrol", label: "Petrol" },
  { value: "High-Speed Diesel", label: "High-Speed Diesel" },
];

const HORIZONS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

type TrendPoint = {
  date: string;
  q05: number;
  q25: number;
  q50: number;
  q75: number;
  q95: number;
  forecastPoint: number;
};

type ActualPoint = {
  date: string;
  totalLiters: number;
  totalRevenue: number;
  totalTransactions: number;
};

type WeatherPoint = {
  date: string;
  tempHigh: number | null;
  tempLow: number | null;
  rainfallMm: number | null;
  condition: string | null;
};

type TrendsData = {
  fuelType: string;
  horizon: number;
  forecastHistory: TrendPoint[];
  actualSales: ActualPoint[];
  weather: WeatherPoint[];
  accuracy: {
    mape: number | null;
    coverage: number | null;
    comparisons: number;
  };
};

function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatNumber(n: number) {
  return Math.round(n).toLocaleString("en-IN");
}

function buildPath(points: [number, number][]) {
  if (points.length === 0) return "";
  return `M${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")}`;
}

export default function TrendsPage() {
  const [fuelType, setFuelType] = useState("combined");
  const [horizon, setHorizon] = useState("30");
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/trends?fuelType=${encodeURIComponent(fuelType)}&horizon=${horizon}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fuelType, horizon]);

  const chartData = useMemo(() => {
    if (!data || data.forecastHistory.length === 0) return null;

    const width = 500;
    const height = 200;
    const padLeft = 32;
    const padRight = 8;
    const padTop = 8;
    const padBottom = 24;

    const allValues = [
      ...data.forecastHistory.flatMap((d) => [d.q05, d.q95]),
      ...data.actualSales.map((d) => d.totalLiters),
    ].filter((v) => v > 0);

    const maxY = allValues.length > 0 ? Math.max(...allValues) * 1.05 : 1000;
    const minY = 0;

    const n = data.forecastHistory.length;
    const xFor = (i: number) =>
      padLeft + (i * (width - padLeft - padRight)) / (n - 1 || 1);
    const yFor = (v: number) =>
      height - padBottom - ((v - minY) / (maxY - minY)) * (height - padTop - padBottom);

    const q05q95Top = data.forecastHistory.map((d, i) => [xFor(i), yFor(d.q95)] as [number, number]);
    const q05q95Bottom = data.forecastHistory
      .map((d, i) => [xFor(i), yFor(d.q05)] as [number, number])
      .reverse();

    const q25q75Top = data.forecastHistory.map((d, i) => [xFor(i), yFor(d.q75)] as [number, number]);
    const q25q75Bottom = data.forecastHistory
      .map((d, i) => [xFor(i), yFor(d.q25)] as [number, number])
      .reverse();

    const medianLine = data.forecastHistory.map((d, i) => [xFor(i), yFor(d.q50)] as [number, number]);
    const pointLine = data.forecastHistory.map((d, i) => [xFor(i), yFor(d.forecastPoint)] as [number, number]);

    const actualMap = new Map(data.actualSales.map((a) => [a.date, a.totalLiters]));
    const actualPoints = data.forecastHistory
      .map((d, i) => {
        const actual = actualMap.get(d.date);
        return actual ? ([xFor(i), yFor(actual)] as [number, number]) : null;
      })
      .filter(Boolean) as [number, number][];

    const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
    const xTicks = [0, Math.floor(n / 2), n - 1].filter((i, idx, arr) =>
      arr.indexOf(i) === idx
    );

    return {
      width,
      height,
      q05q95Path: buildPath([...q05q95Top, ...q05q95Bottom]),
      q25q75Path: buildPath([...q25q75Top, ...q25q75Bottom]),
      medianPath: buildPath(medianLine),
      pointPath: buildPath(pointLine),
      actualPoints,
      yTicks,
      xTicks,
      labels: data.forecastHistory.map((d) => formatDateLabel(d.date)),
      maxY,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <div className="page-heading"><span className="accent">Forecast</span> Engine</div>
        <div className="page-sub">Generate predictions · Quantile bands · Actual sales overlay</div>
      </div>

      <div className="grid-2">
        <div className="card-slate">
          <h3 className="heading-sm mb-3">{horizon}-Day Demand Forecast</h3>
          <p className="text-[11px] text-[#7A6F65] mb-3">
            CatBoost quantile model · q05–q95 bands
            {data?.actualSales && data.actualSales.length > 0 && " · actual sales dots"}
          </p>
          {loading && <p className="text-sm text-[#7A6F65]">Loading forecast…</p>}
          {error && <p className="text-sm text-[#A04040]">{error}</p>}
          {!loading && !error && chartData && (
            <div className="w-full h-[220px]">
              <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} preserveAspectRatio="none" className="w-full h-full">
                {chartData.yTicks.map((t, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={chartData.yTicks.indexOf(t) === -1 ? 0 : t}
                    x2={chartData.width}
                    y2={((chartData.height - 32) * (1 - t / chartData.maxY)) + 8}
                    stroke="#E0D6CC"
                    strokeWidth="0.5"
                  />
                ))}
                <path d={chartData.q05q95Path} fill="rgba(212,131,74,0.08)" />
                <path d={chartData.q25q75Path} fill="rgba(212,131,74,0.18)" />
                <path d={chartData.medianPath} fill="none" stroke="#D4834A" strokeWidth="1.5" strokeDasharray="4 2" />
                <path d={chartData.pointPath} fill="none" stroke="#D4834A" strokeWidth="2" />
                {chartData.actualPoints.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="#2D6A4F" />
                ))}
                {chartData.yTicks.map((t, i) => (
                  <text
                    key={`yt-${i}`}
                    x="4"
                    y={((chartData.height - 32) * (1 - t / chartData.maxY)) + 12}
                    fontFamily="monospace"
                    fontSize="6"
                    fill="#A0988C"
                  >
                    {formatNumber(t)}
                  </text>
                ))}
                {chartData.xTicks.map((i) => (
                  <text
                    key={`xt-${i}`}
                    x={32 + (i * (chartData.width - 40)) / (data!.forecastHistory.length - 1 || 1)}
                    y={chartData.height - 6}
                    fontFamily="monospace"
                    fontSize="6"
                    fill="#A0988C"
                    textAnchor="middle"
                  >
                    {chartData.labels[i]}
                  </text>
                ))}
              </svg>
            </div>
          )}
          {!loading && !error && !chartData && (
            <p className="text-sm text-[#7A6F65]">No forecast data yet. Run a forecast from Diagnostics.</p>
          )}
          <div className="flex gap-4 text-[11px] font-mono text-[#A0988C] mt-2 flex-wrap">
            <span><span className="inline-block w-3 h-0.5 bg-[#D4834A] mr-1"></span>point forecast</span>
            <span><span className="inline-block w-3 h-0.5 bg-[#D4834A] mr-1" style={{ background: "none", borderTop: "2px dashed #D4834A", height: 0 }}></span>q50 median</span>
            <span><span className="inline-block w-3 h-2 bg-[rgba(212,131,74,0.18)] border border-[rgba(212,131,74,0.1)] mr-1"></span>q25–q75</span>
            <span><span className="inline-block w-3 h-2 bg-[rgba(212,131,74,0.08)] border border-[rgba(212,131,74,0.05)] mr-1"></span>q05–q95</span>
            {data && data.actualSales.length > 0 && (
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#2D6A4F] mr-1"></span>actual</span>
            )}
            <span className="ml-auto">
              {data?.accuracy.coverage
                ? `Coverage: ${data.accuracy.coverage.toFixed(1)}%`
                : "Coverage: —"}
            </span>
          </div>
        </div>

        <div className="card-slate">
          <h3 className="heading-sm mb-4">Run Forecast</h3>
          <div className="form-group">
            <label>Fuel Type</label>
            <select className="form-select" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
              {FUEL_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Horizon</label>
            <select className="form-select" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
              {HORIZONS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Model</label>
            <select className="form-select" disabled>
              <option>CatBoost v3.0 (production)</option>
            </select>
          </div>
          <hr className="my-4 border-[#E0D6CC]" />
          <div className="stat-label">Accuracy (last {data?.accuracy.comparisons ?? 0} days with actuals)</div>
          <div className="text-[12px] font-mono text-[#7A6F65] mt-1">
            MAPE: {data?.accuracy.mape != null ? `${data.accuracy.mape}%` : "—"} · Coverage: {data?.accuracy.coverage != null ? `${data.accuracy.coverage}%` : "—"}
          </div>
        </div>
      </div>

      <div className="card-accent accent-slate">
        <h3 className="heading-sm mb-3">Forecast vs Actual · Last {horizon} Days</h3>
        <p className="text-[11px] text-[#7A6F65] mb-3">
          {fuelType} · CatBoost quantile model · Conformal calibration
        </p>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Actual</th><th>q50</th><th>q05–q95</th><th>Error</th><th>±%</th><th>Covered</th></tr>
            </thead>
            <tbody>
              {data?.forecastHistory.slice().reverse().map((row) => {
                const actual = data.actualSales.find((a) => a.date === row.date);
                const error = actual ? row.forecastPoint - actual.totalLiters : null;
                const pct = actual && actual.totalLiters > 0 ? (error! / actual.totalLiters) * 100 : null;
                const covered = actual ? actual.totalLiters >= row.q05 && actual.totalLiters <= row.q95 : null;
                return (
                  <tr key={row.date}>
                    <td>{formatDateLabel(row.date)}</td>
                    <td className="mono">{actual ? formatNumber(actual.totalLiters) : "—"}</td>
                    <td className="mono">{formatNumber(row.q50)}</td>
                    <td>{formatNumber(row.q05)}–{formatNumber(row.q95)}</td>
                    <td className={`mono ${error && error > 0 ? "up" : error && error < 0 ? "dn" : ""}`}>
                      {error ? (error > 0 ? `+${formatNumber(error)}` : formatNumber(error)) : "—"}
                    </td>
                    <td className={`mono ${pct && pct > 0 ? "up" : pct && pct < 0 ? "dn" : ""}`}>
                      {pct ? `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%` : "—"}
                    </td>
                    <td className={covered === true ? "text-[#2D6A4F] font-semibold" : covered === false ? "text-[#A04040] font-semibold" : "text-[#A0988C]"}>
                      {covered === true ? "✓" : covered === false ? "✗" : "—"}
                    </td>
                  </tr>
                );
              })}
              {(!data || data.forecastHistory.length === 0) && (
                <tr><td colSpan={7} className="text-center text-[#A0988C]">No forecast history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
