import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { brands } from "./brand.ts";
import { adminUpdateReference, timestamps } from "./shared.ts";
import { properties } from "./property.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== COLLECTIONS ========================

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    description: text("description"),
    heading: text("heading"),
    slug: text("slug"),
    weight: integer("weight").default(0).notNull(),
    hpc: integer("hpc"),
    logo: text("logo"),
    altText: text("altText"),
    isActive: boolean("isActive").default(true).notNull(),
    meta: jsonb("meta")
      .default(sql`'{}'::jsonb`)
      .$type<{
        metaTitle?: string;
        metaDescription?: string;
        metaUrl?: string;
        metaImage?: string;
      }>(),
    faqs: jsonb("faqs")
      .$type<any[]>()
      .default(sql`'[]'::jsonb`)
      .$type<
        {
          question: string;
          answer: string;
          isActive: boolean;
          weight: number;
        }[]
      >(),
    info: jsonb("info").$type<
      {
        title: string;
        content: string;
        isPublished: boolean;
      }[]
    >(),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    unique("collections_brand_slug_unique").on(table.brandId, table.slug),
    unique("collections_brand_name_unique").on(table.brandId, table.name),
    index("collections_brand_id_idx").on(table.brandId),
  ]
);

// ==================== COLLECTION PROPERTIES ==============

export const collectionProperties = pgTable(
  "collectionProperties",
  {
    collectionId: uuid("collectionId")
      .references(() => collections.id, {
        onDelete: "cascade",
      })
      .notNull(),
    propertyId: uuid("propertyId")
      .references(() => properties.id, {
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [primaryKey({ columns: [table.collectionId, table.propertyId] })]
);
