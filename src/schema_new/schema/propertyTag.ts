import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

import { adminUpdateReference, timestamps } from "./shared.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== TAGS ===============================

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  color: text("color"),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== PROPERTY TAGS ======================

export const propertyTags = pgTable(
  "property_tags",
  {
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [primaryKey({ columns: [table.propertyId, table.tagId] })]
);
