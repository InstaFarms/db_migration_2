import { date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { brands } from "./brand.ts";
import { timestamps, adminUpdateReference } from "./shared.ts";
import { customers } from "./customer.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== PROPOSALS ==========================

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  status: text("status").notNull().default("DRAFT"),
  validTill: timestamp("validTill", { withTimezone: true, mode: "string" }),
  brandId: uuid("brandId").references(() => brands.id, { onDelete: "cascade" }),
  customerId: uuid("customerId").references(() => customers.id, { onDelete: "cascade" }),
  checkinDate: date("checkinDate"),
  checkoutDate: date("checkoutDate"),
  adultCount: integer("adultCount").default(0),
  childrenCount: integer("childrenCount").default(0),
  infantCount: integer("infantCount").default(0),
  floatingAdultCount: integer("floatingAdultCount").default(0),
  floatingChildrenCount: integer("floatingChildrenCount").default(0),
  floatingInfantCount: integer("floatingInfantCount").default(0),
  notes: text("notes"),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== PROPOSAL ITEMS =====================

export const proposalItems = pgTable(
  "proposalItems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proposalId: uuid("proposalId")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("proposal_items_proposal_id_idx").on(table.proposalId)]
);
