"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { CostMatrixData } from "@/db/schema";

/* ─── Helpers ─── */
function formatCurrency(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

function SectionSkeleton() {
  return (
    <Card className="design-card shadow-none">
      <CardHeader>
        <Skeleton className="h-5 w-48 bg-muted mb-1" />
        <Skeleton className="h-3 w-64 bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Skeleton className="h-3 w-24 bg-muted mb-1" /><Skeleton className="h-9 w-full bg-muted" /></div>
          <div className="space-y-1"><Skeleton className="h-3 w-24 bg-muted mb-1" /><Skeleton className="h-9 w-full bg-muted" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Number Input ─── */
function NumberField({ label, value, onChange, suffix, disabled }: {
  label: string;
  value: number | undefined | null;
  onChange: (v: number) => void;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[12px] font-medium text-ink-muted font-[family-name:var(--font-inter)]">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="design-input pr-8"
          disabled={disabled}
          step="any"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-dim">{suffix}</span>}
      </div>
    </div>
  );
}

/* ─── Text Input ─── */
function TextField({ label, value, onChange }: {
  label: string;
  value: string | undefined | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="border-border rounded-sm text-sm"
      />
    </div>
  );
}

/* ─── Section Wrapper ─── */
function SettingsSection({ title, description, children, onSave, saving }: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <Card className="design-card shadow-none overflow-hidden relative">
      <div className="mandala-light pattern-sparse-br" />
      <div className="relative z-10">
      <CardHeader className="pb-4">
        <CardTitle className="section-heading font-[family-name:var(--font-inter)]">{title}</CardTitle>
        <CardDescription className="body-prose text-[13px] text-ink-muted">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {onSave && (
          <div className="pt-2 flex justify-end">
            <button onClick={onSave} disabled={saving} className="btn-pill-secondary btn-pill">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </CardContent>
      </div>
    </Card>
  );
}

/* ─── Read-only metric display ─── */
function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-[#1A1F2E]">{value}</span>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SettingsPage() {
  const [data, setData] = useState<CostMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local copy for editing
  const [draft, setDraft] = useState<CostMatrixData | null>(null);

  useEffect(() => {
    fetch("/api/cost-matrix")
      .then((r) => r.json())
      .then((res) => {
        if (res && res.data) {
          setData(res.data);
          setDraft(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateDraft = useCallback((updater: (prev: CostMatrixData) => CostMatrixData) => {
    setDraft((prev) => prev ? updater(prev) : prev);
  }, []);

  const saveAll = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cost-matrix", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      setData(draft);
      toast.success("Settings saved", { description: "Cost matrix updated successfully." });
    } catch {
      toast.error("Failed to save", { description: "Please try again." });
    } finally {
      setSaving(false);
    }
  }, [draft]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="eyebrow">Settings</p>
          <p className="body-prose text-[14px] text-ink-muted mt-1">Loading your station configuration…</p>
        </div>
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="space-y-6">
        <div>
          <p className="eyebrow">Settings</p>
          <p className="body-prose text-[14px] text-ink-muted mt-1">Station configuration and preferences.</p>
        </div>
        <Card className="border-border rounded-sm shadow-none">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No configuration found.</p>
            <button onClick={saveAll} className="btn-pill mt-4">Create default config</button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Settings</p>
          <p className="body-prose text-[14px] text-ink-muted mt-1">
            Financial configuration for <span className="saffron-mark">{draft.pump_name}</span>
          </p>
        </div>
        <button onClick={saveAll} disabled={saving} className="btn-pill">
          {saving ? "Saving all..." : "Save all changes"}
        </button>
      </div>

      {/* ── 1. Station Identity ── */}
      <SettingsSection title="Station Identity" description="Pump name and location">
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            label="Station name"
            value={draft.pump_name}
            onChange={(v) => updateDraft((d) => ({ ...d, pump_name: v }))}
          />
          <NumberField
            label="Latitude"
            value={draft.location?.latitude}
            onChange={(v) => updateDraft((d) => ({ ...d, location: { ...d.location, latitude: v } }))}
          />
          <NumberField
            label="Longitude"
            value={draft.location?.longitude}
            onChange={(v) => updateDraft((d) => ({ ...d, location: { ...d.location, longitude: v } }))}
          />
        </div>
      </SettingsSection>

      {/* ── 2. Fuel Grades ── */}
      {Object.entries(draft.by_fuel_grade).map(([fuelName, grade]) => (
        <SettingsSection
          key={fuelName}
          title={`Fuel Grade: ${fuelName}`}
          description={`Tank configuration and economics for ${fuelName}`}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField
              label="Commission per liter" value={grade.commission_per_liter} suffix="₹"
              onChange={(v) => updateDraft((d) => ({
                ...d,
                by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, commission_per_liter: v } },
              }))}
            />
            <NumberField
              label="Purchase price" value={grade.purchase_price_per_liter} suffix="₹/L"
              onChange={(v) => updateDraft((d) => ({
                ...d,
                by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, purchase_price_per_liter: v } },
              }))}
            />
            <NumberField
              label="Tank capacity" value={grade.tank_capacity_liters} suffix="L"
              onChange={(v) => updateDraft((d) => ({
                ...d,
                by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, tank_capacity_liters: v } },
              }))}
            />
            <NumberField
              label="Stockout cost" value={grade.stockout_cost_per_liter} suffix="₹/L"
              onChange={(v) => updateDraft((d) => ({
                ...d,
                by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, stockout_cost_per_liter: v } },
              }))}
            />
            <NumberField
              label="Overstock cost" value={grade.overstock_cost_per_liter_per_day} suffix="₹/L/day"
              onChange={(v) => updateDraft((d) => ({
                ...d,
                by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, overstock_cost_per_liter_per_day: v } },
              }))}
            />
            <NumberField
              label="Evaporation loss" value={grade.evaporation_loss_pct} suffix="%"
              onChange={(v) => updateDraft((d) => ({
                ...d,
                by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, evaporation_loss_pct: v } },
              }))}
            />
            <NumberField
              label="Min annual contract" value={grade.contractual_min_annual_liters} suffix="L/yr"
              onChange={(v) => updateDraft((d) => ({
                ...d,
                by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, contractual_min_annual_liters: v } },
              }))}
            />
            <NumberField
              label="Max order size" value={grade.max_order_size} suffix="L"
              onChange={(v) => updateDraft((d) => ({
                ...d,
                by_fuel_grade: { ...d.by_fuel_grade, [fuelName]: { ...grade, max_order_size: v } },
              }))}
            />
          </div>
        </SettingsSection>
      ))}

      {/* ── 3. Cost Parameters ── */}
      <SettingsSection title="Cost Parameters" description="Stockout, overstock, and ordering costs">
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField
            label="Stockout cost" value={draft.costs?.stockout_cost_per_liter?.value} suffix="₹/L"
            onChange={(v) => updateDraft((d) => ({
              ...d,
              costs: { ...d.costs, stockout_cost_per_liter: { ...d.costs.stockout_cost_per_liter, value: v } },
            }))}
          />
          <NumberField
            label="Overstock cost" value={draft.costs?.overstock_cost_per_liter_per_day?.value} suffix="₹/L/day"
            onChange={(v) => updateDraft((d) => ({
              ...d,
              costs: { ...d.costs, overstock_cost_per_liter_per_day: { ...d.costs.overstock_cost_per_liter_per_day, value: v } },
            }))}
          />
          <NumberField
            label="Cost per order" value={draft.costs?.cost_per_order?.value} suffix="₹"
            onChange={(v) => updateDraft((d) => ({
              ...d,
              costs: { ...d.costs, cost_per_order: { ...d.costs.cost_per_order, value: v } },
            }))}
          />
        </div>
      </SettingsSection>

      {/* ── 4. Operational Constraints ── */}
      <SettingsSection title="Operational Constraints" description="Capacities, lead times, and terrain adjustments">
        <div className="grid gap-3 sm:grid-cols-4">
          <NumberField
            label="Total tank capacity" value={draft.operational_constraints?.tank_capacity_liters} suffix="L"
            onChange={(v) => updateDraft((d) => ({
              ...d,
              operational_constraints: { ...d.operational_constraints, tank_capacity_liters: v },
            }))}
          />
          <NumberField
            label="Tanker capacity" value={draft.operational_constraints?.tanker_capacity_liters} suffix="L"
            onChange={(v) => updateDraft((d) => ({
              ...d,
              operational_constraints: { ...d.operational_constraints, tanker_capacity_liters: v },
            }))}
          />
          <NumberField
            label="Lead time" value={draft.operational_constraints?.order_lead_time_days} suffix="days"
            onChange={(v) => updateDraft((d) => ({
              ...d,
              operational_constraints: { ...d.operational_constraints, order_lead_time_days: v },
            }))}
          />
          <NumberField
            label="Hill allowance" value={draft.operational_constraints?.hill_area_allowance_per_liter} suffix="₹/L"
            onChange={(v) => updateDraft((d) => ({
              ...d,
              operational_constraints: { ...d.operational_constraints, hill_area_allowance_per_liter: v },
            }))}
          />
        </div>
      </SettingsSection>

      {/* ── 5. Financial Overview ── */}
      <SettingsSection title="Financial Overview" description="Monthly opex, debt, and equity position">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Monthly Opex */}
          <div>
            <h3 className="text-xs font-semibold text-[#2C3E50] uppercase tracking-wider mb-3">Monthly Operating Expenses</h3>
            <div className="space-y-1">
              {draft.financial?.monthly_opex && typeof draft.financial.monthly_opex === "object" && !Array.isArray(draft.financial.monthly_opex) && (
                Object.entries(draft.financial.monthly_opex as Record<string, unknown>)
                  .filter(([k]) => k !== "total")
                  .map(([key, val]) => (
                    <MetricRow
                      key={key}
                      label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      value={formatCurrency(Number(val) || 0)}
                    />
                  ))
              )}
              <MetricRow
                label="Total monthly opex"
                value={formatCurrency(
                  (draft.financial?.monthly_opex as Record<string, number>)?.total ?? 0
                )}
              />
            </div>
          </div>

          {/* Debt */}
          <div>
            <h3 className="text-xs font-semibold text-[#2C3E50] uppercase tracking-wider mb-3">Debt & Interest</h3>
            <div className="space-y-1">
              <MetricRow
                label="Term loan (monthly interest)"
                value={formatCurrency(draft.financial?.debt?.term_loan?.monthly_interest ?? 0)}
              />
              <MetricRow
                label="EDFS MCLR rate"
                value={`${draft.financial?.debt?.edfs_working_capital?.edfs_mclr_rate_pct ?? 0}%`}
              />
              <MetricRow
                label="EDFS credit days"
                value={`${draft.financial?.debt?.edfs_working_capital?.edfs_credit_days ?? 0} days`}
              />
              <MetricRow
                label="Total monthly interest"
                value={formatCurrency(draft.financial?.debt?.total_monthly_interest ?? 0)}
              />
            </div>
          </div>

          {/* Cash Invested */}
          <div>
            <h3 className="text-xs font-semibold text-[#2C3E50] uppercase tracking-wider mb-3">Capital Invested</h3>
            <div className="space-y-1">
              <MetricRow
                label="Total cash outlay"
                value={formatCurrency(draft.financial?.cash_invested?.total_cash_outlay ?? 0)}
              />
              <MetricRow
                label="Daily depreciation (non-cash)"
                value={formatCurrency(draft.financial?.depreciation?.total_daily_non_cash ?? 0)}
              />
            </div>
          </div>

          {/* Equity */}
          <div>
            <h3 className="text-xs font-semibold text-[#2C3E50] uppercase tracking-wider mb-3">Equity Position</h3>
            <div className="space-y-1">
              <MetricRow
                label="Net book equity"
                value={formatCurrency(draft.financial?.equity?.net_book_equity ?? 0)}
              />
              <MetricRow
                label="Working equity at risk"
                value={formatCurrency(draft.financial?.equity?.working_equity_at_risk ?? 0)}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* ── 6. Seasonal Adjustments ── */}
      <SettingsSection title="Seasonal Adjustments" description="Demand and cost multipliers by season">
        <div className="grid gap-4 sm:grid-cols-3">
          {draft.seasonal_adjustments && Object.entries(draft.seasonal_adjustments).map(([seasonName, season]) => {
            const monthNames = season.months.map((m) =>
              ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]
            ).join(", ");

            return (
              <div key={seasonName} className="border border-border rounded-sm p-3">
                <h3 className="text-xs font-semibold text-[#2C3E50] uppercase tracking-wider mb-2">
                  {seasonName.replace(/_/g, " ")}
                </h3>
                <p className="text-[10px] text-muted-foreground mb-3">{monthNames}</p>
                <div className="space-y-2">
                  <NumberField
                    label="Stockout multiplier"
                    value={season.stockout_multiplier}
                    onChange={(v) => updateDraft((d) => ({
                      ...d,
                      seasonal_adjustments: {
                        ...d.seasonal_adjustments,
                        [seasonName]: { ...season, stockout_multiplier: v },
                      },
                    }))}
                  />
                  <NumberField
                    label="Overstock multiplier"
                    value={season.overstock_multiplier}
                    onChange={(v) => updateDraft((d) => ({
                      ...d,
                      seasonal_adjustments: {
                        ...d.seasonal_adjustments,
                        [seasonName]: { ...season, overstock_multiplier: v },
                      },
                    }))}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SettingsSection>

      {/* ── 7. Decision Policies ── */}
      <SettingsSection title="Decision Policies" description="Order recommendation parameters (conservative, balanced, aggressive)">
        <div className="grid gap-4 sm:grid-cols-3">
          {draft.decision_parameters?.policies && Object.entries(draft.decision_parameters.policies).map(([policyName, policy]) => (
            <div
              key={policyName}
              className={`border rounded-sm p-3 ${
                policyName === "balanced"
                  ? "border-[#C47335] bg-[#C47335]/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#2C3E50] uppercase tracking-wider">{policyName}</h3>
                {policyName === "balanced" && (
                  <span className="text-[10px] bg-[#C47335] text-white px-1.5 py-0.5 rounded-sm font-medium">Default</span>
                )}
              </div>
              {policy.description && (
                <p className="text-[10px] text-muted-foreground mb-3 italic">{policy.description}</p>
              )}
              <div className="space-y-2">
                <NumberField
                  label="Quantile target"
                  value={policy.quantile_target}
                  onChange={(v) => updateDraft((d) => ({
                    ...d,
                    decision_parameters: {
                      ...d.decision_parameters,
                      policies: {
                        ...d.decision_parameters!.policies,
                        [policyName]: { ...policy, quantile_target: v },
                      },
                    },
                  }))}
                />
                <NumberField
                  label="Safety buffer"
                  value={policy.safety_buffer_liters}
                  suffix="L"
                  onChange={(v) => updateDraft((d) => ({
                    ...d,
                    decision_parameters: {
                      ...d.decision_parameters,
                      policies: {
                        ...d.decision_parameters!.policies,
                        [policyName]: { ...policy, safety_buffer_liters: v },
                      },
                    },
                  }))}
                />
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* ── Global Save ── */}
      <div className="flex justify-end pb-8">
        <button onClick={saveAll} disabled={saving} className="btn-pill px-8">
          {saving ? "Saving all changes..." : "Save all changes"}
        </button>
      </div>
    </div>
  );
}
