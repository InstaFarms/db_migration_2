# propertySpace.ts

## Enums

No enums defined in this file.

## Tables

### `spaces` ("spaces")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |

### `spaceProperties` ("spaceProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `photo` | `uuid` | FK -> photos.id (onDelete: set null) |
| `name` | `text` | NOT NULL, UNIQUE |
| `title` | `text` | NOT NULL |
| `description` | `text` | NOT NULL |

Additional key/check/index rules:
- `INDEX: space_properties_property_id_idx`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
