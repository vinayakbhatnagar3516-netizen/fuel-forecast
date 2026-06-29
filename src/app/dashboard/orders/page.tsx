"use client";

import { useEffect, useState } from "react";

const FUEL_TYPES = [
  { value: "Petrol", label: "Petrol" },
  { value: "High-Speed Diesel", label: "High-Speed Diesel" },
];

type OrderPolicy = {
  policy: "conservative" | "balanced" | "aggressive";
  recommendedOrder: number;
  reorderPoint: number;
  orderQuantity: number;
  expectedCost: number;
  pStockout: number;
  safetyBuffer: number;
};

type OrdersData = {
  fuelType: string;
  hasData: boolean;
  forecastDate: string | null;
  forecastPoint: number;
  recommendation: { policy: string; recommendedOrder: number; pStockout: number } | null;
  policies: Record<string, OrderPolicy | null>;
  financial: {
    expectedDailyProfit: number;
    expectedMonthlyProfit: number;
    pLoss: number;
    var5: number;
  } | null;
};

function formatNumber(n: number) {
  return Math.round(n).toLocaleString("en-IN");
}

function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function policyColor(policy: string) {
  switch (policy) {
    case "conservative":
      return "text-[#4A6FA5]";
    case "balanced":
      return "text-[#2D6A4F]";
    case "aggressive":
      return "text-[#C8913A]";
    default:
      return "text-[#2D2A26]";
  }
}

export default function OrdersPage() {
  const [fuelType, setFuelType] = useState("Petrol");
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/orders?fuelType=${encodeURIComponent(fuelType)}`)
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
  }, [fuelType]);

  const recommendation = data?.recommendation;
  const balanced = data?.policies?.balanced;
  const perLiterPrice = 94.5;

  return (
    <div className="space-y-6">
      <div>
        <div className="page-heading"><span className="accent">Orders</span> &amp; Logistics</div>
        <div className="page-sub">Current recommendation · Lead time calculation · Policy comparison</div>
      </div>

      <div className="grid-2">
        <div className="card-slate">
          <h3 className="heading-sm mb-4">Current Recommendation</h3>
          {loading && <p className="text-sm text-[#7A6F65]">Loading recommendation…</p>}
          {error && <p className="text-sm text-[#A04040]">{error}</p>}
          {!loading && !error && recommendation && balanced && (
            <>
              <div className="text-center py-4">
                <div className="text-[40px] font-[family-name:var(--font-instrument-serif)] font-[400] italic text-[#D4834A]">
                  {formatNumber(balanced.recommendedOrder)} L
                </div>
                <div className="text-[12px] text-[#7A6F65] mt-1">
                  {fuelType} · Balanced policy
                </div>
              </div>
              <div className="grid-2 pt-4 border-t border-[#E0D6CC]">
                <div>
                  <div className="stat-label">Order Cost</div>
                  <div className="text-[16px] font-mono font-semibold mt-1 text-[#2D2A26]">
                    {formatInr(balanced.recommendedOrder * perLiterPrice)}
                  </div>
                </div>
                <div>
                  <div className="stat-label">Per-Liter</div>
                  <div className="text-[16px] font-mono font-semibold mt-1 text-[#2D2A26]">
                    {formatInr(perLiterPrice)}
                  </div>
                </div>
                <div>
                  <div className="stat-label">Lead Time</div>
                  <div className="text-[16px] font-mono font-semibold text-[#4A6FA5] mt-1">3 days</div>
                </div>
                <div>
                  <div className="stat-label">Stockout Risk</div>
                  <div className={`text-[16px] font-mono font-semibold mt-1 ${balanced.pStockout > 0.2 ? "text-[#A04040]" : "text-[#2D6A4F]"}`}>
                    {(balanced.pStockout * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </>
          )}
          {!loading && !error && !recommendation && (
            <p className="text-sm text-[#7A6F65]">No recommendation yet. Run a forecast from Diagnostics.</p>
          )}
        </div>

        <div className="card-accent accent-green">
          <h3 className="heading-sm mb-4">Fuel Type</h3>
          <div className="form-group">
            <label>Product</label>
            <select className="form-select" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
              {FUEL_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
            </select>
          </div>
          <div className="bg-[#F0EDE6] rounded-sm p-3 mb-3 mt-3">
            <div className="flex justify-between text-[12px]"><span className="text-[#7A6F65]">Forecast date:</span><span className="text-[#A0988C] font-mono">{data?.forecastDate ?? "—"}</span></div>
            <div className="flex justify-between text-[12px] mt-1"><span className="text-[#7A6F65]">Expected demand:</span><span className="text-[#A0988C] font-mono">{data ? formatNumber(data.forecastPoint) : "—"} L</span></div>
            <div className="flex justify-between text-[12px] mt-1"><span className="text-[#7A6F65]">Daily P&L:</span><span className="text-[#A0988C] font-mono">{data?.financial ? formatInr(data.financial.expectedDailyProfit) : "—"}</span></div>
            <div className="flex justify-between text-[14px] font-semibold mt-2 pt-2 border-t border-[#E0D6CC]"><span className="text-[#2D2A26]">Loss probability:</span><span className={data?.financial && data.financial.pLoss > 0.15 ? "text-[#A04040]" : "text-[#2D6A4F]"}>{data?.financial ? `${(data.financial.pLoss * 100).toFixed(1)}%` : "—"}</span></div>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={() => alert("Order confirmation will be implemented when supplier integration is available.")}
          >
            Confirm Order
          </button>
        </div>
      </div>

      <div className="card-accent accent-amber">
        <h3 className="heading-sm mb-3">Policy Comparison</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Recommended Order</th>
                <th>Reorder Point</th>
                <th>Safety Buffer</th>
                <th>Expected Cost</th>
                <th>Stockout Risk</th>
              </tr>
            </thead>
            <tbody>
              {["conservative", "balanced", "aggressive"].map((key) => {
                const p = data?.policies?.[key];
                return (
                  <tr key={key}>
                    <td className={`font-semibold capitalize ${p ? policyColor(key) : ""}`}>{key}</td>
                    <td className="mono">{p ? `${formatNumber(p.recommendedOrder)} L` : "—"}</td>
                    <td className="mono">{p ? `${formatNumber(p.reorderPoint)} L` : "—"}</td>
                    <td className="mono">{p ? `${formatNumber(p.safetyBuffer)} L` : "—"}</td>
                    <td className="mono">{p ? formatInr(p.expectedCost) : "—"}</td>
                    <td className="mono">{p ? `${(p.pStockout * 100).toFixed(1)}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-accent accent-slate">
        <h3 className="heading-sm mb-3">Order History</h3>
        <p className="text-[11px] text-[#7A6F65] mb-3">
          Order tracking will be enabled after the first confirmed order.
        </p>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Product</th><th>Qty</th><th>Supplier</th><th>Delivery</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="text-center text-[#A0988C]">No confirmed orders yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
