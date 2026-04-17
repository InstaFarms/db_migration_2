import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  index,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  platformLedgerCategoryOptions,
  platformLedgerEntryTypeOptions,
  platformLedgerReferenceTypeOptions,
} from "../types.ts";
import { brands } from "./brand.ts";
import { bookings } from "./booking.ts";
import { properties } from "./property.ts";
import { users } from "./user.ts";
import { timestamps } from "./shared.ts";

export const platformLedgerReferenceTypeEnum = pgEnum(
  "platformLedgerReferenceType",
  platformLedgerReferenceTypeOptions
);

export const platformLedgerEntryTypeEnum = pgEnum(
  "platformLedgerEntryType",
  platformLedgerEntryTypeOptions
);

export const platformLedgerCategoryEnum = pgEnum(
  "platformLedgerCategory",
  platformLedgerCategoryOptions
);

export const platformLedger = pgTable(
  "platform_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, {
        onDelete: "restrict",
      }),

    referenceType: platformLedgerReferenceTypeEnum("reference_type").notNull(),
    referenceId: uuid("reference_id").notNull(),

    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    propertyId: uuid("property_id").references(() => properties.id, {
      onDelete: "set null",
    }),
    ownerId: uuid("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),

    entryType: platformLedgerEntryTypeEnum("entry_type").notNull(),

    amountExclCommissionGst: real("amount_excl_commission_gst").notNull().default(0),
    commissionGstRate: integer("commission_gst_rate"),
    commissionGstAmount: real("commission_gst_amount").notNull().default(0),
    amountInclCommissionGst: real("amount_incl_commission_gst").notNull().default(0),
    effectiveCommissionRateExclGst: real("effective_commission_rate_excl_gst"),

    currency: text("currency").notNull().default("INR"),
    category: platformLedgerCategoryEnum("category").notNull(),
    isOwnerGstRegistered: boolean("is_owner_gst_registered").notNull().default(false),

    description: text("description"),
    metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),

    accountingDate: date("accounting_date", { mode: "string" }).notNull(),

    ...timestamps,
  },
  (table) => [
    index("platform_ledger_brand_id_idx").on(table.brandId),
    index("platform_ledger_reference_type_idx").on(table.referenceType),
    index("platform_ledger_reference_id_idx").on(table.referenceId),
    index("platform_ledger_booking_id_idx").on(table.bookingId),
    index("platform_ledger_property_id_idx").on(table.propertyId),
    index("platform_ledger_owner_id_idx").on(table.ownerId),
    index("platform_ledger_entry_type_idx").on(table.entryType),
    index("platform_ledger_category_idx").on(table.category),
    index("platform_ledger_accounting_date_idx").on(table.accountingDate),
    index("platform_ledger_created_at_idx").on(table.createdAt),

    check(
      "platform_ledger_amount_excl_non_negative",
      sql`${table.amountExclCommissionGst} >= 0`
    ),
    check(
      "platform_ledger_commission_gst_rate_valid",
      sql`${table.commissionGstRate} IS NULL OR ${table.commissionGstRate} IN (5, 18, 28)`
    ),
    check(
      "platform_ledger_commission_gst_amount_non_negative",
      sql`${table.commissionGstAmount} >= 0`
    ),
    check(
      "platform_ledger_amount_incl_non_negative",
      sql`${table.amountInclCommissionGst} >= 0`
    ),
    check(
      "platform_ledger_amount_formula_valid",
      sql`${table.amountInclCommissionGst} = (${table.amountExclCommissionGst} + ${table.commissionGstAmount})`
    ),
    check(
      "platform_ledger_effective_rate_valid",
      sql`${table.effectiveCommissionRateExclGst} IS NULL OR (${table.effectiveCommissionRateExclGst} >= 0 AND ${table.effectiveCommissionRateExclGst} <= 100)`
    ),
    check(
      "platform_ledger_currency_not_empty",
      sql`length(trim(${table.currency})) > 0`
    ),
    check(
      "platform_ledger_reference_consistent",
      sql`(
        (${table.referenceType} = 'BOOKING' AND ${table.bookingId} IS NOT NULL)
        OR
        (${table.referenceType} <> 'BOOKING')
      )`
    ),
  ]
);
