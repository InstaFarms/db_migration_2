# propertyCancellation.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `cancellationPlanTypes` | `"cancellationPlanType"` | `cancellationPlanTypeOptions` | longterm, shortterm |

## Tables

### `cancellationPlans` ("cancellationPlans")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `name` | `text` | NOT NULL |
| `isActive` | `boolean` | default set |

Additional key/check/index rules:
- `UNIQUE: cancellation_plans_brand_name_unique`
- `INDEX: cancellation_plans_brand_id_idx`

### `cancellationPercentages` ("cancellationPercentages")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `cancellationPlanId` | `uuid` | NOT NULL, FK -> cancellationPlans.id |
| `percentage` | `decimal(5,2)` | NOT NULL |
| `days` | `integer` | NOT NULL |
| `lessThan` | `boolean` | default set |

### `propertyCancellationPlans` ("propertyCancellationPlans")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `cancellationPlanId` | `uuid` | NOT NULL, FK -> cancellationPlans.id (onDelete: restrict) |
| `type` | `enum(cancellationPlanTypes)` | - |
| `policy` | `text` | default set |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
