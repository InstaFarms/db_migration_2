# customer.ts

## Enums

No enums defined in this file.

## Tables

### `customers` ("customers")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | FK -> brands.id (onDelete: cascade) |
| `firstName` | `varchar` | NOT NULL |
| `lastName` | `varchar` | - |
| `email` | `text` | - |
| `dob` | `date` | - |
| `mobileNumber` | `varchar(20)` | NOT NULL |
| `gender` | `enum(genderEnum)` | NOT NULL |
| `favorites` | `json` | default set |
| `expoPushToken` | `text` | - |

Additional key/check/index rules:
- `INDEX: customers_mobile_number_idx`
- `INDEX: customers_email_idx`

## Views

No views defined in this file.
