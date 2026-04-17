# location.ts

## Enums

No enums defined in this file.

## Tables

### `states` ("states")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `state` | `text` | NOT NULL, UNIQUE |

### `cities` ("cities")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `city` | `text` | NOT NULL |
| `stateId` | `uuid` | NOT NULL, FK -> states.id (onDelete: restrict) |

### `areas` ("areas")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `area` | `text` | NOT NULL |
| `cityId` | `uuid` | FK -> cities.id (onDelete: restrict) |

### `brandsOnStates` ("brandsOnStates")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `stateId` | `uuid` | NOT NULL, FK -> states.id (onDelete: cascade) |
| `slug` | `text` | - |
| `heading` | `text` | - |
| `description` | `text` | - |
| `isActive` | `boolean` | NOT NULL, default set |
| `weight` | `decimal(5,2)` | NOT NULL, default set |
| `featured` | `boolean` | NOT NULL, default set |
| `icon` | `text` | - |
| `faqs` | `jsonb` | default set |
| `info` | `jsonb` | default set |
| `meta` | `jsonb` | default set |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`

### `brandsOnCities` ("brandsOnCities")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `cityId` | `uuid` | NOT NULL, FK -> cities.id (onDelete: cascade) |
| `slug` | `text` | - |
| `heading` | `text` | - |
| `description` | `text` | - |
| `isActive` | `boolean` | NOT NULL, default set |
| `weight` | `decimal(5,2)` | NOT NULL, default set |
| `featured` | `boolean` | NOT NULL, default set |
| `icon` | `text` | - |
| `faqs` | `jsonb` | default set |
| `info` | `jsonb` | default set |
| `meta` | `jsonb` | default set |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`

### `brandsOnAreas` ("brandsOnAreas")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `areaId` | `uuid` | NOT NULL, FK -> areas.id (onDelete: cascade) |
| `slug` | `text` | - |
| `heading` | `text` | - |
| `description` | `text` | - |
| `isActive` | `boolean` | NOT NULL, default set |
| `weight` | `decimal(5,2)` | NOT NULL, default set |
| `featured` | `boolean` | NOT NULL, default set |
| `icon` | `text` | - |
| `faqs` | `jsonb` | default set |
| `info` | `jsonb` | default set |
| `meta` | `jsonb` | default set |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`

### `landmarks` ("landmarks")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `landmark` | `text` | NOT NULL |
| `slug` | `text` | UNIQUE |
| `icon` | `text` | - |
| `primaryAreaId` | `uuid` | NOT NULL, FK -> areas.id (onDelete: restrict) |

Additional key/check/index rules:
- `INDEX: landmarks_primary_area_id_idx`
- `INDEX: landmarks_slug_idx`

### `nearbyLocations` ("nearbyLocations")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `areaId` | `uuid` | NOT NULL, FK -> areas.id (onDelete: restrict) |
| `nearbyAreaId1` | `uuid` | FK -> areas.id (onDelete: restrict) |
| `nearbyAreaId2` | `uuid` | FK -> areas.id (onDelete: restrict) |
| `nearbyAreaId3` | `uuid` | FK -> areas.id (onDelete: restrict) |
| `nearbyAreaId4` | `uuid` | FK -> areas.id (onDelete: restrict) |

Additional key/check/index rules:
- `INDEX: nearby_locations_area_id_idx`

## Views

| View Const | DB View |
|---|---|
| `areaDetailView` | `"areaDetailView"` |
