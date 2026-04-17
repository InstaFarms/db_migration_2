# property.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `propertyAreaTypeEnum` | `"property_area_type"` | `propertyAreaTypeOptions` | PRIMARY, SECONDARY |
| `propertyDerivativeTypeByBrandEnum` | `"propertyDerivativeTypeByBrand"` | `propertyDerivativeTypeByBrandOptions` | NORMAL, MERGE, SPLIT |
| `bookingTypeEnum` | `"bookingType"` | `bookingTypeOptions` | Online, Offline |
| `dayOfWeekEnum` | `"day_of_week"` | `dayOfWeekOptions` | MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY |

## Tables

### `propertyTypes` ("propertyTypes")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |

### `properties` ("properties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyName` | `text` | NOT NULL |
| `propertyCode` | `text` | NOT NULL |
| `propertyCodeName` | `text` | - |
| `isDisabled` | `boolean` | NOT NULL, default set |
| `bedroomCount` | `integer` | NOT NULL, default set |
| `bathroomCount` | `integer` | NOT NULL, default set |
| `doubleBedCount` | `integer` | NOT NULL, default set |
| `singleBedCount` | `integer` | NOT NULL, default set |
| `mattressCount` | `integer` | NOT NULL, default set |
| `baseGuestCount` | `integer` | NOT NULL, default set |
| `maxGuestCount` | `integer` | NOT NULL, default set |
| `latitude` | `decimal(9,6)` | - |
| `longitude` | `decimal(9,6)` | - |
| `mapLink` | `text` | - |
| `address` | `text` | - |
| `landmark` | `text` | - |
| `village` | `text` | - |
| `cityId` | `uuid` | FK -> cities.id (onDelete: restrict) |
| `stateId` | `uuid` | FK -> states.id (onDelete: restrict) |
| `pincode` | `text` | - |
| `propertyTypeId` | `uuid` | FK -> propertyTypes.id (onDelete: restrict) |
| `googlePlaceId` | `text` | - |
| `googlePlaceRating` | `decimal(5,2)` | - |
| `googlePlaceUserRatingCount` | `integer` | - |
| `nearbyPlaces` | `jsonb` | NOT NULL, default set |
| `googlePlaceReviews` | `jsonb` | NOT NULL, default set |

Additional key/check/index rules:
- `UNIQUE: properties_property_code_unique`
- `INDEX: properties_property_code_idx`
- `INDEX: properties_city_id_idx`
- `INDEX: properties_state_id_idx`
- `INDEX: properties_property_type_id_idx`
- `CHECK: properties_bedroom_count_non_negative`
- `CHECK: properties_bathroom_count_non_negative`
- `CHECK: properties_double_bed_count_non_negative`
- `CHECK: properties_single_bed_count_non_negative`
- `CHECK: properties_mattress_count_non_negative`
- `CHECK: properties_base_guest_count_non_negative`
- `CHECK: properties_max_guest_count_non_negative`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `propertyAreaMappings` ("property_area_mappings")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `areaId` | `uuid` | NOT NULL, FK -> areas.id (onDelete: restrict) |
| `areaType` | `enum(propertyAreaTypeEnum)` | NOT NULL |
| `sortOrder` | `integer` | NOT NULL, default set |

Additional key/check/index rules:
- `UNIQUE: property_area_mappings_property_area_unique`
- `INDEX: property_area_mappings_property_id_idx`
- `INDEX: property_area_mappings_area_id_idx`

### `propertyBrandMappings` ("property_brand_mappings")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `propertyDerivativeType` | `enum(propertyDerivativeTypeByBrandEnum)` | NOT NULL, default set |
| `isActive` | `boolean` | NOT NULL, default set |
| `slug` | `text` | NOT NULL |
| `heading` | `text` | - |
| `description` | `text` | default set |
| `exploreYourStay` | `text` | - |
| `weight` | `decimal(8,2)` | NOT NULL, default set |
| `faqs` | `jsonb` | NOT NULL, default set |
| `photos` | `jsonb` | NOT NULL, default set |
| `homeRulesTruths` | `jsonb` | NOT NULL, default set |
| `sections` | `jsonb` | NOT NULL, default set |
| `meta` | `jsonb` | NOT NULL, default set |

Additional key/check/index rules:
- `UNIQUE: property_brand_mappings_property_brand_unique`
- `UNIQUE: property_brand_mappings_brand_slug_unique`
- `INDEX: property_brand_mappings_property_id_idx`
- `INDEX: property_brand_mappings_brand_id_idx`
- `INDEX: property_brand_mappings_slug_idx`
- `CHECK: property_brand_mappings_weight_non_negative`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `propertyBrandBookingSettings` ("property_brand_booking_settings")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyBrandMappingId` | `uuid` | NOT NULL, FK -> propertyBrandMappings.id (onDelete: cascade) |
| `allowCallBooking` | `boolean` | NOT NULL, default set |
| `allowEnquiry` | `boolean` | NOT NULL, default set |
| `allowOnlineBooking` | `boolean` | NOT NULL, default set |
| `bookingType` | `enum(bookingTypeEnum)` | - |
| `checkinTime` | `time` | - |
| `checkoutTime` | `time` | - |
| `bookingPolicy` | `text` | NOT NULL, default set |
| `requiresConfirmation` | `boolean` | NOT NULL, default set |
| `advancePaymentEnabled` | `boolean` | NOT NULL, default set |
| `advancePaymentAmount` | `integer` | - |
| `advancePaymentPercentage` | `decimal(5,2)` | - |
| `enableFloatingGuests` | `boolean` | NOT NULL, default set |
| `commissionPercentage` | `decimal(5,2)` | NOT NULL, default set |
| `securityDeposit` | `integer` | NOT NULL, default set |
| `cookingAccessFee` | `integer` | NOT NULL, default set |

Additional key/check/index rules:
- `UNIQUE: property_brand_booking_settings_mapping_unique`
- `INDEX: property_brand_booking_settings_mapping_id_idx`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `propertyBrandPricingRules` ("property_brand_pricing_rules")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyBrandMappingId` | `uuid` | NOT NULL, FK -> propertyBrandMappings.id (onDelete: cascade) |
| `dayOfWeek` | `enum(dayOfWeekEnum)` | NOT NULL |
| `basePrice` | `integer` | - |
| `basePriceWithGst` | `integer` | - |
| `adultExtraGuestCharge` | `integer` | - |
| `adultExtraGuestChargeWithGst` | `integer` | - |
| `childExtraGuestCharge` | `integer` | - |
| `childExtraGuestChargeWithGst` | `integer` | - |
| `infantExtraGuestCharge` | `integer` | - |
| `infantExtraGuestChargeWithGst` | `integer` | - |
| `floatingAdultExtraGuestCharge` | `integer` | - |
| `floatingAdultExtraGuestChargeWithGst` | `integer` | - |
| `floatingChildExtraGuestCharge` | `integer` | - |
| `floatingChildExtraGuestChargeWithGst` | `integer` | - |
| `floatingInfantExtraGuestCharge` | `integer` | - |
| `floatingInfantExtraGuestChargeWithGst` | `integer` | - |
| `baseGuestCount` | `integer` | - |
| `discount` | `integer` | - |
| `gstSlab` | `decimal(5,2)` | - |
| `maxExtraGuestPrice` | `integer` | - |
| `maxTotal` | `integer` | - |

Additional key/check/index rules:
- `UNIQUE: property_brand_pricing_rules_mapping_day_unique`
- `INDEX: property_brand_pricing_rules_mapping_id_idx`

### `specialDates` ("specialDates")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `date` | `date` | NOT NULL |
| `price` | `integer` | - |
| `priceWithGST` | `integer` | - |
| `adultExtraGuestCharge` | `integer` | - |
| `adultExtraGuestChargeWithGST` | `integer` | - |
| `childExtraGuestCharge` | `integer` | - |
| `childExtraGuestChargeWithGST` | `integer` | - |
| `infantExtraGuestCharge` | `integer` | - |
| `infantExtraGuestChargeWithGST` | `integer` | - |
| `floatingAdultExtraGuestCharge` | `integer` | - |
| `floatingAdultExtraGuestChargeWithGST` | `integer` | - |
| `floatingChildExtraGuestCharge` | `integer` | - |
| `floatingChildExtraGuestChargeWithGST` | `integer` | - |
| `floatingInfantExtraGuestCharge` | `integer` | - |
| `floatingInfantExtraGuestChargeWithGST` | `integer` | - |
| `baseGuestCount` | `integer` | - |
| `discount` | `integer` | - |
| `gstSlab` | `integer` | - |
| `maxExtraGuestPrice` | `integer` | - |
| `maxTotal` | `integer` | - |

Additional key/check/index rules:
- `UNIQUE: property_brand_date_unique`
- `INDEX: special_dates_property_id_idx`
- `INDEX: special_dates_brand_id_idx`
- `INDEX: special_dates_date_idx`
- `CHECK: special_date_price_positive`
- `CHECK: special_date_base_guest_positive`
- `CHECK: special_date_discount_valid`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `splitPropertyMappings` ("splitPropertyMappings")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `parentPropertyId` | `uuid` | NOT NULL, FK -> propertyBrandMappings.id (onDelete: cascade) |
| `childPropertyId` | `uuid` | NOT NULL, FK -> propertyBrandMappings.id (onDelete: cascade) |

Additional key/check/index rules:
- `UNIQUE: split_unique_child`
- `INDEX: split_parent_idx`
- `PRIMARY KEY: composite key defined in callback`

### `mergedPropertyMappings` ("mergedPropertyMappings")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `mergedPropertyId` | `uuid` | NOT NULL, FK -> propertyBrandMappings.id (onDelete: cascade) |
| `constituentPropertyId` | `uuid` | NOT NULL, FK -> propertyBrandMappings.id (onDelete: cascade) |

Additional key/check/index rules:
- `UNIQUE: merge_unique_constituent`
- `INDEX: merge_parent_idx`
- `PRIMARY KEY: composite key defined in callback`

## Views

| View Const | DB View |
|---|---|
| `propertyDetailView` | `"propertyDetailView"` |
