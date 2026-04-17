# propertyTag.ts

## Enums

No enums defined in this file.

## Tables

### `tags` ("tags")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL, UNIQUE |
| `color` | `text` | - |

### `propertyTags` ("property_tags")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `tagId` | `uuid` | NOT NULL, FK -> tags.id (onDelete: cascade) |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`

## Views

No views defined in this file.
