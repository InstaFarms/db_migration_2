import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
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
  bookingLifecycleStatusOptions,
  bookingPaymentChannelOptions,
  bookingRefundStatusOptions,
  bookingRequestStatusOptions,
  bookingSourceOptions,
  bookingTableTypeOptions,
  iCalOTAOptions,
  inventoryBlockCategoryOptions,
  inventoryBlockTypeOptions,
  inventorySourceTypeOptions,
  inventoryStatusOptions,
} from "../types.ts";
import { customers } from "./customer.ts";
import { properties } from "./property.ts";
import { coupons } from "./propertyCoupon.ts";
import { users } from "./user.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const bookingPaymentChannelEnum = pgEnum("bookingPaymentChannel", bookingPaymentChannelOptions);

export const bookingSourceEnum = pgEnum("bookingSource", bookingSourceOptions);

export const bookingTableTypeEnum = pgEnum("bookingTableType", bookingTableTypeOptions);

export const bookingLifecycleStatusEnum = pgEnum("bookingLifecycleStatus", bookingLifecycleStatusOptions);

export const bookingRequestStatusEnum = pgEnum("bookingRequestStatus", bookingRequestStatusOptions);

export const bookingDiscountTypeEnum = pgEnum("bookingDiscountType", bookingDiscountTypeOptions);

export const bookingRefundStatusEnum = pgEnum("bookingRefundStatus", bookingRefundStatusOptions);

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

// ==================== BOOKINGS ===========================

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId").references(() => brands.id, {
      onDelete: "restrict",
    }),
    propertyId: uuid("propertyId").references(() => properties.id, {
      onDelete: "cascade",
    }),
    customerId: uuid("customerId").references(() => customers.id, {
      onDelete: "cascade",
    }),
    bookingType: bookingTableTypeEnum("bookingType").notNull(),
    bookingSource: bookingSourceEnum("bookingSource").notNull(),
    status: bookingLifecycleStatusEnum("status").notNull().default("PENDING"),
    checkinDate: date("checkinDate", { mode: "string" }).notNull(),
    checkoutDate: date("checkoutDate", { mode: "string" }).notNull(),
    remarks: text("remarks"),
    specialRequests: text("specialRequests"),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("checkout_after_checkin", sql`"checkoutDate" > "checkinDate"`),
    index("bookings_brand_id_idx").on(table.brandId),
    index("bookings_property_id_idx").on(table.propertyId),
    index("bookings_customer_id_idx").on(table.customerId),
    index("bookings_checkin_date_idx").on(table.checkinDate),
    index("bookings_status_idx").on(table.status),
    index("bookings_booking_source_idx").on(table.bookingSource),
    index("bookings_booking_type_idx").on(table.bookingType),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== BOOKING GUESTS =====================

export const bookingGuests = pgTable(
  "bookingGuests",
  {
    bookingId: uuid("bookingId")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    staysAdult: integer("staysAdult").notNull().default(0),
    staysChild: integer("staysChild").notNull().default(0),
    staysInfant: integer("staysInfant").notNull().default(0),
    floatingAdults: integer("floatingAdults").notNull().default(0),
    floatingChildren: integer("floatingChildren").notNull().default(0),
    floatingInfants: integer("floatingInfants").notNull().default(0),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("booking_guests_stays_adult_non_negative", sql`"staysAdult" >= 0`),
    check("booking_guests_stays_child_non_negative", sql`"staysChild" >= 0`),
    check("booking_guests_stays_infant_non_negative", sql`"staysInfant" >= 0`),
    check("booking_guests_floating_adults_non_negative", sql`"floatingAdults" >= 0`),
    check(
      "booking_guests_floating_children_non_negative",
      sql`"floatingChildren" >= 0`
    ),
    check(
      "booking_guests_floating_infants_non_negative",
      sql`"floatingInfants" >= 0`
    ),
    index("booking_guests_booking_id_idx").on(table.bookingId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== BOOKING REQUESTS ===================

export const bookingRequests = pgTable(
  "bookingRequests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    startDate: date("startDate", { mode: "string" }).notNull(),
    endDate: date("endDate", { mode: "string" }).notNull(),
    customerId: uuid("customerId")
      .notNull()
      .references(() => customers.id, {
        onDelete: "cascade",
      }),
    status: bookingRequestStatusEnum("status").notNull(),
    acceptedAt: timestamp("acceptedAt", {
      withTimezone: true,
      mode: "string",
    }),
    rejectedAt: timestamp("rejectedAt", {
      withTimezone: true,
      mode: "string",
    }),
    cancelledAt: timestamp("cancelledAt", {
      withTimezone: true,
      mode: "string",
    }),
    rejectionReason: text("rejectionReason"),
    cancellationReason: text("cancellationReason"),
    bookingPayload: json("bookingPayload"),
    createdBy: uuid("createdBy"),
    ...timestamps,
  },
  (table) => [
    check("booking_requests_end_after_start", sql`"endDate" > "startDate"`),
    index("booking_requests_property_id_idx").on(table.propertyId),
    index("booking_requests_brand_id_idx").on(table.brandId),
    index("booking_requests_customer_id_idx").on(table.customerId),
    index("booking_requests_status_idx").on(table.status),
    index("booking_requests_start_date_idx").on(table.startDate),
    index("booking_requests_created_at_idx").on(table.createdAt),
  ]
);

// ==================== BOOKING PAYMENTS ===================

export const bookingPayments = pgTable(
  "bookingPayments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    isAdvancePayment: boolean("isAdvancePayment").notNull().default(false),
    amount: real("amount").notNull(),
    paymentDate: timestamp("paymentDate", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    paymentChannel: bookingPaymentChannelEnum("paymentChannel").notNull(),
    razorpayPaymentId: text("razorpayPaymentId"),
    razorpayOrderId: text("razorpayOrderId"),
    paymentGatewayCharge: real("paymentGatewayCharge").default(0),
    paymentGatewayInstrument: text("paymentGatewayInstrument"),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("booking_payments_amount_positive", sql`${table.amount} > 0`),
    check(
      "booking_payments_gateway_charge_non_negative",
      sql`"paymentGatewayCharge" IS NULL OR "paymentGatewayCharge" >= 0`
    ),
    index("booking_payments_booking_id_idx").on(table.bookingId),
    index("booking_payments_payment_date_idx").on(table.paymentDate),
    index("booking_payments_channel_idx").on(table.paymentChannel),
    index("booking_payments_razorpay_payment_id_idx").on(table.razorpayPaymentId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== BOOKING PRICING ====================

export const bookingPricing = pgTable(
  "bookingPricing",
  {
    bookingId: uuid("bookingId")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    baseRentalAmountWithGst: real("baseRentalAmountWithGst").default(0),
    extraAdultGuestChargeWithGst: real("extraAdultGuestChargeWithGst").default(0),
    extraChildGuestChargeWithGst: real("extraChildGuestChargeWithGst").default(0),
    floatingGuestCharge: real("floatingGuestCharge").default(0),
    bookingAmountWithGstBeforeDiscounts: real("bookingAmountWithGstBeforeDiscounts").default(0),
    bookingAmountPaidWithGst: real("bookingAmountPaidWithGst").default(0),
    fullBookingAmountWithGst: real("fullBookingAmountWithGst").default(0),
    remainingAmountToBePaidWithGst: real("remainingAmountToBePaidWithGst").default(0),
    daywiseBreakup: jsonb("daywiseBreakup"),
    totalGstCollected: real("totalGstCollected").default(0),
    bookingAmountWithDiscountBeforeGst: real("bookingAmountWithDiscountBeforeGst").default(0),
    totalDiscountAmount: real("totalDiscountAmount").default(0),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("booking_pricing_base_rental_non_negative", sql`"baseRentalAmountWithGst" >= 0`),
    check(
      "booking_pricing_extra_adult_non_negative",
      sql`"extraAdultGuestChargeWithGst" >= 0`
    ),
    check(
      "booking_pricing_extra_child_non_negative",
      sql`"extraChildGuestChargeWithGst" >= 0`
    ),
    check(
      "booking_pricing_floating_guest_charge_non_negative",
      sql`"floatingGuestCharge" >= 0`
    ),
    check(
      "booking_pricing_before_discount_non_negative",
      sql`"bookingAmountWithGstBeforeDiscounts" >= 0`
    ),
    check("booking_pricing_paid_amount_non_negative", sql`"bookingAmountPaidWithGst" >= 0`),
    check("booking_pricing_full_amount_non_negative", sql`"fullBookingAmountWithGst" >= 0`),
    check(
      "booking_pricing_remaining_amount_non_negative",
      sql`"remainingAmountToBePaidWithGst" >= 0`
    ),
    check("booking_pricing_total_gst_non_negative", sql`"totalGstCollected" >= 0`),
    check(
      "booking_pricing_discounted_before_gst_non_negative",
      sql`"bookingAmountWithDiscountBeforeGst" >= 0`
    ),
    check("booking_pricing_total_discount_non_negative", sql`"totalDiscountAmount" >= 0`),
    index("booking_pricing_booking_id_idx").on(table.bookingId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== BOOKING DISCOUNTS ==================

export const bookingDiscounts = pgTable(
  "bookingDiscounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    couponId: uuid("couponId").references(() => coupons.id, {
      onDelete: "set null",
    }),
    discountType: bookingDiscountTypeEnum("discountType").notNull(),
    discountValue: real("discountValue").default(0),
    discountAmount: real("discountAmount").default(0),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("booking_discounts_value_non_negative", sql`"discountValue" >= 0`),
    check("booking_discounts_amount_non_negative", sql`"discountAmount" >= 0`),
    index("booking_discounts_booking_id_idx").on(table.bookingId),
    index("booking_discounts_coupon_id_idx").on(table.couponId),
    index("booking_discounts_type_idx").on(table.discountType),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== BOOKING CANCELLATION ===============

export const bookingCancellation = pgTable(
  "bookingCancellation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    refundAmount: real("refundAmount").notNull(),
    cancelCharge: real("cancelCharge").default(0),
    cancellationPlatformCommission: real("cancellationPlatformCommission").default(0),
    cancellationFeeOwnerShare: real("cancellationFeeOwnerShare").default(0),
    cancelledBy: uuid("cancelledBy").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("booking_cancellation_refund_non_negative", sql`"refundAmount" >= 0`),
    check("booking_cancellation_charge_non_negative", sql`"cancelCharge" >= 0`),
    check(
      "booking_cancellation_platform_commission_non_negative",
      sql`"cancellationPlatformCommission" >= 0`
    ),
    check(
      "booking_cancellation_owner_share_non_negative",
      sql`"cancellationFeeOwnerShare" >= 0`
    ),
    index("booking_cancellation_booking_id_idx").on(table.bookingId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);

// ==================== BOOKING REFUND =====================

export const bookingRefund = pgTable(
  "bookingRefund",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("bookingId")
      .notNull()
      .unique()
      .references(() => bookings.id, {
        onDelete: "cascade",
      }),
    refundAmount: real("refundAmount").notNull(),
    refundStatus: bookingRefundStatusEnum("refundStatus")
      .notNull()
      .default("REFUND_INITIATED"),
    razorpayRefundId: text("razorpayRefundId"),
    refundError: text("refundError"),
    refundAttempts: integer("refundAttempts").default(0),
    ...timestamps,
    ...adminOrUserUpdateReference,
  },
  (table) => [
    check("booking_refund_amount_non_negative", sql`"refundAmount" >= 0`),
    check("booking_refund_attempts_non_negative", sql`"refundAttempts" >= 0`),
    index("booking_refund_booking_id_idx").on(table.bookingId),
    index("booking_refund_status_idx").on(table.refundStatus),
    setUserOrAdminUpdatedByConstraint(table),
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
    advancePaymentId: uuid("advancePaymentId")
      .notNull()
      .references(() => bookingPayments.id),
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
    check(
      "amounts_sum_correct",
      sql`"advanceAmount" + "remainingAmount" = "totalBookingAmount"`
    ),
    index("booking_payment_schedule_booking_id_idx").on(table.bookingId),
    setUserOrAdminUpdatedByConstraint(table),
  ]
);
