# enquiry.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `gatheringTypeEnum` | `"gatheringType"` | `gatheringTypeOptions` | Friends, Wedding, Corporate, Family |
| `eventTypeEnum` | `"eventType"` | `eventTypeOptions` | VIEW_PROPERTY, LIKE, SHARE, CONTACT_CLICK |
| `whatsappStatusEnum` | `"whatsappStatus"` | `whatsappStatusOptions` | PENDING, SENT, DELIVERED, FAILED |
| `enquiryTypeEnum` | `"enquiryType"` | `enquiryTypeOptions` | contact_request, property_enquiry, event_enquiry, general_contact, booking_enquiry, support_request, partnership_enquiry, media_enquiry |
| `enquiryStatusEnum` | `"enquiryStatus"` | `enquiryStatusOptions` | pending, in_progress, resolved, closed, spam |
| `enquiryPriorityEnum` | `"enquiryPriority"` | `enquiryPriorityOptions` | low, medium, high, urgent |

## Tables

### `enquiries` ("enquiries")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | FK -> brands.id (onDelete: cascade) |
| `firstName` | `text` | NOT NULL |
| `lastName` | `text` | - |
| `email` | `text` | NOT NULL |
| `phoneNumber` | `text` | - |
| `enquiryType` | `enum(enquiryTypeEnum)` | NOT NULL |
| `subject` | `text` | NOT NULL |
| `message` | `text` | NOT NULL |
| `propertyId` | `uuid` | FK -> properties.id |
| `eventDate` | `date` | - |
| `guestCount` | `integer` | - |
| `checkinDate` | `date` | - |
| `checkoutDate` | `date` | - |
| `status` | `enum(enquiryStatusEnum)` | NOT NULL, default set |
| `responseMessage` | `text` | - |
| `responseDate` | `timestamp` | - |

Additional key/check/index rules:
- `INDEX: enquiries_email_idx`
- `INDEX: enquiries_phone_idx`
- `INDEX: enquiries_type_idx`
- `INDEX: enquiries_brand_id_idx`
- `INDEX: enquiries_status_idx`
- `INDEX: enquiries_property_id_idx`
- `INDEX: enquiries_created_at_idx`
- `CHECK: guest_count_positive`

### `contactEnquiry` ("contactEnquiry")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `customerId` | `uuid` | NOT NULL, FK -> customers.id (onDelete: cascade) |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `guestSize` | `integer` | NOT NULL |
| `gatheringType` | `enum(gatheringTypeEnum)` | NOT NULL |
| `checkInDate` | `date` | NOT NULL |
| `checkOutDate` | `date` | NOT NULL |

Additional key/check/index rules:
- `INDEX: contact_enquiry_customer_id_idx`
- `INDEX: contact_enquiry_brand_id_idx`
- `INDEX: contact_enquiry_property_id_idx`
- `INDEX: contact_enquiry_created_at_idx`
- `CHECK: guest_size_positive`
- `CHECK: checkout_after_checkin_contact`

### `viewEnquiry` ("viewEnquiry")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `customerId` | `uuid` | NOT NULL, FK -> customers.id (onDelete: cascade) |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `eventType` | `enum(eventTypeEnum)` | NOT NULL |
| `eventMetadata` | `jsonb` | default set |

Additional key/check/index rules:
- `INDEX: view_enquiry_customer_id_idx`
- `INDEX: view_enquiry_brand_id_idx`
- `INDEX: view_enquiry_property_id_idx`
- `INDEX: view_enquiry_event_type_idx`
- `INDEX: view_enquiry_created_at_idx`

### `searchQuery` ("searchQuery")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `customerId` | `uuid` | NOT NULL, FK -> customers.id (onDelete: cascade) |
| `brandId` | `uuid` | NOT NULL, FK -> brands.id (onDelete: cascade) |
| `areaId` | `uuid` | FK -> areas.id (onDelete: set null) |
| `cityId` | `uuid` | FK -> cities.id (onDelete: set null) |
| `stateId` | `uuid` | FK -> states.id (onDelete: set null) |
| `guestCount` | `integer` | - |
| `budgetMin` | `integer` | - |
| `budgetMax` | `integer` | - |
| `totalResults` | `integer` | - |

Additional key/check/index rules:
- `INDEX: search_query_customer_id_idx`
- `INDEX: search_query_brand_id_idx`
- `INDEX: search_query_area_id_idx`
- `INDEX: search_query_city_id_idx`
- `INDEX: search_query_state_id_idx`
- `INDEX: search_query_created_at_idx`
- `CHECK: guest_count_positive`
- `CHECK: budget_min_positive`
- `CHECK: budget_max_positive`

### `whatsappLog` ("whatsappLog")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `contactEnquiryId` | `uuid` | NOT NULL, FK -> contactEnquiry.id (onDelete: cascade) |
| `messageSid` | `text` | - |
| `messageBody` | `text` | NOT NULL |
| `status` | `enum(whatsappStatusEnum)` | NOT NULL, default set |
| `sentAt` | `timestamp` | - |
| `deliveredAt` | `timestamp` | - |
| `failedReason` | `text` | - |
| `toUserId` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |

Additional key/check/index rules:
- `INDEX: whatsapp_log_contact_enquiry_id_idx`
- `INDEX: whatsapp_log_status_idx`
- `INDEX: whatsapp_log_to_user_id_idx`
- `INDEX: whatsapp_log_created_at_idx`

## Views

No views defined in this file.
