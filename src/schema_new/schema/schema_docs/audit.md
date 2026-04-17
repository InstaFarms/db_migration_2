# audit.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `supervisorRoleEnum` | `"supervisorRole"` | `supervisorRoleOptions` | JUNIOR_SUPERVISOR, SENIOR_SUPERVISOR |
| `itemTypeEnum` | `"itemType"` | `itemTypeOptions` | INVENTORY, SUPPLIES, MAINTENANCE |
| `photoRequirementTypeEnum` | `"photoRequirementType"` | `photoRequirementTypeOptions` | ALWAYS_REQUIRED, REQUIRED_IF_ISSUE, NOT_REQUIRED |
| `auditTypeEnum` | `"auditType"` | `auditTypeOptions` | ROUTINE, QC_REVIEW |
| `auditStatusEnum` | `"auditStatus"` | `auditStatusOptions` | IN_PROGRESS, COMPLETED, CANCELLED |
| `quantityStatusEnum` | `"quantityStatus"` | `quantityStatusOptions` | OK, SHORTAGE, CRITICAL |
| `conditionStatusEnum` | `"conditionStatus"` | `conditionStatusOptions` | GOOD, NEEDS_ATTENTION, CRITICAL |
| `mediaTypeEnum` | `"mediaType"` | `mediaTypeOptions` | PHOTO, VIDEO |
| `auditSectionEnum` | `"auditSection"` | `auditSectionOptions` | INVENTORY, SUPPLIES, MAINTENANCE |
| `ticketPriorityEnum` | `"ticketPriority"` | `ticketPriorityOptions` | P1, P2 |
| `ticketStatusEnum` | `"ticketStatus"` | `ticketStatusOptions` | OPEN, RESOLVED |

## Tables

### `supervisors` ("supervisors")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |
| `phone` | `text` | NOT NULL, UNIQUE |
| `email` | `text` | NOT NULL, UNIQUE |
| `role` | `enum(supervisorRoleEnum)` | NOT NULL |
| `isActive` | `boolean` | NOT NULL, default set |

### `propertyAuditAreaCategoryMaster` ("propertyAuditAreaCategoryMaster")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |
| `weight` | `integer` | NOT NULL |
| `isActive` | `boolean` | NOT NULL, default set |

### `checklistCategoryMaster` ("checklistCategoryMaster")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |
| `itemType` | `enum(itemTypeEnum)` | NOT NULL |
| `weight` | `integer` | NOT NULL |
| `isActive` | `boolean` | NOT NULL, default set |

### `issueTypes` ("issueTypes")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `code` | `text` | NOT NULL, UNIQUE |
| `label` | `text` | NOT NULL |
| `description` | `text` | - |
| `isActive` | `boolean` | NOT NULL, default set |

### `propertyAuditAreas` ("propertyAuditAreas")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `areaCategoryId` | `uuid` | NOT NULL, FK -> propertyAuditAreaCategoryMaster.id |
| `areaName` | `text` | NOT NULL |
| `weight` | `integer` | NOT NULL |
| `isSystemArea` | `boolean` | NOT NULL, default set |
| `isActive` | `boolean` | NOT NULL, default set |

### `checklistItemMaster` ("checklistItemMaster")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |
| `itemType` | `enum(itemTypeEnum)` | NOT NULL |
| `categoryId` | `uuid` | NOT NULL, FK -> checklistCategoryMaster.id |
| `defaultPhotoRequirementType` | `enum(photoRequirementTypeEnum)` | NOT NULL |
| `isActive` | `boolean` | NOT NULL, default set |

### `inventoryChecklistItems` ("inventoryChecklistItems")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `checklistItemMasterId` | `uuid` | NOT NULL, FK -> checklistItemMaster.id |
| `propertyAuditAreaId` | `uuid` | NOT NULL, FK -> propertyAuditAreas.id (onDelete: cascade) |
| `expectedQuantity` | `integer` | NOT NULL |
| `requiredThreshold` | `integer` | NOT NULL |
| `criticalThreshold` | `integer` | NOT NULL |
| `photoRequirementType` | `enum(photoRequirementTypeEnum)` | NOT NULL |
| `weight` | `integer` | NOT NULL |
| `isActive` | `boolean` | NOT NULL, default set |

### `suppliesChecklistItems` ("suppliesChecklistItems")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `checklistItemMasterId` | `uuid` | NOT NULL, FK -> checklistItemMaster.id |
| `propertyAuditAreaId` | `uuid` | NOT NULL, FK -> propertyAuditAreas.id (onDelete: cascade) |
| `expectedQuantity` | `integer` | NOT NULL |
| `requiredThreshold` | `integer` | NOT NULL |
| `criticalThreshold` | `integer` | NOT NULL |
| `photoRequirementType` | `enum(photoRequirementTypeEnum)` | NOT NULL |
| `weight` | `integer` | NOT NULL |
| `isActive` | `boolean` | NOT NULL, default set |

### `maintenanceChecklistItems` ("maintenanceChecklistItems")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `checklistItemMasterId` | `uuid` | NOT NULL, FK -> checklistItemMaster.id |
| `propertyAuditAreaId` | `uuid` | NOT NULL, FK -> propertyAuditAreas.id (onDelete: cascade) |
| `photoRequirementType` | `enum(photoRequirementTypeEnum)` | NOT NULL |
| `weight` | `integer` | NOT NULL |
| `isActive` | `boolean` | NOT NULL, default set |

### `propertyAuditSessions` ("propertyAuditSessions")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `supervisorId` | `uuid` | NOT NULL, FK -> supervisors.id |
| `auditType` | `enum(auditTypeEnum)` | NOT NULL |
| `status` | `enum(auditStatusEnum)` | NOT NULL |
| `startedAt` | `timestamp` | NOT NULL |
| `completedAt` | `timestamp` | - |

Additional key/check/index rules:
- `CHECK_HELPER: setSupervisorOrAdminUpdatedByConstraint`

### `inventoryAuditChecklistItems` ("inventoryAuditChecklistItems")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `auditSessionId` | `uuid` | NOT NULL, FK -> propertyAuditSessions.id (onDelete: cascade) |
| `inventoryChecklistItemId` | `uuid` | NOT NULL, FK -> inventoryChecklistItems.id |
| `observedQuantity` | `integer` | NOT NULL |
| `quantityStatus` | `enum(quantityStatusEnum)` | NOT NULL |
| `varianceReason` | `text` | - |
| `conditionStatus` | `enum(conditionStatusEnum)` | - |
| `issueTypeId` | `uuid` | FK -> issueTypes.id |
| `notes` | `text` | - |

Additional key/check/index rules:
- `CHECK_HELPER: setSupervisorOrAdminUpdatedByConstraint`

### `suppliesAuditChecklistItems` ("suppliesAuditChecklistItems")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `auditSessionId` | `uuid` | NOT NULL, FK -> propertyAuditSessions.id (onDelete: cascade) |
| `suppliesChecklistItemId` | `uuid` | NOT NULL, FK -> suppliesChecklistItems.id |
| `observedQuantity` | `integer` | NOT NULL |
| `quantityStatus` | `enum(quantityStatusEnum)` | NOT NULL |
| `issueTypeId` | `uuid` | FK -> issueTypes.id |
| `notes` | `text` | - |

Additional key/check/index rules:
- `CHECK_HELPER: setSupervisorOrAdminUpdatedByConstraint`

### `maintenanceAuditChecklistItems` ("maintenanceAuditChecklistItems")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `auditSessionId` | `uuid` | NOT NULL, FK -> propertyAuditSessions.id (onDelete: cascade) |
| `maintenanceChecklistItemId` | `uuid` | NOT NULL, FK -> maintenanceChecklistItems.id |
| `conditionStatus` | `enum(conditionStatusEnum)` | NOT NULL |
| `issueTypeId` | `uuid` | FK -> issueTypes.id |
| `notes` | `text` | - |

Additional key/check/index rules:
- `CHECK_HELPER: setSupervisorOrAdminUpdatedByConstraint`

### `checklistItemMedia` ("checklistItemMedia")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `auditSessionId` | `uuid` | NOT NULL, FK -> propertyAuditSessions.id (onDelete: cascade) |
| `inventoryAuditChecklistItemId` | `uuid` | FK |
| `suppliesAuditChecklistItemId` | `uuid` | FK |
| `maintenanceAuditChecklistItemId` | `uuid` | FK -> maintenanceAuditChecklistItems.id |
| `mediaType` | `enum(mediaTypeEnum)` | NOT NULL |
| `mediaUrl` | `text` | NOT NULL |
| `uploadedBy` | `uuid` | NOT NULL, FK -> supervisors.id |

Additional key/check/index rules:
- `CHECK_HELPER: setSupervisorOrAdminUpdatedByConstraint`

### `tickets` ("tickets")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `auditSessionId` | `uuid` | NOT NULL, FK -> propertyAuditSessions.id |
| `auditSection` | `enum(auditSectionEnum)` | NOT NULL |
| `referenceChecklistRecordId` | `uuid` | NOT NULL |
| `priority` | `enum(ticketPriorityEnum)` | NOT NULL |
| `status` | `enum(ticketStatusEnum)` | NOT NULL, default set |
| `assignedTo` | `uuid` | NOT NULL, FK -> supervisors.id |
| `resolvedAt` | `timestamp` | - |

Additional key/check/index rules:
- `CHECK_HELPER: setSupervisorOrAdminUpdatedByConstraint`

### `ticketResolutionLogs` ("ticketResolutionLogs")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `ticketId` | `uuid` | NOT NULL, FK -> tickets.id (onDelete: cascade) |
| `resolutionNotes` | `text` | NOT NULL |
| `supervisorResolvedBy` | `uuid` | FK |
| `adminResolvedBy` | `uuid` | - |

Additional key/check/index rules:
- `CHECK_HELPER: setSupervisorOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
