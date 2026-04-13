import { sql } from "drizzle-orm";
import {
  activityLogRoleOptions,
  bulkOperationModeOptions,
  bulkOperationTypeOptions,
  tableHistoryOperationOptions,
  tableHistoryRoleOptions,
} from "../types.ts";
import {
  boolean,
  date,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { admins } from "./admin.ts";
import { brands } from "./brand.ts";
import { adminUpdateReference, timestamps } from "./shared.ts";
import { users } from "./user.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const bulkOperationTypeEnum = pgEnum(
  "bulkOperationType",
  bulkOperationTypeOptions
);

export const bulkOperationModeEnum = pgEnum(
  "bulkOperationMode",
  bulkOperationModeOptions
);

export const tableHistoryRoleEnum = pgEnum(
  "tableHistoryRoleEnum",
  tableHistoryRoleOptions
);

export const tableHistoryOperationEnum = pgEnum(
  "tableHistoryOperationEnum",
  tableHistoryOperationOptions
);

export const activityLogRoleEnum = pgEnum("activityLogRole", activityLogRoleOptions);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== TABLE HISTORY ======================

export const tableHistory = pgTable(
  "tableHistory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    operationPerformedByAdminId: uuid("operationPerformedByAdminId"),
    operationPerformedByUserId: uuid("operationPerformedByUserId"),
    affectedId: uuid("affectedId"),
    tableName: text("tableName").notNull(),
    operation: tableHistoryOperationEnum("operation").notNull(),
    data: json("data").notNull(),
  },
  (table) => [
    index("operationPerformedByAdminId").on(table.operationPerformedByAdminId),
    index("operationPerformedByUserId").on(table.operationPerformedByUserId),
    index("affectedId_idx").on(table.affectedId),
    index("tableName_idx").on(table.tableName),
    index("operation_idx").on(table.operation),
  ]
);

// ==================== BULK UPDATE LOGS ===================

export const bulkUpdateLogs = pgTable("bulkUpdateLogs", {
  id: uuid("id").primaryKey().defaultRandom(),

  brandId: uuid("brandId").references(() => brands.id, {
    onDelete: "set null",
  }),

  isAppliedToAll: boolean("isAppliedToAll").notNull().default(false),
  date: date("date", { mode: "string" }).notNull(),

  operationType: bulkOperationTypeEnum("operationType").notNull(),
  operationMode: bulkOperationModeEnum("operationMode"),
  operationValue: integer("operationValue").notNull(),

  affectedCount: integer("affectedCount"),
  status: text("status").notNull(),

  ...timestamps,
  ...adminUpdateReference,
});

// ============== PERMANENT PRICE UPDATE LOGS ==============

export const permanentPriceUpdateLogs = pgTable("permanentPriceUpdateLogs", {
  id: uuid("id").primaryKey().defaultRandom(),

  brandId: uuid("brandId").references(() => brands.id, {
    onDelete: "set null",
  }),

  adminCreatedBy: uuid("adminCreatedBy").references(() => admins.id, {
    onDelete: "set null",
  }),
  adminName: text("adminName"),

  operationType: bulkOperationTypeEnum("operationType").notNull(),
  operationValue: integer("operationValue").notNull(),
  operationMode: bulkOperationModeEnum("operationMode").notNull(),

  applicableDays: jsonb("applicableDays").$type<string[]>().notNull(),
  previousValues: jsonb("previousValues")
    .$type<Record<string, Record<string, number | null>>>()
    .notNull(),
  status: text("status").notNull().default("applied"),

  ...timestamps,
});

// ==================== ACTIVITY LOGS ======================

export const activityLogs = pgTable(
  "activityLogs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    actorType: activityLogRoleEnum("actorType").notNull(),
    adminActorId: uuid("adminActorId").references(() => admins.id),
    userActorId: uuid("userActorId").references(() => users.id),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),

    tableName: text("tableName").notNull(),
    recordId: uuid("recordId").notNull(),
    propertyId: uuid("propertyId"),

    operation: tableHistoryOperationEnum("operation").notNull(),
    actionType: text("actionType"),

    previousValues: jsonb("previousValues"),
    newValues: jsonb("newValues"),

    reason: text("reason"),
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

    ...timestamps,
  },
  (table) => [
    index("log_record_idx").on(table.tableName, table.recordId),
    index("log_property_context_idx").on(table.propertyId),
    index("log_actor_idx").on(table.adminActorId, table.userActorId),
    index("log_created_at_idx").on(table.createdAt),
  ]
);
