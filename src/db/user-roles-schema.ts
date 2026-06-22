import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

/**
 * User roles and waitlist status
 * - Everyone starts as "waitlisted" on sign-up
 * - vinayakbhatnagar3516@gmail.com is auto-promoted to "admin"
 * - Admin can approve waitlisted users to "member"
 */
export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "member", "waitlisted"] })
    .notNull()
    .default("waitlisted"),
  isActive: boolean("is_active").default(true),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserRole = "admin" | "member" | "waitlisted";
