import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
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

// ==================== COUPONS ============================

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    code: text("code").notNull(),
    discountPercentage: decimal("discountPercentage", {
      precision: 5,
      scale: 2,
    }),
    flatDiscount: integer("flatDiscount"),
    maxDiscountAmount: integer("maxDiscountAmount").notNull(),
    minOrderValue: integer("minOrderValue").notNull().default(0),
    newUsersOnly: boolean("newUsersOnly").default(false),
    applicableDays: jsonb("applicableDays").$type<string[]>(),
    isActive: boolean("isActive").default(true),
    usedCount: integer("usedCount").default(0).notNull(),
    validFrom: timestamp("validFrom", { precision: 6 }).notNull(),
    validUntil: timestamp("validUntil", { precision: 6 }).notNull(),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check(
      "discount_percentage_valid",
      sql`"discountPercentage" IS NULL OR ("discountPercentage" > 0 AND "discountPercentage" <= 100)`
    ),
    check("max_discount_amount_positive", sql`"maxDiscountAmount" >= 0`),
    check("min_order_value_positive", sql`"minOrderValue" >= 0`),
    check(
      "flat_or_percentage",
      sql`("flatDiscount" IS NOT NULL AND "discountPercentage" IS NULL) OR ("flatDiscount" IS NULL AND "discountPercentage" IS NOT NULL)`
    ),
    check("valid_until_after_from", sql`"validUntil" > "validFrom"`),
    unique("coupons_brand_code_unique").on(table.brandId, table.code),
    index("coupons_code_idx").on(table.code),
    index("coupons_brand_id_idx").on(table.brandId),
    index("coupons_is_active_idx").on(table.isActive),
  ]
);

// ==================== PROPERTY COUPONS ===================

export const propertyCoupons = pgTable(
  "propertyCoupons",
  {
    propertyId: uuid("propertyId").references(() => properties.id).notNull(),
    couponId: uuid("couponId").references(() => coupons.id).notNull(),
    allowed: boolean("allowed").notNull().default(true),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.couponId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
