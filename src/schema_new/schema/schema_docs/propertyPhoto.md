# propertyPhoto.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `photoCategoryEnum` | `"photoCategory"` | `photoCategoryOptions` | OUTDOORS, INDOORS, BED_BATH, AMENITIES, OTHERS |

## Tables

### `photos` ("photos")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | - |
| `originalUrl` | `text` | NOT NULL |
| `blurHash` | `text` | - |
| `fileSize` | `integer` | - |
| `mimeType` | `text` | - |
| `width` | `integer` | - |
| `height` | `integer` | - |
| `aspectRatio` | `numeric(4,2)` | - |

Additional key/check/index rules:
- `INDEX: photos_original_url_idx`
- `INDEX: photos_mime_type_idx`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `photoPropertyBrandMapping` ("photoPropertyBrandMapping")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `photoId` | `uuid` | NOT NULL, FK -> photos.id (onDelete: cascade) |
| `propertyBrandMappingId` | `uuid` | NOT NULL, FK -> propertyBrandMappings.id (onDelete: cascade) |
| `watermarkedUrl` | `text` | NOT NULL |
| `altText` | `text` | - |
| `category` | `enum(photoCategoryEnum)` | NOT NULL, default set |
| `sortOrder` | `integer` | NOT NULL |
| `isFeatured` | `boolean` | NOT NULL, default set |

Additional key/check/index rules:
- `UNIQUE: photo_property_brand_category_sort_unique`
- `INDEX: photo_property_brand_mapping_property_brand_id_idx`
- `INDEX: photo_property_brand_mapping_photo_id_idx`
- `INDEX: photo_property_brand_mapping_brand_category_sort_idx`
- `INDEX: photo_property_brand_mapping_brand_featured_idx`
- `PRIMARY KEY: composite key defined in callback`

## Views

No views defined in this file.
