import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  jsonb,
  boolean,
  integer,
  date,
} from "drizzle-orm/pg-core";

/**
 * Tenants (petrol pump organizations)
 * Maps 1:1 with a Clerk Organization
 */
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  onboardedAt: timestamp("onboarded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Pump stations — one organization can have multiple stations
 */
export const pumpStations = pgTable("pump_stations", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  locationLat: decimal("location_lat", { precision: 8, scale: 5 }),
  locationLng: decimal("location_lng", { precision: 8, scale: 5 }),
  altitudeM: integer("altitude_m"),
  fuelTypes: text("fuel_types").array().default(["Petrol", "High-Speed Diesel"]),
  tankCapacity: jsonb("tank_capacity_liters").$type<{
    Petrol?: number;
    "High-Speed Diesel"?: number;
  }>(),
  tankerCapacity: decimal("tanker_capacity_liters").default("40000"),
  leadTimeDays: integer("lead_time_days").default(3),
  dataSource: text("data_source").default("manual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Pilot user feedback
 */
export const pilotFeedback = pgTable("pilot_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id),
  userId: text("user_id").notNull(),
  rating: integer("rating"), // 1-5
  comment: text("comment"),
  page: text("page"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Usage tracking
 */
export const usageEvents = pgTable("usage_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id),
  userId: text("user_id").notNull(),
  event: text("event").notNull(), // 'page_view', 'forecast_run', etc.
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Forecast Data Tables ──
// These mirror the Docker PostgreSQL tables from the ML inference pipeline.

/**
 * Daily quantile forecasts — the core prediction output
 * Fuel types: 'combined' | 'Petrol' | 'High-Speed Diesel'
 */
export const dailyForecastQuantiles = pgTable("daily_forecast_quantiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  forecastDate: date("forecast_date").notNull(),
  q05: decimal("q05", { precision: 10, scale: 2 }),
  q25: decimal("q25", { precision: 10, scale: 2 }),
  q50: decimal("q50", { precision: 10, scale: 2 }),
  q75: decimal("q75", { precision: 10, scale: 2 }),
  q95: decimal("q95", { precision: 10, scale: 2 }),
  forecastPoint: decimal("forecast_point", { precision: 10, scale: 2 }),
  fuelType: text("fuel_type").notNull().default("combined"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Daily financial summary — P&L projections per fuel type
 */
export const dailyFinancialSummary = pgTable("daily_financial_summary", {
  id: uuid("id").defaultRandom().primaryKey(),
  forecastDate: date("forecast_date").notNull(),
  fuelType: text("fuel_type").notNull().default("combined"),
  expectedDailyProfit: decimal("expected_daily_profit", { precision: 12, scale: 2 }),
  expectedMonthlyProfit: decimal("expected_monthly_profit", { precision: 12, scale: 2 }),
  pLoss: decimal("p_loss", { precision: 6, scale: 4 }),
  var5: decimal("var5", { precision: 12, scale: 2 }),
  cvar5: decimal("cvar5", { precision: 12, scale: 2 }),
  stockoutRiskScore: decimal("stockout_risk_score", { precision: 4, scale: 2 }),
  daysToMinStock: decimal("days_to_min_stock", { precision: 5, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Daily order recommendations — 3 policies (conservative, balanced, aggressive)
 */
export const dailyOrderRecommendation = pgTable("daily_order_recommendation", {
  id: uuid("id").defaultRandom().primaryKey(),
  forecastDate: date("forecast_date").notNull(),
  policy: text("policy").notNull(), // 'conservative' | 'balanced' | 'aggressive'
  reorderPoint: decimal("reorder_point", { precision: 10, scale: 2 }).default("0"),
  recommendedOrder: decimal("recommended_order", { precision: 10, scale: 2 }).default("0"),
  orderQuantity: decimal("order_quantity", { precision: 10, scale: 2 }).default("40000"),
  expectedCost: decimal("expected_cost", { precision: 12, scale: 2 }).default("0"),
  pStockout: decimal("p_stockout", { precision: 5, scale: 4 }).default("0"),
  fuelType: text("fuel_type").notNull().default("combined"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
