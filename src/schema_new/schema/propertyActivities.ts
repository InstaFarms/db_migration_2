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

// ==================== ACTIVITIES =========================

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  icon: text("icon").notNull(),
  weight: integer("weight"),
  isPaid: boolean("isPaid").notNull().default(false),
  isUSP: boolean("isUSP").notNull().default(false),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== ACTIVITIES ON PROPERTIES ===========

export const activitiesOnProperties = pgTable(
  "activitiesOnProperties",
  {
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    activityId: uuid("activityId")
      .notNull()
      .references(() => activities.id, {
        onDelete: "cascade",
      }),
    weight: integer("weight"),
    ...adminOrUserUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.propertyId, table.activityId] }),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
