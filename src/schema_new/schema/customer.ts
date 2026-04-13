import { date, index, json, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { brands } from "./brand.ts";
import { genderEnum, timestamps } from "./shared.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== CUSTOMERS ==========================

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId").references(() => brands.id, {
      onDelete: "cascade",
    }),
    firstName: varchar("firstName").notNull(),
    lastName: varchar("lastName"),
    email: text("email"),
    dob: date({ mode: "string" }),
    mobileNumber: varchar("mobileNumber", { length: 20 }).notNull(),
    gender: genderEnum("gender").notNull(),
    favorites: json("favorites").$type<any[]>().default([]),
    expoPushToken: text("expoPushToken"),
    ...timestamps,
  },
  (table) => [
    index("customers_mobile_number_idx").on(table.mobileNumber),
    index("customers_email_idx").on(table.email),
  ]
);
