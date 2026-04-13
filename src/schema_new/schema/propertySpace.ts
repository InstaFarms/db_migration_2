import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import {
  adminOrUserUpdateReference,
  adminUpdateReference,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";
import { photos } from "./propertyPhoto.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== SPACES =============================

export const spaces = pgTable("spaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== SPACE PROPERTIES ===================

export const spaceProperties = pgTable(
  "spaceProperties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
      .references(() => properties.id, {
        onDelete: "cascade",
      })
      .notNull(),
    photo: uuid("photoId").references(() => photos.id, {
      onDelete: "set null",
    }),
    name: text("name").unique().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    index("space_properties_property_id_idx").on(table.propertyId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
