import { and, eq, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  jsonb,
  pgTable,
  pgView,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { brands } from "./brand.ts";
import { adminUpdateReference, timestamps } from "./shared.ts";
import type {
  BrandLocationFaq,
  BrandLocationInfo,
  BrandLocationMeta,
} from "../types.ts";

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== STATES =============================

export const states = pgTable("states", {
  id: uuid("id").primaryKey().defaultRandom(),
  state: text("state").unique().notNull(),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== CITIES =============================

export const cities = pgTable("cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  city: text("city").notNull(),
  stateId: uuid("stateId")
    .notNull()
    .references(() => states.id, {
      onDelete: "restrict",
    }),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== AREAS ==============================

export const areas = pgTable("areas", {
  id: uuid("id").primaryKey().defaultRandom(),
  area: text("area").notNull(),
  cityId: uuid("cityId").references(() => cities.id, {
    onDelete: "restrict",
  }),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== BRANDS ON STATES ===================

export const brandsOnStates = pgTable(
  "brandsOnStates",
  {
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    stateId: uuid("stateId")
      .notNull()
      .references(() => states.id, {
        onDelete: "cascade",
      }),
    slug: text("slug"),
    heading: text("heading"),
    description: text("description"),
    isActive: boolean("isActive").notNull().default(true),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull().default("0"),
    featured: boolean("featured").notNull().default(false),
    icon: text("icon"),
    faqs: jsonb("faqs").$type<BrandLocationFaq[]>().default(sql`'[]'::jsonb`),
    info: jsonb("info").$type<BrandLocationInfo>().default(sql`'{}'::jsonb`),
    meta: jsonb("meta")
      .default(sql`'{}'::jsonb`)
      .$type<BrandLocationMeta>(),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [primaryKey({ columns: [table.brandId, table.stateId] })]
);

// ==================== BRANDS ON CITIES ===================

export const brandsOnCities = pgTable(
  "brandsOnCities",
  {
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    cityId: uuid("cityId")
      .notNull()
      .references(() => cities.id, {
        onDelete: "cascade",
      }),
    slug: text("slug"),
    heading: text("heading"),
    description: text("description"),
    isActive: boolean("isActive").notNull().default(true),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull().default("0"),
    featured: boolean("featured").notNull().default(false),
    icon: text("icon"),
    faqs: jsonb("faqs").$type<BrandLocationFaq[]>().default(sql`'[]'::jsonb`),
    info: jsonb("info").$type<BrandLocationInfo>().default(sql`'{}'::jsonb`),
    meta: jsonb("meta")
      .default(sql`'{}'::jsonb`)
      .$type<BrandLocationMeta>(),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [primaryKey({ columns: [table.brandId, table.cityId] })]
);

// ==================== BRANDS ON AREAS ====================

export const brandsOnAreas = pgTable(
  "brandsOnAreas",
  {
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    areaId: uuid("areaId")
      .notNull()
      .references(() => areas.id, {
        onDelete: "cascade",
      }),
    slug: text("slug"),
    heading: text("heading"),
    description: text("description"),
    isActive: boolean("isActive").notNull().default(true),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull().default("0"),
    featured: boolean("featured").notNull().default(false),
    icon: text("icon"),
    faqs: jsonb("faqs").$type<BrandLocationFaq[]>().default(sql`'[]'::jsonb`),
    info: jsonb("info").$type<BrandLocationInfo>().default(sql`'{}'::jsonb`),
    meta: jsonb("meta")
      .default(sql`'{}'::jsonb`)
      .$type<BrandLocationMeta>(),
    ...timestamps,
    ...adminUpdateReference,
  },
  (table) => [primaryKey({ columns: [table.brandId, table.areaId] })]
);

// ==================== LANDMARKS ==========================

export const landmarks = pgTable("landmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  landmark: text("landmark").notNull(),
  slug: text("slug").unique(),
  icon: text("icon"),
  primaryAreaId: uuid("primaryAreaId")
    .notNull()
    .references(() => areas.id, {
      onDelete: "restrict",
    }),
  ...timestamps,
  ...adminUpdateReference,
}, (table) => [
  index("landmarks_primary_area_id_idx").on(table.primaryAreaId),
  index("landmarks_slug_idx").on(table.slug),
]);

// ==================== NEARBY LOCATIONS ===================

export const nearbyLocations = pgTable("nearbyLocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  areaId: uuid("areaId")
    .notNull()
    .references(() => areas.id, {
      onDelete: "restrict",
    }),
  nearbyAreaId1: uuid("nearbyAreaId1").references(() => areas.id, {
    onDelete: "restrict",
  }),
  nearbyAreaId2: uuid("nearbyAreaId2").references(() => areas.id, {
    onDelete: "restrict",
  }),
  nearbyAreaId3: uuid("nearbyAreaId3").references(() => areas.id, {
    onDelete: "restrict",
  }),
  nearbyAreaId4: uuid("nearbyAreaId4").references(() => areas.id, {
    onDelete: "restrict",
  }),
  ...timestamps,
  ...adminUpdateReference,
}, (table) => [
  index("nearby_locations_area_id_idx").on(table.areaId),
]);

// =========================================================
// =========================================================
// ======================= VIEWS ===========================
// =========================================================
// =========================================================

// ==================== AREA DETAIL VIEW ===================

export const areaDetailView = pgView("areaDetailView").as((qb) =>
  qb
    .select({
      id: areas.id,
      brandId: brandsOnAreas.brandId,
      area: areas.area,
      weight: brandsOnAreas.weight,
      featured: brandsOnAreas.featured,
      isActive: brandsOnAreas.isActive,
      slug: sql<string | null>`${brandsOnAreas.slug}`.as("slug"),
      stateId: cities.stateId,
      cityId: areas.cityId,
      createdAt: areas.createdAt,
      updatedAt: areas.updatedAt,
      adminCreatedBy: areas.adminCreatedBy,
      adminUpdatedBy: areas.adminUpdatedBy,
      state: states.state,
      stateSlug: sql<string | null>`${brandsOnStates.slug}`.as("stateSlug"),
      city: cities.city,
      citySlug: sql<string | null>`${brandsOnCities.slug}`.as("citySlug"),
      faqs: brandsOnAreas.faqs,
      metadata: brandsOnAreas.meta,
      information: brandsOnAreas.info,
    })
    .from(areas)
    .leftJoin(brandsOnAreas, eq(brandsOnAreas.areaId, areas.id))
    .leftJoin(cities, eq(areas.cityId, cities.id))
    .leftJoin(
      brandsOnCities,
      and(
        eq(brandsOnCities.cityId, cities.id),
        eq(brandsOnCities.brandId, brandsOnAreas.brandId)
      )
    )
    .leftJoin(states, eq(cities.stateId, states.id))
    .leftJoin(
      brandsOnStates,
      and(
        eq(brandsOnStates.stateId, states.id),
        eq(brandsOnStates.brandId, brandsOnAreas.brandId)
      )
    )
);

export const areaDetailQuery = (db: any, brandId: string) =>
  db.select().from(areaDetailView).where(eq(areaDetailView.brandId, brandId));
