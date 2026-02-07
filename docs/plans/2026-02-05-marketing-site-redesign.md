# Marketing Site Redesign: Waitlist-Focused

**Date:** February 5, 2026
**Status:** Approved
**Goal:** Reorganize marketing site for waitlist conversion with "shape the product" positioning

---

## Executive Summary

Redesign ClubVantage marketing site to focus on building a waitlist of founding members who will help shape the product. Core narrative: "The Future of Club Management" with a 2.5-year roadmap (Q3 2026 - End 2028).

**Key Changes:**
- Update messaging from "buy now" to "join the waitlist"
- Add timeline-based feature presentation (Built vs Coming Soon)
- Extend roadmap to 2.5 years with voting
- Update About page with founder's 25-year background
- Remove pricing page (use "Founder Pricing" hook instead)
- Redirect /demo to /waitlist

---

## Site Structure

### Pages to Keep & Update

| Page | Update Required |
|------|-----------------|
| `/` (Homepage) | Full redesign - new hero, video, timeline features |
| `/roadmap` | Extend to 2.5 years, update timeline structure |
| `/about` | Reframe around founder's background + ClubVantage story |
| `/waitlist` | New form with 5 fields, benefits section |
| `/features` | Add "Built" / "Coming Soon" badges |
| `/features/*` | Add status badges to all 8 detail pages |
| `/solutions/*` | Update CTAs to waitlist |
| `/resources/*` | Keep as placeholders |
| `/contact` | Keep as-is |

### Pages to Remove/Redirect

| Page | Action |
|------|--------|
| `/pricing` | Remove - replace with "Founder Pricing" messaging |
| `/demo` | Redirect to `/waitlist` |

---

## Homepage Design

### Section 1: Hero

```
[Badge: "Now Accepting Founding Members"]

The Future of
Club Management
Starts Here

AI-first platform for golf clubs, fitness centers,
and recreational facilities across Southeast Asia.
Join our founding members to shape what we build.

[Join the Waitlist]  [Watch Video]
```

### Section 2: Video + Vision

- Embedded 90-second video (see Video Script below)
- Below video: Key stats (50 founding spots, X joined, 2.5 year roadmap)

### Section 3: What's Ready Now

5 module cards with "Built" badge:
- **Members** - Complete member lifecycle management
- **Billing** - Invoicing, payments, tax compliance
- **Golf** - Visual tee sheet, caddies, carts
- **Facility Booking** - Courts, rooms, services
- **POS** - Pro shop and retail operations

Each card: Title + 3-4 bullet points + "Learn More" link

### Section 4: Coming Soon

3 module cards with "In Development" badge:
- **Member Portal** - Mobile-first self-service (Q3 2026)
- **Aura AI** - Intelligent assistant (Q3 2026)
- **AI Marketing** - Engagement & acquisition (Q4 2026)

### Section 5: Shape What's Next

- Headline: "Help Us Decide What's Next"
- Preview top 3 most-voted roadmap features
- CTA: "Vote on the Roadmap →"

### Section 6: Final CTA

- "Join X founding members"
- Inline waitlist form

---

## Roadmap Page Design

### Timeline Structure (Hybrid)

Near-term by quarter, far-term by year:

| Timeframe | Theme | Key Features |
|-----------|-------|--------------|
| **Now (Built)** | Foundation | Members, Billing, Golf Tee Sheet, Facility Booking, POS |
| **Q3 2026** | Launch | Member Portal, Aura AI (Basic), Mobile Apps |
| **Q4 2026** | Engagement | AI Marketing - Engagement, Advanced Reporting, WhatsApp |
| **2027** | Intelligence | AI Marketing - Acquisition, Predictive Analytics, Handicap Integration, Tournament Management |
| **2028** | Ecosystem | Public API, Integration Marketplace, Multi-location, White-label |

### Feature Card Design

Each card shows:
- Title
- 1-line description
- Vote count + upvote button
- Status badge (Built / In Progress / Planned / Considering)
- ETA badge where applicable

### Voting Mechanics

- Anyone can view roadmap
- Must join waitlist to vote
- Votes inform priority, team decides what to build

---

## About Page Design

### Hero

```
25 Years of Club Expertise,
Rebuilt for the AI Era
```

### Stats Bar

| 25+ Years | 150+ Clubs | 500K+ Members | 6 Countries |
|-----------|------------|---------------|-------------|
| Experience | Served | Managed | TH SG MY HK ID PH |

### Founder's Background

1999-2025: Built and ran legacy club management systems across Southeast Asia
- Thailand, Singapore, Malaysia (from 2005)
- Hong Kong (from 2005)
- Indonesia, Philippines (from 2015)

### Why ClubVantage (2025)

"After 25 years, we knew exactly what clubs need - and what legacy systems can't deliver. In late 2025, we started fresh: AI-first architecture, modern design, built on decades of experience. Now we're looking for founding members to build it with us."

### ClubVantage Timeline

- Dec 2025: ClubVantage founded, development begins
- Q3 2026: MVP launch (founding members)
- 2027: Intelligence phase (AI features)
- 2028: Full platform ecosystem

---

## Waitlist Page Design

### Hero

```
[Badge: "Founding Members"]

Join the Future of
Club Management

Be among the first to experience ClubVantage.
Founding members get lifetime pricing + shape the product.
```

### Form Fields (5)

1. **Your Name** - Text
2. **Email** - Email
3. **Club Name** - Text
4. **Country** - Dropdown
   - Thailand
   - Singapore
   - Malaysia
   - Hong Kong
   - Indonesia
   - Philippines
   - Other
5. **Club Type** - Dropdown
   - Golf Club
   - Country Club
   - Fitness Center
   - Sports Club
   - Other

### Benefits Section

What founding members get:
- Lifetime founder pricing (locked in forever)
- Vote on roadmap priorities
- Early access before public launch
- Direct line to the product team

### Social Proof

```
"X clubs have joined · Y spots remaining"
```

---

## Video Script (90 seconds)

### Opening - Vision Hook (0-20 sec)

```
[Visuals: Elegant club interiors, members enjoying facilities]

VOICEOVER:
"For 25 years, we've helped clubs across Asia manage
over half a million members.

We've seen what works. What doesn't.
And what's been missing."
```

### Problem - The Gap (20-35 sec)

```
[Visuals: Frustrated staff at old systems, paper forms, spreadsheets]

VOICEOVER:
"Legacy systems weren't built for today's clubs.
Disconnected tools. Manual processes.
No intelligence.

It's time for something new."
```

### Solution - Introducing ClubVantage (35-60 sec)

```
[Visuals: ClubVantage UI - tee sheet, member dashboard,
billing screens, mobile views]

VOICEOVER:
"Introducing ClubVantage.

An AI-first platform built from the ground up.
Members. Billing. Golf operations. Bookings.
All connected. All intelligent.

Built by club experts who understand your world."
```

### CTA - Join Us (60-90 sec)

```
[Visuals: Roadmap preview, founding member badge, waitlist form]

VOICEOVER:
"We're building the future of club management.
And we want you to help shape it.

Join our founding members.
Vote on what we build next.
Lock in lifetime pricing.

ClubVantage. The future starts here."

[End card: Logo + "Join the Waitlist" + URL]
```

---

## Global Messaging Updates

### CTA Button Changes

| Current | New |
|---------|-----|
| "Request Demo" | "Join Waitlist" |
| "Get Started" | "Join Waitlist" |
| "Contact Sales" | "Join Waitlist" |
| "See Pricing" | "Join for Founder Pricing" |

### Badge System

| Badge | Color | Usage |
|-------|-------|-------|
| Built | Green | Features that are complete |
| In Development | Amber | Features being built now |
| Coming Q3 2026 | Blue | Features with ETA |
| Coming 2027 | Gray | Future features |
| Vote | Purple | Features open for voting |

### Footer Update

Add founding member count:
```
"Join X founding members shaping the future of club management"
```

---

## Assets Needed

### Video Production
- 90-second hybrid video (vision + product glimpses)
- Professional voiceover
- Club B-roll footage
- Screen recordings of ClubVantage UI

### Screenshots
- Golf tee sheet (multiple views)
- Member dashboard
- Billing/invoicing screens
- POS interface
- Mobile/portal mockups (for "Coming Soon")

### Graphics
- Status badges (Built, In Development, Coming Soon)
- Founding member badge
- Timeline visualization for roadmap

---

## Implementation Notes

### Phase 1: Core Pages
1. Homepage redesign
2. Waitlist page with new form
3. About page reframe
4. Roadmap timeline extension

### Phase 2: Messaging Updates
5. Update all CTAs site-wide
6. Add status badges to feature pages
7. Update solutions page CTAs
8. Remove/redirect pricing and demo pages

### Phase 3: Polish
9. Video production and embedding
10. Screenshot updates
11. Social proof counter implementation

---

## Success Metrics

- Waitlist signups (target: 50 founding members)
- Signup conversion rate (target: 10%+ of visitors)
- Country/club type distribution
- Roadmap votes per feature

---

**Document Status:** Ready for implementation
