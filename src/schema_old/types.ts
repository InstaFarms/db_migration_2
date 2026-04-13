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
    propertyTypes,
    states,
    timestamps,
    users,
    reviews,
    reviewMagicLinks
} from "./schema.ts";// BUILD ERROR


export const roleOptions = ["Owner", "Manager", "Caretaker"] as const;
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
export const ezeeBookingTypeOptions = ["CREATE", "UPDATE", "CANCEL"] as const;

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

export type DefaultPricingData = Pick<
    _Property,
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
