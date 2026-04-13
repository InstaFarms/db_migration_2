import { sql } from "drizzle-orm";
import {
  check,
  pgEnum,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { genderOptions, settlementTimingOptions } from "../types.ts";
import type { UpdateRefColType } from "../types.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const genderEnum = pgEnum("gender", genderOptions);

export const settlementTimingEnum = pgEnum(
  "settlementTiming",
  settlementTimingOptions
);

// =========================================================
// =========================================================
// =============== SHARED COLUMN REFERENCES ================
// =========================================================
// =========================================================

export const timestamps = {
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
};

export const adminUpdateReference = {
  adminCreatedBy: uuid("adminCreatedBy").notNull(),
  adminUpdatedBy: uuid("adminUpdatedBy")
    .$onUpdateFn(() => sql`null`)
    .notNull(),
};

export const adminOrUserUpdateReference = {
  createdBy: uuid("createdBy"),
  updatedBy: uuid("updatedBy").$onUpdateFn(() => sql`null`),
  adminCreatedBy: uuid("adminCreatedBy"),
  adminUpdatedBy: uuid("adminUpdatedBy").$onUpdateFn(() => sql`null`),
};

// =========================================================
// =========================================================
// ================= CONSTRAINT HELPERS ====================
// =========================================================
// =========================================================

export const setUserOrAdminUpdatedByConstraint = (table: {
  createdBy: UpdateRefColType;
  updatedBy: UpdateRefColType;
  adminCreatedBy: UpdateRefColType;
  adminUpdatedBy: UpdateRefColType;
}) =>
  check(
    "updateref_constraint",
    sql`(${table.adminCreatedBy} IS NOT NULL OR ${table.createdBy} IS NOT NULL) AND (${table.adminUpdatedBy} IS NOT NULL OR ${table.updatedBy} IS NOT NULL)`
  );
