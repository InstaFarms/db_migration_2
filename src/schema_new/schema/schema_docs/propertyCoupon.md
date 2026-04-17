# propertyCoupon.ts

## Enums

No enums defined in this file.

## Tables

### `coupons` ("coupons")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `name` | `text` | NOT NULL |
| `code` | `text` | NOT NULL |
| `discountPercentage` | `decimal(5,2)` | - |
| `flatDiscount` | `integer` | - |
| `maxDiscountAmount` | `integer` | NOT NULL |
| `minOrderValue` | `integer` | NOT NULL, default set |
| `newUsersOnly` | `boolean` | default set |
| `applicableDays` | `jsonb` | - |
| `isActive` | `boolean` | default set |
| `usedCount` | `integer` | NOT NULL, default set |
| `validFrom` | `timestamp` | NOT NULL |
| `validUntil` | `timestamp` | NOT NULL |

Additional key/check/index rules:
- `UNIQUE: coupons_brand_code_unique`
- `INDEX: coupons_code_idx`
- `INDEX: coupons_brand_id_idx`
- `INDEX: coupons_is_active_idx`
- `CHECK: max_discount_amount_positive`
- `CHECK: min_order_value_positive`
- `CHECK: valid_until_after_from`

### `propertyCoupons` ("propertyCoupons")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id |
| `couponId` | `uuid` | NOT NULL, FK -> coupons.id |
| `allowed` | `boolean` | NOT NULL, default set |

Additional key/check/index rules:
- `PRIMARY KEY: composite key defined in callback`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
