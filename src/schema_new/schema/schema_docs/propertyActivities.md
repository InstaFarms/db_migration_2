# propertyActivities.ts

## Enums

No enums defined in this file.

## Tables

### `activities` ("activities")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL, UNIQUE |
| `icon` | `text` | NOT NULL |
| `weight` | `integer` | - |
| `isPaid` | `boolean` | NOT NULL, default set |
| `isUSP` | `boolean` | NOT NULL, default set |

### `activitiesOnProperties` ("activitiesOnProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `activityId` | `uuid` | NOT NULL, FK -> activities.id (onDelete: cascade) |
| `weight` | `integer` | - |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
