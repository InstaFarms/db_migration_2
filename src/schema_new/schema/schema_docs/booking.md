# booking.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `bookingPaymentChannelEnum` | `"bookingPaymentChannel"` | `bookingPaymentChannelOptions` | RAZORPAY, BANK_TRANSFER |
| `bookingPaymentReceiverTypeEnum` | `"bookingPaymentReceiverType"` | `bookingPaymentReceiverTypeOptions` | PLATFORM, OWNER |
| `bookingPaymentMethodEnum` | `"bookingPaymentMethod"` | `bookingPaymentMethodOptions` | PG, BANK_TRANSFER, UPI, CASH |
| `bookingPaymentInstrumentEnum` | `"bookingPaymentInstrument"` | `bookingPaymentInstrumentOptions` | CREDIT_CARD, DEBIT_CARD, UPI, WALLET, NET_BANKING, PAY_LATER, OTHERS |
| `bookingPaymentGatewayEnum` | `"bookingPaymentGateway"` | `bookingPaymentGatewayOptions` | RAZORPAY, CASHFREE, OTHERS |
| `bookingPaymentCaptureTypeEnum` | `"bookingPaymentCaptureType"` | `bookingPaymentCaptureTypeOptions` | SYSTEM, MANUAL |
| `bookingPaymentForEnum` | `"bookingPaymentFor"` | `bookingPaymentForOptions` | FULL_PAYMENT, ADVANCE_PAYMENT, BALANCE_PAYMENT, ADJUSTMENT |
| `bookingSourceTypeEnum` | `"bookingSourceType"` | `bookingSourceTypeOptions` | ONLINE, OFFLINE |
| `bookingTechPlatformEnum` | `"bookingTechPlatform"` | `bookingTechPlatformOptions` | WEBSITE_DESKTOP, WEBSITE_MOBILE, APP_ANDROID, APP_IOS, ADMIN_PANEL, JARVIS |
| `bookingLifecycleStatusEnum` | `"bookingLifecycleStatus"` | `bookingLifecycleStatusOptions` | CONFIRMED, CANCELLED, COMPLETED |
| `bookingRequestStatusEnum` | `"bookingRequestStatus"` | `bookingRequestStatusOptions` | PENDING, APPROVED, REJECTED, EXPIRED |
| `bookingRequestDecisionTakerTypeEnum` | `"bookingRequestDecisionTakerType"` | `bookingRequestDecisionTakerTypeOptions` | OWNER, MANAGER, ADMIN |
| `bookingRequestRefundStatusEnum` | `"bookingRequestRefundStatus"` | `bookingRequestRefundStatusOptions` | NOT_INITIATED, INITIATED, COMPLETED |
| `bookingCancellationTypeEnum` | `"bookingCancellationType"` | `bookingCancellationTypeOptions` | CUSTOMER_CANCELLED, OWNER_CANCELLED, ADMIN_CANCELLED, NO_SHOW |
| `bookingCancellationStayTypeEnum` | `"bookingCancellationStayType"` | `bookingCancellationStayTypeOptions` | SHORT, LONG |
| `bookingCancellationRefundStatusEnum` | `"bookingCancellationRefundStatus"` | `bookingCancellationRefundStatusOptions` | NOT_INITIATED, INITIATED, COMPLETED |
| `bookingDiscountTypeEnum` | `"bookingDiscountType"` | `bookingDiscountTypeOptions` | OWNER_DISCOUNT, MULTIPLE_NIGHTS_DISCOUNT, COUPON |
| `bookingDiscountValueTypeEnum` | `"bookingDiscountValueType"` | `bookingDiscountValueTypeOptions` | PERCENTAGE, FLAT |
| `bookingDiscountCalculationBaseEnum` | `"bookingDiscountCalculationBase"` | `bookingDiscountCalculationBaseOptions` | BASE_AMOUNT, RUNNING_TOTAL |
| `bookingRefundStatusEnum` | `"bookingRefundStatus"` | `bookingRefundStatusOptions` | PENDING, PARTIALLY_REFUNDED, REFUNDED, FAILED |
| `bookingRefundAttemptStatusEnum` | `"bookingRefundAttemptStatus"` | `bookingRefundAttemptStatusOptions` | PENDING, SUCCESS, FAILED |
| `bookingRefundTypeEnum` | `"bookingRefundType"` | `bookingRefundTypeOptions` | CUSTOMER_REFUND, GOODWILL, ADJUSTMENT |
| `bookingRefundInitiatedByTypeEnum` | `"bookingRefundInitiatedByType"` | `bookingRefundInitiatedByTypeOptions` | SYSTEM, ADMIN |
| `bookingPriceAdjustmentTypeEnum` | `"bookingPriceAdjustmentType"` | `bookingPriceAdjustmentTypeOptions` | EXTRA_GUEST, EXTENSION, DAMAGE, GOODWILL, PRICE_CORRECTION, OTHER |
| `bookingPriceAdjustmentFlowTypeEnum` | `"bookingPriceAdjustmentFlowType"` | `bookingPriceAdjustmentFlowTypeOptions` | CUSTOMER_TO_PLATFORM, PLATFORM_TO_CUSTOMER |
| `inventorySourceTypeEnum` | `"inventorySourceType"` | `inventorySourceTypeOptions` | BOOKING, BLOCKING, BOOKING_REQUEST |
| `inventoryBlockTypeEnum` | `"inventoryBlockType"` | `inventoryBlockTypeOptions` | ONLINE_BOOKING, OFFLINE_BOOKING, TEMPORARY_BLOCK, PERMANENT_BLOCK, ICAL_BLOCK |
| `inventoryBlockCategoryEnum` | `"inventoryBlockCategory"` | `inventoryBlockCategoryOptions` | CUSTOMER, OWNER, EXTERNAL |
| `inventoryStatusEnum` | `"inventoryStatus"` | `inventoryStatusOptions` | ACTIVE, CANCELLED, EXPIRED |
| `blockingTypeEnum` | `"blockingType"` | `blockingTypeOptions` | TEMPORARY, PERMANENT, ICAL |
| `blockingSourceEnum` | `"blockingSource"` | `blockingSourceOptions` | ADMIN, OWNER, ICAL |
| `blockingReasonTypeEnum` | `"blockingReasonType"` | `blockingReasonTypeOptions` | PERSONAL_USE, MAINTENANCE, PERSONAL_BOOKING, OTHER |
| `blockingStatusEnum` | `"blockingStatus"` | `blockingStatusOptions` | ACTIVE, EXPIRED, CANCELLED |
| `iCalOTAEnum` | `"iCalOTA"` | `iCalOTAOptions` | AIRBNB, BOOKING.COM, MAKEMYTRIP |

## Tables

### `bookings` ("bookings")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `customerId` | `uuid` | NOT NULL, FK -> customers.id (onDelete: cascade) |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: restrict) |
| `bookingSourceType` | `enum(bookingSourceTypeEnum)` | NOT NULL |
| `bookingTechPlatform` | `enum(bookingTechPlatformEnum)` | NOT NULL |
| `status` | `enum(bookingLifecycleStatusEnum)` | NOT NULL |
| `checkinDate` | `date` | NOT NULL |
| `checkoutDate` | `date` | NOT NULL |
| `totalGuestCount` | `integer` | NOT NULL, default set |
| `totalNights` | `integer` | NOT NULL |
| `remarks` | `text` | - |
| `specialRequests` | `text` | - |

Additional key/check/index rules:
- `INDEX: bookings_brand_id_idx`
- `INDEX: bookings_property_id_idx`
- `INDEX: bookings_customer_id_idx`
- `INDEX: bookings_checkin_date_idx`
- `INDEX: bookings_status_idx`
- `INDEX: bookings_booking_source_idx`
- `INDEX: bookings_booking_tech_platform_idx`
- `CHECK: checkout_after_checkin`
- `CHECK: bookings_total_guest_count_positive`
- `CHECK: bookings_total_nights_positive`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `bookingPricingSummary` ("booking_pricing_summary")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `total_before_discount_excl_gst` | `real` | NOT NULL, default set |
| `total_discount_amount_excl_gst` | `real` | NOT NULL, default set |
| `total_after_discount_excl_gst` | `real` | NOT NULL, default set |
| `total_gst_amount` | `real` | NOT NULL, default set |
| `final_amount_incl_gst` | `real` | NOT NULL, default set |
| `pricing_version` | `integer` | NOT NULL, default `1` |
| `createdAt` | `timestamp` | NOT NULL, default now (from `timestamps` helper) |
| `updatedAt` | `timestamp` | NOT NULL, auto-updated (from `timestamps` helper) |

Additional key/check/index rules:
- `INDEX: booking_pricing_summary_booking_id_idx`
- `INDEX: booking_pricing_summary_created_at_idx`
- `CHECK: booking_pricing_summary_total_before_non_negative`
- `CHECK: booking_pricing_summary_discount_non_negative`
- `CHECK: booking_pricing_summary_total_after_non_negative`
- `CHECK: booking_pricing_summary_gst_non_negative`
- `CHECK: booking_pricing_summary_final_amount_non_negative`
- `CHECK: booking_pricing_summary_pricing_version_positive`
- `CHECK: booking_pricing_summary_total_after_formula_valid`
- `CHECK: booking_pricing_summary_final_formula_valid`

### `bookingPriceDaywiseBreakup` ("booking_price_daywise_breakup")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | NOT NULL, FK -> bookings.id (onDelete: cascade) |
| `stay_date` | `date` | NOT NULL |
| `base_price_excl_gst` | `real` | NOT NULL, default set |
| `extra_guest_charges_excl_gst` | `real` | NOT NULL, default set |
| `floating_guest_charges_excl_gst` | `real` | NOT NULL, default set |
| `total_before_discount_excl_gst` | `real` | NOT NULL, default set |
| `discount_amount_excl_gst` | `real` | NOT NULL, default set |
| `price_after_discount_excl_gst` | `real` | NOT NULL, default set |
| `booking_gst_rate` | `integer` | NOT NULL, allowed: `5, 18, 28` |
| `booking_gst_amount` | `real` | NOT NULL, default set |
| `final_price_incl_gst` | `real` | NOT NULL, default set |
| `created_at` | `timestamp` | NOT NULL, default now |

Additional key/check/index rules:
- `UNIQUE: booking_price_daywise_breakup_booking_date_unique`
- `INDEX: booking_price_daywise_breakup_booking_id_idx`
- `INDEX: booking_price_daywise_breakup_stay_date_idx`
- `INDEX: booking_price_daywise_breakup_created_at_idx`
- `CHECK: booking_price_daywise_breakup_base_price_non_negative`
- `CHECK: booking_price_daywise_breakup_extra_guest_non_negative`
- `CHECK: booking_price_daywise_breakup_floating_guest_non_negative`
- `CHECK: booking_price_daywise_breakup_total_before_non_negative`
- `CHECK: booking_price_daywise_breakup_discount_non_negative`
- `CHECK: booking_price_daywise_breakup_price_after_non_negative`
- `CHECK: booking_price_daywise_breakup_gst_amount_non_negative`
- `CHECK: booking_price_daywise_breakup_final_price_non_negative`
- `CHECK: booking_price_daywise_breakup_gst_rate_valid`
- `CHECK: booking_price_daywise_breakup_total_before_formula_valid`
- `CHECK: booking_price_daywise_breakup_price_after_formula_valid`
- `CHECK: booking_price_daywise_breakup_final_formula_valid`

### `bookingGuestBreakup` ("bookingGuestBreakup")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `bookingId` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `stayAdultCount` | `integer` | NOT NULL, default set |
| `stayChildCount` | `integer` | NOT NULL, default set |
| `stayInfantCount` | `integer` | NOT NULL, default set |
| `floatingAdultCount` | `integer` | NOT NULL, default set |
| `floatingChildCount` | `integer` | NOT NULL, default set |
| `floatingInfantCount` | `integer` | NOT NULL, default set |
| `createdAt` | `timestamp` | NOT NULL, default set |

Additional key/check/index rules:
- `INDEX: booking_guest_breakup_booking_id_idx`
- `CHECK: booking_guest_breakup_stay_adult_positive`
- `CHECK: booking_guest_breakup_stay_child_non_negative`
- `CHECK: booking_guest_breakup_stay_infant_non_negative`
- `CHECK: booking_guest_breakup_floating_adult_non_negative`
- `CHECK: booking_guest_breakup_floating_child_non_negative`
- `CHECK: booking_guest_breakup_floating_infant_non_negative`

### `icalLinks` ("icalLinks")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | FK -> properties.id (onDelete: cascade) |
| `name` | `text` | NOT NULL |
| `icalUrl` | `text` | NOT NULL |
| `lastSyncedAt` | `timestamp` | - |
| `syncStatus` | `text` | NOT NULL, default set |
| `syncError` | `text` | - |
| `isActive` | `boolean` | NOT NULL, default set |

Additional key/check/index rules:
- `INDEX: ical_links_property_id_idx`
- `INDEX: ical_links_sync_status_idx`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `importedBookings` ("importedBookings")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | FK -> properties.id (onDelete: cascade) |
| `icalLinkId` | `uuid` | NOT NULL, FK -> icalLinks.id (onDelete: cascade) |
| `externalBookingId` | `text` | NOT NULL |
| `checkinDate` | `date` | NOT NULL |
| `checkoutDate` | `date` | NOT NULL |
| `summary` | `text` | - |
| `description` | `text` | - |

Additional key/check/index rules:
- `UNIQUE: unique_external_booking`
- `INDEX: imported_bookings_property_id_idx`
- `INDEX: imported_bookings_ical_link_id_idx`
- `INDEX: imported_bookings_checkin_date_idx`

### `bookingGuests` ("bookingGuests")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `bookingId` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `staysAdult` | `integer` | NOT NULL, default set |
| `staysChild` | `integer` | NOT NULL, default set |
| `staysInfant` | `integer` | NOT NULL, default set |
| `floatingAdults` | `integer` | NOT NULL, default set |
| `floatingChildren` | `integer` | NOT NULL, default set |
| `floatingInfants` | `integer` | NOT NULL, default set |

Additional key/check/index rules:
- `INDEX: booking_guests_booking_id_idx`
- `CHECK: booking_guests_stays_adult_positive`
- `CHECK: booking_guests_stays_child_non_negative`
- `CHECK: booking_guests_stays_infant_non_negative`
- `CHECK: booking_guests_floating_adults_non_negative`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `bookingPayments` ("booking_payments")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | NOT NULL, FK -> bookings.id (onDelete: cascade) |
| `receiver_type` | `enum(bookingPaymentReceiverTypeEnum)` | NOT NULL, values: PLATFORM, OWNER |
| `payment_method` | `enum(bookingPaymentMethodEnum)` | NOT NULL, values: PG, BANK_TRANSFER, UPI, CASH |
| `payment_instrument` | `enum(bookingPaymentInstrumentEnum)` | NOT NULL |
| `payment_gateway` | `enum(bookingPaymentGatewayEnum)` | nullable (required only when `payment_method=PG`) |
| `payment_capture_type` | `enum(bookingPaymentCaptureTypeEnum)` | NOT NULL, values: SYSTEM, MANUAL |
| `amount` | `real` | NOT NULL, positive |
| `currency` | `text` | NOT NULL, default `INR` |
| `gateway_fee` | `real` | NOT NULL, default set |
| `net_amount_received` | `real` | NOT NULL, default set |
| `payment_for` | `enum(bookingPaymentForEnum)` | NOT NULL, values: FULL_PAYMENT, ADVANCE_PAYMENT, BALANCE_PAYMENT, ADJUSTMENT |
| `payment_reference` | `text` | nullable |
| `remarks` | `text` | nullable |
| `paid_at` | `timestamp` | NOT NULL |
| `created_at` | `timestamp` | NOT NULL, default now |
| `updated_at` | `timestamp` | NOT NULL, auto-updated |

Additional key/check/index rules:
- `INDEX: booking_payments_booking_id_idx`
- `INDEX: booking_payments_paid_at_idx`
- `INDEX: booking_payments_payment_for_idx`
- `INDEX: booking_payments_receiver_type_idx`
- `INDEX: booking_payments_reference_idx`
- `CHECK: booking_payments_amount_positive`
- `CHECK: booking_payments_gateway_fee_non_negative`
- `CHECK: booking_payments_gateway_fee_not_more_than_amount`
- `CHECK: booking_payments_net_amount_non_negative`
- `CHECK: booking_payments_net_amount_formula_valid`
- `CHECK: booking_payments_gateway_required_for_pg_only`
- `CHECK: booking_payments_currency_not_empty`

### `bookingDiscounts` ("booking_discount")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | NOT NULL, FK -> bookings.id (onDelete: cascade) |
| `discount_type` | `enum(bookingDiscountTypeEnum)` | NOT NULL, values: OWNER_DISCOUNT, MULTIPLE_NIGHTS_DISCOUNT, COUPON |
| `coupon_id` | `uuid` | nullable, FK -> coupons.id (onDelete: set null) |
| `coupon_code` | `text` | nullable |
| `discount_value_type` | `enum(bookingDiscountValueTypeEnum)` | NOT NULL, values: PERCENTAGE, FLAT |
| `discount_percentage` | `real` | nullable, only for `PERCENTAGE` |
| `flat_discount_value` | `real` | nullable, only for `FLAT` |
| `application_order` | `integer` | NOT NULL, default `1` |
| `calculation_base` | `enum(bookingDiscountCalculationBaseEnum)` | NOT NULL, default `BASE_AMOUNT` (values: BASE_AMOUNT, RUNNING_TOTAL) |
| `amount_before_discount` | `real` | NOT NULL, default set |
| `discount_amount` | `real` | NOT NULL, default set |
| `amount_after_discount` | `real` | NOT NULL, default set |
| `description` | `text` | nullable |
| `created_at` | `timestamp` | NOT NULL, default now |

Additional key/check/index rules:
- `UNIQUE: booking_discount_booking_order_unique`
- `INDEX: booking_discount_booking_id_idx`
- `INDEX: booking_discount_type_idx`
- `INDEX: booking_discount_coupon_id_idx`
- `INDEX: booking_discount_application_order_idx`
- `INDEX: booking_discount_created_at_idx`
- `CHECK: booking_discount_application_order_positive`
- `CHECK: booking_discount_discount_percentage_valid`
- `CHECK: booking_discount_flat_discount_value_non_negative`
- `CHECK: booking_discount_amount_before_non_negative`
- `CHECK: booking_discount_amount_non_negative`
- `CHECK: booking_discount_amount_after_non_negative`
- `CHECK: booking_discount_amount_not_more_than_base`
- `CHECK: booking_discount_amount_after_formula_valid`
- `CHECK: booking_discount_value_type_fields_valid`

### `bookingRequests` ("bookingRequests")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `property_id` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `customer_id` | `uuid` | NOT NULL, FK -> customers.id (onDelete: cascade) |
| `brand_id` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `checkin_date` | `date` | NOT NULL |
| `checkout_date` | `date` | NOT NULL |
| `duration_nights` | `integer` | NOT NULL, positive |
| `total_guest_count` | `integer` | NOT NULL, positive |
| `guest_breakup` | `jsonb` | NOT NULL, default `{}` |
| `total_amount` | `real` | NOT NULL, non-negative |
| `status` | `enum(bookingRequestStatusEnum)` | NOT NULL, default `PENDING` |
| `decision_taker_type` | `enum(bookingRequestDecisionTakerTypeEnum)` | nullable |
| `decision_taker_id` | `uuid` | nullable |
| `decision_timestamp` | `timestamp` | nullable |
| `decision_reason` | `text` | nullable |
| `refund_status` | `enum(bookingRequestRefundStatusEnum)` | NOT NULL, default `NOT_INITIATED` |
| `refund_reference` | `text` | nullable |
| `refund_timestamp` | `timestamp` | nullable |
| `converted_booking_id` | `uuid` | nullable, FK -> bookings.id (onDelete: set null) |
| `remarks` | `text` | nullable |
| `expiry_timestamp` | `timestamp` | nullable |
| `created_at` | `timestamp` | NOT NULL, default now |
| `updated_at` | `timestamp` | NOT NULL, auto-updated |
| `booking_payload` | `json` | nullable |

Additional key/check/index rules:
- `INDEX: booking_requests_property_id_idx`
- `INDEX: booking_requests_brand_id_idx`
- `INDEX: booking_requests_customer_id_idx`
- `INDEX: booking_requests_status_idx`
- `INDEX: booking_requests_checkin_date_idx`
- `INDEX: booking_requests_checkout_date_idx`
- `INDEX: booking_requests_expiry_timestamp_idx`
- `INDEX: booking_requests_converted_booking_id_idx`
- `INDEX: booking_requests_created_at_idx`
- `CHECK: booking_requests_checkout_after_checkin`
- `CHECK: booking_requests_duration_nights_positive`
- `CHECK: booking_requests_total_guests_positive`
- `CHECK: booking_requests_total_amount_non_negative`
- `CHECK: booking_requests_decision_fields_consistent`
- `CHECK: booking_requests_refund_fields_consistent`

### `bookingCancellation` ("booking_cancellation")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `cancellation_type` | `enum(bookingCancellationTypeEnum)` | NOT NULL, values: CUSTOMER_CANCELLED, OWNER_CANCELLED, ADMIN_CANCELLED, NO_SHOW |
| `cancelled_by_id` | `uuid` | nullable |
| `cancellation_timestamp` | `timestamp` | NOT NULL |
| `days_before_checkin` | `integer` | NOT NULL, non-negative |
| `stay_duration_nights` | `integer` | NOT NULL, positive |
| `stay_type` | `enum(bookingCancellationStayTypeEnum)` | NOT NULL, values: SHORT, LONG |
| `policy_id` | `uuid` | nullable, FK -> cancellationPlans.id (onDelete: set null) |
| `policy_snapshot` | `jsonb` | NOT NULL, default `{}` |
| `total_booking_amount` | `real` | NOT NULL, non-negative |
| `total_amount_paid` | `real` | NOT NULL, non-negative |
| `cancellation_percentage` | `real` | nullable, valid `0..100` |
| `cancellation_amount_before_gst` | `real` | NOT NULL, non-negative |
| `gst_rate` | `integer` | nullable, allowed: `5, 18, 28` |
| `gst_applicable` | `boolean` | NOT NULL, default `false` |
| `payment_gateway_charges_deducted` | `boolean` | NOT NULL, default `false` |
| `total_deductions` | `real` | NOT NULL, non-negative |
| `refund_amount` | `real` | NOT NULL, non-negative |
| `platform_commission_rate_on_cancellation` | `real` | nullable, valid `0..100` |
| `platform_commission_on_cancellation_fee` | `real` | NOT NULL, non-negative |
| `owner_earnings_from_cancellation` | `real` | NOT NULL, non-negative |
| `gst_on_cancellation_fee` | `real` | NOT NULL, non-negative |
| `refund_status` | `enum(bookingCancellationRefundStatusEnum)` | NOT NULL, default `NOT_INITIATED` |
| `refund_completion_timestamp` | `timestamp` | nullable |
| `cancellation_reason` | `text` | nullable |
| `remarks` | `text` | nullable |
| `created_at` | `timestamp` | NOT NULL, default now |
| `updated_at` | `timestamp` | NOT NULL, auto-updated |

Additional key/check/index rules:
- `INDEX: booking_cancellation_booking_id_idx`
- `INDEX: booking_cancellation_type_idx`
- `INDEX: booking_cancellation_timestamp_idx`
- `INDEX: booking_cancellation_refund_status_idx`
- `CHECK: booking_cancellation_days_before_checkin_non_negative`
- `CHECK: booking_cancellation_stay_duration_nights_positive`
- `CHECK: booking_cancellation_total_booking_amount_non_negative`
- `CHECK: booking_cancellation_total_amount_paid_non_negative`
- `CHECK: booking_cancellation_percentage_valid`
- `CHECK: booking_cancellation_amount_before_gst_non_negative`
- `CHECK: booking_cancellation_gst_rate_valid`
- `CHECK: booking_cancellation_total_deductions_non_negative`
- `CHECK: booking_cancellation_refund_amount_non_negative`
- `CHECK: booking_cancellation_platform_commission_rate_valid`
- `CHECK: booking_cancellation_platform_commission_non_negative`
- `CHECK: booking_cancellation_owner_earnings_non_negative`
- `CHECK: booking_cancellation_gst_on_fee_non_negative`
- `CHECK: booking_cancellation_total_deductions_formula_valid`
- `CHECK: booking_cancellation_refund_amount_formula_valid`
- `CHECK: booking_cancellation_owner_earnings_formula_valid`
- `CHECK: booking_cancellation_refund_completion_consistent`

### `bookingPriceAdjustments` ("booking_price_adjustments")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | NOT NULL, FK -> bookings.id (onDelete: cascade) |
| `adjustment_date` | `date` | NOT NULL |
| `adjustment_type` | `enum(bookingPriceAdjustmentTypeEnum)` | NOT NULL, values: EXTRA_GUEST, EXTENSION, DAMAGE, GOODWILL, PRICE_CORRECTION, OTHER |
| `description` | `text` | nullable |
| `flow_type` | `enum(bookingPriceAdjustmentFlowTypeEnum)` | NOT NULL, values: CUSTOMER_TO_PLATFORM, PLATFORM_TO_CUSTOMER |
| `amount_excl_gst` | `real` | NOT NULL, non-negative |
| `gst_rate` | `integer` | nullable, allowed: `5, 18, 28` |
| `gst_amount` | `real` | NOT NULL, non-negative |
| `amount_incl_gst` | `real` | NOT NULL, non-negative |
| `created_at` | `timestamp` | NOT NULL, default now |

Additional key/check/index rules:
- `INDEX: booking_price_adjustments_booking_id_idx`
- `INDEX: booking_price_adjustments_adjustment_date_idx`
- `INDEX: booking_price_adjustments_adjustment_type_idx`
- `INDEX: booking_price_adjustments_flow_type_idx`
- `INDEX: booking_price_adjustments_created_at_idx`
- `CHECK: booking_price_adjustments_amount_excl_non_negative`
- `CHECK: booking_price_adjustments_gst_rate_valid`
- `CHECK: booking_price_adjustments_gst_amount_non_negative`
- `CHECK: booking_price_adjustments_amount_incl_non_negative`
- `CHECK: booking_price_adjustments_amount_formula_valid`
- `CHECK: booking_price_adjustments_gst_presence_consistent`

### `bookingRefund` ("booking_refund")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_id` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `booking_cancellation_id` | `uuid` | nullable, FK -> bookingCancellation.id (onDelete: set null) |
| `adjustment_id` | `uuid` | nullable, FK -> bookingPriceAdjustments.id (onDelete: set null) |
| `refund_amount` | `real` | NOT NULL, non-negative |
| `currency` | `text` | NOT NULL, default `INR` |
| `refund_type` | `enum(bookingRefundTypeEnum)` | NOT NULL, default `CUSTOMER_REFUND` |
| `refund_reason` | `text` | nullable |
| `status` | `enum(bookingRefundStatusEnum)` | NOT NULL, default `PENDING` |
| `total_refunded_amount` | `real` | NOT NULL, non-negative |
| `is_there_price_adjustment` | `boolean` | NOT NULL, default `false` |
| `initiated_by_type` | `enum(bookingRefundInitiatedByTypeEnum)` | NOT NULL, default `SYSTEM` |
| `initiated_by_id` | `uuid` | nullable |
| `created_at` | `timestamp` | NOT NULL, default now |
| `updated_at` | `timestamp` | NOT NULL, auto-updated |

Additional key/check/index rules:
- `INDEX: booking_refund_booking_id_idx`
- `INDEX: booking_refund_cancellation_id_idx`
- `INDEX: booking_refund_status_idx`
- `INDEX: booking_refund_created_at_idx`
- `CHECK: booking_refund_amount_non_negative`
- `CHECK: booking_refund_total_refunded_non_negative`
- `CHECK: booking_refund_total_refunded_not_more_than_target`
- `CHECK: booking_refund_currency_not_empty`
- `CHECK: booking_refund_adjustment_link_consistent`
- `CHECK: booking_refund_initiator_consistent`

### `bookingRefundAttempt` ("booking_refund_attempt")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `booking_refund_id` | `uuid` | NOT NULL, FK -> bookingRefund.id (onDelete: cascade) |
| `attempt_number` | `integer` | NOT NULL, positive (retry sequence per refund) |
| `attempt_amount` | `real` | NOT NULL, positive |
| `refund_method` | `enum(bookingPaymentMethodEnum)` | NOT NULL, values: PG, BANK_TRANSFER, UPI, CASH |
| `refund_gateway` | `enum(bookingPaymentGatewayEnum)` | nullable, required only when `refund_method=PG`, values: RAZORPAY, CASHFREE, OTHERS |
| `refund_reference` | `text` | nullable (gateway/transaction reference) |
| `original_payment_reference` | `text` | nullable |
| `status` | `enum(bookingRefundAttemptStatusEnum)` | NOT NULL, default `PENDING`, values: PENDING, SUCCESS, FAILED |
| `failure_reason` | `text` | nullable (required when `status=FAILED`) |
| `attempted_at` | `timestamp` | NOT NULL |
| `created_at` | `timestamp` | NOT NULL, default now |

Additional key/check/index rules:
- `UNIQUE: booking_refund_attempt_refund_attempt_number_unique`
- `INDEX: booking_refund_attempt_refund_id_idx`
- `INDEX: booking_refund_attempt_status_idx`
- `INDEX: booking_refund_attempt_attempted_at_idx`
- `INDEX: booking_refund_attempt_created_at_idx`
- `CHECK: booking_refund_attempt_attempt_number_positive`
- `CHECK: booking_refund_attempt_amount_positive`
- `CHECK: booking_refund_attempt_gateway_required_for_pg_only`
- `CHECK: booking_refund_attempt_failure_reason_consistent`

### `bookingPricing` ("bookingPricing")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `bookingId` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `baseRentalAmountWithGst` | `real` | default set |
| `extraAdultGuestChargeWithGst` | `real` | default set |
| `extraChildGuestChargeWithGst` | `real` | default set |
| `floatingGuestCharge` | `real` | default set |
| `bookingAmountWithGstBeforeDiscounts` | `real` | default set |
| `bookingAmountPaidWithGst` | `real` | default set |
| `fullBookingAmountWithGst` | `real` | default set |
| `remainingAmountToBePaidWithGst` | `real` | default set |
| `daywiseBreakup` | `jsonb` | - |
| `totalGstCollected` | `real` | default set |
| `bookingAmountWithDiscountBeforeGst` | `real` | default set |
| `totalDiscountAmount` | `real` | default set |

Additional key/check/index rules:
- `INDEX: booking_pricing_booking_id_idx`
- `CHECK: booking_pricing_base_rental_non_negative`
- `CHECK: booking_pricing_paid_amount_non_negative`
- `CHECK: booking_pricing_full_amount_non_negative`
- `CHECK: booking_pricing_total_gst_non_negative`
- `CHECK: booking_pricing_total_discount_non_negative`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `blocking` ("blocking")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK, NOT NULL |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `startDate` | `date` | NOT NULL |
| `endDate` | `date` | NOT NULL |
| `blockingType` | `enum(blockingTypeEnum)` | NOT NULL |
| `blockingSource` | `enum(blockingSourceEnum)` | NOT NULL |
| `blockingReasonType` | `enum(blockingReasonTypeEnum)` | - |
| `blockingReasonNotes` | `text` | - |
| `notes` | `text` | - |
| `iCalOTA` | `enum(iCalOTAEnum)` | - |
| `customerId` | `uuid` | FK -> customers.id |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `status` | `enum(blockingStatusEnum)` | NOT NULL, default set |
| `expiresAt` | `timestamp` | - |

Additional key/check/index rules:
- `INDEX: blocking_property_id_idx`
- `INDEX: blocking_start_date_idx`
- `INDEX: blocking_end_date_idx`
- `INDEX: blocking_status_idx`
- `INDEX: blocking_blocking_type_idx`
- `INDEX: blocking_brand_id_idx`
- `CHECK: blocking_date_range_valid`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `inventoryCalendar` ("inventoryCalendar")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK, NOT NULL |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id |
| `date` | `date` | NOT NULL |
| `sourceType` | `enum(inventorySourceTypeEnum)` | NOT NULL |
| `sourceId` | `uuid` | NOT NULL |
| `blockType` | `enum(inventoryBlockTypeEnum)` | NOT NULL |
| `blockCategory` | `enum(inventoryBlockCategoryEnum)` | - |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id |
| `status` | `enum(inventoryStatusEnum)` | NOT NULL, default set |
| `expiresAt` | `timestamp` | - |

Additional key/check/index rules:
- `UNIQUE: inventory_calendar_property_date_unique`
- `INDEX: blocked_dates_property_id_idx`
- `INDEX: inventory_calendar_date_idx`
- `INDEX: inventory_calendar_status_idx`
- `INDEX: inventory_calendar_source_type_idx`
- `INDEX: inventory_calendar_source_id_idx`
- `INDEX: inventory_calendar_brand_id_idx`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `bookingAuditLog` ("bookingAuditLog")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `bookingId` | `uuid` | NOT NULL, FK -> bookings.id (onDelete: cascade) |
| `event` | `text` | NOT NULL |
| `status` | `text` | NOT NULL |
| `message` | `text` | - |
| `metadata` | `json` | - |
| `errorDetails` | `json` | - |
| `ipAddress` | `text` | - |

Additional key/check/index rules:
- `INDEX: booking_audit_log_booking_id_idx`
- `INDEX: booking_audit_log_event_idx`
- `INDEX: booking_audit_log_status_idx`
- `INDEX: booking_audit_log_created_at_idx`

### `bookingPaymentSchedule` ("bookingPaymentSchedule")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `bookingId` | `uuid` | NOT NULL, UNIQUE, FK -> bookings.id (onDelete: cascade) |
| `totalBookingAmount` | `real` | NOT NULL |
| `advanceAmount` | `real` | NOT NULL |
| `remainingAmount` | `real` | NOT NULL |
| `advancePaymentId` | `uuid` | NOT NULL, FK -> bookingPayments.id |
| `advancePaidAt` | `timestamp` | NOT NULL |
| `remainingPaymentDueDate` | `date` | - |

Additional key/check/index rules:
- `INDEX: booking_payment_schedule_booking_id_idx`
- `CHECK: total_amount_positive`
- `CHECK: advance_amount_positive`
- `CHECK: remaining_amount_positive`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
