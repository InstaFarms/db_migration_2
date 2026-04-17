# tdsAndGst.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `tdsRecordReferenceTypeEnum` | `"tdsRecordReferenceType"` | `tdsRecordReferenceTypeOptions` | BOOKING, CANCELLATION, ADJUSTMENT |
| `tdsRecordEntryTypeEnum` | `"tdsRecordEntryType"` | `tdsRecordEntryTypeOptions` | CREDIT, DEBIT |
| `gstRecordTypeEnum` | `"gstRecordType"` | `gstRecordTypeOptions` | BOOKING_GST, COMMISSION_GST |
| `gstRecordReferenceTypeEnum` | `"gstRecordReferenceType"` | `gstRecordReferenceTypeOptions` | BOOKING, CANCELLATION, ADJUSTMENT |
| `gstRecordLiabilityHolderEnum` | `"gstRecordLiabilityHolder"` | `gstRecordLiabilityHolderOptions` | PLATFORM, OWNER |
| `gstRecordEntryDirectionEnum` | `"gstRecordEntryDirection"` | `gstRecordEntryDirectionOptions` | DEBIT, CREDIT |

## Tables

### `tdsRecords` ("tds_records")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brand_id` | `uuid` | NOT NULL, FK -> brands.id (onDelete: restrict) |
| `booking_id` | `uuid` | nullable, FK -> bookings.id (onDelete: set null) |
| `owner_id` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `property_id` | `uuid` | NOT NULL, FK -> properties.id (onDelete: restrict) |
| `reference_type` | `enum(tdsRecordReferenceTypeEnum)` | NOT NULL |
| `reference_id` | `text` | NOT NULL |
| `base_amount` | `real` | NOT NULL |
| `tds_rate` | `real` | NOT NULL, valid `0..1` |
| `tds_base_amount` | `real` | NOT NULL |
| `tds_amount` | `real` | NOT NULL |
| `currency` | `text` | NOT NULL, default `INR` |
| `entry_type` | `enum(tdsRecordEntryTypeEnum)` | NOT NULL |
| `stay_month` | `integer` | NOT NULL, `1..12` |
| `stay_year` | `integer` | NOT NULL, `>=2000` |
| `tax_event_month` | `integer` | NOT NULL, `1..12` |
| `tax_event_year` | `integer` | NOT NULL, `>=2000` |
| `remarks` | `text` | nullable |
| `metadata` | `jsonb` | NOT NULL, default `{}` |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |

Additional key/check/index rules:
- `INDEX: tds_records_brand_id_idx`
- `INDEX: tds_records_booking_id_idx`
- `INDEX: tds_records_owner_id_idx`
- `INDEX: tds_records_property_id_idx`
- `INDEX: tds_records_reference_type_idx`
- `INDEX: tds_records_reference_id_idx`
- `INDEX: tds_records_entry_type_idx`
- `INDEX: tds_records_tax_event_year_month_idx`
- `INDEX: tds_records_stay_year_month_idx`
- `INDEX: tds_records_created_at_idx`
- `CHECK: tds_records_base_amount_non_negative`
- `CHECK: tds_records_tds_rate_valid`
- `CHECK: tds_records_tds_base_non_negative`
- `CHECK: tds_records_tds_amount_non_negative`
- `CHECK: tds_records_currency_not_empty`
- `CHECK: tds_records_stay_month_valid`
- `CHECK: tds_records_tax_event_month_valid`
- `CHECK: tds_records_stay_year_valid`
- `CHECK: tds_records_tax_event_year_valid`

### `gstRecords` ("gst_records")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | nullable, FK -> bookings.id (onDelete: set null) |
| `owner_id` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `property_id` | `uuid` | NOT NULL, FK -> properties.id (onDelete: restrict) |
| `brand_id` | `uuid` | NOT NULL, FK -> brands.id (onDelete: restrict) |
| `gst_type` | `enum(gstRecordTypeEnum)` | NOT NULL |
| `reference_type` | `enum(gstRecordReferenceTypeEnum)` | NOT NULL |
| `reference_id` | `text` | NOT NULL |
| `taxable_amount_excl_gst` | `real` | NOT NULL |
| `gst_rate` | `real` | NOT NULL, valid `0..100` |
| `gst_amount` | `real` | NOT NULL |
| `currency` | `text` | NOT NULL, default `INR` |
| `is_owner_gst_registered` | `boolean` | NOT NULL, default `false` |
| `liability_holder` | `enum(gstRecordLiabilityHolderEnum)` | NOT NULL |
| `entry_direction` | `enum(gstRecordEntryDirectionEnum)` | NOT NULL |
| `sac_code` | `text` | nullable |
| `booking_month` | `integer` | NOT NULL, `1..12` |
| `booking_year` | `integer` | NOT NULL, `>=2000` |
| `tax_event_month` | `integer` | NOT NULL, `1..12` |
| `tax_event_year` | `integer` | NOT NULL, `>=2000` |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |

Additional key/check/index rules:
- `INDEX: gst_records_booking_id_idx`
- `INDEX: gst_records_owner_id_idx`
- `INDEX: gst_records_property_id_idx`
- `INDEX: gst_records_brand_id_idx`
- `INDEX: gst_records_gst_type_idx`
- `INDEX: gst_records_reference_type_idx`
- `INDEX: gst_records_reference_id_idx`
- `INDEX: gst_records_liability_holder_idx`
- `INDEX: gst_records_entry_direction_idx`
- `INDEX: gst_records_tax_event_year_month_idx`
- `INDEX: gst_records_booking_year_month_idx`
- `INDEX: gst_records_created_at_idx`
- `CHECK: gst_records_taxable_amount_non_negative`
- `CHECK: gst_records_gst_rate_valid`
- `CHECK: gst_records_gst_amount_non_negative`
- `CHECK: gst_records_currency_not_empty`
- `CHECK: gst_records_booking_month_valid`
- `CHECK: gst_records_tax_event_month_valid`
- `CHECK: gst_records_booking_year_valid`
- `CHECK: gst_records_tax_event_year_valid`

## Views

No views defined in this file.
