import {
  boolean,
  integer,
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

// ==================== AMENITIES ==========================

export const amenities = pgTable("amenities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  icon: text("icon").notNull(),
  weight: integer("weight"),
  isPaid: boolean("isPaid").notNull().default(false),
  isUSP: boolean("isUSP").notNull().default(false),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== AMENITIES ON PROPERTIES ============

export const amenitiesOnProperties = pgTable(
  "amenitiesOnProperties",
  {
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    amenityId: uuid("amenityId")
      .notNull()
      .references(() => amenities.id, {
        onDelete: "cascade",
      }),
    weight: integer("weight"),
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.amenityId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
