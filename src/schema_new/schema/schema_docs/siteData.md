# siteData.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `staticImageSectionEnum` | `"staticImageSection"` | `staticImageSectionOptions` | why_instafarms_carousel, homepage_hero, about_us_banner, testimonials_background, partner_logos, footer_social |

## Tables

### `staticImages` ("staticImages")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `section` | `enum(staticImageSectionEnum)` | NOT NULL |
| `title` | `text` | NOT NULL |
| `description` | `text` | - |
| `desktopImageUrl` | `text` | NOT NULL |
| `desktopImagePath` | `text` | NOT NULL |
| `mobileImageUrl` | `text` | NOT NULL |
| `mobileImagePath` | `text` | NOT NULL |
| `altText` | `text` | - |
| `linkUrl` | `text` | - |
| `sortOrder` | `integer` | default set |
| `isActive` | `boolean` | default set |

Additional key/check/index rules:
- `INDEX: static_images_brand_id_idx`
- `INDEX: static_images_section_idx`
- `INDEX: static_images_sort_order_idx`
- `INDEX: static_images_is_active_idx`

### `faqs` ("faqs")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `question` | `text` | NOT NULL |
| `answer` | `text` | NOT NULL |
| `category` | `text` | - |
| `weight` | `integer` | default set |

Additional key/check/index rules:
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `cms` ("cms")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `title` | `text` | NOT NULL, UNIQUE |
| `heading` | `text` | NOT NULL |
| `subHeading` | `text` | - |
| `content` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| `photo` | `uuid` | FK -> photos.id |
| `isActive` | `boolean` | default set |
| `meta` | `jsonb` | default set |

Additional key/check/index rules:
- `UNIQUE: cms_brand_slug_unique`
- `INDEX: cms_brand_id_idx`

### `carousel` ("carousel")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `heading` | `text` | NOT NULL |
| `subHeading` | `text` | - |
| `weight` | `integer` | default set |
| `property` | `uuid` | FK -> properties.id |

Additional key/check/index rules:
- `INDEX: carousel_brand_id_idx`

### `singlePages` ("singlePages ")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `oldId` | `text` | UNIQUE |
| `oldFaqId` | `text` | UNIQUE |
| `title` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL |
| `meta` | `jsonb` | default set |
| `isFaqsEnabled` | `boolean` | default set |
| `faqs` | `jsonb` | default set |

Additional key/check/index rules:
- `UNIQUE: single_pages_brand_slug_unique`
- `INDEX: single_pages_brand_id_idx`

### `carouselPhotos` ("carouselPhotos")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `carouselId` | `uuid` | NOT NULL, FK -> carousel.id (onDelete: cascade) |
| `photoId` | `uuid` | NOT NULL, FK -> photos.id (onDelete: cascade) |
| `key` | `text` | NOT NULL |

Additional key/check/index rules:
- `INDEX: carousel_photos_carousel_id_idx`
- `INDEX: carousel_photos_photo_id_idx`
- `PRIMARY KEY: composite key defined in callback`

### `settings` ("settings")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `text` | NOT NULL |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `value` | `json` | - |
| `description` | `text` | - |
| `watermarkUrl` | `text` | - |

Additional key/check/index rules:
- `INDEX: settings_brand_id_idx`
- `PRIMARY KEY: composite key defined in callback`

### `globalConstants` ("globalConstants")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `key` | `text` | NOT NULL, UNIQUE |
| `value` | `text` | NOT NULL |
| `description` | `text` | - |
| `dataType` | `text` | NOT NULL, default set |
| `isActive` | `boolean` | NOT NULL, default set |

Additional key/check/index rules:
- `INDEX: global_constants_key_idx`
- `INDEX: global_constants_is_active_idx`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
