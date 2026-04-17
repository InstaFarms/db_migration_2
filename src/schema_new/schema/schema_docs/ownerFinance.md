# ownerFinance.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `ownerWalletLedgerReferenceTypeEnum` | `"ownerWalletLedgerReferenceType"` | `ownerWalletLedgerReferenceTypeOptions` | BOOKING_SETTLEMENT, PAYOUT, REFUND_RECOVERY, ADJUSTMENT, MILESTONE_ADJUSTMENT, MANUAL |
| `ownerWalletLedgerComponentTypeEnum` | `"ownerWalletLedgerComponentType"` | `ownerWalletLedgerComponentTypeOptions` | BOOKING_EARNING, CANCELLATION_EARNING, REFUND_DEDUCTION, GOODWILL_DEDUCTION, MILESTONE_BONUS, PAYOUT, MANUAL, TDS_DEDUCTION |
| `ledgerDirectionEnum` | `"ledgerDirection"` | `ledgerDirectionOptions` | CREDIT, DEBIT |
| `ownerPayoutStatusEnum` | `"ownerPayoutStatus"` | `ownerPayoutStatusOptions` | INITIATED, PROCESSING, SUCCESS, FAILED |
| `ownerPayoutMethodEnum` | `"ownerPayoutMethod"` | `ownerPayoutMethodOptions` | BANK_TRANSFER, UPI, MANUAL |
| `ownerPayoutGatewayEnum` | `"ownerPayoutGateway"` | `ownerPayoutGatewayOptions` | RAZORPAY, CASHFREE, MANUAL |
| `ownerPayoutAttemptStatusEnum` | `"ownerPayoutAttemptStatus"` | `ownerPayoutAttemptStatusOptions` | SUCCESS, FAILED |
| `ownerSettlementStatusEnum` | `"ownerSettlementStatus"` | `ownerSettlementStatusOptions` | PENDING, FINALIZED, ADJUSTED |
| `ownerSettlementAdjustmentTypeEnum` | `"ownerSettlementAdjustmentType"` | `ownerSettlementAdjustmentTypeOptions` | GOODWILL, DAMAGE, EXTRA_GUEST, EXTENSION, PENALTY, MANUAL, PRICE_CORRECTION |
| `ownerSettlementAdjustmentDirectionEnum` | `"ownerSettlementAdjustmentDirection"` | `ownerSettlementAdjustmentDirectionOptions` | INCREASE, DECREASE |
| `ownerWalletLedgerTypeEnum` | alias | alias of `ownerWalletLedgerComponentTypeEnum` | BOOKING_EARNING, CANCELLATION_EARNING, REFUND_DEDUCTION, GOODWILL_DEDUCTION, MILESTONE_BONUS, PAYOUT, MANUAL, TDS_DEDUCTION |

## Tables

### `ownerWallet` ("owner_wallets")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `owner_id` | `uuid` | NOT NULL, UNIQUE, FK -> users.id (onDelete: cascade) |
| `current_balance` | `real` | NOT NULL, default `0` |
| `currency` | `text` | NOT NULL, default `INR` |
| `last_updated_at` | `timestamp` | NOT NULL, auto-updated |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `INDEX: owner_settlement_owner_id_idx`
- `INDEX: owner_wallet_currency_idx`
- `INDEX: owner_wallet_last_updated_at_idx`
- `CHECK: owner_wallet_current_balance_non_negative`
- `CHECK: owner_wallet_currency_not_empty`

### `ownerWalletLedger` ("owner_wallet_ledger")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `owner_id` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `property_id` | `uuid` | NOT NULL, FK -> properties.id (onDelete: restrict) |
| `brand_id` | `uuid` | NOT NULL, FK -> brands.id (onDelete: restrict) |
| `reference_type` | `enum(ownerWalletLedgerReferenceTypeEnum)` | NOT NULL |
| `reference_id` | `text` | NOT NULL |
| `booking_id` | `uuid` | nullable, FK -> bookings.id (onDelete: set null) |
| `entry_type` | `enum(ledgerDirectionEnum)` | NOT NULL |
| `amount` | `real` | NOT NULL |
| `currency` | `text` | NOT NULL, default `INR` |
| `component_type` | `enum(ownerWalletLedgerComponentTypeEnum)` | NOT NULL |
| `description` | `text` | nullable |
| `metadata` | `jsonb` | NOT NULL, default `{}` |
| `accounting_date` | `date` | NOT NULL |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `INDEX: owner_wallet_ledger_owner_id_idx`
- `INDEX: owner_wallet_ledger_property_id_idx`
- `INDEX: owner_wallet_ledger_brand_id_idx`
- `INDEX: owner_wallet_ledger_reference_type_idx`
- `INDEX: owner_wallet_ledger_reference_id_idx`
- `INDEX: owner_wallet_ledger_booking_id_idx`
- `INDEX: owner_wallet_ledger_entry_type_idx`
- `INDEX: owner_wallet_ledger_component_type_idx`
- `INDEX: owner_wallet_ledger_accounting_date_idx`
- `INDEX: owner_wallet_ledger_created_at_idx`
- `CHECK: owner_wallet_ledger_amount_positive`
- `CHECK: owner_wallet_ledger_currency_not_empty`

### `ownerPayouts` ("owner_payouts")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `owner_id` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `brand_id` | `uuid` | NOT NULL, FK -> brands.id (onDelete: restrict) |
| `payout_reference_code` | `text` | NOT NULL, UNIQUE |
| `payout_amount` | `real` | NOT NULL |
| `currency` | `text` | NOT NULL, default `INR` |
| `status` | `enum(ownerPayoutStatusEnum)` | NOT NULL, default `INITIATED` |
| `payout_method` | `enum(ownerPayoutMethodEnum)` | NOT NULL |
| `bank_account_id` | `uuid` | nullable, FK -> bankDetails.id (onDelete: set null) |
| `upi_id` | `text` | nullable |
| `requested_at` | `timestamp` | NOT NULL |
| `processed_at` | `timestamp` | nullable |
| `remarks` | `text` | nullable |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `INDEX: owner_payouts_brand_id_idx`
- `INDEX: owner_payouts_owner_id_idx`
- `INDEX: owner_payouts_status_idx`
- `INDEX: owner_payouts_method_idx`
- `INDEX: owner_payouts_reference_code_idx`
- `INDEX: owner_payouts_requested_at_idx`
- `INDEX: owner_payouts_processed_at_idx`
- `CHECK: owner_payout_amount_positive`
- `CHECK: owner_payout_currency_not_empty`
- `CHECK: owner_payout_method_details_consistent`
- `CHECK: owner_payout_processed_at_consistent`

### `ownerPayoutAttempts` ("owner_payout_attempts")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `payout_id` | `uuid` | NOT NULL, FK -> owner_payouts.id (onDelete: cascade) |
| `attempt_number` | `integer` | NOT NULL |
| `attempt_amount` | `real` | NOT NULL |
| `currency` | `text` | NOT NULL, default `INR` |
| `payout_gateway` | `enum(ownerPayoutGatewayEnum)` | NOT NULL |
| `gateway_reference_id` | `text` | nullable |
| `status` | `enum(ownerPayoutAttemptStatusEnum)` | NOT NULL |
| `failure_reason` | `text` | nullable |
| `attempted_at` | `timestamp` | NOT NULL |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `UNIQUE: owner_payout_attempts_payout_attempt_unique`
- `INDEX: owner_payout_attempts_payout_id_idx`
- `INDEX: owner_payout_attempts_status_idx`
- `INDEX: owner_payout_attempts_gateway_idx`
- `INDEX: owner_payout_attempts_attempted_at_idx`
- `INDEX: owner_payout_attempts_created_at_idx`
- `CHECK: owner_payout_attempt_attempt_number_positive`
- `CHECK: owner_payout_attempt_amount_positive`
- `CHECK: owner_payout_attempt_currency_not_empty`
- `CHECK: owner_payout_attempt_failure_reason_consistent`

### `ownerSettlement` ("owner_settlements")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `property_id` | `uuid` | NOT NULL, FK -> properties.id (onDelete: restrict) |
| `owner_id` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `brand_id` | `uuid` | NOT NULL, FK -> brands.id (onDelete: restrict) |
| `booking_amount_excl_booking_gst` | `real` | NOT NULL, default `0` |
| `booking_gst_amount` | `real` | NOT NULL, default `0` |
| `total_adjustments_excl_gst` | `real` | NOT NULL, default `0` |
| `total_adjustments_gst_amount` | `real` | NOT NULL, default `0` |
| `total_adjustments_incl_gst` | `real` | NOT NULL, default `0` |
| `effective_revenue_excl_gst` | `real` | NOT NULL, default `0` |
| `commission_rate_excl_gst` | `real` | NOT NULL, default `0` |
| `commission_amount_excl_commission_gst` | `real` | NOT NULL, default `0` |
| `commission_gst` | `real` | NOT NULL, default `0` |
| `commission_amount_incl_commission_gst` | `real` | NOT NULL, default `0` |
| `owner_payout_excl_gst` | `real` | NOT NULL, default `0` |
| `tds_rate` | `real` | NOT NULL, default `0` |
| `tds_amount` | `real` | NOT NULL, default `0` |
| `net_payable_to_owner` | `real` | NOT NULL, default `0` |
| `cancellation_fee` | `real` | NOT NULL, default `0` |
| `refund_amount` | `real` | NOT NULL, default `0` |
| `goodwill_adjustment` | `real` | NOT NULL, default `0` |
| `is_owner_gst_registered` | `boolean` | NOT NULL, default `false` |
| `status` | `enum(ownerSettlementStatusEnum)` | NOT NULL, default `PENDING` |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `INDEX: owner_settlement_booking_id_idx`
- `INDEX: owner_settlement_property_id_idx`
- `INDEX: owner_settlement_owner_id_idx`
- `INDEX: owner_settlement_brand_id_idx`
- `INDEX: owner_settlement_status_idx`
- `INDEX: owner_settlement_created_at_idx`
- `CHECK: owner_settlement_booking_amount_non_negative`
- `CHECK: owner_settlement_booking_gst_non_negative`
- `CHECK: owner_settlement_total_adjustments_incl_formula_valid`
- `CHECK: owner_settlement_effective_revenue_formula_valid`
- `CHECK: owner_settlement_commission_rate_valid`
- `CHECK: owner_settlement_commission_excl_non_negative`
- `CHECK: owner_settlement_commission_gst_non_negative`
- `CHECK: owner_settlement_commission_incl_formula_valid`
- `CHECK: owner_settlement_tds_rate_valid`
- `CHECK: owner_settlement_tds_amount_non_negative`
- `CHECK: owner_settlement_cancellation_fee_non_negative`
- `CHECK: owner_settlement_refund_amount_non_negative`
- `CHECK: owner_settlement_owner_payout_formula_valid`
- `CHECK: owner_settlement_net_payable_formula_valid`

### `ownerSettlementAdjustments` ("owner_settlement_adjustments")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `settlement_id` | `uuid` | NOT NULL, FK -> owner_settlements.id (onDelete: cascade) |
| `booking_id` | `uuid` | NOT NULL, FK -> bookings.id (onDelete: cascade) |
| `owner_id` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `brand_id` | `uuid` | NOT NULL, FK -> brands.id (onDelete: restrict) |
| `adjustment_type` | `enum(ownerSettlementAdjustmentTypeEnum)` | NOT NULL |
| `direction` | `enum(ownerSettlementAdjustmentDirectionEnum)` | NOT NULL |
| `amount_excl_gst` | `real` | NOT NULL |
| `gst_rate` | `integer` | nullable, allowed: `5, 18, 28` |
| `gst_amount` | `real` | NOT NULL, default `0` |
| `amount_incl_gst` | `real` | NOT NULL |
| `description` | `text` | nullable |
| `metadata` | `jsonb` | NOT NULL, default `{}` |
| `adjustment_date` | `date` | NOT NULL |
| `accounting_month` | `date` | NOT NULL |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `INDEX: owner_settlement_adjustments_settlement_id_idx`
- `INDEX: owner_settlement_adjustments_booking_id_idx`
- `INDEX: owner_settlement_adjustments_owner_id_idx`
- `INDEX: owner_settlement_adjustments_brand_id_idx`
- `INDEX: owner_settlement_adjustments_type_idx`
- `INDEX: owner_settlement_adjustments_direction_idx`
- `INDEX: owner_settlement_adjustments_adjustment_date_idx`
- `INDEX: owner_settlement_adjustments_accounting_month_idx`
- `INDEX: owner_settlement_adjustments_created_at_idx`
- `CHECK: owner_settlement_adjustments_amount_excl_positive`
- `CHECK: owner_settlement_adjustments_gst_rate_valid`
- `CHECK: owner_settlement_adjustments_gst_amount_non_negative`
- `CHECK: owner_settlement_adjustments_amount_incl_positive`
- `CHECK: owner_settlement_adjustments_amount_formula_valid`
- `CHECK: owner_settlement_adjustments_accounting_month_first_day`

## Views

No views defined in this file.
