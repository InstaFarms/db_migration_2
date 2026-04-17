# other.ts

## Enums

No enums defined in this file.

## Tables

### `extraPlans` ("extraPlans")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL, UNIQUE |
| `description` | `text` | - |
| `price` | `integer` | NOT NULL |
| `category` | `text` | - |
| `isActive` | `boolean` | default set |
| `terms` | `text` | - |

Additional key/check/index rules:
- `INDEX: extra_plans_name_idx`
- `INDEX: extra_plans_is_active_idx`
- `CHECK: extra_plan_price_positive`

## Views

No views defined in this file.
