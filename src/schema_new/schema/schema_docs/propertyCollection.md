# propertyCollection.ts

## Enums

No enums defined in this file.

## Tables

### `collections` ("collections")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `name` | `text` | NOT NULL |
| `description` | `text` | - |
| `heading` | `text` | - |
| `slug` | `text` | - |
| `weight` | `integer` | NOT NULL, default set |
| `hpc` | `integer` | - |
| `logo` | `text` | - |
| `altText` | `text` | - |
| `isActive` | `boolean` | NOT NULL, default set |
| `meta` | `jsonb` | default set |
| `faqs` | `jsonb` | default set |
| `info` | `jsonb` | - |

Additional key/check/index rules:
- `UNIQUE: collections_brand_slug_unique`
- `UNIQUE: collections_brand_name_unique`
- `INDEX: collections_brand_id_idx`

### `collectionProperties` ("collectionProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `collectionId` | `uuid` | NOT NULL, FK -> collections.id (onDelete: cascade) |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`

## Views

No views defined in this file.
