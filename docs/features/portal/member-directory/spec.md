# Portal / Community / Member Directory

## Overview
Privacy-controlled member listing allowing club members to browse the community. Shows limited personal information with opt-in visibility.

## Status
- Backend: Implemented (data layer with privacy filters)
- Frontend: Implemented (search, alphabetical grouping, detail view)
- Phase: 5 (Premium Features)

## Capabilities
- Searchable member list (first name or last name, case-insensitive)
- Alphabetical grouping by first letter of first name
- Privacy-filtered display: firstName + last initial only in list view
- Detail view: full name, membership type, interest categories
- Limited to 50 results per search query
- Only ACTIVE members displayed

## Dependencies
### Interface Dependencies
- Bottom navigation or profile hub link

### Settings Dependencies
- `features.portal.memberDirectory` must be true

### Data Dependencies
- Member records with ACTIVE status
- MembershipType for type display
- MemberInterest → InterestCategory for interest tags

## Settings Requirements
| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| features.portal.memberDirectory | boolean | true | Club Admin | Enables member directory |

## Data Model
```typescript
interface DirectoryMember {
  id: string
  firstName: string
  lastInitial: string    // Single character
  membershipType: string
  avatarUrl?: string
}

interface DirectoryMemberDetail {
  id: string
  firstName: string
  lastName: string       // Full name shown in detail only
  membershipType: string
  avatarUrl?: string
  interests: string[]    // InterestCategory names
  joinDate?: Date
}
```

## Business Rules
- List view: lastName truncated to first character + period (e.g., "John S.")
- Only members with status = ACTIVE are shown
- Search matches against firstName OR lastName (case-insensitive contains)
- Club-scoped: only shows members from the same clubId
- Detail view requires same club membership to access

## Edge Cases
| Scenario | Handling |
|----------|----------|
| No members match search | Empty state: "No members found" |
| Member has no interests | Interest section hidden on detail |
| Member has no avatar | Shows initials in circle placeholder |
