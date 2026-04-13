import {
  boolean,
  index,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  adminPermissionKeyOptions,
  adminPanelRoleOptions,
} from "../types.ts";
import { adminUpdateReference, genderEnum, timestamps } from "./shared.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const adminPanelRoleEnum = pgEnum(
  "adminPanelRole",
  adminPanelRoleOptions
);

export const adminPermissionKeyEnum = pgEnum(
  "adminPermissionKey",
  adminPermissionKeyOptions
);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== ADMINS =============================

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("firstName").notNull(),
  lastName: varchar("lastName"),
  email: varchar("email").unique().notNull(),
  phoneNumber: varchar("phoneNumber").unique().notNull(),
  panelRole: adminPanelRoleEnum("panelRole").notNull().default("OPS_TEAM"),
  gender: genderEnum("gender"),
  whatsappNumber: varchar("whatsappNumber"),
  alternateContact: varchar("alternateContact"),
  addressDetails: json("addressDetails").default({}),
  loginAt: timestamp("loginAt", { withTimezone: true, mode: "string" }),
  logoutAt: timestamp("logoutAt", { withTimezone: true, mode: "string" }),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== ADMIN PERMISSIONS ==================

export const adminPermissions = pgTable(
  "adminPermissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: adminPermissionKeyEnum("key").notNull().unique(),
    label: varchar("label", { length: 120 }).notNull(),
    description: text("description"),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    index("admin_permissions_key_idx").on(table.key),
    index("admin_permissions_active_idx").on(table.isActive),
  ]
);

// ==================== ADMIN ROLE PERMISSIONS ============

export const adminRolePermissions = pgTable(
  "adminRolePermissions",
  {
    role: adminPanelRoleEnum("role").notNull(),
    permissionId: uuid("permissionId")
      .notNull()
      .references(() => adminPermissions.id, { onDelete: "cascade" }),
    canView: boolean("canView").notNull().default(false),
    canEdit: boolean("canEdit").notNull().default(false),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.role, table.permissionId] }),
    index("admin_role_permissions_permission_id_idx").on(table.permissionId),
    index("admin_role_permissions_role_idx").on(table.role),
  ]
);
