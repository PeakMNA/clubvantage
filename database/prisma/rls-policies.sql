-- ============================================================================
-- ClubVantage Row-Level Security Policies
-- Run this AFTER Prisma migrations to enable multi-tenant isolation
-- ============================================================================

-- ============================================================================
-- CORE TENANT TABLES
-- ============================================================================

-- Members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE members FORCE ROW LEVEL SECURITY;

CREATE POLICY members_tenant_isolation ON members
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Membership Types
ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_types FORCE ROW LEVEL SECURITY;

CREATE POLICY membership_types_tenant_isolation ON membership_types
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Membership Tiers
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers FORCE ROW LEVEL SECURITY;

CREATE POLICY membership_tiers_tenant_isolation ON membership_tiers
  FOR ALL
  USING (
    membership_type_id IN (SELECT id FROM membership_types WHERE club_id = current_club_id())
    OR is_platform_admin()
  )
  WITH CHECK (
    membership_type_id IN (SELECT id FROM membership_types WHERE club_id = current_club_id())
    OR is_platform_admin()
  );

-- Households
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE households FORCE ROW LEVEL SECURITY;

CREATE POLICY households_tenant_isolation ON households
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Dependents
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependents FORCE ROW LEVEL SECURITY;

CREATE POLICY dependents_tenant_isolation ON dependents
  FOR ALL
  USING (
    member_id IN (SELECT id FROM members WHERE club_id = current_club_id())
    OR is_platform_admin()
  )
  WITH CHECK (
    member_id IN (SELECT id FROM members WHERE club_id = current_club_id())
    OR is_platform_admin()
  );

-- ============================================================================
-- BILLING TABLES
-- ============================================================================

-- Charge Types
ALTER TABLE charge_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_types FORCE ROW LEVEL SECURITY;

CREATE POLICY charge_types_tenant_isolation ON charge_types
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

CREATE POLICY invoices_tenant_isolation ON invoices
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Invoice Line Items
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items FORCE ROW LEVEL SECURITY;

CREATE POLICY invoice_line_items_tenant_isolation ON invoice_line_items
  FOR ALL
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE club_id = current_club_id())
    OR is_platform_admin()
  )
  WITH CHECK (
    invoice_id IN (SELECT id FROM invoices WHERE club_id = current_club_id())
    OR is_platform_admin()
  );

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

CREATE POLICY payments_tenant_isolation ON payments
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Payment Allocations
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations FORCE ROW LEVEL SECURITY;

CREATE POLICY payment_allocations_tenant_isolation ON payment_allocations
  FOR ALL
  USING (
    payment_id IN (SELECT id FROM payments WHERE club_id = current_club_id())
    OR is_platform_admin()
  )
  WITH CHECK (
    payment_id IN (SELECT id FROM payments WHERE club_id = current_club_id())
    OR is_platform_admin()
  );

-- ============================================================================
-- FACILITY BOOKING TABLES
-- ============================================================================

-- Facilities
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities FORCE ROW LEVEL SECURITY;

CREATE POLICY facilities_tenant_isolation ON facilities
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Resources
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources FORCE ROW LEVEL SECURITY;

CREATE POLICY resources_tenant_isolation ON resources
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;

CREATE POLICY bookings_tenant_isolation ON bookings
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Guests
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests FORCE ROW LEVEL SECURITY;

CREATE POLICY guests_tenant_isolation ON guests
  FOR ALL
  USING (
    invited_by_id IN (SELECT id FROM members WHERE club_id = current_club_id())
    OR is_platform_admin()
  )
  WITH CHECK (
    invited_by_id IN (SELECT id FROM members WHERE club_id = current_club_id())
    OR is_platform_admin()
  );

-- ============================================================================
-- GOLF TABLES
-- ============================================================================

-- Golf Courses
ALTER TABLE golf_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_courses FORCE ROW LEVEL SECURITY;

CREATE POLICY golf_courses_tenant_isolation ON golf_courses
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Green Fee Rates
ALTER TABLE green_fee_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_fee_rates FORCE ROW LEVEL SECURITY;

CREATE POLICY green_fee_rates_tenant_isolation ON green_fee_rates
  FOR ALL
  USING (
    course_id IN (SELECT id FROM golf_courses WHERE club_id = current_club_id())
    OR is_platform_admin()
  )
  WITH CHECK (
    course_id IN (SELECT id FROM golf_courses WHERE club_id = current_club_id())
    OR is_platform_admin()
  );

-- Caddies
ALTER TABLE caddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE caddies FORCE ROW LEVEL SECURITY;

CREATE POLICY caddies_tenant_isolation ON caddies
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Tee Times
ALTER TABLE tee_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_times FORCE ROW LEVEL SECURITY;

CREATE POLICY tee_times_tenant_isolation ON tee_times
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Tee Time Players
ALTER TABLE tee_time_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_time_players FORCE ROW LEVEL SECURITY;

CREATE POLICY tee_time_players_tenant_isolation ON tee_time_players
  FOR ALL
  USING (
    tee_time_id IN (SELECT id FROM tee_times WHERE club_id = current_club_id())
    OR is_platform_admin()
  )
  WITH CHECK (
    tee_time_id IN (SELECT id FROM tee_times WHERE club_id = current_club_id())
    OR is_platform_admin()
  );

-- ============================================================================
-- LEAD MANAGEMENT TABLES
-- ============================================================================

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;

CREATE POLICY leads_tenant_isolation ON leads
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- ============================================================================
-- USER & SYSTEM TABLES
-- ============================================================================

-- Users (tenant-scoped)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation ON users
  FOR ALL
  USING (
    club_id IS NULL  -- Platform admins
    OR club_id = current_club_id()
    OR is_platform_admin()
  )
  WITH CHECK (
    club_id IS NULL
    OR club_id = current_club_id()
    OR is_platform_admin()
  );

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

CREATE POLICY notifications_tenant_isolation ON notifications
  FOR ALL
  USING (club_id = current_club_id() OR is_platform_admin())
  WITH CHECK (club_id = current_club_id() OR is_platform_admin());

-- ============================================================================
-- CLUBS TABLE (Platform-level, no RLS - accessed by platform admins only)
-- ============================================================================

-- Clubs table should be accessible to platform admins and when setting up tenant context
-- We don't enable RLS on clubs table as it's the root of tenant hierarchy
-- Access control is handled at the application level

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage of functions to authenticated users
GRANT EXECUTE ON FUNCTION current_club_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_member_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_receipt_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_booking_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_teetime_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_lead_number(UUID) TO authenticated;
