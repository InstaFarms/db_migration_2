# proposal.ts

## Enums

No enums defined in this file.

## Tables

### `proposals` ("proposals")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `slug` | `text` | NOT NULL, UNIQUE |
| `status` | `text` | NOT NULL, default set |
| `validTill` | `timestamp` | - |
| `brandId` | `uuid` | FK -> brands.id (onDelete: cascade) |
| `customerId` | `uuid` | FK -> customers.id (onDelete: cascade) |
| `checkinDate` | `date` | - |
| `checkoutDate` | `date` | - |
| `adultCount` | `integer` | default set |
| `childrenCount` | `integer` | default set |
| `infantCount` | `integer` | default set |
| `floatingAdultCount` | `integer` | default set |
| `floatingChildrenCount` | `integer` | default set |
| `floatingInfantCount` | `integer` | default set |
| `notes` | `text` | - |

### `proposalItems` ("proposalItems")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `proposalId` | `uuid` | NOT NULL, FK -> proposals.id (onDelete: cascade) |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `order` | `integer` | NOT NULL, default set |

Additional key/check/index rules:
- `INDEX: proposal_items_proposal_id_idx`

## Views

No views defined in this file.
