import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { photoCategoryOptions } from "../types.ts";
import {
  adminOrUserUpdateReference,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";
import { propertyBrandMappings } from "./property.ts";

// =========================================================
// ======================= ENUMS ===========================
// =========================================================

export const photoCategoryEnum = pgEnum("photoCategory", photoCategoryOptions);

// =========================================================
// ======================== TABLES =========================
// =========================================================

// ==================== PHOTOS =============================

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name"),

    originalUrl: text("originalUrl").notNull(),
    blurHash: text("blurHash"),

    fileSize: integer("fileSize"),
    mimeType: text("mimeType"),
    width: integer("width"),
    height: integer("height"),
    aspectRatio: numeric("aspectRatio", { precision: 4, scale: 2 }),

    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check(
      "photos_original_url_not_empty",
      sql`length(trim(${table.originalUrl})) > 0`
    ),

    check(
      "photos_file_size_non_negative",
      sql`${table.fileSize} IS NULL OR ${table.fileSize} >= 0`
    ),

    check(
      "photos_width_positive",
      sql`${table.width} IS NULL OR ${table.width} > 0`
    ),

    check(
      "photos_height_positive",
      sql`${table.height} IS NULL OR ${table.height} > 0`
    ),

    check(
      "photos_aspect_ratio_positive",
      sql`${table.aspectRatio} IS NULL OR ${table.aspectRatio} > 0`
    ),

    check(
      "photos_width_height_both_or_none",
      sql`(
        (${table.width} IS NULL AND ${table.height} IS NULL) OR
        (${table.width} IS NOT NULL AND ${table.height} IS NOT NULL)
      )`
    ),

    index("photos_original_url_idx").on(table.originalUrl),
    index("photos_mime_type_idx").on(table.mimeType),

    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ============ PHOTO PROPERTY BRAND MAPPING ===============

export const photoPropertyBrandMapping = pgTable(
  "photoPropertyBrandMapping",
  {
    photoId: uuid("photoId")
      .notNull()
      .references(() => photos.id, {
        onDelete: "cascade",
      }),

    propertyBrandMappingId: uuid("propertyBrandMappingId")
      .notNull()
      .references(() => propertyBrandMappings.id, {
        onDelete: "cascade",
      }),

    watermarkedUrl: text("watermarkedUrl").notNull(),
    altText: text("altText"),

    category: photoCategoryEnum("category").notNull().default("OTHERS"),
    sortOrder: integer("sortOrder").notNull(),
    isFeatured: boolean("isFeatured").notNull().default(false),

    ...timestamps,
  },
  (table) => [
    primaryKey({
      columns: [table.photoId, table.propertyBrandMappingId],
    }),

    unique("photo_property_brand_category_sort_unique").on(
      table.propertyBrandMappingId,
      table.category,
      table.sortOrder
    ),

    index("photo_property_brand_mapping_property_brand_id_idx").on(
      table.propertyBrandMappingId
    ),

    index("photo_property_brand_mapping_photo_id_idx").on(table.photoId),

    index("photo_property_brand_mapping_brand_category_sort_idx").on(
      table.propertyBrandMappingId,
      table.category,
      table.sortOrder
    ),

    index("photo_property_brand_mapping_brand_featured_idx").on(
      table.propertyBrandMappingId,
      table.isFeatured
    ),

    check(
      "photo_property_brand_watermarked_url_not_empty",
      sql`length(trim(${table.watermarkedUrl})) > 0`
    ),

    check(
      "photo_property_brand_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`
    ),
  ]
);