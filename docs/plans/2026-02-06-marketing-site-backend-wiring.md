# Marketing Site Backend Wiring

**Date:** 2026-02-06
**Status:** Approved

## Overview

Wire up all marketing site forms, voting, and placeholder content to real Supabase backend. Replace mock setTimeout submissions with server actions that persist data.

## Supabase Tables

### `waitlist_signups`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| email | text | unique, not null |
| name | text | |
| club_name | text | |
| role | text | |
| position | serial | auto-increment for waitlist position |
| created_at | timestamptz | default now() |

### `contact_submissions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | not null |
| email | text | not null |
| club_name | text | |
| message | text | not null |
| status | text | default 'new' |
| created_at | timestamptz | default now() |

### `newsletter_subscribers`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | text | unique, not null |
| source | text | 'footer' or 'cta' |
| subscribed_at | timestamptz | default now() |

### `feature_votes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | text | not null |
| feature_id | text | not null |
| created_at | timestamptz | default now() |
| **unique** | | (email, feature_id) |

### `feature_suggestions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | text | |
| title | text | not null |
| description | text | not null |
| category | text | not null |
| created_at | timestamptz | default now() |

## Server Actions

All server actions in `apps/marketing/src/app/actions/`.

### `waitlist.ts` - submitWaitlist()
- Insert into `waitlist_signups`
- On conflict (email) return existing position
- Return real position (row count or serial value)

### `contact.ts` - submitContact()
- Insert into `contact_submissions` with status 'new'
- Return success/error

### `newsletter.ts` - subscribeNewsletter()
- Upsert into `newsletter_subscribers` by email
- Accept `source` param ('footer' | 'cta')
- Return success (idempotent)

### `suggestions.ts` - submitFeatureSuggestion()
- Insert into `feature_suggestions`
- Return success

### `voting.ts` - toggleVote() + getVoteCounts()
- `toggleVote(email, featureId)`: Insert or delete from `feature_votes`
- `getVoteCounts()`: Return `{ [featureId]: count }` from aggregated query
- `getUserVotes(email)`: Return set of feature IDs the user has voted for

## Voting UX Flow

1. User clicks vote arrow on a feature card
2. If no email in localStorage, show email prompt modal
3. Email stored in localStorage for future votes
4. Server action `toggleVote()` inserts or removes vote
5. UI updates with real count from `getVoteCounts()`
6. On page load, `getVoteCounts()` provides initial counts
7. If email in localStorage, `getUserVotes(email)` highlights voted features

## Social Proof Section

Replace fake logo placeholders with a platform screenshot carousel:
- Use real screenshots from the ClubVantage app (tee sheet, members, billing, POS, etc.)
- Horizontal scrolling carousel with captions
- Screenshots stored in `public/images/screenshots/`

## Files to Create

1. `apps/marketing/src/lib/supabase.ts` - Supabase client init
2. `apps/marketing/src/app/actions/waitlist.ts`
3. `apps/marketing/src/app/actions/contact.ts`
4. `apps/marketing/src/app/actions/newsletter.ts`
5. `apps/marketing/src/app/actions/voting.ts`
6. `apps/marketing/src/app/actions/suggestions.ts`

## Files to Modify

1. `apps/marketing/src/app/waitlist/page.tsx` - Use submitWaitlist()
2. `apps/marketing/src/app/contact/page.tsx` - Use submitContact()
3. `apps/marketing/src/components/layout/footer.tsx` - Use subscribeNewsletter()
4. `apps/marketing/src/components/home/final-cta-section.tsx` - Use subscribeNewsletter()
5. `apps/marketing/src/app/roadmap/page.tsx` - Use voting actions, add email modal
6. `apps/marketing/src/components/home/social-proof-section.tsx` - Screenshot carousel

## Implementation Order

1. Supabase client setup + env vars
2. Create tables (SQL migration)
3. Waitlist form (highest value - captures leads)
4. Newsletter subscription (footer + CTA)
5. Contact form
6. Roadmap voting (email-gated + persistent)
7. Feature suggestions
8. Social proof screenshot carousel
