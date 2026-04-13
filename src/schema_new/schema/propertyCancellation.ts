import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { cancellationPlanTypeOptions } from "../types.ts";
import {
  adminOrUserUpdateReference,
  adminUpdateReference,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";
import { brands } from "./brand.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const cancellationPlanTypes = pgEnum(
  "cancellationPlanType",
  cancellationPlanTypeOptions
);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== CANCELLATION PLANS ================

export const cancellationPlans = pgTable(
  "cancellationPlans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    isActive: boolean("isActive").default(true),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    unique("cancellation_plans_brand_name_unique").on(table.brandId, table.name),
    index("cancellation_plans_brand_id_idx").on(table.brandId),
  ]
);

// ==================== CANCELLATION PERCENTAGES ===========

export const cancellationPercentages = pgTable(
  "cancellationPercentages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cancellationPlanId: uuid("cancellationPlanId")
      .references(() => cancellationPlans.id)
      .notNull(),
    percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
    days: integer("days").notNull(),
    lessThan: boolean("lessThan").default(true),
    ...timestamps,
    ...adminUpdateReference,
  }
);

// ==================== PROPERTY CANCELLATION PLANS ========

export const propertyCancellationPlans = pgTable(
  "propertyCancellationPlans",
  {
    propertyId: uuid("propertyId")
      .references(() => properties.id, {
        onDelete: "cascade",
      })
      .notNull(),
    cancellationPlanId: uuid("cancellationPlanId")
      .references(() => cancellationPlans.id, {
        onDelete: "restrict",
      })
      .notNull(),
    type: cancellationPlanTypes("type"),
    policy: text("policy").default(""),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.cancellationPlanId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
