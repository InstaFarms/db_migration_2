import {
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import {
  adminOrUserUpdateReference,
  adminUpdateReference,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== SAFETY HYGIENE =====================

export const safetyHygiene = pgTable("safetyHygiene", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  icon: text("icon"),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== SAFETY HYGIENE ON PROPERTIES =======

export const safetyHygieneOnProperties = pgTable(
  "safetyHygieneOnProperties",
  {
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    safetyHygieneId: uuid("safetyHygieneId")
      .notNull()
      .references(() => safetyHygiene.id, {
        onDelete: "cascade",
      }),
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.safetyHygieneId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
