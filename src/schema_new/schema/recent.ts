import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { properties } from "./property.ts";
import { brands } from "./brand.ts";
import { timestamps } from "./shared.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== RECENTLY VISITED ==================

export const recentlyVisited = pgTable(
  "recentlyVisited",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    userIdentifier: text("userIdentifier").notNull(),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    visitedAt: timestamp("visitedAt", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
    ...timestamps,
  },
  (table) => [
    index("recentlyVisited_brand_id_idx").on(table.brandId),
    index("recentlyVisited_userIdentifier_idx").on(table.userIdentifier),
    index("recentlyVisited_visitedAt_idx").on(table.visitedAt),
    unique("recentlyVisited_userIdentifier_propertyId_brandId_unique").on(
      table.userIdentifier,
      table.propertyId,
      table.brandId
    ),
  ]
);

// ==================== RECENT SEARCHES ===================

export const recentSearches = pgTable(
  "recentSearches",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    userIdentifier: text("userIdentifier").notNull(),
    location: text("location"),
    checkInDate: date("checkInDate", { mode: "string" }),
    checkOutDate: date("checkOutDate", { mode: "string" }),
    adults: integer("adults").default(0),
    children: integer("children").default(0),
    infants: integer("infants").default(0),
    pets: integer("pets").default(0),
    searchedAt: timestamp("searchedAt", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
    ...timestamps,
  },
  (table) => [
    index("recentSearches_brand_id_idx").on(table.brandId),
    index("recentSearches_userIdentifier_idx").on(table.userIdentifier),
    index("recentSearches_searchedAt_idx").on(table.searchedAt),
  ]
);
