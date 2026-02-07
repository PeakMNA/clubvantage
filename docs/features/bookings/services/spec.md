# Bookings / Services / Service Booking Management

## Overview

The Services tab manages the catalog of bookable services offered by the club, including spa treatments (Thai massage, Swedish massage, hot stone therapy), fitness programs (personal training, yoga classes), and sports activities (tennis lessons, group clinics). Each service defines its duration, buffer time, base pricing with tier-based discounts, required staff capabilities, required facility features, maximum participants, and optional variations. Services appear in the booking wizard and calendar quick-booking flow, where the system combines service, staff, and facility availability to present only valid bookable time slots. Service CRUD operations go through GraphQL mutations with server-side permission enforcement.

## Status

| Aspect | State | Notes |
|--------|-------|-------|
| Service list (grid/list views) | Implemented | Card-based display with category icons |
| Service search | Implemented | Text search on name, description |
| Service category filter | Implemented | Filter by spa, fitness, sports, wellness |
| Service status filter | Implemented | Filter by active, inactive, seasonal |
| Create service modal | Implemented | `service-modal.tsx` with full form |
| Update service modal | Implemented | Reuses create modal in edit mode |
| Delete service | Implemented | Confirmation dialog before deletion |
| Duration and buffer time | Implemented | Duration in minutes with configurable buffer |
| Base pricing | Implemented | Base price with currency formatting (THB) |
| Tier-based discounts | Implemented | Per-membership-tier discount percentages in modal |
| Variations | Implemented | `variations-editor.tsx` for price modifiers |
| Required capabilities | Implemented | `capabilities-editor.tsx` for staff matching |
| Required facility features | Implemented | Feature requirements for facility matching |
| Max participants | Implemented | For group classes and sessions |
| Revenue center assignment | Partially Implemented | UI field exists in modal |
| Service popularity ranking | Implemented | Display only; not configurable |
| Bookings this week count | Implemented | Display metric on service cards |
| GraphQL CRUD | Implemented | `createService`, `updateService`, `deleteService` mutations |
| Server actions with auth | Implemented | `requirePermission('service:create/update/delete')` |
| Service-first booking flow | Designed | Plan exists but booking wizard uses generic flow |
| Equipment requirements | Schema Designed | `ServiceEquipmentRequirement` model planned |
| Service images/photos | Not Implemented | No image upload for services |
| Seasonal scheduling | Not Implemented | Status `seasonal` exists but no date range logic |
| Service availability matrix | Not Implemented | Combined staff+facility+time availability cards not built |

## Capabilities

- Display all services in responsive grid or list layout grouped by category
- Search services by name or description
- Filter services by category (spa, fitness, sports, wellness) and status (active, inactive, seasonal)
- Create new services with full configuration: name, category, description, duration, buffer time, pricing, capabilities, features, variations, tier discounts, and max participants
- Edit existing service configurations
- Delete services with confirmation dialog
- Toggle service active/inactive status
- Configure tier-based pricing discounts per membership level
- Define service variations with additive or multiplicative price modifiers
- Specify required staff capabilities to filter eligible staff during booking
- Specify required facility features to filter eligible facilities during booking
- Set maximum participants for group services
- Display weekly booking metrics per service

## Dependencies

### Interface Dependencies

| Module | Dependency | Usage |
|--------|-----------|-------|
| Calendar | Booking creation | Services selected in quick-booking and wizard flow appear on calendar |
| Facilities | Feature matching | Services with `requiredFacilityFeatures` are matched to eligible facilities |
| Staff | Capability matching | Services with `requiredCapabilities` filter staff selection during booking |
| Billing | Price integration | Service base price and tier discounts feed into invoice generation |
| Members | Tier discounts | Member's membership tier determines discount applied to base price |
| Equipment | Required equipment | Services can require specific equipment categories (planned) |
| Settings | Service categories | Available service categories and default buffer times |

### Settings Dependencies

| Setting | Usage |
|---------|-------|
| Available service categories | Determines the category options in create/edit modal |
| Default buffer time | Pre-populates buffer minutes for new services |
| Currency | Formatting of prices on service cards and modals |
| Membership tiers | List of tiers available for tier-based discount configuration |

### Data Dependencies

| Data Source | Query/Mutation | Description |
|-------------|---------------|-------------|
| `services` | GraphQL Query | Fetches all services with pricing and configuration |
| `createService` | GraphQL Mutation | Creates a new service with all configuration |
| `updateService` | GraphQL Mutation | Updates service details |
| `deleteService` | GraphQL Mutation | Soft-deletes a service |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `service.categories` | `string[]` | `["SPA","FITNESS","SPORTS","WELLNESS"]` | Club Admin | Available service categories |
| `service.defaultBufferMinutes` | `number` | `15` | Club Admin | Default buffer time between service bookings |
| `service.maxDurationMinutes` | `number` | `240` | Club Admin | Maximum allowed service duration (4 hours) |
| `service.minDurationMinutes` | `number` | `15` | Club Admin | Minimum allowed service duration |
| `service.durationIncrementMinutes` | `number` | `15` | Club Admin | Duration must be a multiple of this value |
| `service.defaultCurrency` | `string` | `"THB"` | Club Admin | Currency for pricing display |
| `service.allowGuestSurcharge` | `boolean` | `true` | Club Admin | Whether guest surcharge pricing is enabled |
| `service.requireStaff` | `boolean` | `true` | Club Admin | Whether services must have staff assigned (default for new services) |
| `service.requireFacility` | `boolean` | `true` | Club Admin | Whether services must have facility assigned (default for new services) |
| `service.maxVariations` | `number` | `10` | Platform Admin | Maximum number of variations per service |
| `service.maxTierDiscounts` | `number` | `10` | Platform Admin | Maximum number of tier discount entries per service |
| `service.seasonalDatesEnabled` | `boolean` | `false` | Club Admin | Whether seasonal date range configuration is available |
| `service.imageUploadEnabled` | `boolean` | `false` | Platform Admin | Whether service image uploads are supported |

## Data Model

```typescript
interface Service {
  id: string;
  clubId: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  basePrice: number;
  isActive: boolean;
  maxParticipants?: number;
  requiredCapabilities: string[];
  requiredFacilityFeatures: string[];
  tierDiscounts: TierDiscount[];
  variations: ServiceVariation[];
  equipmentRequirements?: ServiceEquipmentRequirement[];
  revenueCenterId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ServiceCategory = 'SPA' | 'FITNESS' | 'SPORTS' | 'WELLNESS';

interface TierDiscount {
  tierName: string;           // e.g., "Gold", "Platinum", "Diamond"
  discountPercent: number;    // e.g., 10 for 10% off
}

interface ServiceVariation {
  id: string;
  name: string;               // e.g., "60-minute session", "Couples upgrade"
  priceModifier: number;       // Amount or multiplier
  priceType: 'add' | 'multiply';  // Add flat amount or multiply base price
}

interface ServiceEquipmentRequirement {
  id: string;
  serviceId: string;
  equipmentCategoryId: string;
  quantity: number;            // How many units required
  isRequired: boolean;         // true = auto-reserve; false = optional add-on
  notes?: string;
}

interface PriceBreakdown {
  basePrice: number;
  variationAdjustment: number;
  tierDiscount: number;
  tierDiscountPercent: number;
  addOnsTotal: number;
  subtotal: number;
  tax: number;
  total: number;
}

// Context types used during booking flow
interface ServiceContext {
  id: string;
  name: string;
  basePrice: number;
  durationMinutes: number;
  bufferMinutes: number;
}

interface ServiceFormData {
  id?: string;
  name: string;
  category: string;
  description?: string;
  durationMinutes: number;
  bufferMinutes?: number;
  basePrice: number;
  isActive: boolean;
  maxParticipants?: number;
  requiredCapabilities: string[];
  requiredFacilityFeatures: string[];
  tierDiscounts: Array<{ tierName: string; discountPercent: number }>;
  variations: Array<{ name: string; priceModifier: number; priceType: 'add' | 'multiply' }>;
}

// GraphQL input types
interface CreateServiceInput {
  name: string;
  category: string;
  description?: string;
  durationMinutes: number;
  bufferMinutes?: number;
  basePrice: number;
  isActive?: boolean;
  maxParticipants?: number;
  requiredCapabilities?: string[];
  requiredFacilityFeatures?: string[];
  tierDiscounts?: Array<{ tierName: string; discountPercent: number }>;
  variations?: Array<{ name: string; priceModifier: number; priceType: 'add' | 'multiply' }>;
}

interface UpdateServiceInput {
  id: string;
  name?: string;
  category?: string;
  description?: string;
  durationMinutes?: number;
  bufferMinutes?: number;
  basePrice?: number;
  isActive?: boolean;
  maxParticipants?: number;
  requiredCapabilities?: string[];
  requiredFacilityFeatures?: string[];
  tierDiscounts?: Array<{ tierName: string; discountPercent: number }>;
  variations?: Array<{ name: string; priceModifier: number; priceType: 'add' | 'multiply' }>;
}
```

## Business Rules

1. **Duration Constraints**: Service duration must be between `minDurationMinutes` and `maxDurationMinutes`, and must be a multiple of `durationIncrementMinutes`. The buffer time is added to the end of the service for cleanup/transition but is not included in the member-facing duration.

2. **Buffer Time**: Buffer minutes create a non-bookable gap after the service ends. This time is shown as a buffer block on the calendar. Conflict detection includes buffer time when checking availability.

3. **Tier-Based Pricing**: When a member books a service, the system looks up their membership tier and applies the corresponding discount from `tierDiscounts`. If no discount is configured for the member's tier, full price applies.

4. **Variation Pricing**: Variations modify the base price either additively (`priceType: 'add'`) or multiplicatively (`priceType: 'multiply'`). Only one variation can be selected per booking. Tier discounts apply after variation adjustment.

5. **Capability Matching**: During booking, only staff members whose capabilities include all items in `requiredCapabilities` are shown as available. A staff member with capabilities `["Thai Massage", "Swedish Massage"]` matches a service requiring `["Thai Massage"]`.

6. **Feature Matching**: During booking, only facilities whose features include all items in `requiredFacilityFeatures` are shown as available. This ensures spa services are booked in spa rooms, not tennis courts.

7. **Max Participants**: For group services, `maxParticipants` limits how many members can be booked into a single time slot. Once the limit is reached, new bookings are rejected or directed to the waitlist.

8. **Service Deletion**: Services with future active bookings cannot be deleted. Services can be set to inactive instead, which prevents new bookings while keeping existing ones.

9. **Seasonal Services**: Services with status `seasonal` are only available during configured date ranges. This feature is designed but not yet implemented.

10. **Equipment Requirements (Planned)**: Services can require specific equipment categories. When `isRequired` is true, the system auto-reserves equipment from the category. When false, equipment is offered as an optional add-on at check-in.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Service deleted while booking wizard is open | Wizard continues with stale data. Submission fails with "Service not found" error. User is returned to service selection step. |
| Tier discount exceeds 100% | Form validation caps discount at 100%. A 100% discount results in free service (base price becomes 0). |
| Variation with negative price modifier | Allowed for `add` type (discount variation). Final price cannot go below 0; clamped at server side. |
| Service requires capabilities no staff member has | Service is bookable but no staff slots appear in the booking wizard. Error message: "No qualified staff available." |
| Service requires features no facility has | Service is bookable but no facility slots appear. Error message: "No suitable facilities available." |
| Two services with the same name | Allowed by the system. Differentiation is by category and internal ID. Consider adding unique constraint per club. |
| Buffer time longer than service duration | Allowed. A 15-minute service with 30-minute buffer results in 45 minutes of blocked time. |
| Max participants set to 1 for a group class | Effectively becomes a private session. Only one member can book per time slot. |
| Price set to 0 | Allowed. Complimentary services can have zero base price. Payment step is skipped during booking. |
| Update service duration while bookings exist | Allowed. Existing bookings retain their original duration. New bookings use the updated duration. |
| Service with no category | Not allowed. Category is a required field in the create/update form. |
| Concurrent updates to the same service | Last write wins. No optimistic locking is implemented. |
| Currency formatting for non-THB | Currently hardcoded to THB. Multi-currency support requires settings update and i18n integration. |
