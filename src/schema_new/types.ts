import {
  activities,
  admins,
  amenities,
  areas,
  bookings,
  cancellations,
  cities,
  customers,
  payments,
  properties,
  propertiesDataSpecificToBrands,
  propertyTypes,
  states,
  timestamps,
  users,
  reviews,
  reviewMagicLinks
} from "./schema.ts";// BUILD ERROR
import type { ColumnBaseConfig, ColumnDataType } from "drizzle-orm";
import type { ExtraConfigColumn } from "drizzle-orm/pg-core";

export type PropertyGooglePlaceReview = {
  author_name: string;
  author_url?: string;
  language?: string;
  original_language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  translated?: boolean;
};

export type PropertyNearbyPlace = {
  place_id: string;
  name: string;
  vicinity: string;
  types: string[];
  lat: number;
  lng: number;
};

export type PropertyBrandFaq = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  weight?: number;
  sortOrder?: number;
};

export type PropertyBrandPhoto = {
  id: string;
  photoType?: "COVER" | "GALLERY" | "HERO" | "THUMBNAIL";
  thumbnailUrl?: string;
  gridUrl?: string;
  originalUrl?: string;
  blurHash?: string;
  altText?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type PropertyBrandHomeRuleTruth = {
  id: string;
  title?: string;
  description?: string;
  ruleType?: string;
  isAllowed?: boolean;
  sortOrder?: number;
};

export type PropertyBrandSection = {
  id: string;
  title: string;
  sectionType: string;
  content: string;
  sortOrder?: number;
};

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type BrandLocationFaq = {
  question: string;
  answer: string;
  isActive: boolean;
  weight: number;
};

export type BrandLocationInfo = {
  title: string;
  description?: string;
  howToReach?: {
    title: string;
    description: string;
    nearByPlaces: string[];
  };
  mapSearchKey?: string;
  nearByAttractions?: string[];
};

export type BrandLocationMeta = {
  metaTitle?: string;
  metaDescription?: string;
  metaUrl?: string;
  metaImage?: string;
};

export type UpdateRefColType = ExtraConfigColumn<
  ColumnBaseConfig<ColumnDataType, string>
>;


export const roleOptions = ["Owner", "Manager", "Caretaker"] as const;

/** Instafarms admin panel roles (permission templates). */
export const adminPanelRoleOptions = [
  "SUPER_ADMIN",
  "OPS_TEAM",
  "SALES_EXECUTIVE",
  "FINANCE_TEAM",
] as const;

export type AdminPanelRole = (typeof adminPanelRoleOptions)[number];
export const adminPermissionKeyOptions = [
  "DASHBOARD",
  "ALL_USERS",
  "ADMINS",
  "CUSTOMERS",
  "SUPERVISORS",
  "OWNER_GANG",
  "ALL_PROPERTY_USERS",
  "OWNERS",
  "MANAGERS",
  "CARETAKERS",
  "LOCATIONS",
  "PROPERTY_DATA",
  "PROPOSALS",
  "BOOKING_MANAGEMENT",
  "WALLET_AND_SETTLEMENTS",
  "REPORTS",
  "COUPONS",
  "COLLECTIONS",
  "AUDIT_DATA",
  "CONTACT_REQUESTS",
  "NOTIFICATIONS",
  "INSTAFARMS_SPECIFIC_DATA",
  "HISTORY",
] as const;
export type AdminPermissionKey = (typeof adminPermissionKeyOptions)[number];
export const webhookStatusOptions = ["PENDING", "PROCESSED"] as const;
export const genderOptions = ["Male", "Female", "Other"] as const;
export const refundStatusOptions = ["Pending", "Completed", "Failed"] as const;
export const cancellationTypeOptions = ["Online", "Offline"] as const;
export const bookingTypeOptions = ["Online", "Offline"] as const;
export const bookingStatusOptions = [
  "PAYMENT_PENDING",
  "AWAITING_APPROVAL",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "REFUNDED",
] as const;
export const bookingPaymentStatusOptions = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;
export const transactionTypeOptions = ["Credit", "Debit"] as const;
export const paymentTypeOptions = ["Security Deposit", "Rent"] as const;
export const paymentModeOptions = ["Cash", "Online"] as const;
export const settlementTimingOptions = ["checkout", "checkin"] as const;

export const propertyAreaTypeOptions = ["PRIMARY", "SECONDARY"] as const;
export const propertyDerivativeTypeByBrandOptions = ["NORMAL", "MERGE", "SPLIT"] as const;
export const dayOfWeekOptions = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
export const photoCategoryOptions = [
  "OUTDOORS",
  "INDOORS",
  "BED_BATH",
  "AMENITIES",
  "OTHERS",
] as const;
export const cancellationPlanTypeOptions = ["longterm", "shortterm"] as const;

export const bookingPaymentChannelOptions = ["RAZORPAY", "BANK_TRANSFER"] as const;
export const bookingPaymentReceiverTypeOptions = ["PLATFORM", "OWNER"] as const;
export const bookingPaymentMethodOptions = [
  "PG",
  "BANK_TRANSFER",
  "UPI",
  "CASH",
] as const;
export const bookingPaymentInstrumentOptions = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "UPI",
  "WALLET",
  "NET_BANKING",
  "PAY_LATER",
  "OTHERS",
] as const;
export const bookingPaymentGatewayOptions = ["RAZORPAY", "CASHFREE", "OTHERS"] as const;
export const bookingPaymentCaptureTypeOptions = ["SYSTEM", "MANUAL"] as const;
export const bookingPaymentForOptions = [
  "FULL_PAYMENT",
  "ADVANCE_PAYMENT",
  "BALANCE_PAYMENT",
  "ADJUSTMENT",
] as const;
export const bookingTechPlatformOptions = [
  "WEBSITE_DESKTOP",
  "WEBSITE_MOBILE",
  "APP_ANDROID",
  "APP_IOS",
  "ADMIN_PANEL",
  "JARVIS",
] as const;
export const  bookingSourceTypeOptions= ["ONLINE", "OFFLINE"] as const;
export const bookingLifecycleStatusOptions = [
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;
export const bookingRequestStatusOptions = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const;
export const bookingRequestDecisionTakerTypeOptions = [
  "OWNER",
  "MANAGER",
  "ADMIN",
  "CUSTOMER"
] as const;
export const bookingRequestRefundStatusOptions = [
  "NOT_INITIATED",
  "INITIATED",
  "COMPLETED",
] as const;
export const bookingCancellationTypeOptions = [
  "CUSTOMER_CANCELLED",
  "OWNER_CANCELLED",
  "ADMIN_CANCELLED",
  "NO_SHOW",
] as const;
export const bookingCancellationStayTypeOptions = ["SHORT", "LONG"] as const;
export const bookingCancellationRefundStatusOptions = [
  "NOT_INITIATED",
  "INITIATED",
  "COMPLETED",
] as const;
export const bookingDiscountTypeOptions = [
  "OWNER_DISCOUNT",
  "MULTIPLE_NIGHTS_DISCOUNT",
  "COUPON",
] as const;
export const bookingDiscountValueTypeOptions = ["PERCENTAGE", "FLAT"] as const;
export const bookingDiscountCalculationBaseOptions = [
  "BASE_AMOUNT",
  "RUNNING_TOTAL",
] as const;
export const bookingRefundTypeOptions = [
  "GOODWILL",
  "ADJUSTMENT",
  "CUSTOMER_REFUND",
] as const;
export const bookingRefundStatusOptions = [
  "PENDING",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "FAILED",
] as const;
export const bookingRefundAttemptStatusOptions = [
  "PENDING",
  "SUCCESS",
  "FAILED",
] as const;
export const bookingRefundInitiatedByTypeOptions = ["SYSTEM", "ADMIN"] as const;
export const bookingPriceAdjustmentTypeOptions = [
  "EXTRA_GUEST",
  "EXTENSION",
  "DAMAGE",
  "GOODWILL",
  "PRICE_CORRECTION",
  "OTHER",
] as const;
export const bookingPriceAdjustmentFlowTypeOptions = [
  "CUSTOMER_TO_PLATFORM",
  "PLATFORM_TO_CUSTOMER",
] as const;
export const inventorySourceTypeOptions = [
  "BOOKING",
  "BLOCKING",
  "BOOKING_REQUEST",
] as const;
export const inventoryBlockTypeOptions = [
  "ONLINE_BOOKING",
  "OFFLINE_BOOKING",
  "TEMPORARY_BLOCK",
  "PERMANENT_BLOCK",
  "ICAL_BLOCK",
] as const;
export const inventoryBlockCategoryOptions = [
  "CUSTOMER",
  "OWNER",
  "EXTERNAL",
] as const;
export const inventoryStatusOptions = ["ACTIVE", "CANCELLED", "EXPIRED"] as const;
export const blockingTypeOptions = ["TEMPORARY", "PERMANENT", "ICAL"] as const;
export const blockingSourceOptions = ["ADMIN", "OWNER", "ICAL"] as const;
export const blockingReasonTypeOptions = [
  "PERSONAL_USE",
  "MAINTENANCE",
  "PERSONAL_BOOKING",
  "OTHER",
] as const;
export const blockingStatusOptions = ["ACTIVE", "EXPIRED", "CANCELLED"] as const;
export const iCalOTAOptions = ["AIRBNB", "BOOKING.COM", "MAKEMYTRIP"] as const;

export const supervisorRoleOptions = ["JUNIOR_SUPERVISOR", "SENIOR_SUPERVISOR"] as const;
export const itemTypeOptions = ["INVENTORY", "SUPPLIES", "MAINTENANCE"] as const;
export const photoRequirementTypeOptions = [
  "ALWAYS_REQUIRED",
  "REQUIRED_IF_ISSUE",
  "NOT_REQUIRED",
] as const;
export const auditTypeOptions = ["ROUTINE", "QC_REVIEW"] as const;
export const auditStatusOptions = ["IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export const quantityStatusOptions = ["OK", "SHORTAGE", "CRITICAL"] as const;
export const conditionStatusOptions = ["GOOD", "NEEDS_ATTENTION", "CRITICAL"] as const;
export const mediaTypeOptions = ["PHOTO", "VIDEO"] as const;
export const auditSectionOptions = ["INVENTORY", "SUPPLIES", "MAINTENANCE"] as const;
export const ticketPriorityOptions = ["P1", "P2"] as const;
export const ticketStatusOptions = ["OPEN", "RESOLVED"] as const;

export const gatheringTypeOptions = ["Friends", "Wedding", "Corporate", "Family"] as const;
export const eventTypeOptions = ["VIEW_PROPERTY", "LIKE", "SHARE", "CONTACT_CLICK"] as const;
export const whatsappStatusOptions = ["PENDING", "SENT", "DELIVERED", "FAILED"] as const;
export const enquiryTypeOptions = [
  "contact_request",
  "property_enquiry",
  "event_enquiry",
  "general_contact",
  "booking_enquiry",
  "support_request",
  "partnership_enquiry",
  "media_enquiry",
] as const;
export const enquiryStatusOptions = [
  "pending",
  "in_progress",
  "resolved",
  "closed",
  "spam",
] as const;
export const enquiryPriorityOptions = ["low", "medium", "high", "urgent"] as const;

export const bulkOperationTypeOptions = ["increase", "decrease", "set_fixed"] as const;
export const bulkOperationModeOptions = ["percentage", "flat"] as const;
export const tableHistoryRoleOptions = ["Admin", "User"] as const;
export const tableHistoryOperationOptions = ["INSERT", "UPDATE", "DELETE"] as const;
export const activityLogRoleOptions = ["ADMIN", "USER", "SYSTEM"] as const;

export const notificationRecipientRoleOptions = [
  "customer",
  "owner",
  "manager",
  "caretaker",
  "admin",
  "user",
] as const;

export const staticImageSectionOptions = [
  "why_instafarms_carousel",
  "homepage_hero",
  "about_us_banner",
  "testimonials_background",
  "partner_logos",
  "footer_social",
] as const;

export const ownerWalletLedgerTypeOptions = [
  "BOOKING_EARNING",
  "COMMISSION",
  "CANCELLATION_EARNING",
  "CANCELLATION_COMMISSION",
  "MILESTONE_ADJUSTMENT",
] as const;
export const ownerWalletLedgerReferenceTypeOptions = [
  "BOOKING_SETTLEMENT",
  "PAYOUT",
  "REFUND_RECOVERY",
  "ADJUSTMENT",
  "MILESTONE_ADJUSTMENT",
  "MANUAL",
] as const;
export const ownerWalletLedgerComponentTypeOptions = [
  "BOOKING_EARNING",
  "CANCELLATION_EARNING",
  "REFUND_DEDUCTION",
  "GOODWILL_DEDUCTION",
  "MILESTONE_BONUS",
  "PAYOUT",
  "MANUAL",
  "TDS_DEDUCTION",
] as const;
export const ledgerDirectionOptions = ["CREDIT", "DEBIT"] as const;
export const ownerPayoutStatusOptions = [
  "INITIATED",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
] as const;
export const ownerPayoutMethodOptions = ["BANK_TRANSFER", "UPI", "MANUAL"] as const;
export const ownerPayoutGatewayOptions = ["RAZORPAY", "CASHFREE", "MANUAL"] as const;
export const ownerPayoutAttemptStatusOptions = ["SUCCESS", "FAILED"] as const;
export const ownerSettlementStatusOptions = ["PENDING", "FINALIZED", "ADJUSTED"] as const;
export const ownerSettlementAdjustmentTypeOptions = [
  "GOODWILL",
  "DAMAGE",
  "EXTRA_GUEST",
  "EXTENSION",
  "PENALTY",
  "MANUAL",
  "PRICE_CORRECTION",
] as const;
export const ownerSettlementAdjustmentDirectionOptions = ["INCREASE", "DECREASE"] as const;
export const tdsRecordReferenceTypeOptions = [
  "BOOKING",
  "CANCELLATION",
  "ADJUSTMENT",
] as const;
export const tdsRecordEntryTypeOptions = ["CREDIT", "DEBIT"] as const;
export const gstRecordTypeOptions = ["BOOKING_GST", "COMMISSION_GST"] as const;
export const gstRecordReferenceTypeOptions = [
  "BOOKING",
  "CANCELLATION",
  "ADJUSTMENT",
] as const;
export const gstRecordLiabilityHolderOptions = ["PLATFORM", "OWNER"] as const;
export const gstRecordEntryDirectionOptions = ["DEBIT", "CREDIT"] as const;
export const platformLedgerTypeOptions = [
  "COMMISSION",
  "COMMISSION_REVERSAL",
  "CANCEL_COMMISSION",
  "MILESTONE_COMMISSION_ADJUSTMENT",
  "GATEWAY_FEE",
] as const;
export const platformLedgerReferenceTypeOptions = [
  "BOOKING",
  "CANCELLATION",
  "REFUND",
  "MILESTONE_ADJUSTMENT",
  "MANUAL_ADJUSTMENT",
] as const;
export const platformLedgerEntryTypeOptions = ["CREDIT", "DEBIT"] as const;
export const platformLedgerCategoryOptions = [
  "COMMISSION",
  "CANCELLATION_COMMISSION",
  "REFUND_LOSS",
  "GOODWILL",
  "MILESTONE_ADJUSTMENT",
  "MANUAL",
] as const;

export interface ServerActionResult {
  success?: string;
  error?: string;
  status?: number;
}

export interface ServerSearchResult<T> {
  data?: T;
  error?: string;
  status?: number;
}

export interface ServerPageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export type TimestampKeys = keyof typeof timestamps;

export type Admin = Omit<typeof admins.$inferSelect, TimestampKeys>;

export type Activity = Omit<typeof activities.$inferSelect, TimestampKeys>;

export type Amenity = Omit<typeof amenities.$inferSelect, TimestampKeys>;

export type _Area = Omit<typeof areas.$inferSelect, TimestampKeys>;

export type Area = _Area & {
  city: {
    id: string;
    city: string;
  } | null;
  state: {
    id: string;
    state: string;
  } | null;
};

export type _City = Omit<typeof cities.$inferSelect, TimestampKeys>;

export type City = _City & {
  id: string;
  city: string;
  state: {
    id: string;
    state: string;
  } | null;
};

export type _Property = Omit<typeof properties.$inferSelect, TimestampKeys>;
export type _PropertyBrandSpecificData = Omit<
  typeof propertiesDataSpecificToBrands.$inferSelect,
  TimestampKeys
>;

export type Property = _Property & {
  area: {
    id: string;
    area: string;
  } | null;
  city: {
    id: string;
    city: string;
  } | null;
  state: {
    id: string;
    state: string;
  } | null;
};

export type PropertyType = Omit<
  typeof propertyTypes.$inferSelect,
  TimestampKeys
>;

export type State = Omit<typeof states.$inferSelect, TimestampKeys>;

export type UserRole = (typeof roleOptions)[number];

export type User = Omit<
  typeof users.$inferSelect,
  TimestampKeys | "instafarmsReference"
>;

export type Gender = (typeof genderOptions)[number];
export type RefundStatus = (typeof refundStatusOptions)[number];
export type CancellationType = (typeof cancellationTypeOptions)[number];
export type BookingType = (typeof bookingTypeOptions)[number];
export type BookingStatus = (typeof bookingStatusOptions)[number];
export type BookingPaymentStatus = (typeof bookingPaymentStatusOptions)[number];

export type _Booking = Omit<typeof bookings.$inferSelect, TimestampKeys>;

export type Booking = _Booking & {
  property: _Property | null;
  cancellation: _Cancellation | null;
  customer: Customer | null;
};

export type TransactionType = (typeof transactionTypeOptions)[number];
export type PaymentType = (typeof paymentTypeOptions)[number];
export type PaymentMode = (typeof paymentModeOptions)[number];

export type _Payment = Omit<typeof payments.$inferSelect, TimestampKeys>;

export type Payment = _Payment & {
  referencePerson: User | null;
  paymentCreator: User | null;
};

export type _Cancellation = Omit<
  typeof cancellations.$inferSelect,
  TimestampKeys
>;

export type Cancellation = _Cancellation & {
  referencePerson: User;
};

export type Customer = Omit<
  typeof customers.$inferSelect,
  TimestampKeys | "instafarmsReference"
>;

export interface AmenityData {
  id: string;
  weight: number | null;
  amenity: string;
  isPaid: boolean;
  isUSP: boolean;
}

export interface ActivityData {
  id: string;
  weight: number | null;
  activity: string;
  isPaid: boolean;
  isUSP: boolean;
}

export interface Owner {
  propertyId: string;
  ownerId: string;
}

export interface Manager {
  propertyId: string;
  managerId: string;
}

export interface Caretaker {
  propertyId: string;
  caretakerId: string;
}

export interface SpecialDateData {
  id: string;
  date: string;
  price: number | null;
  priceWithGST: number | null;
  adultExtraGuestCharge: number | null;
  adultExtraGuestChargeWithGST: number | null;
  childExtraGuestCharge: number | null;
  childExtraGuestChargeWithGST: number | null;
  infantExtraGuestCharge: number | null;
  infantExtraGuestChargeWithGST: number | null;
  baseGuestCount: number | null;
  discount: number | null;
  maxExtraGuestPrice: number | null;
  maxTotal: number | null;
  gstSlab: number | null;
}

export interface BlockedDate {
  id: string;
  blockedDate: string;
}

export interface BankDetail {
  id: string;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  bankAccountHolderName?: string | null;
  bankIfsc?: string | null;
  bankNickname?: string | null;
  bankBranch?: string | null;
}

export interface DateInfo {
  price: number | null;
  status: DateState;
}

export enum DateState {
  IDLE = "IDLE",
  BOOKED = "BOOKED",
  BLOCKED = "BLOCKED",
  HIDDEN = "HIDDEN",
  LOADING = "LOADING",
}

export type NewBookingData = Omit<_Booking, "customerId"> & {
  customer: Customer | null;
  customerId: string | null;
  payments: _Payment[];
};

type PickExisting<T, K extends string> = Pick<T, Extract<K, keyof T>>;

export type DefaultPricingData = PickExisting<
  _PropertyBrandSpecificData,
  | "weekdayPrice"
  | "weekdayBaseGuestCount"
  | "weekdayAdultExtraGuestCharge"
  | "weekdayChildExtraGuestCharge"
  | "weekdayInfantExtraGuestCharge"
  | "weekdayDiscount"
  | "weekendPrice"
  | "weekendBaseGuestCount"
  | "weekendAdultExtraGuestCharge"
  | "weekendChildExtraGuestCharge"
  | "weekendInfantExtraGuestCharge"
  | "weekendDiscount"
  | "weekendSaturdayPrice"
  | "weekendSaturdayBaseGuestCount"
  | "weekendSaturdayAdultExtraGuestCharge"
  | "weekendSaturdayChildExtraGuestCharge"
  | "weekendSaturdayInfantExtraGuestCharge"
  | "weekendSaturdayDiscount"
  | "mondayPrice"
  | "mondayBaseGuestCount"
  | "mondayAdultExtraGuestCharge"
  | "mondayChildExtraGuestCharge"
  | "mondayInfantExtraGuestCharge"
  | "mondayDiscount"
  | "tuesdayPrice"
  | "tuesdayBaseGuestCount"
  | "tuesdayAdultExtraGuestCharge"
  | "tuesdayChildExtraGuestCharge"
  | "tuesdayInfantExtraGuestCharge"
  | "tuesdayDiscount"
  | "wednesdayPrice"
  | "wednesdayBaseGuestCount"
  | "wednesdayAdultExtraGuestCharge"
  | "wednesdayChildExtraGuestCharge"
  | "wednesdayInfantExtraGuestCharge"
  | "wednesdayDiscount"
  | "thursdayPrice"
  | "thursdayBaseGuestCount"
  | "thursdayAdultExtraGuestCharge"
  | "thursdayChildExtraGuestCharge"
  | "thursdayInfantExtraGuestCharge"
  | "thursdayDiscount"
  | "fridayPrice"
  | "fridayBaseGuestCount"
  | "fridayAdultExtraGuestCharge"
  | "fridayChildExtraGuestCharge"
  | "fridayInfantExtraGuestCharge"
  | "fridayDiscount"
  | "saturdayPrice"
  | "saturdayBaseGuestCount"
  | "saturdayAdultExtraGuestCharge"
  | "saturdayChildExtraGuestCharge"
  | "saturdayInfantExtraGuestCharge"
  | "saturdayDiscount"
  | "sundayPrice"
  | "sundayBaseGuestCount"
  | "sundayAdultExtraGuestCharge"
  | "sundayChildExtraGuestCharge"
  | "sundayInfantExtraGuestCharge"
  | "sundayDiscount"
  | "daywisePrice"
>;

export type PropertyDataWithRole = Property & { role: UserRole };

export type _Review = Omit<typeof reviews.$inferSelect, TimestampKeys>;
export type _ReviewMagicLink = Omit<typeof reviewMagicLinks.$inferSelect, TimestampKeys>;

export type Review = _Review & {
  property: _Property | null;
  customer: Customer | null;
  booking: _Booking | null;
};

export interface ReviewRatings {
  cleanlinessRating?: number | null;
  caretakerBehaviourRating?: number | null;
  propertyAccessRating?: number | null;
  swimmingPoolRating?: number | null;
  kitchenUtensilsRating?: number | null;
  overallRating: number;
  comment?: string | null;
}
