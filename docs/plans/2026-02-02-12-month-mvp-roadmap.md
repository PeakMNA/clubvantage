# ClubVantage 12-Month MVP Roadmap

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a production-ready club management system over 12 months with phased feature releases.

**Architecture:** Monorepo with Next.js frontend, NestJS GraphQL API, Prisma ORM, PostgreSQL. Feature modules are independent but share core services (auth, billing, member accounts).

**Tech Stack:** TypeScript, Next.js 14, NestJS, GraphQL, Prisma, PostgreSQL, Stripe, TailwindCSS, Radix UI

---

## Current Implementation Status

### Fully Implemented (60-70%)
| Module | Status | Components |
|--------|--------|------------|
| **Members** | ✅ Complete | Directory, detail view, CRUD, dependents, applications |
| **Golf Tee Sheet** | ✅ Complete | Grid/week/month views, booking modal, player management |
| **Golf Check-in** | ✅ Complete | Shopping cart, payment, ticket generation |
| **Basic Billing** | ✅ Partial | Invoice viewing, receipt creation (forms stubbed) |
| **Facility Booking** | ✅ Partial | 43+ components, calendar views, booking wizard (backend incomplete) |
| **Settings** | ✅ Partial | UI layout complete, handlers incomplete |
| **Reports** | ✅ Partial | Tab shells exist, data queries not implemented |

### Not Implemented
- Lead/Prospect Management
- Content Management System
- Newsletter/Marketing Automation
- Social Media Integration
- Spa Booking Module (appointment-style)
- Sports/Courts Booking (court-specific rules)
- F&B Operations (Tables, KDS)
- Notification Center
- Inventory Management

---

## 12-Month Roadmap Overview

```
Q1 2026 (Month 1-3): MVP Foundation
├── Month 1: Core Billing & AR
├── Month 2: POS Completion & Discounts
└── Month 3: Auto-pay & Recurring Billing

Q2 2026 (Month 4-6): Facility Operations
├── Month 4: General Facility Booking (complete existing)
├── Month 5: Spa Booking Module
└── Month 6: Sports/Courts Module

Q3 2026 (Month 7-9): Reporting & Marketing
├── Month 7: Reports & Analytics
├── Month 8: Prospect & Lead Management
└── Month 9: Content Management System

Q4 2026 (Month 10-12): Advanced Features
├── Month 10: Email Marketing & Campaigns
├── Month 11: F&B Operations Phase 1
└── Month 12: Inventory, Social & Polish
```

---

## Month 1: Core Billing & AR Completion

**Goal:** Complete the billing foundation for all payment workflows.

### Week 1: Invoice Creation Flow
| Task | Priority | Complexity |
|------|----------|------------|
| Invoice creation modal with line items | Critical | Medium |
| Charge type selection with tax calculation | Critical | Medium |
| Invoice preview and confirmation | Critical | Low |
| Invoice email delivery | High | Low |

### Week 2: Payment Recording
| Task | Priority | Complexity |
|------|----------|------------|
| Manual payment entry form | Critical | Medium |
| Payment method selection | Critical | Low |
| Multi-invoice allocation UI | Critical | High |
| Payment receipt generation | Critical | Medium |

### Week 3: Credit Notes & Adjustments
| Task | Priority | Complexity |
|------|----------|------------|
| Credit note creation with reasons | High | Medium |
| Credit note approval workflow | High | Medium |
| Apply credit to invoices | High | Medium |
| Refund processing | Medium | Medium |

### Week 4: AR Aging & Collections Setup
| Task | Priority | Complexity |
|------|----------|------------|
| AR aging dashboard with bucket visualization | High | Medium |
| Collections workflow configuration | High | High |
| Late fee automation | High | Medium |
| Collection letter templates | Medium | Low |

**Deliverable:** Full invoice-to-payment lifecycle with AR management.

---

## Month 2: POS Completion & Discounts

**Goal:** Complete POS sales workflow with discount engine.

### Week 1: POS Sales Transaction Flow
| Task | Priority | Complexity |
|------|----------|------------|
| Complete POSProductPanel with quick keys | Critical | Medium |
| Variant picker modal | Critical | Medium |
| Modifier selection modal | Critical | Medium |
| Cart management with quantities | Critical | Low |

### Week 2: Payment & Checkout
| Task | Priority | Complexity |
|------|----------|------------|
| POS payment modal with method selection | Critical | High |
| Split payment support | High | High |
| Member account charging | Critical | Medium |
| Receipt generation and printing | High | Medium |

### Week 3: Discount Engine
| Task | Priority | Complexity |
|------|----------|------------|
| Line item discount application | High | Medium |
| Order-level discounts | High | Medium |
| Member tier auto-discount | High | Medium |
| Promo code validation | Medium | Medium |
| Discount approval workflow | Medium | High |

### Week 4: Cash Drawer & Settlement
| Task | Priority | Complexity |
|------|----------|------------|
| Cash drawer open/close with float | High | Medium |
| Shift summary and reconciliation | High | Medium |
| End-of-day settlement report | High | Medium |
| Daily settlement batch close | High | High |

**Deliverable:** Complete POS system with discounts and cash management.

---

## Month 3: Auto-pay & Recurring Billing

**Goal:** Automate billing with Stripe integration.

### Week 1: Stored Payment Methods
| Task | Priority | Complexity |
|------|----------|------------|
| Stripe payment method setup | Critical | High |
| Card on file management UI | Critical | Medium |
| Default payment method selection | High | Low |
| Card expiry notifications | High | Medium |

### Week 2: Auto-pay Configuration
| Task | Priority | Complexity |
|------|----------|------------|
| Member auto-pay enrollment | Critical | Medium |
| Auto-pay schedule configuration | Critical | Medium |
| Retry logic for failed payments | Critical | High |
| Auto-pay success/failure notifications | High | Medium |

### Week 3: Recurring Billing Engine
| Task | Priority | Complexity |
|------|----------|------------|
| Recurring charge scheduler | Critical | High |
| Monthly dues automation | Critical | Medium |
| Minimum spend calculation and billing | High | High |
| Proration for mid-cycle changes | Medium | High |

### Week 4: Member Credit Management
| Task | Priority | Complexity |
|------|----------|------------|
| Credit limit configuration by type/tier | High | Medium |
| Credit utilization alerts (80%+) | High | Low |
| Credit blocking at limit | High | Medium |
| Credit limit override workflow | Medium | Medium |

**Deliverable:** Fully automated recurring billing with Stripe.

---

## Month 4: General Facility Booking Completion

**Goal:** Complete the partially-implemented facility booking system for meeting rooms, event spaces, and general resources.

**Status:** 43+ booking components exist, calendar views implemented, backend partial.

### Week 1: Backend Completion
| Task | Priority | Complexity |
|------|----------|------------|
| Complete Facility GraphQL resolvers (CRUD) | Critical | Medium |
| Booking validation rules engine | Critical | High |
| Resource availability checking | Critical | Medium |
| Conflict detection and prevention | High | Medium |

### Week 2: Booking Wizard Polish
| Task | Priority | Complexity |
|------|----------|------------|
| Complete CreateBookingWizard flow | Critical | Medium |
| Resource selection with availability display | Critical | Medium |
| Time slot picker with conflict indicators | High | Medium |
| Booking confirmation and summary | High | Low |

### Week 3: Calendar & Management
| Task | Priority | Complexity |
|------|----------|------------|
| Day/Week/Month calendar views polish | High | Medium |
| Drag-to-reschedule functionality | Medium | High |
| Booking detail panel with actions | High | Low |
| Bulk booking operations | Medium | Medium |

### Week 4: Rules & Notifications
| Task | Priority | Complexity |
|------|----------|------------|
| Advance booking limits by resource type | High | Medium |
| Booking duration constraints | High | Low |
| Confirmation emails on booking | High | Medium |
| Reminder notifications (24hr, 1hr) | High | Medium |

**Deliverable:** Complete facility booking system for all resource types.

---

## Month 5: Spa Booking Module

**Goal:** Complete appointment-style booking for spa services (extends facility booking with therapist assignment).

### Week 1: Spa Services & Staff
| Task | Priority | Complexity |
|------|----------|------------|
| Service catalog with duration and pricing | Critical | Medium |
| Staff profile and availability | Critical | Medium |
| Staff capability/certification tracking | High | Low |
| Treatment room management | High | Medium |

### Week 2: Appointment Booking
| Task | Priority | Complexity |
|------|----------|------------|
| Visual calendar with availability | Critical | High |
| Booking wizard (service → staff → time) | Critical | High |
| Multi-service booking | High | Medium |
| Resource allocation (rooms, equipment) | High | High |

### Week 3: Spa Checkout & Packages
| Task | Priority | Complexity |
|------|----------|------------|
| Service checkout with retail add-ons | High | Medium |
| Spa package creation and sales | High | Medium |
| Package redemption tracking | High | High |
| Treatment history per member | Medium | Low |

### Week 4: Notifications & Waitlist
| Task | Priority | Complexity |
|------|----------|------------|
| Appointment confirmation emails | High | Medium |
| Reminder notifications (SMS/email) | High | Medium |
| Spa waitlist with offer management | Medium | High |
| Cancellation policy enforcement | Medium | Medium |

**Deliverable:** Full spa booking and checkout system.

---

## Month 6: Sports/Courts Booking

**Goal:** Court booking system for tennis, squash, pickleball (extends facility booking with court-specific rules).

### Week 1: Court Configuration
| Task | Priority | Complexity |
|------|----------|------------|
| Facility/court setup with types | Critical | Medium |
| Operating hours and slot configuration | Critical | Medium |
| Booking rules (advance limits, duration) | High | Medium |
| Member-only policies | High | Low |

### Week 2: Court Booking Calendar
| Task | Priority | Complexity |
|------|----------|------------|
| Visual grid by court and time | Critical | High |
| Online member self-service booking | Critical | High |
| Guest booking with fee tracking | High | Medium |
| Recurring booking (weekly slots) | Medium | High |

### Week 3: Classes & Equipment
| Task | Priority | Complexity |
|------|----------|------------|
| Group class scheduling | High | Medium |
| Class registration with capacity | High | Medium |
| Equipment rental tracking | High | Medium |
| Lesson packages with pro assignment | Medium | High |

### Week 4: Check-in & Lighting
| Task | Priority | Complexity |
|------|----------|------------|
| Court check-in workflow | High | Low |
| No-show tracking | High | Low |
| Lighting fee automation | Medium | Medium |
| Usage reporting | Medium | Low |

**Deliverable:** Complete sports/courts booking system.

---

## Month 7: Reports & Analytics

**Goal:** Comprehensive reporting dashboard.

### Week 1: Membership Reports
| Task | Priority | Complexity |
|------|----------|------------|
| Member census by type/status/tier | Critical | Medium |
| Membership sales and revenue | Critical | Medium |
| Attrition report with reasons | High | Medium |
| Retention rate tracking | High | Medium |

### Week 2: Financial Reports
| Task | Priority | Complexity |
|------|----------|------------|
| Dues revenue vs. expected | Critical | Medium |
| AR aging with trend analysis | Critical | Medium |
| Collections activity report | High | Medium |
| Payment method distribution | High | Low |

### Week 3: Operational Reports
| Task | Priority | Complexity |
|------|----------|------------|
| Golf utilization by course/time | High | Medium |
| Spa/sports booking utilization | High | Medium |
| POS sales by outlet/category | High | Medium |
| Staff performance metrics | Medium | Medium |

### Week 4: Dashboard & Export
| Task | Priority | Complexity |
|------|----------|------------|
| Executive KPI dashboard | High | Medium |
| Report scheduling and email delivery | Medium | High |
| Export to Excel/PDF | High | Medium |
| Custom date range filtering | High | Low |

**Deliverable:** Full reporting suite with dashboards.

---

## Month 8: Prospect & Lead Management

**Goal:** CRM for prospect tracking and nurturing.

### Week 1: Prospect Pipeline
| Task | Priority | Complexity |
|------|----------|------------|
| Prospect CRUD with pipeline stages | Critical | Medium |
| Lead source tracking | Critical | Low |
| Pipeline kanban view | Critical | Medium |
| Prospect activity log | High | Low |

### Week 2: Lead Scoring
| Task | Priority | Complexity |
|------|----------|------------|
| Scoring rule configuration | High | Medium |
| Auto-score calculation | High | Medium |
| Qualification thresholds (MQL/SQL) | High | Low |
| Score decay for inactivity | Medium | Medium |

### Week 3: Tour Management
| Task | Priority | Complexity |
|------|----------|------------|
| Tour scheduling calendar | High | Medium |
| Tour assignment to staff | High | Low |
| Tour completion tracking | High | Low |
| Post-tour follow-up automation | Medium | Medium |

### Week 4: Nurture Automation
| Task | Priority | Complexity |
|------|----------|------------|
| Nurture sequence builder | High | High |
| Email/SMS step configuration | High | Medium |
| Conditional branching | Medium | High |
| Sequence analytics | Medium | Medium |

**Deliverable:** Complete prospect CRM with automation.

---

## Month 9: Content Management System

**Goal:** Blog, articles, and content publishing.

### Week 1: Content CRUD
| Task | Priority | Complexity |
|------|----------|------------|
| Article/blog post creation | Critical | Medium |
| Rich text editor integration | Critical | High |
| Content categorization and tagging | High | Low |
| Featured image and gallery | High | Medium |

### Week 2: Publishing Workflow
| Task | Priority | Complexity |
|------|----------|------------|
| Draft → Review → Published states | High | Medium |
| Scheduled publishing | High | Medium |
| Content approval workflow | Medium | Medium |
| Revision history | Low | Medium |

### Week 3: Media Library
| Task | Priority | Complexity |
|------|----------|------------|
| Image upload with optimization | High | Medium |
| Folder organization | Medium | Low |
| Image resize and crop | Medium | Medium |
| CDN integration | High | High |

### Week 4: SEO & Member Portal
| Task | Priority | Complexity |
|------|----------|------------|
| Meta tags and SEO settings | High | Low |
| Public vs. member-only content | High | Medium |
| Content display on member portal | High | Medium |
| Comment system (optional) | Low | High |

**Deliverable:** Full CMS for club communications.

---

## Month 10: Email Marketing & Campaigns

**Goal:** Newsletter and campaign automation.

### Week 1: Newsletter Builder
| Task | Priority | Complexity |
|------|----------|------------|
| Newsletter template editor | Critical | High |
| Section-based content blocks | Critical | Medium |
| Preview and test send | High | Medium |
| Newsletter scheduling | High | Medium |

### Week 2: Audience Segmentation
| Task | Priority | Complexity |
|------|----------|------------|
| Dynamic segment builder | Critical | High |
| Pre-built segment templates | High | Low |
| Segment sync with email provider | High | High |
| Segment size estimation | Medium | Low |

### Week 3: Campaign Automation
| Task | Priority | Complexity |
|------|----------|------------|
| Welcome series automation | High | High |
| Renewal reminder sequence | High | High |
| Birthday/anniversary emails | High | Medium |
| Re-engagement campaigns | Medium | High |

### Week 4: Analytics & Compliance
| Task | Priority | Complexity |
|------|----------|------------|
| Campaign open/click tracking | High | Medium |
| Unsubscribe management | Critical | Medium |
| A/B testing framework | Medium | High |
| GDPR/CAN-SPAM compliance | Critical | Medium |

**Deliverable:** Complete email marketing platform.

---

## Month 11: F&B Operations Phase 1

**Goal:** Table management and basic ordering.

### Week 1: Floor Plan & Tables
| Task | Priority | Complexity |
|------|----------|------------|
| Floor plan designer | High | High |
| Table status visualization | High | Medium |
| Section/server assignment | High | Medium |
| Table merge/split | Medium | High |

### Week 2: Order Management
| Task | Priority | Complexity |
|------|----------|------------|
| Order entry with modifiers | Critical | Medium |
| Kitchen ticket generation | Critical | Medium |
| Order status tracking | High | Medium |
| Split check support | High | High |

### Week 3: Dining Reservations
| Task | Priority | Complexity |
|------|----------|------------|
| Reservation calendar | High | Medium |
| Party size and seating preferences | High | Low |
| Confirmation and reminders | High | Medium |
| Waitlist management | Medium | Medium |

### Week 4: Server Tools
| Task | Priority | Complexity |
|------|----------|------------|
| Server-side ordering interface | High | Medium |
| Tab management | High | Medium |
| Table transfer between servers | Medium | Medium |
| Tip handling | Medium | Medium |

**Deliverable:** Basic F&B ordering and table management.

---

## Month 12: Inventory, Social & Polish

**Goal:** Inventory tracking, social integration, and production polish.

### Week 1: Product Inventory
| Task | Priority | Complexity |
|------|----------|------------|
| SKU inventory tracking | High | Medium |
| Stock level alerts | High | Low |
| Inventory count workflow | High | Medium |
| Vendor management basics | Medium | Medium |

### Week 2: Social Integration
| Task | Priority | Complexity |
|------|----------|------------|
| Connect Facebook/Instagram | Medium | High |
| Post scheduling | Medium | Medium |
| Media attachment handling | Medium | Medium |
| Basic post analytics | Medium | Medium |

### Week 3: Production Hardening
| Task | Priority | Complexity |
|------|----------|------------|
| Error boundary improvements | High | Low |
| Loading state consistency | High | Low |
| Accessibility audit and fixes | High | Medium |
| Performance optimization | High | Medium |

### Week 4: Documentation & Launch
| Task | Priority | Complexity |
|------|----------|------------|
| Admin user guide | High | Medium |
| API documentation | High | Medium |
| Deployment runbook | High | Low |
| Training materials | Medium | Medium |

**Deliverable:** Production-ready system with inventory and social features.

---

## Success Metrics by Quarter

### Q1 (Month 1-3)
- [ ] Invoice-to-payment lifecycle complete
- [ ] POS sales operational with discounts
- [ ] Auto-pay enrollment > 50% of members
- [ ] AR aging visible to finance team

### Q2 (Month 4-6)
- [ ] General facility booking operational
- [ ] Spa bookings with therapist assignment live
- [ ] Sports/courts self-service booking live
- [ ] Staff trained on booking modules

### Q3 (Month 7-9)
- [ ] All key reports available
- [ ] Prospect pipeline in use by sales
- [ ] CMS publishing club content
- [ ] Marketing team has tools for outreach

### Q4 (Month 10-12)
- [ ] Email campaigns operational
- [ ] F&B ordering operational
- [ ] Inventory tracked across outlets
- [ ] Production stable with <1% error rate

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Stripe integration delays | Start Week 1 of Month 3, parallel development |
| Complex F&B requirements | Phase 1 MVP only, advanced features in Year 2 |
| Staff adoption resistance | Training program in Month 6 |
| Data migration issues | Dedicated migration sprint before launch |
| Performance at scale | Load testing in Month 11 |

---

## Dependencies Map

```
Month 1 (Billing) ──┬── Month 2 (POS) ──── Month 3 (Auto-pay)
                    │
                    └── Month 4 (Facility) ──┬── Month 5 (Spa)
                                             │
                                             └── Month 6 (Sports)

Month 7 (Reports) ◄── All Q2 modules

Month 8 (Prospects) ── Month 9 (CMS) ── Month 10 (Marketing)

Month 11 (F&B) ── Month 12 (Inventory + Social + Polish)
```

---

## Next Steps

1. **Review this roadmap** with stakeholders for priority adjustments
2. **Create detailed implementation plans** for Month 1 tasks
3. **Set up tracking** in project management tool
4. **Identify team allocation** per month

---

*Plan created: 2026-02-02*
*Version: 1.1 - Added Month 4 General Facility Booking*
