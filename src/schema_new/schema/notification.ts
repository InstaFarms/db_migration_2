import { sql } from "drizzle-orm";
import {
  notificationRecipientRoleOptions,
} from "../types.ts";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { brands } from "./brand.ts";
import { bookings } from "./booking.ts";

// =========================================================
// =========================================================
// ======================= ENUMS ===========================
// =========================================================
// =========================================================

export const notificationRecipientRoleEnum = pgEnum(
  "notificationRecipientRoleEnum",
  notificationRecipientRoleOptions
);

// =========================================================
// =========================================================
// ======================== TABLES =========================
// =========================================================
// =========================================================

// ==================== NOTIFICATION EVENT TYPES ===========

export const notificationEventTypes = pgTable(
  "notification_event_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [index("notification_event_types_name_idx").on(table.name)]
);

// ==================== NOTIFICATION TEMPLATES ============

export const notificationTemplates = pgTable(
  "notification_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brandId")
      .notNull()
      .references(() => brands.id, {
        onDelete: "cascade",
      }),
    channel: text("channel").notNull(),
    eventTypeId: uuid("eventTypeId")
      .references(() => notificationEventTypes.id, { onDelete: "restrict" })
      .notNull(),
    recipientRole: notificationRecipientRoleEnum("recipientRole"),
    templateName: text("templateName").notNull(),
    subject: text("subject"),
    title: text("title"),
    body: text("body").notNull(),
    variables: jsonb("variables").$type<Record<string, string>>(),
    isActive: boolean("isActive").notNull().default(true),
    version: integer("version").notNull().default(1),
    language: text("language").notNull().default("en"),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    check(
      "email_subject_check",
      sql`(channel = 'email' AND subject IS NOT NULL) OR (channel != 'email')`
    ),
    check(
      "app_title_check",
      sql`(channel = 'app' AND title IS NOT NULL) OR (channel != 'app')`
    ),
    check("channel_check", sql`channel IN ('email', 'whatsapp', 'sms', 'app')`),
    check("body_not_empty", sql`LENGTH(TRIM(body)) > 0`),
    index("notification_templates_brand_id_idx").on(table.brandId),
    index("notification_templates_channel_idx").on(table.channel),
    index("notification_templates_event_type_id_idx").on(table.eventTypeId),
    index("notification_templates_recipient_role_idx").on(table.recipientRole),
    index("notification_templates_is_active_idx").on(table.isActive),
    index("notification_templates_lookup_idx").on(
      table.channel,
      table.eventTypeId,
      table.recipientRole,
      table.isActive
    ),
  ]
);

// ==================== NOTIFICATION DELIVERY LOG ==========

export const notificationDeliveryLog = pgTable(
  "notification_delivery_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: text("channel").notNull(),
    queueId: text("queueId").notNull(),
    recipientType: notificationRecipientRoleEnum("recipientType").notNull(),
    recipientId: uuid("recipientId").notNull(),
    notificationType: text("notificationType"),
    templateId: uuid("templateId").references(() => notificationTemplates.id, {
      onDelete: "set null",
    }),
    bookingId: uuid("bookingId").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    notificationEventLogId: uuid("notificationEventLogId").references(
      () => notificationEventLog.id,
      {
        onDelete: "set null",
      }
    ),
    subject: text("subject"),
    title: text("title"),
    body: text("body"),
    status: text("status").notNull(),
    providerResponse: jsonb("providerResponse"),
    errorMessage: text("errorMessage"),
    deliveredAt: timestamp("deliveredAt", { mode: "string" }),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("notification_delivery_log_channel_idx").on(table.channel),
    index("notification_delivery_log_status_idx").on(table.status),
    index("notification_delivery_log_recipient_id_idx").on(table.recipientId),
    index("notification_delivery_log_created_at_idx").on(table.createdAt),
    index("notification_delivery_log_template_id_idx").on(table.templateId),
    index("notification_delivery_log_booking_id_idx").on(table.bookingId),
    index("notification_delivery_log_event_log_id_idx").on(table.notificationEventLogId),
  ]
);

// ==================== NOTIFICATION DEAD LETTER ===========

export const notificationDeadLetterQueue = pgTable(
  "notification_dead_letter_queue",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    queueName: text("queueName").notNull(),
    jobId: text("jobId").notNull().unique(),
    jobData: jsonb("jobData").$type<Record<string, any>>().notNull(),
    errorMessage: text("errorMessage").notNull(),
    attemptsMade: integer("attemptsMade").notNull(),
    failedAt: timestamp("failedAt", { mode: "string" }).notNull(),
    resolvedAt: timestamp("resolvedAt", { mode: "string" }),
    resolution: text("resolution"),
    bookingId: uuid("bookingId").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    notificationEventLogId: uuid("notificationEventLogId").references(
      () => notificationEventLog.id,
      {
        onDelete: "set null",
      }
    ),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("notification_dead_letter_queue_queue_name_idx").on(table.queueName),
    index("notification_dead_letter_queue_failed_at_idx").on(table.failedAt),
    index("notification_dead_letter_queue_booking_id_idx").on(table.bookingId),
    index("notification_dead_letter_queue_event_log_id_idx").on(table.notificationEventLogId),
  ]
);

// ==================== NOTIFICATION EVENT LOG =============

export const notificationEventLog = pgTable(
  "notification_event_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: text("eventId").notNull().unique(),
    eventType: text("eventType").notNull(),
    recipients: jsonb("recipients")
      .$type<
        Array<{
          id: string;
          type: "customer" | "owner" | "manager" | "caretaker" | "admin" | "user";
        }>
      >()
      .notNull(),
    data: jsonb("data").$type<Record<string, any>>().notNull(),
    status: text("status").notNull(),
    bookingId: uuid("bookingId").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("notification_event_log_event_id_idx").on(table.eventId),
    index("notification_event_log_status_idx").on(table.status),
    index("notification_event_log_created_at_idx").on(table.createdAt),
    index("notification_event_log_booking_id_idx").on(table.bookingId),
  ]
);
