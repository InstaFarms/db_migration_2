import { eq, sql } from "drizzle-orm";
import {
  pgTable,
  pgView,
  pgEnum,
  date,
  uuid,
  text,
  boolean,
  integer,
  decimal,
  jsonb,
  time,
  unique,
  index,
  check,
  primaryKey,
} from "drizzle-orm/pg-core";

import {
  setUserOrAdminUpdatedByConstraint,
  timestamps,
  adminUpdateReference,
  adminOrUserUpdateReference,
} from "./shared.ts";
import { brands } from "./brand.ts";
import { areas, cities, states } from "./location.ts";
import {
  bookingTypeOptions,
  dayOfWeekOptions,
  propertyAreaTypeOptions,
  propertyDerivativeTypeByBrandOptions,
} from "../types.ts";
import type {
  DayOfWeek,
  PropertyBrandFaq,
  PropertyBrandHomeRuleTruth,
  PropertyBrandPhoto,
  PropertyBrandSection,
  PropertyGooglePlaceReview,
  PropertyNearbyPlace,
} from "../types.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const propertyAreaTypeEnum = pgEnum("property_area_type", propertyAreaTypeOptions);

export const propertyDerivativeTypeByBrandEnum = pgEnum(
  "propertyDerivativeTypeByBrand",
  propertyDerivativeTypeByBrandOptions
);

export const bookingTypeEnum = pgEnum("bookingType", bookingTypeOptions);

export const dayOfWeekEnum = pgEnum("day_of_week", dayOfWeekOptions);

// =========================================================
// =========================================================
// ======================== Tables =========================
// =========================================================
// =========================================================

// ==================== PROPERTY TYPES =====================

export const propertyTypes = pgTable("propertyTypes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ...timestamps,
  ...adminUpdateReference,
});

// ==================== PROPERTIES =========================

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    propertyName: text("property_name").notNull(),
    propertyCode: text("property_code").notNull(),
    propertyCodeName: text("property_code_name"),
    isDisabled: boolean("is_disabled").notNull().default(false),

    bedroomCount: integer("bedroom_count").notNull().default(0),
    bathroomCount: integer("bathroom_count").notNull().default(0),
    doubleBedCount: integer("double_bed_count").notNull().default(0),
    singleBedCount: integer("single_bed_count").notNull().default(0),
    mattressCount: integer("mattress_count").notNull().default(0),
    baseGuestCount: integer("base_guest_count").notNull().default(0),
    maxGuestCount: integer("max_guest_count").notNull().default(0),

    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    mapLink: text("map_link"),

    address: text("address"),
    landmark: text("landmark"),
    village: text("village"),

    cityId: uuid("city_id").references(() => cities.id, {
      onDelete: "restrict",
    }),
    stateId: uuid("state_id").references(() => states.id, {
      onDelete: "restrict",
    }),
    pincode: text("pincode"),

    propertyTypeId: uuid("property_type_id").references(() => propertyTypes.id, {
      onDelete: "restrict",
    }),

    googlePlaceId: text("google_place_id"),
    googlePlaceRating: decimal("google_place_rating", {
      precision: 5,
      scale: 2,
    }),
    googlePlaceUserRatingCount: integer("google_place_user_rating_count"),

    nearbyPlaces: jsonb("nearby_places")
      .$type<PropertyNearbyPlace[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    googlePlaceReviews: jsonb("google_place_reviews")
      .$type<PropertyGooglePlaceReview[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    unique("properties_property_code_unique").on(table.propertyCode),

    index("properties_property_code_idx").on(table.propertyCode),
    index("properties_city_id_idx").on(table.cityId),
    index("properties_state_id_idx").on(table.stateId),
    index("properties_property_type_id_idx").on(table.propertyTypeId),

    check("properties_bedroom_count_non_negative", sql`${table.bedroomCount} >= 0`),
    check("properties_bathroom_count_non_negative", sql`${table.bathroomCount} >= 0`),
    check("properties_double_bed_count_non_negative", sql`${table.doubleBedCount} >= 0`),
    check("properties_single_bed_count_non_negative", sql`${table.singleBedCount} >= 0`),
    check("properties_mattress_count_non_negative", sql`${table.mattressCount} >= 0`),
    check("properties_base_guest_count_non_negative", sql`${table.baseGuestCount} >= 0`),
    check("properties_max_guest_count_non_negative", sql`${table.maxGuestCount} >= 0`),
    check(
      "properties_max_guest_greater_than_base",
      sql`${table.maxGuestCount} >= ${table.baseGuestCount}`
    ),
    check(
      "properties_google_place_rating_valid",
      sql`${table.googlePlaceRating} IS NULL OR (${table.googlePlaceRating} >= 0 AND ${table.googlePlaceRating} <= 5)`
    ),
    check(
      "properties_google_place_user_rating_count_non_negative",
      sql`${table.googlePlaceUserRatingCount} IS NULL OR ${table.googlePlaceUserRatingCount} >= 0`
    ),

    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ============ PROPERTY AREA MAPPINGS =====================

export const propertyAreaMappings = pgTable(
  "property_area_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),

    areaId: uuid("area_id")
      .notNull()
      .references(() => areas.id, {
        onDelete: "restrict",
      }),

    areaType: propertyAreaTypeEnum("area_type").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),

    ...timestamps,
  },
  (table) => [
    unique("property_area_mappings_property_area_unique").on(
      table.propertyId,
      table.areaId
    ),

    index("property_area_mappings_property_id_idx").on(table.propertyId),
    index("property_area_mappings_area_id_idx").on(table.areaId),

    check(
      "property_area_mappings_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`
    ),
  ]
);

// Add this partial unique index in raw SQL migration
// if you want strict DB-level enforcement of exactly one PRIMARY area per property:
// CREATE UNIQUE INDEX property_area_mappings_one_primary_area_unique
// ON property_area_mappings (property_id)
// WHERE area_type = 'PRIMARY';

// ============= PROPERTY BRAND MAPPINGS ===================

export const propertyBrandMappings = pgTable(
  "property_brand_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),

    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),

    propertyDerivativeType: propertyDerivativeTypeByBrandEnum(
      "property_derivative_type"
    )
      .notNull()
      .default("NORMAL"),

    isActive: boolean("is_active").notNull().default(true),

    slug: text("slug").notNull(),
    heading: text("heading"),
    description: text("description").default(""),
    exploreYourStay: text("explore_your_stay"),

    weight: decimal("weight", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),

    faqs: jsonb("faqs")
      .$type<PropertyBrandFaq[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    photos: jsonb("photos")
      .$type<PropertyBrandPhoto[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    homeRulesTruths: jsonb("home_rules_truths")
      .$type<PropertyBrandHomeRuleTruth[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    sections: jsonb("sections")
      .$type<PropertyBrandSection[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    meta: jsonb("meta").notNull().default(sql`'{}'::jsonb`),

    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    unique("property_brand_mappings_property_brand_unique").on(
      table.propertyId,
      table.brandId
    ),

    unique("property_brand_mappings_brand_slug_unique").on(
      table.brandId,
      table.slug
    ),

    index("property_brand_mappings_property_id_idx").on(table.propertyId),
    index("property_brand_mappings_brand_id_idx").on(table.brandId),
    index("property_brand_mappings_slug_idx").on(table.slug),

    check("property_brand_mappings_weight_non_negative", sql`${table.weight} >= 0`),
    check(
      "property_brand_mappings_slug_not_empty",
      sql`length(trim(${table.slug})) > 0`
    ),

    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ======== PROPERTY BRAND BOOKING SETTINGS ================

export const propertyBrandBookingSettings = pgTable(
  "property_brand_booking_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    propertyBrandMappingId: uuid("property_brand_mapping_id")
      .notNull()
      .references(() => propertyBrandMappings.id, {
        onDelete: "cascade",
      }),

    allowCallBooking: boolean("allow_call_booking").notNull().default(false),
    allowEnquiry: boolean("allow_enquiry").notNull().default(false),
    allowOnlineBooking: boolean("allow_online_booking").notNull().default(false),

    bookingType: bookingTypeEnum("booking_type"),
    checkinTime: time("checkin_time"),
    checkoutTime: time("checkout_time"),

    bookingPolicy: text("booking_policy").notNull().default(""),
    requiresConfirmation: boolean("requires_confirmation")
      .notNull()
      .default(false),

    advancePaymentEnabled: boolean("advance_payment_enabled")
      .notNull()
      .default(false),

    advancePaymentAmount: integer("advance_payment_amount"),

    advancePaymentPercentage: decimal("advance_payment_percentage", {
      precision: 5,
      scale: 2,
    }),

    enableFloatingGuests: boolean("enable_floating_guests")
      .notNull()
      .default(false),

    commissionPercentage: decimal("commission_percentage", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("0"),

    securityDeposit: integer("security_deposit").notNull().default(0),
    cookingAccessFee: integer("cooking_access_fee").notNull().default(0),

    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    unique("property_brand_booking_settings_mapping_unique").on(
      table.propertyBrandMappingId
    ),

    index("property_brand_booking_settings_mapping_id_idx").on(
      table.propertyBrandMappingId
    ),

    check(
      "property_brand_booking_settings_advance_amount_or_percentage",
      sql`(
        (${table.advancePaymentAmount} IS NOT NULL AND ${table.advancePaymentPercentage} IS NULL) OR
        (${table.advancePaymentAmount} IS NULL AND ${table.advancePaymentPercentage} IS NOT NULL) OR
        (${table.advancePaymentAmount} IS NULL AND ${table.advancePaymentPercentage} IS NULL)
      )`
    ),

    check(
      "property_brand_booking_settings_advance_percentage_valid",
      sql`${table.advancePaymentPercentage} IS NULL OR (${table.advancePaymentPercentage} > 0 AND ${table.advancePaymentPercentage} <= 100)`
    ),

    check(
      "property_brand_booking_settings_advance_amount_non_negative",
      sql`${table.advancePaymentAmount} IS NULL OR ${table.advancePaymentAmount} >= 0`
    ),

    check(
      "property_brand_booking_settings_advance_fields_match_flag",
      sql`(
        (${table.advancePaymentEnabled} = false AND ${table.advancePaymentAmount} IS NULL AND ${table.advancePaymentPercentage} IS NULL)
        OR
        (${table.advancePaymentEnabled} = true AND (${table.advancePaymentAmount} IS NOT NULL OR ${table.advancePaymentPercentage} IS NOT NULL))
      )`
    ),

    check(
      "property_brand_booking_settings_commission_percentage_valid",
      sql`${table.commissionPercentage} >= 0 AND ${table.commissionPercentage} <= 100`
    ),

    check(
      "property_brand_booking_settings_security_deposit_non_negative",
      sql`${table.securityDeposit} >= 0`
    ),

    check(
      "property_brand_booking_settings_cooking_access_fee_non_negative",
      sql`${table.cookingAccessFee} >= 0`
    ),

    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ============= PROPERTY BRAND PRICING RULES ==============

export const propertyBrandPricingRules = pgTable(
  "property_brand_pricing_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    propertyBrandMappingId: uuid("property_brand_mapping_id")
      .notNull()
      .references(() => propertyBrandMappings.id, {
        onDelete: "cascade",
      }),

    dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),

    basePrice: integer("base_price"),
    basePriceWithGst: integer("base_price_with_gst"),

    adultExtraGuestCharge: integer("adult_extra_guest_charge"),
    adultExtraGuestChargeWithGst: integer("adult_extra_guest_charge_with_gst"),

    childExtraGuestCharge: integer("child_extra_guest_charge"),
    childExtraGuestChargeWithGst: integer("child_extra_guest_charge_with_gst"),

    infantExtraGuestCharge: integer("infant_extra_guest_charge"),
    infantExtraGuestChargeWithGst: integer("infant_extra_guest_charge_with_gst"),

    floatingAdultExtraGuestCharge: integer("floating_adult_extra_guest_charge"),
    floatingAdultExtraGuestChargeWithGst: integer(
      "floating_adult_extra_guest_charge_with_gst"
    ),

    floatingChildExtraGuestCharge: integer("floating_child_extra_guest_charge"),
    floatingChildExtraGuestChargeWithGst: integer(
      "floating_child_extra_guest_charge_with_gst"
    ),

    floatingInfantExtraGuestCharge: integer("floating_infant_extra_guest_charge"),
    floatingInfantExtraGuestChargeWithGst: integer(
      "floating_infant_extra_guest_charge_with_gst"
    ),

    baseGuestCount: integer("base_guest_count"),
    discount: integer("discount"),
    gstSlab: decimal("gst_slab", { precision: 5, scale: 2 }),
    maxExtraGuestPrice: integer("max_extra_guest_price"),
    maxTotal: integer("max_total"),

    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    unique("property_brand_pricing_rules_mapping_day_unique").on(
      table.propertyBrandMappingId,
      table.dayOfWeek
    ),

    index("property_brand_pricing_rules_mapping_id_idx").on(
      table.propertyBrandMappingId
    ),

    check(
      "property_brand_pricing_rules_base_price_non_negative",
      sql`${table.basePrice} IS NULL OR ${table.basePrice} >= 0`
    ),
    check(
      "property_brand_pricing_rules_base_price_with_gst_non_negative",
      sql`${table.basePriceWithGst} IS NULL OR ${table.basePriceWithGst} >= 0`
    ),

    check(
      "property_brand_pricing_rules_adult_extra_non_negative",
      sql`${table.adultExtraGuestCharge} IS NULL OR ${table.adultExtraGuestCharge} >= 0`
    ),
    check(
      "property_brand_pricing_rules_adult_extra_with_gst_non_negative",
      sql`${table.adultExtraGuestChargeWithGst} IS NULL OR ${table.adultExtraGuestChargeWithGst} >= 0`
    ),

    check(
      "property_brand_pricing_rules_child_extra_non_negative",
      sql`${table.childExtraGuestCharge} IS NULL OR ${table.childExtraGuestCharge} >= 0`
    ),
    check(
      "property_brand_pricing_rules_child_extra_with_gst_non_negative",
      sql`${table.childExtraGuestChargeWithGst} IS NULL OR ${table.childExtraGuestChargeWithGst} >= 0`
    ),

    check(
      "property_brand_pricing_rules_infant_extra_non_negative",
      sql`${table.infantExtraGuestCharge} IS NULL OR ${table.infantExtraGuestCharge} >= 0`
    ),
    check(
      "property_brand_pricing_rules_infant_extra_with_gst_non_negative",
      sql`${table.infantExtraGuestChargeWithGst} IS NULL OR ${table.infantExtraGuestChargeWithGst} >= 0`
    ),

    check(
      "property_brand_pricing_rules_floating_adult_extra_non_negative",
      sql`${table.floatingAdultExtraGuestCharge} IS NULL OR ${table.floatingAdultExtraGuestCharge} >= 0`
    ),
    check(
      "property_brand_pricing_rules_floating_adult_extra_with_gst_non_negative",
      sql`${table.floatingAdultExtraGuestChargeWithGst} IS NULL OR ${table.floatingAdultExtraGuestChargeWithGst} >= 0`
    ),

    check(
      "property_brand_pricing_rules_floating_child_extra_non_negative",
      sql`${table.floatingChildExtraGuestCharge} IS NULL OR ${table.floatingChildExtraGuestCharge} >= 0`
    ),
    check(
      "property_brand_pricing_rules_floating_child_extra_with_gst_non_negative",
      sql`${table.floatingChildExtraGuestChargeWithGst} IS NULL OR ${table.floatingChildExtraGuestChargeWithGst} >= 0`
    ),

    check(
      "property_brand_pricing_rules_floating_infant_extra_non_negative",
      sql`${table.floatingInfantExtraGuestCharge} IS NULL OR ${table.floatingInfantExtraGuestCharge} >= 0`
    ),
    check(
      "property_brand_pricing_rules_floating_infant_extra_with_gst_non_negative",
      sql`${table.floatingInfantExtraGuestChargeWithGst} IS NULL OR ${table.floatingInfantExtraGuestChargeWithGst} >= 0`
    ),

    check(
      "property_brand_pricing_rules_base_guest_count_non_negative",
      sql`${table.baseGuestCount} IS NULL OR ${table.baseGuestCount} >= 0`
    ),
    check(
      "property_brand_pricing_rules_discount_non_negative",
      sql`${table.discount} IS NULL OR ${table.discount} >= 0`
    ),
    check(
      "property_brand_pricing_rules_gst_slab_valid",
      sql`${table.gstSlab} IS NULL OR (${table.gstSlab} >= 0 AND ${table.gstSlab} <= 100)`
    ),
    check(
      "property_brand_pricing_rules_max_extra_guest_price_non_negative",
      sql`${table.maxExtraGuestPrice} IS NULL OR ${table.maxExtraGuestPrice} >= 0`
    ),
    check(
      "property_brand_pricing_rules_max_total_non_negative",
      sql`${table.maxTotal} IS NULL OR ${table.maxTotal} >= 0`
    ),
  ]
);

// ==================== SPECIAL DATES ======================

export const specialDates = pgTable(
  "specialDates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    date: date({ mode: "string" }).notNull(),
    price: integer("price"),
    priceWithGST: integer("priceWithGST"),
    adultExtraGuestCharge: integer("adultExtraGuestCharge"),
    adultExtraGuestChargeWithGST: integer("adultExtraGuestChargeWithGST"),

    childExtraGuestCharge: integer("childExtraGuestCharge"),
    childExtraGuestChargeWithGST: integer("childExtraGuestChargeWithGST"),
    
    infantExtraGuestCharge: integer("infantExtraGuestCharge"),
    infantExtraGuestChargeWithGST: integer("infantExtraGuestChargeWithGST"),

    floatingAdultExtraGuestCharge: integer("floatingAdultExtraGuestCharge"),
    floatingAdultExtraGuestChargeWithGST: integer("floatingAdultExtraGuestChargeWithGST"),
    
    floatingChildExtraGuestCharge: integer("floatingChildExtraGuestCharge"),
    floatingChildExtraGuestChargeWithGST: integer("floatingChildExtraGuestChargeWithGST"),
    
    floatingInfantExtraGuestCharge: integer("floatingInfantExtraGuestCharge"),
    floatingInfantExtraGuestChargeWithGST: integer("floatingInfantExtraGuestChargeWithGST"),

    baseGuestCount: integer("baseGuestCount"),
    discount: integer("discount"),
    gstSlab: integer("gstSlab"),
    maxExtraGuestPrice: integer("maxExtraGuestPrice"),
    maxTotal: integer("maxTotal"),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("special_date_price_positive", sql`"price" >= 0`),
    check("special_date_base_guest_positive", sql`"baseGuestCount" >= 0`),
    check("special_date_discount_valid", sql`"discount" >= 0 AND "discount" <= 100`),
    unique("property_brand_date_unique").on(table.propertyId, table.brandId, table.date),
    index("special_dates_property_id_idx").on(table.propertyId),
    index("special_dates_brand_id_idx").on(table.brandId),
    index("special_dates_date_idx").on(table.date),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ============ PROPERTY DERIVATIVE MAPPINGS ===============

export const splitPropertyMappings = pgTable(
  "splitPropertyMappings",
  {
    parentPropertyId: uuid("parentPropertyId")
      .notNull()
      .references(() => propertyBrandMappings.id, { onDelete: "cascade" }),

    childPropertyId: uuid("childPropertyId")
      .notNull()
      .references(() => propertyBrandMappings.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      columns: [table.parentPropertyId, table.childPropertyId],
    }),

    check(
      "split_property_mappings_distinct_properties",
      sql`"parentPropertyId" <> "childPropertyId"`
    ),

    unique("split_unique_child").on(table.childPropertyId),
    index("split_parent_idx").on(table.parentPropertyId),
  ]
);

export const mergedPropertyMappings = pgTable(
  "mergedPropertyMappings",
  {
    mergedPropertyId: uuid("mergedPropertyId")
      .notNull()
      .references(() => propertyBrandMappings.id, { onDelete: "cascade" }),

    constituentPropertyId: uuid("constituentPropertyId")
      .notNull()
      .references(() => propertyBrandMappings.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      columns: [table.mergedPropertyId, table.constituentPropertyId],
    }),

    check(
      "merged_property_mappings_distinct_properties",
      sql`"mergedPropertyId" <> "constituentPropertyId"`
    ),

    unique("merge_unique_constituent").on(table.constituentPropertyId),
    index("merge_parent_idx").on(table.mergedPropertyId),
  ]
);

// =========================================================
// =========================================================
// ================= PROPERTY DETAIL VIEW ==================
// =========================================================
// =========================================================

const pricingForDay = (day: DayOfWeek, column: string) =>
  sql<number | null>`(
    SELECT ${sql.raw(`pbr.${column}`)}
    FROM property_brand_pricing_rules pbr
    WHERE pbr.property_brand_mapping_id = ${propertyBrandMappings.id}
      AND pbr.day_of_week = ${day}
    LIMIT 1
  )`;

const areaIdFor = (areaType: "PRIMARY" | "SECONDARY", offset: number = 0) =>
  sql<string | null>`(
    SELECT pam.area_id
    FROM property_area_mappings pam
    WHERE pam.property_id = ${properties.id}
      AND pam.area_type = ${areaType}
    ORDER BY pam.sort_order ASC
    OFFSET ${offset}
    LIMIT 1
  )`;

export const propertyDetailView = pgView("propertyDetailView").as((qb) =>
  qb
    .select({
      id: properties.id,
      propertyName: properties.propertyName,
      propertyCode: properties.propertyCode,
      propertyCodeName: properties.propertyCodeName,
      isDisabled: properties.isDisabled,
      bedroomCount: properties.bedroomCount,
      bathroomCount: properties.bathroomCount,
      doubleBedCount: properties.doubleBedCount,
      singleBedCount: properties.singleBedCount,
      mattressCount: properties.mattressCount,
      baseGuestCount: properties.baseGuestCount,
      maxGuestCount: properties.maxGuestCount,
      latitude: properties.latitude,
      longitude: properties.longitude,
      mapLink: properties.mapLink,
      address: properties.address,
      landmark: properties.landmark,
      village: properties.village,
      areaId: areaIdFor("PRIMARY").as("areaId"),
      secondaryAreaId1: areaIdFor("SECONDARY", 0).as("secondaryAreaId1"),
      secondaryAreaId2: areaIdFor("SECONDARY", 1).as("secondaryAreaId2"),
      secondaryAreaId3: areaIdFor("SECONDARY", 2).as("secondaryAreaId3"),
      secondaryAreaId4: areaIdFor("SECONDARY", 3).as("secondaryAreaId4"),
      cityId: properties.cityId,
      stateId: properties.stateId,
      pincode: properties.pincode,
      propertyTypeId: properties.propertyTypeId,
      googlePlaceId: properties.googlePlaceId,
      googlePlaceRating: properties.googlePlaceRating,
      googlePlaceUserRatingCount: properties.googlePlaceUserRatingCount,
      googlePlaceReviews: properties.googlePlaceReviews,
      nearbyPlaces: properties.nearbyPlaces,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
      createdBy: properties.createdBy,
      updatedBy: properties.updatedBy,
      adminCreatedBy: properties.adminCreatedBy,
      adminUpdatedBy: properties.adminUpdatedBy,

      brandId: propertyBrandMappings.brandId,
      brandName: sql<string>`${brands.name}`.as("brandName"),
      brandDomain: brands.domain,
      isActive: propertyBrandMappings.isActive,
      slug: propertyBrandMappings.slug,
      heading: propertyBrandMappings.heading,
      description: propertyBrandMappings.description,
      exploreYourStay: propertyBrandMappings.exploreYourStay,
      weight: propertyBrandMappings.weight,
      propertyDerivativeType: propertyBrandMappings.propertyDerivativeType,
      allowCallBooking: propertyBrandBookingSettings.allowCallBooking,
      allowEnquiry: propertyBrandBookingSettings.allowEnquiry,
      allowOnlineBooking: propertyBrandBookingSettings.allowOnlineBooking,
      bookingType: propertyBrandBookingSettings.bookingType,
      checkinTime: propertyBrandBookingSettings.checkinTime,
      checkoutTime: propertyBrandBookingSettings.checkoutTime,
      bookingPolicy: propertyBrandBookingSettings.bookingPolicy,
      requiresConfirmation: propertyBrandBookingSettings.requiresConfirmation,
      advancePaymentEnabled: propertyBrandBookingSettings.advancePaymentEnabled,
      advancePaymentAmount: propertyBrandBookingSettings.advancePaymentAmount,
      advancePaymentPercentage: propertyBrandBookingSettings.advancePaymentPercentage,
      enableFloatingGuests: propertyBrandBookingSettings.enableFloatingGuests,
      commissionPercentage: propertyBrandBookingSettings.commissionPercentage,
      securityDeposit: propertyBrandBookingSettings.securityDeposit,
      cookingAccessFee: propertyBrandBookingSettings.cookingAccessFee,

      mondayPrice: pricingForDay("MONDAY", "base_price").as("mondayPrice"),
      mondayPriceWithGST: pricingForDay("MONDAY", "base_price_with_gst").as("mondayPriceWithGST"),
      tuesdayPrice: pricingForDay("TUESDAY", "base_price").as("tuesdayPrice"),
      tuesdayPriceWithGST: pricingForDay("TUESDAY", "base_price_with_gst").as("tuesdayPriceWithGST"),
      wednesdayPrice: pricingForDay("WEDNESDAY", "base_price").as("wednesdayPrice"),
      wednesdayPriceWithGST: pricingForDay("WEDNESDAY", "base_price_with_gst").as("wednesdayPriceWithGST"),
      thursdayPrice: pricingForDay("THURSDAY", "base_price").as("thursdayPrice"),
      thursdayPriceWithGST: pricingForDay("THURSDAY", "base_price_with_gst").as("thursdayPriceWithGST"),
      fridayPrice: pricingForDay("FRIDAY", "base_price").as("fridayPrice"),
      fridayPriceWithGST: pricingForDay("FRIDAY", "base_price_with_gst").as("fridayPriceWithGST"),
      saturdayPrice: pricingForDay("SATURDAY", "base_price").as("saturdayPrice"),
      saturdayPriceWithGST: pricingForDay("SATURDAY", "base_price_with_gst").as("saturdayPriceWithGST"),
      sundayPrice: pricingForDay("SUNDAY", "base_price").as("sundayPrice"),
      sundayPriceWithGST: pricingForDay("SUNDAY", "base_price_with_gst").as("sundayPriceWithGST"),

      mondayAdultExtraGuestCharge: pricingForDay("MONDAY", "adult_extra_guest_charge").as("mondayAdultExtraGuestCharge"),
      mondayAdultExtraGuestChargeWithGST: pricingForDay("MONDAY", "adult_extra_guest_charge_with_gst").as("mondayAdultExtraGuestChargeWithGST"),
      mondayChildExtraGuestCharge: pricingForDay("MONDAY", "child_extra_guest_charge").as("mondayChildExtraGuestCharge"),
      mondayChildExtraGuestChargeWithGST: pricingForDay("MONDAY", "child_extra_guest_charge_with_gst").as("mondayChildExtraGuestChargeWithGST"),
      mondayInfantExtraGuestCharge: pricingForDay("MONDAY", "infant_extra_guest_charge").as("mondayInfantExtraGuestCharge"),
      mondayInfantExtraGuestChargeWithGST: pricingForDay("MONDAY", "infant_extra_guest_charge_with_gst").as("mondayInfantExtraGuestChargeWithGST"),
      mondayBaseGuestCount: pricingForDay("MONDAY", "base_guest_count").as("mondayBaseGuestCount"),
      mondayDiscount: pricingForDay("MONDAY", "discount").as("mondayDiscount"),

      tuesdayAdultExtraGuestCharge: pricingForDay("TUESDAY", "adult_extra_guest_charge").as("tuesdayAdultExtraGuestCharge"),
      tuesdayAdultExtraGuestChargeWithGST: pricingForDay("TUESDAY", "adult_extra_guest_charge_with_gst").as("tuesdayAdultExtraGuestChargeWithGST"),
      tuesdayChildExtraGuestCharge: pricingForDay("TUESDAY", "child_extra_guest_charge").as("tuesdayChildExtraGuestCharge"),
      tuesdayChildExtraGuestChargeWithGST: pricingForDay("TUESDAY", "child_extra_guest_charge_with_gst").as("tuesdayChildExtraGuestChargeWithGST"),
      tuesdayInfantExtraGuestCharge: pricingForDay("TUESDAY", "infant_extra_guest_charge").as("tuesdayInfantExtraGuestCharge"),
      tuesdayInfantExtraGuestChargeWithGST: pricingForDay("TUESDAY", "infant_extra_guest_charge_with_gst").as("tuesdayInfantExtraGuestChargeWithGST"),
      tuesdayBaseGuestCount: pricingForDay("TUESDAY", "base_guest_count").as("tuesdayBaseGuestCount"),
      tuesdayDiscount: pricingForDay("TUESDAY", "discount").as("tuesdayDiscount"),

      wednesdayAdultExtraGuestCharge: pricingForDay("WEDNESDAY", "adult_extra_guest_charge").as("wednesdayAdultExtraGuestCharge"),
      wednesdayAdultExtraGuestChargeWithGST: pricingForDay("WEDNESDAY", "adult_extra_guest_charge_with_gst").as("wednesdayAdultExtraGuestChargeWithGST"),
      wednesdayChildExtraGuestCharge: pricingForDay("WEDNESDAY", "child_extra_guest_charge").as("wednesdayChildExtraGuestCharge"),
      wednesdayChildExtraGuestChargeWithGST: pricingForDay("WEDNESDAY", "child_extra_guest_charge_with_gst").as("wednesdayChildExtraGuestChargeWithGST"),
      wednesdayInfantExtraGuestCharge: pricingForDay("WEDNESDAY", "infant_extra_guest_charge").as("wednesdayInfantExtraGuestCharge"),
      wednesdayInfantExtraGuestChargeWithGST: pricingForDay("WEDNESDAY", "infant_extra_guest_charge_with_gst").as("wednesdayInfantExtraGuestChargeWithGST"),
      wednesdayBaseGuestCount: pricingForDay("WEDNESDAY", "base_guest_count").as("wednesdayBaseGuestCount"),
      wednesdayDiscount: pricingForDay("WEDNESDAY", "discount").as("wednesdayDiscount"),

      thursdayAdultExtraGuestCharge: pricingForDay("THURSDAY", "adult_extra_guest_charge").as("thursdayAdultExtraGuestCharge"),
      thursdayAdultExtraGuestChargeWithGST: pricingForDay("THURSDAY", "adult_extra_guest_charge_with_gst").as("thursdayAdultExtraGuestChargeWithGST"),
      thursdayChildExtraGuestCharge: pricingForDay("THURSDAY", "child_extra_guest_charge").as("thursdayChildExtraGuestCharge"),
      thursdayChildExtraGuestChargeWithGST: pricingForDay("THURSDAY", "child_extra_guest_charge_with_gst").as("thursdayChildExtraGuestChargeWithGST"),
      thursdayInfantExtraGuestCharge: pricingForDay("THURSDAY", "infant_extra_guest_charge").as("thursdayInfantExtraGuestCharge"),
      thursdayInfantExtraGuestChargeWithGST: pricingForDay("THURSDAY", "infant_extra_guest_charge_with_gst").as("thursdayInfantExtraGuestChargeWithGST"),
      thursdayBaseGuestCount: pricingForDay("THURSDAY", "base_guest_count").as("thursdayBaseGuestCount"),
      thursdayDiscount: pricingForDay("THURSDAY", "discount").as("thursdayDiscount"),

      fridayAdultExtraGuestCharge: pricingForDay("FRIDAY", "adult_extra_guest_charge").as("fridayAdultExtraGuestCharge"),
      fridayAdultExtraGuestChargeWithGST: pricingForDay("FRIDAY", "adult_extra_guest_charge_with_gst").as("fridayAdultExtraGuestChargeWithGST"),
      fridayChildExtraGuestCharge: pricingForDay("FRIDAY", "child_extra_guest_charge").as("fridayChildExtraGuestCharge"),
      fridayChildExtraGuestChargeWithGST: pricingForDay("FRIDAY", "child_extra_guest_charge_with_gst").as("fridayChildExtraGuestChargeWithGST"),
      fridayInfantExtraGuestCharge: pricingForDay("FRIDAY", "infant_extra_guest_charge").as("fridayInfantExtraGuestCharge"),
      fridayInfantExtraGuestChargeWithGST: pricingForDay("FRIDAY", "infant_extra_guest_charge_with_gst").as("fridayInfantExtraGuestChargeWithGST"),
      fridayBaseGuestCount: pricingForDay("FRIDAY", "base_guest_count").as("fridayBaseGuestCount"),
      fridayDiscount: pricingForDay("FRIDAY", "discount").as("fridayDiscount"),

      saturdayAdultExtraGuestCharge: pricingForDay("SATURDAY", "adult_extra_guest_charge").as("saturdayAdultExtraGuestCharge"),
      saturdayAdultExtraGuestChargeWithGST: pricingForDay("SATURDAY", "adult_extra_guest_charge_with_gst").as("saturdayAdultExtraGuestChargeWithGST"),
      saturdayChildExtraGuestCharge: pricingForDay("SATURDAY", "child_extra_guest_charge").as("saturdayChildExtraGuestCharge"),
      saturdayChildExtraGuestChargeWithGST: pricingForDay("SATURDAY", "child_extra_guest_charge_with_gst").as("saturdayChildExtraGuestChargeWithGST"),
      saturdayInfantExtraGuestCharge: pricingForDay("SATURDAY", "infant_extra_guest_charge").as("saturdayInfantExtraGuestCharge"),
      saturdayInfantExtraGuestChargeWithGST: pricingForDay("SATURDAY", "infant_extra_guest_charge_with_gst").as("saturdayInfantExtraGuestChargeWithGST"),
      saturdayBaseGuestCount: pricingForDay("SATURDAY", "base_guest_count").as("saturdayBaseGuestCount"),
      saturdayDiscount: pricingForDay("SATURDAY", "discount").as("saturdayDiscount"),

      sundayAdultExtraGuestCharge: pricingForDay("SUNDAY", "adult_extra_guest_charge").as("sundayAdultExtraGuestCharge"),
      sundayAdultExtraGuestChargeWithGST: pricingForDay("SUNDAY", "adult_extra_guest_charge_with_gst").as("sundayAdultExtraGuestChargeWithGST"),
      sundayChildExtraGuestCharge: pricingForDay("SUNDAY", "child_extra_guest_charge").as("sundayChildExtraGuestCharge"),
      sundayChildExtraGuestChargeWithGST: pricingForDay("SUNDAY", "child_extra_guest_charge_with_gst").as("sundayChildExtraGuestChargeWithGST"),
      sundayInfantExtraGuestCharge: pricingForDay("SUNDAY", "infant_extra_guest_charge").as("sundayInfantExtraGuestCharge"),
      sundayInfantExtraGuestChargeWithGST: pricingForDay("SUNDAY", "infant_extra_guest_charge_with_gst").as("sundayInfantExtraGuestChargeWithGST"),
      sundayBaseGuestCount: pricingForDay("SUNDAY", "base_guest_count").as("sundayBaseGuestCount"),
      sundayDiscount: pricingForDay("SUNDAY", "discount").as("sundayDiscount"),

      mondayFloatingAdultExtraGuestCharge: pricingForDay("MONDAY", "floating_adult_extra_guest_charge").as("mondayFloatingAdultExtraGuestCharge"),
      mondayFloatingAdultExtraGuestChargeWithGST: pricingForDay("MONDAY", "floating_adult_extra_guest_charge_with_gst").as("mondayFloatingAdultExtraGuestChargeWithGST"),
      mondayFloatingChildExtraGuestCharge: pricingForDay("MONDAY", "floating_child_extra_guest_charge").as("mondayFloatingChildExtraGuestCharge"),
      mondayFloatingChildExtraGuestChargeWithGST: pricingForDay("MONDAY", "floating_child_extra_guest_charge_with_gst").as("mondayFloatingChildExtraGuestChargeWithGST"),
      mondayFloatingInfantExtraGuestCharge: pricingForDay("MONDAY", "floating_infant_extra_guest_charge").as("mondayFloatingInfantExtraGuestCharge"),
      mondayFloatingInfantExtraGuestChargeWithGST: pricingForDay("MONDAY", "floating_infant_extra_guest_charge_with_gst").as("mondayFloatingInfantExtraGuestChargeWithGST"),

      tuesdayFloatingAdultExtraGuestCharge: pricingForDay("TUESDAY", "floating_adult_extra_guest_charge").as("tuesdayFloatingAdultExtraGuestCharge"),
      tuesdayFloatingAdultExtraGuestChargeWithGST: pricingForDay("TUESDAY", "floating_adult_extra_guest_charge_with_gst").as("tuesdayFloatingAdultExtraGuestChargeWithGST"),
      tuesdayFloatingChildExtraGuestCharge: pricingForDay("TUESDAY", "floating_child_extra_guest_charge").as("tuesdayFloatingChildExtraGuestCharge"),
      tuesdayFloatingChildExtraGuestChargeWithGST: pricingForDay("TUESDAY", "floating_child_extra_guest_charge_with_gst").as("tuesdayFloatingChildExtraGuestChargeWithGST"),
      tuesdayFloatingInfantExtraGuestCharge: pricingForDay("TUESDAY", "floating_infant_extra_guest_charge").as("tuesdayFloatingInfantExtraGuestCharge"),
      tuesdayFloatingInfantExtraGuestChargeWithGST: pricingForDay("TUESDAY", "floating_infant_extra_guest_charge_with_gst").as("tuesdayFloatingInfantExtraGuestChargeWithGST"),

      wednesdayFloatingAdultExtraGuestCharge: pricingForDay("WEDNESDAY", "floating_adult_extra_guest_charge").as("wednesdayFloatingAdultExtraGuestCharge"),
      wednesdayFloatingAdultExtraGuestChargeWithGST: pricingForDay("WEDNESDAY", "floating_adult_extra_guest_charge_with_gst").as("wednesdayFloatingAdultExtraGuestChargeWithGST"),
      wednesdayFloatingChildExtraGuestCharge: pricingForDay("WEDNESDAY", "floating_child_extra_guest_charge").as("wednesdayFloatingChildExtraGuestCharge"),
      wednesdayFloatingChildExtraGuestChargeWithGST: pricingForDay("WEDNESDAY", "floating_child_extra_guest_charge_with_gst").as("wednesdayFloatingChildExtraGuestChargeWithGST"),
      wednesdayFloatingInfantExtraGuestCharge: pricingForDay("WEDNESDAY", "floating_infant_extra_guest_charge").as("wednesdayFloatingInfantExtraGuestCharge"),
      wednesdayFloatingInfantExtraGuestChargeWithGST: pricingForDay("WEDNESDAY", "floating_infant_extra_guest_charge_with_gst").as("wednesdayFloatingInfantExtraGuestChargeWithGST"),

      thursdayFloatingAdultExtraGuestCharge: pricingForDay("THURSDAY", "floating_adult_extra_guest_charge").as("thursdayFloatingAdultExtraGuestCharge"),
      thursdayFloatingAdultExtraGuestChargeWithGST: pricingForDay("THURSDAY", "floating_adult_extra_guest_charge_with_gst").as("thursdayFloatingAdultExtraGuestChargeWithGST"),
      thursdayFloatingChildExtraGuestCharge: pricingForDay("THURSDAY", "floating_child_extra_guest_charge").as("thursdayFloatingChildExtraGuestCharge"),
      thursdayFloatingChildExtraGuestChargeWithGST: pricingForDay("THURSDAY", "floating_child_extra_guest_charge_with_gst").as("thursdayFloatingChildExtraGuestChargeWithGST"),
      thursdayFloatingInfantExtraGuestCharge: pricingForDay("THURSDAY", "floating_infant_extra_guest_charge").as("thursdayFloatingInfantExtraGuestCharge"),
      thursdayFloatingInfantExtraGuestChargeWithGST: pricingForDay("THURSDAY", "floating_infant_extra_guest_charge_with_gst").as("thursdayFloatingInfantExtraGuestChargeWithGST"),

      fridayFloatingAdultExtraGuestCharge: pricingForDay("FRIDAY", "floating_adult_extra_guest_charge").as("fridayFloatingAdultExtraGuestCharge"),
      fridayFloatingAdultExtraGuestChargeWithGST: pricingForDay("FRIDAY", "floating_adult_extra_guest_charge_with_gst").as("fridayFloatingAdultExtraGuestChargeWithGST"),
      fridayFloatingChildExtraGuestCharge: pricingForDay("FRIDAY", "floating_child_extra_guest_charge").as("fridayFloatingChildExtraGuestCharge"),
      fridayFloatingChildExtraGuestChargeWithGST: pricingForDay("FRIDAY", "floating_child_extra_guest_charge_with_gst").as("fridayFloatingChildExtraGuestChargeWithGST"),
      fridayFloatingInfantExtraGuestCharge: pricingForDay("FRIDAY", "floating_infant_extra_guest_charge").as("fridayFloatingInfantExtraGuestCharge"),
      fridayFloatingInfantExtraGuestChargeWithGST: pricingForDay("FRIDAY", "floating_infant_extra_guest_charge_with_gst").as("fridayFloatingInfantExtraGuestChargeWithGST"),

      saturdayFloatingAdultExtraGuestCharge: pricingForDay("SATURDAY", "floating_adult_extra_guest_charge").as("saturdayFloatingAdultExtraGuestCharge"),
      saturdayFloatingAdultExtraGuestChargeWithGST: pricingForDay("SATURDAY", "floating_adult_extra_guest_charge_with_gst").as("saturdayFloatingAdultExtraGuestChargeWithGST"),
      saturdayFloatingChildExtraGuestCharge: pricingForDay("SATURDAY", "floating_child_extra_guest_charge").as("saturdayFloatingChildExtraGuestCharge"),
      saturdayFloatingChildExtraGuestChargeWithGST: pricingForDay("SATURDAY", "floating_child_extra_guest_charge_with_gst").as("saturdayFloatingChildExtraGuestChargeWithGST"),
      saturdayFloatingInfantExtraGuestCharge: pricingForDay("SATURDAY", "floating_infant_extra_guest_charge").as("saturdayFloatingInfantExtraGuestCharge"),
      saturdayFloatingInfantExtraGuestChargeWithGST: pricingForDay("SATURDAY", "floating_infant_extra_guest_charge_with_gst").as("saturdayFloatingInfantExtraGuestChargeWithGST"),

      sundayFloatingAdultExtraGuestCharge: pricingForDay("SUNDAY", "floating_adult_extra_guest_charge").as("sundayFloatingAdultExtraGuestCharge"),
      sundayFloatingAdultExtraGuestChargeWithGST: pricingForDay("SUNDAY", "floating_adult_extra_guest_charge_with_gst").as("sundayFloatingAdultExtraGuestChargeWithGST"),
      sundayFloatingChildExtraGuestCharge: pricingForDay("SUNDAY", "floating_child_extra_guest_charge").as("sundayFloatingChildExtraGuestCharge"),
      sundayFloatingChildExtraGuestChargeWithGST: pricingForDay("SUNDAY", "floating_child_extra_guest_charge_with_gst").as("sundayFloatingChildExtraGuestChargeWithGST"),
      sundayFloatingInfantExtraGuestCharge: pricingForDay("SUNDAY", "floating_infant_extra_guest_charge").as("sundayFloatingInfantExtraGuestCharge"),
      sundayFloatingInfantExtraGuestChargeWithGST: pricingForDay("SUNDAY", "floating_infant_extra_guest_charge_with_gst").as("sundayFloatingInfantExtraGuestChargeWithGST"),

      faqs: propertyBrandMappings.faqs,
      meta: propertyBrandMappings.meta,
      coverPhotos: sql<any>`${propertyBrandMappings.photos}`.as("coverPhotos"),
      homeRulesTruths: propertyBrandMappings.homeRulesTruths,
      section: sql<any>`${propertyBrandMappings.sections}`.as("section"),
      city: cities.city,
      state: states.state,
      citySlug: sql<string | null>`(
        SELECT boc.slug
        FROM "brandsOnCities" boc
        WHERE boc."cityId" = ${properties.cityId}
          AND boc."brandId" = ${propertyBrandMappings.brandId}
        LIMIT 1
      )`.as("citySlug"),
      areaSlug: sql<string | null>`(
        SELECT boa.slug
        FROM "property_area_mappings" pam
        JOIN "brandsOnAreas" boa ON boa."areaId" = pam.area_id
        WHERE pam.property_id = ${properties.id}
          AND pam.area_type = 'PRIMARY'
          AND boa."brandId" = ${propertyBrandMappings.brandId}
        ORDER BY pam.sort_order ASC
        LIMIT 1
      )`.as("areaSlug"),
      area: sql<string | null>`(
        SELECT a.area
        FROM "property_area_mappings" pam
        JOIN areas a ON a.id = pam.area_id
        WHERE pam.property_id = ${properties.id}
          AND pam.area_type = 'PRIMARY'
        ORDER BY pam.sort_order ASC
        LIMIT 1
      )`.as("area"),
      propertyTypeName: sql<string | null>`${propertyTypes.name}`.as("propertyTypeName"),

      specialDates: sql<any[]>`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', sd.id,
              'date', sd."date",
              'price', sd.price,
              'adultExtraGuestCharge', sd."adultExtraGuestCharge",
              'childExtraGuestCharge', sd."childExtraGuestCharge",
              'infantExtraGuestCharge', sd."infantExtraGuestCharge",
              'baseGuestCount', sd."baseGuestCount",
              'discount', sd.discount
            ) ORDER BY sd."date"
          ) FROM "specialDates" sd
          WHERE sd."propertyId" = ${properties.id}
            AND sd."brandId" = ${propertyBrandMappings.brandId}),
          '[]'::json
        )
      `.as("specialDates"),

      spaces: sql<any[]>`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', sp.id,
              'name', sp.name,
              'photo', p."originalUrl",
              'title', sp.title,
              'description', sp.description
            ) ORDER BY sp."createdAt"
          ) FROM "spaceProperties" sp
          JOIN photos p ON sp."photoId" = p.id
          WHERE sp."propertyId" = ${properties.id}),
          '[]'::json
        )
      `.as("spaces"),

      activities: sql<any[]>`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', act.id,
              'name', act.name,
              'icon', act.icon,
              'weight', act.weight,
              'type', 'activities',
              'paid', CASE WHEN act."isPaid" THEN 1 ELSE NULL END,
              'usp', CASE WHEN act."isUSP" THEN 1 ELSE NULL END
            ) ORDER BY act.weight
          ) FROM activities act
          JOIN "activitiesOnProperties" acop ON act.id = acop."activityId"
          WHERE acop."propertyId" = ${properties.id}),
          '[]'::json
        )
      `.as("activities"),

      collections: sql<string[]>`
        COALESCE(
          (
            SELECT array_agg(c.name ORDER BY c.name)
            FROM "collectionProperties" cp
            JOIN collections c ON cp."collectionId" = c.id
            WHERE cp."propertyId" = ${properties.id}
              AND c."brandId" = ${propertyBrandMappings.brandId}
          ),
          ARRAY[]::text[]
        )
      `.as("collections"),

      safetyHygiene: sql<any[]>`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', sh.id,
              'name', sh.name,
              'icon', sh.icon
            )
          ) FROM "safetyHygiene" sh
          JOIN "safetyHygieneOnProperties" shop ON sh.id = shop."safetyHygieneId"
          WHERE shop."propertyId" = ${properties.id}),
          '[]'::json
        )
      `.as("safetyHygiene"),

      manager: sql<any>`
        (SELECT json_build_object(
          'id', u.id,
          'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
          'email', u.email,
          'phone', u."mobileNumber"
        ) FROM users u
        JOIN "managersOnProperties" mop ON u.id = mop."managerId"
        WHERE mop."propertyId" = ${properties.id} LIMIT 1)
      `.as("manager"),

      caretaker: sql<any>`
        (SELECT json_build_object(
          'id', u.id,
          'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
          'email', u.email,
          'phone', u."mobileNumber"
        ) FROM users u
        JOIN "caretakersOnProperties" cop ON u.id = cop."caretakerId"
        WHERE cop."propertyId" = ${properties.id} LIMIT 1)
      `.as("caretaker"),

      owner: sql<any>`
        (SELECT json_build_object(
          'id', u.id,
          'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
          'email', u.email,
          'phone', u."mobileNumber"
        ) FROM users u
        JOIN "ownersOnProperties" oop ON u.id = oop."ownerId"
        WHERE oop."propertyId" = ${properties.id} LIMIT 1)
      `.as("owner"),

      bookedDates: sql<string[]>`
        COALESCE(
          (SELECT json_agg(bd."date")
            FROM "inventoryCalendar" bd
            WHERE bd."propertyId" = ${properties.id}
          ),
        '[]'
        )
      `.as("bookedDates"),

      discountPlan: sql<any>`
        (SELECT json_build_object(
          'id', dp.id,
          'name', dp.name,
          'discounts', COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', dpv.id,
                  'minDays', dpv."minDays",
                  'discountPercentage', dpv."discountPercentage",
                  'flatDiscount', dpv."flatDiscount"
                ) ORDER BY dpv."minDays"
              )
              FROM "discountPlansValues" dpv
              WHERE dpv."discountPlanId" = dp.id
            ),
            '[]'::json
          )
        ) FROM "propertyDiscountPlans" pdp
        JOIN "discountPlans" dp ON pdp."discountPlanId" = dp.id
        WHERE pdp."propertyId" = ${properties.id}
          AND dp."brandId" = ${propertyBrandMappings.brandId}
        LIMIT 1)
      `.as("discountPlan"),

      shortTermCancellationPlan: sql<any>`
        (SELECT json_build_object(
          'id', pcp."cancellationPlanId",
          'name', cp.name,
          'isActive', cp."isActive",
          'policy', pcp.policy,
          'refunds', COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', cpp.id,
                  'lessThan', cpp."lessThan",
                  'days', cpp."days",
                  'percentage', cpp."percentage"
                ) ORDER BY cpp."days"
              )
              FROM "cancellationPercentages" cpp
              WHERE cpp."cancellationPlanId" = cp.id
            ),
            '[]'::json
          )
        ) FROM "propertyCancellationPlans" pcp
        JOIN "cancellationPlans" cp ON pcp."cancellationPlanId" = cp.id
        WHERE pcp."propertyId" = ${properties.id}
          AND pcp.type = 'shortterm'
          AND cp."brandId" = ${propertyBrandMappings.brandId}
        LIMIT 1)
      `.as("shortTermCancellationPlan"),

      longTermCancellationPlan: sql<any>`
        (SELECT json_build_object(
          'id', pcp."cancellationPlanId",
          'name', cp.name,
          'isActive', cp."isActive",
          'policy', pcp.policy,
          'refunds', COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', cpp.id,
                  'lessThan', cpp."lessThan",
                  'days', cpp."days",
                  'percentage', cpp."percentage"
                ) ORDER BY cpp."days"
              )
              FROM "cancellationPercentages" cpp
              WHERE cpp."cancellationPlanId" = cp.id
            ),
            '[]'::json
          )
        ) FROM "propertyCancellationPlans" pcp
        JOIN "cancellationPlans" cp ON pcp."cancellationPlanId" = cp.id
        WHERE pcp."propertyId" = ${properties.id}
          AND pcp.type = 'longterm'
          AND cp."brandId" = ${propertyBrandMappings.brandId}
        LIMIT 1)
      `.as("longTermCancellationPlan"),

      gallery: sql<any[]>`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', p.id,
              'url', COALESCE(pp."watermarkedUrl", p."originalUrl"),
              'originalUrl', p."originalUrl",
              'name', p."name",
              'order', pp."sortOrder",
              'altText', pp."altText",
              'cover', pp."sortOrder",
              'waterMarked', pp."watermarkedUrl" IS NOT NULL,
              'tag', pp."category"
            ) ORDER BY pp."sortOrder"
          )
          FROM photos p
          JOIN "photoPropertyBrandMapping" pp ON p.id = pp."photoId"
          WHERE pp."propertyBrandMappingId" = ${propertyBrandMappings.id}),
          '[]'::json
        )
      `.as("gallery"),
      amenities: sql<any[]>`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', a.id,
              'name', a.name,
              'icon', a.icon,
              'weight', a.weight,
              'type', 'amenities',
              'paid', CASE WHEN a."isPaid" THEN 1 ELSE NULL END,
              'usp', CASE WHEN a."isUSP" THEN 1 ELSE NULL END
            ) ORDER BY a.weight
          ) FROM amenities a
          JOIN "amenitiesOnProperties" aop ON a.id = aop."amenityId"
          WHERE aop."propertyId" = ${properties.id}),
          '[]'::json
        )
      `.as("amenities"),
    })
    .from(properties)
    .leftJoin(propertyBrandMappings, eq(properties.id, propertyBrandMappings.propertyId))
    .leftJoin(
      propertyBrandBookingSettings,
      eq(propertyBrandBookingSettings.propertyBrandMappingId, propertyBrandMappings.id)
    )
    .leftJoin(brands, eq(propertyBrandMappings.brandId, brands.id))
    .leftJoin(cities, eq(cities.id, properties.cityId))
    .leftJoin(states, eq(states.id, properties.stateId))
    .leftJoin(propertyTypes, eq(propertyTypes.id, properties.propertyTypeId))
);
