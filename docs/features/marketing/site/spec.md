# Marketing / Site / Marketing Website

## Overview

The ClubVantage marketing website is a Next.js application (`apps/marketing`) that serves as the public-facing product website for the ClubVantage platform. It focuses on waitlist-driven lead generation for founding members, features a roadmap with email-gated voting, and presents the product narrative of "The Future of Club Management" with a 2.5-year roadmap (Q3 2026 through 2028). The site uses next-intl for internationalization, Supabase for backend persistence, and a custom design system with cream/charcoal/primary-green/accent-amber palette.

## Status

**Substantially Implemented.** The marketing site is fully built and deployed with the following pages operational:

- Homepage with hero, video section, "Ready Now" modules, "Coming Soon" modules, roadmap preview, and final CTA
- Waitlist page with 5-field form (name, email, club name, country, club type), Supabase persistence, real position tracking, and benefit display
- Roadmap page with timeline visualization, category filtering, email-gated voting, feature suggestion modal, and Supabase-backed vote persistence
- About page with founder background and stats
- Contact page with Supabase-backed form submission
- 8 feature detail pages (membership, billing, golf, booking, retail, marketing, portal, aura)
- 3 solutions pages (golf, fitness, sports)
- Resource pages (blog, docs, tutorials, help) as placeholders
- Full i18n support via next-intl with `[locale]` route segment

**Backend wiring completed:** Server actions exist for waitlist (`submitWaitlist`, `getWaitlistCount`), contact (`submitContact`), newsletter (`subscribeNewsletter`), voting (`toggleVote`, `getVoteCounts`, `getUserVotes`), and suggestions (`submitFeatureSuggestion`). All persist to Supabase tables.

**Not yet implemented:** Social proof screenshot carousel (currently placeholder logos), pricing page removal/redirect (page still exists at `/pricing`), demo page redirect to waitlist (page still exists at `/demo`), Thai language translations for marketing content, and real waitlist count display in footer.

## Capabilities

- Responsive marketing website with desktop, tablet, and mobile layouts
- Internationalized content via next-intl with locale-prefixed routes (`/en/waitlist`, `/th/waitlist`)
- Waitlist signup with real-time position tracking and Supabase persistence
- Email-gated roadmap voting with localStorage email persistence and toggle (vote/unvote) support
- Feature suggestion submission from roadmap page
- Newsletter subscription from footer and CTA sections (idempotent upsert)
- Contact form submission with status tracking
- Feature pages with "Built" and "Coming Soon" status badges
- Roadmap timeline visualization (Now / Q3 2026 / Q4 2026 / 2027 / 2028)
- Category-filtered feature board (Membership, Billing, Booking, Golf, Portal, AI, Integrations, Retail, Marketing)
- SEO-optimized pages with meta titles, descriptions, and Open Graph tags

## Dependencies

### Interface Dependencies

| Component | Path | Purpose |
|-----------|------|---------|
| Header | `apps/marketing/src/components/layout/header.tsx` | Site navigation header |
| Footer | `apps/marketing/src/components/layout/footer.tsx` | Footer with newsletter subscribe |
| EarlyAccessHero | `apps/marketing/src/components/home/early-access-hero.tsx` | Homepage hero section |
| VideoSection | `apps/marketing/src/components/home/video-section.tsx` | Embedded video player |
| ReadyNowSection | `apps/marketing/src/components/home/ready-now-section.tsx` | "What's Ready Now" module cards |
| ComingSoonSection | `apps/marketing/src/components/home/coming-soon-section.tsx` | "Coming Soon" module cards |
| RoadmapPreviewSection | `apps/marketing/src/components/home/roadmap-preview-section.tsx` | Top-voted roadmap features preview |
| FinalCtaSection | `apps/marketing/src/components/home/final-cta-section.tsx` | Bottom CTA with newsletter form |
| SocialProofSection | `apps/marketing/src/components/home/social-proof-section.tsx` | Social proof / screenshot carousel |
| ChatWidget | `apps/marketing/src/components/chat/chat-widget.tsx` | Support chat widget |
| Logo | `apps/marketing/src/components/brand/Logo.tsx` | Brand logo component |
| Button | `apps/marketing/src/components/ui/button.tsx` | Custom button with loading state |
| Input | `apps/marketing/src/components/ui/input.tsx` | Custom input with label and error |

### Settings Dependencies

| Setting | Source | Purpose |
|---------|--------|---------|
| SUPABASE_URL | Environment (.env.local) | Supabase project URL for backend |
| SUPABASE_ANON_KEY | Environment (.env.local) | Supabase anonymous key for client-side access |
| NEXT_PUBLIC_SITE_URL | Environment | Canonical site URL for SEO |
| waitlistCapacity | Hardcoded (50) | Maximum founding member spots |
| supportedLocales | next.config.ts | Available locales: en, th |
| defaultLocale | next.config.ts | Default locale: en |

### Data Dependencies

| Entity | Table | Notes |
|--------|-------|-------|
| WaitlistSignup | `waitlist_signups` | Waitlist entries with auto-increment position |
| ContactSubmission | `contact_submissions` | Contact form entries with status tracking |
| NewsletterSubscriber | `newsletter_subscribers` | Email subscribers with source tracking |
| FeatureVote | `feature_votes` | Votes with unique (email, feature_id) constraint |
| FeatureSuggestion | `feature_suggestions` | User-submitted feature ideas |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| supabaseUrl | string | (env) | DevOps | Supabase project URL |
| supabaseAnonKey | string | (env) | DevOps | Supabase anonymous key for RLS-protected queries |
| waitlistCapacity | number | `50` | Product | Maximum number of founding member spots |
| defaultLocale | string | `en` | System | Default language when no locale in URL |
| supportedLocales | string[] | `['en', 'th']` | System | Available language options |
| videoEmbedUrl | string | (hardcoded) | Content | URL for the marketing video embed |
| founderBenefits | object[] | (hardcoded) | Content | List of founding member benefits displayed on waitlist page |
| timelineQuarters | object[] | (hardcoded) | Content | Roadmap timeline data (Now, Q3 2026, Q4 2026, 2027, 2028) |
| featureList | object[] | (hardcoded) | Content | Features displayed on roadmap with status, category, ETA |
| categories | string[] | (hardcoded) | Content | Feature categories for roadmap filtering |
| countries | object[] | (hardcoded) | Content | Country options for waitlist form (TH, SG, MY, HK, ID, PH, Other) |
| clubTypes | object[] | (hardcoded) | Content | Club type options (Golf, Country, Fitness, Sports, Other) |
| googleAnalyticsId | string | (env) | DevOps | GA4 measurement ID for tracking |
| enableChatWidget | boolean | `true` | Product | Whether to show the support chat widget |

## Data Model

### waitlist_signups

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| email | text | unique, not null | Signup email address |
| name | text | | Full name of signee |
| club_name | text | | Name of their club |
| country | text | | Selected country |
| club_type | text | | Selected club type |
| role | text | | Their role at the club |
| position | serial | auto-increment | Waitlist position number |
| created_at | timestamptz | default now() | Signup timestamp |

### contact_submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | not null | Contact name |
| email | text | not null | Contact email |
| club_name | text | | Club name if provided |
| message | text | not null | Message body |
| status | text | default 'new' | Processing status: new, read, replied |
| created_at | timestamptz | default now() | Submission timestamp |

### newsletter_subscribers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| email | text | unique, not null | Subscriber email |
| source | text | | Where they subscribed: 'footer' or 'cta' |
| subscribed_at | timestamptz | default now() | Subscription timestamp |

### feature_votes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| email | text | not null | Voter email address |
| feature_id | text | not null | ID of the feature voted on |
| created_at | timestamptz | default now() | Vote timestamp |
| | | unique (email, feature_id) | One vote per email per feature |

### feature_suggestions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| email | text | | Suggester email (optional) |
| title | text | not null | Feature title |
| description | text | not null | Feature description |
| category | text | not null | Feature category |
| created_at | timestamptz | default now() | Submission timestamp |

### Server Actions

| Action | Path | Input | Behavior |
|--------|------|-------|----------|
| submitWaitlist | `actions/waitlist.ts` | name, email, clubName, country, clubType | Insert or return existing position on conflict |
| getWaitlistCount | `actions/waitlist.ts` | (none) | Count of waitlist_signups rows |
| submitContact | `actions/contact.ts` | name, email, clubName, message | Insert with status 'new' |
| subscribeNewsletter | `actions/newsletter.ts` | email, source | Upsert by email (idempotent) |
| toggleVote | `actions/voting.ts` | email, featureId | Insert or delete; return all counts |
| getVoteCounts | `actions/voting.ts` | (none) | Aggregated {featureId: count} map |
| getUserVotes | `actions/voting.ts` | email | Set of feature IDs user has voted for |
| submitFeatureSuggestion | `actions/suggestions.ts` | email?, title, description, category | Insert suggestion |

## Business Rules

1. Waitlist position is determined by the `position` serial column. On duplicate email submission, the existing position is returned without creating a new row.
2. Voting is gated by email. The email is stored in localStorage after first entry. Users can vote and unvote (toggle) on any non-completed feature.
3. Completed features (status: 'completed') display a version badge (e.g., "v1.0") instead of a vote button.
4. Newsletter subscription is idempotent; submitting the same email updates the source but does not create a duplicate.
5. Feature suggestions do not require authentication; the email field is optional.
6. The roadmap timeline has 5 phases: Now (Built), Q3 2026 (Launch), Q4 2026 (Engagement), 2027 (Intelligence), 2028 (Ecosystem).
7. All page content uses next-intl translation keys. Hardcoded English strings in components are a bug.
8. The pricing page (`/pricing`) and demo page (`/demo`) are marked for removal/redirect to `/waitlist` per the redesign plan but are still live.
9. Vote counts are fetched on page load and after each vote action to ensure consistency.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User submits waitlist form with email already registered | Return existing position; show success state with original position number |
| User votes without providing email | Show email prompt modal; store email in localStorage; then execute pending vote |
| User clears localStorage and votes again | Email prompt modal appears again; votes are tied to email, not session |
| Same email votes for same feature twice | Toggle behavior: first click adds vote, second click removes it |
| Supabase unavailable during form submission | Server action catches error; returns `{ success: false, error: message }`; UI shows generic error |
| User accesses site with unsupported locale | next-intl middleware redirects to default locale (en) |
| Feature list in code diverges from Supabase vote data | Vote counts from Supabase override hardcoded initial values; unknown feature IDs in database are ignored |
| Mobile viewport with long feature descriptions | Text truncated with `line-clamp-2` CSS; full description visible on card expansion (not yet implemented) |
| Newsletter subscribe called from both footer and CTA in same session | Both succeed idempotently; source field reflects last submission source |
| Contact form submitted with very long message | No length limit in current implementation; should add server-side max length validation (e.g., 5000 chars) |
| Concurrent votes from same email on same feature | Database unique constraint prevents duplicates; toggle logic handles race conditions by re-fetching counts after mutation |
