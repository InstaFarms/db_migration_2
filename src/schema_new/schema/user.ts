import {
  boolean,
  check,
  index,
  json,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { BankDetail } from "../types.ts";
import {
  adminOrUserUpdateReference,
  genderEnum,
  settlementTimingEnum,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";
import { properties } from "./property.ts";

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
    isPropertyGSTRegistered: boolean("isPropertyGSTRegistered").notNull().default(false),
    propertyGSTNumber: varchar("propertyGSTNumber", { length: 256 }),
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.ownerId, table.propertyId] }),
    check(
      "owners_on_properties_gst_flag_number_consistency",
      sql`(
        (${table.isPropertyGSTRegistered} = false AND ${table.propertyGSTNumber} IS NULL)
        OR
        (${table.isPropertyGSTRegistered} = true AND length(trim(${table.propertyGSTNumber})) > 0)
      )`
    ),
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


