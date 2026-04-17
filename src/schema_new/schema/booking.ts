import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import {
  adminOrUserUpdateReference,
  setUserOrAdminUpdatedByConstraint,
  timestamps,
} from "./shared.ts";
import { brands } from "./brand.ts";
import {
  blockingReasonTypeOptions,
  blockingSourceOptions,
  blockingStatusOptions,
  blockingTypeOptions,
  bookingDiscountTypeOptions,
  bookingDiscountValueTypeOptions,
  bookingDiscountCalculationBaseOptions,
  bookingPaymentCaptureTypeOptions,
  bookingLifecycleStatusOptions,
  bookingPaymentChannelOptions,
  bookingPaymentForOptions,
  bookingPaymentGatewayOptions,
  bookingPaymentInstrumentOptions,
  bookingPaymentMethodOptions,
  bookingPaymentReceiverTypeOptions,
  bookingRefundStatusOptions,
  bookingRefundAttemptStatusOptions,
  bookingRefundTypeOptions,
  bookingRefundInitiatedByTypeOptions,
  bookingPriceAdjustmentTypeOptions,
  bookingPriceAdjustmentFlowTypeOptions,
  bookingRequestStatusOptions,
  bookingRequestDecisionTakerTypeOptions,
  bookingRequestRefundStatusOptions,
  bookingCancellationTypeOptions,
  bookingCancellationStayTypeOptions,
  bookingCancellationRefundStatusOptions,
  bookingSourceTypeOptions,
  bookingTechPlatformOptions,
  iCalOTAOptions,
  inventoryBlockCategoryOptions,
  inventoryBlockTypeOptions,
  inventorySourceTypeOptions,
  inventoryStatusOptions,
} from "../types.ts";
import { customers } from "./customer.ts";
import { properties } from "./property.ts";
import { coupons } from "./propertyCoupon.ts";
import { cancellationPlans } from "./propertyCancellation.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const bookingPaymentChannelEnum = pgEnum("bookingPaymentChannel", bookingPaymentChannelOptions);
export const bookingPaymentReceiverTypeEnum = pgEnum(
  "bookingPaymentReceiverType",
  bookingPaymentReceiverTypeOptions
);
export const bookingPaymentMethodEnum = pgEnum(
  "bookingPaymentMethod",
  bookingPaymentMethodOptions
);
export const bookingPaymentInstrumentEnum = pgEnum(
  "bookingPaymentInstrument",
  bookingPaymentInstrumentOptions
);
export const bookingPaymentGatewayEnum = pgEnum(
  "bookingPaymentGateway",
  bookingPaymentGatewayOptions
);
export const bookingPaymentCaptureTypeEnum = pgEnum(
  "bookingPaymentCaptureType",
  bookingPaymentCaptureTypeOptions
);
export const bookingPaymentForEnum = pgEnum("bookingPaymentFor", bookingPaymentForOptions);

export const bookingSourceTypeEnum = pgEnum("bookingSourceType", bookingSourceTypeOptions);
export const bookingTechPlatformEnum = pgEnum("bookingTechPlatform",bookingTechPlatformOptions);

export const bookingLifecycleStatusEnum = pgEnum("bookingLifecycleStatus", bookingLifecycleStatusOptions);

export const bookingRequestStatusEnum = pgEnum("bookingRequestStatus", bookingRequestStatusOptions);
export const bookingRequestDecisionTakerTypeEnum = pgEnum(
  "bookingRequestDecisionTakerType",
  bookingRequestDecisionTakerTypeOptions
);
export const bookingRequestRefundStatusEnum = pgEnum(
  "bookingRequestRefundStatus",
  bookingRequestRefundStatusOptions
);
export const bookingCancellationTypeEnum = pgEnum(
  "bookingCancellationType",
  bookingCancellationTypeOptions
);
export const bookingCancellationStayTypeEnum = pgEnum(
  "bookingCancellationStayType",
  bookingCancellationStayTypeOptions
);
export const bookingCancellationRefundStatusEnum = pgEnum(
  "bookingCancellationRefundStatus",
  bookingCancellationRefundStatusOptions
);

export const bookingDiscountTypeEnum = pgEnum("bookingDiscountType", bookingDiscountTypeOptions);
export const bookingDiscountValueTypeEnum = pgEnum(
  "bookingDiscountValueType",
  bookingDiscountValueTypeOptions
);
export const bookingDiscountCalculationBaseEnum = pgEnum(
  "bookingDiscountCalculationBase",
  bookingDiscountCalculationBaseOptions
);

export const bookingRefundStatusEnum = pgEnum("bookingRefundStatus", bookingRefundStatusOptions);
export const bookingRefundAttemptStatusEnum = pgEnum(
  "bookingRefundAttemptStatus",
  bookingRefundAttemptStatusOptions
);
export const bookingRefundTypeEnum = pgEnum("bookingRefundType", bookingRefundTypeOptions);
export const bookingRefundInitiatedByTypeEnum = pgEnum(
  "bookingRefundInitiatedByType",
  bookingRefundInitiatedByTypeOptions
);
export const bookingPriceAdjustmentTypeEnum = pgEnum(
  "bookingPriceAdjustmentType",
  bookingPriceAdjustmentTypeOptions
);
export const bookingPriceAdjustmentFlowTypeEnum = pgEnum(
  "bookingPriceAdjustmentFlowType",
  bookingPriceAdjustmentFlowTypeOptions
);

export const inventorySourceTypeEnum = pgEnum("inventorySourceType", inventorySourceTypeOptions);

export const inventoryBlockTypeEnum = pgEnum("inventoryBlockType", inventoryBlockTypeOptions);

export const inventoryBlockCategoryEnum = pgEnum("inventoryBlockCategory", inventoryBlockCategoryOptions);

export const inventoryStatusEnum = pgEnum("inventoryStatus", inventoryStatusOptions);

export const blockingTypeEnum = pgEnum("blockingType", blockingTypeOptions);

export const blockingSourceEnum = pgEnum("blockingSource", blockingSourceOptions);

export const blockingReasonTypeEnum = pgEnum("blockingReasonType", blockingReasonTypeOptions);

export const blockingStatusEnum = pgEnum("blockingStatus", blockingStatusOptions);

export const iCalOTAEnum = pgEnum("iCalOTA", iCalOTAOptions);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== BOOKINGS ===========================

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, {
      onDelete: "cascade",
    }),
    customerId: uuid("customer_id").notNull().references(() => customers.id, {
      onDelete: "cascade",
    }),
    brandId: uuid("brand_id").notNull().references(() => brands.id, {
      onDelete: "restrict",
    }),
    bookingSourceType: bookingSourceTypeEnum("booking_source_type").notNull(),
    bookingTechPlatform: bookingTechPlatformEnum("bookingTechPlatform").notNull(),
    status: bookingLifecycleStatusEnum("status").notNull(),
    checkinDate: date("checkinDate", { mode: "string" }).notNull(),
    checkoutDate: date("checkoutDate", { mode: "string" }).notNull(),
    totalGuestCount: integer("totalGuestCount").notNull().default(1),
    totalNights: integer("total_nights").notNull(),
    remarks: text("booking_remarks"),
    specialRequests: text("special_requests"),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("checkout_after_checkin", sql`"checkoutDate" > "checkinDate"`),
    check("bookings_total_guest_count_positive", sql`${table.totalGuestCount} > 0`),
    check("bookings_total_nights_positive", sql`${table.totalNights} > 0`),
    index("bookings_brand_id_idx").on(table.brandId),
    index("bookings_property_id_idx").on(table.propertyId),
    index("bookings_customer_id_idx").on(table.customerId),
    index("bookings_checkin_date_idx").on(table.checkinDate),
    index("bookings_status_idx").on(table.status),
    index("bookings_booking_source_type_idx").on(table.bookingSourceType),
    index("bookings_booking_tech_platform_idx").on(table.bookingTechPlatform),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== BOOKING GUEST BREAKUP ==============

export const bookingGuestBreakup = pgTable(
  "bookingGuestBreakup",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    stayAdultCount: integer("stayAdultCount").notNull().default(1),
    stayChildCount: integer("stayChildCount").notNull().default(0),
    stayInfantCount: integer("stayInfantCount").notNull().default(0),

    floatingAdultCount: integer("floatingAdultCount").notNull().default(0),
    floatingChildCount: integer("floatingChildCount").notNull().default(0),
    floatingInfantCount: integer("floatingInfantCount").notNull().default(0),

    ...timestamps,
  },
  (table) => [
    index("booking_guest_breakup_booking_id_idx").on(table.bookingId),

    check("booking_guest_breakup_stay_adult_positive", sql`${table.stayAdultCount} > 0`),
    check("booking_guest_breakup_stay_child_non_negative", sql`${table.stayChildCount} >= 0`),
    check("booking_guest_breakup_stay_infant_non_negative", sql`${table.stayInfantCount} >= 0`),
    check(
      "booking_guest_breakup_floating_adult_non_negative",
      sql`${table.floatingAdultCount} >= 0`
    ),
    check(
      "booking_guest_breakup_floating_child_non_negative",
      sql`${table.floatingChildCount} >= 0`
    ),
    check(
      "booking_guest_breakup_floating_infant_non_negative",
      sql`${table.floatingInfantCount} >= 0`
    ),
  ]
);

// ==================== BOOKING PRICING SUMMARY ============

export const bookingPricingSummary = pgTable(
  "booking_pricing_summary",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    totalBeforeDiscountExclGst: real("total_before_discount_excl_gst")
      .notNull()
      .default(0),
    totalDiscountAmountExclGst: real("total_discount_amount_excl_gst")
      .notNull()
      .default(0),
    totalAfterDiscountExclGst: real("total_after_discount_excl_gst")
      .notNull()
      .default(0),
    totalGstAmount: real("total_gst_amount").notNull().default(0),
    finalAmountInclGst: real("final_amount_incl_gst").notNull().default(0),

    pricingVersion: integer("pricing_version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    index("booking_pricing_summary_booking_id_idx").on(table.bookingId),
    index("booking_pricing_summary_created_at_idx").on(table.createdAt),

    check(
      "booking_pricing_summary_total_before_non_negative",
      sql`${table.totalBeforeDiscountExclGst} >= 0`
    ),
    check(
      "booking_pricing_summary_discount_non_negative",
      sql`${table.totalDiscountAmountExclGst} >= 0`
    ),
    check(
      "booking_pricing_summary_total_after_non_negative",
      sql`${table.totalAfterDiscountExclGst} >= 0`
    ),
    check(
      "booking_pricing_summary_gst_non_negative",
      sql`${table.totalGstAmount} >= 0`
    ),
    check(
      "booking_pricing_summary_final_amount_non_negative",
      sql`${table.finalAmountInclGst} >= 0`
    ),
    check(
      "booking_pricing_summary_pricing_version_positive",
      sql`${table.pricingVersion} > 0`
    ),
    check(
      "booking_pricing_summary_total_after_formula_valid",
      sql`${table.totalAfterDiscountExclGst} = (${table.totalBeforeDiscountExclGst} - ${table.totalDiscountAmountExclGst})`
    ),
    check(
      "booking_pricing_summary_final_formula_valid",
      sql`${table.finalAmountInclGst} = (${table.totalAfterDiscountExclGst} + ${table.totalGstAmount})`
    ),
  ]
);

// ==================== BOOKING PRICE DAYWISE BREAKUP ======

export const bookingPriceDaywiseBreakup = pgTable(
  "booking_price_daywise_breakup",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    stayDate: date("stay_date", { mode: "string" }).notNull(),

    basePriceExclGst: real("base_price_excl_gst").notNull().default(0),
    extraGuestChargesExclGst: real("extra_guest_charges_excl_gst")
      .notNull()
      .default(0),
    floatingGuestChargesExclGst: real("floating_guest_charges_excl_gst")
      .notNull()
      .default(0),

    totalBeforeDiscountExclGst: real("total_before_discount_excl_gst")
      .notNull()
      .default(0),
    discountAmountExclGst: real("discount_amount_excl_gst").notNull().default(0),
    priceAfterDiscountExclGst: real("price_after_discount_excl_gst")
      .notNull()
      .default(0),

    bookingGstRate: integer("booking_gst_rate").notNull(),
    bookingGstAmount: real("booking_gst_amount").notNull().default(0),
    finalPriceInclGst: real("final_price_incl_gst").notNull().default(0),

    ...timestamps,
  },
  (table) => [
    unique("booking_price_daywise_breakup_booking_date_unique").on(
      table.bookingId,
      table.stayDate
    ),

    index("booking_price_daywise_breakup_booking_id_idx").on(table.bookingId),
    index("booking_price_daywise_breakup_stay_date_idx").on(table.stayDate),
    index("booking_price_daywise_breakup_created_at_idx").on(table.createdAt),

    check(
      "booking_price_daywise_breakup_base_price_non_negative",
      sql`${table.basePriceExclGst} >= 0`
    ),
    check(
      "booking_price_daywise_breakup_extra_guest_non_negative",
      sql`${table.extraGuestChargesExclGst} >= 0`
    ),
    check(
      "booking_price_daywise_breakup_floating_guest_non_negative",
      sql`${table.floatingGuestChargesExclGst} >= 0`
    ),
    check(
      "booking_price_daywise_breakup_total_before_non_negative",
      sql`${table.totalBeforeDiscountExclGst} >= 0`
    ),
    check(
      "booking_price_daywise_breakup_discount_non_negative",
      sql`${table.discountAmountExclGst} >= 0`
    ),
    check(
      "booking_price_daywise_breakup_price_after_non_negative",
      sql`${table.priceAfterDiscountExclGst} >= 0`
    ),
    check(
      "booking_price_daywise_breakup_gst_amount_non_negative",
      sql`${table.bookingGstAmount} >= 0`
    ),
    check(
      "booking_price_daywise_breakup_final_price_non_negative",
      sql`${table.finalPriceInclGst} >= 0`
    ),

    check(
      "booking_price_daywise_breakup_gst_rate_valid",
      sql`${table.bookingGstRate} IN (5, 18, 28)`
    ),

    check(
      "booking_price_daywise_breakup_total_before_formula_valid",
      sql`${table.totalBeforeDiscountExclGst} = (${table.basePriceExclGst} + ${table.extraGuestChargesExclGst} + ${table.floatingGuestChargesExclGst})`
    ),
    check(
      "booking_price_daywise_breakup_price_after_formula_valid",
      sql`${table.priceAfterDiscountExclGst} = (${table.totalBeforeDiscountExclGst} - ${table.discountAmountExclGst})`
    ),
    check(
      "booking_price_daywise_breakup_final_formula_valid",
      sql`${table.finalPriceInclGst} = (${table.priceAfterDiscountExclGst} + ${table.bookingGstAmount})`
    ),
  ]
);

// ==================== BOOKING PAYMENTS ===================

export const bookingPayments = pgTable(
  "booking_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    receiverType: bookingPaymentReceiverTypeEnum("receiver_type").notNull(),
    paymentMethod: bookingPaymentMethodEnum("payment_method").notNull(),
    paymentInstrument: bookingPaymentInstrumentEnum("payment_instrument").notNull(),
    paymentGateway: bookingPaymentGatewayEnum("payment_gateway"),
    paymentCaptureType: bookingPaymentCaptureTypeEnum("payment_capture_type").notNull(),

    amount: real("amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    gatewayFee: real("gateway_fee").notNull().default(0),
    netAmountReceived: real("net_amount_received").notNull().default(0),

    paymentFor: bookingPaymentForEnum("payment_for").notNull(),
    paymentReference: text("payment_reference"),
    remarks: text("remarks"),

    paidAt: timestamp("paid_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),

    ...timestamps,
  },
  (table) => [
    index("booking_payments_booking_id_idx").on(table.bookingId),
    index("booking_payments_paid_at_idx").on(table.paidAt),
    index("booking_payments_payment_for_idx").on(table.paymentFor),
    index("booking_payments_receiver_type_idx").on(table.receiverType),
    index("booking_payments_reference_idx").on(table.paymentReference),

    check("booking_payments_amount_positive", sql`${table.amount} > 0`),
    check("booking_payments_gateway_fee_non_negative", sql`${table.gatewayFee} >= 0`),
    check(
      "booking_payments_gateway_fee_not_more_than_amount",
      sql`${table.gatewayFee} <= ${table.amount}`
    ),
    check(
      "booking_payments_net_amount_non_negative",
      sql`${table.netAmountReceived} >= 0`
    ),
    check(
      "booking_payments_net_amount_formula_valid",
      sql`${table.netAmountReceived} = (${table.amount} - ${table.gatewayFee})`
    ),
    check(
      "booking_payments_gateway_required_for_pg_only",
      sql`(
        (${table.paymentMethod} = 'PG' AND ${table.paymentGateway} IS NOT NULL)
        OR
        (${table.paymentMethod} <> 'PG' AND ${table.paymentGateway} IS NULL)
      )`
    ),
    check(
      "booking_payments_currency_not_empty",
      sql`length(trim(${table.currency})) > 0`
    ),
  ]
);

// ==================== BOOKING DISCOUNTS ==================

export const bookingDiscounts = pgTable(
  "booking_discount",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    discountType: bookingDiscountTypeEnum("discount_type").notNull(),
    couponId: uuid("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),
    couponCode: text("coupon_code"),

    discountValueType: bookingDiscountValueTypeEnum("discount_value_type").notNull(),
    discountPercentage: real("discount_percentage"),
    flatDiscountValue: real("flat_discount_value"),

    applicationOrder: integer("application_order").notNull().default(1),
    calculationBase: bookingDiscountCalculationBaseEnum("calculation_base")
      .notNull()
      .default("BASE_AMOUNT"),

    amountBeforeDiscount: real("amount_before_discount").notNull().default(0),
    discountAmount: real("discount_amount").notNull().default(0),
    amountAfterDiscount: real("amount_after_discount").notNull().default(0),

    description: text("description"),

    ...timestamps,
  },
  (table) => [
    unique("booking_discount_booking_order_unique").on(table.bookingId, table.applicationOrder),

    index("booking_discount_booking_id_idx").on(table.bookingId),
    index("booking_discount_type_idx").on(table.discountType),
    index("booking_discount_coupon_id_idx").on(table.couponId),
    index("booking_discount_application_order_idx").on(table.applicationOrder),
    index("booking_discount_created_at_idx").on(table.createdAt),

    check(
      "booking_discount_application_order_positive",
      sql`${table.applicationOrder} > 0`
    ),
    check(
      "booking_discount_discount_percentage_valid",
      sql`${table.discountPercentage} IS NULL OR (${table.discountPercentage} > 0 AND ${table.discountPercentage} <= 100)`
    ),
    check(
      "booking_discount_flat_discount_value_non_negative",
      sql`${table.flatDiscountValue} IS NULL OR ${table.flatDiscountValue} >= 0`
    ),
    check(
      "booking_discount_amount_before_non_negative",
      sql`${table.amountBeforeDiscount} >= 0`
    ),
    check("booking_discount_amount_non_negative", sql`${table.discountAmount} >= 0`),
    check(
      "booking_discount_amount_after_non_negative",
      sql`${table.amountAfterDiscount} >= 0`
    ),
    check(
      "booking_discount_amount_not_more_than_base",
      sql`${table.discountAmount} <= ${table.amountBeforeDiscount}`
    ),
    check(
      "booking_discount_amount_after_formula_valid",
      sql`${table.amountAfterDiscount} = (${table.amountBeforeDiscount} - ${table.discountAmount})`
    ),
    check(
      "booking_discount_value_type_fields_valid",
      sql`(
        (${table.discountValueType} = 'PERCENTAGE' AND ${table.discountPercentage} IS NOT NULL AND ${table.flatDiscountValue} IS NULL)
        OR
        (${table.discountValueType} = 'FLAT' AND ${table.flatDiscountValue} IS NOT NULL AND ${table.discountPercentage} IS NULL)
      )`
    ),
  ]
);

// ==================== BOOKING REQUESTS ===================

export const bookingRequests = pgTable(
  "bookingRequests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),

    checkinDate: date("checkin_date", { mode: "string" }).notNull(),
    checkoutDate: date("checkout_date", { mode: "string" }).notNull(),
    durationNights: integer("duration_nights").notNull(),
    totalGuestCount: integer("total_guest_count").notNull(),
    guestBreakup: jsonb("guest_breakup").notNull().default(sql`'{}'::jsonb`),
    totalAmount: real("total_amount").notNull().default(0),
    gatewayFee: real("gateway_fee").notNull().default(0),

    status: bookingRequestStatusEnum("status").notNull().default("PENDING"),

    decisionTakerType: bookingRequestDecisionTakerTypeEnum("decision_taker_type"),
    decisionTakerId: uuid("decision_taker_id"),
    decisionTimestamp: timestamp("decision_timestamp", {
      withTimezone: true,
      mode: "string",
    }),
    decisionReason: text("decision_reason"),

    refundStatus: bookingRequestRefundStatusEnum("refund_status")
      .notNull()
      .default("NOT_INITIATED"),
    refundReference: text("refund_reference"),
    refundTimestamp: timestamp("refund_timestamp", {
      withTimezone: true,
      mode: "string",
    }),

    convertedBookingId: uuid("converted_booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),

    remarks: text("remarks"),
    expiryTimestamp: timestamp("expiry_timestamp", {
      withTimezone: true,
      mode: "string",
    }),

    bookingPayload: json("booking_payload"),

    ...timestamps,
  },
  (table) => [
    check("booking_requests_checkout_after_checkin", sql`${table.checkoutDate} > ${table.checkinDate}`),
    check("booking_requests_duration_nights_positive", sql`${table.durationNights} > 0`),
    check("booking_requests_total_guests_positive", sql`${table.totalGuestCount} > 0`),
    check("booking_requests_total_amount_non_negative", sql`${table.totalAmount} >= 0`),
    check(
      "booking_requests_decision_fields_consistent",
      sql`(
        (${table.decisionTakerType} IS NULL AND ${table.decisionTakerId} IS NULL AND ${table.decisionTimestamp} IS NULL)
        OR
        (${table.decisionTakerType} IS NOT NULL AND ${table.decisionTakerId} IS NOT NULL AND ${table.decisionTimestamp} IS NOT NULL)
      )`
    ),
    check(
      "booking_requests_refund_fields_consistent",
      sql`(
        (${table.refundStatus} = 'NOT_INITIATED' AND ${table.refundReference} IS NULL AND ${table.refundTimestamp} IS NULL)
        OR
        (${table.refundStatus} IN ('INITIATED','COMPLETED'))
      )`
    ),

    index("booking_requests_property_id_idx").on(table.propertyId),
    index("booking_requests_brand_id_idx").on(table.brandId),
    index("booking_requests_customer_id_idx").on(table.customerId),
    index("booking_requests_status_idx").on(table.status),
    index("booking_requests_checkin_date_idx").on(table.checkinDate),
    index("booking_requests_checkout_date_idx").on(table.checkoutDate),
    index("booking_requests_expiry_timestamp_idx").on(table.expiryTimestamp),
    index("booking_requests_converted_booking_id_idx").on(table.convertedBookingId),
    index("booking_requests_created_at_idx").on(table.createdAt),
  ]
);

// ==================== BOOKING CANCELLATION ===============

export const bookingCancellation = pgTable(
  "booking_cancellation",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    cancellationType: bookingCancellationTypeEnum("cancellation_type").notNull(),
    cancelledById: uuid("cancelled_by_id"),
    cancellationTimestamp: timestamp("cancellation_timestamp", {
      withTimezone: true,
      mode: "string",
    }).notNull(),

    daysBeforeCheckin: integer("days_before_checkin").notNull(),
    stayDurationNights: integer("stay_duration_nights").notNull(),
    stayType: bookingCancellationStayTypeEnum("stay_type").notNull(),

    policyId: uuid("policy_id").references(() => cancellationPlans.id, {
      onDelete: "set null",
    }),
    policySnapshot: jsonb("policy_snapshot").notNull().default(sql`'{}'::jsonb`),

    totalBookingAmount: real("total_booking_amount").notNull().default(0),
    totalAmountPaid: real("total_amount_paid").notNull().default(0),

    cancellationPercentage: real("cancellation_percentage"),
    cancellationAmountBeforeGst: real("cancellation_amount_before_gst")
      .notNull()
      .default(0),

    gstRate: integer("gst_rate"),
    gstApplicable: boolean("gst_applicable").notNull().default(false),
    paymentGatewayChargesDeducted: boolean("payment_gateway_charges_deducted")
      .notNull()
      .default(false),

    totalDeductions: real("total_deductions").notNull().default(0),
    refundAmount: real("refund_amount").notNull().default(0),

    platformCommissionRateOnCancellation: real("platform_commission_rate_on_cancellation"),
    platformCommissionOnCancellationFee: real("platform_commission_on_cancellation_fee")
      .notNull()
      .default(0),
    ownerEarningsFromCancellation: real("owner_earnings_from_cancellation")
      .notNull()
      .default(0),
    gstOnCancellationFee: real("gst_on_cancellation_fee").notNull().default(0),

    refundStatus: bookingCancellationRefundStatusEnum("refund_status")
      .notNull()
      .default("NOT_INITIATED"),
    refundCompletionTimestamp: timestamp("refund_completion_timestamp", {
      withTimezone: true,
      mode: "string",
    }),

    cancellationReason: text("cancellation_reason"),
    remarks: text("remarks"),

    ...timestamps,
  },
  (table) => [
    index("booking_cancellation_booking_id_idx").on(table.bookingId),
    index("booking_cancellation_type_idx").on(table.cancellationType),
    index("booking_cancellation_timestamp_idx").on(table.cancellationTimestamp),
    index("booking_cancellation_refund_status_idx").on(table.refundStatus),

    check(
      "booking_cancellation_days_before_checkin_non_negative",
      sql`${table.daysBeforeCheckin} >= 0`
    ),
    check(
      "booking_cancellation_stay_duration_nights_positive",
      sql`${table.stayDurationNights} > 0`
    ),
    check(
      "booking_cancellation_total_booking_amount_non_negative",
      sql`${table.totalBookingAmount} >= 0`
    ),
    check(
      "booking_cancellation_total_amount_paid_non_negative",
      sql`${table.totalAmountPaid} >= 0`
    ),
    check(
      "booking_cancellation_percentage_valid",
      sql`${table.cancellationPercentage} IS NULL OR (${table.cancellationPercentage} >= 0 AND ${table.cancellationPercentage} <= 100)`
    ),
    check(
      "booking_cancellation_amount_before_gst_non_negative",
      sql`${table.cancellationAmountBeforeGst} >= 0`
    ),
    check(
      "booking_cancellation_gst_rate_valid",
      sql`${table.gstRate} IS NULL OR ${table.gstRate} IN (5, 18, 28)`
    ),
    check(
      "booking_cancellation_total_deductions_non_negative",
      sql`${table.totalDeductions} >= 0`
    ),
    check(
      "booking_cancellation_refund_amount_non_negative",
      sql`${table.refundAmount} >= 0`
    ),
    check(
      "booking_cancellation_platform_commission_rate_valid",
      sql`${table.platformCommissionRateOnCancellation} IS NULL OR (${table.platformCommissionRateOnCancellation} >= 0 AND ${table.platformCommissionRateOnCancellation} <= 100)`
    ),
    check(
      "booking_cancellation_platform_commission_non_negative",
      sql`${table.platformCommissionOnCancellationFee} >= 0`
    ),
    check(
      "booking_cancellation_owner_earnings_non_negative",
      sql`${table.ownerEarningsFromCancellation} >= 0`
    ),
    check(
      "booking_cancellation_gst_on_fee_non_negative",
      sql`${table.gstOnCancellationFee} >= 0`
    ),
    // check(
    //   "booking_cancellation_total_deductions_formula_valid",
    //   sql`${table.totalDeductions} = (${table.cancellationAmountBeforeGst} + ${table.gstOnCancellationFee})`
    // ),
    check(
      "booking_cancellation_refund_amount_formula_valid",
      sql`${table.refundAmount} = (${table.totalAmountPaid} - ${table.totalDeductions})`
    ),
    // check(
    //   "booking_cancellation_owner_earnings_formula_valid",
    //   sql`${table.ownerEarningsFromCancellation} = (${table.cancellationAmountBeforeGst} - ${table.platformCommissionOnCancellationFee})`
    // ),
    check(
      "booking_cancellation_refund_completion_consistent",
      sql`(
        (${table.refundStatus} = 'COMPLETED' AND ${table.refundCompletionTimestamp} IS NOT NULL)
        OR
        (${table.refundStatus} <> 'COMPLETED')
      )`
    ),
  ]
);

// ==================== BOOKING REFUND =====================

export const bookingRefund = pgTable(
  "booking_refund",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    bookingCancellationId: uuid("booking_cancellation_id").references(
      () => bookingCancellation.id,
      {
        onDelete: "set null",
      }
    ),
    adjustmentId: uuid("adjustment_id").references(() => bookingPriceAdjustments.id, {
      onDelete: "set null",
    }),

    refundAmount: real("refund_amount").notNull().default(0),
    currency: text("currency").notNull().default("INR"),

    refundType: bookingRefundTypeEnum("refund_type")
      .notNull()
      .default("CUSTOMER_REFUND"),
    refundReason: text("refund_reason"),

    status: bookingRefundStatusEnum("status").notNull().default("PENDING"),
    totalRefundedAmount: real("total_refunded_amount").notNull().default(0),

    isTherePriceAdjustment: boolean("is_there_price_adjustment")
      .notNull()
      .default(false),

    initiatedByType: bookingRefundInitiatedByTypeEnum("initiated_by_type")
      .notNull()
      .default("SYSTEM"),
    initiatedById: uuid("initiated_by_id"),

    ...timestamps,
  },
  (table) => [
    index("booking_refund_booking_id_idx").on(table.bookingId),
    index("booking_refund_cancellation_id_idx").on(table.bookingCancellationId),
    index("booking_refund_status_idx").on(table.status),
    index("booking_refund_created_at_idx").on(table.createdAt),

    check("booking_refund_amount_non_negative", sql`${table.refundAmount} >= 0`),
    check(
      "booking_refund_total_refunded_non_negative",
      sql`${table.totalRefundedAmount} >= 0`
    ),
    check(
      "booking_refund_total_refunded_not_more_than_target",
      sql`${table.totalRefundedAmount} <= ${table.refundAmount}`
    ),
    check(
      "booking_refund_currency_not_empty",
      sql`length(trim(${table.currency})) > 0`
    ),
    check(
      "booking_refund_adjustment_link_consistent",
      sql`(
        (${table.isTherePriceAdjustment} = true AND ${table.adjustmentId} IS NOT NULL)
        OR
        (${table.isTherePriceAdjustment} = false AND ${table.adjustmentId} IS NULL)
      )`
    ),
    check(
      "booking_refund_initiator_consistent",
      sql`(
        (${table.initiatedByType} = 'SYSTEM' AND ${table.initiatedById} IS NULL)
        OR
        (${table.initiatedByType} = 'ADMIN' AND ${table.initiatedById} IS NOT NULL)
      )`
    ),
  ]
);

// ==================== BOOKING REFUND ATTEMPT =============

export const bookingRefundAttempt = pgTable(
  "booking_refund_attempt",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingRefundId: uuid("booking_refund_id")
      .notNull()
      .references(() => bookingRefund.id, {
        onDelete: "cascade",
      }),

    attemptNumber: integer("attempt_number").notNull(),
    attemptAmount: real("attempt_amount").notNull(),

    refundMethod: bookingPaymentMethodEnum("refund_method").notNull(),
    refundGateway: bookingPaymentGatewayEnum("refund_gateway"),
    refundReference: text("refund_reference"),
    originalPaymentReference: text("original_payment_reference"),

    status: bookingRefundAttemptStatusEnum("status").notNull().default("PENDING"),
    failureReason: text("failure_reason"),

    attemptedAt: timestamp("attempted_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("booking_refund_attempt_refund_attempt_number_unique").on(
      table.bookingRefundId,
      table.attemptNumber
    ),

    index("booking_refund_attempt_refund_id_idx").on(table.bookingRefundId),
    index("booking_refund_attempt_status_idx").on(table.status),
    index("booking_refund_attempt_attempted_at_idx").on(table.attemptedAt),
    index("booking_refund_attempt_created_at_idx").on(table.createdAt),

    check(
      "booking_refund_attempt_attempt_number_positive",
      sql`${table.attemptNumber} > 0`
    ),
    check(
      "booking_refund_attempt_amount_positive",
      sql`${table.attemptAmount} > 0`
    ),
    check(
      "booking_refund_attempt_gateway_required_for_pg_only",
      sql`(
        (${table.refundMethod} = 'PG' AND ${table.refundGateway} IS NOT NULL)
        OR
        (${table.refundMethod} <> 'PG' AND ${table.refundGateway} IS NULL)
      )`
    ),
    check(
      "booking_refund_attempt_failure_reason_consistent",
      sql`(
        (${table.status} = 'FAILED' AND ${table.failureReason} IS NOT NULL)
        OR
        (${table.status} <> 'FAILED')
      )`
    ),
  ]
);

// ==================== BOOKING PRICE ADJUSTMENTS ==========

export const bookingPriceAdjustments = pgTable(
  "booking_price_adjustments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),

    adjustmentDate: date("adjustment_date", { mode: "string" }).notNull(),
    adjustmentType: bookingPriceAdjustmentTypeEnum("adjustment_type").notNull(),
    description: text("description"),
    flowType: bookingPriceAdjustmentFlowTypeEnum("flow_type").notNull(),

    amountExclGst: real("amount_excl_gst").notNull().default(0),
    gstRate: integer("gst_rate"),
    gstAmount: real("gst_amount").notNull().default(0),
    amountInclGst: real("amount_incl_gst").notNull().default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("booking_price_adjustments_booking_id_idx").on(table.bookingId),
    index("booking_price_adjustments_adjustment_date_idx").on(table.adjustmentDate),
    index("booking_price_adjustments_adjustment_type_idx").on(table.adjustmentType),
    index("booking_price_adjustments_flow_type_idx").on(table.flowType),
    index("booking_price_adjustments_created_at_idx").on(table.createdAt),

    check(
      "booking_price_adjustments_amount_excl_non_negative",
      sql`${table.amountExclGst} >= 0`
    ),
    check(
      "booking_price_adjustments_gst_rate_valid",
      sql`${table.gstRate} IS NULL OR ${table.gstRate} IN (5, 18, 28)`
    ),
    check(
      "booking_price_adjustments_gst_amount_non_negative",
      sql`${table.gstAmount} >= 0`
    ),
    check(
      "booking_price_adjustments_amount_incl_non_negative",
      sql`${table.amountInclGst} >= 0`
    ),
    check(
      "booking_price_adjustments_amount_formula_valid",
      sql`${table.amountInclGst} = (${table.amountExclGst} + ${table.gstAmount})`
    ),
    check(
      "booking_price_adjustments_gst_presence_consistent",
      sql`(
        (${table.gstRate} IS NULL AND ${table.gstAmount} = 0)
        OR
        (${table.gstRate} IS NOT NULL)
      )`
    ),
  ]
);
// ==================== BLOCKING ===========================

export const blocking = pgTable(
  "blocking",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    startDate: date("startDate", { mode: "string" }).notNull(),
    endDate: date("endDate", { mode: "string" }).notNull(),
    blockingType: blockingTypeEnum("blockingType").notNull(),
    blockingSource: blockingSourceEnum("blockingSource").notNull(),
    blockingReasonType: blockingReasonTypeEnum("blockingReasonType"),
    blockingReasonNotes: text("blockingReasonNotes"),
    notes: text("notes"),
    iCalOTA: iCalOTAEnum("iCal_OTA"),
    customerId: uuid("customerId").references(() => customers.id),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    status: blockingStatusEnum("status").notNull().default("ACTIVE"),
    expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "string" }),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("blocking_date_range_valid", sql`"startDate" < "endDate"`),
    index("blocking_property_id_idx").on(table.propertyId),
    index("blocking_start_date_idx").on(table.startDate),
    index("blocking_end_date_idx").on(table.endDate),
    index("blocking_status_idx").on(table.status),
    index("blocking_blocking_type_idx").on(table.blockingType),
    index("blocking_brand_id_idx").on(table.brandId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== INVENTORY CALENDAR ================

export const inventoryCalendar = pgTable(
  "inventoryCalendar",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    propertyId: uuid()
      .notNull()
      .references(() => properties.id),
    date: date("date", { mode: "string" }).notNull(),
    sourceType: inventorySourceTypeEnum("sourceType").notNull(),
    sourceId: uuid("sourceId").notNull(),
    blockType: inventoryBlockTypeEnum("blockType").notNull(),
    blockCategory: inventoryBlockCategoryEnum("blockCategory"),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id),
    status: inventoryStatusEnum("status").notNull().default("ACTIVE"),
    expiresAt: timestamp("expiresAt", { mode: "string" }),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    unique("inventory_calendar_property_date_unique").on(table.propertyId, table.date),
    index("blocked_dates_property_id_idx").on(table.propertyId),
    index("inventory_calendar_date_idx").on(table.date),
    index("inventory_calendar_status_idx").on(table.status),
    index("inventory_calendar_source_type_idx").on(table.sourceType),
    index("inventory_calendar_source_id_idx").on(table.sourceId),
    index("inventory_calendar_brand_id_idx").on(table.brandId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== ICAL LINKS =========================

export const icalLinks = pgTable(
  "icalLinks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId").references(() => properties.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    icalUrl: text("icalUrl").notNull(),
    lastSyncedAt: timestamp("lastSyncedAt", {
      withTimezone: true,
      mode: "string",
    }),
    syncStatus: text("syncStatus").notNull().default("pending"),
    syncError: text("syncError"),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    index("ical_links_property_id_idx").on(table.propertyId),
    index("ical_links_sync_status_idx").on(table.syncStatus),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== IMPORTED BOOKINGS ==================

export const importedBookings = pgTable(
  "importedBookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId").references(() => properties.id, {
      onDelete: "cascade",
    }),
    icalLinkId: uuid("icalLinkId")
      .notNull()
      .references(() => icalLinks.id, {
        onDelete: "cascade",
      }),
    externalBookingId: text("externalBookingId").notNull(),
    checkinDate: date({ mode: "string" }).notNull(),
    checkoutDate: date({ mode: "string" }).notNull(),
    summary: text("summary"),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    unique("unique_external_booking").on(table.icalLinkId, table.externalBookingId),
    index("imported_bookings_property_id_idx").on(table.propertyId),
    index("imported_bookings_ical_link_id_idx").on(table.icalLinkId),
    index("imported_bookings_checkin_date_idx").on(table.checkinDate),
  ]
);

// ==================== BOOKING AUDIT LOG ==================

export const bookingAuditLog = pgTable(
  "bookingAuditLog",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    event: text("event").notNull(),
    status: text("status").notNull(),
    message: text("message"),
    metadata: json("metadata"),
    errorDetails: json("errorDetails"),
    ipAddress: text("ipAddress"),
    ...timestamps,
  },
  (table) => [
    index("booking_audit_log_booking_id_idx").on(table.bookingId),
    index("booking_audit_log_event_idx").on(table.event),
    index("booking_audit_log_status_idx").on(table.status),
    index("booking_audit_log_created_at_idx").on(table.createdAt),
  ]
);

// ==================== BOOKING PAYMENT SCHEDULE ===========

export const bookingPaymentSchedule = pgTable(
  "bookingPaymentSchedule",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    totalBookingAmount: real("totalBookingAmount").notNull(),
    advanceAmount: real("advanceAmount").notNull(),
    remainingAmount: real("remainingAmount").notNull(),
    advancePaymentId: uuid("advancePaymentId").notNull(),
    advancePaidAt: timestamp("advancePaidAt", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    remainingPaymentDueDate: date("remainingPaymentDueDate", { mode: "string" }),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("total_amount_positive", sql`"totalBookingAmount" > 0`),
    check("advance_amount_positive", sql`"advanceAmount" >= 0`),
    check("remaining_amount_positive", sql`"remainingAmount" >= 0`),
    foreignKey({
      columns: [table.advancePaymentId],
      foreignColumns: [bookingPayments.id],
      name: "bookingPaymentSchedule_advancePaymentId_bookingPayments_id_fk",
    }),
    check(
      "amounts_sum_correct",
      sql`"advanceAmount" + "remainingAmount" = "totalBookingAmount"`
    ),
    index("booking_payment_schedule_booking_id_idx").on(table.bookingId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
