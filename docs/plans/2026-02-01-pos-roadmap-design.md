# ClubVantage POS Roadmap & MVP Gap Analysis

**Date:** 2026-02-01
**Status:** Approved
**Purpose:** Define POS feature roadmap for pro shop, spa, and sports facilities serving members and guests

---

## Executive Summary

ClubVantage has a solid POS foundation built for golf check-in. This document identifies gaps compared to industry-standard club POS systems and proposes a phased roadmap to extend capabilities across spa, sports facilities, and eventually F&B.

---

## Current State (Already Built)

### Core POS Infrastructure ✅
| Feature | Status |
|---------|--------|
| Member account charging | ✅ |
| Payment processing (void/refund) | ✅ |
| Multi-player checkout | ✅ |
| Product catalog (categories, variants) | ✅ |
| SKU tracking | ✅ |
| Tax calculation (ADD/INCLUDE/NONE) | ✅ |
| Quick-add items | ✅ |
| Line item transfers | ✅ |
| Draft persistence | ✅ |
| Quantity management | ✅ |
| Invoicing lifecycle | ✅ |
| Payment methods config | ✅ |

---

## MVP Gaps (Phase 1 Priority)

### Discounts & Promotions
| Feature | Priority | Description |
|---------|----------|-------------|
| Line item discounts | Critical | % or fixed amount per item |
| Order-level discounts | Critical | Apply to entire transaction |
| Member discounts | Critical | Auto-apply based on membership tier |
| Discount approval workflow | Medium | Manager override for large discounts |
| Promo codes | Medium | Redeemable discount codes |
| Happy hour pricing | Medium | Time-based automatic pricing |
| Staff discounts | Medium | Employee discount rules |
| Combo/bundle pricing | Low | Discounted package deals |

### Member & Account Features
| Feature | Priority | Description |
|---------|----------|-------------|
| Member minimum spend | Critical | Monthly minimums with carry-forward rules |
| Credit limits | Critical | Per-member charge limits with alerts |
| Sub-accounts | Medium | Dependents/guests can charge to member |
| Stored payment methods | Medium | Default card on file for auto-billing |
| Member recognition tiers | Roadmap | VIP alerts on POS screen |

### POS Operations
| Feature | Priority | Description |
|---------|----------|-------------|
| Cash drawer management | Critical | Open/close, float, reconciliation |
| End-of-day settlement | Critical | Shift reports, batch close |
| Receipt printing | Medium | Thermal printer integration |
| Barcode scanning | Roadmap | For inventory and checkout |
| Offline mode | Roadmap | Queue transactions when offline |

---

## Spa Module (Phase 2)

### MVP Scope

**Appointment & Booking:**
| Feature | Priority |
|---------|----------|
| Service menu (treatments, duration, price, staff) | Critical |
| Online booking (member self-service 24/7) | Critical |
| Staff scheduling (availability, skills, rooms) | Critical |
| Resource booking (rooms, beds, equipment) | Critical |
| Appointment reminders (SMS/email) | Medium |

**Packages & Checkout:**
| Feature | Priority |
|---------|----------|
| Treatment packages (prepaid bundles) | Critical |
| Package redemption tracking | Critical |
| Product sales (skincare, retail) | Critical |
| Service + retail combined checkout | Critical |

### Roadmap (Post-MVP)
- Therapist commission tracking
- Product recommendations based on history
- Spa-specific memberships
- Waitlist management
- No-show tracking and penalties

---

## Sports/Courts Module (Phase 3)

### MVP Scope

**Court/Facility Booking:**
| Feature | Priority |
|---------|----------|
| Court calendar (visual grid by court/time) | Critical |
| Online booking (member self-service) | Critical |
| Booking rules (advance limits, duration, member-only) | Critical |
| Resource types (tennis, squash, pool lanes, etc.) | Critical |
| Guest booking (member brings guest, guest fees) | Medium |

**Classes & Rentals:**
| Feature | Priority |
|---------|----------|
| Class scheduling (group classes with capacity) | Critical |
| Class registration (sign up, cancel) | Critical |
| Rental items (racquets, balls, towels) | Medium |
| Rental checkout (track, auto-charge) | Medium |

### Roadmap (Post-MVP)
- Equipment inventory tracking
- Recurring bookings (weekly standing reservations)
- Pro/instructor lessons with packages
- Waitlist notifications

---

## F&B Module (Phase 4 - Future)

Full restaurant/dining module deferred to later phase.

### Planned Features
| Category | Features |
|----------|----------|
| Order Management | Table/seat assignment, course firing, modifiers, split/merge checks |
| Kitchen Operations | Kitchen Display System (KDS), station routing, prep time tracking, 86'd items |
| Service Flow | Tab/running check, server assignment, tip handling, dining reservations |

---

## Phased Roadmap

### Phase 1: Core POS Foundation
**Focus:** Complete the POS infrastructure for all outlets

- [ ] Discounts system (line item + order level + member-based)
- [ ] Member credit limits with alerts
- [ ] Member minimum spend with carry-forward
- [ ] Sub-account charging (dependents/guests)
- [ ] Cash drawer management (open/close/reconcile)
- [ ] End-of-day settlement reports
- [ ] Stored payment methods

### Phase 2: Spa Module
**Focus:** Appointment-based services with retail

- [ ] Service catalog (treatments, duration, pricing)
- [ ] Staff scheduling with availability
- [ ] Room/resource allocation
- [ ] Online booking for members
- [ ] Appointment reminders
- [ ] Treatment packages with redemption tracking
- [ ] Combined service + retail checkout

### Phase 3: Sports/Courts Module
**Focus:** Facility booking with classes

- [ ] Court/facility resource configuration
- [ ] Visual booking calendar
- [ ] Booking rules engine
- [ ] Online member booking
- [ ] Guest booking with fees
- [ ] Class scheduling + registration
- [ ] Equipment rentals with auto-charge

### Phase 4: F&B Module
**Focus:** Full-service dining operations

- [ ] Floor plan / table management
- [ ] Order modifiers + dietary flags
- [ ] Course firing control
- [ ] Kitchen Display System (KDS)
- [ ] Split/merge checks
- [ ] Server assignment + tips
- [ ] Dining reservations

### Phase 5: Advanced Features
**Focus:** Cross-outlet integration and optimization

- [ ] Unified ledger (gift cards/credits across outlets)
- [ ] VIP member recognition alerts
- [ ] Commission tracking (spa therapists, pros)
- [ ] Barcode scanning integration
- [ ] Advanced inventory management
- [ ] Offline mode with sync

---

## Architecture Considerations

### Shared Infrastructure
All outlet modules should reuse:
- `PaymentService` - Transaction processing
- `BookingLineItem` model - Charge tracking
- Member account system - Charging, limits, minimums
- Tax calculation engine - ADD/INCLUDE/NONE
- Discount engine (to be built)

### Module-Specific Components
| Module | Unique Components |
|--------|-------------------|
| Spa | Appointments, Services, Packages, Rooms |
| Sports | Courts, Bookings, Classes, Rentals |
| F&B | Tables, Orders, KDS, Modifiers |

### Data Model Extensions Needed
```
- Discount (type, value, conditions, approval)
- MemberMinimum (amount, period, carryForward)
- MemberCreditLimit (limit, currentBalance)
- SubAccount (memberId, linkedMemberId, permissions)
- CashDrawer (openAmount, closeAmount, userId)
- Shift (startTime, endTime, userId, transactions)

- SpaService (name, duration, price, categoryId)
- SpaAppointment (serviceId, staffId, roomId, memberId, startTime)
- SpaPackage (name, services[], redemptionsAllowed)
- SpaPackageRedemption (packageId, appointmentId)

- Court (name, type, locationId)
- CourtBooking (courtId, memberId, startTime, endTime)
- BookingRule (resourceType, advanceLimit, duration, memberOnly)
- FacilityClass (name, capacity, instructorId, schedule)
- ClassRegistration (classId, memberId, status)
- RentalItem (name, type, quantity, pricePerHour)
- RentalCheckout (itemId, memberId, checkoutTime, returnTime)
```

---

## Success Metrics

| Phase | Key Metrics |
|-------|-------------|
| Phase 1 | Discount usage rate, EOD settlement accuracy, credit limit violations prevented |
| Phase 2 | Spa booking rate, package redemption %, online vs staff booking ratio |
| Phase 3 | Court utilization %, class fill rate, rental revenue |
| Phase 4 | Table turn time, ticket accuracy, KDS adoption |

---

## References

- [Clubessential Mobile POS](https://www.clubessential.com/mobile-pos/)
- [Cobalt Software](https://www.mycobaltsoftware.com/cobalt-core/)
- [Vagaro Spa POS](https://www.vagaro.com/learn/best-spa-pos-software)
- [Quantic Restaurant POS Features](https://getquantic.com/restaurant-pos-system-features/)
- [CourtReserve](https://courtreserve.com/)
- [EZFacility](https://www.ezfacility.com/industries/sports-facility-software/)
