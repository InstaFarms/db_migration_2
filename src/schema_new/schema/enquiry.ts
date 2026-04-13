import { sql } from "drizzle-orm";
import {
  enquiryPriorityOptions,
  enquiryStatusOptions,
  enquiryTypeOptions,
  eventTypeOptions,
  gatheringTypeOptions,
  whatsappStatusOptions,
} from "../types.ts";
import {
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  adminOrUserUpdateReference,
  timestamps,
} from "./shared.ts";
import { brands } from "./brand.ts";
import { customers } from "./customer.ts";
import { areas, cities, states } from "./location.ts";
import { properties } from "./property.ts";
import { users } from "./user.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const gatheringTypeEnum = pgEnum("gatheringType", gatheringTypeOptions);

export const eventTypeEnum = pgEnum("eventType", eventTypeOptions);

export const whatsappStatusEnum = pgEnum("whatsappStatus", whatsappStatusOptions);

export const enquiryTypeEnum = pgEnum("enquiryType", enquiryTypeOptions);

export const enquiryStatusEnum = pgEnum("enquiryStatus", enquiryStatusOptions);

export const enquiryPriorityEnum = pgEnum("enquiryPriority", enquiryPriorityOptions);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId").references(() => brands.id, {
      onDelete: "cascade",
    }),
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
    check("guest_count_positive", sql`"guestCount" IS NULL OR "guestCount" > 0`),
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
    index("enquiries_brand_id_idx").on(table.brandId),
    index("enquiries_status_idx").on(table.status),
    index("enquiries_property_id_idx").on(table.propertyId),
    index("enquiries_created_at_idx").on(table.createdAt),
  ]
);

export const contactEnquiry = pgTable(
  "contactEnquiry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customerId")
      .notNull()
      .references(() => customers.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    guestSize: integer("guestSize").notNull(),
    gatheringType: gatheringTypeEnum("gatheringType").notNull(),
    checkInDate: date("checkInDate", { mode: "string" }).notNull(),
    checkOutDate: date("checkOutDate", { mode: "string" }).notNull(),
    ...timestamps,
  },
  (table) => [
    check("guest_size_positive", sql`"guestSize" > 0`),
    check("checkout_after_checkin_contact", sql`"checkOutDate" > "checkInDate"`),
    index("contact_enquiry_customer_id_idx").on(table.customerId),
    index("contact_enquiry_brand_id_idx").on(table.brandId),
    index("contact_enquiry_property_id_idx").on(table.propertyId),
    index("contact_enquiry_created_at_idx").on(table.createdAt),
  ]
);

export const viewEnquiry = pgTable(
  "viewEnquiry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customerId")
      .notNull()
      .references(() => customers.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    propertyId: uuid("propertyId")
      .notNull()
      .references(() => properties.id, {
        onDelete: "cascade",
      }),
    eventType: eventTypeEnum("eventType").notNull(),
    eventMetadata: jsonb("eventMetadata").default(sql`'{}'::jsonb`),
    ...timestamps,
  },
  (table) => [
    index("view_enquiry_customer_id_idx").on(table.customerId),
    index("view_enquiry_brand_id_idx").on(table.brandId),
    index("view_enquiry_property_id_idx").on(table.propertyId),
    index("view_enquiry_event_type_idx").on(table.eventType),
    index("view_enquiry_created_at_idx").on(table.createdAt),
  ]
);

export const searchQuery = pgTable(
  "searchQuery",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customerId")
      .notNull()
      .references(() => customers.id, {
        onDelete: "cascade",
      }),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
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
  },
  (table) => [
    check("guest_count_positive", sql`"guestCount" IS NULL OR "guestCount" > 0`),
    check("budget_min_positive", sql`"budgetMin" IS NULL OR "budgetMin" >= 0`),
    check("budget_max_positive", sql`"budgetMax" IS NULL OR "budgetMax" >= 0`),
    check(
      "budget_max_greater_min",
      sql`"budgetMax" IS NULL OR "budgetMin" IS NULL OR "budgetMax" >= "budgetMin"`
    ),
    check(
      "total_results_positive",
      sql`"totalResults" IS NULL OR "totalResults" >= 0`
    ),
    index("search_query_customer_id_idx").on(table.customerId),
    index("search_query_brand_id_idx").on(table.brandId),
    index("search_query_area_id_idx").on(table.areaId),
    index("search_query_city_id_idx").on(table.cityId),
    index("search_query_state_id_idx").on(table.stateId),
    index("search_query_created_at_idx").on(table.createdAt),
  ]
);

export const whatsappLog = pgTable(
  "whatsappLog",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactEnquiryId: uuid("contactEnquiryId")
      .notNull()
      .references(() => contactEnquiry.id, {
        onDelete: "cascade",
      }),
    messageSid: text("messageSid"),
    messageBody: text("messageBody").notNull(),
    status: whatsappStatusEnum("status").notNull().default("PENDING"),
    sentAt: timestamp("sentAt", { withTimezone: true, mode: "string" }),
    deliveredAt: timestamp("deliveredAt", {
      withTimezone: true,
      mode: "string",
    }),
    failedReason: text("failedReason"),
    toUserId: uuid("toUserId")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    ...timestamps,
  },
  (table) => [
    index("whatsapp_log_contact_enquiry_id_idx").on(table.contactEnquiryId),
    index("whatsapp_log_status_idx").on(table.status),
    index("whatsapp_log_to_user_id_idx").on(table.toUserId),
    index("whatsapp_log_created_at_idx").on(table.createdAt),
  ]
);
