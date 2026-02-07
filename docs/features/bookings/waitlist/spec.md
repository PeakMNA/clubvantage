# Bookings / Waitlist / Booking Waitlist Management

## Overview

The Waitlist tab manages a queue of members who want to book services or facilities that are currently at capacity. When a desired time slot, service, or facility is fully booked, members can be added to the waitlist with their preferred date, time range, and service/facility selection. Staff manage the waitlist by notifying members when slots become available (via notification), converting waitlist entries into confirmed bookings when the member responds, or removing expired or cancelled entries. Each waitlist entry tracks its queue position, status lifecycle (waiting, notified, converted, expired, cancelled), creation time, notification time, and response expiry window. The waitlist provides filtering by status and search by member name, member number, or service name.

## Status

| Aspect | State | Notes |
|--------|-------|-------|
| Waitlist entry display | Implemented | Card-based display with queue position, member, service details |
| Waitlist search | Implemented | Text search on member name, member number, service name |
| Waitlist status filter | Implemented | Filter by all, waiting, notified, converted, expired, cancelled |
| Status counts | Implemented | Total, waiting, notified, converted counts in header |
| Notify action | Implemented | Button triggers notification; updates status to `notified` |
| Convert action | Implemented | Button converts entry to booking; updates status to `converted` |
| Remove action | Implemented | Button cancels entry; updates status to `cancelled` |
| Expiry timer | Implemented | Shows countdown for notified entries (e.g., "30m left to respond") |
| Queue position display | Implemented | Numbered position badge with color coding |
| Member avatar | Implemented | Avatar with initials fallback |
| Service type icon | Implemented | Sparkles for service, Building2 for facility |
| Notes display | Implemented | Italic note text (e.g., "Prefers therapist Nattaya") |
| Status legend | Implemented | Footer legend with color dots |
| GraphQL integration | Not Implemented | Currently uses mock data; no API queries or mutations |
| Auto-expiry | Not Implemented | Expiry is visual only; no background job to expire entries |
| Notification delivery | Not Implemented | `onNotify` callback exists but no actual notification sent |
| Booking conversion flow | Not Implemented | `onConvert` callback exists but does not open booking wizard |
| Waitlist capacity tracking | Not Implemented | No integration with booking capacity to auto-trigger notifications |
| Member portal waitlist | Not Implemented | No member-facing waitlist join functionality |
| Priority/VIP ordering | Not Implemented | Queue position is chronological only |
| Automatic slot monitoring | Not Implemented | No system to detect when slots open up |

## Capabilities

- Display waitlist entries as cards with queue position, member details, service/facility name, preferred date/time, and status
- Search waitlist by member name, member number, or service name
- Filter waitlist entries by status (all, waiting, notified, converted, expired, cancelled)
- Send availability notification to a waiting member (updates status to notified with 1-hour response window)
- Convert a notified entry into a confirmed booking
- Remove/cancel a waitlist entry
- Display countdown timer for notified entries showing remaining response time
- Show formatted relative timestamps ("2h ago", "30m ago") for creation time
- Display member preferences/notes on waitlist entries
- Show aggregate counts (total, waiting, notified, converted) in the header

## Dependencies

### Interface Dependencies

| Module | Dependency | Usage |
|--------|-----------|-------|
| Calendar | Slot availability | Waitlist should monitor calendar for slot openings (not yet integrated) |
| Services | Service reference | Waitlist entries reference specific services by name |
| Facilities | Facility reference | Waitlist entries reference specific facilities by name |
| Members | Member details | Waitlist entries display member name, number, photo |
| Notifications | Availability alerts | Waitlist notification should send push/SMS/email to members (not yet integrated) |
| Billing | Booking creation | Converting waitlist entry should create booking with proper pricing |

### Settings Dependencies

| Setting | Usage |
|---------|-------|
| Notification response window | How long a member has to respond after being notified |
| Auto-expiry enabled | Whether expired entries are automatically cleaned up |
| Notification channels | Which channels (push, SMS, email) to use for waitlist notifications |
| Max waitlist entries per member | Limit on how many active waitlist entries a member can have |

### Data Dependencies

| Data Source | Query/Mutation | Description |
|-------------|---------------|-------------|
| `waitlistEntries` | GraphQL Query (planned) | Fetch waitlist entries with member and service details |
| `createWaitlistEntry` | GraphQL Mutation (planned) | Add member to waitlist |
| `notifyWaitlistEntry` | GraphQL Mutation (planned) | Mark entry as notified and trigger notification |
| `convertWaitlistEntry` | GraphQL Mutation (planned) | Convert entry to booking |
| `removeWaitlistEntry` | GraphQL Mutation (planned) | Cancel/remove entry |
| `expireWaitlistEntries` | Background Job (planned) | Auto-expire entries past response deadline |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `waitlist.enabled` | `boolean` | `true` | Club Admin | Whether the waitlist feature is available |
| `waitlist.responseWindowMinutes` | `number` | `60` | Club Admin | Minutes a member has to respond after being notified |
| `waitlist.maxEntriesPerMember` | `number` | `5` | Club Admin | Maximum active waitlist entries per member |
| `waitlist.maxEntriesPerSlot` | `number` | `20` | Club Admin | Maximum waitlist entries for a single service/time slot |
| `waitlist.autoExpireEnabled` | `boolean` | `true` | Club Admin | Whether expired entries are automatically marked as expired |
| `waitlist.autoExpireCheckIntervalMinutes` | `number` | `5` | Platform Admin | How often the expiry background job runs |
| `waitlist.notificationChannels` | `string[]` | `["push","email"]` | Club Admin | Channels used for waitlist notifications |
| `waitlist.autoNotifyOnCancellation` | `boolean` | `false` | Club Admin | Whether to auto-notify the next waitlisted member when a booking is cancelled |
| `waitlist.priorityEnabled` | `boolean` | `false` | Club Admin | Whether VIP/tier-based priority ordering is enabled |
| `waitlist.priorityTiers` | `string[]` | `["Diamond","Platinum","Gold","Silver"]` | Club Admin | Tier order for priority waitlist (highest first) |
| `waitlist.showQueuePosition` | `boolean` | `true` | Club Admin | Whether members see their queue position |
| `waitlist.allowPreferenceNotes` | `boolean` | `true` | Club Admin | Whether members can add preference notes to waitlist entries |
| `waitlist.retentionDays` | `number` | `30` | Club Admin | Days to retain expired/cancelled entries before cleanup |

## Data Model

```typescript
interface WaitlistEntry {
  id: string;
  clubId: string;
  memberId: string;
  member: WaitlistMember;
  serviceType: 'service' | 'facility';
  serviceId?: string;                   // Reference to Service or Facility
  serviceName: string;
  preferredDate: Date;
  preferredTimeRange: string;           // e.g., "2:00 PM - 4:00 PM"
  preferredStartTime?: string;          // HH:mm for precise matching
  preferredEndTime?: string;            // HH:mm for precise matching
  position: number;                     // Queue position (1-based)
  status: WaitlistStatus;
  notes?: string;                       // Member preferences
  createdAt: Date;
  notifiedAt?: Date;
  respondedAt?: Date;
  expiresAt?: Date;                     // Notification response deadline
  convertedBookingId?: string;          // Booking created from this entry
  cancelledBy?: string;                 // Staff user who removed the entry
  cancelReason?: string;
}

type WaitlistStatus = 'waiting' | 'notified' | 'converted' | 'expired' | 'cancelled';

interface WaitlistMember {
  id: string;
  name: string;
  photoUrl?: string;
  memberNumber: string;
  phone?: string;
  email?: string;
}

interface WaitlistStatusConfig {
  label: string;
  bg: string;
  text: string;
}

// Planned GraphQL types

interface CreateWaitlistEntryInput {
  memberId: string;
  serviceType: 'service' | 'facility';
  serviceId?: string;
  serviceName: string;
  preferredDate: string;               // ISO date
  preferredStartTime?: string;         // HH:mm
  preferredEndTime?: string;           // HH:mm
  notes?: string;
}

interface NotifyWaitlistEntryInput {
  entryId: string;
  message?: string;                    // Custom notification message
  responseWindowMinutes?: number;      // Override default window
}

interface ConvertWaitlistEntryInput {
  entryId: string;
  bookingId: string;                   // The created booking
}

// Status transition tracking
interface WaitlistStatusTransition {
  from: WaitlistStatus;
  to: WaitlistStatus;
  allowedBy: 'staff' | 'system' | 'member';
  timestamp: Date;
}
```

## Business Rules

1. **Queue Ordering**: Waitlist entries are ordered by creation time (FIFO). Position 1 is the first member to be notified when a slot opens. Priority ordering by membership tier is designed but not yet implemented.

2. **Status Lifecycle**:
   - `waiting`: Entry created, member is in the queue
   - `notified`: Staff has sent availability notification; response timer starts
   - `converted`: Member responded, entry converted to confirmed booking
   - `expired`: Member did not respond within the response window
   - `cancelled`: Staff removed the entry or member withdrew

3. **Response Window**: After notification, the member has `responseWindowMinutes` (default 60 minutes) to respond. The UI shows a countdown timer. After expiry, the entry status transitions to `expired` and the next member in the queue can be notified.

4. **Notification Delivery**: Currently, the `onNotify` callback updates local state only. Planned integration with the Notifications module to send push notifications, SMS, or email to the member.

5. **Conversion Flow**: Converting a waitlist entry should open the booking wizard pre-populated with the member, service, and preferred time. The entry is marked as `converted` only after the booking is successfully created.

6. **Auto-Notification on Cancellation (Planned)**: When a booking is cancelled and there are waitlist entries for the same service/facility/time, the system can automatically notify the next waiting member.

7. **Duplicate Prevention**: A member should not have multiple active waitlist entries for the same service on the same date. Duplicate check on `(memberId, serviceId, preferredDate)`.

8. **Expiry Cleanup**: Expired and cancelled entries are retained for `retentionDays` for reporting purposes, then cleaned up by a background job.

9. **Optimistic UI**: Status transitions (notify, convert, remove) use optimistic updates in the UI. Local state is updated immediately while the API call is in progress.

10. **Display Formatting**:
    - Dates: "Today", "Tomorrow", or "Mon, Feb 3"
    - Times: Relative ("2h ago", "30m ago") for creation time
    - Countdown: "30m left to respond" for notified entries

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Member cancels booking but no waitlist entries exist | No action. Slot simply becomes available on the calendar. |
| Notified member does not respond within window | Entry automatically transitions to `expired`. Next member in queue can be notified. Currently visual only; no background process. |
| Staff converts entry but booking creation fails | Entry remains in `notified` status. Error toast shown. Staff can retry conversion. |
| Member joins waitlist for a past date | Form validation should prevent this. Currently not validated (mock data only). |
| Waitlist entry for a deleted service | Entry displays with service name (string field) but cannot be converted. Show warning on conversion attempt. |
| Two members notified simultaneously for same slot | Not prevented in current design. First to convert gets the booking; second gets conflict error and returns to `notified` (or `expired`). |
| Network failure during notify action | Button shows "Sending..." indefinitely until timeout. Error handling returns to normal state. No partial state corruption due to optimistic rollback. |
| Waitlist with more than 100 entries | All entries rendered. No pagination or virtualization. Performance may degrade. Consider implementing pagination. |
| Member added to waitlist then membership suspended | Entry remains active. Staff must manually review suspended members on the waitlist. Planned: automatic cleanup for suspended members. |
| Staff removes all entries | Empty state shown: "No waitlist entries. Members will appear here when they join a waitlist." |
| Multiple entries for same member on different dates | Allowed up to `maxEntriesPerMember` limit. Each entry is independent. |
| Response window set to 0 minutes | Entry immediately expires after notification. Effectively skips the notification step. |
| Waitlist entry with very long notes | Notes are displayed in full. No truncation. Could cause layout issues with extremely long text. |
| Clock skew between server and client | Countdown timer uses client time. Expiry check should use server time. Current mock implementation uses client time only. |
