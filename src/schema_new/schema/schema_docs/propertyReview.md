# propertyReview.ts

## Enums

No enums defined in this file.

## Tables

### `reviews` ("reviews")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `bookingId` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `customerId` | `uuid` | NOT NULL, FK -> customers.id (onDelete: cascade) |
| `staffServiceRating` | `integer` | - |
| `ambienceRating` | `integer` | - |
| `roomMaintenanceRating` | `integer` | - |
| `outdoorMaintenanceRating` | `integer` | - |
| `lawnMaintenanceRating` | `integer` | - |
| `poolMaintenanceRating` | `integer` | - |
| `extraMattressesLinenRating` | `integer` | - |
| `overallRating` | `integer` | NOT NULL |
| `comment` | `text` | - |
| `isVerified` | `boolean` | NOT NULL, default set |
| `stayDuration` | `integer` | - |

Additional key/check/index rules:
- `INDEX: reviews_property_id_idx`
- `INDEX: reviews_customer_id_idx`
- `INDEX: reviews_overall_rating_idx`
- `CHECK: overall_rating_valid`
- `CHECK: stay_duration_positive`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `reviewMagicLinks` ("reviewMagicLinks")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `bookingId` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `customerId` | `uuid` | NOT NULL, FK -> customers.id (onDelete: cascade) |
| `propertyId` | `uuid` | FK -> properties.id (onDelete: cascade) |
| `shortCode` | `text` | NOT NULL, UNIQUE |
| `tokenHash` | `text` | NOT NULL, UNIQUE |
| `expiresAt` | `timestamp` | NOT NULL |
| `usedAt` | `timestamp` | - |

Additional key/check/index rules:
- `INDEX: review_magic_links_customer_id_idx`
- `INDEX: review_magic_links_property_id_idx`
- `INDEX: review_magic_links_short_code_idx`
- `INDEX: review_magic_links_expires_at_idx`
- `INDEX: review_magic_links_used_at_idx`

## Views

No views defined in this file.
