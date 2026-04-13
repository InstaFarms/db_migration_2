import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  BankDetail,
  ledgerDirectionOptions,
  ownerPayoutStatusOptions,
  ownerWalletLedgerTypeOptions,
  platformLedgerTypeOptions,
} from "../types.ts";
import {
  adminOrUserUpdateReference,
  genderEnum,
  settlementTimingEnum,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";
import { bookings } from "./booking.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const ownerWalletLedgerTypeEnum = pgEnum(
  "ownerWalletLedgerType",
  ownerWalletLedgerTypeOptions
);

export const ledgerDirectionEnum = pgEnum("ledgerDirection", ledgerDirectionOptions);

export const ownerPayoutStatusEnum = pgEnum(
  "ownerPayoutStatus",
  ownerPayoutStatusOptions
);

export const platformLedgerTypeEnum = pgEnum(
  "platformLedgerType",
  platformLedgerTypeOptions
);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== USERS ==============================

export const users = pgTable(
  "users",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    firstName: text("firstName"),
    lastName: text("lastName"),
    mobileNumber: varchar("mobileNumber", { length: 256 }).notNull(),
    whatsappNumber: varchar("whatsappNumber", { length: 256 }),
    email: varchar("email", { length: 256 }),
    gender: genderEnum("gender"),
    alternateContact: text("alternateContact"),
    bankAccounts: json("bankAccounts")
      .$type<BankDetail[]>()
      .notNull()
      .default([]),
    addressDetails: json("addressDetails").default({}),
    settlementTiming: settlementTimingEnum("settlementTiming")
      .notNull()
      .default("checkout"),
    settlementTime: time("settlementTime").default("22:00:00"),
    settlementEnabled: boolean("settlementEnabled").notNull().default(true),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    index("users_mobile_number_idx").on(table.mobileNumber),
    index("users_email_idx").on(table.email),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== BANK DETAILS =======================

export const bankDetails = pgTable("bankDetails", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountHolderName: text("accountHolderName").notNull(),
  accountNumber: varchar("accountNumber", { length: 32 }).notNull(),
  ifscCode: varchar("ifscCode", { length: 20 }).notNull(),
  bankName: text("bankName").notNull(),
  branch: text("branch"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============== BANK DETAILS ON PROPERTIES ===============

export const bankDetailsOnProperties = pgTable(
  "bankDetailsOnProperties",
  {
    bankDetailId: uuid("bankDetailId")
      .notNull()
      .references(() => bankDetails.id, { onDelete: "cascade" }),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bankDetailId, table.propertyId] }),
  })
);

// ============== PROPERTY USER MAPPINGS ===================

export const ownersOnProperties = pgTable(
  "ownersOnProperties",
  {
    ownerId: uuid("ownerId")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.ownerId, table.propertyId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

export const managersOnProperties = pgTable(
  "managersOnProperties",
  {
    managerId: uuid("managerId")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.managerId, table.propertyId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

export const caretakersOnProperties = pgTable(
  "caretakersOnProperties",
  {
    caretakerId: uuid("caretakerId")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.caretakerId, table.propertyId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== OWNER WALLET =======================

export const ownerWallet = pgTable(
  "ownerWallet",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("ownerId")
      .notNull()
      .unique()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    currentBalance: real("currentBalance").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    check(
      "owner_wallet_current_balance_non_negative",
      sql`${table.currentBalance} >= 0`
    ),
    index("owner_settlement_owner_id_idx").on(table.ownerId),
  ]
);

// ==================== OWNER SETTLEMENT ===================

export const ownerSettlement = pgTable(
  "ownerSettlement",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    ownerId: uuid("ownerId")
      .notNull()
      .unique()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    platformReceivedAmt: real("platformReceivedAmt").notNull().default(0),
    ownerReceivedAmt: real("ownerReceivedAmt").notNull().default(0),
    platformCommission: real("platformCommission").notNull().default(0),
    settlement: text("settlement"),
    ...timestamps,
  },
  (table) => [
    check(
      "owner_settlement_platform_amt_non_negative",
      sql`${table.platformReceivedAmt} >= 0`
    ),
    check(
      "owner_settlement_owner_amt_non_negative",
      sql`${table.ownerReceivedAmt} >= 0`
    ),
    check(
      "owner_settlement_commission_non_negative",
      sql`${table.platformCommission} >= 0`
    ),
    index("owner_settlement_booking_id_idx").on(table.bookingId),
    index("owner_wallet_owner_id_idx").on(table.ownerId),
  ]
);

// ==================== OWNER WALLET LEDGER ===============

export const ownerWalletLedger = pgTable(
  "ownerWalletLedger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    ownerId: uuid("ownerId")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    type: ownerWalletLedgerTypeEnum("type").notNull(),
    direction: ledgerDirectionEnum("direction").notNull(),
    amount: real("amount").notNull(),
    ...timestamps,
  },
  (table) => [
    check("owner_wallet_ledger_amount_positive", sql`${table.amount} > 0`),
    index("owner_wallet_ledger_booking_id_idx").on(table.bookingId),
    index("owner_wallet_ledger_owner_id_idx").on(table.ownerId),
    index("owner_wallet_ledger_type_idx").on(table.type),
    index("owner_wallet_ledger_direction_idx").on(table.direction),
  ]
);

// ==================== OWNER PAYOUTS ======================

export const ownerPayouts = pgTable(
  "ownerPayouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    amount: real("amount").notNull(),
    ownerId: uuid("ownerId")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    status: ownerPayoutStatusEnum("status").notNull().default("PENDING"),
    payoutDetail: text("payoutDetail"),
    ...timestamps,
  },
  (table) => [
    check("owner_payout_amount_positive", sql`${table.amount} > 0`),
    index("owner_payouts_owner_id_idx").on(table.ownerId),
    index("owner_payouts_status_idx").on(table.status),
  ]
);

// ==================== PLATFORM LEDGER ====================

export const platformLedger = pgTable(
  "platformLedger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    type: platformLedgerTypeEnum("type").notNull(),
    direction: ledgerDirectionEnum("direction").notNull(),
    amount: real("amount").notNull(),
    ...timestamps,
  },
  (table) => [
    check("platform_ledger_amount_positive", sql`${table.amount} > 0`),
    index("platform_ledger_booking_id_idx").on(table.bookingId),
    index("platform_ledger_type_idx").on(table.type),
    index("platform_ledger_direction_idx").on(table.direction),
  ]
);
