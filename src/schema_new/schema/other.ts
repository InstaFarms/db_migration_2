import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

import { adminUpdateReference, timestamps } from "./shared.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== EXTRA PLANS ========================

export const extraPlans = pgTable(
  "extraPlans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    description: text("description"),
    price: integer("price").notNull(),
    category: text("category"),
    isActive: boolean("isActive").default(true),
    terms: text("terms"),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    check("extra_plan_price_positive", sql`"price" >= 0`),
    index("extra_plans_name_idx").on(table.name),
    index("extra_plans_is_active_idx").on(table.isActive),
  ]
);
