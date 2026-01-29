# Golf Schedule Configuration Redesign

## Current Problems

### 1. Confusing "High/Low" Season Type
- The dropdown showing "High" with no explanation
- What does High/Low mean? Different pricing? Different hours? Different restrictions?
- No visible effect on the schedule

### 2. Awkward Date Format
- MM-DD format without year is confusing
- No date picker - requires manual typing
- Unclear if seasons are recurring annually or one-time

### 3. Empty Placeholder Rows
- Shows empty form rows that look broken
- Should only show "Add Season" button when empty

### 4. Flat Time Configuration
- Single interval for entire day is unrealistic
- Real courses have different intervals for:
  - **Prime time** (8 min) - peak demand hours
  - **Regular time** (10 min) - standard hours
  - **Twilight** (12-15 min) - fewer groups, faster pace

### 5. Missing Critical Features
- No prime time definition
- No member vs guest booking windows
- No connection to pricing
- No preview of generated tee sheet

---

## Research Findings

### Industry Best Practices

From [Lightspeed Golf](https://www.lightspeedhq.com/golf/tee-sheet/):
- Interval adjustment in just two clicks
- Support for shotguns, crossovers, front/back nine
- Player types with color codes, pricing rules, booking restrictions

From [foreUP](https://www.foreupgolf.com/how-to-customize-tee-time-increment-settings/):
- Time-based interval settings with start/end dates
- Easy to adjust intervals for specific periods
- Immediate reflection on tee sheet

From [Cornell University Research](https://ecommons.cornell.edu/server/api/core/bitstreams/c6b538b6-4ce0-4a68-b656-ad5ba62b1066/content):
- 8-min intervals vs 10-min intervals = significant revenue difference
- Prime time definition matters for revenue optimization
- Course satisfaction improves with proper interval spacing

### Common Configuration Patterns

1. **Time Periods** (within a day):
   - Early Bird: 6:00-7:00 (wider intervals, lower price)
   - Prime Morning: 7:00-11:00 (tight intervals, peak price)
   - Midday: 11:00-14:00 (standard intervals, standard price)
   - Prime Afternoon: 14:00-16:00 (tight intervals, peak price)
   - Twilight: 16:00-close (wider intervals, lower price)

2. **Day Types**:
   - Weekday
   - Weekend/Holiday
   - Special Event

3. **Seasons**:
   - High Season (Nov-Feb in Thailand for golf tourism)
   - Low Season (Apr-Oct rainy season)
   - Shoulder Season (Mar, Oct transition periods)

---

## Proposed Redesign

### 1. Course-Centric Configuration

Each course has its own schedule configuration (not global).

```
Course: Main Course (18 holes)
├── Operating Hours
│   ├── Weekday: 06:00 - 18:00
│   └── Weekend: 05:30 - 18:30
├── Time Periods
│   ├── Early Bird (6:00-7:00): 12 min interval
│   ├── Prime AM (7:00-11:00): 8 min interval
│   ├── Midday (11:00-14:00): 10 min interval
│   ├── Prime PM (14:00-16:00): 8 min interval
│   └── Twilight (16:00+): 12 min interval
└── Seasons (override operating hours)
    ├── High Season: Nov 1 - Feb 28
    └── Low Season: May 1 - Oct 31
```

### 2. Time Period Configuration (NEW)

**Replace flat weekday/weekend with time periods:**

```typescript
interface TimePeriod {
  id: string;
  name: string;                    // "Prime Morning"
  startTime: string;               // "07:00"
  endTime: string;                 // "11:00"
  interval: number;                // 8
  isPrimeTime: boolean;            // affects pricing
  applicableDays: DayOfWeek[];     // Mon-Fri, or Sat-Sun
}
```

**UI: Visual time blocks**
```
┌─────────────────────────────────────────────────────────────┐
│ Time Periods                                    + Add Period │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│ │ Early    │ Prime AM │ Midday   │ Prime PM │ Twilight │   │
│ │ 6:00-7:00│ 7:00-11  │ 11-14:00 │ 14-16:00 │ 16:00+   │   │
│ │ 12 min   │ 8 min ⭐ │ 10 min   │ 8 min ⭐ │ 12 min   │   │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘   │
│                                                             │
│ [Timeline visualization 6AM ─────────────────────── 6PM]   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Season Configuration (IMPROVED)

**Seasons are date ranges that can override defaults:**

```typescript
interface Season {
  id: string;
  name: string;                    // "High Season"
  startDate: Date;                 // Full date with year
  endDate: Date;
  isRecurring: boolean;            // Repeat annually?
  overrides?: {
    operatingHours?: {
      firstTeeTime: string;
      lastTeeTime: string;
    };
    timePeriods?: TimePeriod[];    // Override specific periods
    bookingWindowDays?: number;     // Different advance booking
  };
}
```

**UI: Calendar-based selection**
```
┌─────────────────────────────────────────────────────────────┐
│ Seasons                                        + Add Season │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ High Season ───────────────────────────────────────────┐│
│ │ Nov 1 - Feb 28 (Recurring annually)                     ││
│ │ ☑ Override operating hours: 5:30 AM - 6:30 PM          ││
│ │ ☑ Override booking window: 14 days advance              ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─ Low Season ────────────────────────────────────────────┐│
│ │ May 1 - Oct 31 (Recurring annually)                     ││
│ │ ☐ Use default operating hours                           ││
│ │ ☐ Use default booking window                            ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Year calendar view showing colored season ranges]         │
└─────────────────────────────────────────────────────────────┘
```

### 4. Special Days / Holidays (IMPROVED)

```typescript
interface SpecialDay {
  id: string;
  name: string;
  date: Date | { month: number; day: number }; // Specific or recurring
  isRecurring: boolean;
  scheduleType: 'weekend' | 'holiday' | 'closed' | 'custom';
  customSchedule?: {
    firstTeeTime: string;
    lastTeeTime: string;
    timePeriods?: TimePeriod[];
  };
}
```

**UI: Clearer holiday management**
```
┌─────────────────────────────────────────────────────────────┐
│ Special Days                                  + Add Holiday │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name                    Date           Schedule    Actions  │
│ ─────────────────────────────────────────────────────────── │
│ Songkran              Apr 13-15 🔄    Weekend       ✏️ 🗑️  │
│ King's Birthday       Jul 28    🔄    Weekend       ✏️ 🗑️  │
│ Course Maintenance    Feb 15, 2026    Closed        ✏️ 🗑️  │
│                                                             │
│ 🔄 = Recurring annually                                     │
└─────────────────────────────────────────────────────────────┘
```

### 5. Live Preview

Show real-time preview of generated tee sheet based on configuration:

```
┌─────────────────────────────────────────────────────────────┐
│ Preview: Monday, Jan 27, 2026                    [Change ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 06:00  ░░░░ Early Bird (12 min)                            │
│ 06:12  ░░░░                                                 │
│ 06:24  ░░░░                                                 │
│ ...                                                         │
│ 07:00  ████ Prime Morning (8 min) ⭐                        │
│ 07:08  ████                                                 │
│ 07:16  ████                                                 │
│ ...                                                         │
│ 11:00  ▒▒▒▒ Midday (10 min)                                │
│ 11:10  ▒▒▒▒                                                 │
│ ...                                                         │
│                                                             │
│ Total tee times: 84 | Capacity: 336 players                │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Data Model Update
1. Add `TimePeriod` model to database schema
2. Update `GolfCourseSchedule` to support time periods
3. Migrate existing weekday/weekend config to new format

### Phase 2: UI Redesign
1. Create `TimePeriodEditor` component with visual timeline
2. Create `SeasonEditor` component with calendar picker
3. Create `SpecialDayEditor` component
4. Create `SchedulePreview` component

### Phase 3: Integration
1. Update tee sheet generation to use time periods
2. Connect to pricing engine for prime time rates
3. Add booking window logic per season

---

## UI Component Structure

```
ScheduleConfiguration/
├── CourseScheduleSettings.tsx     # Main container per course
│   ├── OperatingHoursCard.tsx     # Basic first/last tee times
│   ├── TimePeriodEditor.tsx       # Visual time period blocks
│   │   ├── TimePeriodTimeline.tsx # Visual representation
│   │   └── TimePeriodForm.tsx     # Edit modal
│   ├── SeasonManager.tsx          # Season date ranges
│   │   ├── SeasonCalendar.tsx     # Year calendar view
│   │   └── SeasonForm.tsx         # Edit modal
│   ├── SpecialDayManager.tsx      # Holidays/special days
│   │   └── SpecialDayForm.tsx     # Add/edit modal
│   └── SchedulePreview.tsx        # Live tee sheet preview
```

---

## Sources

- [Lightspeed Golf Tee Sheet](https://www.lightspeedhq.com/golf/tee-sheet/)
- [foreUP Increment Settings](https://www.foreupgolf.com/how-to-customize-tee-time-increment-settings/)
- [Cornell Golf Revenue Study](https://ecommons.cornell.edu/server/api/core/bitstreams/c6b538b6-4ce0-4a68-b656-ad5ba62b1066/content)
- [GolfNow Tee Sheet Configuration](https://wpsupport.business.golfnow.com/support/document/how-to-configure-your-tee-sheet/)
