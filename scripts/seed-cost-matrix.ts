/**
 * Seed the cost matrix table in Neon with data from the Python project config.
 *
 * Run: npx tsx scripts/seed-cost-matrix.ts
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { costMatrix, type CostMatrixData } from "../src/db/schema";

/** Snapshot of config/cost_matrix.json as a typed object */
const defaultCostMatrix: CostMatrixData = {
  pump_name: "Kandaghat-Chail Jio-BP",
  location: { latitude: 31.022, longitude: 77.137 },
  costs: {
    stockout_cost_per_liter: {
      value: 8.2,
      description: "Lost commission + customer attrition per liter of unmet demand",
      components: { lost_commission: 3.2, customer_attrition: 5.0 },
    },
    overstock_cost_per_liter_per_day: {
      value: 0.5,
      description: "Daily carrying cost per excess liter",
      components: { storage_space: 0.15, capital_cost: 0.05, product_degradation: 0.15, handling: 0.15 },
    },
    cost_per_order: {
      value: 500.0,
      description: "Fixed transaction + delivery cost per order",
    },
  },
  seasonal_adjustments: {
    summer_peak: {
      months: [3, 4, 5, 6],
      stockout_multiplier: 1.5,
      overstock_multiplier: 1.1,
      notes: "Summer tourist season (Chail peak Apr-Jun). Stockout 1.5× costlier.",
    },
    monsoon_period: {
      months: [7, 8, 9],
      stockout_multiplier: 1.3,
      overstock_multiplier: 0.9,
      notes: "Monsoon = harder emergency deliveries, fewer transient tourists.",
    },
    shoulder_winter: {
      months: [10, 11, 12, 1, 2],
      stockout_multiplier: 1.0,
      overstock_multiplier: 1.0,
      notes: "Post-peak / winter = baseline costs.",
    },
  },
  by_fuel_grade: {
    Petrol: {
      commission_per_liter: 3.2,
      tank_capacity_liters: 30000,
      purchase_price_per_liter: 94.5,
      stockout_cost_per_liter: 8.2,
      overstock_cost_per_liter_per_day: 0.5,
      contractual_min_annual_liters: 600000,
      evaporation_loss_pct: 0.0055,
      max_order_size: 30000,
      notes: "30KL dedicated tank. Tourist demand peak in summer.",
    },
    "High-Speed Diesel": {
      commission_per_liter: 2.8,
      tank_capacity_liters: 24000,
      purchase_price_per_liter: 87.5,
      stockout_cost_per_liter: 7.8,
      overstock_cost_per_liter_per_day: 0.4,
      contractual_min_annual_liters: 480000,
      evaporation_loss_pct: 0.004,
      max_order_size: 24000,
      notes: "24KL dedicated tank. Steady floriculture logistics demand.",
    },
  },
  operational_constraints: {
    tank_capacity_liters: 54000,
    tanker_capacity_liters: 40000,
    order_lead_time_days: 3,
    hill_area_allowance_per_liter: 0.15,
    min_order_size: 1000,
    max_order_size: 54000,
  },
  financial: {
    monthly_opex: {
      staff_salaries: 90000,
      electricity: 15000,
      maintenance: 10000,
      miscellaneous: 10000,
      total: 115000,
    },
    non_fuel_monthly_income: {
      base_value: 20000,
      value: 20000,
      seasonal_multipliers: { tourist_peak: 2.5, monsoon: 1.2, normal: 0.7, winter: 0.5 },
    },
    debt: {
      term_loan: { principal: 3000000, interest_rate_pct: 9.0, monthly_interest: 22500 },
      edfs_working_capital: { edfs_mclr_rate_pct: 9.5, edfs_credit_days: 7 },
      total_monthly_interest: 37500,
    },
    cash_invested: {
      foundation_civil: 4000000,
      dealership_license_fees: 1500000,
      omc_equipment_tanks_dispensers: 7000000,
      total_cash_outlay: 12500000,
    },
    depreciation: {
      foundation_civil: { cost: 4000000, life_years: 30, method: "straight_line", monthly_depreciation: 11111, daily_depreciation: 365 },
      dealership_license: { cost: 1500000, life_years: 15, method: "straight_line", monthly_amortization: 8333, daily_amortization: 274 },
      total_monthly_non_cash: 19444,
      total_daily_non_cash: 639,
    },
    equity: {
      total_assets_owned: 11000000,
      term_loan_principal: 3000000,
      net_book_equity: 8000000,
      less_land_value: 5500000,
      working_equity_at_risk: 2500000,
    },
  },
  decision_parameters: {
    risk_aversion: 0.7,
    policies: {
      conservative: { quantile_target: 0.75, safety_buffer_liters: 50, description: "Order at 75th percentile + safety margin" },
      balanced: { quantile_target: 0.5, safety_buffer_liters: 0, description: "Minimize expected cost" },
      aggressive: { quantile_target: 0.5, safety_buffer_liters: -50, description: "Order at 50th percentile, maximize cash flow" },
    },
  },
};

async function main() {
  const existing = await db.select({ id: costMatrix.id }).from(costMatrix).limit(1);

  if (existing.length > 0) {
    console.log("Updating existing cost matrix...");
    await db.update(costMatrix).set({ data: defaultCostMatrix, updatedAt: new Date() }).where(eq(costMatrix.id, existing[0].id));
    console.log("✅ Cost matrix updated");
  } else {
    console.log("Inserting default cost matrix...");
    await db.insert(costMatrix).values({ data: defaultCostMatrix });
    console.log("✅ Cost matrix seeded");
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
