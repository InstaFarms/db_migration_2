import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { adminOrUserUpdateReference, setUserOrAdminUpdatedByConstraint, timestamps } from "./shared.ts";
import { bookings } from "./booking.ts";
import { customers } from "./customer.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== REVIEWS ============================

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
      .references(() => properties.id, {
        onDelete: "cascade",
      })
      .notNull(),
    bookingId: uuid("bookingId")
      .references(() => bookings.id, {
        onDelete: "cascade",
      })
      .unique()
      .notNull(),
    customerId: uuid("customerId")
      .references(() => customers.id, {
        onDelete: "cascade",
      })
      .notNull(),
    staffServiceRating: integer("staffServiceRating"),
    ambienceRating: integer("ambienceRating"),
    roomMaintenanceRating: integer("roomMaintenanceRating"),
    outdoorMaintenanceRating: integer("outdoorMaintenanceRating"),
    lawnMaintenanceRating: integer("lawnMaintenanceRating"),
    poolMaintenanceRating: integer("poolMaintenanceRating"),
    extraMattressesLinenRating: integer("extraMattressesLinenRating"),
    overallRating: integer("overallRating").notNull(),
    comment: text("comment"),
    isVerified: boolean("isVerified").default(false).notNull(),
    stayDuration: integer("stayDuration"),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check(
      "staff_service_rating_valid",
      sql`"staffServiceRating" IS NULL OR ("staffServiceRating" >= 1 AND "staffServiceRating" <= 5)`
    ),
    check(
      "ambience_rating_valid",
      sql`"ambienceRating" IS NULL OR ("ambienceRating" >= 1 AND "ambienceRating" <= 5)`
    ),
    check(
      "room_maintenance_rating_valid",
      sql`"roomMaintenanceRating" IS NULL OR ("roomMaintenanceRating" >= 1 AND "roomMaintenanceRating" <= 5)`
    ),
    check(
      "outdoor_maintenance_rating_valid",
      sql`"outdoorMaintenanceRating" IS NULL OR ("outdoorMaintenanceRating" >= 1 AND "outdoorMaintenanceRating" <= 5)`
    ),
    check(
      "lawn_maintenance_rating_valid",
      sql`"lawnMaintenanceRating" IS NULL OR ("lawnMaintenanceRating" >= 1 AND "lawnMaintenanceRating" <= 5)`
    ),
    check(
      "pool_maintenance_rating_valid",
      sql`"poolMaintenanceRating" IS NULL OR ("poolMaintenanceRating" >= 1 AND "poolMaintenanceRating" <= 5)`
    ),
    check(
      "extra_mattresses_linen_rating_valid",
      sql`"extraMattressesLinenRating" IS NULL OR ("extraMattressesLinenRating" >= 1 AND "extraMattressesLinenRating" <= 5)`
    ),
    check("overall_rating_valid", sql`"overallRating" >= 1 AND "overallRating" <= 5`),
    check("stay_duration_positive", sql`"stayDuration" > 0`),
    index("reviews_property_id_idx").on(table.propertyId),
    index("reviews_customer_id_idx").on(table.customerId),
    index("reviews_overall_rating_idx").on(table.overallRating),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== REVIEW MAGIC LINKS =================

export const reviewMagicLinks = pgTable(
  "reviewMagicLinks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .references(() => bookings.id, {
        onDelete: "cascade",
      })
      .notNull()
      .unique(),
    customerId: uuid("customerId")
      .references(() => customers.id, {
        onDelete: "cascade",
      })
      .notNull(),
    propertyId: uuid("propertyId").references(() => properties.id, {
      onDelete: "cascade",
    }),
    shortCode: text("shortCode").notNull().unique(),
    tokenHash: text("tokenHash").notNull().unique(),
    expiresAt: timestamp("expiresAt", {
      mode: "string",
      withTimezone: true,
    }).notNull(),
    usedAt: timestamp("usedAt", {
      mode: "string",
      withTimezone: true,
    }),
    ...timestamps,
  },
  (table) => [
    index("review_magic_links_customer_id_idx").on(table.customerId),
    index("review_magic_links_property_id_idx").on(table.propertyId),
    index("review_magic_links_short_code_idx").on(table.shortCode),
    index("review_magic_links_expires_at_idx").on(table.expiresAt),
    index("review_magic_links_used_at_idx").on(table.usedAt),
  ]
);
