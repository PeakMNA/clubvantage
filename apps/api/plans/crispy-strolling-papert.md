# Plan: Update Platform Manager PRD with Interview Decisions

## Objective
Update `/Users/peak/development/vantage/prds/ClubVantage PRD_ Section 3 - Platform Manager.md` with all implementation decisions gathered during the interview session.

## Decisions to Document

### 1. Multi-tenancy Architecture
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database Isolation | RLS-only for MVP | Start simple with Row-Level Security; defer dedicated DB for Enterprise tier to post-MVP |
| App Structure | Single app, subdomain routing | `internal.clubvantage.io` for platform team, `admin.{tenant}.clubvantage.io` for tenant admins |
| Provisioning Speed | Fast (<30 sec) | Synchronous where possible to provide immediate feedback |
| Data Residency | Single region for MVP | All data in one region initially |

### 2. Authentication & Authorization
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth Flow | Unified auth system | Tenant admins use same staff credentials - no separate account creation |
| IP Security | Strict allowlist | Platform Manager only accessible from office IPs |

### 3. Billing & Payments
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Payment Processor | Stripe payments only | Stripe handles payment processing; subscription logic managed in-house |
| Limit Enforcement | Allow overage, bill extra | Usage-based pricing model instead of hard limits |
| Multi-Currency | Local currency billing | Support THB, SGD, MYR for respective regions |

### 4. AI Features (Aura)
| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI in MVP | Include churn prediction | Aura AI features ship from day one |
| CSM Tools | Aura-driven workflows | AI suggests actions, CSMs execute |

### 5. Feature Flags
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | DB-stored JSONB | Simple approach using existing database infrastructure |

### 6. UI/UX Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Impersonation UX | Full redirect | Support leaves Platform Manager entirely, sees target app as user |
| Branding Preview | Staged draft/publish | Save to draft, preview via staging URL, then publish |
| Tenant Filters | Comprehensive | Status + Tier + Region + Health + Activity filters |

### 7. Health Score Configuration
| Component | Weight |
|-----------|--------|
| Engagement | 30% |
| Feature Adoption | 25% |
| Payment Status | 25% |
| Support Tickets | 20% |

### 8. Operational Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Provisioning Failure | Full rollback | Delete everything on failure, user can retry |
| Sample Data | Template-based | Offer Golf Club, Sports Club, Social Club templates |
| Suspension | Grace period with warnings | Progressive enforcement before lockout |
| Tenant Audit Access | Limited | Tenants see staff actions only; hide sensitive/internal events |
| Notifications | Email + in-app | Dual-channel for tenant communications |

### 9. Features to Modify
| Feature ID | Current | Change |
|------------|---------|--------|
| TLC-008 | P2 - Tenant migration between regions | **REMOVE** - too complex, defer indefinitely |
| PLAN-005 | P1 - Custom enterprise plans | **DEFER** - move to post-MVP roadmap |

### 10. Features to Add (Roadmap)
| Feature | Priority | Description |
|---------|----------|-------------|
| White-label email domains | P2 | Custom email sending domains for enterprise tenants |
| Tenant data backup/restore | P2 | Self-service backup and point-in-time restore |
| A/B testing framework | P3 | Feature experimentation infrastructure |

### 11. Deferred for Post-MVP
- Third-party integrations (INT-001 to INT-006)

---

## Implementation Plan

### Step 1: Add Implementation Decisions Section
Insert a new section **"11. Implementation Decisions"** after Section 10 (Security & Compliance) with all the documented decisions in a clean table format.

### Step 2: Update Feature Priority Tables
- Mark TLC-008 as "DEFERRED - Post-MVP" with strikethrough
- Mark PLAN-005 as "P2 (Deferred)"
- Mark INT-* features as "P3 (Post-MVP)"

### Step 3: Add Roadmap Section
Insert **"Appendix D: Product Roadmap"** listing future features:
- White-label email domains
- Tenant data backup/restore
- A/B testing framework
- Custom enterprise plans
- Region migration

### Step 4: Update Technical Architecture Section (5.2)
Add notes about:
- RLS-only approach for MVP
- Dedicated DB deferred for enterprise

### Step 5: Update Subscription Management Section (3.2)
Add notes about:
- Usage-based overage billing
- Local currency support

### Step 6: Update Health Monitoring Section (3.1.3)
Document the health score weight formula

### Step 7: Update Document Metadata
- Change Status from "Draft" to "Reviewed"
- Update "Last Updated" date

---

## Files to Modify
- `/Users/peak/development/vantage/prds/ClubVantage PRD_ Section 3 - Platform Manager.md`

## Verification
After updating, verify:
1. All 20+ interview decisions are documented
2. Feature priority changes are reflected
3. New roadmap section exists
4. Document status updated
