# Plan: Backend Features for Waitlist & Feature Voting

## Overview
Add backend specifications for waitlist management and feature voting to support the marketing site functionality. Update the Platform Manager spec to include these capabilities.

## Files to Modify

### 1. Platform Manager Spec
**File:** `/Users/peak/development/vantage/docs/product/sections/platform/spec.md`

Add new sections for:

#### Waitlist Management (ClubVantage Team)
- View waitlist entries with search, filters (status, club type, region, date)
- Review and process waitlist applications
- Approve/reject with notes
- Convert approved entries to tenant provisioning
- View waitlist analytics (conversion rates, sources, interest areas)
- Export waitlist data
- Send bulk communications to waitlist

#### Feature Voting Management (ClubVantage Team)
- Manage roadmap features (create, edit, archive)
- View voting analytics and feature rankings
- Review and moderate feature suggestions
- Update feature status (considering → planned → in-progress → completed)
- Respond to feature comments
- Export voting data for analysis

### 2. Data Models to Add

#### WaitlistEntry
```
- id, created_at, updated_at
- first_name, last_name, email (unique)
- club_name, club_type, member_count
- interests (array), biggest_challenge, how_heard
- status (pending/approved/rejected/converted)
- position (calculated queue position)
- notes (internal), processed_by, processed_at
- converted_tenant_id (nullable, links to tenant after conversion)
```

#### RoadmapFeature
```
- id, created_at, updated_at
- title, description, category
- status (considering/planned/in-progress/completed)
- eta (nullable), is_mvp (boolean)
- vote_count, comment_count
- created_by, last_updated_by
- archived (boolean)
```

#### FeatureVote
```
- id, feature_id, user_email
- created_at
- UNIQUE(feature_id, user_email)
```

#### FeatureComment
```
- id, feature_id, user_email, user_name
- content, created_at
- is_official (boolean, for ClubVantage responses)
- parent_id (nullable, for replies)
```

#### FeatureSuggestion
```
- id, created_at
- title, description, category
- submitted_by_email, submitted_by_name
- status (pending/approved/rejected/merged)
- merged_feature_id (nullable)
- reviewed_by, reviewed_at, review_notes
```

### 3. API Endpoints

#### Public (Marketing Site)
```
POST /api/waitlist - Submit waitlist application
GET  /api/waitlist/position/:email - Get position in queue
GET  /api/features - List roadmap features (public)
POST /api/features/:id/vote - Vote for a feature (requires email)
DELETE /api/features/:id/vote - Remove vote
GET  /api/features/:id/comments - Get feature comments
POST /api/features/:id/comments - Add comment
POST /api/features/suggest - Submit feature suggestion
```

#### Platform Manager (Authenticated)
```
GET    /api/admin/waitlist - List all entries with filters
GET    /api/admin/waitlist/:id - Get entry details
PATCH  /api/admin/waitlist/:id - Update status/notes
POST   /api/admin/waitlist/:id/convert - Convert to tenant
GET    /api/admin/waitlist/analytics - Waitlist metrics
POST   /api/admin/waitlist/export - Export to CSV

GET    /api/admin/features - List all features
POST   /api/admin/features - Create feature
PATCH  /api/admin/features/:id - Update feature
DELETE /api/admin/features/:id - Archive feature
GET    /api/admin/features/analytics - Voting metrics

GET    /api/admin/suggestions - List feature suggestions
PATCH  /api/admin/suggestions/:id - Review suggestion
POST   /api/admin/suggestions/:id/merge - Merge into feature
```

### 4. UI Components for Platform Manager

#### Waitlist Dashboard
- KPI cards: Total Applications, Pending Review, Conversion Rate, Avg Position Wait Time
- Waitlist table with status badges and quick actions
- Detail panel with full application and conversion workflow

#### Feature Voting Dashboard
- Feature ranking by votes
- Suggestion review queue
- Analytics: Most requested categories, vote trends

## Implementation Steps

1. Update `/docs/product/sections/platform/spec.md` with:
   - New "Waitlist Management" user flow section
   - New "Feature Voting Management" user flow section
   - New UI requirements for waitlist and feature dashboards
   - New data models section
   - Integration points with Marketing Site (PRD-04)

## Verification
- Review the updated spec for completeness
- Ensure data models match frontend form fields
- Verify API endpoints cover all CRUD operations
