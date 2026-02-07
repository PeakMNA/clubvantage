# Golf / Tee Sheet / Schedule

## Overview

The schedule configuration system controls when courses operate, when tee times are available, and how they're spaced. It uses a 3-level priority hierarchy: Special Days > Seasons > Base Schedule. Designed for golf operations managers with a live preview showing exactly what golfers will see.

## Status

Implemented. Full schedule config with operating hours, time periods, seasons, special days, twilight settings, and live preview all functional.

## Capabilities

- Configure weekday/weekend operating hours (first/last tee time)
- Define variable time periods with different intervals (e.g., 8-min prime time, 12-min twilight)
- Mark time periods as prime time (affects pricing)
- Configure twilight settings: fixed time or sunset-based (GPS coordinates)
- Define seasons with optional overrides (hours, booking window, twilight, time periods)
- Define special days: holidays, closures, tournaments, custom events
- Set advance booking window (days ahead, overridable per season)
- Live preview showing generated tee times for any date
- Cross-tee mode support (dual columns for 9-hole starts)

## Dependencies

### Interface Dependencies

- `golf/courses/configuration` - courseId is the parent; each course has independent schedule
- `Members` - membership tier can affect booking window
- `Billing` - prime time flag affects pricing rules

### Settings Dependencies

- `golf/courses/configuration` - courseId, playFormat
- `platform/club` - clubId scoping

### Data Dependencies

- **Reads:** Course, Club
- **Writes:** GolfCourseSchedule, GolfTimePeriod, GolfSeason, GolfSeasonTimePeriod, GolfSpecialDay
- **Events:** `schedule.updated`, `season.created`, `specialDay.created`

## Settings Requirements

### Operating Hours

| Setting | Type | Default | Configured By | Description |
|---|---|---|---|---|
| weekday_first_tee | Time | 06:00 | Golf Ops Manager | Opening tee time weekdays |
| weekday_last_tee | Time | 17:00 | Golf Ops Manager | Last tee time weekdays |
| weekend_first_tee | Time | 05:30 | Golf Ops Manager | Opening tee time weekends |
| weekend_last_tee | Time | 17:30 | Golf Ops Manager | Last tee time weekends |

### Time Period Settings (per period)

| Setting | Type | Default | Configured By | Description |
|---|---|---|---|---|
| name | String | required | Golf Ops Manager | Period display name |
| startTime | Time | required | Golf Ops Manager | Period start boundary |
| endTime | Time | required | Golf Ops Manager | Period end boundary |
| intervalMinutes | Integer | 8 | Golf Ops Manager | Minutes between tee times (6-15 typical) |
| isPrimeTime | Boolean | false | Golf Ops Manager | Affects pricing rules |
| applicableDays | Enum | ALL | Golf Ops Manager | WEEKDAY / WEEKEND / ALL |

### Default Time Periods

| Period | Start-End | Interval | Prime Time |
|---|---|---|---|
| Early Bird | 06:00-07:00 | 12 min | No |
| Prime AM | 07:00-11:00 | 8 min | Yes |
| Midday | 11:00-14:00 | 10 min | No |
| Prime PM | 14:00-16:00 | 8 min | Yes |
| Twilight | 16:00-close | 12 min | No |

### Twilight Settings

| Setting | Type | Default | Configured By | Description |
|---|---|---|---|---|
| twilightMode | Enum | FIXED | Golf Ops Manager | FIXED or SUNSET |
| twilightFixedTime | Time | 16:00 | Golf Ops Manager | Fixed twilight start (if FIXED mode) |
| twilightMinutesBeforeSunset | Integer | 90 | Golf Ops Manager | Minutes before sunset (if SUNSET mode) |
| clubLatitude | Decimal | required for SUNSET | Golf Ops Manager | GPS latitude for sunset calculation |
| clubLongitude | Decimal | required for SUNSET | Golf Ops Manager | GPS longitude for sunset calculation |

### Booking Window

| Setting | Type | Default | Configured By | Description |
|---|---|---|---|---|
| defaultBookingWindowDays | Integer | 7 | Golf Ops Manager | Days in advance members can book |

Can be overridden per season.

### Season Settings

| Setting | Type | Default | Configured By | Description |
|---|---|---|---|---|
| name | String | required | Golf Ops Manager | Season display name |
| dateRange | Month/Day-Month/Day | required | Golf Ops Manager | Season start and end dates |
| isRecurring | Boolean | false | Golf Ops Manager | Repeats annually |
| priority | Integer | required | Golf Ops Manager | Higher priority wins overlaps |

Optional overrides per season: operating hours, booking window, twilight time, time periods.

### Special Day Settings

| Setting | Type | Default | Configured By | Description |
|---|---|---|---|---|
| name | String | required | Golf Ops Manager | Special day display name |
| dates | Date[] | required | Golf Ops Manager | One or more dates |
| isRecurring | Boolean | false | Golf Ops Manager | Repeats annually |
| type | Enum | required | Golf Ops Manager | WEEKEND / HOLIDAY / CLOSED / CUSTOM |

Custom type can override operating hours and time periods.

### Cross-Tee Booking Mode

| Setting | Type | Default | Configured By | Description |
|---|---|---|---|---|
| weekdayBookingMode | Enum | EIGHTEEN | Golf Ops Manager | EIGHTEEN or CROSS for weekdays |
| weekendBookingMode | Enum | EIGHTEEN | Golf Ops Manager | EIGHTEEN or CROSS for weekends |

Can be overridden per season and special day.

## Data Model

```typescript
enum BookingMode {
  EIGHTEEN = "EIGHTEEN",
  CROSS = "CROSS",
}

enum TwilightMode {
  FIXED = "FIXED",
  SUNSET = "SUNSET",
}

enum ApplicableDays {
  WEEKDAY = "WEEKDAY",
  WEEKEND = "WEEKEND",
  ALL = "ALL",
}

enum SpecialDayType {
  WEEKEND = "WEEKEND",
  HOLIDAY = "HOLIDAY",
  CLOSED = "CLOSED",
  CUSTOM = "CUSTOM",
}

interface GolfCourseSchedule {
  id: string;
  courseId: string;
  weekdayFirstTee: Time;
  weekdayLastTee: Time;
  weekendFirstTee: Time;
  weekendLastTee: Time;
  twilightMode: TwilightMode;
  twilightFixedTime: Time;
  twilightMinutesBeforeSunset: number;
  clubLatitude: number | null;
  clubLongitude: number | null;
  defaultBookingWindowDays: number;
  weekdayBookingMode: BookingMode;
  weekendBookingMode: BookingMode;
  timePeriods: GolfTimePeriod[];
  seasons: GolfSeason[];
  specialDays: GolfSpecialDay[];
}

interface GolfTimePeriod {
  id: string;
  scheduleId: string;
  name: string;
  startTime: Time;
  endTime: Time;
  intervalMinutes: number;
  isPrimeTime: boolean;
  applicableDays: ApplicableDays;
  sortOrder: number;
}

interface GolfSeason {
  id: string;
  scheduleId: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  isRecurring: boolean;
  priority: number;
  overrideFirstTee: Time | null;
  overrideLastTee: Time | null;
  overrideBookingWindowDays: number | null;
  overrideTwilightTime: Time | null;
  overrideBookingMode: BookingMode | null;
  timePeriods: GolfSeasonTimePeriod[];
}

interface GolfSeasonTimePeriod {
  id: string;
  seasonId: string;
  name: string;
  startTime: Time;
  endTime: Time;
  intervalMinutes: number;
  isPrimeTime: boolean;
  applicableDays: ApplicableDays;
  sortOrder: number;
}

interface GolfSpecialDay {
  id: string;
  scheduleId: string;
  name: string;
  dates: Date[];
  isRecurring: boolean;
  type: SpecialDayType;
  overrideFirstTee: Time | null;
  overrideLastTee: Time | null;
  overrideBookingMode: BookingMode | null;
  customTimePeriods: GolfTimePeriod[] | null;
}
```

## Business Rules

- Priority hierarchy: Special Days > Seasons > Base Schedule
- Time periods must be contiguous (no gaps) and cover entire operating hours
- Seasons cannot overlap; higher priority wins
- Special days completely override everything for that date
- Twilight sunset mode uses solar position algorithm with GPS coordinates
- Seasons can span year boundaries (e.g., Nov 1 - Feb 28)
- Cross-tee mode generates dual columns (Hole 1 + Hole 10 starts)
- Live preview calculates exact tee time count and max capacity

### Validation Rules

- **Operating hours:** First tee must be before last tee; 15-minute increments only
- **Time periods:** Must cover all operating hours with no gaps; intervals between 5-20 minutes
- **Seasons:** Name required; no overlapping date ranges; no duplicate names per course
- **Special days:** Name required; warn on recurring date conflicts

## Edge Cases

| Scenario | Handling |
|---|---|
| Overlapping seasons | Higher priority wins |
| Special day during season | Special day wins |
| Twilight before Prime PM ends | Prime PM truncated at twilight start |
| No time periods defined | Default 10-min interval applied |
| Season spans year boundary | Checked on both sides of Dec 31 |
| Sunset at extreme latitudes | Capped at reasonable times |
| Multiple special days same date | First match wins; warning shown on save |
| Time period gap detected | Validation error prevents save |
| Interval change with existing bookings | Future generation only; existing bookings unaffected |
