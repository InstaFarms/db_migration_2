# admin.ts

## Enums

| Enum Const | DB Enum | Values Source | Values |
|---|---|---|---|
| `adminPanelRoleEnum` | `"adminPanelRole"` | `adminPanelRoleOptions` | SUPER_ADMIN, OPS_TEAM, SALES_EXECUTIVE, FINANCE_TEAM |
| `adminPermissionKeyEnum` | `"adminPermissionKey"` | `adminPermissionKeyOptions` | DASHBOARD, ALL_USERS, ADMINS, CUSTOMERS, SUPERVISORS, OWNER_GANG, ALL_PROPERTY_USERS, OWNERS, MANAGERS, CARETAKERS, LOCATIONS, PROPERTY_DATA, PROPOSALS, BOOKING_MANAGEMENT, WALLET_AND_SETTLEMENTS, REPORTS, COUPONS, COLLECTIONS, AUDIT_DATA, CONTACT_REQUESTS, NOTIFICATIONS, INSTAFARMS_SPECIFIC_DATA, HISTORY |

## Tables

### `admins` ("admins")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `firstName` | `varchar` | NOT NULL |
| `lastName` | `varchar` | - |
| `email` | `varchar` | NOT NULL, UNIQUE |
| `phoneNumber` | `varchar` | NOT NULL, UNIQUE |
| `panelRole` | `enum(adminPanelRoleEnum)` | NOT NULL, default set |
| `gender` | `enum(genderEnum)` | - |
| `whatsappNumber` | `varchar` | - |
| `alternateContact` | `varchar` | - |
| `addressDetails` | `json` | default set |
| `loginAt` | `timestamp` | - |
| `logoutAt` | `timestamp` | - |

### `adminPermissions` ("adminPermissions")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `key` | `enum(adminPermissionKeyEnum)` | NOT NULL, UNIQUE |
| `label` | `varchar(120)` | NOT NULL |
| `description` | `text` | - |
| `isActive` | `boolean` | NOT NULL, default set |

Additional key/check/index rules:
- `INDEX: admin_permissions_key_idx`
- `INDEX: admin_permissions_active_idx`

### `adminRolePermissions` ("adminRolePermissions")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `role` | `enum(adminPanelRoleEnum)` | NOT NULL |
| `permissionId` | `uuid` | NOT NULL, FK -> adminPermissions.id (onDelete: cascade) |
| `canView` | `boolean` | NOT NULL, default set |
| `canEdit` | `boolean` | NOT NULL, default set |

Additional key/check/index rules:
- `INDEX: admin_role_permissions_permission_id_idx`
- `INDEX: admin_role_permissions_role_idx`
- `PRIMARY KEY: composite key defined in callback`

## Views

No views defined in this file.
