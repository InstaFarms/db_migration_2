# notification.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `notificationRecipientRoleEnum` | `"notificationRecipientRoleEnum"` | `notificationRecipientRoleOptions` | customer, owner, manager, caretaker, admin, user |

## Tables

### `notificationEventTypes` ("notification_event_types")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL, UNIQUE |
| `createdAt` | `timestamp` | NOT NULL |
| `updatedAt` | `timestamp` | NOT NULL |

Additional key/check/index rules:
- `INDEX: notification_event_types_name_idx`

### `notificationTemplates` ("notification_templates")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `channel` | `text` | NOT NULL |
| `eventTypeId` | `uuid` | NOT NULL, FK -> notificationEventTypes.id (onDelete: restrict) |
| `recipientRole` | `enum(notificationRecipientRoleEnum)` | - |
| `templateName` | `text` | NOT NULL |
| `subject` | `text` | - |
| `title` | `text` | - |
| `body` | `text` | NOT NULL |
| `variables` | `jsonb` | - |
| `isActive` | `boolean` | NOT NULL, default set |
| `version` | `integer` | NOT NULL, default set |
| `language` | `text` | NOT NULL, default set |
| `createdAt` | `timestamp` | NOT NULL |
| `updatedAt` | `timestamp` | NOT NULL |

Additional key/check/index rules:
- `INDEX: notification_templates_brand_id_idx`
- `INDEX: notification_templates_channel_idx`
- `INDEX: notification_templates_event_type_id_idx`
- `INDEX: notification_templates_recipient_role_idx`
- `INDEX: notification_templates_is_active_idx`
- `INDEX: notification_templates_lookup_idx`
- `CHECK: channel_check`
- `CHECK: body_not_empty`

### `notificationDeliveryLog` ("notification_delivery_log")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `channel` | `text` | NOT NULL |
| `queueId` | `text` | NOT NULL |
| `recipientType` | `enum(notificationRecipientRoleEnum)` | NOT NULL |
| `recipientId` | `uuid` | NOT NULL |
| `notificationType` | `text` | - |
| `templateId` | `uuid` | FK -> notificationTemplates.id (onDelete: set null) |
| `bookingId` | `uuid` | FK -> bookings.id (onDelete: cascade) |
| `notificationEventLogId` | `uuid` | FK |
| `subject` | `text` | - |
| `title` | `text` | - |
| `body` | `text` | - |
| `status` | `text` | NOT NULL |
| `providerResponse` | `jsonb` | - |
| `errorMessage` | `text` | - |
| `deliveredAt` | `timestamp` | - |
| `createdAt` | `timestamp` | NOT NULL |
| `updatedAt` | `timestamp` | NOT NULL |

Additional key/check/index rules:
- `INDEX: notification_delivery_log_channel_idx`
- `INDEX: notification_delivery_log_status_idx`
- `INDEX: notification_delivery_log_recipient_id_idx`
- `INDEX: notification_delivery_log_created_at_idx`
- `INDEX: notification_delivery_log_template_id_idx`
- `INDEX: notification_delivery_log_booking_id_idx`
- `INDEX: notification_delivery_log_event_log_id_idx`

### `notificationDeadLetterQueue` ("notification_dead_letter_queue")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `queueName` | `text` | NOT NULL |
| `jobId` | `text` | NOT NULL, UNIQUE |
| `jobData` | `jsonb` | - |
| `errorMessage` | `text` | NOT NULL |
| `attemptsMade` | `integer` | NOT NULL |
| `failedAt` | `timestamp` | NOT NULL |
| `resolvedAt` | `timestamp` | - |
| `resolution` | `text` | - |
| `bookingId` | `uuid` | FK -> bookings.id (onDelete: cascade) |
| `notificationEventLogId` | `uuid` | FK |
| `createdAt` | `timestamp` | NOT NULL |
| `updatedAt` | `timestamp` | NOT NULL |

Additional key/check/index rules:
- `INDEX: notification_dead_letter_queue_queue_name_idx`
- `INDEX: notification_dead_letter_queue_failed_at_idx`
- `INDEX: notification_dead_letter_queue_booking_id_idx`
- `INDEX: notification_dead_letter_queue_event_log_id_idx`

### `notificationEventLog` ("notification_event_log")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `eventId` | `text` | NOT NULL, UNIQUE |
| `eventType` | `text` | NOT NULL |
| `recipients` | `jsonb` | NOT NULL |
| `data` | `jsonb` | - |
| `status` | `text` | NOT NULL |
| `bookingId` | `uuid` | FK -> bookings.id (onDelete: cascade) |
| `createdAt` | `timestamp` | NOT NULL |
| `updatedAt` | `timestamp` | NOT NULL |

Additional key/check/index rules:
- `INDEX: notification_event_log_event_id_idx`
- `INDEX: notification_event_log_status_idx`
- `INDEX: notification_event_log_created_at_idx`
- `INDEX: notification_event_log_booking_id_idx`

## Views

No views defined in this file.
