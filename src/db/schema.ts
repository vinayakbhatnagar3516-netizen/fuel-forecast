import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  jsonb,
  boolean,
  integer,
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
