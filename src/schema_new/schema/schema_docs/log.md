# log.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `bulkOperationTypeEnum` | `"bulkOperationType"` | `bulkOperationTypeOptions` | increase, decrease, set_fixed |
| `bulkOperationModeEnum` | `"bulkOperationMode"` | `bulkOperationModeOptions` | percentage, flat |
| `tableHistoryRoleEnum` | `"tableHistoryRoleEnum"` | `tableHistoryRoleOptions` | Admin, User |
| `tableHistoryOperationEnum` | `"tableHistoryOperationEnum"` | `tableHistoryOperationOptions` | INSERT, UPDATE, DELETE |
| `activityLogRoleEnum` | `"activityLogRole"` | `activityLogRoleOptions` | ADMIN, USER, SYSTEM |

## Tables

### `tableHistory` ("tableHistory")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `operationPerformedByAdminId` | `uuid` | - |
| `operationPerformedByUserId` | `uuid` | - |
| `affectedId` | `uuid` | - |
| `tableName` | `text` | NOT NULL |
| `operation` | `enum(tableHistoryOperationEnum)` | NOT NULL |
| `data` | `json` | NOT NULL |

Additional key/check/index rules:
- `INDEX: operationPerformedByAdminId`
- `INDEX: operationPerformedByUserId`
- `INDEX: affectedId_idx`
- `INDEX: tableName_idx`
- `INDEX: operation_idx`

### `bulkUpdateLogs` ("bulkUpdateLogs")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | FK -> brands.id (onDelete: set null) |
| `isAppliedToAll` | `boolean` | NOT NULL, default set |
| `date` | `date` | NOT NULL |
| `operationType` | `enum(bulkOperationTypeEnum)` | NOT NULL |
| `operationMode` | `enum(bulkOperationModeEnum)` | - |
| `operationValue` | `integer` | NOT NULL |
| `affectedCount` | `integer` | - |
| `status` | `text` | NOT NULL |

### `permanentPriceUpdateLogs` ("permanentPriceUpdateLogs")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `brandId` | `uuid` | FK -> brands.id (onDelete: set null) |
| `adminCreatedBy` | `uuid` | FK -> admins.id (onDelete: set null) |
| `adminName` | `text` | - |
| `operationType` | `enum(bulkOperationTypeEnum)` | NOT NULL |
| `operationValue` | `integer` | NOT NULL |
| `operationMode` | `enum(bulkOperationModeEnum)` | NOT NULL |
| `applicableDays` | `jsonb` | NOT NULL |
| `previousValues` | `jsonb` | - |
| `status` | `text` | NOT NULL, default set |

### `activityLogs` ("activityLogs")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `actorType` | `enum(activityLogRoleEnum)` | NOT NULL |
| `adminActorId` | `uuid` | FK -> admins.id |
| `userActorId` | `uuid` | FK -> users.id |
| `ipAddress` | `varchar(45)` | - |
| `userAgent` | `text` | - |
| `tableName` | `text` | NOT NULL |
| `recordId` | `uuid` | NOT NULL |
| `propertyId` | `uuid` | - |
| `operation` | `enum(tableHistoryOperationEnum)` | NOT NULL |
| `actionType` | `text` | - |
| `previousValues` | `jsonb` | - |
| `newValues` | `jsonb` | - |
| `reason` | `text` | - |
| `metadata` | `jsonb` | default set |

Additional key/check/index rules:
- `INDEX: log_record_idx`
- `INDEX: log_property_context_idx`
- `INDEX: log_actor_idx`
- `INDEX: log_created_at_idx`

## Views

No views defined in this file.
