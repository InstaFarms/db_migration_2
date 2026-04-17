# propertySafety.ts

## Enums

No enums defined in this file.

## Tables

### `safetyHygiene` ("safetyHygiene")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL, UNIQUE |
| `icon` | `text` | - |

### `safetyHygieneOnProperties` ("safetyHygieneOnProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `safetyHygieneId` | `uuid` | NOT NULL, FK -> safetyHygiene.id (onDelete: cascade) |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
