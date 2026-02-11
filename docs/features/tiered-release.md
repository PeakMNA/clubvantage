# **Development PRD: FairwayOS Unified Engine**

**Version:** 1.2.0

**Framework:** Unified Asset Logic (UAL)

**Status:** In-Development / Tier-Mapped

## **1\. System Architecture: The UAL Framework**

The core development requirement is that **Membership**, **Billing**, and **Reservations** are not separate modules. They must exist as an integrated logic layer.

* **Member Context:** Every API request must carry a MemberContext header.  
* **Asset Atomicity:** A "Reservation" is an atomic transaction that locks a Resource (e.g., Hole 1), a Staff member (e.g., Golf Pro), and a TimeBlock.

## **2\. Tiered Feature Mapping (Marketing Sync)**

This matrix defines the "Gate Logic" for the development team to implement in the Feature Flag system.

| Pillar | Tier 1: Launch (Public) | Tier 2: Growth (Club) | Tier 3: Scale (Enterprise) |
| :---- | :---- | :---- | :---- |
| **Membership** | Basic Profile & Status | Tiered Rules & CRM | Multi-Site Global ID |
| **Billing** | CC/Cash Transactions | House Accounts & Dues | Corporate/Group Ledger |
| **Golf (Tee Times)** | Public Booking Engine | Member Windows/Lottery | AI Dynamic Pricing |
| **Facilities** | Manual Time-Blocks | IoT Access/Light Control | Predictive Maintenance |
| **Services** | Single Pro Schedulers | Automated Pack/Series | Skill-based Load Balancing |
| **POS/Retail** | Single Warehouse SKU | Member-Price Modifiers | Global Catalog/ERP Sync |

## **3\. Functional Specifications by Pillar**

### **3.1 Membership & Logic Modifiers**

* **Requirement:** Implement a "Rules Engine" that intercepts every GetAssetPrice call.  
* **Tier 2/3 Spec:** Membership status must modify the booking\_window\_start (e.g., Gold \= 7 days, Platinum \= 14 days).  
* **Validation:** Members in "Arrears" (failed billing) must have their modifier\_active flag set to false automatically.

### **3.2 Unified Billing & Payments**

* **Tier 1:** Standard Payment Intent via Stripe.  
* **Tier 2 (House Accounts):** Implement a VirtualLedger system. Transaction creates a PendingCharge that is batched into the MonthlyDues cycle.  
* **Tier 3 (Corporate):** Support MasterBill logic where one member account pays for N dependent accounts (Family/Corporate).

### **3.3 Golf & Facility Reservations**

* **Concurrency Control:** Use Redis SETNX for time-slot locking. Lock TTL: 5 minutes.  
* **Asset Perishability:** Implement a CleanupJob that releases "In-Progress" bookings that haven't been finalized via payment/confirmation within the TTL.  
* **IoT Integration (Tier 2/3):** MQTT protocol handlers to trigger hardware relays (Gate/Lights) upon CheckInEvent.

### **3.4 Service Reservations (Pro Staff)**

* **Constraint Logic:** Staff\_Available AND Facility\_Available must both return true for the booking to proceed.  
* **Commission Logic:** Tier 2 must support Base\_Rate \+ (Price \* Commission\_%).

## **4\. Technical Constraints & Performance**

### **4.1 Data Integrity**

* **ACID Compliance:** Transactions involving POS inventory and Reservation status must use database-level transactions.  
* **Soft Deletes:** No asset or member record is ever deleted; use is\_archived to maintain historical financial audit trails.

### **4.2 Performance Benchmarks**

* **Tee Time Release:** System must handle 10,000+ concurrent requests at 7:00 AM local time with \< 200ms p99 latency.  
* **Search:** Membership lookups must use indexed MemberUUID for \< 50ms response time.

## **5\. Security & Compliance**

* **PCI Scope:** Use hosted fields/tokens. The FairwayOS DB must never see or store raw PAN (Primary Account Number) data.  
* **Data Sovereignty (Tier 3):** Support for regional database sharding for international resorts (GDPR/CCPA compliance).  
* **Audit Log:** Every price override or manual "Comp" booking must log the Admin\_ID and a Reason\_Code.

## **6\. Success Metrics (Development Focused)**

* **API Uptime:** 99.99% core booking availability.  
* **Zero Race Conditions:** 0.0% double-booking rate verified via automated stress testing.  
* **Sync Latency:** \< 1s latency between a POS sale and Inventory count update.