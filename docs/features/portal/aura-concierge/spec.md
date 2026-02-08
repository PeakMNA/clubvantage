# Portal / AI / Aura Concierge

## Overview
Chat-based AI assistant for club members providing information about facilities, services, and policies. Currently rule-based with planned LLM upgrade.

## Status
- Backend: Implemented (rule-based server action)
- Frontend: Implemented (chat UI, FAB, suggestion pills)
- AI Integration: Not yet (uses string matching)
- Phase: 5 (Premium Features)

## Capabilities
### Current (Rule-Based)
- Responds to questions about: club hours, pool, golf, dining, dress code, parking, spa, tennis, guest policies
- Suggestion pills for common questions
- Typing indicator animation
- Chat history within session (client-side state)

### Planned (AI-Powered)
- Natural language understanding via LLM (Claude API)
- Context-aware responses using member data (bookings, balance, preferences)
- Action execution: book tee time, explain bill, find facility availability
- Proactive reminders: upcoming tee times, overdue balance, expiring offers

## Dependencies
### Interface Dependencies
- Floating action button (FAB) on all portal pages
- FAB hidden on `/portal/aura` itself
- FAB hidden on desktop (`md:hidden`)

### Settings Dependencies
- `features.portal.auraEnabled` must be true

### Data Dependencies
- Current: None (hardcoded responses)
- Planned: Member profile, bookings, invoices, facility data

## Settings Requirements
| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| features.portal.auraEnabled | boolean | true | Club Admin | Enables Aura FAB and chat page |

## Data Model
```typescript
interface AuraMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Server action signature
async function sendAuraMessage(message: string): Promise<string>
```

## Business Rules
- FAB positioned at `bottom-24 right-5` with `z-[60]` (above bottom nav z-50)
- FAB uses amber gradient (`from-amber-400 to-amber-600`)
- Chat messages are not persisted to database (session-only)
- Rule-based responses use keyword matching (case-insensitive)
- Default response for unrecognized queries suggests contacting front desk

## Edge Cases
| Scenario | Handling |
|----------|----------|
| Unrecognized question | Returns generic response suggesting front desk contact |
| Empty message | Send button disabled when input is empty |
| Very long message | No truncation currently; may need max length in future |
| Network error | Shows error toast; message stays in input for retry |
