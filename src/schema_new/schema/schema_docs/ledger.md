# ledger.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `platformLedgerReferenceTypeEnum` | `"platformLedgerReferenceType"` | `platformLedgerReferenceTypeOptions` | BOOKING, CANCELLATION, REFUND, MILESTONE_ADJUSTMENT, MANUAL_ADJUSTMENT |
| `platformLedgerEntryTypeEnum` | `"platformLedgerEntryType"` | `platformLedgerEntryTypeOptions` | CREDIT, DEBIT |
| `platformLedgerCategoryEnum` | `"platformLedgerCategory"` | `platformLedgerCategoryOptions` | COMMISSION, CANCELLATION_COMMISSION, REFUND_LOSS, GOODWILL, MILESTONE_ADJUSTMENT, MANUAL |

## Tables

### `platformLedger` ("platform_ledger")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brand_id` | `uuid` | NOT NULL, FK -> brands.id (onDelete: restrict) |
| `reference_type` | `enum(platformLedgerReferenceTypeEnum)` | NOT NULL |
| `reference_id` | `uuid` | NOT NULL |
| `booking_id` | `uuid` | nullable, FK -> bookings.id (onDelete: set null) |
| `property_id` | `uuid` | nullable, FK -> properties.id (onDelete: set null) |
| `owner_id` | `uuid` | nullable, FK -> users.id (onDelete: set null) |
| `entry_type` | `enum(platformLedgerEntryTypeEnum)` | NOT NULL |
| `amount_excl_commission_gst` | `real` | NOT NULL, default `0` |
| `commission_gst_rate` | `integer` | nullable, allowed: `5, 18, 28` |
| `commission_gst_amount` | `real` | NOT NULL, default `0` |
| `amount_incl_commission_gst` | `real` | NOT NULL, default `0` |
| `effective_commission_rate_excl_gst` | `real` | nullable, valid `0..100` |
| `currency` | `text` | NOT NULL, default `INR` |
| `category` | `enum(platformLedgerCategoryEnum)` | NOT NULL |
| `is_owner_gst_registered` | `boolean` | NOT NULL, default `false` |
| `description` | `text` | nullable |
| `metadata` | `jsonb` | NOT NULL, default `{}` |
| `accounting_date` | `date` | NOT NULL |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |

Additional key/check/index rules:
- `INDEX: platform_ledger_brand_id_idx`
- `INDEX: platform_ledger_reference_type_idx`
- `INDEX: platform_ledger_reference_id_idx`
- `INDEX: platform_ledger_booking_id_idx`
- `INDEX: platform_ledger_property_id_idx`
- `INDEX: platform_ledger_owner_id_idx`
- `INDEX: platform_ledger_entry_type_idx`
- `INDEX: platform_ledger_category_idx`
- `INDEX: platform_ledger_accounting_date_idx`
- `INDEX: platform_ledger_created_at_idx`
- `CHECK: platform_ledger_amount_excl_non_negative`
- `CHECK: platform_ledger_commission_gst_rate_valid`
- `CHECK: platform_ledger_commission_gst_amount_non_negative`
- `CHECK: platform_ledger_amount_incl_non_negative`
- `CHECK: platform_ledger_amount_formula_valid`
- `CHECK: platform_ledger_effective_rate_valid`
- `CHECK: platform_ledger_currency_not_empty`
- `CHECK: platform_ledger_reference_consistent`

## Views

No views defined in this file.
