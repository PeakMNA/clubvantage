# Vantage Marketing AI — Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** An AI-powered marketing engine that acts as each club's in-house digital marketing agency — handling member acquisition and engagement across email, social, LINE, and web.

**Architecture:** Hybrid SaaS model. Self-serve tier (included) gives staff AI-assisted campaign tools. Managed tier (premium) lets AI operate autonomously with human oversight. Deep integration with ClubVantage data (members, bookings, billing, golf, events, POS) enables smart segmentation and automatic attribution that generic marketing tools can't match.

**Tech Stack:** Claude API (content generation), Resend/AWS SES (email), Meta Graph API (social), LINE Messaging API, React Email, Next.js (landing pages), Prisma (marketing domain models).

---

## 1. Product Architecture

### Two Tiers

| Tier | Who Does What | Included? |
|------|--------------|-----------|
| **Self-Serve** | Staff creates campaigns with AI assistance. AI suggests content, staff approves and schedules. | Included in subscription |
| **Managed** | AI operates autonomously — generates campaigns, publishes on schedule, optimizes. Staff get weekly digest and override controls. | Premium add-on (~$200-500/mo) |

### Hybrid Architecture — Two Frontends, One API

**Frontend 1: Self-Serve Module** (inside staff dashboard)
Club staff use this daily alongside billing, bookings, golf.

```
apps/application/                → Existing staff dashboard
  src/app/(dashboard)/marketing/ → NEW: Self-serve marketing module
    /campaigns                   → Campaign builder + calendar
    /audiences                   → Smart segments from member data
    /content                     → AI content studio (email, social, web)
    /channels                    → Channel config (email, social, LINE, web)
    /analytics                   → Performance dashboards
    /referrals                   → Referral program management + tracking
    /settings                    → Brand voice, approval workflows, tier config
```

**Frontend 2: Managed-Tier Operations Panel** (separate app)
Vantage's marketing team operates across ALL clubs from a single dashboard.

```
apps/marketing-ops/              → NEW: Managed-tier operations app
  src/app/(dashboard)/
    /clubs                       → Club portfolio overview (all managed clients)
    /clubs/[clubId]/campaigns    → Campaign management for specific club
    /clubs/[clubId]/analytics    → Per-club performance
    /clubs/[clubId]/content      → Content review + approval queue
    /queue                       → Cross-club content approval queue
    /templates                   → Shared campaign/flow templates across clubs
    /performance                 → Portfolio-wide analytics + revenue tracking
    /settings                    → Team management, SLA config
```

**Shared Backend:**

```
apps/api/src/modules/marketing/  → Single API module serves both frontends
apps/api/src/graphql/marketing/  → GraphQL types, resolvers, inputs
```

**Why hybrid:**
- Club staff get marketing tools where they already work (no new login)
- Vantage's managed-tier team gets a multi-tenant view across all clients
- External agencies could get scoped access to the ops panel per-club
- One API module, two presentation layers — no logic duplication
- `marketing-ops` can ship later (Phase 4) since managed tier is last

### Channels

- **Email** — Campaigns, drip sequences, event invites, renewal reminders
- **Social** — Facebook Pages + Instagram Business (Meta Graph API)
- **LINE** — Rich messages, flex messages, narrowcast targeting (critical for Thailand market)
- **Web / Landing Pages** — AI-generated membership drives, event pages, seasonal promotions

---

## 2. Smart Audiences

The biggest differentiator over generic marketing tools. ClubVantage owns the member data, so the AI builds segments no external tool could.

### Pre-Built Smart Segments

| Segment | Data Source | Example |
|---------|------------|---------|
| Churn Risk | Booking frequency decline + billing delinquency | Members who booked 4x/month → 0 in last 30 days |
| Renewal Window | Membership contract dates | Contracts expiring in 30/60/90 days |
| High-Value Inactive | Spending history + recent activity | Top 20% spenders with no activity in 14+ days |
| New Member Onboarding | Join date | Members in first 90 days |
| Facility Enthusiasts | Booking patterns by facility | Members who book tennis 3+/week |
| Lapsed Guests | Guest visit history | Guests who visited 2+ times but didn't apply |
| Event Prospects | Event attendance + demographics | Members who attended similar past events |
| Referral Champions | Referral history + social engagement | Members who've referred 2+ successful applicants |

### Custom Segments via Natural Language

Staff types: _"Members over 40 who play golf at least twice a month but have never booked a spa service"_ → AI translates to a query against the member/booking/billing data model and creates a live segment that auto-updates.

### Data Model

```typescript
export const SegmentType = {
  SMART: 'SMART',
  CUSTOM: 'CUSTOM',
  MANUAL: 'MANUAL',
} as const;
export type SegmentType = (typeof SegmentType)[keyof typeof SegmentType];

export const FilterOperator = {
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  BETWEEN: 'BETWEEN',
  CONTAINS: 'CONTAINS',
  IN: 'IN',
  NOT_IN: 'NOT_IN',
} as const;
export type FilterOperator = (typeof FilterOperator)[keyof typeof FilterOperator];

export const SegmentSource = {
  MEMBERS: 'MEMBERS',
  BOOKINGS: 'BOOKINGS',
  BILLING: 'BILLING',
  GOLF: 'GOLF',
  EVENTS: 'EVENTS',
  POS: 'POS',
} as const;
export type SegmentSource = (typeof SegmentSource)[keyof typeof SegmentSource];

interface AudienceSegment {
  id: string;
  clubId: string;
  name: string;
  description: string;
  type: SegmentType;
  rules: SegmentRule[];
  naturalLanguageQuery?: string;
  memberCount: number;
  refreshedAt: Date;
  isArchived: boolean;
}

interface SegmentRule {
  field: string;
  operator: FilterOperator;
  value: any;
  source: SegmentSource;
}
```

---

## 3. AI Content Studio

The AI generates channel-ready content using club context and brand voice.

### Brand Voice Profile

During onboarding, the club sets tone (formal/casual/luxury), language (EN/TH/both), visual style, and uploads logo/brand assets. AI uses this as the system prompt for all content generation.

### Content Generation by Channel

| Channel | AI Generates | Staff Approves |
|---------|-------------|----------------|
| Email | Subject line, body, CTA, preview text. Pulls member name, upcoming events, relevant offers. | Preview in template → approve/edit → schedule |
| Social | Caption + hashtags + suggested image prompt. Variants for FB/IG. | Preview per platform → approve/edit → schedule |
| LINE | Rich message (image + text + CTA buttons), Flex Messages for booking cards. | Preview → approve → schedule |
| Web/Landing | Full landing page copy + layout for membership drives, events, promotions. | Preview → approve → publish |

### Content Triggers

AI proactively suggests content based on club data:
- Empty tee times tomorrow → Flash deal LINE message to golfers
- 15 renewals expiring this month → Renewal campaign draft
- New spa service added → Social announcement + email to spa bookers
- Member milestone (100th visit) → Personalized congratulations

### Content Calendar

Visual monthly calendar showing all scheduled content across channels. Drag to reschedule. Color-coded by channel and campaign.

### Data Model

```typescript
export const ContentType = {
  EMAIL: 'EMAIL',
  SOCIAL_POST: 'SOCIAL_POST',
  LINE_MESSAGE: 'LINE_MESSAGE',
  LANDING_PAGE: 'LANDING_PAGE',
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const ContentStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED',
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

interface ContentPiece {
  id: string;
  campaignId?: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  body: string;
  metadata: Record<string, any>;
  audienceSegmentId?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  generatedBy: 'AI' | 'STAFF';
  approvedBy?: string;
}
```

---

## 4. Campaign Engine

Campaigns tie audiences, content, and channels together into coordinated marketing flows.

### Two Campaign Modes

**One-Shot Campaigns** — Single send to a segment:
- "Valentine's Dinner Event" email + social post + LINE message
- "Membership Open Day" landing page + social + email invite
- "Monsoon Season Spa Promo" email to golfers-who-don't-spa

**Automated Flows** — Trigger-based sequences that run continuously:

| Flow | Trigger | Steps |
|------|---------|-------|
| New Member Welcome | Membership status → ACTIVE | Day 0: Welcome email → Day 3: Facilities guide → Day 7: "Book your first tee time" LINE → Day 14: Check-in survey |
| Renewal Nurture | Contract expiry in 90 days | 90d: Benefits reminder → 60d: Renewal offer → 30d: Personal note from GM → 7d: Urgency email |
| Re-Engagement | No booking in 30 days | Day 30: "We miss you" email → Day 45: Special offer LINE → Day 60: Staff alert for personal outreach |
| Referral Ask | After 6 months active + 3+ bookings/month | Invite to referral program → Monthly reminder with incentive tier |
| Event Follow-Up | Event attendance confirmed | Day +1: Thank you + photos → Day +3: "Next event you'd love" → Day +7: Share on social prompt |
| Lapsed Guest | Guest visited 2+ times, no application | Day +7: "Loved your visit?" email → Day +14: Membership info → Day +30: Open day invite |

### Flow Builder

Visual node-based editor. Each node is:
- **Trigger**: Data event from ClubVantage (status change, date threshold, booking pattern)
- **Wait**: Delay (days/hours) or wait for condition
- **Action**: Send email / LINE / social post / create task for staff
- **Branch**: If/else based on member data or previous engagement (opened email? clicked?)
- **Exit**: Member meets condition (booked, renewed, unsubscribed)

### Data Model

```typescript
export const CampaignType = {
  ONE_SHOT: 'ONE_SHOT',
  AUTOMATED_FLOW: 'AUTOMATED_FLOW',
} as const;
export type CampaignType = (typeof CampaignType)[keyof typeof CampaignType];

export const CampaignStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

export const FlowNodeType = {
  TRIGGER: 'TRIGGER',
  WAIT: 'WAIT',
  ACTION: 'ACTION',
  BRANCH: 'BRANCH',
  EXIT: 'EXIT',
} as const;
export type FlowNodeType = (typeof FlowNodeType)[keyof typeof FlowNodeType];

interface Campaign {
  id: string;
  clubId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  audienceSegmentIds: string[];
  channels: ContentType[];
  flow?: FlowNode[];
  scheduledAt?: Date;
  metrics: CampaignMetrics;
  tier: 'SELF_SERVE' | 'MANAGED';
  createdBy: string;
}

interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  config: Record<string, any>;
  nextNodeIds: string[];
}

interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
}
```

**Key differentiator:** Conversion is tracked automatically because ClubVantage owns the booking/billing data. A member who received a "Book a spa" email and then booked a spa appointment within 7 days is attributed — no UTM parameter guesswork.

---

## 5. Referral Program

Market average: 1.1 — no competitor scores higher than 2. Referrals are the #1 acquisition channel for private clubs, yet every competitor handles them informally at best.

### Referral Flow

```
Member gets invite → Shares unique link → Prospect visits personalized landing page
→ Fills lead form → Enters ClubVantage pipeline → Application
→ Approved & Activated → Referrer gets reward
```

### AI-Powered Smart Referral Targeting

Not every member is equally likely to refer. The AI identifies **Referral Champions** based on:
- Tenure (6+ months active)
- Engagement level (3+ bookings/month)
- Social activity (event attendance, guest visits brought)
- Past referral success
- Net Promoter Score (if collected)

The AI sends referral asks at optimal moments:
- After a great experience (just finished a round, left a positive review)
- During high-satisfaction periods (new facility opened, event they loved)
- When the club needs members (seasonal dips, new membership tier launch)

### Incentive Tiers

| Tier | Threshold | Reward |
|------|-----------|--------|
| Bronze | 1 successful referral | Account credit (e.g. 2,000 THB) |
| Silver | 3 successful referrals | Monthly dues waiver (1 month) |
| Gold | 5+ successful referrals | Annual benefit upgrade or exclusive event access |

Clubs configure their own reward tiers and amounts in settings. "Successful" = prospect reaches a configurable milestone (applied, approved, or activated — club chooses).

### Referral Tracking

Every referrer gets a unique shareable link that routes to an AI-generated landing page personalized with the referrer's name: _"Your friend Somchai thinks you'd love Royal Bangkok Sports Club."_

The full attribution chain is tracked:

```
Referrer (member) → Share link → Prospect visit → Lead form
→ Application → Approval → Activation → Reward issued
```

### Referral Automated Flows

Two pre-built flows integrated into the Campaign Engine:

| Flow | Trigger | Steps |
|------|---------|-------|
| Referral Ask | Member meets champion criteria | Invite email with unique link → 14d: Reminder if no shares → 30d: Incentive tier reminder |
| Referral Nurture | Prospect fills referral lead form | Day 0: Welcome + club info → Day 3: Virtual tour / photo gallery → Day 7: Open day invite → Day 14: Application CTA → Day 30: Final nudge |

### Data Model

```typescript
export const ReferralStatus = {
  INVITED: 'INVITED',
  LINK_SHARED: 'LINK_SHARED',
  PROSPECT_REGISTERED: 'PROSPECT_REGISTERED',
  APPLICATION_STARTED: 'APPLICATION_STARTED',
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPROVED: 'APPROVED',
  ACTIVATED: 'ACTIVATED',
  REWARD_ISSUED: 'REWARD_ISSUED',
  EXPIRED: 'EXPIRED',
} as const;
export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];

export const RewardType = {
  ACCOUNT_CREDIT: 'ACCOUNT_CREDIT',
  DUES_WAIVER: 'DUES_WAIVER',
  BENEFIT_UPGRADE: 'BENEFIT_UPGRADE',
  CUSTOM: 'CUSTOM',
} as const;
export type RewardType = (typeof RewardType)[keyof typeof RewardType];

interface Referral {
  id: string;
  clubId: string;
  referrerId: string;
  prospectEmail: string;
  prospectName?: string;
  prospectMemberId?: string;
  status: ReferralStatus;
  shareLink: string;
  landingPageId?: string;
  referredAt: Date;
  convertedAt?: Date;
  rewardIssuedAt?: Date;
}

interface ReferralProgram {
  id: string;
  clubId: string;
  name: string;
  isActive: boolean;
  successMilestone: ReferralStatus;
  tiers: ReferralTier[];
  expiryDays?: number;
}

interface ReferralTier {
  name: string;
  threshold: number;
  rewardType: RewardType;
  rewardValue: number;
  rewardDescription: string;
}
```

### Referral Analytics

| Metric | Description |
|--------|-------------|
| Funnel | Invites sent → shared → registered → applied → activated |
| Top Referrers | Leaderboard by successful referrals |
| Time to Convert | Average days from referral → activation |
| Program ROI | Reward cost vs new member lifetime value |
| Conversion by Source | Rate by channel (email, LINE, social share) |

---

## 6. Channel Integrations

### Email — Resend or AWS SES

| Aspect | Approach |
|--------|----------|
| Provider | Resend (developer-friendly, React Email templates) or AWS SES (cost at scale) |
| Templates | React Email components matching club brand. AI generates content, templates handle layout. |
| Personalization | Merge tags from member data: `{{firstName}}`, `{{membershipType}}`, `{{lastBooking}}` |
| Deliverability | Per-club sending domain (SPF/DKIM). Bounce/complaint handling via webhooks. |
| Tracking | Open/click tracking via provider webhooks → CampaignMetrics |

### Social — Meta Graph API

| Aspect | Approach |
|--------|----------|
| Platforms | Facebook Pages + Instagram Business (connected via Meta Graph API) |
| Publishing | Direct API for scheduled posts, or via aggregator (Ayrshare) for simpler auth |
| Content | AI generates caption + hashtags. Staff upload photos or AI suggests stock/club photos. |
| Scheduling | Content calendar → publish at AI-recommended optimal times |
| Tracking | Engagement metrics pulled via API → CampaignMetrics |

### LINE — LINE Messaging API

| Aspect | Approach |
|--------|----------|
| Account | Each club gets a LINE Official Account (standard in Thailand) |
| Message Types | Rich messages (image + text + CTA buttons), Flex Messages for booking cards |
| Targeting | Narrowcast API to send to audience segments (not broadcast to all) |
| Rich Menus | AI-generated bottom menu linking to booking, events, portal |
| Tracking | Delivery/read receipts + link click tracking via webhooks |

### Web / Landing Pages

| Aspect | Approach |
|--------|----------|
| Hosting | Sub-routes under club's marketing site or custom domain |
| Builder | AI generates content + layout. Template-based with sections (hero, features, testimonials, CTA). |
| Templates | Membership drive, event promotion, seasonal offer, open day registration |
| Forms | Embedded lead capture → creates prospect/lead in ClubVantage members module |
| SEO | AI generates meta tags, OG images, structured data |

### Channel Config Data Model

```typescript
export const ChannelType = {
  EMAIL: 'EMAIL',
  FACEBOOK: 'FACEBOOK',
  INSTAGRAM: 'INSTAGRAM',
  LINE: 'LINE',
  LANDING_PAGE: 'LANDING_PAGE',
} as const;
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const ChannelStatus = {
  NOT_CONNECTED: 'NOT_CONNECTED',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR',
  SUSPENDED: 'SUSPENDED',
} as const;
export type ChannelStatus = (typeof ChannelStatus)[keyof typeof ChannelStatus];

interface ChannelConfig {
  id: string;
  clubId: string;
  type: ChannelType;
  status: ChannelStatus;
  credentials: Record<string, string>;
  settings: Record<string, any>;
  dailySendLimit?: number;
  connectedAt?: Date;
  lastSyncAt?: Date;
}
```

---

## 7. Analytics & Performance

### Three Metric Tiers

**Tier 1 — Delivery Metrics** (standard):
- Emails: sent, delivered, bounced, opened, clicked
- Social: reach, impressions, engagement rate
- LINE: delivered, read, clicked
- Landing pages: visits, time on page, form submissions

**Tier 2 — Engagement Metrics** (ClubVantage advantage):
- Members who opened email AND booked within 7 days
- Social post reach → landing page visits → lead form submissions
- LINE message → tee time booking correlation
- Campaign-attributed revenue

**Tier 3 — Business Outcomes** (the real differentiator):

| Metric | How It's Tracked |
|--------|-----------------|
| Member Acquisition Cost | Ad spend + campaign cost / new applications attributed |
| Retention Impact | Churn rate of members in re-engagement flows vs control group |
| Revenue per Campaign | Bookings + POS purchases within attribution window |
| Referral Pipeline | Invites sent → accepted → applications → activated |
| Renewal Rate Lift | Renewal rate for nurtured vs non-nurtured members |
| Lifetime Value Impact | LTV trend for marketing-acquired vs organic members |

### AI Optimization Loop

The AI uses Tier 2 + 3 data to improve itself:
- **Send Time Optimization**: Learns when each segment is most responsive
- **Content A/B Testing**: Auto-generates variants, promotes winners
- **Channel Mix**: Shifts effort toward highest-converting channels per segment
- **Audience Refinement**: Suggests new segments based on conversion patterns

### Analytics Data Model

```typescript
export const MetricPeriod = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
} as const;
export type MetricPeriod = (typeof MetricPeriod)[keyof typeof MetricPeriod];

export const AttributionModel = {
  FIRST_TOUCH: 'FIRST_TOUCH',
  LAST_TOUCH: 'LAST_TOUCH',
  LINEAR: 'LINEAR',
} as const;
export type AttributionModel = (typeof AttributionModel)[keyof typeof AttributionModel];

interface CampaignAnalytics {
  campaignId: string;
  period: MetricPeriod;
  date: Date;
  delivery: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  engagement: {
    bookingsMade: number;
    eventRegistrations: number;
    portalLogins: number;
    posTransactions: number;
  };
  business: {
    revenueAttributed: number;
    newLeads: number;
    applicationsStarted: number;
    membersRenewed: number;
    referralsSent: number;
  };
}
```

---

## 8. Managed Tier — AI Agency Mode

### How It Works

```
SELF-SERVE (included):   Staff creates → AI assists → Staff approves
MANAGED (premium):       AI creates → AI schedules → Staff reviews weekly
```

### Managed Tier Weekly Cycle

| Day | AI Does | Staff Sees |
|-----|---------|-----------|
| Monday | Analyzes past week. Identifies opportunities from club data. | Weekly Performance Digest |
| Mon-Tue | Generates content plan: 2-3 emails, 5-7 social posts, 2-3 LINE messages. | Content Plan notification — can review/edit/veto |
| Wed-Sun | Publishes approved content. Auto-adjusts timing. Pauses underperformers. | Real-time activity feed. Can pause instantly. |
| Ongoing | Runs automated flows. Responds to triggers. | Flow activity log. Anomaly alerts. |

### Guardrails

```typescript
export const ApprovalMode = {
  MANUAL: 'MANUAL',
  AUTO_WITH_REVIEW: 'AUTO_WITH_REVIEW',
  FULL_AUTO: 'FULL_AUTO',
} as const;
export type ApprovalMode = (typeof ApprovalMode)[keyof typeof ApprovalMode];

interface ManagedTierConfig {
  clubId: string;
  approvalMode: ApprovalMode;
  brandVoice: {
    tone: string;
    language: string;
    guidelines: string;
    sampleContent: string[];
  };
  limits: {
    maxEmailsPerWeek: number;
    maxSocialPostsPerDay: number;
    maxLineMessagesPerWeek: number;
    maxSpendPerMonth: number;
  };
  blackoutDates: Date[];
  requiredApprovalTopics: string[];
}
```

### Revenue Model

- Self-serve: included in ClubVantage subscription
- Managed tier: ~$200-500/mo depending on club size (high margin — AI does the work)

---

## 9. Data Architecture

### Data Flow

```
ClubVantage Core (existing)          Marketing Engine (new)
┌──────────────────────┐            ┌──────────────────────┐
│ Members              │───read────▶│ Audience Builder      │
│ Bookings             │───read────▶│ Trigger Engine        │
│ Billing              │───read────▶│ Attribution Tracker   │
│ Golf                 │───read────▶│ Content Personalizer  │
│ Events               │───read────▶│ Analytics Aggregator  │
│ POS                  │───read────▶│                       │
├──────────────────────┤            ├──────────────────────┤
│ Members (leads)      │◀──write───│ Lead Capture Forms    │
│ Events (registrations)│◀──write───│ Event Campaigns       │
│ Notifications        │◀──write───│ Staff Alerts          │
└──────────────────────┘            └──────────────────────┘
```

**Key principle:** Read from core, write only leads and registrations back. The marketing engine never modifies member records, bookings, or billing.

### New Prisma Models

```
marketing_audience_segments     — Segment definitions + rules
marketing_campaigns             — Campaign config + status
marketing_campaign_members      — Which members are in which campaign
marketing_flow_nodes            — Automated flow definitions
marketing_flow_executions       — Per-member flow progress
marketing_content_pieces        — Generated content
marketing_channel_configs       — Channel credentials + settings
marketing_analytics             — Aggregated metrics
marketing_events                — Raw event log (sent, opened, clicked, converted)
marketing_brand_configs         — Brand voice + managed tier settings
marketing_landing_pages         — Generated page content + metadata
marketing_referrals             — Individual referral tracking
marketing_referral_programs     — Program configuration + tiers
marketing_referral_rewards      — Issued rewards + redemption status
```

### API Module Structure

```
apps/api/src/modules/marketing/
  marketing.module.ts
  marketing.service.ts           — Campaign CRUD, scheduling
  audience.service.ts            — Segment building, NL→query translation
  content-generation.service.ts  — Claude API for content generation
  channel-email.service.ts       — Resend/SES integration
  channel-social.service.ts      — Meta Graph API
  channel-line.service.ts        — LINE Messaging API
  flow-engine.service.ts         — Automated flow execution
  analytics.service.ts           — Metric aggregation + attribution
  optimization.service.ts        — AI optimization loop
  referral.service.ts            — Referral program, tracking, rewards

apps/api/src/graphql/marketing/
  marketing.resolver.ts
  marketing.types.ts
  marketing.input.ts
```

Content generation uses Claude (already a dependency via `@anthropic-ai/sdk` in the member portal) with club-specific system prompts built from brand voice config + member data context.

---

## 10. Implementation Phasing

### Phase 1 — Foundation + Email (8-10 weeks)

**Ships:**
- Marketing module skeleton in staff dashboard (`/marketing/*`)
- Audience builder with pre-built smart segments
- Natural language segment creation (Claude translates NL → segment rules)
- Email channel integration (Resend)
- One-shot email campaigns: pick segment → AI generates content → preview → send
- Basic delivery metrics

**Why first:** Email is highest-ROI for clubs. Smart segments alone are valuable.

### Phase 2 — Automated Flows + Referral Program + Attribution (8-10 weeks)

**Ships:**
- Visual flow builder
- 7 pre-built flow templates (welcome, renewal, re-engagement, referral ask, referral nurture, event follow-up, lapsed guest)
- **Referral program**: configuration, unique share links, personalized landing pages, incentive tiers, reward tracking
- **Referral AI targeting**: Smart identification of referral champions, optimal ask timing
- ClubVantage attribution tracking (campaign → booking/renewal/application/referral)
- Tier 2 + 3 analytics dashboard including referral funnel
- Content A/B testing

**Why second:** Automated flows are the "set and forget" value proposition. Referral programs are the #1 acquisition channel for private clubs — pairing them with AI targeting and automated nurture flows is a category-defining feature. Attribution proves ROI.

### Phase 3 — Social + LINE (6-8 weeks)

**Ships:**
- Meta Graph API integration (Facebook + Instagram)
- LINE Messaging API integration
- Content calendar across all channels
- Multi-channel campaigns
- Send time optimization

**Why third:** Social/LINE require OAuth app review. Email + flows prove the engine works first.

### Phase 4 — Landing Pages + Managed Tier Ops Panel (8-10 weeks)

**Ships:**
- Landing page builder with AI-generated content
- Lead capture forms → ClubVantage member pipeline
- Managed tier configuration (approval modes, brand voice, guardrails)
- Autonomous weekly cycle
- Weekly performance digest
- Optimization loop
- **`apps/marketing-ops/`** — New separate app for Vantage's managed-tier team:
  - Multi-club portfolio dashboard
  - Cross-club content approval queue
  - Shared campaign/flow templates
  - Portfolio-wide analytics + revenue tracking
  - Per-club scoped access for external agencies

**Why last:** Managed tier needs all channels working. The ops panel is a separate app but reuses the same API module built in Phases 1-3. This is the premium monetization layer.

**Total timeline: ~32-38 weeks across 4 phases.**

---

## 11. Competitive Positioning

| Capability | Mindbody | PushPress | Jonas Club | WellnessLiving | **ClubVantage** |
|-----------|----------|-----------|------------|----------------|-----------------|
| Email Marketing | 3 | 3 | 2 | 3 | **3** |
| Social Management | 1 | 1 | 0 | 1 | **3** |
| Marketing Automation | 3 | 3 | 2 | 3 | **3** |
| AI Content Generation | 0 | 2 | 0 | 0 | **3** |
| Smart Segmentation | 1 | 2 | 1 | 1 | **3** |
| Referral Programs | 2 | 2 | 0 | 2 | **3** |
| Attribution Tracking | 1 | 1 | 0 | 1 | **3** |
| Autonomous Marketing | 0 | 1 | 0 | 0 | **3** |
| Private Club Specific | 0 | 0 | 2 | 0 | **3** |

**No competitor offers an AI-powered autonomous marketing engine with deep integration into club operational data.** The referral program alone — with AI-targeted champion identification, personalized landing pages, automated nurture flows, and end-to-end attribution — exceeds every competitor's referral capability. This is a category-creating feature.
