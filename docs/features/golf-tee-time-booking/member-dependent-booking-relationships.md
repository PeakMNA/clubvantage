# Member, Dependent, and Booking Relationships

## Overview

This document describes the database relationships between Members, Dependents, and Golf Bookings (TeeTimePlayer) in the ClubVantage system.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────────────┐         1:N         ┌────────────────┐                     │
│  │   Member   │ ────────────────────│   Dependent    │                     │
│  │            │  (member.dependents) │                │                     │
│  │  id (PK)   │                      │   id (PK)      │                     │
│  │  memberId  │                      │   memberId (FK)│                     │
│  │  firstName │                      │   firstName    │                     │
│  │  lastName  │                      │   lastName     │                     │
│  │  ...       │                      │   relationship │                     │
│  └─────┬──────┘                      └───────┬────────┘                     │
│        │                                     │                              │
│        │ 1:N                                 │ 1:N                          │
│        │ (member.teeTimePlayers)             │ (dependent.teeTimePlayers)   │
│        │                                     │                              │
│        ▼                                     ▼                              │
│  ┌───────────────────────────────────────────────────────────────┐         │
│  │                       TeeTimePlayer                            │         │
│  │                                                                │         │
│  │   id (PK)                                                      │         │
│  │   teeTimeId (FK)                                               │         │
│  │   position (1-4)                                               │         │
│  │   playerType (MEMBER | DEPENDENT | GUEST | WALK_UP)           │         │
│  │   memberId (FK) → nullable, set when playerType = MEMBER       │         │
│  │   dependentId (FK) → nullable, set when playerType = DEPENDENT│         │
│  │   guestName → used when playerType = GUEST or WALK_UP          │         │
│  │   guestEmail → used when playerType = GUEST or WALK_UP         │         │
│  │   guestPhone → used when playerType = GUEST or WALK_UP         │         │
│  │   ...                                                          │         │
│  └───────────────────────────────────────────────────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Models

### Member

The `Member` model represents a club member with full membership privileges.

```prisma
model Member {
  id               String    @id @db.Uuid
  clubId           String    @db.Uuid
  memberId         String    @db.VarChar(20)  // Display ID like M-0001
  firstName        String    @db.VarChar(100)
  lastName         String    @db.VarChar(100)
  email            String?   @db.VarChar(255)
  // ... other fields

  // Relations
  dependents       Dependent[]        // Family members
  teeTimePlayers   TeeTimePlayer[]    // Golf bookings where this member plays
}
```

**Key Points:**
- Primary member of the club with their own membership
- Can have multiple dependents (family members)
- Can make bookings for themselves and their dependents
- Has `memberId` display field (e.g., "M-0001") separate from UUID `id`

### Dependent

The `Dependent` model represents a family member associated with a primary Member.

```prisma
model Dependent {
  id           String    @id @db.Uuid
  memberId     String    @db.Uuid          // FK to parent Member
  member       Member    @relation(...)
  firstName    String    @db.VarChar(100)
  lastName     String    @db.VarChar(100)
  relationship String    @db.VarChar(50)   // spouse, child, parent
  dateOfBirth  DateTime? @db.Date
  email        String?   @db.VarChar(255)
  phone        String?   @db.VarChar(50)
  isActive     Boolean   @default(true)

  // Relations
  teeTimePlayers TeeTimePlayer[]  // Golf bookings where this dependent plays
}
```

**Key Points:**
- Always linked to a parent `Member` via `memberId`
- Has relationship type (spouse, child, parent, etc.)
- Can be booked for golf independently of the parent member
- Has their own `teeTimePlayers` relation for booking history

### TeeTimePlayer

The `TeeTimePlayer` model represents a player slot in a golf tee time booking.

```prisma
model TeeTimePlayer {
  id         String     @id @db.Uuid
  teeTimeId  String     @db.Uuid
  position   Int        // 1-4 (position in the foursome)
  playerType PlayerType // MEMBER, DEPENDENT, GUEST, WALK_UP

  // Player identification (mutually exclusive based on playerType)
  memberId    String?    @db.Uuid   // Set when playerType = MEMBER
  member      Member?    @relation(...)
  dependentId String?    @db.Uuid   // Set when playerType = DEPENDENT
  dependent   Dependent? @relation(...)
  guestName   String?    // Set when playerType = GUEST or WALK_UP
  guestEmail  String?    // Set when playerType = GUEST or WALK_UP
  guestPhone  String?    // Set when playerType = GUEST or WALK_UP

  // ... other booking details (cart, caddy, fees, etc.)
}
```

**Key Points:**
- Each player position (1-4) in a tee time is a separate record
- `playerType` determines which identification fields are used
- Foreign keys are nullable to support different player types

## Player Type Logic

| PlayerType | memberId | dependentId | guestName/Email/Phone |
|------------|----------|-------------|----------------------|
| MEMBER     | Set      | null        | null                 |
| DEPENDENT  | null     | Set         | null                 |
| GUEST      | null     | null        | Set                  |
| WALK_UP    | null     | null        | Set                  |

### Creating/Updating Players

When creating or updating a `TeeTimePlayer`, the service automatically handles the field mapping:

```typescript
// In golf.service.ts
{
  playerType: p.playerType,
  // For MEMBER: set memberId (FK to members table)
  // For DEPENDENT: set dependentId (FK to dependents table)
  // For GUEST/WALK_UP: use guestName/Email/Phone instead
  memberId: p.playerType === 'MEMBER' ? p.memberId : null,
  dependentId: p.playerType === 'DEPENDENT' ? p.dependentId : null,
  guestName: p.guestName,
  guestEmail: p.guestEmail,
  guestPhone: p.guestPhone,
}
```

## GraphQL API

### Types

```typescript
// TeeTimePlayerType - returned from queries
@ObjectType()
export class TeeTimePlayerType {
  @Field(() => ID)
  id: string;

  @Field()
  position: number;

  @Field()
  playerType: string;

  @Field(() => PlayerMemberType, { nullable: true })
  member?: PlayerMemberType;  // Populated when playerType = MEMBER

  @Field(() => PlayerDependentType, { nullable: true })
  dependent?: PlayerDependentType;  // Populated when playerType = DEPENDENT

  @Field({ nullable: true })
  guestName?: string;  // Populated when playerType = GUEST or WALK_UP

  // ... other fields
}

// PlayerDependentType - dependent info for display
@ObjectType()
export class PlayerDependentType {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  relationship: string;

  @Field(() => ID, { nullable: true })
  memberId?: string;  // Parent member UUID
}
```

### Input Types

```typescript
// TeeTimePlayerInput - for creating/updating players
@InputType()
export class TeeTimePlayerInput {
  @Field()
  position: number;

  @Field()
  playerType: string;  // 'MEMBER' | 'DEPENDENT' | 'GUEST' | 'WALK_UP'

  @Field(() => ID, { nullable: true })
  memberId?: string;  // Required for MEMBER playerType

  @Field(() => ID, { nullable: true })
  dependentId?: string;  // Required for DEPENDENT playerType

  @Field({ nullable: true })
  guestName?: string;  // Required for GUEST/WALK_UP playerType

  // ... other fields
}
```

## Usage Examples

### Booking a Member

```graphql
mutation CreateFlight {
  createFlight(input: {
    courseId: "..."
    teeDate: "2026-01-30"
    teeTime: "08:00"
    players: [{
      position: 1
      playerType: "MEMBER"
      memberId: "member-uuid-here"
    }]
  }) {
    id
    players {
      position
      playerType
      member {
        firstName
        lastName
        memberId
      }
    }
  }
}
```

### Booking a Dependent

```graphql
mutation CreateFlight {
  createFlight(input: {
    courseId: "..."
    teeDate: "2026-01-30"
    teeTime: "08:00"
    players: [{
      position: 1
      playerType: "DEPENDENT"
      dependentId: "dependent-uuid-here"
    }]
  }) {
    id
    players {
      position
      playerType
      dependent {
        firstName
        lastName
        relationship
        memberId  # Parent member's UUID
      }
    }
  }
}
```

### Booking a Guest

```graphql
mutation CreateFlight {
  createFlight(input: {
    courseId: "..."
    teeDate: "2026-01-30"
    teeTime: "08:00"
    players: [{
      position: 1
      playerType: "GUEST"
      guestName: "John Doe"
      guestEmail: "john@example.com"
      guestPhone: "+1234567890"
    }]
  }) {
    id
    players {
      position
      playerType
      guestName
    }
  }
}
```

### Mixed Booking (Member + Dependent + Guest)

```graphql
mutation CreateFlight {
  createFlight(input: {
    courseId: "..."
    teeDate: "2026-01-30"
    teeTime: "08:00"
    players: [
      {
        position: 1
        playerType: "MEMBER"
        memberId: "member-uuid"
      },
      {
        position: 2
        playerType: "DEPENDENT"
        dependentId: "dependent-uuid"
      },
      {
        position: 3
        playerType: "GUEST"
        guestName: "Guest Name"
      }
    ]
  }) {
    id
    players {
      position
      playerType
      member { firstName lastName }
      dependent { firstName lastName relationship }
      guestName
    }
  }
}
```

## Database Indexes

The following indexes support efficient queries:

```prisma
model TeeTimePlayer {
  @@index([teeTimeId])    // Find all players for a tee time
  @@index([memberId])     // Find all bookings for a member
  @@index([dependentId])  // Find all bookings for a dependent
}

model Dependent {
  @@index([memberId])     // Find all dependents for a member
}
```

## Migration History

1. **Initial Schema**: `TeeTimePlayer` only had `memberId` field
2. **Issue**: DEPENDENT players could not be properly tracked (which specific dependent?)
3. **Fix**: Added `dependentId` field with FK to `dependents` table
4. **Migration SQL**:
   ```sql
   ALTER TABLE tee_time_players ADD COLUMN IF NOT EXISTS "dependentId" UUID;
   ALTER TABLE tee_time_players ADD CONSTRAINT tee_time_players_dependentId_fkey
     FOREIGN KEY ("dependentId") REFERENCES dependents(id);
   CREATE INDEX IF NOT EXISTS "tee_time_players_dependentId_idx" ON tee_time_players("dependentId");
   ```

## Best Practices

1. **Always validate playerType**: Ensure the correct identification field is set based on playerType
2. **Clear unused fields**: Set non-applicable fields to null (e.g., `memberId: null` for GUEST)
3. **Include relations**: When querying players, include `member`, `dependent`, and `caddy` for complete data
4. **Display names**: For display, use `member.firstName/lastName`, `dependent.firstName/lastName`, or `guestName` based on playerType
