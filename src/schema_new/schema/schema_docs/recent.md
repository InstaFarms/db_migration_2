# recent.ts

## Enums

No enums defined in this file.

## Tables

### `recentlyVisited` ("recentlyVisited")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK, NOT NULL |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `userIdentifier` | `text` | NOT NULL |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `visitedAt` | `timestamp` | NOT NULL |

Additional key/check/index rules:
- `UNIQUE: recentlyVisited_userIdentifier_propertyId_brandId_unique`
- `INDEX: recentlyVisited_brand_id_idx`
- `INDEX: recentlyVisited_userIdentifier_idx`
- `INDEX: recentlyVisited_visitedAt_idx`

### `recentSearches` ("recentSearches")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK, NOT NULL |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `userIdentifier` | `text` | NOT NULL |
| `location` | `text` | - |
| `checkInDate` | `date` | - |
| `checkOutDate` | `date` | - |
| `adults` | `integer` | default set |
| `children` | `integer` | default set |
| `infants` | `integer` | default set |
| `pets` | `integer` | default set |
| `searchedAt` | `timestamp` | NOT NULL |

Additional key/check/index rules:
- `INDEX: recentSearches_brand_id_idx`
- `INDEX: recentSearches_userIdentifier_idx`
- `INDEX: recentSearches_searchedAt_idx`

## Views

No views defined in this file.
