"use client";

import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { CostMatrixData } from "@/db/schema";

function SectionSkeleton() {
  return (
    <div className="card-slate">
      <Skeleton className="h-4 w-48 bg-[#E0D6CC] mb-2" />
      <Skeleton className="h-3 w-64 bg-[#E0D6CC] mb-4" />
      <div className="grid-2">
        <div><Skeleton className="h-3 w-20 bg-[#E0D6CC] mb-1" /><Skeleton className="h-9 w-full bg-[#E0D6CC]" /></div>
        <div><Skeleton className="h-3 w-20 bg-[#E0D6CC] mb-1" /><Skeleton className="h-9 w-full bg-[#E0D6CC]" /></div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, suffix, disabled }: {
  label: string; value: number | undefined | null; onChange: (v: number) => void; suffix?: string; disabled?: boolean;
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="relative">
        <input type="number" value={value ?? ""} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="form-input pr-8" disabled={disabled} step="any" />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#A0988C]">{suffix}</span>}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string | undefined | null; onChange: (v: string) => void }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="form-input" />
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#E0D6CC] last:border-0">
      <span className="text-[12px] text-[#7A6F65]">{label}</span>
      <span className="text-[12px] font-semibold text-[#2D2A26]">{value}</span>
    </div>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="card-accent accent-blue">
      <h3 className="heading-sm mb-1">{title}</h3>
      <p className="text-[12px] text-[#7A6F65] mb-4">{description}</p>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [data, setData] = useState<CostMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<CostMatrixData | null>(null);

  useEffect(() => {
    fetch("/api/cost-matrix").then(r => r.json()).then(res => {
      if (res && res.data) { setData(res.data); setDraft(res.data); }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateDraft = useCallback((updater: (prev: CostMatrixData) => CostMatrixData) => {
    setDraft((prev) => prev ? updater(prev) : prev);
  }, []);

  const saveAll = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cost-matrix", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      setData(draft);
      toast.success("Settings saved", { description: "Cost matrix updated successfully." });
    } catch {
      toast.error("Failed to save", { description: "Please try again." });
    } finally { setSaving(false); }
  }, [draft]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><div className="page-heading"><span className="accent">Settings</span></div><div className="page-sub">Loading configuration…</div></div>
        <SectionSkeleton /><SectionSkeleton /><SectionSkeleton />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="space-y-6">
        <div><div className="page-heading"><span className="accent">Settings</span></div><div className="page-sub">Station configuration and financial parameters.</div></div>
        <div className="card-slate text-center py-12">
          <p className="text-[#7A6F65]">No configuration found.</p>
          <button onClick={saveAll} className="btn btn-primary mt-4">Create default config</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="page-heading"><span className="accent">Settings</span></div>
          <div className="page-sub">Station configuration for <strong>{draft.pump_name}</strong></div>
        </div>
        <button onClick={saveAll} disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <SettingsSection title="Station Identity" description="Pump name and location">
        <div className="grid-3">
          <TextField label="Station name" value={draft.pump_name} onChange={(v) => updateDraft((d) => ({ ...d, pump_name: v }))} />
          <NumberField label="Latitude" value={draft.location?.latitude} onChange={(v) => updateDraft((d) => ({ ...d, location: { ...d.location, latitude: v } }))} />
          <NumberField label="Longitude" value={draft.location?.longitude} onChange={(v) => updateDraft((d) => ({ ...d, location: { ...d.location, longitude: v } }))} />
        </div>
      </SettingsSection>

      {Object.entries(draft.by_fuel_grade).map(([fuelName, grade]) => (
        <SettingsSection key={fuelName} title={`Fuel Grade: ${fuelName}`} description={`Tank configuration and economics for ${fuelName}`}>
          <div className="grid-3">
            <NumberField label="Commission per liter" value={grade.commission_per_liter} suffix="₹"
              onChange={(v) => updateDraft((d) => ({ ...d, by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, commission_per_liter: v } } }))} />
            <NumberField label="Purchase price" value={grade.purchase_price_per_liter} suffix="₹/L"
              onChange={(v) => updateDraft((d) => ({ ...d, by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, purchase_price_per_liter: v } } }))} />
            <NumberField label="Tank capacity" value={grade.tank_capacity_liters} suffix="L"
              onChange={(v) => updateDraft((d) => ({ ...d, by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, tank_capacity_liters: v } } }))} />
            <NumberField label="Stockout cost" value={grade.stockout_cost_per_liter} suffix="₹/L"
              onChange={(v) => updateDraft((d) => ({ ...d, by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, stockout_cost_per_liter: v } } }))} />
            <NumberField label="Overstock cost" value={grade.overstock_cost_per_liter_per_day} suffix="₹/L/day"
              onChange={(v) => updateDraft((d) => ({ ...d, by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, overstock_cost_per_liter_per_day: v } } }))} />
            <NumberField label="Evaporation loss" value={grade.evaporation_loss_pct} suffix="%"
              onChange={(v) => updateDraft((d) => ({ ...d, by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, evaporation_loss_pct: v } } }))} />
          </div>
        </SettingsSection>
      ))}

      <SettingsSection title="Cost Parameters" description="Stockout, overstock, and ordering costs">
        <div className="grid-3">
          <NumberField label="Stockout cost" value={draft.costs?.stockout_cost_per_liter?.value} suffix="₹/L"
            onChange={(v) => updateDraft((d) => ({ ...d, costs: { ...d.costs, stockout_cost_per_liter: { ...d.costs.stockout_cost_per_liter, value: v } } }))} />
          <NumberField label="Overstock cost" value={draft.costs?.overstock_cost_per_liter_per_day?.value} suffix="₹/L/day"
            onChange={(v) => updateDraft((d) => ({ ...d, costs: { ...d.costs, overstock_cost_per_liter_per_day: { ...d.costs.overstock_cost_per_liter_per_day, value: v } } }))} />
          <NumberField label="Cost per order" value={draft.costs?.cost_per_order?.value} suffix="₹"
            onChange={(v) => updateDraft((d) => ({ ...d, costs: { ...d.costs, cost_per_order: { ...d.costs.cost_per_order, value: v } } }))} />
        </div>
      </SettingsSection>

      <SettingsSection title="Operational Constraints" description="Capacities, lead times, and terrain adjustments">
        <div className="grid-4">
          <NumberField label="Total tank capacity" value={draft.operational_constraints?.tank_capacity_liters} suffix="L"
            onChange={(v) => updateDraft((d) => ({ ...d, operational_constraints: { ...d.operational_constraints, tank_capacity_liters: v } }))} />
          <NumberField label="Tanker capacity" value={draft.operational_constraints?.tanker_capacity_liters} suffix="L"
            onChange={(v) => updateDraft((d) => ({ ...d, operational_constraints: { ...d.operational_constraints, tanker_capacity_liters: v } }))} />
          <NumberField label="Lead time" value={draft.operational_constraints?.order_lead_time_days} suffix="days"
            onChange={(v) => updateDraft((d) => ({ ...d, operational_constraints: { ...d.operational_constraints, order_lead_time_days: v } }))} />
          <NumberField label="Hill allowance" value={draft.operational_constraints?.hill_area_allowance_per_liter} suffix="₹/L"
            onChange={(v) => updateDraft((d) => ({ ...d, operational_constraints: { ...d.operational_constraints, hill_area_allowance_per_liter: v } }))} />
        </div>
      </SettingsSection>

      <SettingsSection title="Financial Overview" description="Monthly opex, debt, and equity position">
        <div className="grid-2">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#7A6F65] mb-2">Monthly Operating Expenses</h4>
            {draft.financial?.monthly_opex && typeof draft.financial.monthly_opex === "object" && !Array.isArray(draft.financial.monthly_opex) && (
              Object.entries(draft.financial.monthly_opex as Record<string, unknown>)
                .filter(([k]) => k !== "total")
                .map(([key, val]) => (
                  <MetricRow key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} value={"₹" + Number(val).toLocaleString("en-IN")} />
                ))
            )}
            <MetricRow label="Total monthly opex" value={"₹" + ((draft.financial?.monthly_opex as Record<string, number>)?.total ?? 0).toLocaleString("en-IN")} />
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#7A6F65] mb-2">Debt &amp; Interest</h4>
            <MetricRow label="Term loan (monthly interest)" value={"₹" + (draft.financial?.debt?.term_loan?.monthly_interest ?? 0).toLocaleString("en-IN")} />
            <MetricRow label="EDFS MCLR rate" value={`${draft.financial?.debt?.edfs_working_capital?.edfs_mclr_rate_pct ?? 0}%`} />
            <MetricRow label="EDFS credit days" value={`${draft.financial?.debt?.edfs_working_capital?.edfs_credit_days ?? 0} days`} />
            <MetricRow label="Total monthly interest" value={"₹" + (draft.financial?.debt?.total_monthly_interest ?? 0).toLocaleString("en-IN")} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Seasonal Adjustments" description="Demand and cost multipliers by season">
        <div className="grid-3">
          {draft.seasonal_adjustments && Object.entries(draft.seasonal_adjustments).map(([seasonName, season]) => {
            const monthNames = season.months.map(m => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]).join(", ");
            return (
              <div key={seasonName} className="card-slate">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#7A6F65] mb-1">{seasonName.replace(/_/g, " ")}</h4>
                <p className="text-[11px] text-[#A0988C] mb-2">{monthNames}</p>
                <div className="space-y-2">
                  <NumberField label="Stockout multiplier" value={season.stockout_multiplier}
                    onChange={(v) => updateDraft((d) => ({ ...d, seasonal_adjustments: { ...d.seasonal_adjustments, [seasonName]: { ...season, stockout_multiplier: v } } }))} />
                  <NumberField label="Overstock multiplier" value={season.overstock_multiplier}
                    onChange={(v) => updateDraft((d) => ({ ...d, seasonal_adjustments: { ...d.seasonal_adjustments, [seasonName]: { ...season, overstock_multiplier: v } } }))} />
                </div>
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="Decision Policies" description="Order recommendation parameters (conservative, balanced, aggressive)">
        <div className="grid-3">
          {draft.decision_parameters?.policies && Object.entries(draft.decision_parameters.policies).map(([policyName, policy]) => (
            <div key={policyName} className={`card-slate ${policyName === "balanced" ? "border-[#D4834A] bg-[rgba(212,131,74,0.04)]" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#7A6F65]">{policyName}</h4>
                {policyName === "balanced" && <span className="text-[10px] bg-[#D4834A] text-white px-1.5 py-0.5 rounded-sm font-medium">Default</span>}
              </div>
              {policy.description && <p className="text-[11px] text-[#A0988C] mb-2 italic">{policy.description}</p>}
              <div className="space-y-2">
                <NumberField label="Quantile target" value={policy.quantile_target}
                  onChange={(v) => updateDraft((d) => ({ ...d, decision_parameters: { ...d.decision_parameters, policies: { ...d.decision_parameters!.policies, [policyName]: { ...policy, quantile_target: v } } } }))} />
                <NumberField label="Safety buffer" value={policy.safety_buffer_liters} suffix="L"
                  onChange={(v) => updateDraft((d) => ({ ...d, decision_parameters: { ...d.decision_parameters, policies: { ...d.decision_parameters!.policies, [policyName]: { ...policy, safety_buffer_liters: v } } } }))} />
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <div className="flex justify-end pb-8">
        <button onClick={saveAll} disabled={saving} className="btn btn-primary">
          {saving ? "Saving all changes..." : "Save all changes"}
        </button>
      </div>
    </div>
  );
}
