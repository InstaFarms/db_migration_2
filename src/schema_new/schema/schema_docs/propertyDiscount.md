# propertyDiscount.ts

## Enums

No enums defined in this file.

## Tables

### `discountPlans` ("discountPlans")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `name` | `text` | NOT NULL |
| `isActive` | `boolean` | NOT NULL, default set |

Additional key/check/index rules:
- `UNIQUE: discount_plans_brand_name_unique`
- `INDEX: discount_plans_name_idx`
- `INDEX: discount_plans_brand_id_idx`
- `INDEX: discount_plans_is_active_idx`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `discountPlansValues` ("discountPlansValues")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `discountPlanId` | `uuid` | NOT NULL, FK -> discountPlans.id (onDelete: cascade) |
| `minDays` | `integer` | NOT NULL |
| `discountPercentage` | `decimal(5,2)` | - |
| `flatDiscount` | `integer` | - |

Additional key/check/index rules:
- `INDEX: discount_plans_values_discount_plan_id_idx`
- `INDEX: discount_plans_values_min_days_idx`

### `propertyDiscountPlans` ("propertyDiscountPlans")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `discountPlanId` | `uuid` | NOT NULL, FK -> discountPlans.id (onDelete: restrict) |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
