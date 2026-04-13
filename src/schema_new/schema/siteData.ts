import { sql } from "drizzle-orm";
import {
  staticImageSectionOptions,
} from "../types.ts";
import {
  boolean,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { properties } from "./property.ts";
import { photos } from "./propertyPhoto.ts";
import { brands } from "./brand.ts";
import {
  adminOrUserUpdateReference,
  adminUpdateReference,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const staticImageSectionEnum = pgEnum(
  "staticImageSection",
  staticImageSectionOptions
);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== STATIC IMAGES ======================

export const staticImages = pgTable(
  "staticImages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    section: staticImageSectionEnum("section").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    desktopImageUrl: text("desktopImageUrl").notNull(),
    desktopImagePath: text("desktopImagePath").notNull(),
    mobileImageUrl: text("mobileImageUrl").notNull(),
    mobileImagePath: text("mobileImagePath").notNull(),
    altText: text("altText"),
    linkUrl: text("linkUrl"),
    sortOrder: integer("sortOrder").default(0),
    isActive: boolean("isActive").default(true),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    index("static_images_brand_id_idx").on(table.brandId),
    index("static_images_section_idx").on(table.section),
    index("static_images_sort_order_idx").on(table.sortOrder),
    index("static_images_is_active_idx").on(table.isActive),
  ]
);

// ==================== FAQS ===============================

export const faqs = pgTable(
  "faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    category: text("category"),
    weight: integer("weight").default(0),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [setUserOrAdminUpdatedByConstraint(table)]
);

// ==================== CMS ================================

export const cms = pgTable(
  "cms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    title: text("title").unique().notNull(),
    heading: text("heading").notNull(),
    subHeading: text("subHeading"),
    content: text("content").notNull(),
    slug: text("slug").notNull(),
    photo: uuid("photo").references(() => photos.id),
    isActive: boolean("isActive").default(true),
    meta: jsonb("meta")
      .default(sql`'{}'::jsonb`)
      .$type<{
        metaTitle: string;
        metaDescription: string;
        metaUrl: string;
        metaImage: string;
      }>(),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    unique("cms_brand_slug_unique").on(table.brandId, table.slug),
    index("cms_brand_id_idx").on(table.brandId),
  ]
);

// ==================== CAROUSEL ===========================

export const carousel = pgTable(
  "carousel",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    heading: text("heading").notNull(),
    subHeading: text("subHeading"),
    weight: integer("weight").default(0),
    property: uuid("propertyId").references(() => properties.id),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [index("carousel_brand_id_idx").on(table.brandId)]
);

// ==================== SINGLE PAGES =======================

export const singlePages = pgTable(
  "singlePages ",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    oldId: text("oldId").unique(),
    oldFaqId: text("oldFaqId").unique(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    meta: jsonb("meta")
      .default(sql`'{}'::jsonb`)
      .$type<{
        metaTitle?: string;
        metaDescription?: string;
        metaUrl?: string;
        metaImage?: string;
      }>(),
    isFaqsEnabled: boolean("isFaqsEnabled").default(false),
    faqs: jsonb("faqs")
      .$type<
        | {
            question: string;
            answer: string;
            isActive: boolean;
            weight: number;
          }[]
        | null
      >()
      .default(sql`'null'::jsonb`),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    unique("single_pages_brand_slug_unique").on(table.brandId, table.slug),
    index("single_pages_brand_id_idx").on(table.brandId),
  ]
);

// ==================== CAROUSEL PHOTOS ====================

export const carouselPhotos = pgTable(
  "carouselPhotos",
  {
    carouselId: uuid("carouselId")
      .references(() => carousel.id, {
        onDelete: "cascade",
      })
      .notNull(),
    photoId: uuid("photoId")
      .references(() => photos.id, {
        onDelete: "cascade",
      })
      .notNull(),
    key: text("key").notNull(),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.carouselId, table.photoId] }),
    index("carousel_photos_carousel_id_idx").on(table.carouselId),
    index("carousel_photos_photo_id_idx").on(table.photoId),
  ]
);

// ==================== SETTINGS ===========================

export const settings = pgTable(
  "settings",
  {
    id: text("id").notNull(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    value: json("value"),
    description: text("description"),
    watermarkUrl: text("watermarkUrl"),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [
    primaryKey({ columns: [table.id, table.brandId] }),
    index("settings_brand_id_idx").on(table.brandId),
  ]
);

// ==================== GLOBAL CONSTANTS ===================

export const globalConstants = pgTable(
  "globalConstants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
    description: text("description"),
    dataType: text("dataType").notNull().default("string"),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    index("global_constants_key_idx").on(table.key),
    index("global_constants_is_active_idx").on(table.isActive),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
