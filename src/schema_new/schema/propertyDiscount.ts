import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import {
  adminOrUserUpdateReference,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";
import { brands } from "./brand.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== DISCOUNT PLANS =====================

export const discountPlans = pgTable(
  "discountPlans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    unique("discount_plans_brand_name_unique").on(table.brandId, table.name),
    index("discount_plans_name_idx").on(table.name),
    index("discount_plans_brand_id_idx").on(table.brandId),
    index("discount_plans_is_active_idx").on(table.isActive),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== DISCOUNT PLAN VALUES ===============

export const discountPlansValues = pgTable(
  "discountPlansValues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    discountPlanId: uuid("discountPlanId")
      .references(() => discountPlans.id, {
        onDelete: "cascade",
      })
      .notNull(),
    minDays: integer("minDays").notNull(),
    discountPercentage: decimal("discountPercentage", {
      precision: 5,
      scale: 2,
    }),
    flatDiscount: integer("flatDiscount"),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    index("discount_plans_values_discount_plan_id_idx").on(table.discountPlanId),
    index("discount_plans_values_min_days_idx").on(table.minDays),
  ]
);

// ==================== PROPERTY DISCOUNT PLANS ============

export const propertyDiscountPlans = pgTable(
  "propertyDiscountPlans",
  {
    propertyId: uuid("propertyId")
      .references(() => properties.id, {
        onDelete: "cascade",
      })
      .notNull(),
    discountPlanId: uuid("discountPlanId")
      .references(() => discountPlans.id, {
        onDelete: "restrict",
      })
      .notNull(),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.discountPlanId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
