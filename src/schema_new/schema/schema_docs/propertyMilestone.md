# propertyMilestone.ts

## Enums

No enums defined in this file.

## Tables

### `propertyCommissionMilestones` ("propertyCommissionMilestones")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `revenueMilestone` | `real` | NOT NULL |
| `milestoneCommissionPct` | `real` | NOT NULL |
| `milestoneNumber` | `integer` | NOT NULL |

Additional key/check/index rules:
- `INDEX: property_commission_milestones_property_id_idx`
- `INDEX: property_commission_milestones_number_idx`
- `CHECK: property_milestone_number_positive`

### `propertyMilestoneResults` ("propertyMilestoneResults")

| Column | Data Type | Constraints / Notes / Possible Values |
|---|---|---|
| `id` | `uuid` | PK |
| `propertyId` | `uuid` | NOT NULL, FK -> properties.id (onDelete: cascade) |
| `month` | `text` | NOT NULL |
| `revenueWithoutGst` | `real` | NOT NULL, default set |
| `revenueWithGst` | `real` | NOT NULL, default set |
| `achievedMilestoneNumber` | `integer` | - |
| `achievedCommission` | `real` | NOT NULL, default set |
| `chargedCommission` | `real` | NOT NULL, default set |
| `commissionAdjustment` | `real` | NOT NULL, default set |

Additional key/check/index rules:
- `INDEX: property_milestone_results_property_id_idx`
- `INDEX: property_milestone_results_month_idx`

## Views

No views defined in this file.
