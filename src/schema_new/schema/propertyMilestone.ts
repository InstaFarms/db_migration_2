import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  real,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "./shared.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// =========== PROPERTY COMMISSION MILESTONES ==============

export const propertyCommissionMilestones = pgTable(
  "propertyCommissionMilestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    revenueMilestone: real("revenueMilestone").notNull(),
    milestoneCommissionPct: real("milestoneCommissionPct").notNull(),
    milestoneNumber: integer("milestoneNumber").notNull(),
    ...timestamps,
  },
  (table) => [
    check(
      "property_milestone_revenue_non_negative",
      sql`${table.revenueMilestone} >= 0`
    ),
    check(
      "property_milestone_commission_pct_valid",
      sql`${table.milestoneCommissionPct} >= 0 AND ${table.milestoneCommissionPct} <= 100`
    ),
    check("property_milestone_number_positive", sql`${table.milestoneNumber} > 0`),
    index("property_commission_milestones_property_id_idx").on(table.propertyId),
    index("property_commission_milestones_number_idx").on(table.milestoneNumber),
  ]
);

// ============= PROPERTY MILESTONE RESULTS ================

export const propertyMilestoneResults = pgTable(
  "propertyMilestoneResults",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    month: text("month").notNull(),
    revenueWithoutGst: real("revenueWithoutGst").notNull().default(0),
    revenueWithGst: real("revenueWithGst").notNull().default(0),
    achievedMilestoneNumber: integer("achievedMilestoneNumber"),
    achievedCommission: real("achievedCommission").notNull().default(0),
    chargedCommission: real("chargedCommission").notNull().default(0),
    commissionAdjustment: real("commissionAdjustment").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    check(
      "property_results_revenue_without_gst_non_negative",
      sql`${table.revenueWithoutGst} >= 0`
    ),
    check(
      "property_results_revenue_with_gst_non_negative",
      sql`${table.revenueWithGst} >= 0`
    ),
    check(
      "property_results_achieved_commission_non_negative",
      sql`${table.achievedCommission} >= 0`
    ),
    check(
      "property_results_charged_commission_non_negative",
      sql`${table.chargedCommission} >= 0`
    ),
    index("property_milestone_results_property_id_idx").on(table.propertyId),
    index("property_milestone_results_month_idx").on(table.month),
  ]
);
