# Build-Order Prompts: ClubVantage Booking System

## Overview
Self-contained prompts for building the ClubVantage booking system UI components across three areas: Admin Tabs (Facilities, Services, Staff configuration), Booking Detail Panel (staff-facing booking viewer), and Member Portal Booking (self-service member experience).

**Design System:** Primary=Amber, Secondary=Emerald, Neutral=Stone

## Build Sequence

### Phase 1: Foundation & Shared Components
1. StatusBadge - Reusable status indicator
2. OperatingHoursEditor - Day-by-day hours configuration
3. CapabilityBadge - Staff/service capability indicator

### Phase 2: Admin Tabs (Staff Configuration)
4. FacilitiesTable - Data table for facilities
5. FacilityModal - Add/Edit facility form
6. ServicesTable - Data table for services
7. ServiceModal - Add/Edit service form
8. VariationsEditor - Service add-ons configuration
9. StaffTable - Data table for staff
10. StaffModal - Add/Edit staff form
11. CapabilitiesEditor - Staff skills configuration
12. CertificationsEditor - Staff certifications with expiry

### Phase 3: Booking Detail Panel (Staff-Facing)
13. BookingDetailPanel - Slide-out container
14. PanelHeader - Status, booking ID, close
15. MemberContextCard - Member info with balance/history
16. BookingInfoCard - Service, time, staff, location
17. PaymentCard - Expandable price breakdown
18. NotesSection - Editable booking notes
19. CancelConfirmDialog - Cancellation with refund info

### Phase 4: Member Portal Booking
20. MyBookingsPage - Main member bookings layout
21. UpcomingBookingCard - Member booking card
22. PastBookingRow - Compact past booking row
23. WaitlistEntryCard - Waitlist position display
24. WaitlistOfferAlert - Countdown offer modal
25. BrowseCategories - Facility/service category grid
26. FacilityCard - Facility selection card
27. ServiceCard - Service selection card
28. MemberDatePicker - Calendar with availability
29. MemberTimeSlots - Available time slots grid
30. StaffPreferenceSelector - Optional staff choice
31. MemberVariationsPicker - Add-ons selection
32. MemberBookingSummary - Confirmation with price/policy
33. MemberCancelDialog - Member-facing cancel confirmation

---

## Prompt 1: StatusBadge

### Context
A reusable status indicator badge used across the booking system to show the current state of bookings, facilities, services, and staff. Appears in tables, cards, and detail panels.

### Requirements
- Pill-shaped badge with colored background and text
- Compact size for inline display
- Support multiple status types with distinct colors

### Status Colors
| Status | Background | Text |
|--------|------------|------|
| Active | Emerald-500 | White |
| Inactive | Stone-200 | Stone-600 |
| Maintenance | Amber-500 | White |
| Confirmed | Blue-500 | White |
| Completed | Stone-200 | Stone-700 |
| Cancelled | Stone-200 | Stone-500 (+ strikethrough on associated text) |
| No-Show | Red-500 | White |
| Pending | Amber-500 | White |

### Sizes
- `sm`: Height 20px, text-xs, padding 6px horizontal
- `md`: Height 24px, text-sm, padding 8px horizontal

### Props Interface
```typescript
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'maintenance' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'pending';
  size?: 'sm' | 'md';
}
```

### Constraints
- No click action (informational only)
- Do not include tooltip
- Border-radius: full (pill shape)

---

## Prompt 2: OperatingHoursEditor

### Context
A form component for configuring operating hours day-by-day. Used in Facility and Staff modals to set when a resource is available. Part of the admin configuration interface.

### Requirements
- 7 rows, one for each day (Monday through Sunday)
- Each row contains:
  - Checkbox to enable/disable the day
  - Day name label
  - Start time input (dropdown or time picker)
  - Dash separator "–"
  - End time input (dropdown or time picker)
- Disabled days show "Closed" instead of time inputs
- "Copy to all weekdays" button appears after Tuesday row
- Time increments: 15 minutes (e.g., 06:00, 06:15, 06:30...)
- Time format: 24-hour (06:00–22:00) or 12-hour based on locale preference

### Layout
```
☑ Monday      06:00  –  22:00
☑ Tuesday     06:00  –  22:00      [Copy to all weekdays]
☑ Wednesday   06:00  –  22:00
☑ Thursday    06:00  –  22:00
☑ Friday      06:00  –  22:00
☑ Saturday    08:00  –  20:00
☐ Sunday      Closed
```

### Validation
- End time must be after start time
- Show inline error if validation fails

### States
- Default: All weekdays enabled with sample hours
- Editing: Time dropdowns open on click
- Invalid: Red border on conflicting inputs

### Constraints
- Compact vertical layout
- Time inputs should be select dropdowns, not free text
- Do not include break periods (single continuous block per day)

---

## Prompt 3: CapabilityBadge

### Context
A small badge showing a capability or skill that a staff member has or that a service requires. Used in staff tables, service forms, and staff modals. Multiple badges appear inline.

### Requirements
- Pill-shaped badge with subtle background
- Text showing capability name
- Optional skill level indicator (for staff)
- Truncate long names with ellipsis

### Visual Specifications
- Background: Stone-100
- Text: Stone-700
- Border-radius: full
- Height: 24px
- Padding: 4px 10px
- Max-width: 150px (truncate beyond)

### Skill Level Variants (Staff only)
- Beginner: Stone-100 background
- Intermediate: Blue-100 background, Blue-700 text
- Advanced: Emerald-100 background, Emerald-700 text
- Expert: Amber-100 background, Amber-700 text

### Props Interface
```typescript
interface CapabilityBadgeProps {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  onRemove?: () => void; // Shows X button if provided
}
```

### Constraints
- Maximum 3 badges shown inline in tables, with "+N" for overflow
- X button for removal only in edit contexts

---

## Prompt 4: FacilitiesTable

### Context
A data table displaying all bookable facilities (courts, pools, rooms) in the admin Facilities tab. Staff use this to browse, filter, and manage facility configuration.

### Requirements
- Columns: Name (sortable), Type (badge), Location, Capacity, Status (dot + text), Actions
- Row hover: Light Stone-50 background
- Actions column: Edit (pencil icon) and Delete (trash icon), visible on hover
- Header row with column labels, sortable columns have sort indicator

### Column Specifications
| Column | Width | Content |
|--------|-------|---------|
| Name | 25% | Text, bold, sortable |
| Type | 15% | Badge (e.g., "Court", "Pool", "Room") |
| Location | 20% | Text |
| Capacity | 10% | Number |
| Status | 15% | Colored dot + text |
| Actions | 15% | Icon buttons |

### Status Indicators
- Active: Emerald dot + "Active"
- Inactive: Stone dot + "Inactive"
- Maintenance: Amber dot + "Maintenance"

### Filters Bar (above table)
- Type dropdown: All, Court, Pool, Room, etc.
- Location dropdown: All, Main Building, Aquatic Center, etc.
- Status dropdown: All, Active, Inactive, Maintenance
- "+ Add Facility" button (Amber, primary) on right

### States
- Loading: Skeleton rows (5 rows with pulsing animation)
- Empty: "No facilities configured yet" centered with Add button
- Populated: Normal table view
- Filtered empty: "No facilities match your filters" with clear filter link

### Pagination
- 10 rows per page
- "Showing X of Y facilities" text
- Page number buttons with prev/next arrows

### Constraints
- Design system: Stone borders, white background
- Do not include inline editing
- Delete action should be handled by parent (shows confirmation)

---

## Prompt 5: FacilityModal

### Context
A modal dialog for creating or editing a facility. Opens when clicking "Add Facility" or the edit icon on a facility row. Part of the admin configuration interface.

### Requirements
- Title: "Add Facility" or "Edit Facility" based on mode
- Close X button in header
- Scrollable body if content overflows
- Fixed footer with Cancel and Save buttons

### Form Fields
```
Name *                    [Text input, required]
Description              [Textarea, optional]

Type *                   Location *
[Dropdown, required]     [Dropdown, required]

Capacity *               Status *
[Number input]           [Dropdown: Active/Inactive/Maintenance]

Features
☐ Lighting    ☐ Covered    ☐ Air-conditioned    ☐ Equipment included

─── Operating Hours ───
[OperatingHoursEditor component]

─── Financial ───
Revenue Center           Outlet
[Dropdown]              [Dropdown]
```

### Field Validations
- Name: Required, max 100 characters
- Type: Required selection
- Location: Required selection
- Capacity: Required, positive integer

### States
- Loading (edit mode): Skeleton form fields
- Ready: Form editable
- Validating: Inline error messages below invalid fields
- Saving: Button shows spinner, form disabled
- Success: Modal closes, parent shows toast

### Buttons
- Cancel: Secondary style, closes modal without saving
- Save Facility: Amber primary, submits form

### Modal Specifications
- Width: 600px on desktop, full width on mobile
- Max-height: 80vh, scrollable body
- Overlay: Stone-900/50
- Border-radius: 12px

### Constraints
- Do not include image upload
- Do not include pricing (facilities don't have prices)

---

## Prompt 6: ServicesTable

### Context
A data table displaying all bookable services (spa treatments, fitness classes, training sessions) in the admin Services tab. Staff use this to browse and manage service configuration.

### Requirements
- Columns: Name (sortable), Category (badge), Duration, Base Price, Status, Variations, Actions
- Row hover: Light Stone-50 background
- Actions column: Edit (pencil) and Delete (trash) icons

### Column Specifications
| Column | Width | Content |
|--------|-------|---------|
| Name | 25% | Text, bold, sortable |
| Category | 15% | Badge (Spa, Fitness, Sports, etc.) |
| Duration | 12% | "60 min" format |
| Base Price | 13% | Currency format "$120.00" |
| Status | 10% | Colored dot |
| Variations | 10% | Count "3 add-ons" or "—" |
| Actions | 15% | Icon buttons |

### Category Badge Colors
- Spa: Purple-100/Purple-700
- Fitness: Blue-100/Blue-700
- Sports: Emerald-100/Emerald-700
- Training: Amber-100/Amber-700

### Filters Bar
- Category dropdown: All, Spa, Fitness, Sports, Training
- Duration dropdown: All, 30 min, 60 min, 90 min, 120+ min
- Status dropdown: All, Active, Inactive
- "+ Add Service" button on right

### States
- Loading: Skeleton rows
- Empty: "No services configured yet" with Add button
- Populated: Normal table
- Filtered empty: "No services match your filters"

### Pagination
- 10 rows per page
- Standard pagination controls

### Constraints
- Price shown in Thai Baht (฿) or configured currency
- Do not include inline price editing

---

## Prompt 7: ServiceModal

### Context
A modal for creating or editing a service. Complex form with multiple sections for duration, pricing, requirements, and variations. Admin configuration interface.

### Requirements
- Title: "Add Service" or "Edit Service"
- Sectioned layout with dividers
- Scrollable body

### Form Sections

**Basic Information**
```
Name *                    Category *
[Text input]              [Dropdown]

Description
[Textarea]
```

**Duration & Pricing**
```
Duration *        Buffer Time       Base Price *
[Dropdown]        [Number input]    [Currency input]
60 min ▼          15 min            $120.00

Tier Discounts
Gold Members:     5% off
Platinum Members: 10% off           [Edit Discounts]
```

**Requirements**
```
Staff Capabilities Required *
[Multi-select with badge chips]
[Thai Massage ×] [Body Work ×]                    + Add

Facility Features Required
[Multi-select with badge chips]
[Treatment Table ×] [Private Room ×]              + Add
```

**Variations & Add-ons**
```
┌─────────────────────────────────────────────────────┐
│ Aromatherapy oils           +$15.00    [Edit] [×]  │
│ Hot stone enhancement       +$25.00    [Edit] [×]  │
└─────────────────────────────────────────────────────┘
                                    [+ Add Variation]
```

**Financial**
```
Revenue Center            Status
[Dropdown]               [Dropdown: Active/Inactive]
```

### Duration Options
- 30 min, 45 min, 60 min, 75 min, 90 min, 120 min, 180 min

### States
- Loading: Skeleton fields
- Ready: All sections editable
- Saving: Button spinner

### Modal Specifications
- Width: 700px desktop, full width mobile
- Max-height: 85vh, scrollable
- Section dividers: 1px Stone-200 with 24px margin

### Constraints
- Tier discounts open separate inline form when clicking "Edit Discounts"
- At least one capability required if category requires staff

---

## Prompt 8: VariationsEditor

### Context
An inline list editor for service variations/add-ons. Embedded within the ServiceModal. Allows adding, editing, and removing price modifiers for a service.

### Requirements
- Each row displays: Variation name, price modifier, Edit button, Remove button
- Add button at bottom: "+ Add Variation"
- Inline edit mode when clicking Edit or Add

### List Item Layout
```
│ Aromatherapy oils           +$15.00       [Edit] [×] │
```

### Inline Edit Form (replaces row when editing)
```
│ Name: [_______________]  Price: [+/-▼] [$___.__]  [Save] [Cancel] │
```

### Price Type Dropdown
- "+" Add to base price (most common)
- "=" Replace base price (for package variants)

### Validation
- Name required, max 50 characters
- Price required, positive number

### States
- List view: Shows all variations
- Adding: New inline form at bottom
- Editing: Row transforms to inline form
- Confirming delete: "Remove this variation?" inline confirmation

### Constraints
- Maximum 20 variations per service
- Do not allow duplicate names
- Show preview: "+$15.00" or "$95.00" based on price type

---

## Prompt 9: StaffTable

### Context
A data table displaying all staff members who can be assigned to bookings. Part of the admin Staff tab. Shows photo, capabilities, and utilization.

### Requirements
- Columns: Photo+Name, Capabilities (badges), Status, Utilization, Actions
- Photo: 32px circular avatar
- Capabilities: Up to 3 badges shown, "+N" for overflow

### Column Specifications
| Column | Width | Content |
|--------|-------|---------|
| Photo+Name | 25% | Avatar + full name |
| Capabilities | 30% | Capability badges (max 3 + overflow) |
| Status | 15% | Colored dot + text |
| Utilization | 15% | Progress bar + percentage |
| Actions | 15% | Edit, View Schedule, Delete icons |

### Utilization Bar
- Horizontal bar, 80px width, 6px height
- Color coding:
  - 0-50%: Stone-300
  - 50-80%: Emerald-500
  - 80-100%: Amber-500
- Percentage text next to bar

### Filters Bar
- Capability dropdown: All, Thai Massage, Swedish Massage, etc.
- Status dropdown: All, Active, Inactive
- Location dropdown: All, Main Spa, Fitness Center, etc.
- "+ Add Staff" button on right

### Actions
- Edit (pencil): Opens StaffModal
- View Schedule (calendar): Navigates to calendar filtered by staff
- Delete (trash): Shows confirmation

### States
- Loading: Skeleton with avatar placeholders
- Empty: "No staff configured yet"
- Populated: Normal table

### Constraints
- Avatar placeholder if no photo: Initials on Stone-200 background
- Utilization tooltip: "XX hours booked this week"

---

## Prompt 10: StaffModal

### Context
A comprehensive modal for adding or editing a staff member. Includes personal info, capabilities, certifications, and schedule configuration.

### Requirements
- Title: "Add Staff Member" or "Edit Staff Member"
- Photo upload area
- Multiple sections with dividers

### Form Layout

**Personal Information**
```
┌──────────────┐
│   [Upload    │  First Name *        Last Name *
│    Photo]    │  [_______________]   [_______________]
│              │
└──────────────┘  Email                Phone
                  [_______________]   [_______________]

Link to User Account (optional)
[🔍 Search user...                                    ]
ⓘ Linking allows this staff member to log in and view schedule
```

**Capabilities Section**
```
─── Capabilities ───

┌─────────────────────────────────────────────────────┐
│ Capability            │ Skill Level                │
├─────────────────────────────────────────────────────┤
│ Thai Massage      ▼   │ ● Expert              ▼   │
│ Swedish Massage   ▼   │ ● Advanced            ▼   │
│ Aromatherapy      ▼   │ ● Intermediate        ▼   │
└─────────────────────────────────────────────────────┘
                                    [+ Add Capability]
```

**Certifications Section**
```
─── Certifications ───

┌─────────────────────────────────────────────────────┐
│ Licensed Massage Therapist    Exp: Dec 2026   ✓    │
│ First Aid Certified           Exp: Jun 2026   ⚠    │
└─────────────────────────────────────────────────────┘
                                [+ Add Certification]
```
- ✓ Valid (green): Expires > 90 days
- ⚠ Expiring (amber): Expires < 90 days
- ✗ Expired (red): Past expiration

**Schedule Section**
```
─── Schedule ───

Default Facility
[Spa Treatment Room 1                              ▼]

Working Hours
[OperatingHoursEditor component]

Status
[Active                                            ▼]
```

### Modal Specifications
- Width: 700px
- Photo upload: 100px square, click to upload
- Avatar preview shows uploaded image

### Constraints
- User link is search-as-you-type for existing Users
- Prevent duplicate capabilities

---

## Prompt 11: CapabilitiesEditor

### Context
An inline editor for staff capabilities within the StaffModal. Each row pairs a capability with a skill level.

### Requirements
- Table-like rows with two columns
- Capability dropdown (left)
- Skill Level dropdown (right)
- Remove button on each row
- Add button at bottom

### Row Layout
```
│ [Thai Massage        ▼] │ [● Expert           ▼] │ [×] │
```

### Capability Options (from predefined list)
- Thai Massage, Swedish Massage, Deep Tissue, Aromatherapy
- Personal Training, Group Fitness, Yoga Instruction
- Tennis Coaching, Golf Instruction, Swimming Instruction

### Skill Level Options
- Beginner (●○○○)
- Intermediate (●●○○)
- Advanced (●●●○)
- Expert (●●●●)

### Validation
- Cannot add duplicate capabilities
- At least one capability required for service staff

### States
- Empty: "No capabilities added" with Add button
- Adding: New row with dropdowns
- Removing: Row fades out

### Constraints
- Maximum 10 capabilities per staff member
- Show badge preview in dropdown options

---

## Prompt 12: CertificationsEditor

### Context
An inline editor for staff certifications with expiration tracking. Shows validity status based on expiration date.

### Requirements
- Each row: Certification name, expiration date, validity indicator
- Add/Edit/Remove functionality
- Visual warning for expiring/expired certifications

### Row Layout
```
│ Licensed Massage Therapist │ Exp: Dec 2026 │ ✓ Valid  │ [Edit] [×] │
│ First Aid Certified        │ Exp: Jun 2026 │ ⚠ Expiring│ [Edit] [×] │
│ CPR Certification          │ Exp: Jan 2026 │ ✗ Expired │ [Edit] [×] │
```

### Validity Indicators
- ✓ Valid (Emerald): Expires > 90 days from now
- ⚠ Expiring Soon (Amber): Expires within 90 days
- ✗ Expired (Red): Past expiration date

### Add/Edit Form
```
Certification Name *         Expiration Date *
[________________________]   [Date picker]
                                          [Save] [Cancel]
```

### States
- List view: Shows all certifications with status
- Adding: Inline form at bottom
- Editing: Row transforms to form

### Constraints
- Date picker should not allow past dates for new certs
- Expired certs can be edited to renew (update date)
- Do not auto-delete expired certifications

---

## Prompt 13: BookingDetailPanel

### Context
A slide-out panel for viewing complete booking details. Opens when staff click on a booking in the calendar. Shows member info, booking details, pricing, and action buttons.

### Requirements
- Slides in from right edge on desktop
- Full width bottom sheet on mobile
- Contains multiple sections: Header, Member, Booking, Payment, Notes
- Fixed footer with action buttons

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ ← Booking Details                         × │  ← Header
├─────────────────────────────────────────────┤
│ [Confirmed]              #BK-2026-0142      │  ← Status + ID
├─────────────────────────────────────────────┤
│                                             │
│ MEMBER                                      │  ← MemberContextCard
│ ┌─────────────────────────────────────────┐ │
│ │ [Photo] Name, Membership, Balance       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ BOOKING                                     │  ← BookingInfoCard
│ ┌─────────────────────────────────────────┐ │
│ │ Service, Date, Time, Staff, Location    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ PAYMENT                                     │  ← PaymentCard
│ ┌─────────────────────────────────────────┐ │
│ │ Total with expandable breakdown         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ NOTES                                       │  ← NotesSection
│ ┌─────────────────────────────────────────┐ │
│ │ Booking notes (editable)                │ │
│ └─────────────────────────────────────────┘ │
│                                             │
├─────────────────────────────────────────────┤
│        [Modify]           [Cancel]          │  ← Actions
└─────────────────────────────────────────────┘
```

### Panel Specifications
- Width: 400px (desktop), 100% (mobile)
- Height: 100vh
- Background: White
- Shadow: lg
- Overlay: Stone-900/50 opacity
- Animation: Slide in 300ms ease-out

### Close Triggers
- X button click
- Overlay/backdrop click
- Escape key press

### States
- Loading: Skeleton sections
- Loaded: Full content visible
- Error: Error message with retry button

### Mobile Bottom Sheet
- Drag handle at top (centered pill, 40px × 4px)
- Max height: 90vh
- Swipe down to close

### Constraints
- Body is scrollable, footer fixed
- Do not include check-in button (separate flow)

---

## Prompt 14: PanelHeader

### Context
The header section of BookingDetailPanel showing booking status, ID, and close controls.

### Requirements
- Back arrow on mobile (left side)
- Title "Booking Details" (center on mobile, left on desktop)
- Close X button (right side)
- Status badge below title
- Booking ID with copy functionality

### Layout
```
Desktop:
│ ← Booking Details                              × │
│ [Confirmed]                        #BK-2026-0142 │

Mobile:
│ ←          Booking Details                     × │
│         [Confirmed]  #BK-2026-0142               │
```

### Booking ID
- Click to copy to clipboard
- Show "Copied!" toast on success
- Format: #BK-YYYY-NNNN

### Status Badge
- Use StatusBadge component
- Position: Left of booking ID on desktop, centered on mobile

### Constraints
- Height: 60px (without status row)
- Border-bottom: 1px Stone-200
- Back arrow only on mobile (use X on desktop)

---

## Prompt 15: MemberContextCard

### Context
A card within BookingDetailPanel showing member information relevant to the booking. Helps staff identify the member and understand their account status.

### Requirements
- Member photo (48px circle)
- Name (bold, clickable to profile)
- Membership type badge
- Email and phone (clickable)
- Account balance
- Recent bookings summary
- No-show count

### Layout
```
┌─────────────────────────────────────────────────────┐
│ ┌────┐  John Smith              [View Profile →]   │
│ │ 👤 │  Gold Member                                │
│ └────┘  john@email.com  •  +1 555-0123             │
│         Balance: $150.00 credit                    │
│                                                     │
│  Recent: Tennis Jan 20, Spa Jan 15                 │
│  No-shows: 0                                       │
└─────────────────────────────────────────────────────┘
```

### Balance Display
- Credit: Emerald text "Balance: $150.00 credit"
- Due: Red text "Balance: $50.00 due"
- Zero: Stone text "Balance: $0.00"

### Suspended Warning (conditional)
If member is suspended, show alert above card:
```
⚠ Member account is suspended. Check-in disabled.
```
- Background: Red-50
- Text: Red-700
- Icon: AlertTriangle

### Interactions
- Click name/photo: Navigate to member profile
- Click email: Opens mailto
- Click phone: Opens tel

### Card Specifications
- Background: Stone-50
- Border: 1px Stone-200
- Border-radius: 8px
- Padding: 16px

### Constraints
- Recent bookings: Last 2-3 as comma-separated text
- No-show count: Highlight red if > 0

---

## Prompt 16: BookingInfoCard

### Context
A card showing the core booking details: what was booked, when, with whom, and where. Read-only information display.

### Requirements
- Service/facility name (prominent)
- Add-ons listed below service name
- Date with day of week
- Time range with duration
- Staff name (if applicable)
- Facility/room (if applicable)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ Thai Massage                                        │
│ + Hot stone enhancement                             │
│                                                     │
│ 📅  Saturday, January 25, 2026                      │
│ ⏰  2:00 PM - 3:30 PM (90 min)                      │
│                                                     │
│ 👤  Therapist: Sarah Chen                           │
│ 📍  Treatment Room 3                                │
└─────────────────────────────────────────────────────┘
```

### Icon Specifications
- 📅 Calendar: Calendar icon, Stone-500
- ⏰ Time: Clock icon, Stone-500
- 👤 Staff: User icon, Stone-500
- 📍 Location: MapPin icon, Stone-500

### Text Styling
- Service name: Text-lg, font-semibold
- Add-ons: Text-sm, Stone-600, prefixed with "+"
- Detail rows: Text-sm, icon + label spacing 8px

### Card Specifications
- Background: Stone-50
- Border: 1px Stone-200
- Border-radius: 8px
- Padding: 16px

### Constraints
- Staff row only shown if staff assigned
- Facility row only shown if facility assigned
- Duration shown in parentheses after time range

---

## Prompt 17: PaymentCard

### Context
A card showing pricing information with an expandable breakdown. Collapsed by default showing just the total, expands to show line items, payment method, and status.

### Requirements
- Collapsed: Total amount with expand chevron
- Expanded: Base price, variations, discounts, method, status
- Smooth height animation on expand/collapse

### Collapsed Layout
```
┌─────────────────────────────────────────────────────┐
│ Total: $175.75                           [▼]       │
└─────────────────────────────────────────────────────┘
```

### Expanded Layout
```
┌─────────────────────────────────────────────────────┐
│ Total: $175.75                           [▲]       │
│ ────────────────────────────────────────────────── │
│ Base (90 min):                        $160.00      │
│ Hot stone:                             $25.00      │
│ Gold discount (5%):                    -$9.25      │
│ ────────────────────────────────────────────────── │
│ Method: Member Credits                             │
│ Status: ✓ Paid                                     │
└─────────────────────────────────────────────────────┘
```

### Price Styling
- Positive amounts: Stone-900
- Discounts: Emerald-600, prefixed with "-"
- Total: Font-semibold, text-lg

### Payment Status
- ✓ Paid: Emerald icon and text
- ⏳ Pending: Amber icon and text
- ✗ Refunded: Stone icon and text

### Animation
- Height transition: 200ms ease-out
- Chevron rotation: 180deg

### Constraints
- Collapse if only base price (no variations/discounts)
- Right-align all amounts

---

## Prompt 18: NotesSection

### Context
An editable notes area within BookingDetailPanel for staff to add or modify booking-specific notes.

### Requirements
- Shows existing notes as text
- Edit button to enter edit mode
- Auto-save or explicit save button
- Character limit indicator

### View Mode
```
┌─────────────────────────────────────────────────────┐
│ NOTES                                     [Edit]   │
│                                                     │
│ Member requested extra pillows. Prefers low        │
│ lighting during treatment.                         │
└─────────────────────────────────────────────────────┘
```

### Edit Mode
```
┌─────────────────────────────────────────────────────┐
│ NOTES                                              │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ Member requested extra pillows. Prefers low    ││
│ │ lighting during treatment.                     ││
│ │                                                ││
│ └─────────────────────────────────────────────────┘│
│                                   145/500 characters│
│                              [Cancel]  [Save Notes] │
└─────────────────────────────────────────────────────┘
```

### Empty State
```
│ No notes added.                          [+ Add]   │
```

### States
- View: Read-only text with Edit button
- Editing: Textarea with Save/Cancel
- Saving: Save button shows spinner
- Saved: Brief checkmark, returns to view mode

### Constraints
- Maximum 500 characters
- Auto-resize textarea up to 150px height
- Confirm discard if closing panel with unsaved changes

---

## Prompt 19: CancelConfirmDialog

### Context
A confirmation dialog shown when staff click Cancel on a booking. Displays refund information based on cancellation policy before allowing confirmation.

### Requirements
- Modal dialog centered on screen
- Booking summary
- Cancellation policy display
- Refund amount calculation
- Optional: Waive fee checkbox (for authorized staff)
- Confirm and Cancel buttons

### Layout
```
┌─────────────────────────────────────────────────────┐
│ Cancel Booking?                                   × │
├─────────────────────────────────────────────────────┤
│                                                     │
│ You are about to cancel:                           │
│                                                     │
│ 💆 Thai Massage (90 min)                           │
│ Saturday, Jan 25 at 2:00 PM                        │
│ Member: John Smith                                  │
│                                                     │
│ ────────────────────────────────────────────────── │
│                                                     │
│ Cancellation Policy                                 │
│ Booking is in 3 days (>48 hours notice)            │
│                                                     │
│ Refund Amount: $175.75 (full refund)               │
│                                                     │
│ ☐ Waive cancellation fee                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│         [Keep Booking]        [Cancel Booking]      │
└─────────────────────────────────────────────────────┘
```

### Refund Tiers (example)
- >48 hours: Full refund
- 24-48 hours: 50% refund
- <24 hours: No refund

### Button Styling
- Keep Booking: Secondary (Stone outline)
- Cancel Booking: Destructive (Red-500 outline, red text)

### Modal Specifications
- Width: 400px
- Border-radius: 12px
- Overlay: Stone-900/50

### States
- Ready: Buttons enabled
- Processing: Cancel button shows spinner
- Success: Dialog closes, panel updates

### Constraints
- "Waive fee" checkbox only visible to managers
- Cannot cancel past bookings (button disabled)
- Require explicit click, not Enter key

---

## Prompt 20: MyBookingsPage

### Context
The main member-facing bookings page showing upcoming and past bookings. Part of the member portal self-service experience.

### Requirements
- Header with title and "+ Book" button
- Upcoming section grouped by date
- Waitlist section (if any)
- Past bookings section (collapsed, expandable)

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ MY BOOKINGS                                          [+ Book]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ UPCOMING                                                        │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TODAY                                                       │ │
│ │ [UpcomingBookingCard]                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ SATURDAY, JAN 25                                            │ │
│ │ [UpcomingBookingCard]                                       │ │
│ │ [UpcomingBookingCard]                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ WAITLIST                                                        │
│ [WaitlistEntryCard]                                            │
│                                                                 │
│ PAST BOOKINGS                                    [View All →]   │
│ [PastBookingRow]                                               │
│ [PastBookingRow]                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Date Grouping
- "TODAY" for today's bookings (highlighted)
- "TOMORROW" for next day
- "WEEKDAY, MMM DD" for other dates

### Empty States
- No upcoming: "No upcoming bookings" with Book button
- No waitlist: Section hidden
- No past: "No booking history yet"

### Mobile Considerations
- Full width cards
- Sticky header with "+ Book" button
- Swipe actions on cards: Modify, Cancel

### Constraints
- Maximum 5 past bookings shown, "View All" for more
- Waitlist section only shown if entries exist

---

## Prompt 21: UpcomingBookingCard

### Context
A card displaying a single upcoming booking in the member portal. Shows key details and provides quick access to modify actions.

### Requirements
- Type icon (facility/service specific)
- Service/facility name (bold)
- Duration and staff name
- Time prominently displayed
- Modify button
- Expandable for full details

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌────┐                                                          │
│ │ 💆 │  Thai Massage                                  2:00 PM  │
│ └────┘  90 min with Sarah Chen                        [Modify] │
│                                                                 │
│ [Expanded details when tapped]                                  │
│ ────────────────────────────────────────────────────────────── │
│ 📍 Treatment Room 3                                             │
│ 💰 $175.75                                                      │
│ ⓘ Cancel: Full refund if >48 hours before                      │
│                                              [Cancel Booking]   │
└─────────────────────────────────────────────────────────────────┘
```

### Type Icons
- 🎾 Tennis, racket sports
- 🏊 Pool, swimming
- 💆 Spa, treatments
- 🧘 Fitness, yoga
- 🏋️ Gym, training

### Card States
- Upcoming: Normal styling
- Today: Amber left border accent
- Cancelled: Muted colors, strikethrough on name

### Interactions
- Tap card: Expand details
- Tap Modify: Open modify flow
- Tap Cancel: Open cancel dialog
- Swipe left (mobile): Reveal Cancel action

### Card Specifications
- Background: White
- Border: 1px Stone-200
- Border-radius: 12px
- Shadow: sm
- Padding: 16px

### Constraints
- Touch target: Minimum 44px for buttons
- Cancel link only in expanded state

---

## Prompt 22: PastBookingRow

### Context
A compact row displaying a past booking in the member's booking history. Minimal information, just enough for reference.

### Requirements
- Single line layout
- Date, service name, duration
- Status indicator for cancelled/no-show
- Tap to view full details

### Layout
```
│ Jan 20 • Tennis Court 2 • 60 min                               │
│ Jan 18 • Spa Treatment • 90 min                                │
│ Jan 15 • Pool Lane 3 • 30 min          [Cancelled]             │
```

### Styling
- Text: Stone-600 (muted for past)
- Cancelled: Stone-400 with strikethrough + badge
- No-show: Red-500 badge

### Constraints
- Height: 44px per row
- Separator: 1px Stone-100 between rows
- Maximum 5 shown, "View All" link for more

---

## Prompt 23: WaitlistEntryCard

### Context
A card showing the member's position in a waitlist for a time slot. Provides transparency about queue position and option to leave.

### Requirements
- Waiting icon
- Facility/service and requested time
- Queue position
- Leave waitlist button

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ⏳  Pool Lane • Sunday 9:00 AM                                  │
│     Position: 3rd in queue                          [Leave]    │
└─────────────────────────────────────────────────────────────────┘
```

### Position Display
- "1st in queue" / "2nd in queue" / "3rd in queue" etc.
- If first: "You're next!" in Emerald

### States
- Waiting: Normal display
- First in queue: Highlighted with "You're next!"
- Offer received: Transforms to WaitlistOfferAlert

### Constraints
- Background: Stone-50
- Border: 1px dashed Stone-300
- Leave confirmation: "Leave this waitlist?"

---

## Prompt 24: WaitlistOfferAlert

### Context
A prominent alert/modal shown when a waitlist slot becomes available for a member. Includes countdown timer and requires quick action.

### Requirements
- Celebration visual (emoji or icon)
- "A Slot is Available!" heading
- Slot details (what, when)
- Countdown timer
- Accept and Decline buttons

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ 🎉 A Slot is Available!                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Pool Lane 3 is now available:                                   │
│ Sunday, Jan 26 at 9:00 AM                                       │
│                                                                 │
│ ⏱️ This offer expires in 28 minutes                             │
│                                                                 │
│ ┌─────────────────────┐  ┌─────────────────────┐               │
│ │   Accept & Book     │  │      Decline        │               │
│ └─────────────────────┘  └─────────────────────┘               │
│                                                                 │
│ If you decline, you'll remain in the waitlist for other slots. │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Timer Display
- Updates every minute
- Color change:
  - >10 min: Stone-600
  - 5-10 min: Amber-500
  - <5 min: Red-500 (pulsing)

### Button Styling
- Accept: Amber primary, prominent
- Decline: Stone outline, secondary

### Behavior
- Auto-close if expired while viewing
- Show "Offer expired" message if missed
- Push notification should also trigger

### Modal Specifications
- Desktop: Centered modal, 450px width
- Mobile: Full-screen or bottom sheet
- Cannot dismiss by clicking outside

### Constraints
- Timer countdown in real-time
- Accepting goes to payment flow
- Declining keeps in queue for other slots

---

## Prompt 25: BrowseCategories

### Context
The category selection grid in the member booking flow. First step where members choose what type of thing they want to book.

### Requirements
- Two sections: Facilities and Services
- Category cards with icons
- Brief description or count

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ BOOK A FACILITY OR SERVICE                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ FACILITIES                                                      │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐          │
│ │   🎾          │ │   🏊          │ │   🏋️          │          │
│ │  Tennis       │ │   Pool        │ │    Gym        │          │
│ │  4 courts     │ │  6 lanes      │ │  Equipment    │          │
│ └───────────────┘ └───────────────┘ └───────────────┘          │
│                                                                 │
│ SERVICES                                                        │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐          │
│ │   💆          │ │   🧘          │ │   👤          │          │
│ │   Spa         │ │  Fitness      │ │  Training     │          │
│ │  Treatments   │ │  Classes      │ │  Sessions     │          │
│ └───────────────┘ └───────────────┘ └───────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Category Card
- Icon: 40px, centered
- Category name: font-medium
- Description: text-sm, Stone-500

### Card Specifications
- Size: Equal width, responsive grid
- Background: White
- Border: 1px Stone-200
- Border-radius: 12px
- Hover: Stone-50 background, slight shadow

### Grid Layout
- Desktop: 3-4 cards per row
- Mobile: 2 cards per row

### Constraints
- Icon should be emoji or Lucide icon
- Clicking navigates to facility/service list

---

## Prompt 26: FacilityCard

### Context
A card for selecting a specific facility within a category. Used after member selects a facility category (e.g., Tennis → Tennis Court 1).

### Requirements
- Facility image or placeholder
- Facility name
- Key attributes (capacity, features)
- Availability indicator
- Selection state

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────┐                            │
│ │                                 │                            │
│ │         [Facility Image]        │                            │
│ │                                 │                            │
│ └─────────────────────────────────┘                            │
│ Tennis Court 1                                      ● Available │
│ Outdoor • 4 players • Lighting                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Availability Indicator
- ● Available: Emerald dot
- ● Limited: Amber dot (few slots left today)
- ● Unavailable: Stone dot (waitlist only)

### Selection State
- Unselected: White background
- Selected: Amber border, Amber-50 background
- Disabled: Opacity 50%, not clickable

### Constraints
- Image placeholder if no photo: Stone-100 with icon
- Features shown as inline text with "•" separator

---

## Prompt 27: ServiceCard

### Context
A card for selecting a specific service. Used when browsing services or after selecting a service category.

### Requirements
- Service icon
- Service name
- Duration and price
- Brief description
- Selection state

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌────┐                                                          │
│ │ 💆 │  Thai Massage                                           │
│ └────┘  Traditional Thai massage therapy                        │
│                                                                 │
│         60 min                                      from $120   │
└─────────────────────────────────────────────────────────────────┘
```

### Price Display
- Single price: "$120"
- Range (with variations): "from $120"
- Tier discount note: "$114 for Gold Members" (smaller text)

### Selection State
- Unselected: White background
- Selected: Amber border, Amber-50 background, checkmark icon

### Constraints
- Description: Max 2 lines, truncate with ellipsis
- "from" prefix if variations exist

---

## Prompt 28: MemberDatePicker

### Context
A calendar component for members to select a date for their booking. Shows availability hints per day.

### Requirements
- Month/year header with navigation
- 7-column day grid (Mo-Su)
- Availability indicators per day
- Today indicator
- Selected date highlight

### Layout
```
┌───────────────────────────────────────┐
│   ←    January 2026    →              │
│ Mo Tu We Th Fr Sa Su                  │
│     1  2  3  4  5                     │
│  6  7  8  9 10 11 12                  │
│ 13 14 15 16 17 18 19                  │
│ 20 21 22 23 24[25]26                  │
│ 27 28 29 30 31                        │
└───────────────────────────────────────┘
```

### Day States
- Available: Normal text, clickable
- Limited: Amber underline (few slots)
- Unavailable: Stone-400 text, not clickable
- Waitlist only: Dashed underline
- Selected: Amber background, white text
- Today: Underline or dot indicator

### Navigation
- Left/right arrows for month
- Swipe gesture on mobile

### Constraints
- Past dates: Grayed, not selectable
- Future limit: Based on advance booking window
- Hover on desktop: Show "X slots available" tooltip

---

## Prompt 29: MemberTimeSlots

### Context
A grid of available time slots for the selected date. Shows all slots with availability status.

### Requirements
- Time slots as pill buttons
- Available/unavailable states
- Waitlist option for full slots
- Selected state

### Layout
```
Available Times for Saturday, Jan 25

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ 10:00  │ │ 11:30  │ │  1:00  │ │  2:30  │
│   AM   │ │   AM   │ │   PM   │ │   PM   │
└────────┘ └────────┘ └────────┘ └────────┘

┌────────┐
│  4:00  │  Evening fully booked [Join Waitlist]
│   PM   │
└────────┘
```

### Slot States
- Available: Amber outline, clickable
- Selected: Amber filled, white text
- Unavailable: Stone-200 background, Stone-400 text
- Limited: Amber outline + "2 left" badge

### Waitlist Link
- Shown next to unavailable time periods
- "Join Waitlist" text link
- Opens waitlist confirmation

### Layout
- 4 columns on desktop
- 3 columns on mobile
- Group by time period (Morning, Afternoon, Evening)

### Constraints
- Slot size based on service duration
- Show actual times, not just "Morning"

---

## Prompt 30: StaffPreferenceSelector

### Context
An optional selector for members to request a specific staff member. Some services allow staff preference, others auto-assign.

### Requirements
- Radio button list
- "Any available" default option
- Staff photos and names
- Availability indicator

### Layout
```
Staff Preference (optional)

○ Any available therapist

● ┌────┐ Sarah Chen                    ● Available
  │ 👤 │
  └────┘

○ ┌────┐ John Kim                      ● Available
  │ 👤 │
  └────┘

○ ┌────┐ Mary Wong                     ○ Unavailable
  │ 👤 │
  └────┘
```

### Staff Item
- Radio button
- Avatar (32px circle)
- Name
- Availability for selected date/time

### Availability
- ● Available: Emerald text
- ○ Unavailable: Stone text (radio disabled)

### Constraints
- "Any available" always first and default
- Unavailable staff shown but not selectable
- Only shown if service allows staff selection

---

## Prompt 31: MemberVariationsPicker

### Context
A picker for service add-ons and variations. Members can customize their booking with optional extras.

### Requirements
- List of available variations
- Checkbox for each (multi-select)
- Price modifier shown
- Running total update

### Layout
```
Add-ons (optional)

☐ Aromatherapy oils                           +$15.00
☑ Hot stone enhancement                       +$25.00
☐ Extended scalp massage                      +$20.00

─────────────────────────────────────────────────────
Current total:                                $185.00
```

### Checkbox Item
- Checkbox with label
- Price modifier right-aligned
- Description below (if exists)

### Total Display
- Updates live as selections change
- Shows base + selected add-ons
- Discount preview if applicable

### Constraints
- Some variations may be mutually exclusive
- Maximum selection limits per service

---

## Prompt 32: MemberBookingSummary

### Context
The final confirmation step for member booking. Shows complete summary with price, payment options, and cancellation policy.

### Requirements
- Service/facility name with add-ons
- Date and time
- Staff (if selected)
- Price breakdown
- Payment method selection
- Cancellation policy
- Back and Confirm buttons

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Confirm Your Booking                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 💆 Thai Massage (90 min)                                        │
│ + Hot stone enhancement                                         │
│                                                                 │
│ 📅 Saturday, January 25, 2026                                   │
│ ⏰ 10:00 AM - 11:30 AM                                          │
│ 👤 Sarah Chen                                                   │
│                                                                 │
│ ─────────────────────────────────────────────────────────────   │
│                                                                 │
│ Price                                                           │
│ Base (90 min):                              $160.00             │
│ Hot stone:                                   $25.00             │
│ Gold Member discount (5%):                   -$9.25             │
│ ─────────────────────────────────────                           │
│ Total:                                      $175.75             │
│                                                                 │
│ Payment Method                                                  │
│ ● Charge to my account                                          │
│ ○ Use my credits ($150.00 available)                            │
│                                                                 │
│ ─────────────────────────────────────────────────────────────   │
│                                                                 │
│ ⓘ Cancellation Policy                                           │
│ • Full refund if cancelled >48 hours before                     │
│ • 50% refund if cancelled 24-48 hours before                    │
│ • No refund if cancelled <24 hours before                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│         [← Back]                        [Confirm Booking]       │
└─────────────────────────────────────────────────────────────────┘
```

### Price Section
- Tabular alignment for amounts
- Discounts in Emerald with "-" prefix
- Total bold and larger

### Payment Options
- Account charge: Default if good standing
- Credits: Show available balance
- Disabled options show reason

### Policy Section
- Info icon
- Muted text
- Can be collapsible (starts expanded)

### Buttons
- Back: Secondary, navigates to previous step
- Confirm: Amber primary, submits booking

### Constraints
- Cannot confirm if insufficient credits (when selected)
- Show loading state on confirm

---

## Prompt 33: MemberCancelDialog

### Context
A confirmation dialog for members cancelling their own booking. Shows refund information based on timing and policy.

### Requirements
- Clear title "Cancel Booking?"
- Booking summary
- Time until booking
- Applicable policy tier
- Refund amount
- Refund destination
- Keep and Cancel buttons

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Cancel Booking?                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You're about to cancel:                                         │
│                                                                 │
│ 💆 Thai Massage (90 min)                                        │
│ Saturday, Jan 25 at 10:00 AM                                    │
│                                                                 │
│ ─────────────────────────────────────────────────────────────   │
│                                                                 │
│ Refund Information                                              │
│                                                                 │
│ Your booking is in 3 days (>48 hours).                          │
│ You will receive a full refund of $175.75                       │
│                                                                 │
│ ⓘ The refund will be credited to your member account.           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│       [Keep Booking]                   [Cancel Booking]         │
└─────────────────────────────────────────────────────────────────┘
```

### Refund Messaging
- Full refund: Emerald text, positive message
- Partial refund: Amber text, explanation
- No refund: Red text, warning tone

### Button Styling
- Keep Booking: Stone outline
- Cancel Booking: Red outline, red text

### Modal Specifications
- Width: 400px max
- Centered on screen
- Overlay: Stone-900/50

### Constraints
- Cannot cancel past bookings
- Show processing state during cancellation
- Redirect to bookings list on success
