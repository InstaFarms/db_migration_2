import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import {
  gstRecordEntryDirectionOptions,
  gstRecordLiabilityHolderOptions,
  gstRecordReferenceTypeOptions,
  gstRecordTypeOptions,
  tdsRecordEntryTypeOptions,
  tdsRecordReferenceTypeOptions,
} from "../types.ts";
import { bookings } from "./booking.ts";
import { brands } from "./brand.ts";
import { properties } from "./property.ts";
import { users } from "./user.ts";
import { time } from "console";
import { timestamps } from "./shared.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const tdsRecordReferenceTypeEnum = pgEnum(
  "tdsRecordReferenceType",
  tdsRecordReferenceTypeOptions
);

export const tdsRecordEntryTypeEnum = pgEnum("tdsRecordEntryType", tdsRecordEntryTypeOptions);

export const gstRecordTypeEnum = pgEnum("gstRecordType", gstRecordTypeOptions);

export const gstRecordReferenceTypeEnum = pgEnum(
  "gstRecordReferenceType",
  gstRecordReferenceTypeOptions
);

export const gstRecordLiabilityHolderEnum = pgEnum(
  "gstRecordLiabilityHolder",
  gstRecordLiabilityHolderOptions
);

export const gstRecordEntryDirectionEnum = pgEnum(
  "gstRecordEntryDirection",
  gstRecordEntryDirectionOptions
);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== TDS RECORDS ========================

export const tdsRecords = pgTable(
  "tds_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, {
        onDelete: "restrict",
      }),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, {
        onDelete: "restrict",
      }),

    referenceType: tdsRecordReferenceTypeEnum("reference_type").notNull(),
    referenceId: text("reference_id").notNull(),

    baseAmount: real("base_amount").notNull(),
    tdsRate: real("tds_rate").notNull(),
    tdsBaseAmount: real("tds_base_amount").notNull(),
    tdsAmount: real("tds_amount").notNull(),

    currency: text("currency").notNull().default("INR"),
    entryType: tdsRecordEntryTypeEnum("entry_type").notNull(),

    stayMonth: integer("stay_month").notNull(),
    stayYear: integer("stay_year").notNull(),
    taxEventMonth: integer("tax_event_month").notNull(),
    taxEventYear: integer("tax_event_year").notNull(),

    remarks: text("remarks"),
    metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),

    ...timestamps,
  },
  (table) => [
    check("tds_records_base_amount_non_negative", sql`${table.baseAmount} >= 0`),
    check("tds_records_tds_rate_valid", sql`${table.tdsRate} >= 0 AND ${table.tdsRate} <= 1`),
    check("tds_records_tds_base_non_negative", sql`${table.tdsBaseAmount} >= 0`),
    check("tds_records_tds_amount_non_negative", sql`${table.tdsAmount} >= 0`),
    check("tds_records_currency_not_empty", sql`length(trim(${table.currency})) > 0`),
    check("tds_records_stay_month_valid", sql`${table.stayMonth} BETWEEN 1 AND 12`),
    check("tds_records_tax_event_month_valid", sql`${table.taxEventMonth} BETWEEN 1 AND 12`),
    check("tds_records_stay_year_valid", sql`${table.stayYear} >= 2000`),
    check("tds_records_tax_event_year_valid", sql`${table.taxEventYear} >= 2000`),

    index("tds_records_brand_id_idx").on(table.brandId),
    index("tds_records_booking_id_idx").on(table.bookingId),
    index("tds_records_owner_id_idx").on(table.ownerId),
    index("tds_records_property_id_idx").on(table.propertyId),
    index("tds_records_reference_type_idx").on(table.referenceType),
    index("tds_records_reference_id_idx").on(table.referenceId),
    index("tds_records_entry_type_idx").on(table.entryType),
    index("tds_records_tax_event_year_month_idx").on(table.taxEventYear, table.taxEventMonth),
    index("tds_records_stay_year_month_idx").on(table.stayYear, table.stayMonth),
    index("tds_records_created_at_idx").on(table.createdAt),
  ]
);

// ==================== GST RECORDS ========================

export const gstRecords = pgTable(
  "gst_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, {
        onDelete: "restrict",
      }),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, {
        onDelete: "restrict",
      }),

    gstType: gstRecordTypeEnum("gst_type").notNull(),
    referenceType: gstRecordReferenceTypeEnum("reference_type").notNull(),
    referenceId: text("reference_id").notNull(),

    taxableAmountExclGst: real("taxable_amount_excl_gst").notNull(),
    gstRate: real("gst_rate").notNull(),
    gstAmount: real("gst_amount").notNull(),
    currency: text("currency").notNull().default("INR"),

    isOwnerGstRegistered: boolean("is_owner_gst_registered").notNull().default(false),
    liabilityHolder: gstRecordLiabilityHolderEnum("liability_holder").notNull(),
    entryDirection: gstRecordEntryDirectionEnum("entry_direction").notNull(),
    sacCode: text("sac_code"),

    bookingMonth: integer("booking_month").notNull(),
    bookingYear: integer("booking_year").notNull(),
    taxEventMonth: integer("tax_event_month").notNull(),
    taxEventYear: integer("tax_event_year").notNull(),

    ...timestamps,
  },
  (table) => [
    check(
      "gst_records_taxable_amount_non_negative",
      sql`${table.taxableAmountExclGst} >= 0`
    ),
    check("gst_records_gst_rate_valid", sql`${table.gstRate} >= 0 AND ${table.gstRate} <= 100`),
    check("gst_records_gst_amount_non_negative", sql`${table.gstAmount} >= 0`),
    check("gst_records_currency_not_empty", sql`length(trim(${table.currency})) > 0`),
    check("gst_records_booking_month_valid", sql`${table.bookingMonth} BETWEEN 1 AND 12`),
    check("gst_records_tax_event_month_valid", sql`${table.taxEventMonth} BETWEEN 1 AND 12`),
    check("gst_records_booking_year_valid", sql`${table.bookingYear} >= 2000`),
    check("gst_records_tax_event_year_valid", sql`${table.taxEventYear} >= 2000`),

    index("gst_records_booking_id_idx").on(table.bookingId),
    index("gst_records_owner_id_idx").on(table.ownerId),
    index("gst_records_property_id_idx").on(table.propertyId),
    index("gst_records_brand_id_idx").on(table.brandId),
    index("gst_records_gst_type_idx").on(table.gstType),
    index("gst_records_reference_type_idx").on(table.referenceType),
    index("gst_records_reference_id_idx").on(table.referenceId),
    index("gst_records_liability_holder_idx").on(table.liabilityHolder),
    index("gst_records_entry_direction_idx").on(table.entryDirection),
    index("gst_records_tax_event_year_month_idx").on(table.taxEventYear, table.taxEventMonth),
    index("gst_records_booking_year_month_idx").on(table.bookingYear, table.bookingMonth),
    index("gst_records_created_at_idx").on(table.createdAt),
  ]
);
