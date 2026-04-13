import { eq, sql } from "drizzle-orm";
import {
    boolean,
    check,
    date,
    decimal,
    ExtraConfigColumn,
    index,
    integer,
    json,
    jsonb,
    numeric,
    pgEnum,
    pgTable,
    pgView,
    primaryKey,
    real,
    text,
    time,
    timestamp,
    unique,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

import type { ColumnBaseConfig, ColumnDataType } from "drizzle-orm";

import {
    BankDetail,
    bookingPaymentStatusOptions,
    bookingStatusOptions,
    bookingTypeOptions,
    cancellationTypeOptions,
    ezeeBookingTypeOptions,
    genderOptions,
    paymentModeOptions,
    paymentTypeOptions,
    refundStatusOptions,
    roleOptions,
    transactionTypeOptions,
    webhookStatusOptions,
} from "./types.ts";

export const rolesEnum = pgEnum("role", roleOptions);
export const webhookStatusEnum = pgEnum("webhookstatus", webhookStatusOptions);
export const genderEnum = pgEnum("gender", genderOptions);
export const refundStatusEnum = pgEnum("refundStatusEnum", refundStatusOptions);
export const cancellationTypeEnum = pgEnum(
    "cancellationTypeEnum",
    cancellationTypeOptions
);
export const bookingTypeEnum = pgEnum("bookingType", bookingTypeOptions);
export const bookingStatusEnum = pgEnum("bookingStatus", bookingStatusOptions);
export const bookingPaymentStatusEnum = pgEnum("bookingPaymentStatus", bookingPaymentStatusOptions);
export const transactionTypeEnum = pgEnum(
    "transactionTypeEnum",
    transactionTypeOptions
);
export const paymentTypeEnum = pgEnum("paymentTypeEnum", paymentTypeOptions);
export const paymentModeEnum = pgEnum("paymentModeEnum", paymentModeOptions);
export const ezeeBookingTypeEnum = pgEnum("ezeeBookingType", ezeeBookingTypeOptions);

// New enums for listing system
export const gatheringTypeEnum = pgEnum("gatheringType", [
    "Friends",
    "Wedding",
    "Corporate",
    "Family"
]);

export const eventTypeEnum = pgEnum("eventType", [
    "VIEW_PROPERTY",
    "LIKE",
    "SHARE",
    "CONTACT_CLICK"
]);

export const whatsappStatusEnum = pgEnum("whatsappStatus", [
    "PENDING",
    "SENT",
    "DELIVERED",
    "FAILED"
]);


export const entityTypeEnum = pgEnum("entityType", [
    "CLUBBED",
    "SPLIT",
    "STANDALONE"
]);

export const bookingConfirmationStatusEnum = pgEnum("bookingConfirmationStatus", [
    "PENDING",
    "CONFIRMED",
    "REJECTED",
    "AUTO_REJECTED",
    "CANCELLED"
]);

export const paymentStageEnum = pgEnum("paymentStage", [
    "ADVANCE",
    "FULL",
    "REFUND"
]);

export const beddingTypeEnum = pgEnum("beddingType", [
    "KING",
    "QUEEN",
    "DOUBLE",
    "SINGLE",
    "SOFA_BED",
    "MATTRESS",
    "NONE"
]);

export const walletTransactionTypeEnum = pgEnum("walletTransactionType", [
    "booking_credit",
    "admin_credit",
    "admin_debit",
    "withdrawal_debit",
]);

export const withdrawalStatusEnum = pgEnum("withdrawalStatus", [
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled",
]);

export const settlementStatusEnum = pgEnum("settlementStatus", [
    "unsettled",
    "processing",
    "settled",
    "failed",
]);

export const settlementTimingEnum = pgEnum("settlementTiming", [
    "checkout",
    "checkin",
]);

export const bulkOperationTypeEnum = pgEnum("bulkOperationType", [
    "increase",
    "decrease",
    "set_fixed",
]);

export const bulkOperationModeEnum = pgEnum("bulkOperationMode", [
    "percentage",
    "flat",
]);

export const bulkEntityTypeEnum = pgEnum("bulkEntityType", ["ENTITY"]);

// Property Audit System Enums
export const supervisorRoleEnum = pgEnum("supervisorRole", [
    "JUNIOR_SUPERVISOR",
    "SENIOR_SUPERVISOR",
]);

export const propertyManagementTypeEnum = pgEnum("propertyManagementType", [
    "MAGO_MANAGED",
    "LISTING_ONLY",
]);

export const auditComplianceStatusEnum = pgEnum("auditComplianceStatus", [
    "COMPLIANT",
    "NOT_APPLICABLE",
    "BREACHED",
]);

export const itemTypeEnum = pgEnum("itemType", [
    "INVENTORY",
    "SUPPLIES",
    "MAINTENANCE",
]);

export const photoRequirementTypeEnum = pgEnum("photoRequirementType", [
    "ALWAYS_REQUIRED",
    "REQUIRED_IF_ISSUE",
    "NOT_REQUIRED",
]);

export const auditTypeEnum = pgEnum("auditType", [
    "ROUTINE",
    "QC_REVIEW",
]);

export const auditStatusEnum = pgEnum("auditStatus", [
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
]);

export const quantityStatusEnum = pgEnum("quantityStatus", [
    "OK",
    "SHORTAGE",
    "CRITICAL",
]);

export const conditionStatusEnum = pgEnum("conditionStatus", [
    "GOOD",
    "NEEDS_ATTENTION",
    "CRITICAL",
]);

export const mediaTypeEnum = pgEnum("mediaType", [
    "PHOTO",
    "VIDEO",
]);

export const auditSectionEnum = pgEnum("auditSection", [
    "INVENTORY",
    "SUPPLIES",
    "MAINTENANCE",
]);

export const ticketPriorityEnum = pgEnum("ticketPriority", [
    "P1",
    "P2",
]);

export const ticketStatusEnum = pgEnum("ticketStatus", [
    "OPEN",
    "RESOLVED",
]);

export const photoCategoryEnum = pgEnum("photoCategory", [
    "OUTDOORS",
    "INDOORS",
    "BED_BATH",
    "AMENITIES",
    "OTHERS",
]);

export const dataSource = {
    instafarmsReference: text("instafarmsReference"),
};

export const timestamps = {
    createdAt: timestamp("createdAt", {
        withTimezone: true,
        mode: "string",
    })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updatedAt", {
        withTimezone: true,
        mode: "string",
    })
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
};

// updatedBy property will be updated by the query or will reset to null
// no foreign key because of TypeScript error

// For tables only admins can update
export const adminUpdateReference = {
    adminCreatedBy: uuid("adminCreatedBy").notNull(),
    adminUpdatedBy: uuid("adminUpdatedBy")
        .$onUpdateFn(() => sql`null`)
        .notNull(),
};

// For tables both admins and users can update
export const adminOrUserUpdateReference = {
    createdBy: uuid("createdBy"),
    updatedBy: uuid("updatedBy").$onUpdateFn(() => sql`null`),
    adminCreatedBy: uuid("adminCreatedBy"),
    adminUpdatedBy: uuid("adminUpdatedBy").$onUpdateFn(() => sql`null`),
};

// For tables both admins and supervisors can update
export const adminOrSupervisorUpdateReference = {
    supervisorCreatedBy: uuid("supervisorCreatedBy"),
    supervisorUpdatedBy: uuid("supervisorUpdatedBy").$onUpdateFn(() => sql`null`),
    adminCreatedBy: uuid("adminCreatedBy"),
    adminUpdatedBy: uuid("adminUpdatedBy").$onUpdateFn(() => sql`null`),
};

// constraints to make sure createdBy and updatedBy are properly set
type UpdateRefColType = ExtraConfigColumn<
    ColumnBaseConfig<ColumnDataType, string>
>;

const setUserOrAdminUpdatedByConstraint = (table: {
    createdBy: UpdateRefColType;
    updatedBy: UpdateRefColType;
    adminCreatedBy: UpdateRefColType;
    adminUpdatedBy: UpdateRefColType;
}) =>
    check(
        "updateref_constraint",
        sql`(${table.adminCreatedBy} IS NOT NULL OR ${table.createdBy} IS NOT NULL) AND (${table.adminUpdatedBy} IS NOT NULL OR ${table.updatedBy} IS NOT NULL)`
    );

export const setSupervisorOrAdminUpdatedByConstraint = (table: {
    supervisorCreatedBy: UpdateRefColType;
    supervisorUpdatedBy: UpdateRefColType;
    adminCreatedBy: UpdateRefColType;
    adminUpdatedBy: UpdateRefColType;
}) =>
    check(
        "supadmin_updateref_constraint",
        sql`(${table.adminCreatedBy} IS NOT NULL OR ${table.supervisorCreatedBy} IS NOT NULL) AND (${table.adminUpdatedBy} IS NOT NULL OR ${table.supervisorUpdatedBy} IS NOT NULL)`
    );

export const propertyTypes = pgTable("propertyTypes", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    ...timestamps,
    ...adminUpdateReference,
});

export const activities = pgTable("activities", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    icon: text("icon").notNull(),
    weight: integer("weight"),
    isPaid: boolean("isPaid").notNull().default(false),
    isUSP: boolean("isUSP").notNull().default(false),
    ...timestamps,
    ...adminUpdateReference,
});

export const activitiesOnProperties = pgTable(
    "activitiesOnProperties",
    {
        propertyId: uuid("propertyId")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        activityId: uuid("activityId")
            .notNull()
            .references(() => activities.id, {
                onDelete: "cascade",
            }),
        weight: integer("weight"),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.propertyId, table.activityId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const amenities = pgTable("amenities", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    icon: text("icon").notNull(),
    weight: integer("weight"),
    isPaid: boolean("isPaid").notNull().default(false),
    isUSP: boolean("isUSP").notNull().default(false),
    ...timestamps,
    ...adminUpdateReference,
});

export const amenitiesOnProperties = pgTable(
    "amenitiesOnProperties",
    {
        propertyId: uuid("propertyId")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        amenityId: uuid("amenityId")
            .notNull()
            .references(() => amenities.id, {
                onDelete: "cascade",
            }),
        weight: integer("weight"),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.propertyId, table.amenityId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const safetyHygiene = pgTable("safetyHygiene", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    icon: text("icon"),
    ...timestamps,
    ...adminUpdateReference,
});

export const safetyHygieneOnProperties = pgTable(
    "safetyHygieneOnProperties",
    {
        propertyId: uuid("propertyId")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        safetyHygieneId: uuid("safetyHygieneId")
            .notNull()
            .references(() => safetyHygiene.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.propertyId, table.safetyHygieneId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const users = pgTable(
    "users",
    {
        id: uuid("id").notNull().primaryKey().defaultRandom(),

        firstName: text("firstName"),
        lastName: text("lastName"),

        mobileNumber: varchar("mobileNumber", { length: 256 })
            // .unique("unique_mobileNumber")
            .notNull(),

        whatsappNumber: varchar("whatsappNumber", { length: 256 }),
        email: varchar("email", { length: 256 }),
        // .unique("unique_email"),

        gender: genderEnum("gender"),
        alternateContact: text("alternateContact"),

        bankAccounts: json("bankAccounts")
            .$type<BankDetail[]>()
            .notNull()
            .default([]),

        addressDetails: json("addressDetails").default({}),

        settlementTiming: settlementTimingEnum("settlementTiming")
            .notNull()
            .default("checkout"),

        settlementTime: time("settlementTime").default("22:00:00"),
        settlementEnabled: boolean("settlementEnabled").notNull().default(true),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("users_mobile_number_idx").on(table.mobileNumber),
        index("users_email_idx").on(table.email),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

// Property Audit System - Independent Tables
export const supervisors = pgTable("supervisors", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").unique().notNull(),
    email: text("email").unique().notNull(),
    role: supervisorRoleEnum("role").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const propertyAuditAreaCategoryMaster = pgTable("propertyAuditAreaCategoryMaster", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    weight: integer("weight").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const checklistCategoryMaster = pgTable("checklistCategoryMaster", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    itemType: itemTypeEnum("itemType").notNull(),
    weight: integer("weight").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const issueTypes = pgTable("issueTypes", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").unique().notNull(),
    label: text("label").notNull(),
    description: text("description"),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const ownersOnProperties = pgTable(
    "ownersOnProperties",
    {
        ownerId: uuid("ownerId")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        propertyId: uuid("propertyId")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.ownerId, table.propertyId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const managersOnProperties = pgTable(
    "managersOnProperties",
    {
        managerId: uuid("managerId")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        propertyId: uuid("propertyId")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.managerId, table.propertyId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const caretakersOnProperties = pgTable(
    "caretakersOnProperties",
    {
        caretakerId: uuid("caretakerId")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        propertyId: uuid("propertyId")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.caretakerId, table.propertyId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const properties = pgTable(
    "properties",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Property Detail
        propertyName: text("propertyName").notNull(),
        heading: text("heading").notNull(),
        propertyCode: text("propertyCode").notNull(),
        propertyCodeName: text("propertyCodeName"),
        description: text("description").default(""),
        exploreYourStay: text("exploreYourStay"),
        // videoUrl: text("videoUrl"),
        // Discuss: Only 1 property on Instafarms uses this field
        // listedBy: text("listedBy").notNull(),

        allowCallBooking: boolean("allowCallBooking").notNull().default(false),
        allowEnquiry: boolean("allowEnquiry").notNull().default(false),
        allowOnlineBooking: boolean("allowOnlineBooking").notNull().default(false),

        commissionPercentage: integer("commissionPercentage").notNull().default(0),
        securityDeposit: integer("securityDeposit").notNull().default(0),
        cookingAccessFee: integer("cookingAccessFee").notNull().default(0),
        // Day wise price and charges
        mondayPrice: integer("mondayPrice"),
        mondayPriceWithGST: integer("mondayPriceWithGST"),
        mondayAdultExtraGuestCharge: integer("mondayAdultExtraGuestCharge"),
        mondayAdultExtraGuestChargeWithGST: integer("mondayAdultExtraGuestChargeWithGST"),
        mondayChildExtraGuestCharge: integer("mondayChildExtraGuestCharge"),
        mondayChildExtraGuestChargeWithGST: integer("mondayChildExtraGuestChargeWithGST"),
        mondayInfantExtraGuestCharge: integer("mondayInfantExtraGuestCharge"),
        mondayInfantExtraGuestChargeWithGST: integer("mondayInfantExtraGuestChargeWithGST"),
        mondayBaseGuestCount: integer("mondayBaseGuestCount"),
        mondayDiscount: integer("mondayDiscount"),
        mondayGSTslab: integer("mondayGSTSlab"),
        mondayMaxExtraGuestPrice: integer("mondayMaxExtraGuestPrice"),
        mondayMaxTotal: integer("mondayMaxTotal"),

        tuesdayPrice: integer("tuesdayPrice"),
        tuesdayPriceWithGST: integer("tuesdayPriceWithGST"),
        tuesdayAdultExtraGuestCharge: integer("tuesdayAdultExtraGuestCharge"),
        tuesdayAdultExtraGuestChargeWithGST: integer("tuesdayAdultExtraGuestChargeWithGST"),
        tuesdayChildExtraGuestCharge: integer("tuesdayChildExtraGuestCharge"),
        tuesdayChildExtraGuestChargeWithGST: integer("tuesdayChildExtraGuestChargeWithGST"),
        tuesdayInfantExtraGuestCharge: integer("tuesdayInfantExtraGuestCharge"),
        tuesdayInfantExtraGuestChargeWithGST: integer("tuesdayInfantExtraGuestChargeWithGST"),
        tuesdayBaseGuestCount: integer("tuesdayBaseGuestCount"),
        tuesdayDiscount: integer("tuesdayDiscount"),
        tuesdayGSTslab: integer("tuesdayGSTSlab"),
        tuesdayMaxExtraGuestPrice: integer("tuesdayMaxExtraGuestPrice"),
        tuesdayMaxTotal: integer("tuesdayMaxTotal"),

        wednesdayPrice: integer("wednesdayPrice"),
        wednesdayPriceWithGST: integer("wednesdayPriceWithGST"),
        wednesdayAdultExtraGuestCharge: integer("wednesdayAdultExtraGuestCharge"),
        wednesdayAdultExtraGuestChargeWithGST: integer("wednesdayAdultExtraGuestChargeWithGST"),
        wednesdayChildExtraGuestCharge: integer("wednesdayChildExtraGuestCharge"),
        wednesdayChildExtraGuestChargeWithGST: integer("wednesdayChildExtraGuestChargeWithGST"),
        wednesdayInfantExtraGuestCharge: integer("wednesdayInfantExtraGuestCharge"),
        wednesdayInfantExtraGuestChargeWithGST: integer("wednesdayInfantExtraGuestChargeWithGST"),
        wednesdayBaseGuestCount: integer("wednesdayBaseGuestCount"),
        wednesdayDiscount: integer("wednesdayDiscount"),
        wednesdayGSTslab: integer("wednesdayGSTSlab"),
        wednesdayMaxExtraGuestPrice: integer("wednesdayMaxExtraGuestPrice"),
        wednesdayMaxTotal: integer("wednesdayMaxTotal"),

        thursdayPrice: integer("thursdayPrice"),
        thursdayPriceWithGST: integer("thursdayPriceWithGST"),
        thursdayAdultExtraGuestCharge: integer("thursdayAdultExtraGuestCharge"),
        thursdayAdultExtraGuestChargeWithGST: integer("thursdayAdultExtraGuestChargeWithGST"),
        thursdayChildExtraGuestCharge: integer("thursdayChildExtraGuestCharge"),
        thursdayChildExtraGuestChargeWithGST: integer("thursdayChildExtraGuestChargeWithGST"),
        thursdayInfantExtraGuestCharge: integer("thursdayInfantExtraGuestCharge"),
        thursdayInfantExtraGuestChargeWithGST: integer("thursdayInfantExtraGuestChargeWithGST"),
        thursdayBaseGuestCount: integer("thursdayBaseGuestCount"),
        thursdayDiscount: integer("thursdayDiscount"),
        thursdayGSTslab: integer("thursdayGSTSlab"),
        thursdayMaxExtraGuestPrice: integer("thursdayMaxExtraGuestPrice"),
        thursdayMaxTotal: integer("thursdayMaxTotal"),

        fridayPrice: integer("fridayPrice"),
        fridayPriceWithGST: integer("fridayPriceWithGST"),
        fridayAdultExtraGuestCharge: integer("fridayAdultExtraGuestCharge"),
        fridayAdultExtraGuestChargeWithGST: integer("fridayAdultExtraGuestChargeWithGST"),
        fridayChildExtraGuestCharge: integer("fridayChildExtraGuestCharge"),
        fridayChildExtraGuestChargeWithGST: integer("fridayChildExtraGuestChargeWithGST"),
        fridayInfantExtraGuestCharge: integer("fridayInfantExtraGuestCharge"),
        fridayInfantExtraGuestChargeWithGST: integer("fridayInfantExtraGuestChargeWithGST"),
        fridayBaseGuestCount: integer("fridayBaseGuestCount"),
        fridayDiscount: integer("fridayDiscount"),
        fridayGSTslab: integer("fridayGSTSlab"),
        fridayMaxExtraGuestPrice: integer("fridayMaxExtraGuestPrice"),
        fridayMaxTotal: integer("fridayMaxTotal"),

        saturdayPrice: integer("saturdayPrice"),
        saturdayPriceWithGST: integer("saturdayPriceWithGST"),
        saturdayAdultExtraGuestCharge: integer("saturdayAdultExtraGuestCharge"),
        saturdayAdultExtraGuestChargeWithGST: integer("saturdayAdultExtraGuestChargeWithGST"),
        saturdayChildExtraGuestCharge: integer("saturdayChildExtraGuestCharge"),
        saturdayChildExtraGuestChargeWithGST: integer("saturdayChildExtraGuestChargeWithGST"),
        saturdayInfantExtraGuestCharge: integer("saturdayInfantExtraGuestCharge"),
        saturdayInfantExtraGuestChargeWithGST: integer("saturdayInfantExtraGuestChargeWithGST"),
        saturdayBaseGuestCount: integer("saturdayBaseGuestCount"),
        saturdayDiscount: integer("saturdayDiscount"),
        saturdayGSTslab: integer("saturdayGSTSlab"),
        saturdayMaxExtraGuestPrice: integer("saturdayMaxExtraGuestPrice"),
        saturdayMaxTotal: integer("saturdayMaxTotal"),

        sundayPrice: integer("sundayPrice"),
        sundayPriceWithGST: integer("sundayPriceWithGST"),
        sundayAdultExtraGuestCharge: integer("sundayAdultExtraGuestCharge"),
        sundayAdultExtraGuestChargeWithGST: integer("sundayAdultExtraGuestChargeWithGST"),
        sundayChildExtraGuestCharge: integer("sundayChildExtraGuestCharge"),
        sundayChildExtraGuestChargeWithGST: integer("sundayChildExtraGuestChargeWithGST"),
        sundayInfantExtraGuestCharge: integer("sundayInfantExtraGuestCharge"),
        sundayInfantExtraGuestChargeWithGST: integer("sundayInfantExtraGuestChargeWithGST"),
        sundayBaseGuestCount: integer("sundayBaseGuestCount"),
        sundayDiscount: integer("sundayDiscount"),
        sundayGSTslab: integer("sundayGSTSlab"),
        sundayMaxExtraGuestPrice: integer("sundayMaxExtraGuestPrice"),
        sundayMaxTotal: integer("sundayMaxTotal"),

        // Floating guest charges (day-wise)
        mondayFloatingAdultExtraGuestCharge: integer("mondayFloatingAdultExtraGuestCharge"),
        mondayFloatingChildExtraGuestCharge: integer("mondayFloatingChildExtraGuestCharge"),
        mondayFloatingInfantExtraGuestCharge: integer("mondayFloatingInfantExtraGuestCharge"),
        mondayFloatingAdultExtraGuestChargeWithGST: integer("mondayFloatingAdultExtraGuestChargeWithGST"),
        mondayFloatingChildExtraGuestChargeWithGST: integer("mondayFloatingChildExtraGuestChargeWithGST"),
        mondayFloatingInfantExtraGuestChargeWithGST: integer("mondayFloatingInfantExtraGuestChargeWithGST"),

        tuesdayFloatingAdultExtraGuestCharge: integer("tuesdayFloatingAdultExtraGuestCharge"),
        tuesdayFloatingChildExtraGuestCharge: integer("tuesdayFloatingChildExtraGuestCharge"),
        tuesdayFloatingInfantExtraGuestCharge: integer("tuesdayFloatingInfantExtraGuestCharge"),
        tuesdayFloatingAdultExtraGuestChargeWithGST: integer("tuesdayFloatingAdultExtraGuestChargeWithGST"),
        tuesdayFloatingChildExtraGuestChargeWithGST: integer("tuesdayFloatingChildExtraGuestChargeWithGST"),
        tuesdayFloatingInfantExtraGuestChargeWithGST: integer("tuesdayFloatingInfantExtraGuestChargeWithGST"),

        wednesdayFloatingAdultExtraGuestCharge: integer("wednesdayFloatingAdultExtraGuestCharge"),
        wednesdayFloatingChildExtraGuestCharge: integer("wednesdayFloatingChildExtraGuestCharge"),
        wednesdayFloatingInfantExtraGuestCharge: integer("wednesdayFloatingInfantExtraGuestCharge"),
        wednesdayFloatingAdultExtraGuestChargeWithGST: integer("wednesdayFloatingAdultExtraGuestChargeWithGST"),
        wednesdayFloatingChildExtraGuestChargeWithGST: integer("wednesdayFloatingChildExtraGuestChargeWithGST"),
        wednesdayFloatingInfantExtraGuestChargeWithGST: integer("wednesdayFloatingInfantExtraGuestChargeWithGST"),

        thursdayFloatingAdultExtraGuestCharge: integer("thursdayFloatingAdultExtraGuestCharge"),
        thursdayFloatingChildExtraGuestCharge: integer("thursdayFloatingChildExtraGuestCharge"),
        thursdayFloatingInfantExtraGuestCharge: integer("thursdayFloatingInfantExtraGuestCharge"),
        thursdayFloatingAdultExtraGuestChargeWithGST: integer("thursdayFloatingAdultExtraGuestChargeWithGST"),
        thursdayFloatingChildExtraGuestChargeWithGST: integer("thursdayFloatingChildExtraGuestChargeWithGST"),
        thursdayFloatingInfantExtraGuestChargeWithGST: integer("thursdayFloatingInfantExtraGuestChargeWithGST"),

        fridayFloatingAdultExtraGuestCharge: integer("fridayFloatingAdultExtraGuestCharge"),
        fridayFloatingChildExtraGuestCharge: integer("fridayFloatingChildExtraGuestCharge"),
        fridayFloatingInfantExtraGuestCharge: integer("fridayFloatingInfantExtraGuestCharge"),
        fridayFloatingAdultExtraGuestChargeWithGST: integer("fridayFloatingAdultExtraGuestChargeWithGST"),
        fridayFloatingChildExtraGuestChargeWithGST: integer("fridayFloatingChildExtraGuestChargeWithGST"),
        fridayFloatingInfantExtraGuestChargeWithGST: integer("fridayFloatingInfantExtraGuestChargeWithGST"),

        saturdayFloatingAdultExtraGuestCharge: integer("saturdayFloatingAdultExtraGuestCharge"),
        saturdayFloatingChildExtraGuestCharge: integer("saturdayFloatingChildExtraGuestCharge"),
        saturdayFloatingInfantExtraGuestCharge: integer("saturdayFloatingInfantExtraGuestCharge"),
        saturdayFloatingAdultExtraGuestChargeWithGST: integer("saturdayFloatingAdultExtraGuestChargeWithGST"),
        saturdayFloatingChildExtraGuestChargeWithGST: integer("saturdayFloatingChildExtraGuestChargeWithGST"),
        saturdayFloatingInfantExtraGuestChargeWithGST: integer("saturdayFloatingInfantExtraGuestChargeWithGST"),

        sundayFloatingAdultExtraGuestCharge: integer("sundayFloatingAdultExtraGuestCharge"),
        sundayFloatingChildExtraGuestCharge: integer("sundayFloatingChildExtraGuestCharge"),
        sundayFloatingInfantExtraGuestCharge: integer("sundayFloatingInfantExtraGuestCharge"),
        sundayFloatingAdultExtraGuestChargeWithGST: integer("sundayFloatingAdultExtraGuestChargeWithGST"),
        sundayFloatingChildExtraGuestChargeWithGST: integer("sundayFloatingChildExtraGuestChargeWithGST"),
        sundayFloatingInfantExtraGuestChargeWithGST: integer("sundayFloatingInfantExtraGuestChargeWithGST"),

        isDisabled: boolean("isDisabled"),

        bedroomCount: integer("bedroomCount"),
        bathroomCount: integer("bathroomCount"),
        doubleBedCount: integer("doubleBedCount"),
        singleBedCount: integer("singleBedCount"),
        mattressCount: integer("mattressCount"),
        baseGuestCount: integer("baseGuestCount"),
        maxGuestCount: integer("maxGuestCount"),

        // Discuss: Typing for bookingType: restrict online bookings
        bookingType: text("bookingType"),
        defaultGstPercentage: integer("defaultGstPercentage"),
        checkinTime: time("checkinTime"),
        checkoutTime: time("checkoutTime"),

        latitude: text("latitude"),
        longitude: text("longitude"),
        mapLink: text("mapLink"),

        address: text("address"),
        landmark: text("landmark"),
        village: text("village"),
        areaId: uuid("areaId").references(() => areas.id, {
            onDelete: "restrict",
        }),
        secondaryAreaId1: uuid("secondaryAreaId1").references(() => areas.id, {
            onDelete: "restrict",
        }),
        secondaryAreaId2: uuid("secondaryAreaId2").references(() => areas.id, {
            onDelete: "restrict",
        }),
        secondaryAreaId3: uuid("secondaryAreaId3").references(() => areas.id, {
            onDelete: "restrict",
        }),
        secondaryAreaId4: uuid("secondaryAreaId4").references(() => areas.id, {
            onDelete: "restrict",
        }),
        cityId: uuid("cityId").references(() => cities.id, {
            onDelete: "restrict",
        }),
        stateId: uuid("stateId").references(() => states.id, {
            onDelete: "restrict",
        }),
        pincode: text("pincode"),
        propertyTypeId: uuid("propertyTypeId").references(() => propertyTypes.id),
        googlePlaceId: text("googlePlaceId"),
        googlePlaceRating: decimal("googlePlaceRating", { precision: 5, scale: 2 }),
        googlePlaceUserRatingCount: integer("googlePlaceUserRatingCount"),
        googlePlaceReviews: jsonb("googlePlaceReviews")
            .$type<
                {
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
                }[]
            >()
            .default(sql`'[]'::jsonb`),
        nearbyPlaces: jsonb("nearbyPlaces")
            .$type<
                {
                    place_id: string;
                    name: string;
                    vicinity: string;
                    types: string[];
                    lat: number;
                    lng: number;
                }[]
            >()
            .default(sql`'[]'::jsonb`),

        // new fields
        // Discuss: Use of slug? eg: alh-hkl2025-4br-pool-property
        slug: text("slug").unique(),

        // Discuss: status equivalent to isDeleted
        showOnInstafarms: boolean("status").notNull().default(true),
        showOnListing: boolean("showOnListing").notNull().default(true),
        isPresentOnMago: boolean("isPresentOnMago").notNull().default(true),

        // Audit System Fields
        propertyManagementType: propertyManagementTypeEnum("propertyManagementType"),
        auditEnabled: boolean("auditEnabled").notNull().default(false),
        maxAuditGapDays: integer("maxAuditGapDays"),
        auditComplianceStatus: auditComplianceStatusEnum("auditComplianceStatus"),

        bookingPolicy: text("bookingPolicy").notNull().default(""),

        weight: decimal("weight", { precision: 5, scale: 2 })
            .notNull()
            .default("0"),
        jarvisSyncPropertyId: text("jarvisSyncPropertyId"),

        faqs: jsonb("faqs")
            .$type<
                {
                    question: string;
                    weight: number;
                    category: string;
                    answer: string;
                }[]
            >()
            .default(sql`'[]'::jsonb`),
        meta: jsonb("meta").default(sql`'{}'::jsonb`), // <-- Add meta jsonb column
        // Up to 5 cover photo objects (denormalized snapshot matching photos table)
        coverPhotos: jsonb("coverPhotos")
            .$type<
                {
                    id: string;
                    thumbnailUrl?: string;
                    gridUrl?: string;
                    blurHash: string;
                    altText?: string;
                }[]
            >()
            .default(sql`'[]'::jsonb`),
        homeRulesTruths: jsonb("homeRulesTruths"),
        sections: jsonb("sections").$type<
            {
                title: string;
                sectionType: string;
                content: string;
            }[]
        >(),

        rateTypeId: text("rateTypeId"),
        roomTypeId: text("roomTypeId"),
        ratePlanId: text("ratePlanId"),

        requiresConfirmation: boolean("requiresConfirmation").notNull().default(false),

        advancePaymentEnabled: boolean("advancePaymentEnabled").notNull().default(false),
        advancePaymentAmount: integer("advancePaymentAmount"),
        advancePaymentPercentage: decimal("advancePaymentPercentage", {
            precision: 5,
            scale: 2
        }),

        enableFloatingGuests: boolean("enableFloatingGuests").notNull().default(false),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check("bedroom_count_positive", sql`"bedroomCount" >= 0`),
        check("bathroom_count_positive", sql`"bathroomCount" >= 0`),
        check("base_guest_count_positive", sql`"baseGuestCount" >= 0`),
        check("max_guest_count_positive", sql`"maxGuestCount" >= 0`),
        check(
            "max_guest_greater_than_base",
            sql`"maxGuestCount" >= "baseGuestCount"`
        ),
        check(
            "gst_percentage_valid",
            sql`"defaultGstPercentage" >= 0 AND "defaultGstPercentage" <= 100`
        ),
        index("properties_property_code_idx").on(table.propertyCode),
        index("properties_slug_idx").on(table.slug),
        index("properties_area_id_idx").on(table.areaId),
        index("properties_secondary_area_id_1_idx").on(table.secondaryAreaId1),
        index("properties_secondary_area_id_2_idx").on(table.secondaryAreaId2),
        index("properties_secondary_area_id_3_idx").on(table.secondaryAreaId3),
        index("properties_secondary_area_id_4_idx").on(table.secondaryAreaId4),
        index("properties_city_id_idx").on(table.cityId),
        index("properties_state_id_idx").on(table.stateId),
        index("properties_showOnInstafarms_idx").on(table.showOnInstafarms),
        check(
            "property_advance_amount_or_percentage",
            sql`("advancePaymentAmount" IS NOT NULL AND "advancePaymentPercentage" IS NULL) OR 
          ("advancePaymentAmount" IS NULL AND "advancePaymentPercentage" IS NOT NULL) OR 
          ("advancePaymentAmount" IS NULL AND "advancePaymentPercentage" IS NULL)`
        ),
        check(
            "property_advance_percentage_valid",
            sql`"advancePaymentPercentage" IS NULL OR 
          ("advancePaymentPercentage" > 0 AND "advancePaymentPercentage" <= 100)`
        ),
        check(
            "properties_cover_photos_max_5",
            sql`"coverPhotos" IS NULL OR jsonb_array_length("coverPhotos") <= 5`
        ),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

// iCal Integration Tables
export const icalLinks = pgTable("icalLinks", {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
        // .notNull()
        .references(() => properties.id, {
            onDelete: "cascade",
        }),
    // NEW: Entity-level iCal sync support
    entityId: uuid("entityId").references(() => entities.id, {
        onDelete: "cascade",
    }),
    name: text("name").notNull(),
    icalUrl: text("icalUrl").notNull(), // The external iCal feed URL
    lastSyncedAt: timestamp("lastSyncedAt", {
        withTimezone: true,
        mode: "string",
    }),
    syncStatus: text("syncStatus").notNull().default("pending"), // pending, syncing, success, error
    syncError: text("syncError"),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminOrUserUpdateReference,
}, (table) => [
    index("ical_links_property_id_idx").on(table.propertyId),
    index("ical_links_sync_status_idx").on(table.syncStatus),
    setUserOrAdminUpdatedByConstraint(table),
]);

export const importedBookings = pgTable("importedBookings", {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId")
        // .notNull()
        .references(() => properties.id, {
            onDelete: "cascade",
        }),
    entityId: uuid('entity_id').references(() => entities.id),
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
}, (table) => [
    unique("unique_external_booking").on(table.icalLinkId, table.externalBookingId),
    index("imported_bookings_property_id_idx").on(table.propertyId),
    index("imported_bookings_ical_link_id_idx").on(table.icalLinkId),
    index("imported_bookings_checkin_date_idx").on(table.checkinDate),
]);

export const states = pgTable("states", {
    id: uuid("id").primaryKey().defaultRandom(),
    state: text("state").unique().notNull(),
    slug: text("slug").unique(),
    heading: text("heading"),
    description: text("description"),
    icon: text("icon"),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull().default("0"),
    featured: boolean("featured").notNull().default(false),
    isActive: boolean("isActive").notNull().default(true),
    faqs: jsonb("faqs")
        .$type<
            {
                question: string;
                answer: string;
                isActive: boolean;
                weight: number;
            }[]
        >()
        .default(sql`'[]'::jsonb`),
    info: jsonb("info")
        .$type<{
            title: string;
            description?: string;
            howToReach?: {
                title: string;
                description: string;
                nearByPlaces: string[];
            };
            mapSearchKey?: string;
            nearByAttractions?: string[];
        }>()
        .default(sql`'{}'::jsonb`),
    meta: jsonb("meta")
        .default(sql`'{}'::jsonb`)
        .$type<{
            metaTitle?: string;
            metaDescription?: string;
            metaUrl?: string;
            metaImage?: string;
        }>(),
    ...timestamps,
    ...adminUpdateReference,
});

export const specialDates = pgTable(
    "specialDates",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        propertyId: uuid("propertyId")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        date: date({ mode: "string" }).notNull(),
        price: integer("price"),
        priceWithGST: integer("priceWithGST"),
        adultExtraGuestCharge: integer("adultExtraGuestCharge"),
        adultExtraGuestChargeWithGST: integer("adultExtraGuestChargeWithGST"),
        childExtraGuestCharge: integer("childExtraGuestCharge"),
        childExtraGuestChargeWithGST: integer("childExtraGuestChargeWithGST"),
        infantExtraGuestCharge: integer("infantExtraGuestCharge"),
        infantExtraGuestChargeWithGST: integer("infantExtraGuestChargeWithGST"),
        baseGuestCount: integer("baseGuestCount"),
        discount: integer("discount"),
        maxExtraGuestPrice: integer("maxExtraGuestPrice"),
        maxTotal: integer("maxTotal"),
        gstSlab: integer("gstSlab"),

        // fields added
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check("special_date_price_positive", sql`"price" >= 0`),
        check("special_date_base_guest_positive", sql`"baseGuestCount" >= 0`),
        check(
            "special_date_discount_valid",
            sql`"discount" >= 0 AND "discount" <= 100`
        ),
        unique("property_date_unique").on(table.propertyId, table.date),
        index("special_dates_property_id_idx").on(table.propertyId),
        index("special_dates_date_idx").on(table.date),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const cities = pgTable("cities", {
    id: uuid("id").primaryKey().defaultRandom(),
    city: text("city").notNull(),
    slug: text("slug").unique(),
    heading: text("heading"),
    description: text("description"),

    weight: decimal("weight", { precision: 5, scale: 2 }).notNull().default("0"),
    featured: boolean("featured").notNull().default(false),

    stateId: uuid("stateId")
        .notNull()
        .references(() => states.id, {
            onDelete: "restrict",
        }),

    isActive: boolean("isActive").notNull().default(true),
    icon: text("icon"),
    faqs: jsonb("faqs")
        .$type<
            {
                question: string;
                answer: string;
                isActive: boolean;
                weight: number;
            }[]
        >()
        .default(sql`'[]'::jsonb`),
    info: jsonb("info")
        .$type<{
            title: string;
            description?: string;
            howToReach?: {
                title: string;
                description: string;
                nearByPlaces: string[];
            };
            mapSearchKey?: string;
            nearByAttractions?: string[];
        }>()
        .default(sql`'{}'::jsonb`),
    meta: jsonb("meta")
        .default(sql`'{}'::jsonb`)
        .$type<{
            metaTitle?: string;
            metaDescription?: string;
            metaUrl?: string;
            metaImage?: string;
        }>(),

    ...timestamps,
    ...adminUpdateReference,
});

export const areas = pgTable("areas", {
    id: uuid("id").primaryKey().defaultRandom(),
    area: text("area").notNull(),
    slug: text("slug").unique(),
    heading: text("heading"),
    description: text("description"),
    icon: text("icon"),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull().default("0"),
    featured: boolean("featured").notNull().default(false),
    isActive: boolean("isActive").notNull().default(true),
    cityId: uuid("cityId").references(() => cities.id, {
        onDelete: "restrict",
    }),
    areaInfo: jsonb("areaInfo")
        .$type<{
            title: string;
            description?: string;
            howToReach?: {
                title: string;
                description: string;
                nearByPlaces: string[];
            };
            mapSearchKey?: string;
            nearByAttractions?: string[];
        }>()
        .default(sql`'{}'::jsonb`),
    faqs: jsonb("faqs")
        .$type<
            {
                question: string;
                answer: string;
                isActive: boolean;
                weight: number;
            }[]
        >()
        .default(sql`'[]'::jsonb`),
    meta: jsonb("meta")
        .default(sql`'{}'::jsonb`)
        .$type<{
            metaTitle?: string;
            metaDescription?: string;
            metaUrl?: string;
            metaImage?: string;
        }>(),

    ...timestamps,
    ...adminUpdateReference,
});

export const landmarks = pgTable("landmarks", {
    id: uuid("id").primaryKey().defaultRandom(),
    landmark: text("landmark").notNull(),
    slug: text("slug").unique(),
    icon: text("icon"),
    primaryAreaId: uuid("primaryAreaId")
        .notNull()
        .references(() => areas.id, {
            onDelete: "restrict",
        }),
    ...timestamps,
    ...adminUpdateReference,
}, (table) => [
    index("landmarks_primary_area_id_idx").on(table.primaryAreaId),
    index("landmarks_slug_idx").on(table.slug),
]);

// NEARBY LOCATION CHANGES
export const nearbyLocations = pgTable("nearbyLocations", {
    id: uuid("id").primaryKey().defaultRandom(),
    areaId: uuid("areaId")
        .notNull()
        .references(() => areas.id, {
            onDelete: "restrict",
        }),
    nearbyAreaId1: uuid("nearbyAreaId1").references(() => areas.id, {
        onDelete: "restrict",
    }),
    nearbyAreaId2: uuid("nearbyAreaId2").references(() => areas.id, {
        onDelete: "restrict",
    }),
    nearbyAreaId3: uuid("nearbyAreaId3").references(() => areas.id, {
        onDelete: "restrict",
    }),
    nearbyAreaId4: uuid("nearbyAreaId4").references(() => areas.id, {
        onDelete: "restrict",
    }),
    ...timestamps,
    ...adminUpdateReference,
}, (table) => [
    index("nearby_locations_area_id_idx").on(table.areaId),
]);

export const admins = pgTable("admins", {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("firstName").notNull(),
    lastName: varchar("lastName"),
    email: varchar("email").unique().notNull(),
    phoneNumber: varchar("phoneNumber").unique().notNull(),

    gender: genderEnum("gender"),
    whatsappNumber: varchar("whatsappNumber"),
    alternateContact: varchar("alternateContact"),
    addressDetails: json("addressDetails").default({}),

    loginAt: timestamp("loginAt", { withTimezone: true, mode: "string" }),
    logoutAt: timestamp("logoutAt", { withTimezone: true, mode: "string" }),

    ...timestamps,
    ...adminUpdateReference,
});

export const customers = pgTable(
    "customers",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        firstName: varchar("firstName").notNull(),
        lastName: varchar("lastName"),
        email: text("email"),
        dob: date({ mode: "string" }),
        mobileNumber: varchar("mobileNumber", { length: 20 }).notNull(),
        gender: genderEnum("gender").notNull(),
        favorites: json("favorites").$type<any[]>().default([]),
        expoPushToken: text("expoPushToken"),

        ...timestamps,
    },
    (table) => [
        index("customers_mobile_number_idx").on(table.mobileNumber),
        index("customers_email_idx").on(table.email),
    ]
);

export const cancellations = pgTable(
    "cancellations",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        bookingId: uuid("bookingId")
            .notNull()
            .references(() => bookings.id, {
                onDelete: "cascade",
            }),
        refundAmount: real("refundAmount").notNull(),
        refundStatus: refundStatusEnum("refundStatus").notNull(),
        //? is this the shortterm/longterm thing?
        cancellationType: cancellationTypeEnum("cancellationType").notNull(),
        referencePersonId: uuid("referencePersonId")
            // .notNull()
            .references(() => users.id),
        razorpayRefundId: varchar("razorpayRefundId", { length: 255 }),
        refundError: text("refundError"),
        refundAttempts: integer("refundAttempts").default(0),
        cancelledBy: uuid("cancelledBy").references(() => users.id),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [setUserOrAdminUpdatedByConstraint(table)]
);

// ============================================================================
// WALLET SYSTEM - FIXED CIRCULAR REFERENCE
// ============================================================================

// 1. OWNERS WALLET - No changes
export const ownersWallet = pgTable("ownersWallet", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("ownerId")
        .notNull()
        .unique()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    currentBalance: decimal("currentBalance", { precision: 12, scale: 2 })
        .notNull()
        .default("0"),
    totalCredits: decimal("totalCredits", { precision: 12, scale: 2 })
        .notNull()
        .default("0"),
    totalDebits: decimal("totalDebits", { precision: 12, scale: 2 })
        .notNull()
        .default("0"),

    lastTransactionAt: timestamp("lastTransactionAt", {
        withTimezone: true,
        mode: "string",
    }),

    ...timestamps,
}, (table) => [
    check("current_balance_non_negative", sql`"currentBalance" >= 0`),
    index("owners_wallet_owner_id_idx").on(table.ownerId),
]);

// 2. WALLET TRANSACTIONS - Declare FIRST without withdrawal request reference
export const walletTransactions = pgTable("walletTransactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("ownerId")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    transactionType: walletTransactionTypeEnum("transactionType").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    balanceAfterTransaction: decimal("balanceAfterTransaction", { precision: 12, scale: 2 }).notNull(),
    status: text("status").notNull().default("completed"),

    // For booking credits - NO .references() to avoid circular dependency
    bookingId: uuid("bookingId"), // ← Just UUID, no reference

    // For admin actions (MANDATORY for admin_credit and admin_debit)
    remarks: text("remarks").notNull(),
    attachmentUrl: text("attachmentUrl"),
    attachmentFilename: text("attachmentFilename"),
    attachmentSize: integer("attachmentSize"),
    attachmentMimeType: text("attachmentMimeType"),
    adminId: uuid("adminId").references(() => admins.id, {
        onDelete: "set null",
    }),

    // For withdrawals - NO reference here, just store the ID
    withdrawalRequestId: uuid("withdrawalRequestId"), // ← Just UUID, no reference
    razorpayPayoutId: text("razorpayPayoutId"),
    razorpayPayoutStatus: text("razorpayPayoutStatus"),
    withdrawalInitiatedAt: timestamp("withdrawalInitiatedAt", {
        withTimezone: true,
        mode: "string",
    }),
    withdrawalCompletedAt: timestamp("withdrawalCompletedAt", {
        withTimezone: true,
        mode: "string",
    }),

    // For tracking daily settlement batches
    settlementBatchId: text("settlementBatchId"),
    settlementDate: date("settlementDate", { mode: "string" }),

    ...timestamps,
}, (table) => [
    check("amount_not_zero", sql`"amount" != 0`),
    index("wallet_transactions_owner_id_idx").on(table.ownerId),
    index("wallet_transactions_booking_id_idx").on(table.bookingId),
    index("wallet_transactions_created_at_idx").on(table.createdAt),
    index("wallet_transactions_transaction_type_idx").on(table.transactionType),
    index("wallet_transactions_settlement_batch_idx").on(table.settlementBatchId),
    index("wallet_transactions_settlement_date_idx").on(table.settlementDate),
    index("wallet_transactions_withdrawal_request_idx").on(table.withdrawalRequestId),
]);

// 3. WALLET WITHDRAWAL REQUESTS - Declare AFTER walletTransactions
export const walletWithdrawalRequests = pgTable("walletWithdrawalRequests", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("ownerId")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    // NOW we can reference walletTransactions since it's declared above
    transactionId: uuid("transactionId")
        .references(() => walletTransactions.id, {
            onDelete: "set null",
        }),

    requestedAmount: decimal("requestedAmount", { precision: 12, scale: 2 }).notNull(),
    bankAccountId: uuid("bankAccountId")
        .notNull()
        .references(() => bankDetails.id, {
            onDelete: "restrict",
        }),
    status: withdrawalStatusEnum("status").notNull().default("pending"),

    razorpayPayoutId: text("razorpayPayoutId"),
    failureReason: text("failureReason"),

    requestedAt: timestamp("requestedAt", {
        withTimezone: true,
        mode: "string",
    }).notNull().defaultNow(),
    processedAt: timestamp("processedAt", {
        withTimezone: true,
        mode: "string",
    }),
    processedBy: uuid("processedBy").references(() => admins.id, {
        onDelete: "set null",
    }),

    retryCount: integer("retryCount").notNull().default(0),
    lastRetryAt: timestamp("lastRetryAt", {
        withTimezone: true,
        mode: "string",
    }),
    razorpayBalanceError: boolean("razorpayBalanceError").notNull().default(false), // Track if it's a balance issue specifically

    ...timestamps,
}, (table) => [
    check("requested_amount_positive", sql`"requestedAmount" > 0`),
    index("wallet_withdrawal_owner_id_idx").on(table.ownerId),
    index("wallet_withdrawal_status_idx").on(table.status),
    index("wallet_withdrawal_transaction_id_idx").on(table.transactionId),
]);

export const bookings = pgTable(
    "bookings",
    {
        // Primary key - unique identifier for the booking
        id: uuid("id").primaryKey().defaultRandom(),

        // // --> References 
        // Reference to the property being booked (nullable for entity-level bookings)
        propertyId: uuid("propertyId")
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        // Reference to the entity being booked (for entity-level bookings, nullable for property bookings)
        entityId: uuid("entityId").references(() => entities.id, {
            onDelete: "cascade",
        }),
        // Reference to the customer who made the booking (optional for admin-created bookings)
        customerId: uuid("customerId")
            .references(() => customers.id, {
                onDelete: "cascade",
            }),

        // // --> Booking details
        // Type of booking - "Online" or "Offline"
        bookingType: bookingTypeEnum("bookingType").notNull(),
        // Source of the booking (e.g., "Website", "Phone", "Walk-in", etc.)
        bookingSource: text("bookingSource"),
        // Number of adult guests in the booking
        adultCount: integer("adultCount").notNull(),
        // Number of child guests in the booking
        childrenCount: integer("childrenCount").notNull(),
        // Number of infant guests in the booking
        infantCount: integer("infantCount").notNull(),
        // Check-in date for the booking (format: YYYY-MM-DD)
        checkinDate: date({ mode: "string" }).notNull(),
        // Check-out date for the booking (format: YYYY-MM-DD)
        checkoutDate: date({ mode: "string" }).notNull(),
        // Duration of stay in number of nights (calculated from checkinDate to checkoutDate)
        durationNights: integer("durationNights"),
        // Internal remarks or notes about the booking
        bookingRemarks: text("bookingRemarks"),
        // Special requests or requirements from the customer
        specialRequests: text("specialRequests"),
        // URL to the order PDF file stored in cloud storage (e.g., Google Cloud Storage)
        pdfBookingLink: text("orderPdfFile"),

        // // --> Floating guest counts (day visitors - for entities with enableFloatingGuests)
        // Number of floating adult guests (day visitors, not staying overnight)
        floatingAdultCount: integer("floatingAdultCount").notNull().default(0),
        // Number of floating child guests (day visitors, not staying overnight)
        floatingChildCount: integer("floatingChildCount").notNull().default(0),
        // Number of floating infant guests (day visitors, not staying overnight)
        floatingInfantCount: integer("floatingInfantCount").notNull().default(0),

        // // --> Booking Status
        // Payment lifecycle status for the booking
        paymentStatus: text("paymentStatus")
            .notNull()
            .default("PENDING"),
        // Deprecated compatibility flag. New flow should rely on paymentStatus.
        isPaid: boolean("isPaid").notNull().default(false),
        // Booking lifecycle status
        status: text("status")
            .notNull()
            .default("PAYMENT_PENDING"),

        // // --> commercial data
        // Base rental amount with GST included (before extra guest charges)
        baseRentalAmountWithGst: real("baseRentalAmountWithGst").default(0),
        // Extra adult guest charge including GST
        extraAdultGuestChargeWithGst: real("extraAdultGuestChargeWithGst").default(0),
        // Extra child guest charge including GST
        extraChildGuestChargeWithGst: real("extraChildGuestChargeWithGst").default(0),
        // Total charge for floating guests (day visitors)
        floatingGuestCharge: real("floatingGuestCharge").notNull().default(0),
        // Booking amount with GST applied, before any discounts are applied
        bookingAmountWithGstBeforeDiscounts: real("bookingAmountWithGstBeforeDiscounts").default(0),
        // Total discount amount (sum of all discounts)
        totalDiscountAmount: real("totalDiscountAmount").notNull().default(0), // sum of all discounts in amount
        totalDiscountPercentage: real("totalDiscountPercentage").default(0), // sum of all discounts in percentage

        // // --> Payment Details
        // Flag to indicate if this booking used advance payment option (partial payment)
        isAdvancePayment: boolean("isAdvancePayment").notNull().default(false),
        // Amount that has been paid by customer (with GST)
        bookingAmountPaidWithGst: real("bookingAmountPaidWithGst").default(0),
        // Full booking amount including all charges and GST
        fullBookingAmountWithGst: real("fullBookingAmountWithGst").default(0),
        // Remaining amount that customer needs to pay (with GST)
        remainingAmountToBePaidWithGst: real("remainingAmountToBePaidWithGst").default(0),
        // Payment gateway processing charges
        paymentGatewayCharge: real("paymentGatewayCharge").notNull().default(0),
        // Array of day-wise booking breakdowns containing per-day pricing, discounts, GST details
        daywiseBreakup: jsonb("daywiseBreakup"),

        // // --> All Discounts
        // Owner Discount
        ownerDiscountValue: real("ownerDiscountValue").default(0),
        ownerDiscountPercentage: real("ownerDiscountPercentage").default(0),
        // Multiple nights Discount
        multipleNightsDiscountValue: real("multipleNightsDiscountValue").default(0),
        multipleNightsDiscountPercentage: real("multipleNightsDiscountPercentage").default(0),
        // Discount amount from coupon/promo code (nullable if no coupon used)
        couponDiscountValue: real("couponDiscountValue").default(0),
        couponDiscountType: text("couponDiscountType"),
        couponDiscountCode: text("couponDiscountCode"),
        couponId: uuid("couponId").references(() => coupons.id, {
            onDelete: "cascade",
        }),

        // // --> Amount Distribution
        // Commission amount charged by Instafarms platform
        instafarmsCommission: real("instafarmsCommission").default(0),
        // Owner's revenue before TDS deduction
        ownerRevenue: real("ownerRevenue").default(0),
        // TDS (Tax Deducted at Source) amount deducted from owner revenue
        tds: real("tds").default(0),
        // Total GST amount collected on the booking
        totalGstCollected: real("totalGstCollected").default(0),
        // Final amount payable to owner after TDS (Tax Deducted at Source) deduction
        amountPayableToOwnerAfterTDS: real("amountPayableToOwnerAfterTDS").default(0),
        // Booking amount after applying discounts but before GST calculation
        bookingAmountWithDiscountBeforeGst: real("bookingAmountWithDiscountBeforeGst").default(0),

        // // Wallet Settlement Details
        ownerSettlementStatus: settlementStatusEnum("ownerSettlementStatus")
            .notNull()
            .default("unsettled"),
        ownerSettledAt: timestamp("ownerSettledAt", {
            withTimezone: true,
            mode: "string",
        }),

        // NEW: Settlement blocking fields
        settlementBlocked: boolean("settlementBlocked").notNull().default(false),
        settlementBlockedBy: uuid("settlementBlockedBy").references(() => admins.id),
        settlementBlockedAt: timestamp("settlementBlockedAt", {
            withTimezone: true,
            mode: "string",
        }),
        settlementBlockReason: text("settlementBlockReason"),
        settlementBlockAttachmentUrl: text("settlementBlockAttachmentUrl"),
        settlementBlockAttachmentFilename: text("settlementBlockAttachmentFilename"),
        settlementBlockAttachmentSize: integer("settlementBlockAttachmentSize"),
        settlementBlockAttachmentMimeType: text("settlementBlockAttachmentMimeType"),

        // Settlement failure (when cron or manual settle fails)
        settlementFailureReason: text("settlementFailureReason"),

        // Settlement processing (idempotency + timeout recovery)
        settlementProcessingStartedAt: timestamp("settlementProcessingStartedAt", {
            withTimezone: true,
            mode: "string",
        }),

        // Settlement breakdown (for transparency)
        baseAmountExclGst: decimal("baseAmountExclGst", { precision: 12, scale: 2 }),
        platformCommissionAmount: decimal("platformCommissionAmount", { precision: 12, scale: 2 }),
        ownerShareBeforeTds: decimal("ownerShareBeforeTds", { precision: 12, scale: 2 }),
        ownerTdsDeducted: decimal("ownerTdsDeducted", { precision: 12, scale: 2 }),
        ownerSettlementAmount: decimal("ownerSettlementAmount", { precision: 12, scale: 2 }),

        // Link to wallet transaction (removed circular reference from walletTransactions)
        ownerWalletTransactionId: uuid("ownerWalletTransactionId")
            .references(() => walletTransactions.id, {
                onDelete: "set null",
            }),

        /** Set when checkout-day post-stay review SMS was sent (cron idempotency). */
        postStayReviewNotifiedAt: timestamp("postStayReviewNotifiedAt", {
            withTimezone: true,
            mode: "string",
        }),

        ...timestamps,
        // Admin/User reference fields (from adminOrUserUpdateReference spread)
        // createdBy: UUID of the user who created the booking (nullable)
        // updatedBy: UUID of the user who last updated the booking (nullable, auto-set to null on update)
        // adminCreatedBy: UUID of the admin user who created the booking (nullable)
        // adminUpdatedBy: UUID of the admin user who last updated the booking (nullable, auto-set to null on update)
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check("adult_count_non_negative", sql`"adultCount" >= 0`),
        check("children_count_positive", sql`"childrenCount" >= 0`),
        check("infant_count_positive", sql`"infantCount" >= 0`),
        check("floating_adult_count_positive", sql`"floatingAdultCount" >= 0`),
        check("floating_child_count_positive", sql`"floatingChildCount" >= 0`),
        check("floating_infant_count_positive", sql`"floatingInfantCount" >= 0`),
        check("checkout_after_checkin", sql`"checkoutDate" > "checkinDate"`),
        check("floating_guest_charge_positive", sql`"floatingGuestCharge" >= 0`),
        check("base_rental_amount_positive", sql`"baseRentalAmountWithGst" >= 0`),
        check("total_discount_amount_positive", sql`"totalDiscountAmount" >= 0`),
        check("total_discount_percentage_valid", sql`"totalDiscountPercentage" >= 0 AND "totalDiscountPercentage" <= 100`),
        check(
            "settlement_details_complete",
            sql`(
        "ownerSettlementStatus"::text = 'settled' AND 
        "ownerSettledAt" IS NOT NULL AND 
        "baseAmountExclGst" IS NOT NULL AND
        "platformCommissionAmount" IS NOT NULL AND
        "ownerShareBeforeTds" IS NOT NULL AND
        "ownerTdsDeducted" IS NOT NULL AND
        "ownerSettlementAmount" IS NOT NULL
      ) OR (
        "ownerSettlementStatus"::text != 'settled'
      )`
        ),

        index("bookings_owner_settlement_status_idx").on(table.ownerSettlementStatus),
        index("bookings_owner_settled_at_idx").on(table.ownerSettledAt),
        index("bookings_owner_wallet_transaction_id_idx").on(table.ownerWalletTransactionId),
        index("bookings_property_id_idx").on(table.propertyId),
        index("bookings_customer_id_idx").on(table.customerId),
        index("bookings_checkin_date_idx").on(table.checkinDate),
        index("bookings_checkout_post_stay_review_idx").on(table.checkoutDate, table.postStayReviewNotifiedAt),
        index("bookings_status_idx").on(table.status),
        index("bookings_payment_status_idx").on(table.paymentStatus),
        //AdvancePaymentUpdatesChanges - Index for querying advance payment bookings
        index("bookings_is_advance_payment_idx").on(table.isAdvancePayment),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const payments = pgTable(
    "payments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        bookingId: uuid("bookingId")
            .notNull()
            .references(() => bookings.id, {
                onDelete: "cascade",
            }),
        transactionType: transactionTypeEnum("transactionType").notNull(),
        amount: real("amount").notNull(),
        paymentDate: timestamp("paymentDate", { mode: "string" }).notNull(),
        referencePersonId: uuid("referencePersonId").references(() => customers.id),
        paymentType: paymentTypeEnum("paymentType").notNull(),
        paymentMode: paymentModeEnum("paymentMode").notNull(),

        //AdvancePaymentUpdatesChanges - Track if this payment is advance or full
        // Boolean to differentiate advance payments from full payments
        // true = advance payment, false = full payment (default for backward compatibility)
        isAdvancePayment: boolean("isAdvancePayment").notNull().default(false),

        // Bank Details
        bankAccountNumber: text(),
        bankName: text(),
        bankAccountHolderName: text(),
        bankIfsc: text(),
        bankNickname: text(),

        // Razorpay payment tracking for idempotency
        razorpayPaymentId: text("razorpayPaymentId").unique(), // Razorpay payment ID for idempotency checks (unique constraint prevents duplicates)
        razorpayOrderId: text("razorpayOrderId"), // Razorpay order ID

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check("payment_amount_positive", sql`${table.amount} > 0`),
        index("payments_booking_id_idx").on(table.bookingId),
        index("payments_payment_date_idx").on(table.paymentDate),
        // Note: unique() on razorpayPaymentId above creates both unique constraint and index
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

// Booking Audit Log - tracks all booking lifecycle events for debugging and audit
export const bookingAuditLog = pgTable(
    "bookingAuditLog",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        bookingId: uuid("bookingId")
            .notNull()
            .references(() => bookings.id, {
                onDelete: "cascade",
            }),
        event: text("event").notNull(), // e.g., "booking_created", "payment_initiated", "payment_confirmed", "payment_failed", "booking_confirmed", "error"
        status: text("status").notNull(), // e.g., "success", "failed", "pending", "retrying"
        message: text("message"), // Human-readable message
        metadata: json("metadata"), // Additional context (request data, error details, etc.)
        errorDetails: json("errorDetails"), // Error stack trace, error object, etc.
        ipAddress: text("ipAddress"), // Client IP for security tracking
        ...timestamps,
    },
    (table) => [
        index("booking_audit_log_booking_id_idx").on(table.bookingId),
        index("booking_audit_log_event_idx").on(table.event),
        index("booking_audit_log_status_idx").on(table.status),
        index("booking_audit_log_created_at_idx").on(table.createdAt),
    ]
);

export const ezeeSyncData = pgTable("ezeeSyncData", {
    id: uuid().primaryKey().defaultRandom(),
    reqData: json(),
    resData: json(),
    bookingType: ezeeBookingTypeEnum("bookingType").notNull().default("CREATE"),
    reservation_no: integer("reservationNo"),
    conflict: boolean("conflict").notNull().default(false),
    reservatation_status: boolean("reservatation_status").notNull().default(false),
    comfirmbooking_resData: json(),
    comfirmbooking_status: boolean("comfirmbooking_status").notNull().default(false),
    updatedAt: timestamp({ mode: "string", withTimezone: true }),
    createdAt: timestamp({ mode: "string", withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const discountPlans = pgTable(
    "discountPlans",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").unique().notNull(),
        isActive: boolean("isActive").default(true).notNull(),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("discount_plans_name_idx").on(table.name),
        index("discount_plans_is_active_idx").on(table.isActive),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const discountPlansValues = pgTable(
    "discountPlansValues",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        discountPlanId: uuid("discountPlanId")
            .references(() => discountPlans.id, {
                onDelete: "cascade",
            })
            .notNull(),
        minDays: integer("minDays").notNull(),
        discountPercentage: decimal("discountPercentage", {
            precision: 5,
            scale: 2,
        }),
        flatDiscount: integer("flatDiscount"),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("discount_plans_values_discount_plan_id_idx").on(
            table.discountPlanId
        ),
        index("discount_plans_values_min_days_idx").on(table.minDays),
    ]
);

export const coupons = pgTable(
    "coupons",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        code: text("code").unique().notNull(),
        discountPercentage: decimal("discountPercentage", {
            precision: 5,
            scale: 2,
        }),
        flatDiscount: integer("flatDiscount"),

        maxDiscountAmount: integer("maxDiscountAmount").notNull(),
        minOrderValue: integer("minOrderValue").notNull().default(0),
        newUsersOnly: boolean("newUsersOnly").default(false),
        applicableDays: jsonb("applicableDays").$type<string[]>(),
        isActive: boolean("isActive").default(true),

        usedCount: integer("usedCount").default(0).notNull(),

        validFrom: timestamp("validFrom", { precision: 6 }).notNull(),
        validUntil: timestamp("validUntil", { precision: 6 }).notNull(),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check("discount_percentage_valid", sql`"discountPercentage" IS NULL OR ("discountPercentage" > 0 AND "discountPercentage" <= 100)`),
        check("max_discount_amount_positive", sql`"maxDiscountAmount" >= 0`),
        check("min_order_value_positive", sql`"minOrderValue" >= 0`),
        check(
            "flat_or_percentage",
            sql`("flatDiscount" IS NOT NULL AND "discountPercentage" IS NULL) OR ("flatDiscount" IS NULL AND "discountPercentage" IS NOT NULL)`
        ),
        check("valid_until_after_from", sql`"validUntil" > "validFrom"`),
        index("coupons_code_idx").on(table.code),
        index("coupons_is_active_idx").on(table.isActive),
        // setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const propertyCoupons = pgTable(
    "propertyCoupons",
    {
        propertyId: uuid("propertyId")
            .references(() => properties.id)
            .notNull(),
        couponId: uuid("couponId")
            .references(() => coupons.id)
            .notNull(),
        allowed: boolean("allowed").notNull().default(true),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.propertyId, table.couponId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const propertyDiscountPlans = pgTable(
    "propertyDiscountPlans",
    {
        propertyId: uuid("propertyId")
            .references(() => properties.id, {
                onDelete: "cascade",
            })
            .notNull(),
        discountPlanId: uuid("discountPlanId")
            .references(() => discountPlans.id, {
                onDelete: "restrict",
            })
            .notNull(),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.propertyId, table.discountPlanId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const cancellationPlans = pgTable("cancellationPlans", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    isActive: boolean("isActive").default(true),

    ...timestamps,
    ...adminUpdateReference,
});

export const cancellationPercentages = pgTable("cancellationPercentages", {
    id: uuid("id").primaryKey().defaultRandom(),
    cancellationPlanId: uuid("cancellationPlanId")
        .references(() => cancellationPlans.id)
        .notNull(),
    percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
    days: integer("days").notNull(),
    lessThan: boolean("lessThan").default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const cancellationPlanTypes = pgEnum("cancellationPlanType", [
    "longterm",
    "shortterm",
]);

export const propertyCancellationPlans = pgTable(
    "propertyCancellationPlans",
    {
        propertyId: uuid("propertyId")
            .references(() => properties.id, {
                onDelete: "cascade",
            })
            .notNull(),
        cancellationPlanId: uuid("cancellationPlanId")
            .references(() => cancellationPlans.id, {
                onDelete: "restrict",
            })
            .notNull(),
        type: cancellationPlanTypes("type"),
        policy: text("policy").default(""),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.propertyId, table.cancellationPlanId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const blockedDates = pgTable(
    "blockedDates",
    {
        id: uuid().primaryKey().notNull().defaultRandom(),
        propertyId: uuid()
            .notNull()
            .references(() => properties.id),
        blockedDate: date({ mode: "string" }).notNull(),
        // // Link to booking for auto-blocking/unblocking of related properties
        // bookingId: uuid()
        //   .references(() => bookings.id, {
        //     onDelete: "cascade",
        //   }),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        unique("property_date_blocked").on(table.propertyId, table.blockedDate),
        index("blocked_dates_property_id_idx").on(table.propertyId),
        index("blocked_dates_blocked_date_idx").on(table.blockedDate),
        // index("blocked_dates_booking_id_idx").on(table.bookingId),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const reviews = pgTable(
    "reviews",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        propertyId: uuid("propertyId")
            .references(() => properties.id, {
                onDelete: "cascade",
            })
            .notNull(),
        bookingId: uuid("bookingId")
            .references(() => bookings.id, {
                onDelete: "cascade",
            })
            .unique()
            .notNull(),
        customerId: uuid("customerId")
            .references(() => customers.id, {
                onDelete: "cascade",
            })
            .notNull(),

        staffServiceRating: integer("staffServiceRating"),
        ambienceRating: integer("ambienceRating"),
        roomMaintenanceRating: integer("roomMaintenanceRating"),
        outdoorMaintenanceRating: integer("outdoorMaintenanceRating"),
        lawnMaintenanceRating: integer("lawnMaintenanceRating"),
        poolMaintenanceRating: integer("poolMaintenanceRating"),
        extraMattressesLinenRating: integer("extraMattressesLinenRating"),
        overallRating: integer("overallRating").notNull(),

        comment: text("comment"),
        isVerified: boolean("isVerified").default(false).notNull(),
        stayDuration: integer("stayDuration"),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check("staff_service_rating_valid", sql`"staffServiceRating" IS NULL OR ("staffServiceRating" >= 1 AND "staffServiceRating" <= 5)`),
        check("ambience_rating_valid", sql`"ambienceRating" IS NULL OR ("ambienceRating" >= 1 AND "ambienceRating" <= 5)`),
        check("room_maintenance_rating_valid", sql`"roomMaintenanceRating" IS NULL OR ("roomMaintenanceRating" >= 1 AND "roomMaintenanceRating" <= 5)`),
        check("outdoor_maintenance_rating_valid", sql`"outdoorMaintenanceRating" IS NULL OR ("outdoorMaintenanceRating" >= 1 AND "outdoorMaintenanceRating" <= 5)`),
        check("lawn_maintenance_rating_valid", sql`"lawnMaintenanceRating" IS NULL OR ("lawnMaintenanceRating" >= 1 AND "lawnMaintenanceRating" <= 5)`),
        check("pool_maintenance_rating_valid", sql`"poolMaintenanceRating" IS NULL OR ("poolMaintenanceRating" >= 1 AND "poolMaintenanceRating" <= 5)`),
        check("extra_mattresses_linen_rating_valid", sql`"extraMattressesLinenRating" IS NULL OR ("extraMattressesLinenRating" >= 1 AND "extraMattressesLinenRating" <= 5)`),
        check("overall_rating_valid", sql`"overallRating" >= 1 AND "overallRating" <= 5`),
        check("stay_duration_positive", sql`"stayDuration" > 0`),

        index("reviews_property_id_idx").on(table.propertyId),
        index("reviews_customer_id_idx").on(table.customerId),
        index("reviews_overall_rating_idx").on(table.overallRating),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const reviewMagicLinks = pgTable(
    "reviewMagicLinks",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        bookingId: uuid("bookingId")
            .references(() => bookings.id, {
                onDelete: "cascade",
            })
            .notNull()
            .unique(),
        customerId: uuid("customerId")
            .references(() => customers.id, {
                onDelete: "cascade",
            })
            .notNull(),
        shortCode: text("shortCode").notNull().unique(),
        tokenHash: text("tokenHash").notNull().unique(),
        expiresAt: timestamp("expiresAt", {
            mode: "string",
            withTimezone: true,
        }).notNull(),
        usedAt: timestamp("usedAt", {
            mode: "string",
            withTimezone: true,
        }),
        ...timestamps,
    },
    (table) => [
        index("review_magic_links_customer_id_idx").on(table.customerId),
        index("review_magic_links_short_code_idx").on(table.shortCode),
        index("review_magic_links_expires_at_idx").on(table.expiresAt),
        index("review_magic_links_used_at_idx").on(table.usedAt),
    ]
);

export const photos = pgTable(
    "photos",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name"),
        isFeatured: boolean("isFeatured").default(false),

        // Original Data
        originalUrl: text("originalUrl").notNull().default(""),

        // Website Data (Instafarms)
        watermarkedUrlByInstafarms: text("watermarkedUrlByInstafarms").default(""),
        instafarmsAltText: text("instafarmsAltText"),

        // Mago Data
        watermarkedUrlByMago: text("watermarkedUrlByMago").default(""),
        magoAltText: text("magoAltText"),

        // AgentPortal Data
        watermarkedUrlByAgentPortal: text("watermarkedUrlByAgentPortal").default(""),
        agentPortalAltText: text("agentPortalAltText"),

        // BlurHash Data
        blurHash: text("blurHash"),

        // Photo metadata (file details -> original file)
        fileSize: integer("fileSize"),// bytes
        mimeType: text("mimeType"), // image/jpeg, image/webp
        width: integer("width"),// pixels 
        height: integer("height"),// pixels
        aspectRatio: numeric("aspectRatio", { precision: 4, scale: 2 }),// width / height

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("property_photos_is_featured_idx").on(table.isFeatured),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const propertyPhotos = pgTable(
    "propertyPhotos",
    {
        propertyId: uuid("propertyId")
            .references(() => properties.id)
            .notNull(),
        photoId: uuid("photoId")
            .references(() => photos.id)
            .notNull(),
        category: photoCategoryEnum("category").default("OTHERS"),
        sortOrder: integer("sortOrder").notNull(),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.propertyId, table.photoId] }),
        // ⭐ best index for gallery fetch
        index("property_photos_property_category_sort_idx").on(
            table.propertyId,
            table.category,
            table.sortOrder
        ),
        // useful when reverse lookup needed
        index("property_photos_photo_id_idx").on(table.photoId),

        // ⭐ IMPORTANT UNIQUE CONSTRAINT
        unique("property_category_sort_unique").on(
            table.propertyId,
            table.category,
            table.sortOrder,
        ),
        check("property_photos_sort_order_positive", sql`"sortOrder" > 0`),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const entityPhotos = pgTable(
    "entityPhotos",
    {
        entityId: uuid("entityId")
            .references(() => entities.id, {
                onDelete: "cascade",
            })
            .notNull(),
        photoId: uuid("photoId")
            .references(() => photos.id, {
                onDelete: "cascade",
            })
            .notNull(),
        category: photoCategoryEnum("category").default("OTHERS"),
        sortOrder: integer("sortOrder").notNull(),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.entityId, table.photoId] }),

        // ⭐ best for fetching entity gallery
        index("entity_photos_entity_category_sort_idx").on(
            table.entityId,
            table.category,
            table.sortOrder
        ),

        // reverse lookup
        index("entity_photos_photo_id_idx").on(table.photoId),

        unique("entity_category_sort_unique").on(
            table.entityId,
            table.category,
            table.sortOrder
        ),

        check("entity_photos_sort_order_positive", sql`"sortOrder" > 0`),

        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const staticImageSectionEnum = pgEnum("staticImageSection", [
    "why_instafarms_carousel",
    "homepage_hero",
    "about_us_banner",
    "testimonials_background",
    "partner_logos",
    "footer_social",
]);

export const staticImages = pgTable(
    "staticImages",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        section: staticImageSectionEnum("section").notNull(),
        title: text("title").notNull(),
        description: text("description"),

        // Desktop image
        desktopImageUrl: text("desktopImageUrl").notNull(),
        desktopImagePath: text("desktopImagePath").notNull(),

        // Mobile image
        mobileImageUrl: text("mobileImageUrl").notNull(),
        mobileImagePath: text("mobileImagePath").notNull(),

        altText: text("altText"),
        linkUrl: text("linkUrl"), // Optional link if image is clickable
        sortOrder: integer("sortOrder").default(0),
        isActive: boolean("isActive").default(true),

        ...timestamps,
        ...adminUpdateReference,
    },
    (table) => [
        index("static_images_section_idx").on(table.section),
        index("static_images_sort_order_idx").on(table.sortOrder),
        index("static_images_is_active_idx").on(table.isActive),
    ]
);

// export const propertyInfoSections = pgTable(
//   "propertyInfoSections",
//   {
//     id: uuid("id").primaryKey().defaultRandom(),
//     propertyId: uuid("propertyId")
//       .references(() => properties.id)
//       .notNull(),
//     sectionType: text("sectionType").notNull(),
//     title: text("title").notNull(),
//     content: text("content").notNull(),
//     isPublished: boolean("isPublished").default(true),

//     ...timestamps,
//     ...adminOrUserUpdateReference,
//   },
//   (table) => [setUserOrAdminUpdatedByConstraint(table)]
// );

// Discuss: why many-many relational faq? Store as json in property table?
export const faqs = pgTable(
    "faqs",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        question: text("question").notNull(),
        answer: text("answer").notNull(),
        category: text("category"),
        weight: integer("weight").default(0),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [setUserOrAdminUpdatedByConstraint(table)]
);

// Discuss:
export const propertyFaqs = pgTable(
    "propertyFaqs",
    {
        propertyId: uuid("propertyId")
            .references(() => properties.id)
            .notNull(),
        faqId: uuid("faqId")
            .references(() => faqs.id)
            .notNull(),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.propertyId, table.faqId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

// Discuss: store as json in property table?
export const propertyHouseRules = pgTable(
    "propertyHouseRules",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        propertyId: uuid("propertyId")
            .references(() => properties.id)
            .notNull(),
        ruleType: text("ruleType").notNull(),
        ruleText: text("ruleText").notNull(),
        icon: text("icon"),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [setUserOrAdminUpdatedByConstraint(table)]
);

export const tags = pgTable("tags", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    color: text("color"),

    ...timestamps,
    ...adminUpdateReference,
});

export const propertyTags = pgTable(
    "property_tags",
    {
        propertyId: uuid("property_id")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),
        tagId: uuid("tag_id")
            .notNull()
            .references(() => tags.id, { onDelete: "cascade" }),
        ...timestamps,
        ...adminUpdateReference,
    },
    (table) => [primaryKey({ columns: [table.propertyId, table.tagId] })]
);

export const cms = pgTable("cms", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").unique().notNull(),
    heading: text("heading").notNull(),
    subHeading: text("subHeading"),
    content: text("content").notNull(),
    slug: text("slug").unique().notNull(),

    photo: uuid("photo").references(() => photos.id),

    isActive: boolean("isActive").default(true),

    meta: jsonb("meta")
        .default(sql`'{}'::jsonb`)
        .$type<{
            metaTitle: string;
            metaDescription: string;
            metaUrl: string;
            metaImage: string;
        }>(),
    ...timestamps,
    ...adminUpdateReference,
});

export const carousel = pgTable("carousel", {
    id: uuid("id").primaryKey().defaultRandom(),

    heading: text("heading").notNull(),
    subHeading: text("subHeading"),
    weight: integer("weight").default(0),

    property: uuid("propertyId").references(() => properties.id),
    ...timestamps,
    ...adminUpdateReference,
});

export const singlePages = pgTable("singlePages ", {
    id: uuid("id").primaryKey().defaultRandom(),
    oldId: text("oldId").unique(),
    oldFaqId: text("oldFaqId").unique(),
    title: text("title").notNull(),
    slug: text("slug").unique().notNull(),
    meta: jsonb("meta")
        .default(sql`'{}'::jsonb`)
        .$type<{
            metaTitle?: string;
            metaDescription?: string;
            metaUrl?: string;
            metaImage?: string;
        }>(),
    isFaqsEnabled: boolean("isFaqsEnabled").default(false),
    faqs: jsonb("faqs")
        .$type<
            | {
                question: string;
                answer: string;
                isActive: boolean;
                weight: number;
            }[]
            | null
        >()
        .default(sql`'null'::jsonb`),
    ...timestamps,
    ...adminUpdateReference,
});

export const carouselPhotos = pgTable(
    "carouselPhotos",
    {
        carouselId: uuid("carouselId")
            .references(() => carousel.id, {
                onDelete: "cascade",
            })
            .notNull(),
        photoId: uuid("photoId")
            .references(() => photos.id, {
                onDelete: "cascade",
            })
            .notNull(),
        key: text("key").notNull(),
        ...timestamps,
        ...adminUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.carouselId, table.photoId] }),
        index("carousel_photos_carousel_id_idx").on(table.carouselId),
        index("carousel_photos_photo_id_idx").on(table.photoId),
    ]
);

export const collections = pgTable("collections", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    description: text("description"),
    heading: text("heading"),
    slug: text("slug").unique(),
    weight: integer("weight").default(0).notNull(),
    hpc: integer("hpc"),
    logo: text("logo"),
    altText: text("altText"),
    isActive: boolean("isActive").default(true).notNull(),

    meta: jsonb("meta")
        .default(sql`'{}'::jsonb`)
        .$type<{
            metaTitle?: string;
            metaDescription?: string;
            metaUrl?: string;
            metaImage?: string;
        }>(),
    faqs: jsonb("faqs")
        .$type<any[]>()
        .default(sql`'[]'::jsonb`)
        .$type<
            {
                question: string;
                answer: string;
                isActive: boolean;
                weight: number;
            }[]
        >(),
    info: jsonb("info").$type<
        {
            title: string;
            content: string;
            isPublished: boolean;
        }[]
    >(),

    ...timestamps,
    ...adminUpdateReference,
});

export const collectionProperties = pgTable(
    "collectionProperties",
    {
        collectionId: uuid("collectionId")
            .references(() => collections.id, {
                onDelete: "cascade",
            })
            .notNull(),
        propertyId: uuid("propertyId")
            .references(() => properties.id, {
                onDelete: "cascade",
            })
            .notNull(),
        ...timestamps,
        ...adminUpdateReference,
    },
    (table) => [primaryKey({ columns: [table.collectionId, table.propertyId] })]
);

export const enquiryTypeEnum = pgEnum("enquiryType", [
    "contact_request",
    "property_enquiry",
    "event_enquiry",
    "general_contact",
    "booking_enquiry",
    "support_request",
    "partnership_enquiry",
    "media_enquiry",
]);

export const enquiryStatusEnum = pgEnum("enquiryStatus", [
    "pending",
    "in_progress",
    "resolved",
    "closed",
    "spam",
]);

export const enquiryPriorityEnum = pgEnum("enquiryPriority", [
    "low",
    "medium",
    "high",
    "urgent",
]);

export const enquiries = pgTable(
    "enquiries",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        firstName: text("firstName").notNull(),
        lastName: text("lastName"),
        email: text("email").notNull(),
        phoneNumber: text("phoneNumber"),

        enquiryType: enquiryTypeEnum("enquiryType").notNull(),
        subject: text("subject").notNull(),
        message: text("message").notNull(),

        propertyId: uuid("propertyId").references(() => properties.id),

        eventDate: date("eventDate", { mode: "string" }),
        guestCount: integer("guestCount"),
        checkinDate: date("checkinDate", { mode: "string" }),
        checkoutDate: date("checkoutDate", { mode: "string" }),

        status: enquiryStatusEnum("status").default("pending").notNull(),

        responseMessage: text("responseMessage"),
        responseDate: timestamp("responseDate", {
            mode: "string",
            withTimezone: true,
        }),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check(
            "guest_count_positive",
            sql`"guestCount" IS NULL OR "guestCount" > 0`
        ),
        check(
            "checkout_after_checkin_enquiry",
            sql`"checkoutDate" IS NULL OR "checkinDate" IS NULL OR "checkoutDate" > "checkinDate"`
        ),
        check(
            "event_date_future",
            sql`"eventDate" IS NULL OR "eventDate" >= CURRENT_DATE`
        ),

        index("enquiries_email_idx").on(table.email),
        index("enquiries_phone_idx").on(table.phoneNumber),
        index("enquiries_type_idx").on(table.enquiryType),
        index("enquiries_status_idx").on(table.status),
        index("enquiries_property_id_idx").on(table.propertyId),
        index("enquiries_created_at_idx").on(table.createdAt),
        // setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const settings = pgTable("settings", {
    id: text("id").primaryKey(),
    value: json("value"),
    description: text("description"),
    instafarmWatermarkUrl: text("instafarmWatermarkUrl"),
    listingWatermarkUrl: text("listingWatermarkUrl"),
    ...timestamps,
    ...adminUpdateReference,
});

export const extraPlans = pgTable(
    "extraPlans",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").unique().notNull(),
        description: text("description"),
        price: integer("price").notNull(),
        category: text("category"),
        isActive: boolean("isActive").default(true),
        terms: text("terms"),

        ...timestamps,
        ...adminUpdateReference,
    },
    (table) => [
        check("extra_plan_price_positive", sql`"price" >= 0`),
        index("extra_plans_name_idx").on(table.name),
        index("extra_plans_is_active_idx").on(table.isActive),
    ]
);

export const ratePlans = pgTable(
    "ratePlans",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        description: text("description"),
        baseRate: integer("baseRate").notNull(),
        weekendRate: integer("weekendRate"),
        seasonalRate: integer("seasonalRate"),
        currency: text("currency").notNull().default("INR"),
        validFrom: text("validFrom"),
        validTo: text("validTo"),
        isActive: boolean("isActive").default(true).notNull(),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("rate_plans_name_idx").on(table.name),
        index("rate_plans_is_active_idx").on(table.isActive),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const spaces = pgTable("spaces", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),

    ...timestamps,
    ...adminUpdateReference,
});

export const spaceProperties = pgTable(
    "spaceProperties",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        propertyId: uuid("propertyId")
            .references(() => properties.id, {
                onDelete: "cascade",
            })
            .notNull(),
        photo: uuid("photoId").references(() => photos.id, {
            onDelete: "set null",
        }),
        name: text("name").unique().notNull(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("space_properties_property_id_idx").on(table.propertyId),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);



// ENTITIES & ROOMS SYSTEM
// Entities table is a replica of properties table with additional entity-specific fields
// This allows entities to have their own pricing, availability, and configuration
// that can be different from or inherited from linked properties

export const entities = pgTable(
    "entities",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Entity-specific fields (not in properties)
        entityName: text("entityName").notNull(),
        entityCode: text("entityCode").notNull().unique(),
        entityCodeName: text("entityCodeName"),
        entityType: entityTypeEnum("entityType").notNull(),

        propertyId: uuid("propertyId").references(() => properties.id, {
            onDelete: "cascade",
        }),

        // ALL FIELDS FROM PROPERTIES TABLE (replica)
        // Property Detail
        heading: text("heading"),
        description: text("description").default(""),

        allowCallBooking: boolean("allowCallBooking").notNull().default(false),
        allowEnquiry: boolean("allowEnquiry").notNull().default(false),
        allowOnlineBooking: boolean("allowOnlineBooking").notNull().default(true),

        commissionPercentage: integer("commissionPercentage").notNull().default(0),
        securityDeposit: integer("securityDeposit").notNull().default(0),
        cookingAccessFee: integer("cookingAccessFee").notNull().default(0),

        // Day wise price and charges
        mondayPrice: integer("mondayPrice"),
        mondayPriceWithGST: integer("mondayPriceWithGST"),
        mondayAdultExtraGuestCharge: integer("mondayAdultExtraGuestCharge"),
        mondayAdultExtraGuestChargeWithGST: integer("mondayAdultExtraGuestChargeWithGST"),
        mondayChildExtraGuestCharge: integer("mondayChildExtraGuestCharge"),
        mondayChildExtraGuestChargeWithGST: integer("mondayChildExtraGuestChargeWithGST"),
        mondayInfantExtraGuestCharge: integer("mondayInfantExtraGuestCharge"),
        mondayInfantExtraGuestChargeWithGST: integer("mondayInfantExtraGuestChargeWithGST"),
        mondayBaseGuestCount: integer("mondayBaseGuestCount"),
        mondayDiscount: integer("mondayDiscount"),
        mondayGSTslab: integer("mondayGSTSlab"),
        mondayMaxExtraGuestPrice: integer("mondayMaxExtraGuestPrice"),
        mondayMaxTotal: integer("mondayMaxTotal"),

        tuesdayPrice: integer("tuesdayPrice"),
        tuesdayPriceWithGST: integer("tuesdayPriceWithGST"),
        tuesdayAdultExtraGuestCharge: integer("tuesdayAdultExtraGuestCharge"),
        tuesdayAdultExtraGuestChargeWithGST: integer("tuesdayAdultExtraGuestChargeWithGST"),
        tuesdayChildExtraGuestCharge: integer("tuesdayChildExtraGuestCharge"),
        tuesdayChildExtraGuestChargeWithGST: integer("tuesdayChildExtraGuestChargeWithGST"),
        tuesdayInfantExtraGuestCharge: integer("tuesdayInfantExtraGuestCharge"),
        tuesdayInfantExtraGuestChargeWithGST: integer("tuesdayInfantExtraGuestChargeWithGST"),
        tuesdayBaseGuestCount: integer("tuesdayBaseGuestCount"),
        tuesdayDiscount: integer("tuesdayDiscount"),
        tuesdayGSTslab: integer("tuesdayGSTSlab"),
        tuesdayMaxExtraGuestPrice: integer("tuesdayMaxExtraGuestPrice"),
        tuesdayMaxTotal: integer("tuesdayMaxTotal"),

        wednesdayPrice: integer("wednesdayPrice"),
        wednesdayPriceWithGST: integer("wednesdayPriceWithGST"),
        wednesdayAdultExtraGuestCharge: integer("wednesdayAdultExtraGuestCharge"),
        wednesdayAdultExtraGuestChargeWithGST: integer("wednesdayAdultExtraGuestChargeWithGST"),
        wednesdayChildExtraGuestCharge: integer("wednesdayChildExtraGuestCharge"),
        wednesdayChildExtraGuestChargeWithGST: integer("wednesdayChildExtraGuestChargeWithGST"),
        wednesdayInfantExtraGuestCharge: integer("wednesdayInfantExtraGuestCharge"),
        wednesdayInfantExtraGuestChargeWithGST: integer("wednesdayInfantExtraGuestChargeWithGST"),
        wednesdayBaseGuestCount: integer("wednesdayBaseGuestCount"),
        wednesdayDiscount: integer("wednesdayDiscount"),
        wednesdayGSTslab: integer("wednesdayGSTSlab"),
        wednesdayMaxExtraGuestPrice: integer("wednesdayMaxExtraGuestPrice"),
        wednesdayMaxTotal: integer("wednesdayMaxTotal"),

        thursdayPrice: integer("thursdayPrice"),
        thursdayPriceWithGST: integer("thursdayPriceWithGST"),
        thursdayAdultExtraGuestCharge: integer("thursdayAdultExtraGuestCharge"),
        thursdayAdultExtraGuestChargeWithGST: integer("thursdayAdultExtraGuestChargeWithGST"),
        thursdayChildExtraGuestCharge: integer("thursdayChildExtraGuestCharge"),
        thursdayChildExtraGuestChargeWithGST: integer("thursdayChildExtraGuestChargeWithGST"),
        thursdayInfantExtraGuestCharge: integer("thursdayInfantExtraGuestCharge"),
        thursdayInfantExtraGuestChargeWithGST: integer("thursdayInfantExtraGuestChargeWithGST"),
        thursdayBaseGuestCount: integer("thursdayBaseGuestCount"),
        thursdayDiscount: integer("thursdayDiscount"),
        thursdayGSTslab: integer("thursdayGSTSlab"),
        thursdayMaxExtraGuestPrice: integer("thursdayMaxExtraGuestPrice"),
        thursdayMaxTotal: integer("thursdayMaxTotal"),

        fridayPrice: integer("fridayPrice"),
        fridayPriceWithGST: integer("fridayPriceWithGST"),
        fridayAdultExtraGuestCharge: integer("fridayAdultExtraGuestCharge"),
        fridayAdultExtraGuestChargeWithGST: integer("fridayAdultExtraGuestChargeWithGST"),
        fridayChildExtraGuestCharge: integer("fridayChildExtraGuestCharge"),
        fridayChildExtraGuestChargeWithGST: integer("fridayChildExtraGuestChargeWithGST"),
        fridayInfantExtraGuestCharge: integer("fridayInfantExtraGuestCharge"),
        fridayInfantExtraGuestChargeWithGST: integer("fridayInfantExtraGuestChargeWithGST"),
        fridayBaseGuestCount: integer("fridayBaseGuestCount"),
        fridayDiscount: integer("fridayDiscount"),
        fridayGSTslab: integer("fridayGSTSlab"),
        fridayMaxExtraGuestPrice: integer("fridayMaxExtraGuestPrice"),
        fridayMaxTotal: integer("fridayMaxTotal"),

        saturdayPrice: integer("saturdayPrice"),
        saturdayPriceWithGST: integer("saturdayPriceWithGST"),
        saturdayAdultExtraGuestCharge: integer("saturdayAdultExtraGuestCharge"),
        saturdayAdultExtraGuestChargeWithGST: integer("saturdayAdultExtraGuestChargeWithGST"),
        saturdayChildExtraGuestCharge: integer("saturdayChildExtraGuestCharge"),
        saturdayChildExtraGuestChargeWithGST: integer("saturdayChildExtraGuestChargeWithGST"),
        saturdayInfantExtraGuestCharge: integer("saturdayInfantExtraGuestCharge"),
        saturdayInfantExtraGuestChargeWithGST: integer("saturdayInfantExtraGuestChargeWithGST"),
        saturdayBaseGuestCount: integer("saturdayBaseGuestCount"),
        saturdayDiscount: integer("saturdayDiscount"),
        saturdayGSTslab: integer("saturdayGSTSlab"),
        saturdayMaxExtraGuestPrice: integer("saturdayMaxExtraGuestPrice"),
        saturdayMaxTotal: integer("saturdayMaxTotal"),

        sundayPrice: integer("sundayPrice"),
        sundayPriceWithGST: integer("sundayPriceWithGST"),
        sundayAdultExtraGuestCharge: integer("sundayAdultExtraGuestCharge"),
        sundayAdultExtraGuestChargeWithGST: integer("sundayAdultExtraGuestChargeWithGST"),
        sundayChildExtraGuestCharge: integer("sundayChildExtraGuestCharge"),
        sundayChildExtraGuestChargeWithGST: integer("sundayChildExtraGuestChargeWithGST"),
        sundayInfantExtraGuestCharge: integer("sundayInfantExtraGuestCharge"),
        sundayInfantExtraGuestChargeWithGST: integer("sundayInfantExtraGuestChargeWithGST"),
        sundayBaseGuestCount: integer("sundayBaseGuestCount"),
        sundayDiscount: integer("sundayDiscount"),
        sundayGSTslab: integer("sundayGSTSlab"),
        sundayMaxExtraGuestPrice: integer("sundayMaxExtraGuestPrice"),
        sundayMaxTotal: integer("sundayMaxTotal"),

        // Floating guest charges (day-wise)
        mondayFloatingAdultExtraGuestCharge: integer("mondayFloatingAdultExtraGuestCharge"),
        mondayFloatingChildExtraGuestCharge: integer("mondayFloatingChildExtraGuestCharge"),
        mondayFloatingInfantExtraGuestCharge: integer("mondayFloatingInfantExtraGuestCharge"),
        mondayFloatingAdultExtraGuestChargeWithGST: integer("mondayFloatingAdultExtraGuestChargeWithGST"),
        mondayFloatingChildExtraGuestChargeWithGST: integer("mondayFloatingChildExtraGuestChargeWithGST"),
        mondayFloatingInfantExtraGuestChargeWithGST: integer("mondayFloatingInfantExtraGuestChargeWithGST"),

        tuesdayFloatingAdultExtraGuestCharge: integer("tuesdayFloatingAdultExtraGuestCharge"),
        tuesdayFloatingChildExtraGuestCharge: integer("tuesdayFloatingChildExtraGuestCharge"),
        tuesdayFloatingInfantExtraGuestCharge: integer("tuesdayFloatingInfantExtraGuestCharge"),
        tuesdayFloatingAdultExtraGuestChargeWithGST: integer("tuesdayFloatingAdultExtraGuestChargeWithGST"),
        tuesdayFloatingChildExtraGuestChargeWithGST: integer("tuesdayFloatingChildExtraGuestChargeWithGST"),
        tuesdayFloatingInfantExtraGuestChargeWithGST: integer("tuesdayFloatingInfantExtraGuestChargeWithGST"),

        wednesdayFloatingAdultExtraGuestCharge: integer("wednesdayFloatingAdultExtraGuestCharge"),
        wednesdayFloatingChildExtraGuestCharge: integer("wednesdayFloatingChildExtraGuestCharge"),
        wednesdayFloatingInfantExtraGuestCharge: integer("wednesdayFloatingInfantExtraGuestCharge"),
        wednesdayFloatingAdultExtraGuestChargeWithGST: integer("wednesdayFloatingAdultExtraGuestChargeWithGST"),
        wednesdayFloatingChildExtraGuestChargeWithGST: integer("wednesdayFloatingChildExtraGuestChargeWithGST"),
        wednesdayFloatingInfantExtraGuestChargeWithGST: integer("wednesdayFloatingInfantExtraGuestChargeWithGST"),

        thursdayFloatingAdultExtraGuestCharge: integer("thursdayFloatingAdultExtraGuestCharge"),
        thursdayFloatingChildExtraGuestCharge: integer("thursdayFloatingChildExtraGuestCharge"),
        thursdayFloatingInfantExtraGuestCharge: integer("thursdayFloatingInfantExtraGuestCharge"),
        thursdayFloatingAdultExtraGuestChargeWithGST: integer("thursdayFloatingAdultExtraGuestChargeWithGST"),
        thursdayFloatingChildExtraGuestChargeWithGST: integer("thursdayFloatingChildExtraGuestChargeWithGST"),
        thursdayFloatingInfantExtraGuestChargeWithGST: integer("thursdayFloatingInfantExtraGuestChargeWithGST"),

        fridayFloatingAdultExtraGuestCharge: integer("fridayFloatingAdultExtraGuestCharge"),
        fridayFloatingChildExtraGuestCharge: integer("fridayFloatingChildExtraGuestCharge"),
        fridayFloatingInfantExtraGuestCharge: integer("fridayFloatingInfantExtraGuestCharge"),
        fridayFloatingAdultExtraGuestChargeWithGST: integer("fridayFloatingAdultExtraGuestChargeWithGST"),
        fridayFloatingChildExtraGuestChargeWithGST: integer("fridayFloatingChildExtraGuestChargeWithGST"),
        fridayFloatingInfantExtraGuestChargeWithGST: integer("fridayFloatingInfantExtraGuestChargeWithGST"),

        saturdayFloatingAdultExtraGuestCharge: integer("saturdayFloatingAdultExtraGuestCharge"),
        saturdayFloatingChildExtraGuestCharge: integer("saturdayFloatingChildExtraGuestCharge"),
        saturdayFloatingInfantExtraGuestCharge: integer("saturdayFloatingInfantExtraGuestCharge"),
        saturdayFloatingAdultExtraGuestChargeWithGST: integer("saturdayFloatingAdultExtraGuestChargeWithGST"),
        saturdayFloatingChildExtraGuestChargeWithGST: integer("saturdayFloatingChildExtraGuestChargeWithGST"),
        saturdayFloatingInfantExtraGuestChargeWithGST: integer("saturdayFloatingInfantExtraGuestChargeWithGST"),

        sundayFloatingAdultExtraGuestCharge: integer("sundayFloatingAdultExtraGuestCharge"),
        sundayFloatingChildExtraGuestCharge: integer("sundayFloatingChildExtraGuestCharge"),
        sundayFloatingInfantExtraGuestCharge: integer("sundayFloatingInfantExtraGuestCharge"),
        sundayFloatingAdultExtraGuestChargeWithGST: integer("sundayFloatingAdultExtraGuestChargeWithGST"),
        sundayFloatingChildExtraGuestChargeWithGST: integer("sundayFloatingChildExtraGuestChargeWithGST"),
        sundayFloatingInfantExtraGuestChargeWithGST: integer("sundayFloatingInfantExtraGuestChargeWithGST"),
        isDisabled: boolean("isDisabled"),

        bedroomCount: integer("bedroomCount"),
        bathroomCount: integer("bathroomCount"),
        doubleBedCount: integer("doubleBedCount"),
        singleBedCount: integer("singleBedCount"),
        mattressCount: integer("mattressCount"),
        baseGuestCount: integer("baseGuestCount"),
        maxGuestCount: integer("maxGuestCount"),

        bookingType: text("bookingType"),
        defaultGstPercentage: integer("defaultGstPercentage"),
        checkinTime: time("checkinTime"),
        checkoutTime: time("checkoutTime"),

        latitude: text("latitude"),
        longitude: text("longitude"),
        mapLink: text("mapLink"),

        address: text("address"),
        village: text("village"),
        areaId: uuid("areaId").references(() => areas.id, {
            onDelete: "restrict",
        }),
        secondaryAreaId1: uuid("secondaryAreaId1").references(() => areas.id, {
            onDelete: "restrict",
        }),
        secondaryAreaId2: uuid("secondaryAreaId2").references(() => areas.id, {
            onDelete: "restrict",
        }),
        secondaryAreaId3: uuid("secondaryAreaId3").references(() => areas.id, {
            onDelete: "restrict",
        }),
        secondaryAreaId4: uuid("secondaryAreaId4").references(() => areas.id, {
            onDelete: "restrict",
        }),
        cityId: uuid("cityId").references(() => cities.id, {
            onDelete: "restrict",
        }),
        stateId: uuid("stateId").references(() => states.id, {
            onDelete: "restrict",
        }),
        pincode: text("pincode"),
        propertyTypeId: uuid("propertyTypeId").references(() => propertyTypes.id),
        googlePlaceId: text("googlePlaceId"),
        googlePlaceRating: decimal("googlePlaceRating", { precision: 5, scale: 2 }),
        googlePlaceUserRatingCount: integer("googlePlaceUserRatingCount"),
        googlePlaceReviews: jsonb("googlePlaceReviews")
            .$type<
                {
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
                }[]
            >()
            .default(sql`'[]'::jsonb`),
        nearbyPlaces: jsonb("nearbyPlaces"),

        slug: text("slug").unique(),

        showOnInstafarms: boolean("showOnInstafarms").notNull().default(true),
        showOnListing: boolean("showOnListing").notNull().default(true),
        isPresentOnMago: boolean("isPresentOnMago").notNull().default(true),

        // Audit System Fields
        propertyManagementType: propertyManagementTypeEnum("propertyManagementType"),
        auditEnabled: boolean("auditEnabled").notNull().default(false),
        maxAuditGapDays: integer("maxAuditGapDays"),
        auditComplianceStatus: auditComplianceStatusEnum("auditComplianceStatus"),

        bookingPolicy: text("bookingPolicy").notNull().default(""),

        weight: decimal("weight", { precision: 5, scale: 2 })
            .notNull()
            .default("0"),
        jarvisSyncPropertyId: text("jarvisSyncPropertyId"),

        faqs: jsonb("faqs")
            .$type<
                {
                    question: string;
                    weight: number;
                    category: string;
                    answer: string;
                }[]
            >()
            .default(sql`'[]'::jsonb`),
        meta: jsonb("meta").default(sql`'{}'::jsonb`),
        // Up to 5 cover photo objects (denormalized snapshot matching photos table)
        coverPhotos: jsonb("coverPhotos")
            .$type<
                {
                    id: string;
                    thumbnailUrl?: string;
                    gridUrl?: string;
                    blurHash: string;
                    altText?: string;
                }[]
            >()
            .default(sql`'[]'::jsonb`),
        homeRulesTruths: jsonb("homeRulesTruths"),
        sections: jsonb("sections").$type<
            {
                title: string;
                sectionType: string;
                content: string;
            }[]
        >(),

        rateTypeId: text("rateTypeId"),
        roomTypeId: text("roomTypeId"),
        ratePlanId: text("ratePlanId"),

        // ADDITIONAL ENTITY-SPECIFIC FIELDS (not in properties)
        requiresConfirmation: boolean("requiresConfirmation").notNull().default(false),

        advancePaymentEnabled: boolean("advancePaymentEnabled").notNull().default(false),
        advancePaymentAmount: integer("advancePaymentAmount"),
        advancePaymentPercentage: decimal("advancePaymentPercentage", {
            precision: 5,
            scale: 2
        }),

        enableRoomWisePricing: boolean("enableRoomWisePricing").notNull().default(false),
        enableFloatingGuests: boolean("enableFloatingGuests").notNull().default(false),
        totalRoomsAvailable: integer("totalRoomsAvailable").default(0),

        isActive: boolean("isActive").notNull().default(true),
        useActiveSchedule: boolean("useActiveSchedule").notNull().default(false),
        activeDays: jsonb("activeDays").$type<number[]>().default(sql`'[]'::jsonb`),
        scheduleNotes: text("scheduleNotes"),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check("bedroom_count_positive", sql`"bedroomCount" >= 0`),
        check("bathroom_count_positive", sql`"bathroomCount" >= 0`),
        check("base_guest_count_positive", sql`"baseGuestCount" >= 0`),
        check("max_guest_count_positive", sql`"maxGuestCount" >= 0`),
        check(
            "max_guest_greater_than_base",
            sql`"maxGuestCount" >= "baseGuestCount"`
        ),
        check(
            "gst_percentage_valid",
            sql`"defaultGstPercentage" >= 0 AND "defaultGstPercentage" <= 100`
        ),
        check(
            "advance_amount_or_percentage",
            sql`("advancePaymentAmount" IS NOT NULL AND "advancePaymentPercentage" IS NULL) OR 
          ("advancePaymentAmount" IS NULL AND "advancePaymentPercentage" IS NOT NULL) OR 
          ("advancePaymentAmount" IS NULL AND "advancePaymentPercentage" IS NULL)`
        ),
        check(
            "advance_percentage_valid",
            sql`"advancePaymentPercentage" IS NULL OR 
          ("advancePaymentPercentage" > 0 AND "advancePaymentPercentage" <= 100)`
        ),
        check(
            "entities_cover_photos_max_5",
            sql`"coverPhotos" IS NULL OR jsonb_array_length("coverPhotos") <= 5`
        ),
        // Note: activeDays validation (values 0-6) must be done at application level
        // PostgreSQL doesn't support subqueries in CHECK constraints

        index("entities_entity_code_idx").on(table.entityCode),
        index("entities_slug_idx").on(table.slug),
        index("entities_entity_type_idx").on(table.entityType),
        index("entities_enable_room_wise_pricing_idx").on(table.enableRoomWisePricing),
        index("entities_enable_floating_guests_idx").on(table.enableFloatingGuests),
        index("entities_area_id_idx").on(table.areaId),
        index("entities_city_id_idx").on(table.cityId),
        index("entities_state_id_idx").on(table.stateId),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const entityProperties = pgTable(
    "entityProperties",
    {
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        propertyId: uuid("propertyId")
            .notNull()
            .references(() => properties.id, {
                onDelete: "cascade",
            }),

        parentEntityId: uuid("parentEntityId").references(() => entities.id, {
            onDelete: "cascade",
        }),

        sortOrder: integer("sortOrder").default(0),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.entityId, table.propertyId] }),
        index("entity_properties_entity_id_idx").on(table.entityId),
        index("entity_properties_property_id_idx").on(table.propertyId),
        index("entity_properties_parent_entity_id_idx").on(table.parentEntityId),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const entityBlockedDates = pgTable(
    "entityBlockedDates",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        blockedDate: date("blockedDate", { mode: "string" }).notNull(),
        reason: text("reason"),
        // // Link to booking for auto-blocking/unblocking of related entities
        // bookingId: uuid("bookingId").references(() => bookings.id, {
        //   onDelete: "cascade",
        // }),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        unique("entity_date_blocked").on(table.entityId, table.blockedDate),
        index("entity_blocked_dates_entity_id_idx").on(table.entityId),
        index("entity_blocked_dates_date_idx").on(table.blockedDate),
        // index("entity_blocked_dates_booking_id_idx").on(table.bookingId),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const entitySpecialDates = pgTable(
    "entitySpecialDates",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        date: date({ mode: "string" }).notNull(),
        price: integer("price"),
        priceWithGST: integer("priceWithGST"),
        adultExtraGuestCharge: integer("adultExtraGuestCharge"),
        adultExtraGuestChargeWithGST: integer("adultExtraGuestChargeWithGST"),
        childExtraGuestCharge: integer("childExtraGuestCharge"),
        childExtraGuestChargeWithGST: integer("childExtraGuestChargeWithGST"),
        infantExtraGuestCharge: integer("infantExtraGuestCharge"),
        infantExtraGuestChargeWithGST: integer("infantExtraGuestChargeWithGST"),
        baseGuestCount: integer("baseGuestCount"),
        discount: integer("discount"),
        maxExtraGuestPrice: integer("maxExtraGuestPrice"),
        maxTotal: integer("maxTotal"),
        gstSlab: integer("gstSlab"),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        unique("entity_date_unique").on(table.entityId, table.date),
        index("entity_special_dates_entity_id_idx").on(table.entityId),
        index("entity_special_dates_date_idx").on(table.date),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

// ============================================================================
// ENTITY RELATIONSHIP TABLES
// ============================================================================
// These tables manage many-to-many relationships between entities and other entities

export const activitiesOnEntities = pgTable(
    "activitiesOnEntities",
    {
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        activityId: uuid("activityId")
            .notNull()
            .references(() => activities.id, {
                onDelete: "cascade",
            }),
        weight: integer("weight"),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.entityId, table.activityId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const amenitiesOnEntities = pgTable(
    "amenitiesOnEntities",
    {
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        amenityId: uuid("amenityId")
            .notNull()
            .references(() => amenities.id, {
                onDelete: "cascade",
            }),
        weight: integer("weight"),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.entityId, table.amenityId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const safetyHygieneOnEntities = pgTable(
    "safetyHygieneOnEntities",
    {
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        safetyHygieneId: uuid("safetyHygieneId")
            .notNull()
            .references(() => safetyHygiene.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.entityId, table.safetyHygieneId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const ownersOnEntities = pgTable(
    "ownersOnEntities",
    {
        ownerId: uuid("ownerId")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.ownerId, table.entityId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const managersOnEntities = pgTable(
    "managersOnEntities",
    {
        managerId: uuid("managerId")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.managerId, table.entityId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const caretakersOnEntities = pgTable(
    "caretakersOnEntities",
    {
        caretakerId: uuid("caretakerId")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.caretakerId, table.entityId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const entityDiscountPlans = pgTable(
    "entityDiscountPlans",
    {
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        discountPlanId: uuid("discountPlanId")
            .notNull()
            .references(() => discountPlans.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.entityId, table.discountPlanId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const entityCancellationPlans = pgTable(
    "entityCancellationPlans",
    {
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        cancellationPlanId: uuid("cancellationPlanId")
            .notNull()
            .references(() => cancellationPlans.id, {
                onDelete: "restrict",
            }),
        type: cancellationPlanTypes("type"),
        policy: text("policy").default(""),
        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.entityId, table.cancellationPlanId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const spaceEntities = pgTable(
    "spaceEntities",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        spaceId: uuid("spaceId")
            .notNull()
            .references(() => spaces.id, {
                onDelete: "cascade",
            }),
        name: text("name").notNull(),
        photo: uuid("photo").references(() => photos.id, {
            onDelete: "set null",
        }),
        title: text("title"),
        description: text("description"),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("space_entities_entity_id_idx").on(table.entityId),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const collectionEntities = pgTable(
    "collectionEntities",
    {
        collectionId: uuid("collectionId")
            .references(() => collections.id, {
                onDelete: "cascade",
            })
            .notNull(),
        entityId: uuid("entityId")
            .references(() => entities.id, {
                onDelete: "cascade",
            })
            .notNull(),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.collectionId, table.entityId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const entityCoupons = pgTable(
    "entityCoupons",
    {
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        couponId: uuid("couponId")
            .notNull()
            .references(() => coupons.id, {
                onDelete: "cascade",
            }),
        ...adminOrUserUpdateReference,
    },
    (table) => [
        primaryKey({ columns: [table.entityId, table.couponId] }),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const reviewsOnEntities = pgTable(
    "reviewsOnEntities",
    {
        reviewId: uuid("reviewId")
            .notNull()
            .references(() => reviews.id, {
                onDelete: "cascade",
            }),
        entityId: uuid("entityId")
            .notNull()
            .references(() => entities.id, {
                onDelete: "cascade",
            }),
        ...timestamps,
    },
    (table) => [
        primaryKey({ columns: [table.reviewId, table.entityId] }),
        index("reviews_on_entities_entity_id_idx").on(table.entityId),
        index("reviews_on_entities_review_id_idx").on(table.reviewId),
    ]
);


// For admin only tables, we need to check both createdBy and adminCreatedBy should not be null
export const adminOnlyTables = {
    propertyTypes: propertyTypes,
    activities: activities,
    activitiesOnProperties: activitiesOnProperties,
    amenities: amenities,
    amenitiesOnProperties: amenitiesOnProperties,
    safetyHygiene: safetyHygiene,
    safetyHygieneOnProperties: safetyHygieneOnProperties,
    states: states,
    cities: cities,
    areas: areas,
    landmarks: landmarks,
    nearbyLocations: nearbyLocations,
    admins: admins,
    ratePlans: ratePlans,
    settings: settings,
    cancellationPlans: cancellationPlans,
    specialDates: specialDates,
    cancellationPercentages: cancellationPercentages,
    tags: tags,
    propertyTags: propertyTags,
    cms: cms,
    carousel: carousel,
    carouselPhotos: carouselPhotos,
    collections: collections,
    collectionProperties: collectionProperties,
    spaces: spaces,
    extraPlans: extraPlans,
    faqs: faqs,
    // icalLinks: icalLinks, 
    // importedBookings: importedBookings, 
    entities: entities,
    entityProperties: entityProperties,
    entityBlockedDates: entityBlockedDates,
    entitySpecialDates: entitySpecialDates,
    activitiesOnEntities: activitiesOnEntities,
    amenitiesOnEntities: amenitiesOnEntities,
    safetyHygieneOnEntities: safetyHygieneOnEntities,
    ownersOnEntities: ownersOnEntities,
    managersOnEntities: managersOnEntities,
    caretakersOnEntities: caretakersOnEntities,
    entityDiscountPlans: entityDiscountPlans,
    entityCancellationPlans: entityCancellationPlans,
    spaceEntities: spaceEntities,
    collectionEntities: collectionEntities,
    entityCoupons: entityCoupons,
    reviewsOnEntities: reviewsOnEntities,
    entityPhotos: entityPhotos,
    bookingAuditLog: bookingAuditLog,
    staticImages: staticImages,
} as const;



export const tableHistoryRoleEnum = pgEnum("tableHistoryRoleEnum", [
    "Admin",
    "User",
]);
export const tableHistoryOperationEnum = pgEnum("tableHistoryOperationEnum", [
    "INSERT",
    "UPDATE",
    "DELETE",
]);

export const propertyDetailView = pgView("propertyDetailView").as((qb) =>
    qb
        .select({
            id: properties.id,
            propertyName: properties.propertyName,
            heading: properties.heading,
            propertyCode: properties.propertyCode,
            propertyCodeName: properties.propertyCodeName,
            description: properties.description,
            exploreYourStay: properties.exploreYourStay,
            homeRulesTruths: properties.homeRulesTruths,
            allowCallBooking: properties.allowCallBooking,
            allowEnquiry: properties.allowEnquiry,
            allowOnlineBooking: properties.allowOnlineBooking,
            commissionPercentage: properties.commissionPercentage, // Fixed: use correct column name
            securityDeposit: properties.securityDeposit, // Fixed: use correct column name
            cookingAccessFee: properties.cookingAccessFee,
            isDisabled: properties.isDisabled,

            bedroomCount: properties.bedroomCount,
            bathroomCount: properties.bathroomCount,
            baseGuestCount: properties.baseGuestCount,
            maxGuestCount: properties.maxGuestCount,
            address: properties.address,
            landmark: properties.landmark,
            mapLink: properties.mapLink,
            areaId: properties.areaId,
            secondaryAreaId1: properties.secondaryAreaId1,
            secondaryAreaId2: properties.secondaryAreaId2,
            secondaryAreaId3: properties.secondaryAreaId3,
            secondaryAreaId4: properties.secondaryAreaId4,
            cityId: properties.cityId,
            areaSlug: sql<string>`${areas.slug}`.as("areaSlug"),
            citySlug: sql<string>`${cities.slug}`.as("citySlug"),
            stateId: cities.stateId,
            pincode: properties.pincode,
            propertyTypeId: properties.propertyTypeId,
            slug: properties.slug,
            showOnInstafarms: properties.showOnInstafarms,
            showOnListing: properties.showOnListing,
            propertyManagementType: properties.propertyManagementType,
            auditEnabled: properties.auditEnabled,
            maxAuditGapDays: properties.maxAuditGapDays,
            auditComplianceStatus: properties.auditComplianceStatus,
            weight: properties.weight,
            createdAt: properties.createdAt,
            updatedAt: properties.updatedAt,
            createdBy: properties.createdBy,
            updatedBy: properties.updatedBy,
            adminCreatedBy: properties.adminCreatedBy,
            adminUpdatedBy: properties.adminUpdatedBy,

            // Additional property fields
            latitude: properties.latitude,
            longitude: properties.longitude,
            checkinTime: properties.checkinTime,
            checkoutTime: properties.checkoutTime,
            doubleBedCount: properties.doubleBedCount,
            singleBedCount: properties.singleBedCount,
            mattressCount: properties.mattressCount,
            jarvisSyncPropertyId: properties.jarvisSyncPropertyId,

            defaultGstPercentage: properties.defaultGstPercentage,
            requiresConfirmation: properties.requiresConfirmation,
            advancePaymentEnabled: properties.advancePaymentEnabled,
            advancePaymentAmount: properties.advancePaymentAmount,
            advancePaymentPercentage: properties.advancePaymentPercentage,
            // Day-wise pricing

            bookingPolicy: properties.bookingPolicy,

            mondayPrice: properties.mondayPrice,
            mondayPriceWithGST: properties.mondayPriceWithGST,
            tuesdayPrice: properties.tuesdayPrice,
            tuesdayPriceWithGST: properties.tuesdayPriceWithGST,
            wednesdayPrice: properties.wednesdayPrice,
            wednesdayPriceWithGST: properties.wednesdayPriceWithGST,
            thursdayPrice: properties.thursdayPrice,
            thursdayPriceWithGST: properties.thursdayPriceWithGST,
            fridayPrice: properties.fridayPrice,
            fridayPriceWithGST: properties.fridayPriceWithGST,
            saturdayPrice: properties.saturdayPrice,
            saturdayPriceWithGST: properties.saturdayPriceWithGST,
            sundayPrice: properties.sundayPrice,
            sundayPriceWithGST: properties.sundayPriceWithGST,

            mondayAdultExtraGuestCharge: properties.mondayAdultExtraGuestCharge,
            mondayAdultExtraGuestChargeWithGST: properties.mondayAdultExtraGuestChargeWithGST,
            mondayChildExtraGuestCharge: properties.mondayChildExtraGuestCharge,
            mondayChildExtraGuestChargeWithGST: properties.mondayChildExtraGuestChargeWithGST,
            mondayInfantExtraGuestCharge: properties.mondayInfantExtraGuestCharge,
            mondayInfantExtraGuestChargeWithGST: properties.mondayInfantExtraGuestChargeWithGST,
            mondayBaseGuestCount: properties.mondayBaseGuestCount,
            mondayDiscount: properties.mondayDiscount,

            tuesdayAdultExtraGuestCharge: properties.tuesdayAdultExtraGuestCharge,
            tuesdayAdultExtraGuestChargeWithGST: properties.tuesdayAdultExtraGuestChargeWithGST,
            tuesdayChildExtraGuestCharge: properties.tuesdayChildExtraGuestCharge,
            tuesdayChildExtraGuestChargeWithGST: properties.tuesdayChildExtraGuestChargeWithGST,
            tuesdayInfantExtraGuestCharge: properties.tuesdayInfantExtraGuestCharge,
            tuesdayInfantExtraGuestChargeWithGST: properties.tuesdayInfantExtraGuestChargeWithGST,
            tuesdayBaseGuestCount: properties.tuesdayBaseGuestCount,
            tuesdayDiscount: properties.tuesdayDiscount,

            wednesdayAdultExtraGuestCharge: properties.wednesdayAdultExtraGuestCharge,
            wednesdayAdultExtraGuestChargeWithGST: properties.wednesdayAdultExtraGuestChargeWithGST,
            wednesdayChildExtraGuestCharge: properties.wednesdayChildExtraGuestCharge,
            wednesdayChildExtraGuestChargeWithGST: properties.wednesdayChildExtraGuestChargeWithGST,
            wednesdayInfantExtraGuestCharge: properties.wednesdayInfantExtraGuestCharge,
            wednesdayInfantExtraGuestChargeWithGST: properties.wednesdayInfantExtraGuestChargeWithGST,
            wednesdayBaseGuestCount: properties.wednesdayBaseGuestCount,
            wednesdayDiscount: properties.wednesdayDiscount,

            thursdayAdultExtraGuestCharge: properties.thursdayAdultExtraGuestCharge,
            thursdayAdultExtraGuestChargeWithGST: properties.thursdayAdultExtraGuestChargeWithGST,
            thursdayChildExtraGuestCharge: properties.thursdayChildExtraGuestCharge,
            thursdayChildExtraGuestChargeWithGST: properties.thursdayChildExtraGuestChargeWithGST,
            thursdayInfantExtraGuestCharge: properties.thursdayInfantExtraGuestCharge,
            thursdayInfantExtraGuestChargeWithGST: properties.thursdayInfantExtraGuestChargeWithGST,
            thursdayBaseGuestCount: properties.thursdayBaseGuestCount,
            thursdayDiscount: properties.thursdayDiscount,

            fridayAdultExtraGuestCharge: properties.fridayAdultExtraGuestCharge,
            fridayAdultExtraGuestChargeWithGST: properties.fridayAdultExtraGuestChargeWithGST,
            fridayChildExtraGuestCharge: properties.fridayChildExtraGuestCharge,
            fridayChildExtraGuestChargeWithGST: properties.fridayChildExtraGuestChargeWithGST,
            fridayInfantExtraGuestCharge: properties.fridayInfantExtraGuestCharge,
            fridayInfantExtraGuestChargeWithGST: properties.fridayInfantExtraGuestChargeWithGST,
            fridayBaseGuestCount: properties.fridayBaseGuestCount,
            fridayDiscount: properties.fridayDiscount,

            saturdayAdultExtraGuestCharge: properties.saturdayAdultExtraGuestCharge,
            saturdayAdultExtraGuestChargeWithGST: properties.saturdayAdultExtraGuestChargeWithGST,
            saturdayChildExtraGuestCharge: properties.saturdayChildExtraGuestCharge,
            saturdayChildExtraGuestChargeWithGST: properties.saturdayChildExtraGuestChargeWithGST,
            saturdayInfantExtraGuestCharge: properties.saturdayInfantExtraGuestCharge,
            saturdayInfantExtraGuestChargeWithGST: properties.saturdayInfantExtraGuestChargeWithGST,
            saturdayBaseGuestCount: properties.saturdayBaseGuestCount,
            saturdayDiscount: properties.saturdayDiscount,

            sundayAdultExtraGuestCharge: properties.sundayAdultExtraGuestCharge,
            sundayAdultExtraGuestChargeWithGST: properties.sundayAdultExtraGuestChargeWithGST,
            sundayChildExtraGuestCharge: properties.sundayChildExtraGuestCharge,
            sundayChildExtraGuestChargeWithGST: properties.sundayChildExtraGuestChargeWithGST,
            sundayInfantExtraGuestCharge: properties.sundayInfantExtraGuestCharge,
            sundayInfantExtraGuestChargeWithGST: properties.sundayInfantExtraGuestChargeWithGST,
            sundayBaseGuestCount: properties.sundayBaseGuestCount,
            sundayDiscount: properties.sundayDiscount,

            // Floating guest charges
            mondayFloatingAdultExtraGuestCharge: properties.mondayFloatingAdultExtraGuestCharge,
            mondayFloatingAdultExtraGuestChargeWithGST: properties.mondayFloatingAdultExtraGuestChargeWithGST,
            mondayFloatingChildExtraGuestCharge: properties.mondayFloatingChildExtraGuestCharge,
            mondayFloatingChildExtraGuestChargeWithGST: properties.mondayFloatingChildExtraGuestChargeWithGST,
            mondayFloatingInfantExtraGuestCharge: properties.mondayFloatingInfantExtraGuestCharge,
            mondayFloatingInfantExtraGuestChargeWithGST: properties.mondayFloatingInfantExtraGuestChargeWithGST,

            tuesdayFloatingAdultExtraGuestCharge: properties.tuesdayFloatingAdultExtraGuestCharge,
            tuesdayFloatingAdultExtraGuestChargeWithGST: properties.tuesdayFloatingAdultExtraGuestChargeWithGST,
            tuesdayFloatingChildExtraGuestCharge: properties.tuesdayFloatingChildExtraGuestCharge,
            tuesdayFloatingChildExtraGuestChargeWithGST: properties.tuesdayFloatingChildExtraGuestChargeWithGST,
            tuesdayFloatingInfantExtraGuestCharge: properties.tuesdayFloatingInfantExtraGuestCharge,
            tuesdayFloatingInfantExtraGuestChargeWithGST: properties.tuesdayFloatingInfantExtraGuestChargeWithGST,

            wednesdayFloatingAdultExtraGuestCharge: properties.wednesdayFloatingAdultExtraGuestCharge,
            wednesdayFloatingAdultExtraGuestChargeWithGST: properties.wednesdayFloatingAdultExtraGuestChargeWithGST,
            wednesdayFloatingChildExtraGuestCharge: properties.wednesdayFloatingChildExtraGuestCharge,
            wednesdayFloatingChildExtraGuestChargeWithGST: properties.wednesdayFloatingChildExtraGuestChargeWithGST,
            wednesdayFloatingInfantExtraGuestCharge: properties.wednesdayFloatingInfantExtraGuestCharge,
            wednesdayFloatingInfantExtraGuestChargeWithGST: properties.wednesdayFloatingInfantExtraGuestChargeWithGST,

            thursdayFloatingAdultExtraGuestCharge: properties.thursdayFloatingAdultExtraGuestCharge,
            thursdayFloatingAdultExtraGuestChargeWithGST: properties.thursdayFloatingAdultExtraGuestChargeWithGST,
            thursdayFloatingChildExtraGuestCharge: properties.thursdayFloatingChildExtraGuestCharge,
            thursdayFloatingChildExtraGuestChargeWithGST: properties.thursdayFloatingChildExtraGuestChargeWithGST,
            thursdayFloatingInfantExtraGuestCharge: properties.thursdayFloatingInfantExtraGuestCharge,
            thursdayFloatingInfantExtraGuestChargeWithGST: properties.thursdayFloatingInfantExtraGuestChargeWithGST,

            fridayFloatingAdultExtraGuestCharge: properties.fridayFloatingAdultExtraGuestCharge,
            fridayFloatingAdultExtraGuestChargeWithGST: properties.fridayFloatingAdultExtraGuestChargeWithGST,
            fridayFloatingChildExtraGuestCharge: properties.fridayFloatingChildExtraGuestCharge,
            fridayFloatingChildExtraGuestChargeWithGST: properties.fridayFloatingChildExtraGuestChargeWithGST,
            fridayFloatingInfantExtraGuestCharge: properties.fridayFloatingInfantExtraGuestCharge,
            fridayFloatingInfantExtraGuestChargeWithGST: properties.fridayFloatingInfantExtraGuestChargeWithGST,

            saturdayFloatingAdultExtraGuestCharge: properties.saturdayFloatingAdultExtraGuestCharge,
            saturdayFloatingAdultExtraGuestChargeWithGST: properties.saturdayFloatingAdultExtraGuestChargeWithGST,
            saturdayFloatingChildExtraGuestCharge: properties.saturdayFloatingChildExtraGuestCharge,
            saturdayFloatingChildExtraGuestChargeWithGST: properties.saturdayFloatingChildExtraGuestChargeWithGST,
            saturdayFloatingInfantExtraGuestCharge: properties.saturdayFloatingInfantExtraGuestCharge,
            saturdayFloatingInfantExtraGuestChargeWithGST: properties.saturdayFloatingInfantExtraGuestChargeWithGST,

            sundayFloatingAdultExtraGuestCharge: properties.sundayFloatingAdultExtraGuestCharge,
            sundayFloatingAdultExtraGuestChargeWithGST: properties.sundayFloatingAdultExtraGuestChargeWithGST,
            sundayFloatingChildExtraGuestCharge: properties.sundayFloatingChildExtraGuestCharge,
            sundayFloatingChildExtraGuestChargeWithGST: properties.sundayFloatingChildExtraGuestChargeWithGST,
            sundayFloatingInfantExtraGuestCharge: properties.sundayFloatingInfantExtraGuestCharge,
            sundayFloatingInfantExtraGuestChargeWithGST: properties.sundayFloatingInfantExtraGuestChargeWithGST,

            // Location data
            state: states.state,
            city: cities.city,
            area: areas.area,
            propertyTypeName: propertyTypes.name,

            // Google place data
            googlePlaceId: properties.googlePlaceId,
            googlePlaceRating: properties.googlePlaceRating,
            googlePlaceUserRatingCount: properties.googlePlaceUserRatingCount,
            googlePlaceReviews: properties.googlePlaceReviews,
            nearbyPlaces: properties.nearbyPlaces,

            // All aggregated JSON data in one view using subqueries

            specialDates: sql<any[]>`
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', sd.id,
                'date', sd."date",
                'price', sd.price,
                'adultExtraGuestCharge',sd."adultExtraGuestCharge",
                'childExtraGuestCharge', sd."childExtraGuestCharge",
                'infantExtraGuestCharge', sd."infantExtraGuestCharge",
                'baseGuestCount', sd."baseGuestCount",
                'discount', sd.discount
              ) ORDER BY sd."date"
            ) FROM "specialDates" sd
            WHERE sd."propertyId" = properties.id),
            '[]'::json
          )`.as("specialDates"),
            spaces: sql<any[]>`
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', sp.id,
                'name', sp.name,
                'photo', p."watermarkedUrlByInstafarms",
                'title', sp.title,
                'description', sp.description
              ) ORDER BY sp."createdAt"
            ) FROM "spaceProperties" sp
            JOIN photos p ON sp."photoId" = p.id
            WHERE sp."propertyId" = properties.id),
            '[]'::json
          )
        `.as("spaces"),

            amenities: sql<
                {
                    id: string;
                    name: string;
                    icon: string;
                    weight: number;
                    type: "amenities";
                    paid?: number | null;
                    usp?: number | null;
                }[]
            >`
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', a.id,
                'name', a.name,
                'icon', a.icon,
                'weight', a.weight,
                'type', 'amenities',
                'paid', CASE WHEN a."isPaid" THEN 1 ELSE NULL END,
                'usp', CASE WHEN a."isUSP" THEN 1 ELSE NULL END
              ) ORDER BY a.weight
            ) FROM amenities a
            JOIN "amenitiesOnProperties" aop ON a.id = aop."amenityId"
            WHERE aop."propertyId" = properties.id),
            '[]'::json
          )
        `.as("amenities"),

            activities: sql<
                {
                    id: string;
                    name: string;
                    icon: string;
                    weight: number;
                    type: "activities";
                    paid?: number | null;
                    usp?: number | null;
                }[]
            >`
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', act.id,
                'name', act.name,
                'icon', act.icon,
                'weight', act.weight,
                'type', 'activities',
                'paid', CASE WHEN act."isPaid" THEN 1 ELSE NULL END,
                'usp', CASE WHEN act."isUSP" THEN 1 ELSE NULL END
              ) ORDER BY act.weight
            ) FROM activities act
            JOIN "activitiesOnProperties" acop ON act.id = acop."activityId"
            WHERE acop."propertyId" = properties.id),
            '[]'::json
          )
        `.as("activities"),

            safetyHygiene: sql<
                {
                    id: string;
                    name: string;
                    icon: string;
                }[]
            >`
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', sh.id,
                'name', sh.name,
                'icon', sh.icon
              )
            ) FROM "safetyHygiene" sh
            JOIN "safetyHygieneOnProperties" shop ON sh.id = shop."safetyHygieneId"
            WHERE shop."propertyId" = properties.id),
            '[]'::json
          )
        `.as("safetyHygiene"),


            faqs: properties.faqs,
            meta: properties.meta,

            gallery: sql<
                {
                    id: string;
                    url: string;
                    originalUrl: string;
                    name: string;
                    order: number;
                    altText: string | null;
                    cover: number | null;
                    waterMarked: boolean;
                    tag: string | null;
                }[]
            >`
          COALESCE(
        (SELECT json_agg(
          json_build_object(
            'id', p.id,
            'url', p."watermarkedUrlByInstafarms",
            'originalUrl', p."originalUrl",
            'name', p."name",
            'order', pp."sortOrder",
            'altText', p."instafarmsAltText",
            'cover', pp."sortOrder",
            'waterMarked', false,
            'tag', pp."category"
          ) ORDER BY pp."sortOrder"
        ) FROM photos p
            JOIN "propertyPhotos" pp ON p.id = pp."photoId"
            WHERE pp."propertyId" = properties.id),
      '[]':: json
    )
    `.as("gallery"),
            coverPhotos: properties.coverPhotos,
            manager: sql<{
                id: string;
                name: string;
                email: string;
                phone: string;
            }>`
    (SELECT json_build_object(
      'id', u.id,
      'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
      'email', u.email,
      'phone', u."mobileNumber"
    ) FROM users u
          JOIN "managersOnProperties" mop ON u.id = mop."managerId"
          WHERE mop."propertyId" = properties.id LIMIT 1)
    `.as("manager"),

            caretaker: sql<{
                id: string;
                name: string;
                email: string;
                phone: string;
            }>`
    (SELECT json_build_object(
      'id', u.id,
      'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
      'email', u.email,
      'phone', u."mobileNumber"
    ) FROM users u
          JOIN "caretakersOnProperties" cop ON u.id = cop."caretakerId"
          WHERE cop."propertyId" = properties.id LIMIT 1)
    `.as("caretaker"),

            owner: sql<{
                id: string;
                name: string;
                email: string;
                phone: string;
            }>`
    (SELECT json_build_object(
      'id', u.id,
      'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
      'email', u.email,
      'phone', u."mobileNumber"
    ) FROM users u
          JOIN "ownersOnProperties" oop ON u.id = oop."ownerId"
          WHERE oop."propertyId" = properties.id LIMIT 1)
    `.as("owner"),
            section: properties.sections,

            bookedDates: sql<string[]>`
        COALESCE(
      (SELECT json_agg(bd."blockedDate")
            FROM "blockedDates" bd
            WHERE bd."propertyId" = properties.id
    ),
  '[]'
)
  `.as("bookedDates"),
            discountPlan: sql<{
                id: string;
                name: string;
                discounts: {
                    id: string;
                    minDays: number;
                    discountPercentage: number | null;
                    flatDiscount: number | null;
                }[];
            }>`
  (SELECT json_build_object(
    'id', dp.id,
    'name', dp.name,
    'discounts', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', dpv.id,
            'minDays', dpv."minDays",
            'discountPercentage', dpv."discountPercentage",
            'flatDiscount', dpv."flatDiscount"
          ) ORDER BY dpv."minDays"
        )
                FROM "discountPlansValues" dpv
                WHERE dpv."discountPlanId" = dp.id
    ),
    '[]':: json
  )
  ) FROM "propertyDiscountPlans" pdp
          JOIN "discountPlans" dp ON pdp."discountPlanId" = dp.id
          WHERE pdp."propertyId" = properties.id LIMIT 1)
`.as("discountPlan"),

            shortTermCancellationPlan: sql<{
                id: string;
                name: string;
                isActive: boolean;
            }>`
  (SELECT json_build_object(
    'id', pcp."cancellationPlanId",
    'name', cp.name,
    'isActive', cp."isActive",
    'policy', pcp.policy,
    'refunds', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', cpp.id,
            'lessThan', cpp."lessThan",
            'days', cpp."days",
            'percentage', cpp."percentage"
          ) ORDER BY cpp."days"
        )
                FROM "cancellationPercentages" cpp
                WHERE cpp."cancellationPlanId" = cp.id
    ),
    '[]':: json
  )
  ) FROM "propertyCancellationPlans" pcp
          JOIN "cancellationPlans" cp ON pcp."cancellationPlanId" = cp.id
          WHERE pcp."propertyId" = properties.id AND pcp.type = 'shortterm' LIMIT 1)
`.as("shortTermCancellationPlan"),
            longTermCancellationPlan: sql<{
                id: string;
                name: string;
                isActive: boolean;
            }>`
  (SELECT json_build_object(
    'id', pcp."cancellationPlanId",
    'name', cp.name,
    'isActive', cp."isActive",
    'policy', pcp.policy,
    'refunds', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', cpp.id,
            'lessThan', cpp."lessThan",
            'days', cpp."days",
            'percentage', cpp."percentage"
          ) ORDER BY cpp."days"
        )
                FROM "cancellationPercentages" cpp
                WHERE cpp."cancellationPlanId" = cp.id
    ),
    '[]':: json
  )
  ) FROM "propertyCancellationPlans" pcp
          JOIN "cancellationPlans" cp ON pcp."cancellationPlanId" = cp.id
          WHERE pcp."propertyId" = properties.id AND pcp.type = 'longterm' LIMIT 1)
`.as("longTermCancellationPlan"),
        })
        .from(properties)
        .leftJoin(areas, eq(properties.areaId, areas.id))
        .leftJoin(cities, eq(areas.cityId, cities.id))
        .leftJoin(states, eq(cities.stateId, states.id))
        .leftJoin(propertyTypes, eq(properties.propertyTypeId, propertyTypes.id))
        .leftJoin(specialDates, eq(properties.id, specialDates.propertyId))
);

// ============================================================================
// ENTITY DETAIL VIEW
// ============================================================================
// Provides complete entity details with aggregated data from linked properties
// Logic:
// - STANDALONE: Data from entities.propertyId (single property)
// - CLUBBED/SPLIT: UNION of data from all properties in entityProperties table
// ============================================================================

export const entityDetailView = pgView("entityDetailView").as((qb) =>
    qb
        .select({
            // Entity basic fields
            id: entities.id,
            entityName: entities.entityName,
            entityCode: entities.entityCode,
            entityCodeName: entities.entityCodeName,
            entityType: entities.entityType,
            propertyId: entities.propertyId, // Only for STANDALONE

            // Entity-specific fields
            requiresConfirmation: entities.requiresConfirmation,
            advancePaymentEnabled: entities.advancePaymentEnabled,
            advancePaymentAmount: entities.advancePaymentAmount,
            advancePaymentPercentage: entities.advancePaymentPercentage,
            enableRoomWisePricing: entities.enableRoomWisePricing,
            enableFloatingGuests: entities.enableFloatingGuests,
            totalRoomsAvailable: entities.totalRoomsAvailable,
            isActive: entities.isActive,

            // All property fields from entities table (entities is replica of properties)
            heading: entities.heading,
            description: entities.description,
            allowCallBooking: entities.allowCallBooking,
            allowEnquiry: entities.allowEnquiry,
            allowOnlineBooking: entities.allowOnlineBooking,
            commissionPercentage: entities.commissionPercentage,
            securityDeposit: entities.securityDeposit,
            cookingAccessFee: entities.cookingAccessFee,

            mondayPrice: entities.mondayPrice,
            mondayPriceWithGST: entities.mondayPriceWithGST,
            mondayAdultExtraGuestCharge: entities.mondayAdultExtraGuestCharge,
            mondayAdultExtraGuestChargeWithGST: entities.mondayAdultExtraGuestChargeWithGST,
            mondayChildExtraGuestCharge: entities.mondayChildExtraGuestCharge,
            mondayChildExtraGuestChargeWithGST: entities.mondayChildExtraGuestChargeWithGST,
            mondayInfantExtraGuestCharge: entities.mondayInfantExtraGuestCharge,
            mondayInfantExtraGuestChargeWithGST: entities.mondayInfantExtraGuestChargeWithGST,
            mondayBaseGuestCount: entities.mondayBaseGuestCount,
            mondayDiscount: entities.mondayDiscount,
            mondayGSTslab: entities.mondayGSTslab,
            mondayMaxExtraGuestPrice: entities.mondayMaxExtraGuestPrice,
            mondayMaxTotal: entities.mondayMaxTotal,

            tuesdayPrice: entities.tuesdayPrice,
            tuesdayPriceWithGST: entities.tuesdayPriceWithGST,
            tuesdayAdultExtraGuestCharge: entities.tuesdayAdultExtraGuestCharge,
            tuesdayAdultExtraGuestChargeWithGST: entities.tuesdayAdultExtraGuestChargeWithGST,
            tuesdayChildExtraGuestCharge: entities.tuesdayChildExtraGuestCharge,
            tuesdayChildExtraGuestChargeWithGST: entities.tuesdayChildExtraGuestChargeWithGST,
            tuesdayInfantExtraGuestCharge: entities.tuesdayInfantExtraGuestCharge,
            tuesdayInfantExtraGuestChargeWithGST: entities.tuesdayInfantExtraGuestChargeWithGST,
            tuesdayBaseGuestCount: entities.tuesdayBaseGuestCount,
            tuesdayDiscount: entities.tuesdayDiscount,
            tuesdayGSTslab: entities.tuesdayGSTslab,
            tuesdayMaxExtraGuestPrice: entities.tuesdayMaxExtraGuestPrice,
            tuesdayMaxTotal: entities.tuesdayMaxTotal,

            wednesdayPrice: entities.wednesdayPrice,
            wednesdayPriceWithGST: entities.wednesdayPriceWithGST,
            wednesdayAdultExtraGuestCharge: entities.wednesdayAdultExtraGuestCharge,
            wednesdayAdultExtraGuestChargeWithGST: entities.wednesdayAdultExtraGuestChargeWithGST,
            wednesdayChildExtraGuestCharge: entities.wednesdayChildExtraGuestCharge,
            wednesdayChildExtraGuestChargeWithGST: entities.wednesdayChildExtraGuestChargeWithGST,
            wednesdayInfantExtraGuestCharge: entities.wednesdayInfantExtraGuestCharge,
            wednesdayInfantExtraGuestChargeWithGST: entities.wednesdayInfantExtraGuestChargeWithGST,
            wednesdayBaseGuestCount: entities.wednesdayBaseGuestCount,
            wednesdayDiscount: entities.wednesdayDiscount,
            wednesdayGSTslab: entities.wednesdayGSTslab,
            wednesdayMaxExtraGuestPrice: entities.wednesdayMaxExtraGuestPrice,
            wednesdayMaxTotal: entities.wednesdayMaxTotal,

            thursdayPrice: entities.thursdayPrice,
            thursdayPriceWithGST: entities.thursdayPriceWithGST,
            thursdayAdultExtraGuestCharge: entities.thursdayAdultExtraGuestCharge,
            thursdayAdultExtraGuestChargeWithGST: entities.thursdayAdultExtraGuestChargeWithGST,
            thursdayChildExtraGuestCharge: entities.thursdayChildExtraGuestCharge,
            thursdayChildExtraGuestChargeWithGST: entities.thursdayChildExtraGuestChargeWithGST,
            thursdayInfantExtraGuestCharge: entities.thursdayInfantExtraGuestCharge,
            thursdayInfantExtraGuestChargeWithGST: entities.thursdayInfantExtraGuestChargeWithGST,
            thursdayBaseGuestCount: entities.thursdayBaseGuestCount,
            thursdayDiscount: entities.thursdayDiscount,
            thursdayGSTslab: entities.thursdayGSTslab,
            thursdayMaxExtraGuestPrice: entities.thursdayMaxExtraGuestPrice,
            thursdayMaxTotal: entities.thursdayMaxTotal,

            fridayPrice: entities.fridayPrice,
            fridayPriceWithGST: entities.fridayPriceWithGST,
            fridayAdultExtraGuestCharge: entities.fridayAdultExtraGuestCharge,
            fridayAdultExtraGuestChargeWithGST: entities.fridayAdultExtraGuestChargeWithGST,
            fridayChildExtraGuestCharge: entities.fridayChildExtraGuestCharge,
            fridayChildExtraGuestChargeWithGST: entities.fridayChildExtraGuestChargeWithGST,
            fridayInfantExtraGuestCharge: entities.fridayInfantExtraGuestCharge,
            fridayInfantExtraGuestChargeWithGST: entities.fridayInfantExtraGuestChargeWithGST,
            fridayBaseGuestCount: entities.fridayBaseGuestCount,
            fridayDiscount: entities.fridayDiscount,
            fridayGSTslab: entities.fridayGSTslab,
            fridayMaxExtraGuestPrice: entities.fridayMaxExtraGuestPrice,
            fridayMaxTotal: entities.fridayMaxTotal,

            saturdayPrice: entities.saturdayPrice,
            saturdayPriceWithGST: entities.saturdayPriceWithGST,
            saturdayAdultExtraGuestCharge: entities.saturdayAdultExtraGuestCharge,
            saturdayAdultExtraGuestChargeWithGST: entities.saturdayAdultExtraGuestChargeWithGST,
            saturdayChildExtraGuestCharge: entities.saturdayChildExtraGuestCharge,
            saturdayChildExtraGuestChargeWithGST: entities.saturdayChildExtraGuestChargeWithGST,
            saturdayInfantExtraGuestCharge: entities.saturdayInfantExtraGuestCharge,
            saturdayInfantExtraGuestChargeWithGST: entities.saturdayInfantExtraGuestChargeWithGST,
            saturdayBaseGuestCount: entities.saturdayBaseGuestCount,
            saturdayDiscount: entities.saturdayDiscount,
            saturdayGSTslab: entities.saturdayGSTslab,
            saturdayMaxExtraGuestPrice: entities.saturdayMaxExtraGuestPrice,
            saturdayMaxTotal: entities.saturdayMaxTotal,

            sundayPrice: entities.sundayPrice,
            sundayPriceWithGST: entities.sundayPriceWithGST,
            sundayAdultExtraGuestCharge: entities.sundayAdultExtraGuestCharge,
            sundayAdultExtraGuestChargeWithGST: entities.sundayAdultExtraGuestChargeWithGST,
            sundayChildExtraGuestCharge: entities.sundayChildExtraGuestCharge,
            sundayChildExtraGuestChargeWithGST: entities.sundayChildExtraGuestChargeWithGST,
            sundayInfantExtraGuestCharge: entities.sundayInfantExtraGuestCharge,
            sundayInfantExtraGuestChargeWithGST: entities.sundayInfantExtraGuestChargeWithGST,
            sundayBaseGuestCount: entities.sundayBaseGuestCount,
            sundayDiscount: entities.sundayDiscount,
            sundayGSTslab: entities.sundayGSTslab,
            sundayMaxExtraGuestPrice: entities.sundayMaxExtraGuestPrice,
            sundayMaxTotal: entities.sundayMaxTotal,

            // Floating guest charges
            mondayFloatingAdultExtraGuestCharge: entities.mondayFloatingAdultExtraGuestCharge,
            mondayFloatingChildExtraGuestCharge: entities.mondayFloatingChildExtraGuestCharge,
            mondayFloatingInfantExtraGuestCharge: entities.mondayFloatingInfantExtraGuestCharge,
            mondayFloatingAdultExtraGuestChargeWithGST: entities.mondayFloatingAdultExtraGuestChargeWithGST,
            mondayFloatingChildExtraGuestChargeWithGST: entities.mondayFloatingChildExtraGuestChargeWithGST,
            mondayFloatingInfantExtraGuestChargeWithGST: entities.mondayFloatingInfantExtraGuestChargeWithGST,

            tuesdayFloatingAdultExtraGuestCharge: entities.tuesdayFloatingAdultExtraGuestCharge,
            tuesdayFloatingChildExtraGuestCharge: entities.tuesdayFloatingChildExtraGuestCharge,
            tuesdayFloatingInfantExtraGuestCharge: entities.tuesdayFloatingInfantExtraGuestCharge,
            tuesdayFloatingAdultExtraGuestChargeWithGST: entities.tuesdayFloatingAdultExtraGuestChargeWithGST,
            tuesdayFloatingChildExtraGuestChargeWithGST: entities.tuesdayFloatingChildExtraGuestChargeWithGST,
            tuesdayFloatingInfantExtraGuestChargeWithGST: entities.tuesdayFloatingInfantExtraGuestChargeWithGST,

            wednesdayFloatingAdultExtraGuestCharge: entities.wednesdayFloatingAdultExtraGuestCharge,
            wednesdayFloatingChildExtraGuestCharge: entities.wednesdayFloatingChildExtraGuestCharge,
            wednesdayFloatingInfantExtraGuestCharge: entities.wednesdayFloatingInfantExtraGuestCharge,
            wednesdayFloatingAdultExtraGuestChargeWithGST: entities.wednesdayFloatingAdultExtraGuestChargeWithGST,
            wednesdayFloatingChildExtraGuestChargeWithGST: entities.wednesdayFloatingChildExtraGuestChargeWithGST,
            wednesdayFloatingInfantExtraGuestChargeWithGST: entities.wednesdayFloatingInfantExtraGuestChargeWithGST,

            thursdayFloatingAdultExtraGuestCharge: entities.thursdayFloatingAdultExtraGuestCharge,
            thursdayFloatingChildExtraGuestCharge: entities.thursdayFloatingChildExtraGuestCharge,
            thursdayFloatingInfantExtraGuestCharge: entities.thursdayFloatingInfantExtraGuestCharge,
            thursdayFloatingAdultExtraGuestChargeWithGST: entities.thursdayFloatingAdultExtraGuestChargeWithGST,
            thursdayFloatingChildExtraGuestChargeWithGST: entities.thursdayFloatingChildExtraGuestChargeWithGST,
            thursdayFloatingInfantExtraGuestChargeWithGST: entities.thursdayFloatingInfantExtraGuestChargeWithGST,

            fridayFloatingAdultExtraGuestCharge: entities.fridayFloatingAdultExtraGuestCharge,
            fridayFloatingChildExtraGuestCharge: entities.fridayFloatingChildExtraGuestCharge,
            fridayFloatingInfantExtraGuestCharge: entities.fridayFloatingInfantExtraGuestCharge,
            fridayFloatingAdultExtraGuestChargeWithGST: entities.fridayFloatingAdultExtraGuestChargeWithGST,
            fridayFloatingChildExtraGuestChargeWithGST: entities.fridayFloatingChildExtraGuestChargeWithGST,
            fridayFloatingInfantExtraGuestChargeWithGST: entities.fridayFloatingInfantExtraGuestChargeWithGST,

            saturdayFloatingAdultExtraGuestCharge: entities.saturdayFloatingAdultExtraGuestCharge,
            saturdayFloatingChildExtraGuestCharge: entities.saturdayFloatingChildExtraGuestCharge,
            saturdayFloatingInfantExtraGuestCharge: entities.saturdayFloatingInfantExtraGuestCharge,
            saturdayFloatingAdultExtraGuestChargeWithGST: entities.saturdayFloatingAdultExtraGuestChargeWithGST,
            saturdayFloatingChildExtraGuestChargeWithGST: entities.saturdayFloatingChildExtraGuestChargeWithGST,
            saturdayFloatingInfantExtraGuestChargeWithGST: entities.saturdayFloatingInfantExtraGuestChargeWithGST,

            sundayFloatingAdultExtraGuestCharge: entities.sundayFloatingAdultExtraGuestCharge,
            sundayFloatingChildExtraGuestCharge: entities.sundayFloatingChildExtraGuestCharge,
            sundayFloatingInfantExtraGuestCharge: entities.sundayFloatingInfantExtraGuestCharge,
            sundayFloatingAdultExtraGuestChargeWithGST: entities.sundayFloatingAdultExtraGuestChargeWithGST,
            sundayFloatingChildExtraGuestChargeWithGST: entities.sundayFloatingChildExtraGuestChargeWithGST,
            sundayFloatingInfantExtraGuestChargeWithGST: entities.sundayFloatingInfantExtraGuestChargeWithGST,
            isDisabled: entities.isDisabled,

            bedroomCount: entities.bedroomCount,
            bathroomCount: entities.bathroomCount,
            doubleBedCount: entities.doubleBedCount,
            singleBedCount: entities.singleBedCount,
            mattressCount: entities.mattressCount,
            baseGuestCount: entities.baseGuestCount,
            maxGuestCount: entities.maxGuestCount,

            bookingType: entities.bookingType,
            defaultGstPercentage: entities.defaultGstPercentage,
            checkinTime: entities.checkinTime,
            checkoutTime: entities.checkoutTime,

            latitude: entities.latitude,
            longitude: entities.longitude,
            mapLink: entities.mapLink,

            address: entities.address,
            village: entities.village,
            areaId: entities.areaId,
            secondaryAreaId1: entities.secondaryAreaId1,
            secondaryAreaId2: entities.secondaryAreaId2,
            secondaryAreaId3: entities.secondaryAreaId3,
            secondaryAreaId4: entities.secondaryAreaId4,
            cityId: entities.cityId,
            stateId: entities.stateId,
            pincode: entities.pincode,
            propertyTypeId: entities.propertyTypeId,
            googlePlaceId: entities.googlePlaceId,
            googlePlaceRating: entities.googlePlaceRating,
            googlePlaceUserRatingCount: entities.googlePlaceUserRatingCount,
            googlePlaceReviews: entities.googlePlaceReviews,
            nearbyPlaces: entities.nearbyPlaces,

            slug: entities.slug,
            showOnInstafarms: entities.showOnInstafarms,
            showOnListing: entities.showOnListing,
            isPresentOnMago: entities.isPresentOnMago,
            propertyManagementType: entities.propertyManagementType,
            auditEnabled: entities.auditEnabled,
            maxAuditGapDays: entities.maxAuditGapDays,
            auditComplianceStatus: entities.auditComplianceStatus,
            bookingPolicy: entities.bookingPolicy,
            weight: entities.weight,
            jarvisSyncPropertyId: entities.jarvisSyncPropertyId,

            faqs: entities.faqs,
            meta: entities.meta,
            homeRulesTruths: entities.homeRulesTruths,
            // section: entities.sections, // TODO: Fix duplicate column error

            rateTypeId: entities.rateTypeId,
            roomTypeId: entities.roomTypeId,
            ratePlanId: entities.ratePlanId,

            createdAt: entities.createdAt,
            updatedAt: entities.updatedAt,
            createdBy: entities.createdBy,
            updatedBy: entities.updatedBy,
            adminCreatedBy: entities.adminCreatedBy,
            adminUpdatedBy: entities.adminUpdatedBy,

            // Location data from joins
            areaSlug: sql<string>`${areas.slug} `.as("areaSlug"),
            citySlug: sql<string>`${cities.slug} `.as("citySlug"),
            state: states.state,
            city: cities.city,
            area: areas.area,
            propertyTypeName: propertyTypes.name,

            // AGGREGATED DATA FROM LINKED PROPERTIES
            // For STANDALONE: uses entities.propertyId
            // For CLUBBED/SPLIT: uses UNION from entityProperties table

            // Special Dates: Entity-specific from entitySpecialDates table
            specialDates: sql<any[]>`
COALESCE(
  (SELECT json_agg(
    json_build_object(
      'id', esd.id,
      'date', esd."date",
      'price', esd.price,
      'adultExtraGuestCharge', esd."adultExtraGuestCharge",
      'childExtraGuestCharge', esd."childExtraGuestCharge",
      'infantExtraGuestCharge', esd."infantExtraGuestCharge",
      'baseGuestCount', esd."baseGuestCount",
      'discount', esd.discount
    ) ORDER BY esd."date"
  ) FROM "entitySpecialDates" esd
            WHERE esd."entityId" = ${entities.id}),
  '[]':: json
          )`.as("specialDates"),

            // Amenities: UNION from linked properties
            amenities: sql<
                {
                    id: string;
                    name: string;
                    icon: string;
                    weight: number;
                    type: "amenities";
                    paid?: number | null;
                    usp?: number | null;
                }[]
            >`
COALESCE(
  (SELECT json_agg(DISTINCT jsonb_build_object(
    'id', a.id,
    'name', a.name,
    'icon', a.icon,
    'weight', a.weight,
    'type', 'amenities',
    'paid', CASE WHEN a."isPaid" THEN 1 ELSE NULL END,
    'usp', CASE WHEN a."isUSP" THEN 1 ELSE NULL END
  ) ORDER BY jsonb_build_object(
    'id', a.id,
    'name', a.name,
    'icon', a.icon,
    'weight', a.weight,
    'type', 'amenities',
    'paid', CASE WHEN a."isPaid" THEN 1 ELSE NULL END,
    'usp', CASE WHEN a."isUSP" THEN 1 ELSE NULL END
  ))
            FROM amenities a
            JOIN "amenitiesOnProperties" aop ON a.id = aop."amenityId"
            WHERE aop."propertyId" = ANY(
    CASE 
                WHEN ${entities.entityType} = 'STANDALONE' THEN ARRAY[${entities.propertyId}]
    ELSE ARRAY(SELECT ep."propertyId" FROM "entityProperties" ep WHERE ep."entityId" = ${entities.id})
              END
  )),
  '[]':: json
          )
`.as("amenities"),

            // Activities: UNION from linked properties
            activities: sql<
                {
                    id: string;
                    name: string;
                    icon: string;
                    weight: number;
                    type: "activities";
                    paid?: number | null;
                    usp?: number | null;
                }[]
            >`
COALESCE(
  (SELECT json_agg(DISTINCT jsonb_build_object(
    'id', act.id,
    'name', act.name,
    'icon', act.icon,
    'weight', act.weight,
    'type', 'activities',
    'paid', CASE WHEN act."isPaid" THEN 1 ELSE NULL END,
    'usp', CASE WHEN act."isUSP" THEN 1 ELSE NULL END
  ) ORDER BY jsonb_build_object(
    'id', act.id,
    'name', act.name,
    'icon', act.icon,
    'weight', act.weight,
    'type', 'activities',
    'paid', CASE WHEN act."isPaid" THEN 1 ELSE NULL END,
    'usp', CASE WHEN act."isUSP" THEN 1 ELSE NULL END
  ))
            FROM activities act
            JOIN "activitiesOnProperties" acop ON act.id = acop."activityId"
            WHERE acop."propertyId" = ANY(
    CASE 
                WHEN ${entities.entityType} = 'STANDALONE' THEN ARRAY[${entities.propertyId}]
    ELSE ARRAY(SELECT ep."propertyId" FROM "entityProperties" ep WHERE ep."entityId" = ${entities.id})
              END
  )),
  '[]':: json
          )
`.as("activities"),

            // Safety & Hygiene: UNION from linked properties
            safetyHygiene: sql<
                {
                    id: string;
                    name: string;
                    icon: string;
                }[]
            >`
COALESCE(
  (SELECT json_agg(DISTINCT jsonb_build_object(
    'id', sh.id,
    'name', sh.name,
    'icon', sh.icon
  ) ORDER BY jsonb_build_object(
    'id', sh.id,
    'name', sh.name,
    'icon', sh.icon
  ))
            FROM "safetyHygiene" sh
            JOIN "safetyHygieneOnProperties" shop ON sh.id = shop."safetyHygieneId"
            WHERE shop."propertyId" = ANY(
    CASE 
                WHEN ${entities.entityType} = 'STANDALONE' THEN ARRAY[${entities.propertyId}]
    ELSE ARRAY(SELECT ep."propertyId" FROM "entityProperties" ep WHERE ep."entityId" = ${entities.id})
              END
  )),
  '[]':: json
          )
`.as("safetyHygiene"),

            // Gallery: UNION from linked properties
            //       gallery: sql<
            //         {
            //           id: string;
            //           url: string;
            //           thumbnail: string | null;
            //           name: string;
            //           order: number;
            //           altText: string | null;
            //           cover: number | null;
            //           waterMarked: boolean;
            //           tag: string | null;
            //         }[]
            //       >`
            //   COALESCE(
            //     (SELECT json_agg(
            //       json_build_object(
            //         'id', p.id,
            //         'url', p."watermarkedUrlByInstafarms",
            //         'thumbnail', p."watermarkedUrlByInstafarms",
            //         'name', p."name",
            //         'order', ep."sortOrder",
            //         'altText', p."instafarmsAltText",
            //         'cover', ep."sortOrder",
            //         'waterMarked', false,
            //         'tag', ep."category"
            //       ) ORDER BY ep."sortOrder"
            //     ) FROM photos p
            //     JOIN "entityPhotos" ep ON p.id = ep."photoId"
            //     WHERE ep."entityId" = ${entities.id}),
            //     '[]'::json
            //   )
            // `.as("gallery"),

            gallery: sql<
                {
                    id: string;
                    url: string;
                    originalUrl: string;
                    name: string;
                    order: number;
                    altText: string | null;
                    cover: number | null;
                    waterMarked: boolean;
                    tag: string | null;
                }[]
            >`
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', p.id,
                'url', p."watermarkedUrlByInstafarms",
                'originalUrl', p."originalUrl",
                'name', p."name",
                'order', ep."sortOrder",
                'altText', p."instafarmsAltText",
                'cover', ep."sortOrder",
                'waterMarked', false, 
                'tag', ep."category"
              ) ORDER BY ep."sortOrder"
            ) FROM photos p
            JOIN "entityPhotos" ep ON p.id = ep."photoId"
            WHERE ep."entityId" = ${entities.id}),
            '[]'::json
          )
        `.as("gallery"),

            coverPhotos: entities.coverPhotos,
            // Featured Image: first image from coverPhotos snapshot
            featuredImage: sql<{
                url: string;
                altText: string | null;
            }>`
          (SELECT json_build_object(
            'url', COALESCE(cp.photo->>'gridUrl', cp.photo->>'thumbnailUrl'),
            'altText', NULLIF(cp.photo->>'altText', '')
          )
          FROM jsonb_array_elements(COALESCE(${entities.coverPhotos}, '[]'::jsonb))
            WITH ORDINALITY AS cp(photo, ord)
          WHERE COALESCE(cp.photo->>'gridUrl', cp.photo->>'thumbnailUrl') IS NOT NULL
          ORDER BY cp.ord
          LIMIT 1)
        `.as("featuredImage"),

            // Mini Gallery: Up to 5 images prioritizing Outdoors > Indoors > Others
            miniGallery: sql<
                {
                    id: string;
                    url: string;
                    originalUrl: string;
                    thumbnail: string | null;
                    name: string;
                    order: number;
                    altText: string | null;
                    tag: string | null;
                }[]
            >`
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', sub.id,
                'originalUrl', sub."originalUrl",
                'url', sub."watermarkedUrlByInstafarms",
                'name', sub."name",
                'order', sub."sortOrder",
                'altText', sub."instafarmsAltText",
                'tag', sub."category"
              )
            ) FROM (
              SELECT 
                p.id,
                p."originalUrl",
                p."watermarkedUrlByInstafarms",
                p."name",
                p."instafarmsAltText",
                ep."sortOrder",
                ep."category",
                CASE 
                  WHEN ep."category" = 'OUTDOORS' THEN 1
                  WHEN ep."category" = 'INDOORS' THEN 2
                  ELSE 3
                END as tag_priority
              FROM photos p
              JOIN "entityPhotos" ep ON p.id = ep."photoId"
              WHERE ep."entityId" = ${entities.id}
              ORDER BY 
                CASE 
                  WHEN ep."category" = 'OUTDOORS' THEN 1
                  WHEN ep."category" = 'INDOORS' THEN 2
                  ELSE 3
                END,
                ep."sortOrder"
              LIMIT 5
            ) AS sub),
            '[]'::json
          )
        `.as("miniGallery"),

            // Spaces: UNION from linked properties
            spaces: sql<any[]>`
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', sp.id,
                'name', sp.name,
                'photo', p."watermarkedUrlByInstafarms",
                'title', sp.title,
                'description', sp.description
              ) ORDER BY sp."createdAt"
            ) FROM "spaceProperties" sp
            JOIN photos p ON sp."photoId" = p.id
            WHERE sp."propertyId" = ANY(
              CASE 
                WHEN ${entities.entityType} = 'STANDALONE' THEN ARRAY[${entities.propertyId}]
                ELSE ARRAY(SELECT ep."propertyId" FROM "entityProperties" ep WHERE ep."entityId" = ${entities.id})
              END
            )),
            '[]'::json
          )
        `.as("spaces"),

            // Blocked Dates: Entity-specific from entityBlockedDates
            bookedDates: sql<string[]>`
        COALESCE(
          (SELECT json_agg(ebd."blockedDate")
            FROM "entityBlockedDates" ebd
            WHERE ebd."entityId" = ${entities.id}
          ),
          '[]'
        )
      `.as("bookedDates"),

            // Discount Plan: From first linked property (STANDALONE uses propertyId, others use first from entityProperties)
            discountPlan: sql<{
                id: string;
                name: string;
                discounts: {
                    id: string;
                    minDays: number;
                    discountPercentage: number | null;
                    flatDiscount: number | null;
                }[];
            }>`
          (SELECT json_build_object(
            'id', dp.id,
            'name', dp.name,
            'discounts', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', dpv.id,
                    'minDays', dpv."minDays",
                    'discountPercentage', dpv."discountPercentage",
                    'flatDiscount', dpv."flatDiscount"
                  ) ORDER BY dpv."minDays"
                )
                FROM "discountPlansValues" dpv
                WHERE dpv."discountPlanId" = dp.id
              ),
              '[]'::json
            )
          ) FROM "propertyDiscountPlans" pdp
          JOIN "discountPlans" dp ON pdp."discountPlanId" = dp.id
          WHERE pdp."propertyId" = (
            CASE 
              WHEN ${entities.entityType} = 'STANDALONE' THEN ${entities.propertyId}
              ELSE (SELECT ep."propertyId" FROM "entityProperties" ep WHERE ep."entityId" = ${entities.id} LIMIT 1)
            END
          ) LIMIT 1)
        `.as("discountPlan"),

            // Manager: From first linked property
            manager: sql<{
                id: string;
                name: string;
                email: string;
                phone: string;
            }>`
          (SELECT json_build_object(
            'id', u.id,
            'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
            'email', u.email,
            'phone', u."mobileNumber"
          ) FROM users u
          JOIN "managersOnProperties" mop ON u.id = mop."managerId"
          WHERE mop."propertyId" = (
            CASE 
              WHEN ${entities.entityType} = 'STANDALONE' THEN ${entities.propertyId}
              ELSE (SELECT ep."propertyId" FROM "entityProperties" ep WHERE ep."entityId" = ${entities.id} LIMIT 1)
            END
          ) LIMIT 1)
        `.as("manager"),

            // Caretaker: From first linked property
            caretaker: sql<{
                id: string;
                name: string;
                email: string;
                phone: string;
            }>`
          (SELECT json_build_object(
            'id', u.id,
            'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
            'email', u.email,
            'phone', u."mobileNumber"
          ) FROM users u
          JOIN "caretakersOnProperties" cop ON u.id = cop."caretakerId"
          WHERE cop."propertyId" = (
            CASE 
              WHEN ${entities.entityType} = 'STANDALONE' THEN ${entities.propertyId}
              ELSE (SELECT ep."propertyId" FROM "entityProperties" ep WHERE ep."entityId" = ${entities.id} LIMIT 1)
            END
          ) LIMIT 1)
        `.as("caretaker"),

            // Owner: From first linked property
            owner: sql<{
                id: string;
                name: string;
                email: string;
                phone: string;
            }>`
          (SELECT json_build_object(
            'id', u.id,
            'name', CONCAT(u."firstName", ' ', COALESCE(u."lastName", '')),
            'email', u.email,
            'phone', u."mobileNumber"
          ) FROM users u
          JOIN "ownersOnProperties" oop ON u.id = oop."ownerId"
          WHERE oop."propertyId" = (
            CASE 
              WHEN ${entities.entityType} = 'STANDALONE' THEN ${entities.propertyId}
              ELSE (SELECT ep."propertyId" FROM "entityProperties" ep WHERE ep."entityId" = ${entities.id} LIMIT 1)
            END
          ) LIMIT 1)
        `.as("owner"),

            // Cancellation Plans: Directly from entityCancellationPlans
            shortTermCancellationPlan: sql<{
                id: string;
                name: string;
                isActive: boolean;
            }>`
          (SELECT json_build_object(
            'id', ecp."cancellationPlanId",
            'name', cp.name,
            'isActive', cp."isActive",
            'policy', ecp.policy,
            'refunds', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', cpp.id,
                    'lessThan', cpp."lessThan",
                    'days', cpp."days",
                    'percentage', cpp."percentage"
                  ) ORDER BY cpp."days"
                )
                FROM "cancellationPercentages" cpp
                WHERE cpp."cancellationPlanId" = cp.id
              ),
              '[]'::json
            )
          ) FROM "entityCancellationPlans" ecp
          JOIN "cancellationPlans" cp ON ecp."cancellationPlanId" = cp.id
          WHERE ecp."entityId" = ${entities.id} AND ecp.type = 'shortterm' LIMIT 1)
        `.as("shortTermCancellationPlan"),

            longTermCancellationPlan: sql<{
                id: string;
                name: string;
                isActive: boolean;
            }>`
          (SELECT json_build_object(
            'id', ecp."cancellationPlanId",
            'name', cp.name,
            'isActive', cp."isActive",
            'policy', ecp.policy,
            'refunds', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', cpp.id,
                    'lessThan', cpp."lessThan",
                    'days', cpp."days",
                    'percentage', cpp."percentage"
                  ) ORDER BY cpp."days"
                )
                FROM "cancellationPercentages" cpp
                WHERE cpp."cancellationPlanId" = cp.id
              ),
              '[]'::json
            )
          ) FROM "entityCancellationPlans" ecp
          JOIN "cancellationPlans" cp ON ecp."cancellationPlanId" = cp.id
          WHERE ecp."entityId" = ${entities.id} AND ecp.type = 'longterm' LIMIT 1)
        `.as("longTermCancellationPlan"),

            // Collections: Array of collection names this entity belongs to
            collections: sql<string[]>`
          COALESCE(
            (SELECT array_agg(c.name ORDER BY c.name)
             FROM "collectionEntities" ce
             JOIN collections c ON ce."collectionId" = c.id
             WHERE ce."entityId" = ${entities.id}),
            ARRAY[]::text[]
          )
        `.as("collections"),
        })

        .from(entities)
        .leftJoin(areas, eq(entities.areaId, areas.id))
        .leftJoin(cities, eq(areas.cityId, cities.id))
        .leftJoin(states, eq(cities.stateId, states.id))
        .leftJoin(propertyTypes, eq(entities.propertyTypeId, propertyTypes.id))
);

export const areaDetailView = pgView("areaDetailView").as((qb) =>
    qb
        .select({
            id: areas.id,
            area: areas.area,
            weight: areas.weight,
            featured: areas.featured,
            isActive: areas.isActive,
            slug: areas.slug,
            stateId: cities.stateId,
            cityId: areas.cityId,
            createdAt: areas.createdAt,
            updatedAt: areas.updatedAt,
            adminCreatedBy: areas.adminCreatedBy,
            adminUpdatedBy: areas.adminUpdatedBy,

            state: states.state,
            stateSlug: sql<string>`${states.slug}`.as("stateSlug"),
            city: cities.city,
            citySlug: sql<string>`${cities.slug}`.as("citySlug"),

            faqs: areas.faqs,

            metadata: areas.meta,
            information: areas.areaInfo,
        })
        .from(areas)
        .leftJoin(cities, eq(areas.cityId, cities.id))
        .leftJoin(states, eq(cities.stateId, states.id))
);

// New listing system tables

export const listingUsers = pgTable("listingUsers", {
    id: uuid("id").primaryKey().defaultRandom(),
    mobileNumber: varchar("mobileNumber", { length: 256 }).notNull(),
    name: text("name").notNull(),
    email: varchar("email", { length: 256 }),
    gender: genderEnum("gender"),
    whatsappNumber: varchar("whatsappNumber", { length: 256 }),
    ...timestamps,
}, (table) => [
    index("listing_users_mobile_number_idx").on(table.mobileNumber),
    index("listing_users_email_idx").on(table.email),
]);

export const contactEnquiry = pgTable("contactEnquiry", {
    id: uuid("id").primaryKey().defaultRandom(),
    listingUserId: uuid("listingUserId")
        .notNull()
        .references(() => listingUsers.id, {
            onDelete: "cascade",
        }),
    propertyId: uuid("propertyId")
        .notNull()
        .references(() => properties.id, {
            onDelete: "cascade",
        }),
    // NEW: Entity-level enquiry support
    entityId: uuid("entityId").references(() => entities.id, {
        onDelete: "cascade",
    }),
    guestSize: integer("guestSize").notNull(),
    gatheringType: gatheringTypeEnum("gatheringType").notNull(),
    checkInDate: date("checkInDate", { mode: "string" }).notNull(),
    checkOutDate: date("checkOutDate", { mode: "string" }).notNull(),
    ...timestamps,
}, (table) => [
    check("guest_size_positive", sql`"guestSize" > 0`),
    check("checkout_after_checkin_contact", sql`"checkOutDate" > "checkInDate"`),
    index("contact_enquiry_listing_user_id_idx").on(table.listingUserId),
    index("contact_enquiry_property_id_idx").on(table.propertyId),
    index("contact_enquiry_created_at_idx").on(table.createdAt),
]);

export const viewEnquiry = pgTable("viewEnquiry", {
    id: uuid("id").primaryKey().defaultRandom(),
    listingUserId: uuid("listingUserId")
        .notNull()
        .references(() => listingUsers.id, {
            onDelete: "cascade",
        }),
    propertyId: uuid("propertyId")
        .notNull()
        .references(() => properties.id, {
            onDelete: "cascade",
        }),
    // NEW: Entity-level view tracking support
    entityId: uuid("entityId").references(() => entities.id, {
        onDelete: "cascade",
    }),
    eventType: eventTypeEnum("eventType").notNull(),
    eventMetadata: jsonb("eventMetadata").default(sql`'{}'::jsonb`),
    ...timestamps,
}, (table) => [
    index("view_enquiry_listing_user_id_idx").on(table.listingUserId),
    index("view_enquiry_property_id_idx").on(table.propertyId),
    index("view_enquiry_event_type_idx").on(table.eventType),
    index("view_enquiry_created_at_idx").on(table.createdAt),
]);

export const searchQuery = pgTable("searchQuery", {
    id: uuid("id").primaryKey().defaultRandom(),
    listingUserId: uuid("listingUserId")
        .notNull()
        .references(() => listingUsers.id, {
            onDelete: "cascade",
        }),
    areaId: uuid("areaId").references(() => areas.id, {
        onDelete: "set null",
    }),
    cityId: uuid("cityId").references(() => cities.id, {
        onDelete: "set null",
    }),
    stateId: uuid("stateId").references(() => states.id, {
        onDelete: "set null",
    }),
    guestCount: integer("guestCount"),
    budgetMin: integer("budgetMin"),
    budgetMax: integer("budgetMax"),
    totalResults: integer("totalResults"),
    ...timestamps,
}, (table) => [
    check("guest_count_positive", sql`"guestCount" IS NULL OR "guestCount" > 0`),
    check("budget_min_positive", sql`"budgetMin" IS NULL OR "budgetMin" >= 0`),
    check("budget_max_positive", sql`"budgetMax" IS NULL OR "budgetMax" >= 0`),
    check("budget_max_greater_min", sql`"budgetMax" IS NULL OR "budgetMin" IS NULL OR "budgetMax" >= "budgetMin"`),
    check("total_results_positive", sql`"totalResults" IS NULL OR "totalResults" >= 0`),
    index("search_query_listing_user_id_idx").on(table.listingUserId),
    index("search_query_area_id_idx").on(table.areaId),
    index("search_query_city_id_idx").on(table.cityId),
    index("search_query_state_id_idx").on(table.stateId),
    index("search_query_created_at_idx").on(table.createdAt),
]);

export const whatsappLog = pgTable("whatsappLog", {
    id: uuid("id").primaryKey().defaultRandom(),
    contactEnquiryId: uuid("contactEnquiryId")
        .notNull()
        .references(() => contactEnquiry.id, {
            onDelete: "cascade",
        }),
    messageBody: text("messageBody").notNull(),
    status: whatsappStatusEnum("status").notNull().default("PENDING"),
    sentAt: timestamp("sentAt", { withTimezone: true, mode: "string" }),
    deliveredAt: timestamp("deliveredAt", { withTimezone: true, mode: "string" }),
    failedReason: text("failedReason"),
    toUserId: uuid("toUserId")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),
    ...timestamps,
}, (table) => [
    index("whatsapp_log_contact_enquiry_id_idx").on(table.contactEnquiryId),
    index("whatsapp_log_status_idx").on(table.status),
    index("whatsapp_log_to_user_id_idx").on(table.toUserId),
    index("whatsapp_log_created_at_idx").on(table.createdAt),
]);

// adding new bank related tables can be removed later

export const bankDetails = pgTable("bankDetails", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    accountHolderName: text("accountHolderName").notNull(),
    accountNumber: varchar("accountNumber", { length: 32 }).notNull(),
    ifscCode: varchar("ifscCode", { length: 20 }).notNull(),
    bankName: text("bankName").notNull(),
    branch: text("branch"),
    createdAt: timestamp("createdAt").defaultNow(),
});


export const bankDetailsOnProperties = pgTable("bankDetailsOnProperties", {
    bankDetailId: uuid("bankDetailId")
        .notNull()
        .references(() => bankDetails.id, { onDelete: "cascade" }),
    propertyId: uuid("propertyId")
        .notNull()
        .references(() => properties.id, { onDelete: "cascade" }),
}, (table) => ({
    pk: primaryKey({ columns: [table.bankDetailId, table.propertyId] }),
}));

export const recentlyVisited = pgTable(
    "recentlyVisited",
    {
        id: uuid("id").notNull().primaryKey().defaultRandom(),
        userIdentifier: text("userIdentifier").notNull(), // Can be documentId (logged-in) or visitorId (non-logged-in)
        // Entity change update: Made propertyId nullable to support entity-level tracking
        propertyId: uuid("propertyId").references(() => properties.id, {
            onDelete: "cascade",
        }),
        // NEW: Entity-level visit tracking support
        entityId: uuid("entityId").references(() => entities.id, {
            onDelete: "cascade",
        }),
        visitedAt: timestamp("visitedAt", {
            withTimezone: true,
            mode: "string",
        })
            .notNull()
            .defaultNow(),
        ...timestamps,
    },
    (table) => [
        // Entity change update: Ensure at least one of propertyId or entityId is provided
        check(
            "property_or_entity_required",
            sql`"propertyId" IS NOT NULL OR "entityId" IS NOT NULL`
        ),
        index("recentlyVisited_userIdentifier_idx").on(table.userIdentifier),
        index("recentlyVisited_visitedAt_idx").on(table.visitedAt),
        index("recentlyVisited_entityId_idx").on(table.entityId),
        // Entity change update: Keep old unique constraint for backward compatibility
        unique("recentlyVisited_userIdentifier_propertyId_unique").on(
            table.userIdentifier,
            table.propertyId
        ),
        // Entity change update: Add new unique constraint for entity-level tracking
        unique("recentlyVisited_userIdentifier_entityId_unique").on(
            table.userIdentifier,
            table.entityId
        ),
    ]
);

export const recentSearches = pgTable(
    "recentSearches",
    {
        id: uuid("id").notNull().primaryKey().defaultRandom(),
        userIdentifier: text("userIdentifier").notNull(), // Can be documentId (logged-in) or visitorId (non-logged-in)
        location: text("location"), // Location name or slug
        checkInDate: date("checkInDate", { mode: "string" }),
        checkOutDate: date("checkOutDate", { mode: "string" }),
        adults: integer("adults").default(0),
        children: integer("children").default(0),
        infants: integer("infants").default(0),
        pets: integer("pets").default(0),
        searchedAt: timestamp("searchedAt", {
            withTimezone: true,
            mode: "string",
        })
            .notNull()
            .defaultNow(),
        ...timestamps,
    },
    (table) => [
        index("recentSearches_userIdentifier_idx").on(table.userIdentifier),
        index("recentSearches_searchedAt_idx").on(table.searchedAt),
    ]
);

// Notifications schema

/** Event types catalog: add new types by inserting rows (no enum migration needed). */
export const notificationEventTypes = pgTable("notification_event_types", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
    index("notification_event_types_name_idx").on(table.name),
]);

export const notificationRecipientRoleEnum = pgEnum("notificationRecipientRoleEnum", [
    "customer",
    "owner",
    "manager",
    "caretaker",
    "admin",
    "user", // Generic user (not owner/manager/caretaker/admin)
]);

// Notification Templates Table (consolidated for all channels)
export const notificationTemplates = pgTable("notification_templates", {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: text("channel").notNull(), // "email", "whatsapp", "sms", "app"
    eventTypeId: uuid("eventTypeId").references(() => notificationEventTypes.id, { onDelete: "restrict" }).notNull(),
    recipientRole: notificationRecipientRoleEnum("recipientRole"), // NULL means template applies to all roles
    templateName: text("templateName").notNull(),
    subject: text("subject"), // Required for email, NULL for other channels
    title: text("title"), // Required for app/push, NULL for other channels
    body: text("body").notNull(),
    variables: jsonb("variables").$type<Record<string, string>>(),
    isActive: boolean("isActive").notNull().default(true),
    version: integer("version").notNull().default(1),
    language: text("language").notNull().default("en"),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
    // Channel-specific constraints
    check('email_subject_check', sql`(channel = 'email' AND subject IS NOT NULL) OR (channel != 'email')`),
    check('app_title_check', sql`(channel = 'app' AND title IS NOT NULL) OR (channel != 'app')`),
    check('channel_check', sql`channel IN ('email', 'whatsapp', 'sms', 'app')`),
    check('body_not_empty', sql`LENGTH(TRIM(body)) > 0`),
    index("notification_templates_channel_idx").on(table.channel),
    index("notification_templates_event_type_id_idx").on(table.eventTypeId),
    index("notification_templates_recipient_role_idx").on(table.recipientRole),
    index("notification_templates_is_active_idx").on(table.isActive),
    // Composite index for efficient template lookup
    index("notification_templates_lookup_idx").on(table.channel, table.eventTypeId, table.recipientRole, table.isActive),
]);

// Delivery Log Table (consolidated for all channels)
export const notificationDeliveryLog = pgTable("notification_delivery_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: text("channel").notNull(), // "email", "whatsapp", "sms", "app"
    queueId: text("queueId").notNull(), // BullMQ job ID
    recipientType: notificationRecipientRoleEnum("recipientType").notNull(), // "customer", "owner", "manager", "caretaker", "admin", "user"
    // Note: recipientId is intentionally without FK constraint due to polymorphism
    // It can reference customers.id, users.id, or admins.id depending on recipientType
    recipientId: uuid("recipientId").notNull(),
    notificationType: text("notificationType"), // Event type name (from template's event type) for logging
    templateId: uuid("templateId").references(() => notificationTemplates.id, {
        onDelete: "set null",
    }),
    // Link to booking (nullable for non-booking notifications)
    bookingId: uuid("bookingId").references(() => bookings.id, {
        onDelete: "cascade",
    }),
    // Link to event log for tracking which event triggered this notification
    notificationEventLogId: uuid("notificationEventLogId").references(() => notificationEventLog.id, {
        onDelete: "set null",
    }),
    subject: text("subject"), // For email
    title: text("title"), // For push notifications
    body: text("body"), // The actual message sent
    status: text("status").notNull(), // "sent", "failed", "pending", "delivered", "bounced"
    providerResponse: jsonb("providerResponse"),
    errorMessage: text("errorMessage"),
    deliveredAt: timestamp("deliveredAt", { mode: "string" }),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
    index("notification_delivery_log_channel_idx").on(table.channel),
    index("notification_delivery_log_status_idx").on(table.status),
    index("notification_delivery_log_recipient_id_idx").on(table.recipientId),
    index("notification_delivery_log_created_at_idx").on(table.createdAt),
    index("notification_delivery_log_template_id_idx").on(table.templateId),
    index("notification_delivery_log_booking_id_idx").on(table.bookingId),
    index("notification_delivery_log_event_log_id_idx").on(table.notificationEventLogId),
]);

// Dead Letter Queue Table
export const notificationDeadLetterQueue = pgTable("notification_dead_letter_queue", {
    id: uuid("id").primaryKey().defaultRandom(),
    queueName: text("queueName").notNull(),
    jobId: text("jobId").notNull().unique(),
    jobData: jsonb("jobData").$type<Record<string, any>>().notNull(),
    errorMessage: text("errorMessage").notNull(),
    attemptsMade: integer("attemptsMade").notNull(),
    failedAt: timestamp("failedAt", { mode: "string" }).notNull(),
    resolvedAt: timestamp("resolvedAt", { mode: "string" }),
    resolution: text("resolution"),
    // Link to booking (nullable for non-booking notifications)
    bookingId: uuid("bookingId").references(() => bookings.id, {
        onDelete: "cascade",
    }),
    // Link to event log for tracking which event triggered this failed notification
    notificationEventLogId: uuid("notificationEventLogId").references(() => notificationEventLog.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
    index("notification_dead_letter_queue_queue_name_idx").on(table.queueName),
    index("notification_dead_letter_queue_failed_at_idx").on(table.failedAt),
    index("notification_dead_letter_queue_booking_id_idx").on(table.bookingId),
    index("notification_dead_letter_queue_event_log_id_idx").on(table.notificationEventLogId),
]);

// Event Log Table (for deduplication and replay)
export const notificationEventLog = pgTable("notification_event_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: text("eventId").notNull().unique(), // Unique event identifier
    eventType: text("eventType").notNull(),
    recipients: jsonb("recipients").$type<Array<{ id: string; type: 'customer' | 'owner' | 'manager' | 'caretaker' | 'admin' | 'user' }>>().notNull(),
    data: jsonb("data").$type<Record<string, any>>().notNull(),
    status: text("status").notNull(), // "pending", "processing", "completed", "failed"
    // Link to booking (nullable for non-booking notifications)
    bookingId: uuid("bookingId").references(() => bookings.id, {
        onDelete: "cascade",
    }),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
    index("notification_event_log_event_id_idx").on(table.eventId),
    index("notification_event_log_status_idx").on(table.status),
    index("notification_event_log_created_at_idx").on(table.createdAt),
    index("notification_event_log_booking_id_idx").on(table.bookingId),
]);

// ============================================================================
// GLOBAL CONSTANTS TABLE
// ============================================================================
// Stores system-wide configuration values that can be managed via admin panel
export const globalConstants = pgTable(
    "globalConstants",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        key: text("key").notNull().unique(),
        value: text("value").notNull(),
        description: text("description"),
        dataType: text("dataType").notNull().default("string"), // string, number, boolean, json
        isActive: boolean("isActive").notNull().default(true),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("global_constants_key_idx").on(table.key),
        index("global_constants_is_active_idx").on(table.isActive),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

// NON-INSTANT BOOKING

export const bookingConfirmations = pgTable(
    "bookingConfirmations",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        bookingId: uuid("bookingId")
            .notNull()
            .unique()
            .references(() => bookings.id, {
                onDelete: "cascade",
            }),

        status: bookingConfirmationStatusEnum("status")
            .notNull()
            .default("PENDING"),

        requestedAt: timestamp("requestedAt", {
            withTimezone: true,
            mode: "string",
        }).notNull().defaultNow(),

        confirmedAt: timestamp("confirmedAt", {
            withTimezone: true,
            mode: "string",
        }),

        rejectedAt: timestamp("rejectedAt", {
            withTimezone: true,
            mode: "string",
        }),

        expiresAt: timestamp("expiresAt", {
            withTimezone: true,
            mode: "string",
        }).notNull(),

        // 1. Create a specific column for User
        confirmedByUserId: uuid("confirmedByUserId").references(() => users.id),
        rejectedByUserId: uuid("rejectedByUserId").references(() => users.id),

        // 2. Create a specific column for Admin
        confirmedByAdminId: uuid("confirmedByAdminId").references(() => admins.id),
        rejectedByAdminId: uuid("rejectedByAdminId").references(() => admins.id),

        rejectionReason: text("rejectionReason"),

        requestNotificationSent: boolean("requestNotificationSent")
            .notNull()
            .default(false),
        reminderNotificationSent: boolean("reminderNotificationSent")
            .notNull()
            .default(false),
        confirmationNotificationSent: boolean("confirmationNotificationSent")
            .notNull()
            .default(false),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        index("booking_confirmations_booking_id_idx").on(table.bookingId),
        index("booking_confirmations_status_idx").on(table.status),
        index("booking_confirmations_expires_at_idx").on(table.expiresAt),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

// ADVANCE PAYMENT

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
            .references(() => payments.id),
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

// ROOM-WISE PRICING & FLOATING GUESTS

export const rooms = pgTable(
    "rooms",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        propertyId: uuid("propertyId").references(() => properties.id, {
            onDelete: "cascade",
        }),
        entityId: uuid("entityId").references(() => entities.id, {
            onDelete: "cascade",
        }),

        roomName: text("roomName").notNull(),
        roomNumber: text("roomNumber"),

        selectionPriority: integer("selectionPriority").notNull(),

        hasAttachedBathroom: boolean("hasAttachedBathroom").notNull().default(false),
        isAirConditioned: boolean("isAirConditioned").notNull().default(false),
        floorNumber: integer("floorNumber"),

        beddingType: beddingTypeEnum("beddingType").notNull(),
        beddingCount: integer("beddingCount").notNull().default(1),

        maxGuestCount: integer("maxGuestCount").notNull(),

        isActive: boolean("isActive").notNull().default(true),

        description: text("description"),
        sortOrder: integer("sortOrder").default(0),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check(
            "property_or_entity",
            sql`("propertyId" IS NOT NULL AND "entityId" IS NULL) OR 
          ("propertyId" IS NULL AND "entityId" IS NOT NULL)`
        ),
        check("max_guest_positive", sql`"maxGuestCount" > 0`),
        check("bedding_count_positive", sql`"beddingCount" > 0`),
        check("selection_priority_positive", sql`"selectionPriority" > 0`),

        index("rooms_property_id_idx").on(table.propertyId),
        index("rooms_entity_id_idx").on(table.entityId),
        index("rooms_selection_priority_idx").on(table.selectionPriority),
        index("rooms_is_active_idx").on(table.isActive),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);

export const roomBasedPricingTiers = pgTable(
    "roomBasedPricingTiers",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        propertyId: uuid("propertyId").references(() => properties.id, {
            onDelete: "cascade",
        }),
        entityId: uuid("entityId").references(() => entities.id, {
            onDelete: "cascade",
        }),

        numberOfRooms: integer("numberOfRooms").notNull(),
        totalPrice: integer("totalPrice").notNull(),
        weekendPrice: integer("weekendPrice"),

        isActive: boolean("isActive").notNull().default(true),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check(
            "property_or_entity_tier",
            sql`("propertyId" IS NOT NULL AND "entityId" IS NULL) OR 
          ("propertyId" IS NULL AND "entityId" IS NOT NULL)`
        ),
        check("number_of_rooms_positive", sql`"numberOfRooms" > 0`),
        check("total_price_positive", sql`"totalPrice" >= 0`),
        check("weekend_price_positive", sql`"weekendPrice" IS NULL OR "weekendPrice" >= 0`),

        unique("property_rooms_unique").on(table.propertyId, table.numberOfRooms),
        unique("entity_rooms_unique").on(table.entityId, table.numberOfRooms),

        index("room_pricing_tiers_property_id_idx").on(table.propertyId),
        index("room_pricing_tiers_entity_id_idx").on(table.entityId),
        index("room_pricing_tiers_num_rooms_idx").on(table.numberOfRooms),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);



export const bookingRooms = pgTable(
    "bookingRooms",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        bookingId: uuid("bookingId")
            .notNull()
            .references(() => bookings.id, {
                onDelete: "cascade",
            }),
        roomId: uuid("roomId")
            .notNull()
            .references(() => rooms.id, {
                onDelete: "cascade",
            }),

        guestCount: integer("guestCount").notNull(),

        ...timestamps,
        ...adminOrUserUpdateReference,
    },
    (table) => [
        check("guest_count_positive", sql`"guestCount" > 0`),

        index("booking_rooms_booking_id_idx").on(table.bookingId),
        index("booking_rooms_room_id_idx").on(table.roomId),
        setUserOrAdminUpdatedByConstraint(table),
    ]
);


export const proposals = pgTable("proposals", {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").unique().notNull(), // for public access
    status: text("status").notNull().default("DRAFT"), // DRAFT, PUBLISHED
    validTill: timestamp("validTill", { withTimezone: true, mode: "string" }),

    customerId: uuid("customerId").references(() => customers.id, { onDelete: "cascade" }),

    checkinDate: date("checkinDate"),
    checkoutDate: date("checkoutDate"),
    adultCount: integer("adultCount").default(0),
    childrenCount: integer("childrenCount").default(0),
    infantCount: integer("infantCount").default(0),
    floatingAdultCount: integer("floatingAdultCount").default(0),
    floatingChildrenCount: integer("floatingChildrenCount").default(0),
    floatingInfantCount: integer("floatingInfantCount").default(0),

    notes: text("notes"), // Internal notes
    ...timestamps,
    ...adminUpdateReference, // Contains adminCreatedBy (created by) and adminUpdatedBy
});

export const proposalItems = pgTable("proposalItems", {
    id: uuid("id").primaryKey().defaultRandom(),
    proposalId: uuid("proposalId").notNull().references(() => proposals.id, { onDelete: "cascade" }),
    propertyId: uuid("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
    ...timestamps,
}, (table) => [
    index("proposal_items_proposal_id_idx").on(table.proposalId),
]);

// Property Audit System - Property Areas & Audit Sessions
export const propertyAuditAreas = pgTable("propertyAuditAreas", {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
    entityId: uuid("entityId").references(() => entities.id, { onDelete: "cascade" }),
    areaCategoryId: uuid("areaCategoryId").notNull().references(() => propertyAuditAreaCategoryMaster.id),
    areaName: text("areaName").notNull(),
    weight: integer("weight").notNull(),
    isSystemArea: boolean("isSystemArea").notNull().default(false),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const checklistItemMaster = pgTable("checklistItemMaster", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    itemType: itemTypeEnum("itemType").notNull(),
    categoryId: uuid("categoryId").notNull().references(() => checklistCategoryMaster.id),
    defaultPhotoRequirementType: photoRequirementTypeEnum("defaultPhotoRequirementType").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const inventoryChecklistItems = pgTable("inventoryChecklistItems", {
    id: uuid("id").primaryKey().defaultRandom(),
    checklistItemMasterId: uuid("checklistItemMasterId").notNull().references(() => checklistItemMaster.id),
    propertyAuditAreaId: uuid("propertyAuditAreaId").notNull().references(() => propertyAuditAreas.id, { onDelete: "cascade" }),
    expectedQuantity: integer("expectedQuantity").notNull(),
    requiredThreshold: integer("requiredThreshold").notNull(),
    criticalThreshold: integer("criticalThreshold").notNull(),
    photoRequirementType: photoRequirementTypeEnum("photoRequirementType").notNull(),
    weight: integer("weight").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const suppliesChecklistItems = pgTable("suppliesChecklistItems", {
    id: uuid("id").primaryKey().defaultRandom(),
    checklistItemMasterId: uuid("checklistItemMasterId").notNull().references(() => checklistItemMaster.id),
    propertyAuditAreaId: uuid("propertyAuditAreaId").notNull().references(() => propertyAuditAreas.id, { onDelete: "cascade" }),
    expectedQuantity: integer("expectedQuantity").notNull(),
    requiredThreshold: integer("requiredThreshold").notNull(),
    criticalThreshold: integer("criticalThreshold").notNull(),
    photoRequirementType: photoRequirementTypeEnum("photoRequirementType").notNull(),
    weight: integer("weight").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const maintenanceChecklistItems = pgTable("maintenanceChecklistItems", {
    id: uuid("id").primaryKey().defaultRandom(),
    checklistItemMasterId: uuid("checklistItemMasterId").notNull().references(() => checklistItemMaster.id),
    propertyAuditAreaId: uuid("propertyAuditAreaId").notNull().references(() => propertyAuditAreas.id, { onDelete: "cascade" }),
    photoRequirementType: photoRequirementTypeEnum("photoRequirementType").notNull(),
    weight: integer("weight").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    ...timestamps,
    ...adminUpdateReference,
});

export const propertyAuditSessions = pgTable("propertyAuditSessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
    entityId: uuid("entityId").references(() => entities.id, { onDelete: "cascade" }),
    supervisorId: uuid("supervisorId").notNull().references(() => supervisors.id),
    auditType: auditTypeEnum("auditType").notNull(),
    status: auditStatusEnum("status").notNull(),
    startedAt: timestamp("startedAt", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    completedAt: timestamp("completedAt", { withTimezone: true, mode: "string" }),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
}, (table) => [
    setSupervisorOrAdminUpdatedByConstraint(table),
]);

export const inventoryAuditChecklistItems = pgTable("inventoryAuditChecklistItems", {
    id: uuid("id").primaryKey().defaultRandom(),
    auditSessionId: uuid("auditSessionId").notNull().references(() => propertyAuditSessions.id, { onDelete: "cascade" }),
    inventoryChecklistItemId: uuid("inventoryChecklistItemId").notNull().references(() => inventoryChecklistItems.id),
    observedQuantity: integer("observedQuantity").notNull(),
    quantityStatus: quantityStatusEnum("quantityStatus").notNull(),
    varianceReason: text("varianceReason"),
    conditionStatus: conditionStatusEnum("conditionStatus"),
    issueTypeId: uuid("issueTypeId").references(() => issueTypes.id),
    notes: text("notes"),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
}, (table) => [
    setSupervisorOrAdminUpdatedByConstraint(table),
]);

export const suppliesAuditChecklistItems = pgTable("suppliesAuditChecklistItems", {
    id: uuid("id").primaryKey().defaultRandom(),
    auditSessionId: uuid("auditSessionId").notNull().references(() => propertyAuditSessions.id, { onDelete: "cascade" }),
    suppliesChecklistItemId: uuid("suppliesChecklistItemId").notNull().references(() => suppliesChecklistItems.id),
    observedQuantity: integer("observedQuantity").notNull(),
    quantityStatus: quantityStatusEnum("quantityStatus").notNull(),
    issueTypeId: uuid("issueTypeId").references(() => issueTypes.id),
    notes: text("notes"),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
}, (table) => [
    setSupervisorOrAdminUpdatedByConstraint(table),
]);

export const maintenanceAuditChecklistItems = pgTable("maintenanceAuditChecklistItems", {
    id: uuid("id").primaryKey().defaultRandom(),
    auditSessionId: uuid("auditSessionId").notNull().references(() => propertyAuditSessions.id, { onDelete: "cascade" }),
    maintenanceChecklistItemId: uuid("maintenanceChecklistItemId").notNull().references(() => maintenanceChecklistItems.id),
    conditionStatus: conditionStatusEnum("conditionStatus").notNull(),
    issueTypeId: uuid("issueTypeId").references(() => issueTypes.id),
    notes: text("notes"),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
}, (table) => [
    setSupervisorOrAdminUpdatedByConstraint(table),
]);

export const checklistItemMedia = pgTable("checklistItemMedia", {
    id: uuid("id").primaryKey().defaultRandom(),
    auditSessionId: uuid("auditSessionId").notNull().references(() => propertyAuditSessions.id, { onDelete: "cascade" }),

    inventoryAuditChecklistItemId: uuid("inventoryAuditChecklistItemId").references(() => inventoryAuditChecklistItems.id),
    suppliesAuditChecklistItemId: uuid("suppliesAuditChecklistItemId").references(() => suppliesAuditChecklistItems.id),
    maintenanceAuditChecklistItemId: uuid("maintenanceAuditChecklistItemId").references(() => maintenanceAuditChecklistItems.id),

    mediaType: mediaTypeEnum("mediaType").notNull(),
    mediaUrl: text("mediaUrl").notNull(),
    uploadedBy: uuid("uploadedBy").notNull().references(() => supervisors.id),
    ...timestamps,
    ...adminOrSupervisorUpdateReference,
}, (table) => [
    setSupervisorOrAdminUpdatedByConstraint(table),
]);

export const tickets = pgTable("tickets", {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
    entityId: uuid("entityId").references(() => entities.id, { onDelete: "cascade" }),
    auditSessionId: uuid("auditSessionId").notNull().references(() => propertyAuditSessions.id),

    auditSection: auditSectionEnum("auditSection").notNull(),
    referenceChecklistRecordId: uuid("referenceChecklistRecordId").notNull(),

    priority: ticketPriorityEnum("priority").notNull(),
    status: ticketStatusEnum("status").notNull().default("OPEN"),
    assignedTo: uuid("assignedTo").notNull().references(() => supervisors.id),
    resolvedAt: timestamp("resolvedAt", { withTimezone: true, mode: "string" }),

    ...timestamps,
    ...adminOrSupervisorUpdateReference,
}, (table) => [
    setSupervisorOrAdminUpdatedByConstraint(table),
]);

export const ticketResolutionLogs = pgTable("ticketResolutionLogs", {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticketId").notNull().references(() => tickets.id, { onDelete: "cascade" }),
    resolutionNotes: text("resolutionNotes").notNull(),
    supervisorResolvedBy: uuid("supervisorResolvedBy").references(() => supervisors.id),
    adminResolvedBy: uuid("adminResolvedBy"),

    ...timestamps,
    ...adminOrSupervisorUpdateReference,
}, (table) => [
    setSupervisorOrAdminUpdatedByConstraint(table),
]);

// Update table exports to include new listing system tables
export const userAccessibleTables = {
    proposals: proposals,
    proposalItems: proposalItems,
    users: users,
    ownersOnProperties: ownersOnProperties,
    managersOnProperties: managersOnProperties,
    caretakersOnProperties: caretakersOnProperties,
    properties: properties,
    icalLinks: icalLinks,
    importedBookings: importedBookings,
    customers: customers,
    cancellations: cancellations,
    bookings: bookings,
    payments: payments,
    discountPlans: discountPlans,
    discountPlansValues: discountPlansValues,
    coupons: coupons,
    propertyCoupons: propertyCoupons,
    propertyDiscountPlans: propertyDiscountPlans,
    propertyCancellationPlans: propertyCancellationPlans,
    blockedDates: blockedDates,
    reviews: reviews,
    reviewMagicLinks: reviewMagicLinks,
    photos: photos,
    propertyPhotos: propertyPhotos,
    // propertyInfoSections: propertyInfoSections,
    propertyHouseRules: propertyHouseRules,
    enquiries: enquiries,
    spaceProperties: spaceProperties,
    // New listing system tables
    listingUsers: listingUsers,
    contactEnquiry: contactEnquiry,
    viewEnquiry: viewEnquiry,
    searchQuery: searchQuery,
    whatsappLog: whatsappLog,
    globalConstants: globalConstants,
    entities: entities,
    entityProperties: entityProperties,
    entityBlockedDates: entityBlockedDates,
    entitySpecialDates: entitySpecialDates,
    bookingConfirmations: bookingConfirmations,
    bookingPaymentSchedule: bookingPaymentSchedule,
    rooms: rooms,
    roomBasedPricingTiers: roomBasedPricingTiers,
    bookingRooms: bookingRooms,
    ownersWallet: ownersWallet,
    walletTransactions: walletTransactions,
    walletWithdrawalRequests: walletWithdrawalRequests,

    // Property Audit System
    supervisors: supervisors,
    propertyAuditAreaCategoryMaster: propertyAuditAreaCategoryMaster,
    propertyAuditAreas: propertyAuditAreas,
    checklistCategoryMaster: checklistCategoryMaster,
    checklistItemMaster: checklistItemMaster,
    issueTypes: issueTypes,
    inventoryChecklistItems: inventoryChecklistItems,
    suppliesChecklistItems: suppliesChecklistItems,
    maintenanceChecklistItems: maintenanceChecklistItems,
    propertyAuditSessions: propertyAuditSessions,
    inventoryAuditChecklistItems: inventoryAuditChecklistItems,
    suppliesAuditChecklistItems: suppliesAuditChecklistItems,
    maintenanceAuditChecklistItems: maintenanceAuditChecklistItems,
    checklistItemMedia: checklistItemMedia,
    tickets: tickets,
    ticketResolutionLogs: ticketResolutionLogs,
} as const;

export const allTables = {
    ...userAccessibleTables,
    ...adminOnlyTables,
} as const;

export const tableNameEnum = pgEnum(
    "tableNameEnum",
    Object.keys(allTables) as [string, ...string[]]
);

export const tableHistory = pgTable(
    "tableHistory",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        operationPerformedByAdminId: uuid("operationPerformedByAdminId"),
        operationPerformedByUserId: uuid("operationPerformedByUserId"),
        affectedId: uuid("affectedId"),
        tableName: tableNameEnum("tableName").notNull(),
        operation: tableHistoryOperationEnum("operation").notNull(),
        data: json("data").notNull(),
    },
    (table) => [
        index("operationPerformedByAdminId").on(table.operationPerformedByAdminId),
        index("operationPerformedByUserId").on(table.operationPerformedByUserId),
        index("affectedId_idx").on(table.affectedId),
        index("tableName_idx").on(table.tableName),
        index("operation_idx").on(table.operation),
    ]
);

// Bulk Price Update Logs
// This table is specifically for special dates (bulkSpecialDateUpdate).
// It stores overrides for specific dates rather than permanent price changes.
export const bulkUpdateLogs = pgTable("bulkUpdateLogs", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Entity Target Info
    entityType: bulkEntityTypeEnum("entityType").notNull(),
    isAppliedToAll: boolean("isAppliedToAll").notNull().default(false),

    // Date (Single date as per requirement)
    date: date("date", { mode: "string" }).notNull(),

    // Operation (Flattened)
    operationType: bulkOperationTypeEnum("operationType").notNull(),
    operationMode: bulkOperationModeEnum("operationMode"),
    operationValue: integer("operationValue").notNull(),

    affectedCount: integer("affectedCount"),
    status: text("status").notNull(),

    ...timestamps,
    ...adminUpdateReference,
});

// Relational Table for Bulk Special Date Update Logs
export const entityBulkUpdateLogs = pgTable("entityBulkUpdateLogs", {
    id: uuid("id").primaryKey().defaultRandom(),
    bulkUpdateLogId: uuid("bulkUpdateLogId")
        .notNull()
        .references(() => bulkUpdateLogs.id, { onDelete: "cascade" }),
    entityId: uuid("entityId")
        .notNull()
        .references(() => entities.id, { onDelete: "cascade" }),
    ...timestamps,
    ...adminUpdateReference,
}, (table) => [
    index("entity_bulk_log_bulk_id_idx").on(table.bulkUpdateLogId),
    index("entity_bulk_log_entity_id_idx").on(table.entityId),
]);


// This table is for permanent price updates in bulk.
// These changes are applied directly to the properties/entities price fields (audit/history).
export const permanentPriceUpdateLogs = pgTable("permanentPriceUpdateLogs", {
    id: uuid("id").primaryKey().defaultRandom(),

    adminCreatedBy: uuid("adminCreatedBy").references(() => admins.id, {
        onDelete: "set null",
    }),
    adminName: text("adminName"), // Cached name for quick display

    entityType: bulkEntityTypeEnum("entityType").notNull().default("ENTITY"),

    operationType: bulkOperationTypeEnum("operationType").notNull(),
    operationValue: integer("operationValue").notNull(),
    operationMode: bulkOperationModeEnum("operationMode").notNull(),

    applicableDays: jsonb("applicableDays").$type<string[]>().notNull(), // e.g., ['monday', 'friday']

    // Storage for previous values to facilitate revert
    // Structure: { [entityId]: { [dayField]: value } }
    // e.g., { "uuid1": { "mondayPrice": 1000, "mondayPriceWithGST": 1180 } }
    previousValues: jsonb("previousValues").$type<Record<string, Record<string, number | null>>>().notNull(),

    status: text("status").notNull().default("applied"), // 'applied', 'reverted'

    ...timestamps,
});

// Relational Table for Permanent Price Update Logs
export const entityPermanentPriceUpdateLogs = pgTable("entityPermanentPriceUpdateLogs", {
    id: uuid("id").primaryKey().defaultRandom(),
    permanentPriceUpdateLogId: uuid("permanentPriceUpdateLogId")
        .notNull()
        .references(() => permanentPriceUpdateLogs.id, { onDelete: "cascade" }),
    entityId: uuid("entityId")
        .notNull()
        .references(() => entities.id, { onDelete: "cascade" }),
    ...timestamps,
}, (table) => [
    index("entity_perm_price_log_bulk_id_idx").on(table.permanentPriceUpdateLogId),
    index("entity_perm_price_log_entity_id_idx").on(table.entityId),
]);


export const activityLogRoleEnum = pgEnum("activityLogRole", ["ADMIN", "USER", "SYSTEM"]);

export const activityLogs = pgTable("activityLogs", {
    id: uuid("id").primaryKey().defaultRandom(),

    // 1. WHO: The Actor
    actorType: activityLogRoleEnum("actorType").notNull(),
    adminActorId: uuid("adminActorId").references(() => admins.id),
    userActorId: uuid("userActorId").references(() => users.id),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),

    // 2. WHERE: The Target
    tableName: text("tableName").notNull(), // e.g., 'properties', 'entities'
    recordId: uuid("recordId").notNull(),   // The ID of the row changed
    propertyId: uuid("propertyId"),         // Contextual: useful for filtering all logs for one property
    entityId: uuid("entityId"),             // Contextual: useful for filtering all logs for one entity

    // 3. WHAT: The Action
    operation: tableHistoryOperationEnum("operation").notNull(), // INSERT, UPDATE, DELETE
    actionType: text("actionType"), // Logic-level tag: 'PRICE_CHANGE', 'STATUS_UPDATE', 'PHOTO_UPLOAD'

    // 4. DATA: The Diffs
    previousValues: jsonb("previousValues"), // Null for INSERT
    newValues: jsonb("newValues"),           // Full record for INSERT, only changed fields for UPDATE

    // 5. METADATA
    reason: text("reason"), // Optional: user provided reason for change
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`), // Request IDs, Trace IDs, etc.

    ...timestamps,
}, (table) => [
    index("log_record_idx").on(table.tableName, table.recordId),
    index("log_property_context_idx").on(table.propertyId),
    index("log_actor_idx").on(table.adminActorId, table.userActorId),
    index("log_created_at_idx").on(table.createdAt),
]);
