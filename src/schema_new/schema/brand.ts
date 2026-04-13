import { sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== BRANDS =============================

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  domain: text("domain"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
  adminCreatedBy: uuid("adminCreatedBy").notNull(),
  adminUpdatedBy: uuid("adminUpdatedBy")
    .$onUpdateFn(() => sql`null`)
    .notNull(),
});
