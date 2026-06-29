"use client";

import { useState } from "react";

const FUEL_TYPES = [
  { value: "Petrol", label: "Petrol" },
  { value: "High-Speed Diesel", label: "High-Speed Diesel" },
];

const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Fleet", "Other"];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function DailyEntryPage() {
  const [date, setDate] = useState(todayStr());
  const [fuelType, setFuelType] = useState("Petrol");
  const [totalLiters, setTotalLiters] = useState("");
  const [totalRevenue, setTotalRevenue] = useState("");
  const [totalTransactions, setTotalTransactions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          fuelType,
          totalLiters: parseFloat(totalLiters),
          totalRevenue: parseFloat(totalRevenue),
          totalTransactions: parseInt(totalTransactions, 10),
          paymentMethod,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      setStatus("success");
      setMessage(`Saved ${json.totalLiters.toLocaleString("en-IN")} L of ${json.fuelType} for ${json.date}.`);
      setTotalLiters("");
      setTotalRevenue("");
      setTotalTransactions("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="page-heading"><span className="accent">Daily</span> Sales Entry</div>
        <div className="page-sub">Record fuel sales for demand tracking and model retraining</div>
      </div>

      <div className="grid-2">
        <form onSubmit={handleSubmit} className="card-slate space-y-4">
          <h3 className="heading-sm mb-4">Enter Daily Summary</h3>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="fuelType">Fuel Type</label>
              <select
                id="fuelType"
                className="form-select"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                {FUEL_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="totalLiters">Total Liters Sold</label>
            <input
              id="totalLiters"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              placeholder="e.g. 5200"
              value={totalLiters}
              onChange={(e) => setTotalLiters(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="totalRevenue">Total Revenue (₹)</label>
              <input
                id="totalRevenue"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="e.g. 491400"
                value={totalRevenue}
                onChange={(e) => setTotalRevenue(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="totalTransactions">Number of Transactions</label>
              <input
                id="totalTransactions"
                type="number"
                min="0"
                step="1"
                className="form-input"
                placeholder="e.g. 145"
                value={totalTransactions}
                onChange={(e) => setTotalTransactions(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Primary Payment Method</label>
            <select
              id="paymentMethod"
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Saving…" : "Save Daily Summary"}
          </button>

          {status === "success" && (
            <div className="text-sm text-[#2D6A4F] bg-[rgba(45,106,79,0.08)] p-3 rounded-sm">
              {message}
            </div>
          )}
          {status === "error" && (
            <div className="text-sm text-[#A04040] bg-[rgba(160,64,64,0.06)] p-3 rounded-sm">
              {message}
            </div>
          )}
        </form>

        <div className="card-accent accent-blue">
          <h3 className="heading-sm mb-3">Why enter daily sales?</h3>
          <ul className="space-y-3 text-[13px] text-[#7A6F65]">
            <li className="flex gap-2">
              <span className="text-[#D4834A]">•</span>
              <span>Trains the CatBoost model on real demand patterns instead of synthetic data.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D4834A]">•</span>
              <span>Lets you compare forecast vs actual on the Trends page.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D4834A]">•</span>
              <span>Improves order recommendations as seasonal and weekly patterns emerge.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D4834A]">•</span>
              <span>Before the pump opens, use this form to backfill test/pilot data.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
