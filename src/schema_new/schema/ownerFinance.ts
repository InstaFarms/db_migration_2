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
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import {
  ownerPayoutAttemptStatusOptions,
  ownerPayoutGatewayOptions,
  ledgerDirectionOptions,
  ownerPayoutMethodOptions,
  ownerSettlementAdjustmentDirectionOptions,
  ownerSettlementAdjustmentTypeOptions,
  ownerSettlementStatusOptions,
  ownerWalletLedgerComponentTypeOptions,
  ownerWalletLedgerReferenceTypeOptions,
  ownerPayoutStatusOptions,
} from "../types.ts";
import { adminOrUserUpdateReference, timestamps } from "./shared.ts";
import { bookings } from "./booking.ts";
import { brands } from "./brand.ts";
import { properties } from "./property.ts";
import { bankDetails, users } from "./user.ts";
import { time } from "console";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const ownerWalletLedgerReferenceTypeEnum = pgEnum(
  "ownerWalletLedgerReferenceType",
  ownerWalletLedgerReferenceTypeOptions
);

export const ownerWalletLedgerComponentTypeEnum = pgEnum(
  "ownerWalletLedgerComponentType",
  ownerWalletLedgerComponentTypeOptions
);

export const ledgerDirectionEnum = pgEnum("ledgerDirection", ledgerDirectionOptions);

export const ownerPayoutStatusEnum = pgEnum(
  "ownerPayoutStatus",
  ownerPayoutStatusOptions
);
export const ownerPayoutMethodEnum = pgEnum(
  "ownerPayoutMethod",
  ownerPayoutMethodOptions
);
export const ownerPayoutGatewayEnum = pgEnum(
  "ownerPayoutGateway",
  ownerPayoutGatewayOptions
);
export const ownerPayoutAttemptStatusEnum = pgEnum(
  "ownerPayoutAttemptStatus",
  ownerPayoutAttemptStatusOptions
);
export const ownerSettlementStatusEnum = pgEnum(
  "ownerSettlementStatus",
  ownerSettlementStatusOptions
);
export const ownerSettlementAdjustmentTypeEnum = pgEnum(
  "ownerSettlementAdjustmentType",
  ownerSettlementAdjustmentTypeOptions
);
export const ownerSettlementAdjustmentDirectionEnum = pgEnum(
  "ownerSettlementAdjustmentDirection",
  ownerSettlementAdjustmentDirectionOptions
);

// Backward-compat alias
export const ownerWalletLedgerTypeEnum = ownerWalletLedgerComponentTypeEnum;

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== OWNER WALLET =======================

export const ownerWallet = pgTable(
  "owner_wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .unique()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    currentBalance: real("current_balance").notNull().default(0),
    currency: text("currency").notNull().default("INR"),
    lastUpdatedAt: timestamp("last_updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
    
    ...timestamps,
    ...adminOrUserUpdateReference
  },
  (table) => [
    check(
      "owner_wallet_current_balance_non_negative",
      sql`${table.currentBalance} >= 0`
    ),
    check(
      "owner_wallet_currency_not_empty",
      sql`length(trim(${table.currency})) > 0`
    ),
    index("owner_wallet_owner_id_idx").on(table.ownerId),
    index("owner_wallet_currency_idx").on(table.currency),
    index("owner_wallet_last_updated_at_idx").on(table.lastUpdatedAt),
  ]
);

// ==================== OWNER WALLET LEDGER ===============

export const ownerWalletLedger = pgTable(
  "owner_wallet_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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

    referenceType: ownerWalletLedgerReferenceTypeEnum("reference_type").notNull(),
    referenceId: text("reference_id").notNull(),

    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),

    entryType: ledgerDirectionEnum("entry_type").notNull(),
    amount: real("amount").notNull(),
    currency: text("currency").notNull().default("INR"),

    componentType: ownerWalletLedgerComponentTypeEnum("component_type").notNull(),
    description: text("description"),
    metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),

    accountingDate: date("accounting_date", { mode: "string" }).notNull(),

    ...timestamps,
    ...adminOrUserUpdateReference
  },
  (table) => [
    check("owner_wallet_ledger_amount_positive", sql`${table.amount} > 0`),
    check(
      "owner_wallet_ledger_currency_not_empty",
      sql`length(trim(${table.currency})) > 0`
    ),

    index("owner_wallet_ledger_owner_id_idx").on(table.ownerId),
    index("owner_wallet_ledger_property_id_idx").on(table.propertyId),
    index("owner_wallet_ledger_brand_id_idx").on(table.brandId),
    index("owner_wallet_ledger_reference_type_idx").on(table.referenceType),
    index("owner_wallet_ledger_reference_id_idx").on(table.referenceId),
    index("owner_wallet_ledger_booking_id_idx").on(table.bookingId),
    index("owner_wallet_ledger_entry_type_idx").on(table.entryType),
    index("owner_wallet_ledger_component_type_idx").on(table.componentType),
    index("owner_wallet_ledger_accounting_date_idx").on(table.accountingDate),
    index("owner_wallet_ledger_created_at_idx").on(table.createdAt),
  ]
);

// ==================== OWNER PAYOUTS ======================

export const ownerPayouts = pgTable(
  "owner_payouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, {
        onDelete: "restrict",
      }),
    payoutReferenceCode: text("payout_reference_code").notNull().unique(),
    payoutAmount: real("payout_amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    status: ownerPayoutStatusEnum("status").notNull().default("INITIATED"),
    payoutMethod: ownerPayoutMethodEnum("payout_method").notNull(),
    bankAccountId: uuid("bank_account_id").references(() => bankDetails.id, {
      onDelete: "set null",
    }),
    upiId: text("upi_id"),
    requestedAt: timestamp("requested_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    processedAt: timestamp("processed_at", {
      withTimezone: true,
      mode: "string",
    }),
    remarks: text("remarks"),
    ...timestamps,
    ...adminOrUserUpdateReference
  },
  (table) => [
    check("owner_payout_amount_positive", sql`${table.payoutAmount} > 0`),
    check(
      "owner_payout_currency_not_empty",
      sql`length(trim(${table.currency})) > 0`
    ),
    check(
      "owner_payout_method_details_consistent",
      sql`(
        (${table.payoutMethod} = 'BANK_TRANSFER' AND ${table.bankAccountId} IS NOT NULL AND ${table.upiId} IS NULL)
        OR
        (${table.payoutMethod} = 'UPI' AND ${table.bankAccountId} IS NULL AND ${table.upiId} IS NOT NULL)
        OR
        (${table.payoutMethod} = 'MANUAL' AND ${table.bankAccountId} IS NULL AND ${table.upiId} IS NULL)
      )`
    ),
    index("owner_payouts_brand_id_idx").on(table.brandId),
    index("owner_payouts_owner_id_idx").on(table.ownerId),
    index("owner_payouts_status_idx").on(table.status),
    index("owner_payouts_method_idx").on(table.payoutMethod),
    index("owner_payouts_reference_code_idx").on(table.payoutReferenceCode),
    index("owner_payouts_requested_at_idx").on(table.requestedAt),
    index("owner_payouts_processed_at_idx").on(table.processedAt),
  ]
);

// ==================== OWNER PAYOUT ATTEMPTS =============

export const ownerPayoutAttempts = pgTable(
  "owner_payout_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    payoutId: uuid("payout_id")
      .notNull()
      .references(() => ownerPayouts.id, {
        onDelete: "cascade",
      }),
    attemptNumber: integer("attempt_number").notNull(),
    attemptAmount: real("attempt_amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    payoutGateway: ownerPayoutGatewayEnum("payout_gateway").notNull(),
    gatewayReferenceId: text("gateway_reference_id"),
    status: ownerPayoutAttemptStatusEnum("status").notNull(),
    failureReason: text("failure_reason"),
    attemptedAt: timestamp("attempted_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    ...timestamps,
    ...adminOrUserUpdateReference
  },
  (table) => [
    unique("owner_payout_attempts_payout_attempt_unique").on(
      table.payoutId,
      table.attemptNumber
    ),
    check("owner_payout_attempt_attempt_number_positive", sql`${table.attemptNumber} > 0`),
    check("owner_payout_attempt_amount_positive", sql`${table.attemptAmount} > 0`),
    check(
      "owner_payout_attempt_currency_not_empty",
      sql`length(trim(${table.currency})) > 0`
    ),
    check(
      "owner_payout_attempt_failure_reason_consistent",
      sql`(
        (${table.status} = 'FAILED' AND ${table.failureReason} IS NOT NULL)
        OR
        (${table.status} = 'SUCCESS' AND ${table.failureReason} IS NULL)
      )`
    ),
    index("owner_payout_attempts_payout_id_idx").on(table.payoutId),
    index("owner_payout_attempts_status_idx").on(table.status),
    index("owner_payout_attempts_gateway_idx").on(table.payoutGateway),
    index("owner_payout_attempts_attempted_at_idx").on(table.attemptedAt),
    index("owner_payout_attempts_created_at_idx").on(table.createdAt),
  ]
);

// ==================== OWNER SETTLEMENT ===================

export const ownerSettlement = pgTable(
  "owner_settlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, {
        onDelete: "restrict",
      }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, {
        onDelete: "restrict",
      }),

    bookingAmountExclBookingGst: real("booking_amount_excl_booking_gst")
      .notNull()
      .default(0),
    bookingGstAmount: real("booking_gst_amount").notNull().default(0),

    totalAdjustmentsExclGst: real("total_adjustments_excl_gst").notNull().default(0),
    totalAdjustmentsGstAmount: real("total_adjustments_gst_amount").notNull().default(0),
    totalAdjustmentsInclGst: real("total_adjustments_incl_gst").notNull().default(0),

    effectiveRevenueExclGst: real("effective_revenue_excl_gst").notNull().default(0),
    commissionRateExclGst: real("commission_rate_excl_gst").notNull().default(0),
    commissionAmountExclCommissionGst: real("commission_amount_excl_commission_gst")
      .notNull()
      .default(0),
    commissionGst: real("commission_gst").notNull().default(0),
    commissionAmountInclCommissionGst: real("commission_amount_incl_commission_gst")
      .notNull()
      .default(0),

    ownerPayoutExclGst: real("owner_payout_excl_gst").notNull().default(0),
    tdsRate: real("tds_rate").notNull().default(0),
    tdsAmount: real("tds_amount").notNull().default(0),
    netPayableToOwner: real("net_payable_to_owner").notNull().default(0),

    cancellationFee: real("cancellation_fee").notNull().default(0),
    refundAmount: real("refund_amount").notNull().default(0),
    goodwillAdjustment: real("goodwill_adjustment").notNull().default(0),

    isOwnerGstRegistered: boolean("is_owner_gst_registered").notNull().default(false),
    status: ownerSettlementStatusEnum("status").notNull().default("PENDING"),

    ...timestamps,
    ...adminOrUserUpdateReference
  },
  (table) => [
    check(
      "owner_settlement_booking_amount_non_negative",
      sql`${table.bookingAmountExclBookingGst} >= 0`
    ),
    check("owner_settlement_booking_gst_non_negative", sql`${table.bookingGstAmount} >= 0`),
    check(
      "owner_settlement_total_adjustments_incl_formula_valid",
      sql`${table.totalAdjustmentsInclGst} = (${table.totalAdjustmentsExclGst} + ${table.totalAdjustmentsGstAmount})`
    ),
    check(
      "owner_settlement_effective_revenue_formula_valid",
      sql`${table.effectiveRevenueExclGst} = (${table.bookingAmountExclBookingGst} + ${table.totalAdjustmentsExclGst})`
    ),
    check(
      "owner_settlement_commission_rate_valid",
      sql`${table.commissionRateExclGst} >= 0 AND ${table.commissionRateExclGst} <= 100`
    ),
    check(
      "owner_settlement_commission_excl_non_negative",
      sql`${table.commissionAmountExclCommissionGst} >= 0`
    ),
    check("owner_settlement_commission_gst_non_negative", sql`${table.commissionGst} >= 0`),
    check(
      "owner_settlement_commission_incl_formula_valid",
      sql`${table.commissionAmountInclCommissionGst} = (${table.commissionAmountExclCommissionGst} + ${table.commissionGst})`
    ),
    check("owner_settlement_tds_rate_valid", sql`${table.tdsRate} >= 0 AND ${table.tdsRate} <= 1`),
    check("owner_settlement_tds_amount_non_negative", sql`${table.tdsAmount} >= 0`),
    check("owner_settlement_cancellation_fee_non_negative", sql`${table.cancellationFee} >= 0`),
    check("owner_settlement_refund_amount_non_negative", sql`${table.refundAmount} >= 0`),
    check(
      "owner_settlement_owner_payout_formula_valid",
      sql`${table.ownerPayoutExclGst} = (${table.effectiveRevenueExclGst} - ${table.commissionAmountExclCommissionGst})`
    ),
    check(
      "owner_settlement_net_payable_formula_valid",
      sql`${table.netPayableToOwner} = (${table.ownerPayoutExclGst} - ${table.tdsAmount} + ${table.cancellationFee} - ${table.refundAmount} + ${table.goodwillAdjustment})`
    ),
    index("owner_settlement_booking_id_idx").on(table.bookingId),
    index("owner_settlement_property_id_idx").on(table.propertyId),
    index("owner_settlement_owner_id_idx").on(table.ownerId),
    index("owner_settlement_brand_id_idx").on(table.brandId),
    index("owner_settlement_status_idx").on(table.status),
    index("owner_settlement_created_at_idx").on(table.createdAt),
  ]
);

// ==================== OWNER SETTLEMENT ADJUSTMENTS ======

export const ownerSettlementAdjustments = pgTable(
  "owner_settlement_adjustments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    settlementId: uuid("settlement_id")
      .notNull()
      .references(() => ownerSettlement.id, {
        onDelete: "cascade",
      }),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, {
        onDelete: "restrict",
      }),

    adjustmentType: ownerSettlementAdjustmentTypeEnum("adjustment_type").notNull(),
    direction: ownerSettlementAdjustmentDirectionEnum("direction").notNull(),

    amountExclGst: real("amount_excl_gst").notNull(),
    gstRate: integer("gst_rate"),
    gstAmount: real("gst_amount").notNull().default(0),
    amountInclGst: real("amount_incl_gst").notNull(),

    description: text("description"),
    metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),

    adjustmentDate: date("adjustment_date", { mode: "string" }).notNull(),
    accountingMonth: date("accounting_month", { mode: "string" }).notNull(),

    ...timestamps,
    ...adminOrUserUpdateReference
  },
  (table) => [
    check(
      "owner_settlement_adjustments_amount_excl_positive",
      sql`${table.amountExclGst} > 0`
    ),
    check(
      "owner_settlement_adjustments_gst_rate_valid",
      sql`${table.gstRate} IS NULL OR ${table.gstRate} IN (5, 18, 28)`
    ),
    check(
      "owner_settlement_adjustments_gst_amount_non_negative",
      sql`${table.gstAmount} >= 0`
    ),
    check(
      "owner_settlement_adjustments_amount_incl_positive",
      sql`${table.amountInclGst} > 0`
    ),
    check(
      "owner_settlement_adjustments_amount_formula_valid",
      sql`${table.amountInclGst} = (${table.amountExclGst} + ${table.gstAmount})`
    ),
    check(
      "owner_settlement_adjustments_accounting_month_first_day",
      sql`EXTRACT(DAY FROM ${table.accountingMonth}) = 1`
    ),
    index("owner_settlement_adjustments_settlement_id_idx").on(table.settlementId),
    index("owner_settlement_adjustments_booking_id_idx").on(table.bookingId),
    index("owner_settlement_adjustments_owner_id_idx").on(table.ownerId),
    index("owner_settlement_adjustments_brand_id_idx").on(table.brandId),
    index("owner_settlement_adjustments_type_idx").on(table.adjustmentType),
    index("owner_settlement_adjustments_direction_idx").on(table.direction),
    index("owner_settlement_adjustments_adjustment_date_idx").on(table.adjustmentDate),
    index("owner_settlement_adjustments_accounting_month_idx").on(table.accountingMonth),
    index("owner_settlement_adjustments_created_at_idx").on(table.createdAt),
  ]
);
