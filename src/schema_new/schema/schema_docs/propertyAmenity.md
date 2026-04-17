# propertyAmenity.ts

## Enums

No enums defined in this file.

## Tables

### `amenities` ("amenities")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL, UNIQUE |
| `icon` | `text` | NOT NULL |
| `weight` | `integer` | - |
| `isPaid` | `boolean` | NOT NULL, default set |
| `isUSP` | `boolean` | NOT NULL, default set |

### `amenitiesOnProperties` ("amenitiesOnProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `amenityId` | `uuid` | NOT NULL, FK -> amenities.id (onDelete: cascade) |
| `weight` | `integer` | - |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
