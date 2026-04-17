# user.ts

## Enums

No enums defined in this file.

## Tables

### `users` ("users")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK, NOT NULL |
| `firstName` | `text` | nullable |
| `lastName` | `text` | nullable |
| `mobileNumber` | `varchar(256)` | NOT NULL |
| `whatsappNumber` | `varchar(256)` | nullable |
| `email` | `varchar(256)` | nullable |
| `gender` | `enum(genderEnum)` | nullable |
| `alternateContact` | `text` | nullable |
| `bankAccounts` | `json` | NOT NULL, default `[]` |
| `addressDetails` | `json` | default `{}` |
| `settlementTiming` | `enum(settlementTimingEnum)` | NOT NULL, default `checkout` |
| `settlementTime` | `time` | default `22:00:00` |
| `settlementEnabled` | `boolean` | NOT NULL, default `true` |
| `createdAt` | `timestamp` | from `timestamps` helper |
| `updatedAt` | `timestamp` | from `timestamps` helper |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `INDEX: users_mobile_number_idx`
- `INDEX: users_email_idx`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `bankDetails` ("bankDetails")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `userId` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `accountHolderName` | `text` | NOT NULL |
| `accountNumber` | `varchar(32)` | NOT NULL |
| `ifscCode` | `varchar(20)` | NOT NULL |
| `bankName` | `text` | NOT NULL |
| `branch` | `text` | nullable |
| `createdAt` | `timestamp` | default now |

### `bankDetailsOnProperties` ("bankDetailsOnProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `bankDetailId` | `uuid` | NOT NULL, FK -> bankDetails.id (onDelete: cascade) |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |

Additional key/check/index rules:
- `PRIMARY KEY: (bankDetailId, propertyId)`

### `ownersOnProperties` ("ownersOnProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `ownerId` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `PRIMARY KEY: (ownerId, propertyId)`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `managersOnProperties` ("managersOnProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `managerId` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `PRIMARY KEY: (managerId, propertyId)`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

### `caretakersOnProperties` ("caretakersOnProperties")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `caretakerId` | `uuid` | NOT NULL, FK -> users.id (onDelete: cascade) |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `createdBy` | `uuid` | from `adminOrUserUpdateReference` |
| `updatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminCreatedBy` | `uuid` | from `adminOrUserUpdateReference` |
| `adminUpdatedBy` | `uuid` | from `adminOrUserUpdateReference` |

Additional key/check/index rules:
- `PRIMARY KEY: (caretakerId, propertyId)`
- `CHECK_HELPER: setUserOrAdminUpdatedByConstraint`

## Views

No views defined in this file.
