# brand.ts

## Enums

No enums defined in this file.

## Tables

### `brands` ("brands")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL, UNIQUE |
| `domain` | `text` | - |
| `isActive` | `boolean` | NOT NULL, default set |
| `createdAt` | `timestamp` | NOT NULL |
| `updatedAt` | `timestamp` | NOT NULL |
| `adminCreatedBy` | `uuid` | NOT NULL |
| `adminUpdatedBy` | `uuid` | NOT NULL |

## Views

No views defined in this file.
