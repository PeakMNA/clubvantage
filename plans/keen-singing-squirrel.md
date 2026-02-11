# Marketing AI Engine — Phase 1: Foundation + Email

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the marketing module foundation — Prisma models, NestJS API module, audience builder with smart segments, AI content generation (Claude), email channel (Resend), and the frontend marketing section in the staff dashboard.

**Architecture:** New `marketing` module in the API, new `/marketing/*` routes in the staff dashboard. Reads from existing ClubVantage core data (members, bookings, billing, golf) for segmentation. Claude API for NL→segment translation and content generation. Resend for email delivery with webhook tracking.

**Tech Stack:** Prisma (marketing models), NestJS (GraphQL API), Claude API (`@anthropic-ai/sdk`), Resend (email), React Email (templates), Next.js App Router (frontend), TanStack Query (data fetching).

**Design Document:** `docs/plans/2026-02-10-marketing-ai-engine-design.md`

---

## Context

The design document defines a 4-phase Marketing AI Engine. Phase 1 ships:
- Marketing module skeleton in staff dashboard (`/marketing/*`)
- Audience builder with pre-built smart segments
- Natural language segment creation (Claude translates NL → segment rules)
- Email channel integration (Resend)
- One-shot email campaigns: pick segment → AI generates content → preview → send
- Basic delivery metrics

The backend currently has NO marketing models or module. The frontend has 9 dashboard sections but no marketing section. The `@anthropic-ai/sdk` package is already installed (used by member portal's Aura Concierge).

---

## Batch 1: Database + Types Foundation

### Task 1: Add marketing enums to `packages/types`

**File:** `packages/types/src/entities/marketing.ts` (CREATE)

Add all Phase 1 enums using the const object pattern (per CLAUDE.md):

```typescript
// SegmentType, FilterOperator, SegmentSource
// ContentType, ContentStatus
// CampaignType, CampaignStatus
// ChannelType, ChannelStatus
// MetricPeriod, AttributionModel
```

Values are defined in design doc Sections 2-7. Use UPPER_CASE values.

**File:** `packages/types/src/entities/index.ts` (MODIFY)
- Add `export * from './marketing'`

### Task 2: Add Prisma marketing models

**File:** `database/prisma/schema.prisma` (MODIFY)

Add these models at the end of the schema (before any trailing comments). All models follow existing conventions: UUID PKs, `clubId` FK to Club, `createdAt`/`updatedAt` timestamps.

**Models to add (Phase 1 subset):**

```prisma
model MarketingAudienceSegment {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String   @db.Uuid
  name               String   @db.VarChar(255)
  description        String?
  type               String   @db.VarChar(20)  // SMART, CUSTOM, MANUAL
  rules              Json     @default("[]")    // SegmentRule[]
  naturalLanguageQuery String?
  memberCount        Int      @default(0)
  isArchived         Boolean  @default(false)
  refreshedAt        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  club               Club     @relation(fields: [clubId], references: [id])
  campaigns          MarketingCampaign[] @relation("CampaignSegments")

  @@map("marketing_audience_segments")
}

model MarketingCampaign {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String   @db.Uuid
  name               String   @db.VarChar(255)
  type               String   @db.VarChar(20)  // ONE_SHOT, AUTOMATED_FLOW
  status             String   @db.VarChar(20)  // DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED
  channels           String[] @default([])
  scheduledAt        DateTime?
  sentAt             DateTime?
  completedAt        DateTime?
  tier               String   @default("SELF_SERVE") @db.VarChar(20)
  createdBy          String   @db.Uuid
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  club               Club     @relation(fields: [clubId], references: [id])
  segments           MarketingAudienceSegment[] @relation("CampaignSegments")
  contentPieces      MarketingContentPiece[]
  members            MarketingCampaignMember[]
  analytics          MarketingCampaignAnalytics[]

  @@map("marketing_campaigns")
}

model MarketingCampaignMember {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  campaignId         String   @db.Uuid
  memberId           String   @db.Uuid
  status             String   @db.VarChar(20)  // PENDING, SENT, DELIVERED, OPENED, CLICKED, BOUNCED, UNSUBSCRIBED
  sentAt             DateTime?
  deliveredAt        DateTime?
  openedAt           DateTime?
  clickedAt          DateTime?
  createdAt          DateTime @default(now())

  campaign           MarketingCampaign @relation(fields: [campaignId], references: [id])
  member             Member   @relation(fields: [memberId], references: [id])

  @@unique([campaignId, memberId])
  @@map("marketing_campaign_members")
}

model MarketingContentPiece {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String   @db.Uuid
  campaignId         String?  @db.Uuid
  type               String   @db.VarChar(20)  // EMAIL, SOCIAL_POST, LINE_MESSAGE, LANDING_PAGE
  status             String   @db.VarChar(20)  // DRAFT, PENDING_REVIEW, APPROVED, SCHEDULED, PUBLISHED, FAILED
  title              String   @db.VarChar(500)
  subject            String?  @db.VarChar(500) // Email subject line
  body               String                     // HTML for email, text for social
  previewText        String?  @db.VarChar(255)  // Email preview text
  metadata           Json     @default("{}")
  audienceSegmentId  String?  @db.Uuid
  scheduledAt        DateTime?
  publishedAt        DateTime?
  generatedBy        String   @db.VarChar(10)  // AI, STAFF
  approvedBy         String?  @db.Uuid
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  club               Club     @relation(fields: [clubId], references: [id])
  campaign           MarketingCampaign? @relation(fields: [campaignId], references: [id])

  @@map("marketing_content_pieces")
}

model MarketingChannelConfig {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String   @db.Uuid
  type               String   @db.VarChar(20)  // EMAIL, FACEBOOK, INSTAGRAM, LINE, LANDING_PAGE
  status             String   @db.VarChar(20)  // NOT_CONNECTED, CONNECTED, ERROR, SUSPENDED
  credentials        Json     @default("{}")    // Encrypted API keys/tokens
  settings           Json     @default("{}")
  dailySendLimit     Int?
  connectedAt        DateTime?
  lastSyncAt         DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  club               Club     @relation(fields: [clubId], references: [id])

  @@unique([clubId, type])
  @@map("marketing_channel_configs")
}

model MarketingBrandConfig {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String   @unique @db.Uuid
  tone               String   @default("professional") @db.VarChar(50)
  language           String   @default("en") @db.VarChar(10)
  guidelines         String?
  sampleContent      Json     @default("[]")   // String[]
  fromName           String?  @db.VarChar(100)
  fromEmail          String?  @db.VarChar(255)
  replyToEmail       String?  @db.VarChar(255)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  club               Club     @relation(fields: [clubId], references: [id])

  @@map("marketing_brand_configs")
}

model MarketingCampaignAnalytics {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  campaignId         String   @db.Uuid
  period             String   @db.VarChar(20)  // DAILY, WEEKLY, MONTHLY
  date               DateTime @db.Date
  sent               Int      @default(0)
  delivered          Int      @default(0)
  opened             Int      @default(0)
  clicked            Int      @default(0)
  bounced            Int      @default(0)
  unsubscribed       Int      @default(0)
  bookingsMade       Int      @default(0)
  revenueAttributed  Decimal  @default(0) @db.Decimal(12, 2)
  createdAt          DateTime @default(now())

  campaign           MarketingCampaign @relation(fields: [campaignId], references: [id])

  @@unique([campaignId, period, date])
  @@map("marketing_campaign_analytics")
}

model MarketingEvent {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String   @db.Uuid
  campaignId         String?  @db.Uuid
  memberId           String?  @db.Uuid
  eventType          String   @db.VarChar(30)  // SENT, DELIVERED, OPENED, CLICKED, BOUNCED, UNSUBSCRIBED, COMPLAINED
  channel            String   @db.VarChar(20)
  metadata           Json     @default("{}")    // link clicked, device, etc.
  createdAt          DateTime @default(now())

  @@index([clubId, campaignId])
  @@index([memberId])
  @@map("marketing_events")
}
```

**Also add relations to the `Club` model:**
```prisma
  marketingSegments      MarketingAudienceSegment[]
  marketingCampaigns     MarketingCampaign[]
  marketingContent       MarketingContentPiece[]
  marketingChannels      MarketingChannelConfig[]
  marketingBrandConfig   MarketingBrandConfig?
```

**And to the `Member` model:**
```prisma
  marketingCampaignMembers MarketingCampaignMember[]
```

### Task 3: Run migration

```bash
cd database && npx prisma migrate dev --name add_marketing_models
```

Then generate the client:
```bash
npx prisma generate
```

---

## Batch 2: API Module — Skeleton + Audiences

### Task 4: Create NestJS marketing module skeleton

Create the module structure following the billing module pattern:

**Files to create:**

| File | Purpose |
|------|---------|
| `apps/api/src/modules/marketing/marketing.module.ts` | Module definition |
| `apps/api/src/modules/marketing/marketing.service.ts` | Campaign CRUD |
| `apps/api/src/modules/marketing/audience.service.ts` | Segment builder |
| `apps/api/src/graphql/marketing/marketing.resolver.ts` | GraphQL resolver |
| `apps/api/src/graphql/marketing/marketing.types.ts` | GraphQL ObjectTypes |
| `apps/api/src/graphql/marketing/marketing.input.ts` | GraphQL InputTypes with class-validator |

**Module pattern** (follow `billing.module.ts`):
```typescript
@Module({
  controllers: [],
  providers: [MarketingService, AudienceService],
  exports: [MarketingService, AudienceService],
})
export class MarketingModule {}
```

Register in `apps/api/src/app.module.ts` imports array.

### Task 5: Implement audience service

**File:** `apps/api/src/modules/marketing/audience.service.ts`

Core methods:
- `createSegment(clubId, dto)` — Create custom segment with rules
- `getSegments(clubId, filters)` — List segments with member counts
- `getSegment(clubId, segmentId)` — Get segment detail + preview members
- `updateSegment(clubId, segmentId, dto)` — Update rules/name
- `deleteSegment(clubId, segmentId)` — Soft delete (archive)
- `refreshSegmentCount(clubId, segmentId)` — Re-run rules, update memberCount
- `getSegmentMembers(clubId, segmentId, pagination)` — Execute rules, return matching members
- `translateNaturalLanguage(clubId, query)` — Claude API: NL text → SegmentRule[] (see Task 6)

**Rule execution:** Rules are stored as JSON `SegmentRule[]`. Each rule specifies `{ field, operator, value, source }`. The service builds a Prisma `where` clause from the rules. Example:

```typescript
// Rule: { field: "status", operator: "EQUALS", value: "ACTIVE", source: "MEMBERS" }
// → Prisma: { status: "ACTIVE" }
// Rule: { field: "bookingCount30d", operator: "GREATER_THAN", value: 3, source: "BOOKINGS" }
// → Prisma raw query counting bookings in last 30 days
```

Supported fields (Phase 1):
- **MEMBERS source:** status, membershipType, joinDate, renewalDate, tags, gender, age
- **BOOKINGS source:** bookingCount (period), lastBookingDate, facilityType
- **BILLING source:** outstandingBalance, totalSpend (period), invoiceStatus
- **GOLF source:** roundsPlayed (period), handicap, lastRoundDate

### Task 6: Implement NL→segment translation (Claude API)

**File:** `apps/api/src/modules/marketing/audience.service.ts` (method within AudienceService)

The `translateNaturalLanguage()` method calls Claude API with:
- System prompt describing available fields, operators, data model
- User's natural language query
- Returns structured `SegmentRule[]`

```typescript
import Anthropic from '@anthropic-ai/sdk';

async translateNaturalLanguage(clubId: string, query: string): Promise<{
  rules: SegmentRule[];
  explanation: string;
  estimatedCount: number;
}> {
  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `You are a segment rule translator for a club management system...`,
    messages: [{ role: 'user', content: query }],
  });
  // Parse structured response → SegmentRule[]
}
```

Use `claude-haiku-4-5-20251001` for speed/cost (same as Aura Concierge). Return the rules + a human-readable explanation + estimated member count.

### Task 7: Add audience GraphQL types + resolver

**File:** `apps/api/src/graphql/marketing/marketing.types.ts`

```typescript
@ObjectType()
export class AudienceSegmentType {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field() type: string;
  @Field(() => GraphQLJSON) rules: any;
  @Field({ nullable: true }) naturalLanguageQuery?: string;
  @Field(() => Int) memberCount: number;
  @Field() isArchived: boolean;
  @Field({ nullable: true }) refreshedAt?: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@ObjectType()
export class SegmentTranslationResult {
  @Field(() => GraphQLJSON) rules: any;
  @Field() explanation: string;
  @Field(() => Int) estimatedCount: number;
}
```

**File:** `apps/api/src/graphql/marketing/marketing.input.ts`

```typescript
@InputType()
export class CreateSegmentInput {
  @Field() @IsString() name: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field() @IsString() @IsEnum(['SMART', 'CUSTOM', 'MANUAL']) type: string;
  @Field(() => GraphQLJSON) rules: any;
  @Field({ nullable: true }) @IsOptional() @IsString() naturalLanguageQuery?: string;
}

@InputType()
export class UpdateSegmentInput {
  @Field(() => ID) @IsUUID() id: string;
  @Field({ nullable: true }) @IsOptional() @IsString() name?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field(() => GraphQLJSON, { nullable: true }) @IsOptional() rules?: any;
}
```

**File:** `apps/api/src/graphql/marketing/marketing.resolver.ts`

Queries:
- `audiences(filter)` → `[AudienceSegmentType]`
- `audience(id)` → `AudienceSegmentType`
- `translateSegment(query: String!)` → `SegmentTranslationResult`

Mutations:
- `createAudience(input)` → `AudienceSegmentType`
- `updateAudience(input)` → `AudienceSegmentType`
- `deleteAudience(id)` → `Boolean`
- `refreshAudienceCount(id)` → `AudienceSegmentType`

All guarded with `@UseGuards(GqlAuthGuard)`, multi-tenant via `user.tenantId`.

---

## Batch 3: API — Content Generation + Email Channel

### Task 8: Implement content generation service

**File:** `apps/api/src/modules/marketing/content-generation.service.ts` (CREATE)

Core methods:
- `generateEmailContent(clubId, { audienceDescription, campaignGoal, tone })` — Returns subject, body (HTML), previewText
- `generateVariant(clubId, contentId)` — A/B variant of existing content
- `improveContent(clubId, contentId, feedback)` — Refine based on staff feedback

Uses Claude API with brand voice config from `MarketingBrandConfig`:

```typescript
async generateEmailContent(clubId: string, input: GenerateContentInput) {
  const brandConfig = await this.prisma.marketingBrandConfig.findUnique({
    where: { clubId },
  });
  const club = await this.prisma.club.findUnique({ where: { id: clubId } });

  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: `You are a marketing copywriter for ${club.name}...
      Tone: ${brandConfig?.tone || 'professional'}
      Language: ${brandConfig?.language || 'en'}
      Guidelines: ${brandConfig?.guidelines || 'none'}`,
    messages: [{ role: 'user', content: `Generate an email for: ${input.campaignGoal}...` }],
  });
  // Parse response → { subject, body, previewText }
}
```

### Task 9: Implement email channel service (Resend)

**File:** `apps/api/src/modules/marketing/channel-email.service.ts` (CREATE)

Install Resend: `pnpm --filter @clubvantage/api add resend`

Core methods:
- `sendEmail(clubId, { to, subject, html, from, replyTo })` — Single email via Resend
- `sendBatch(clubId, emails[])` — Batch send (Resend supports up to 100/batch)
- `handleWebhook(payload)` — Process Resend webhooks (delivered, opened, clicked, bounced, complained)
- `getChannelConfig(clubId)` — Get email channel config (API key, domain, limits)
- `verifyDomain(clubId, domain)` — Initiate domain verification

```typescript
import { Resend } from 'resend';

@Injectable()
export class ChannelEmailService {
  private readonly logger = new Logger(ChannelEmailService.name);

  constructor(
    private prisma: PrismaService,
    private eventStore: EventStoreService,
  ) {}

  private async getResendClient(clubId: string): Promise<Resend> {
    const config = await this.prisma.marketingChannelConfig.findUnique({
      where: { clubId_type: { clubId, type: 'EMAIL' } },
    });
    return new Resend(config?.credentials?.apiKey || process.env.RESEND_API_KEY);
  }
}
```

### Task 10: Implement campaign service

**File:** `apps/api/src/modules/marketing/marketing.service.ts`

Core methods:
- `createCampaign(clubId, dto, userId)` — Create draft campaign
- `getCampaigns(clubId, filters, pagination)` — List campaigns
- `getCampaign(clubId, campaignId)` — Get campaign with content + metrics
- `updateCampaign(clubId, campaignId, dto)` — Update campaign
- `deleteCampaign(clubId, campaignId)` — Delete draft campaign
- `sendCampaign(clubId, campaignId, userId)` — Execute one-shot send:
  1. Resolve audience segments → member list
  2. Filter out unsubscribed (`MemberCommunicationPrefs.emailPromotions = false`)
  3. Get content piece for EMAIL channel
  4. Personalize content per member (merge tags: `{{firstName}}`, `{{membershipType}}`)
  5. Batch send via `ChannelEmailService`
  6. Create `MarketingCampaignMember` records with status SENT
  7. Update campaign status to ACTIVE
- `getCampaignMetrics(clubId, campaignId)` — Aggregate from events

### Task 11: Add campaign + content GraphQL types, inputs, and resolver queries/mutations

**File:** `apps/api/src/graphql/marketing/marketing.types.ts` (MODIFY — add to existing)

Types: `CampaignType`, `ContentPieceType`, `CampaignMetricsType`, `ChannelConfigType`, `BrandConfigType`

**File:** `apps/api/src/graphql/marketing/marketing.input.ts` (MODIFY — add to existing)

Inputs: `CreateCampaignInput`, `UpdateCampaignInput`, `CampaignFilterInput`, `GenerateContentInput`, `UpdateBrandConfigInput`, `UpdateChannelConfigInput`

Every field MUST have class-validator decorators (`@IsOptional()`, `@IsString()`, `@IsUUID()`, `@IsEnum()`, etc.).

**File:** `apps/api/src/graphql/marketing/marketing.resolver.ts` (MODIFY — add to existing)

Add queries:
- `campaigns(filter)` → `[CampaignType]`
- `campaign(id)` → `CampaignType`
- `generateContent(input)` → `ContentPieceType`
- `channelConfig(type)` → `ChannelConfigType`
- `brandConfig` → `BrandConfigType`
- `marketingStats` → `MarketingStatsType` (total campaigns, active, total audience)

Add mutations:
- `createCampaign(input)` → `CampaignType`
- `updateCampaign(input)` → `CampaignType`
- `deleteCampaign(id)` → `Boolean`
- `sendCampaign(id)` → `CampaignType`
- `createContent(input)` → `ContentPieceType`
- `updateContent(input)` → `ContentPieceType`
- `updateBrandConfig(input)` → `BrandConfigType`
- `updateChannelConfig(input)` → `ChannelConfigType`

### Task 12: Add Resend webhook endpoint

**File:** `apps/api/src/modules/marketing/marketing.controller.ts` (CREATE)

REST controller (not GraphQL) for Resend webhook callbacks:

```typescript
@Controller('webhooks/marketing')
export class MarketingController {
  @Post('email')
  async handleEmailWebhook(@Body() payload: any) {
    // Verify webhook signature
    // Map event type → MarketingEvent record
    // Update MarketingCampaignMember status
    // Update MarketingCampaignAnalytics aggregates
  }
}
```

### Task 13: Regenerate schema + codegen

```bash
cd apps/api && pnpm dev  # Start briefly to regenerate schema.gql, then Ctrl+C
pnpm --filter @clubvantage/api-client run codegen
```

---

## Batch 4: Frontend — Module Skeleton + Audiences

### Task 14: Add Marketing section to sidebar

**File:** `apps/application/src/components/layout/sidebar.tsx` (MODIFY)

Add to `navigation` array (after POS, before Reports):

```typescript
{
  label: 'Marketing',
  icon: Megaphone,  // from lucide-react
  href: '/marketing',
  children: [
    { label: 'Campaigns', icon: Send, href: '/marketing/campaigns' },
    { label: 'Audiences', icon: UsersRound, href: '/marketing/audiences' },
    { label: 'Content', icon: FileEdit, href: '/marketing/content' },
    { label: 'Analytics', icon: BarChart3, href: '/marketing/analytics' },
    { label: 'Settings', icon: Settings, href: '/marketing/settings' },
  ],
},
```

### Task 15: Create marketing GraphQL operations

**File:** `packages/api-client/src/operations/marketing.graphql` (CREATE)

```graphql
# Audience queries
query GetAudiences($filter: AudienceFilterInput) {
  audiences(filter: $filter) { id name description type memberCount isArchived refreshedAt createdAt }
}

query GetAudience($id: ID!) {
  audience(id: $id) { id name description type rules naturalLanguageQuery memberCount isArchived refreshedAt }
}

query TranslateSegment($query: String!) {
  translateSegment(query: $query) { rules explanation estimatedCount }
}

# Campaign queries
query GetCampaigns($filter: CampaignFilterInput) {
  campaigns(filter: $filter) { id name type status channels scheduledAt sentAt createdAt }
}

query GetCampaign($id: ID!) {
  campaign(id: $id) {
    id name type status channels scheduledAt sentAt completedAt
    segments { id name memberCount }
    contentPieces { id type status title subject body previewText generatedBy }
    metrics { sent delivered opened clicked bounced unsubscribed }
  }
}

query GetMarketingStats {
  marketingStats { totalCampaigns activeCampaigns totalAudienceSize totalEmailsSent }
}

query GetBrandConfig {
  brandConfig { id tone language guidelines sampleContent fromName fromEmail replyToEmail }
}

query GetChannelConfig($type: String!) {
  channelConfig(type: $type) { id type status settings dailySendLimit connectedAt }
}

# Audience mutations
mutation CreateAudience($input: CreateSegmentInput!) {
  createAudience(input: $input) { id name type memberCount }
}

mutation UpdateAudience($input: UpdateSegmentInput!) {
  updateAudience(input: $input) { id name type memberCount }
}

mutation DeleteAudience($id: ID!) {
  deleteAudience(id: $id)
}

mutation RefreshAudienceCount($id: ID!) {
  refreshAudienceCount(id: $id) { id memberCount refreshedAt }
}

# Campaign mutations
mutation CreateCampaign($input: CreateCampaignInput!) {
  createCampaign(input: $input) { id name type status }
}

mutation UpdateCampaign($input: UpdateCampaignInput!) {
  updateCampaign(input: $input) { id name type status }
}

mutation DeleteCampaign($id: ID!) {
  deleteCampaign(id: $id)
}

mutation SendCampaign($id: ID!) {
  sendCampaign(id: $id) { id status sentAt }
}

# Content mutations
mutation GenerateContent($input: GenerateContentInput!) {
  generateContent(input: $input) { id type title subject body previewText generatedBy }
}

mutation UpdateContent($input: UpdateContentInput!) {
  updateContent(input: $input) { id status title subject body }
}

# Settings mutations
mutation UpdateBrandConfig($input: UpdateBrandConfigInput!) {
  updateBrandConfig(input: $input) { id tone language guidelines fromName fromEmail }
}

mutation UpdateChannelConfig($input: UpdateChannelConfigInput!) {
  updateChannelConfig(input: $input) { id type status }
}
```

Run codegen after creating this file.

### Task 16: Create marketing server actions

**File:** `apps/application/src/app/(dashboard)/marketing/actions.ts` (CREATE)

Follow `bookings/actions.ts` pattern with `'use server'` directive. Inline GraphQL documents for each mutation. Use `serverGqlRequest` + `requireAuth`.

Actions:
- `createAudience(input)`, `updateAudience(input)`, `deleteAudience(id)`, `refreshAudienceCount(id)`
- `createCampaign(input)`, `updateCampaign(input)`, `deleteCampaign(id)`, `sendCampaign(id)`
- `generateContent(input)`, `updateContent(input)`
- `updateBrandConfig(input)`, `updateChannelConfig(input)`

### Task 17: Create marketing layout

**File:** `apps/application/src/app/(dashboard)/marketing/layout.tsx` (CREATE)

Simple layout wrapper (like other sections). Can use tabs or just pass children through.

### Task 18: Create marketing dashboard page

**File:** `apps/application/src/app/(dashboard)/marketing/page.tsx` (CREATE)

Marketing overview page with:
- KPI cards: Total Audiences, Active Campaigns, Emails Sent, Avg Open Rate
- Recent campaigns list
- Quick actions: "Create Campaign", "Build Audience"

Uses `useGetMarketingStatsQuery()` and `useGetCampaignsQuery({ filter: { limit: 5 } })`.

### Task 19: Create audiences page

**File:** `apps/application/src/app/(dashboard)/marketing/audiences/page.tsx` (CREATE)

Features:
- List of audience segments (table or cards)
- Search + filter by type (SMART/CUSTOM/MANUAL)
- "Create Audience" button → opens modal
- NL input: text field where staff types natural language → calls `translateSegment` → shows preview rules + estimated count → staff confirms to create
- Per-segment: name, member count, last refreshed, type badge, actions (edit, refresh, delete)

### Task 20: Create audience modal component

**File:** `apps/application/src/components/marketing/audience-modal.tsx` (CREATE)

Two modes:
1. **Manual mode:** Form with rule builder (field dropdown + operator + value)
2. **AI mode:** Natural language text input → calls translate → shows generated rules + explanation + count → "Create Segment" button

Fields available in dropdowns (Phase 1): member status, membership type, join date, renewal date, tags, booking count, last booking, outstanding balance, total spend, rounds played.

---

## Batch 5: Frontend — Campaign Builder + Email

### Task 21: Create campaigns page

**File:** `apps/application/src/app/(dashboard)/marketing/campaigns/page.tsx` (CREATE)

Features:
- Campaign list (table): name, type, status, channels, send date, metrics summary
- Status filters: All, Draft, Active, Completed, Archived
- "Create Campaign" button → navigates to `/marketing/campaigns/new`
- Row click → navigates to `/marketing/campaigns/[id]`

### Task 22: Create campaign wizard (new campaign)

**File:** `apps/application/src/app/(dashboard)/marketing/campaigns/new/page.tsx` (CREATE)

Step-by-step wizard:

**Step 1 — Setup:** Campaign name, type (ONE_SHOT only for Phase 1), channel (EMAIL only for Phase 1)

**Step 2 — Audience:** Select audience segment(s) from existing segments. Show estimated total reach. Option to create new segment inline.

**Step 3 — Content:**
- "Generate with AI" button → calls `generateContent` mutation → shows generated email (subject + body + preview text)
- Manual edit: Rich text editor for body, text inputs for subject + preview text
- "Generate Variant" button for A/B testing
- Live preview panel (desktop + mobile toggle)

**Step 4 — Review & Send:**
- Summary: campaign name, audience count, email preview
- "Send Now" or "Schedule" (date picker)
- "Send Test Email" → sends to current user's email
- "Send Campaign" button → calls `sendCampaign` mutation

### Task 23: Create campaign detail page

**File:** `apps/application/src/app/(dashboard)/marketing/campaigns/[id]/page.tsx` (CREATE)

Shows campaign status + metrics:
- Status badge (DRAFT/ACTIVE/COMPLETED)
- Delivery metrics: Sent, Delivered, Opened, Clicked, Bounced, Unsubscribed (with percentages)
- Bar chart or funnel visualization
- Email preview
- Audience segment links
- Action buttons based on status: Edit (DRAFT), Pause (ACTIVE), Archive (COMPLETED)

---

## Batch 6: Frontend — Analytics + Settings

### Task 24: Create analytics page

**File:** `apps/application/src/app/(dashboard)/marketing/analytics/page.tsx` (CREATE)

Overview dashboard:
- KPI cards: Total Sent, Avg Open Rate, Avg Click Rate, Unsubscribe Rate
- Campaign performance table: campaign name, sent, opened %, clicked %, status
- Trend chart (if possible with Recharts — already in deps): emails sent over time
- Top performing campaigns list

### Task 25: Create settings page

**File:** `apps/application/src/app/(dashboard)/marketing/settings/page.tsx` (CREATE)

Two tabs:

**Brand Voice tab:**
- Form fields: Tone (dropdown: professional, casual, luxury, friendly), Language (en/th), Guidelines (textarea), Sample content (textarea list)
- From Name, From Email, Reply-To Email
- "Save" button → calls `updateBrandConfig` mutation

**Email Channel tab:**
- Connection status badge
- Resend API key input (masked)
- Sending domain + verification status
- Daily send limit
- "Connect" / "Disconnect" buttons → calls `updateChannelConfig` mutation

### Task 26: Create content page (optional/stretch)

**File:** `apps/application/src/app/(dashboard)/marketing/content/page.tsx` (CREATE)

Content library showing all generated content pieces:
- Filterable by type (EMAIL), status (DRAFT/APPROVED/PUBLISHED)
- Each card: title, subject, generated by (AI/Staff), created date, status badge
- Click → opens preview modal

---

## Files Summary

| File | Action |
|------|--------|
| `packages/types/src/entities/marketing.ts` | CREATE — Marketing enums |
| `packages/types/src/entities/index.ts` | MODIFY — Add marketing export |
| `database/prisma/schema.prisma` | MODIFY — Add 8 marketing models + relations |
| `apps/api/src/modules/marketing/marketing.module.ts` | CREATE — NestJS module |
| `apps/api/src/modules/marketing/marketing.service.ts` | CREATE — Campaign CRUD + send |
| `apps/api/src/modules/marketing/audience.service.ts` | CREATE — Segments + NL translation |
| `apps/api/src/modules/marketing/content-generation.service.ts` | CREATE — Claude content gen |
| `apps/api/src/modules/marketing/channel-email.service.ts` | CREATE — Resend integration |
| `apps/api/src/modules/marketing/marketing.controller.ts` | CREATE — Webhook endpoint |
| `apps/api/src/graphql/marketing/marketing.resolver.ts` | CREATE — GraphQL resolver |
| `apps/api/src/graphql/marketing/marketing.types.ts` | CREATE — GraphQL types |
| `apps/api/src/graphql/marketing/marketing.input.ts` | CREATE — GraphQL inputs |
| `apps/api/src/app.module.ts` | MODIFY — Register MarketingModule |
| `packages/api-client/src/operations/marketing.graphql` | CREATE — GraphQL operations |
| `apps/application/src/components/layout/sidebar.tsx` | MODIFY — Add Marketing nav |
| `apps/application/src/app/(dashboard)/marketing/actions.ts` | CREATE — Server actions |
| `apps/application/src/app/(dashboard)/marketing/layout.tsx` | CREATE — Layout |
| `apps/application/src/app/(dashboard)/marketing/page.tsx` | CREATE — Dashboard |
| `apps/application/src/app/(dashboard)/marketing/audiences/page.tsx` | CREATE — Audiences |
| `apps/application/src/app/(dashboard)/marketing/campaigns/page.tsx` | CREATE — Campaign list |
| `apps/application/src/app/(dashboard)/marketing/campaigns/new/page.tsx` | CREATE — Campaign wizard |
| `apps/application/src/app/(dashboard)/marketing/campaigns/[id]/page.tsx` | CREATE — Campaign detail |
| `apps/application/src/app/(dashboard)/marketing/analytics/page.tsx` | CREATE — Analytics |
| `apps/application/src/app/(dashboard)/marketing/settings/page.tsx` | CREATE — Settings |
| `apps/application/src/app/(dashboard)/marketing/content/page.tsx` | CREATE — Content library |
| `apps/application/src/components/marketing/audience-modal.tsx` | CREATE — Audience builder |

---

## Verification

1. **Database:** Run migration, verify tables exist via `npx prisma studio`
2. **API:** Start API (`cd apps/api && pnpm dev`), test queries in GraphQL playground:
   - Create audience segment
   - Translate NL query to rules
   - Create campaign with content
3. **Codegen:** Run `pnpm --filter @clubvantage/api-client run codegen`, verify generated hooks
4. **Frontend:** Start app (`cd apps/application && pnpm dev`):
   - Marketing section appears in sidebar
   - Navigate to `/marketing` → dashboard loads
   - `/marketing/audiences` → create segment via NL input
   - `/marketing/campaigns/new` → wizard flow → generate AI content → preview → send
   - `/marketing/analytics` → metrics display
   - `/marketing/settings` → brand voice + email config
5. **Email:** Configure Resend test API key, send test campaign, verify delivery + webhook metrics
6. **TypeScript:** `cd apps/api && pnpm exec tsc --noEmit --project tsconfig.json` → 0 errors
