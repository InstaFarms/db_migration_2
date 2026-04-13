import { sql } from "drizzle-orm";
import type { ColumnBaseConfig, ColumnDataType } from "drizzle-orm";
import {
  auditSectionOptions,
  auditStatusOptions,
  auditTypeOptions,
  conditionStatusOptions,
  itemTypeOptions,
  mediaTypeOptions,
  photoRequirementTypeOptions,
  quantityStatusOptions,
  supervisorRoleOptions,
  ticketPriorityOptions,
  ticketStatusOptions,
} from "../types.ts";
import {
  boolean,
  check,
  ExtraConfigColumn,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { adminUpdateReference, timestamps } from "./shared.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const supervisorRoleEnum = pgEnum("supervisorRole", supervisorRoleOptions);

export const itemTypeEnum = pgEnum("itemType", itemTypeOptions);

export const photoRequirementTypeEnum = pgEnum(
  "photoRequirementType",
  photoRequirementTypeOptions
);

export const auditTypeEnum = pgEnum("auditType", auditTypeOptions);

export const auditStatusEnum = pgEnum("auditStatus", auditStatusOptions);

export const quantityStatusEnum = pgEnum("quantityStatus", quantityStatusOptions);

export const conditionStatusEnum = pgEnum("conditionStatus", conditionStatusOptions);

export const mediaTypeEnum = pgEnum("mediaType", mediaTypeOptions);

export const auditSectionEnum = pgEnum("auditSection", auditSectionOptions);

export const ticketPriorityEnum = pgEnum("ticketPriority", ticketPriorityOptions);

export const ticketStatusEnum = pgEnum("ticketStatus", ticketStatusOptions);

// =========================================================
// =========================================================
// ================= SHARED REFERENCES =====================
// =========================================================
// =========================================================

export const adminOrSupervisorUpdateReference = {
  supervisorCreatedBy: uuid("supervisorCreatedBy"),
  supervisorUpdatedBy: uuid("supervisorUpdatedBy").$onUpdateFn(() => sql`null`),
  adminCreatedBy: uuid("adminCreatedBy"),
  adminUpdatedBy: uuid("adminUpdatedBy").$onUpdateFn(() => sql`null`),
};

type UpdateRefColType = ExtraConfigColumn<
  ColumnBaseConfig<ColumnDataType, string>
>;

export const setSupervisorOrAdminUpdatedByConstraint = (table: {
  supervisorCreatedBy: UpdateRefColType;
  supervisorUpdatedBy: UpdateRefColType;
  adminCreatedBy: UpdateRefColType;
  adminUpdatedBy: UpdateRefColType;
}) =>
  check(
    "supadmin_updateref_constraint",
    sql`(${table.adminCreatedBy} IS NOT NULL OR ${table.supervisorCreatedBy} IS NOT NULL) AND (${table.adminUpdatedBy} IS NOT NULL OR ${table.supervisorUpdatedBy} IS NOT NULL)`
  );

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== SUPERVISORS ========================

export const supervisors = pgTable("supervisors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").unique().notNull(),
  email: text("email").unique().notNull(),
  role: supervisorRoleEnum("role").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== MASTERS ============================

export const propertyAuditAreaCategoryMaster = pgTable(
  "propertyAuditAreaCategoryMaster",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    weight: integer("weight").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
  }
);

export const checklistCategoryMaster = pgTable("checklistCategoryMaster", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  itemType: itemTypeEnum("itemType").notNull(),
  weight: integer("weight").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  ...timestamps,
  ...adminUpdateReference,
});

export const issueTypes = pgTable("issueTypes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").unique().notNull(),
  label: text("label").notNull(),
  description: text("description"),
  isActive: boolean("isActive").notNull().default(true),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== AUDIT TABLES =======================

export const propertyAuditAreas = pgTable("propertyAuditAreas", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("propertyId")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  areaCategoryId: uuid("areaCategoryId")
    .notNull()
    .references(() => propertyAuditAreaCategoryMaster.id),
  areaName: text("areaName").notNull(),
  weight: integer("weight").notNull(),
  isSystemArea: boolean("isSystemArea").notNull().default(false),
  isActive: boolean("isActive").notNull().default(true),
  ...timestamps,
  ...adminUpdateReference,
});

export const checklistItemMaster = pgTable("checklistItemMaster", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  itemType: itemTypeEnum("itemType").notNull(),
  categoryId: uuid("categoryId")
    .notNull()
    .references(() => checklistCategoryMaster.id),
  defaultPhotoRequirementType: photoRequirementTypeEnum(
    "defaultPhotoRequirementType"
  ).notNull(),
  isActive: boolean("isActive").notNull().default(true),
  ...timestamps,
  ...adminUpdateReference,
});

export const inventoryChecklistItems = pgTable("inventoryChecklistItems", {
  id: uuid("id").primaryKey().defaultRandom(),
  checklistItemMasterId: uuid("checklistItemMasterId")
    .notNull()
    .references(() => checklistItemMaster.id),
  propertyAuditAreaId: uuid("propertyAuditAreaId")
    .notNull()
    .references(() => propertyAuditAreas.id, { onDelete: "cascade" }),
  expectedQuantity: integer("expectedQuantity").notNull(),
  requiredThreshold: integer("requiredThreshold").notNull(),
  criticalThreshold: integer("criticalThreshold").notNull(),
  photoRequirementType: photoRequirementTypeEnum("photoRequirementType").notNull(),
  weight: integer("weight").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  ...timestamps,
  ...adminUpdateReference,
});

export const suppliesChecklistItems = pgTable("suppliesChecklistItems", {
  id: uuid("id").primaryKey().defaultRandom(),
  checklistItemMasterId: uuid("checklistItemMasterId")
    .notNull()
    .references(() => checklistItemMaster.id),
  propertyAuditAreaId: uuid("propertyAuditAreaId")
    .notNull()
    .references(() => propertyAuditAreas.id, { onDelete: "cascade" }),
  expectedQuantity: integer("expectedQuantity").notNull(),
  requiredThreshold: integer("requiredThreshold").notNull(),
  criticalThreshold: integer("criticalThreshold").notNull(),
  photoRequirementType: photoRequirementTypeEnum("photoRequirementType").notNull(),
  weight: integer("weight").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  ...timestamps,
  ...adminUpdateReference,
});

export const maintenanceChecklistItems = pgTable("maintenanceChecklistItems", {
  id: uuid("id").primaryKey().defaultRandom(),
  checklistItemMasterId: uuid("checklistItemMasterId")
    .notNull()
    .references(() => checklistItemMaster.id),
  propertyAuditAreaId: uuid("propertyAuditAreaId")
    .notNull()
    .references(() => propertyAuditAreas.id, { onDelete: "cascade" }),
  photoRequirementType: photoRequirementTypeEnum("photoRequirementType").notNull(),
  weight: integer("weight").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  ...timestamps,
  ...adminUpdateReference,
});

export const propertyAuditSessions = pgTable(
  "propertyAuditSessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    supervisorId: uuid("supervisorId")
      .notNull()
      .references(() => supervisors.id),
    auditType: auditTypeEnum("auditType").notNull(),
    status: auditStatusEnum("status").notNull(),
    startedAt: timestamp("startedAt", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completedAt", { withTimezone: true, mode: "string" }),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
  },
  (table) => [setSupervisorOrAdminUpdatedByConstraint(table)]
);

export const inventoryAuditChecklistItems = pgTable(
  "inventoryAuditChecklistItems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditSessionId: uuid("auditSessionId")
      .notNull()
      .references(() => propertyAuditSessions.id, { onDelete: "cascade" }),
    inventoryChecklistItemId: uuid("inventoryChecklistItemId")
      .notNull()
      .references(() => inventoryChecklistItems.id),
    observedQuantity: integer("observedQuantity").notNull(),
    quantityStatus: quantityStatusEnum("quantityStatus").notNull(),
    varianceReason: text("varianceReason"),
    conditionStatus: conditionStatusEnum("conditionStatus"),
    issueTypeId: uuid("issueTypeId").references(() => issueTypes.id),
    notes: text("notes"),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
  },
  (table) => [setSupervisorOrAdminUpdatedByConstraint(table)]
);

export const suppliesAuditChecklistItems = pgTable(
  "suppliesAuditChecklistItems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditSessionId: uuid("auditSessionId")
      .notNull()
      .references(() => propertyAuditSessions.id, { onDelete: "cascade" }),
    suppliesChecklistItemId: uuid("suppliesChecklistItemId")
      .notNull()
      .references(() => suppliesChecklistItems.id),
    observedQuantity: integer("observedQuantity").notNull(),
    quantityStatus: quantityStatusEnum("quantityStatus").notNull(),
    issueTypeId: uuid("issueTypeId").references(() => issueTypes.id),
    notes: text("notes"),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
  },
  (table) => [setSupervisorOrAdminUpdatedByConstraint(table)]
);

export const maintenanceAuditChecklistItems = pgTable(
  "maintenanceAuditChecklistItems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditSessionId: uuid("auditSessionId")
      .notNull()
      .references(() => propertyAuditSessions.id, { onDelete: "cascade" }),
    maintenanceChecklistItemId: uuid("maintenanceChecklistItemId")
      .notNull()
      .references(() => maintenanceChecklistItems.id),
    conditionStatus: conditionStatusEnum("conditionStatus").notNull(),
    issueTypeId: uuid("issueTypeId").references(() => issueTypes.id),
    notes: text("notes"),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
  },
  (table) => [setSupervisorOrAdminUpdatedByConstraint(table)]
);

export const checklistItemMedia = pgTable(
  "checklistItemMedia",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditSessionId: uuid("auditSessionId")
      .notNull()
      .references(() => propertyAuditSessions.id, { onDelete: "cascade" }),
    inventoryAuditChecklistItemId: uuid("inventoryAuditChecklistItemId").references(
      () => inventoryAuditChecklistItems.id
    ),
    suppliesAuditChecklistItemId: uuid("suppliesAuditChecklistItemId").references(
      () => suppliesAuditChecklistItems.id
    ),
    maintenanceAuditChecklistItemId: uuid(
      "maintenanceAuditChecklistItemId"
    ).references(() => maintenanceAuditChecklistItems.id),
    mediaType: mediaTypeEnum("mediaType").notNull(),
    mediaUrl: text("mediaUrl").notNull(),
    uploadedBy: uuid("uploadedBy")
      .notNull()
      .references(() => supervisors.id),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
  },
  (table) => [setSupervisorOrAdminUpdatedByConstraint(table)]
);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    auditSessionId: uuid("auditSessionId")
      .notNull()
      .references(() => propertyAuditSessions.id),
    auditSection: auditSectionEnum("auditSection").notNull(),
    referenceChecklistRecordId: uuid("referenceChecklistRecordId").notNull(),
    priority: ticketPriorityEnum("priority").notNull(),
    status: ticketStatusEnum("status").notNull().default("OPEN"),
    assignedTo: uuid("assignedTo")
      .notNull()
      .references(() => supervisors.id),
    resolvedAt: timestamp("resolvedAt", { withTimezone: true, mode: "string" }),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
  },
  (table) => [setSupervisorOrAdminUpdatedByConstraint(table)]
);

export const ticketResolutionLogs = pgTable(
  "ticketResolutionLogs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticketId")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    resolutionNotes: text("resolutionNotes").notNull(),
    supervisorResolvedBy: uuid("supervisorResolvedBy").references(
      () => supervisors.id
    ),
    adminResolvedBy: uuid("adminResolvedBy"),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
  },
  (table) => [setSupervisorOrAdminUpdatedByConstraint(table)]
);
