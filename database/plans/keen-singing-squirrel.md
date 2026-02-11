# Wire Guests & Waitlist to Bookings API

## Context

The seed now creates 30 bookings, 5 waitlist entries (1 linked to a booking), and 4 guest records (linked to bookings). The database schema has the FK relations (`Booking.guests: Guest[]`, `Booking.waitlistEntry: WaitlistEntry?`), but the GraphQL API doesn't expose them — no types, no includes in queries, no fields in operations. This means the UI can't display guest details or see which bookings came from waitlist conversions.

## Changes

### 1. Add `BookingGuestType` to GraphQL types

**File:** `apps/api/src/graphql/bookings/bookings.types.ts`

Add a new `BookingGuestType` ObjectType after `BookingMemberType` (~line 52):

```typescript
@ObjectType()
export class BookingGuestType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}
```

### 2. Add `guests` and `waitlistEntry` fields to `BookingType`

**File:** `apps/api/src/graphql/bookings/bookings.types.ts` (lines 222-223)

After `guestCount` field, add:

```typescript
@Field(() => [BookingGuestType], { nullable: true })
guests?: BookingGuestType[];

@Field(() => BookingWaitlistType, { nullable: true })
waitlistEntry?: BookingWaitlistType;
```

Also add a lightweight `BookingWaitlistType` (avoids circular dependency with full `WaitlistEntryType`):

```typescript
@ObjectType()
export class BookingWaitlistType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  position: number;

  @Field(() => WaitlistStatusEnum)
  status: WaitlistStatusEnum;

  @Field({ nullable: true })
  offerExpiresAt?: Date;
}
```

### 3. Add `guests` and `waitlistEntry` to Prisma includes

**File:** `apps/api/src/graphql/bookings/bookings.resolver.ts`

In `getBookings` (line 178-184), add to include block:
```typescript
guests: true,
waitlistEntry: true,
```

**File:** `apps/api/src/modules/bookings/bookings.service.ts`

In `findOne` (line 186-190), add to include block:
```typescript
service: true,
staff: true,
guests: true,
waitlistEntry: true,
```
(Also fixes the existing gap where `service` and `staff` were missing from `findOne`.)

### 4. Transform guests and waitlist in `transformBooking`

**File:** `apps/api/src/graphql/bookings/bookings.resolver.ts` (lines 1099-1108)

After `guestCount` line, add:
```typescript
guests: booking.guests?.map((g: any) => ({
  id: g.id,
  name: g.name,
  email: g.email,
  phone: g.phone,
})),
waitlistEntry: booking.waitlistEntry
  ? {
      id: booking.waitlistEntry.id,
      position: booking.waitlistEntry.position,
      status: booking.waitlistEntry.status as WaitlistStatusEnum,
      offerExpiresAt: booking.waitlistEntry.offerExpiresAt,
    }
  : undefined,
```

### 5. Add fields to GraphQL operations

**File:** `packages/api-client/src/operations/bookings.graphql`

In `GetBookings` query (after `guestCount` at line 33), add:
```graphql
guests {
  id
  name
  email
  phone
}
```

In `GetBooking` query (after `guestCount` at line 99), add:
```graphql
guests {
  id
  name
  email
  phone
}
waitlistEntry {
  id
  position
  status
  offerExpiresAt
}
```

### 6. Regenerate API client types

```bash
cd apps/api && pnpm run dev  # Start briefly to regenerate schema.gql, then Ctrl+C
pnpm --filter @clubvantage/api-client run codegen
```

## Files Modified

| File | Change |
|------|--------|
| `apps/api/src/graphql/bookings/bookings.types.ts` | Add `BookingGuestType`, `BookingWaitlistType`, fields on `BookingType` |
| `apps/api/src/graphql/bookings/bookings.resolver.ts` | Add `guests`/`waitlistEntry` to include + transform |
| `apps/api/src/modules/bookings/bookings.service.ts` | Add `guests`/`waitlistEntry`/`service`/`staff` to `findOne` include |
| `packages/api-client/src/operations/bookings.graphql` | Add `guests`/`waitlistEntry` fields to queries |

## Verification

1. `cd apps/api && pnpm exec tsc --noEmit --project tsconfig.json` — no type errors
2. Start API, run GetBookings query — bookings with `guestCount > 0` should return populated `guests` array
3. Run GetBooking for a booking linked to a waitlist entry — `waitlistEntry` should be non-null
4. Regenerate api-client and verify generated types include `BookingGuestType` and `BookingWaitlistType`
