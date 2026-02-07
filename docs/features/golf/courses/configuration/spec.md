# Golf / Courses / Configuration

## Overview

Course configuration defines the physical and operational properties of each golf course at a club. A club can have multiple courses, each with independent settings. Course configuration is the foundational layer that all other golf features depend on - tee sheet generation, booking rules, pricing, and capacity calculations all derive from course settings.

## Status

Partially implemented. Course CRUD exists in the API and UI. Tee box management, schedule configuration, and basic course properties are functional. Some advanced settings (pace of play tracking, cross-tee blocking rules) are designed but not yet wired.

## Capabilities

- Create, edit, and deactivate courses
- Define course properties: name, hole count (9 or 18), par, status
- Manage tee boxes per course: name, color, distance, slope rating, course rating
- Set course status: Active, Maintenance, Closed
- Configure play format per course: 18-hole or Cross Tee (front 9 / back 9 simultaneous starts)
- Define pace of play target per course (used for cross-tee blocking calculations)
- Each course generates an independent tee sheet

## Dependencies

### Interface Dependencies

- **Members** - Membership tier affects advance booking window per course
- **Billing** - Green fee pricing tied to course selection
- **Tee Sheet Schedule** - Course ID is the parent key for all schedule configuration

### Settings Dependencies

- `platform/club` - Club ID scopes all courses
- `golf/tee-sheet/schedule` - Schedule config references courseId as foreign key

### Data Dependencies

- **Reads**: Club configuration
- **Writes**: Course, TeeBox, GolfCourseSchedule
- **Events**: `course.created`, `course.updated`, `course.statusChanged`

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `courseName` | String | Required | Golf Operations Manager | Display name of the course |
| `holeCount` | Integer | 18 | Golf Operations Manager | 9 or 18 holes |
| `par` | Integer | 72 | Golf Operations Manager | Course par |
| `status` | Enum | ACTIVE | Golf Operations Manager | ACTIVE, MAINTENANCE, CLOSED |
| `playFormat` | Enum | EIGHTEEN_HOLE | Golf Operations Manager | EIGHTEEN_HOLE or CROSS_TEE |
| `paceOfPlay` | Integer (min) | 135 | Golf Operations Manager | Target pace in minutes (used for cross-tee crossover blocking) |
| `maxPlayersPerSlot` | Integer | 4 | Golf Operations Manager | Maximum players per tee time (typically 4) |

### Tee Box Settings (per tee box)

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `teeBoxName` | String | Required | Golf Operations Manager | e.g., "Blue", "White", "Red" |
| `color` | String | Required | Golf Operations Manager | Display color |
| `distance` | Integer (yards) | Required | Golf Operations Manager | Total yardage |
| `slopeRating` | Decimal | Optional | Golf Operations Manager | USGA slope rating |
| `courseRating` | Decimal | Optional | Golf Operations Manager | USGA course rating |

## Data Model

```typescript
interface Course {
  id: string
  clubId: string
  courseName: string
  holeCount: 9 | 18
  par: number
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED'
  playFormat: 'EIGHTEEN_HOLE' | 'CROSS_TEE'
  paceOfPlay: number // minutes
  maxPlayersPerSlot: number
  teeBoxes: TeeBox[]
  createdAt: Date
  updatedAt: Date
}

interface TeeBox {
  id: string
  courseId: string
  name: string
  color: string
  distance: number
  slopeRating?: number
  courseRating?: number
  sortOrder: number
}
```

## Business Rules

- A club can have multiple courses; each is fully independent
- Changing course status to MAINTENANCE or CLOSED does not automatically cancel existing bookings (staff must handle manually)
- Cross-tee format enables dual-column tee sheet (Hole 1 + Hole 10 starts) increasing daily capacity
- Cross-tee pace of play setting determines when opposite-nine tee times become available (e.g., 7:00am Front 9 start blocks Back 9 until 9:15am based on 135min pace)
- Tee box configuration is informational for member-facing display and handicap calculation; does not affect tee sheet operations

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Course closed with existing bookings | Warning shown to staff; bookings not auto-cancelled |
| Play format changed mid-season | Only affects future tee time generation; existing bookings unaffected |
| Course deleted | Soft delete only; historical bookings retain course reference |
| Multiple courses same name | Allowed but warned; each has unique ID |
| 9-hole course in cross-tee mode | Invalid combination; validation prevents |
