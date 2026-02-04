-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PROSPECT', 'LEAD', 'APPLICANT', 'ACTIVE', 'SUSPENDED', 'LAPSED', 'RESIGNED', 'TERMINATED', 'REACTIVATED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'VOID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CityLedgerType" AS ENUM ('CORPORATE', 'HOUSE_ACCOUNT', 'VENDOR', 'OTHER');

-- CreateEnum
CREATE TYPE "CityLedgerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'QR_PROMPTPAY', 'QR_PAYNOW', 'QR_DUITNOW', 'CHECK', 'DIRECT_DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "PlayerType" AS ENUM ('MEMBER', 'GUEST', 'DEPENDENT', 'WALK_UP');

-- CreateEnum
CREATE TYPE "CartType" AS ENUM ('SINGLE', 'SHARED', 'WALKING');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('NONE', 'REQUESTED', 'PAID', 'ASSIGNED', 'RETURNED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF', 'MEMBER');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('TH', 'SG', 'MY');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('FACILITY', 'SERVICE', 'STAFF');

-- CreateEnum
CREATE TYPE "BookingPaymentMethod" AS ENUM ('ON_ACCOUNT', 'CREDITS', 'PREPAID', 'PAY_AT_SERVICE');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "VariationPriceType" AS ENUM ('FIXED_ADD', 'PERCENTAGE_ADD', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlayFormat" AS ENUM ('EIGHTEEN_HOLE', 'CROSS_TEE');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('WEEKDAY', 'WEEKEND', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('MAINTENANCE', 'TOURNAMENT', 'WEATHER', 'PRIVATE', 'STARTER');

-- CreateEnum
CREATE TYPE "GroupBookingStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StartFormat" AS ENUM ('SEQUENTIAL', 'SHOTGUN');

-- CreateEnum
CREATE TYPE "LotteryType" AS ENUM ('PRIME_TIME', 'SPECIAL_EVENT');

-- CreateEnum
CREATE TYPE "LotteryStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'DRAWN', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "LotteryRequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'WAITLISTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GolfWaitlistStatus" AS ENUM ('PENDING', 'NOTIFIED', 'BOOKED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TwilightMode" AS ENUM ('FIXED', 'SUNSET');

-- CreateEnum
CREATE TYPE "SpecialDayType" AS ENUM ('WEEKEND', 'HOLIDAY', 'CLOSED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ApplicableDays" AS ENUM ('WEEKDAY', 'WEEKEND', 'ALL');

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('EIGHTEEN', 'CROSS');

-- CreateEnum
CREATE TYPE "CartPolicy" AS ENUM ('OPTIONAL', 'REQUIRED');

-- CreateEnum
CREATE TYPE "RentalPolicy" AS ENUM ('OPTIONAL', 'REQUIRED');

-- CreateEnum
CREATE TYPE "LineItemType" AS ENUM ('GREEN_FEE', 'CART', 'CADDY', 'RENTAL', 'PROSHOP');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('ADD', 'INCLUDE', 'NONE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'PENDING_BOARD', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PrintOption" AS ENUM ('TICKET', 'RECEIPT', 'COMBINED', 'NONE');

-- CreateEnum
CREATE TYPE "TicketGenerateOn" AS ENUM ('CHECK_IN', 'SETTLEMENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "DiscountScope" AS ENUM ('LINE_ITEM', 'ORDER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'VARIABLE', 'SERVICE', 'COMPOSITE');

-- CreateEnum
CREATE TYPE "ModifierSelectionType" AS ENUM ('SINGLE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "TileSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "CategoryDisplayStyle" AS ENUM ('TABS', 'SIDEBAR', 'DROPDOWN');

-- CreateEnum
CREATE TYPE "QuickKeysPosition" AS ENUM ('TOP', 'LEFT');

-- CreateEnum
CREATE TYPE "SuggestionPosition" AS ENUM ('TOP_ROW', 'SIDEBAR', 'FLOATING');

-- CreateEnum
CREATE TYPE "InventoryVisibilityRule" AS ENUM ('ALWAYS_SHOW', 'HIDE_WHEN_ZERO', 'SHOW_DISABLED');

-- CreateEnum
CREATE TYPE "CashDrawerStatus" AS ENUM ('OPEN', 'CLOSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CashMovementType" AS ENUM ('OPENING_FLOAT', 'CASH_SALE', 'CASH_REFUND', 'PAID_IN', 'PAID_OUT', 'DROP', 'ADJUSTMENT', 'CLOSING_COUNT');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('CASH_VARIANCE', 'CARD_VARIANCE', 'MISSING_RECEIPT', 'DUPLICATE_TRANSACTION', 'VOID_WITHOUT_APPROVAL', 'REFUND_WITHOUT_APPROVAL', 'DISCOUNT_WITHOUT_APPROVAL', 'SYSTEM_ERROR', 'OTHER');

-- CreateEnum
CREATE TYPE "ExceptionSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ExceptionResolution" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'ADJUSTED', 'WRITTEN_OFF', 'ESCALATED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "MinimumSpendPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "ShortfallAction" AS ENUM ('CHARGE_DIFFERENCE', 'CARRY_FORWARD', 'WAIVE', 'CREDIT_BALANCE');

-- CreateEnum
CREATE TYPE "MemberSpendStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'MET', 'SHORTFALL', 'EXEMPT', 'PENDING_ACTION', 'RESOLVED');

-- CreateEnum
CREATE TYPE "SubAccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SubAccountPermission" AS ENUM ('GOLF', 'FOOD_BEVERAGE', 'RETAIL', 'SPA', 'EVENTS', 'ALL');

-- CreateEnum
CREATE TYPE "StoredPaymentMethodType" AS ENUM ('CARD', 'BANK_ACCOUNT');

-- CreateEnum
CREATE TYPE "StoredPaymentMethodStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'FAILED', 'REMOVED');

-- CreateEnum
CREATE TYPE "AutoPaySchedule" AS ENUM ('INVOICE_DUE', 'STATEMENT_DATE', 'MONTHLY_FIXED');

-- CreateEnum
CREATE TYPE "AutoPayAttemptStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CreditNoteType" AS ENUM ('REFUND', 'ADJUSTMENT', 'COURTESY', 'PROMO', 'WRITE_OFF', 'RETURN', 'CANCELLATION');

-- CreateEnum
CREATE TYPE "CreditNoteReason" AS ENUM ('BILLING_ERROR', 'DUPLICATE_CHARGE', 'SERVICE_NOT_RENDERED', 'MEMBERSHIP_CANCELLATION', 'PRODUCT_RETURN', 'PRICE_ADJUSTMENT', 'CUSTOMER_SATISFACTION', 'EVENT_CANCELLATION', 'RAIN_CHECK', 'OVERPAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CreditNoteStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'APPLIED', 'PARTIALLY_APPLIED', 'REFUNDED', 'VOIDED');

-- CreateEnum
CREATE TYPE "CollectionActionType" AS ENUM ('REMINDER_EMAIL', 'REMINDER_SMS', 'REMINDER_LETTER', 'PHONE_CALL', 'RESTRICT_BOOKING', 'RESTRICT_CHARGING', 'SUSPEND_MEMBERSHIP', 'WRITE_OFF', 'SEND_TO_AGENCY');

-- CreateEnum
CREATE TYPE "CollectionResult" AS ENUM ('PAYMENT_RECEIVED', 'PAYMENT_PROMISED', 'NO_ANSWER', 'LEFT_MESSAGE', 'DISPUTED', 'HARDSHIP', 'REFUSED', 'CONTACT_INVALID');

-- CreateEnum
CREATE TYPE "BillingFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "BillingTiming" AS ENUM ('ADVANCE', 'ARREARS');

-- CreateEnum
CREATE TYPE "CycleAlignment" AS ENUM ('CALENDAR', 'ANNIVERSARY');

-- CreateEnum
CREATE TYPE "ProrationMethod" AS ENUM ('DAILY', 'MONTHLY', 'NONE');

-- CreateEnum
CREATE TYPE "LateFeeType" AS ENUM ('PERCENTAGE', 'FIXED', 'TIERED');

-- CreateEnum
CREATE TYPE "InterestSource" AS ENUM ('EXPLICIT', 'BOOKING', 'INFERRED');

-- CreateTable
CREATE TABLE "clubs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "region" "Region" NOT NULL DEFAULT 'TH',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Bangkok',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'THB',
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 7,
    "taxType" VARCHAR(10) NOT NULL DEFAULT 'VAT',
    "logoUrl" VARCHAR(500),
    "primaryColor" VARCHAR(7),
    "address" TEXT,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "website" VARCHAR(500),
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'STARTER',
    "subscriptionStatus" VARCHAR(20) NOT NULL DEFAULT 'active',
    "maxMembers" INTEGER NOT NULL DEFAULT 500,
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "features" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "posButtonRegistry" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_golf_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "cartPolicy" "CartPolicy" NOT NULL DEFAULT 'OPTIONAL',
    "rentalPolicy" "RentalPolicy" NOT NULL DEFAULT 'OPTIONAL',
    "caddyDrivesCart" BOOLEAN NOT NULL DEFAULT true,
    "maxGuestsPerMember" INTEGER NOT NULL DEFAULT 3,
    "requireGuestContact" BOOLEAN NOT NULL DEFAULT false,
    "allowPartialPayment" BOOLEAN NOT NULL DEFAULT false,
    "blockSuspendedMembers" BOOLEAN NOT NULL DEFAULT true,
    "showSuspensionReason" BOOLEAN NOT NULL DEFAULT true,
    "requireAllItemsPaid" BOOLEAN NOT NULL DEFAULT true,
    "defaultTaxRate" DECIMAL(5,2) NOT NULL DEFAULT 7,
    "defaultTaxType" "TaxType" NOT NULL DEFAULT 'INCLUDE',
    "taxLabel" VARCHAR(20) NOT NULL DEFAULT 'Tax',
    "showTaxBreakdown" BOOLEAN NOT NULL DEFAULT true,
    "showTaxTypeIndicator" BOOLEAN NOT NULL DEFAULT true,
    "ticketGenerateOn" "TicketGenerateOn" NOT NULL DEFAULT 'SETTLEMENT',
    "ticketAutoGenerate" BOOLEAN NOT NULL DEFAULT true,
    "ticketDefaultPrint" "PrintOption" NOT NULL DEFAULT 'COMBINED',
    "ticketShowTeeTime" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowCourse" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowStartingHole" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowPlayerNames" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowMemberNumbers" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowCartNumber" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowCaddyName" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowRentalItems" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowSpecialReqs" BOOLEAN NOT NULL DEFAULT true,
    "ticketShowQRCode" BOOLEAN NOT NULL DEFAULT true,
    "allowProShopAtCheckIn" BOOLEAN NOT NULL DEFAULT true,
    "showQuickAddItems" BOOLEAN NOT NULL DEFAULT true,
    "quickAddProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "posIsConnected" BOOLEAN NOT NULL DEFAULT false,
    "posProvider" VARCHAR(50),
    "posTerminalId" VARCHAR(100),
    "posConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_golf_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_billing_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "defaultFrequency" "BillingFrequency" NOT NULL DEFAULT 'MONTHLY',
    "defaultTiming" "BillingTiming" NOT NULL DEFAULT 'ADVANCE',
    "defaultAlignment" "CycleAlignment" NOT NULL DEFAULT 'CALENDAR',
    "defaultBillingDay" INTEGER NOT NULL DEFAULT 1,
    "invoiceGenerationLead" INTEGER NOT NULL DEFAULT 5,
    "invoiceDueDays" INTEGER NOT NULL DEFAULT 15,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 15,
    "lateFeeType" "LateFeeType" NOT NULL DEFAULT 'PERCENTAGE',
    "lateFeeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lateFeePercentage" DECIMAL(5,2) NOT NULL DEFAULT 1.5,
    "maxLateFee" DECIMAL(12,2),
    "autoApplyLateFee" BOOLEAN NOT NULL DEFAULT false,
    "prorateNewMembers" BOOLEAN NOT NULL DEFAULT true,
    "prorateChanges" BOOLEAN NOT NULL DEFAULT true,
    "prorationMethod" "ProrationMethod" NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_billing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_billing_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "memberId" UUID NOT NULL,
    "billingFrequency" "BillingFrequency",
    "billingTiming" "BillingTiming",
    "billingAlignment" "CycleAlignment",
    "customBillingDay" INTEGER,
    "nextBillingDate" TIMESTAMP(3),
    "lastBillingDate" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "billingHold" BOOLEAN NOT NULL DEFAULT false,
    "billingHoldReason" TEXT,
    "billingHoldUntil" TIMESTAMP(3),
    "prorationOverride" "ProrationMethod",
    "customGracePeriod" INTEGER,
    "customLateFeeExempt" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_billing_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "monthlyFee" DECIMAL(12,2) NOT NULL,
    "annualFee" DECIMAL(12,2),
    "joiningFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maxMembers" INTEGER,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "allowGuests" BOOLEAN NOT NULL DEFAULT true,
    "maxGuestsPerBooking" INTEGER NOT NULL DEFAULT 3,
    "allowFamilyMembers" BOOLEAN NOT NULL DEFAULT true,
    "maxFamilyMembers" INTEGER NOT NULL DEFAULT 4,
    "bookingAdvanceDays" INTEGER NOT NULL DEFAULT 7,
    "priorityBooking" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "membershipTypeId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "priceMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" VARCHAR(20) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "dateOfBirth" DATE,
    "gender" VARCHAR(20),
    "avatarUrl" VARCHAR(500),
    "address" TEXT,
    "nationality" VARCHAR(100),
    "idNumber" VARCHAR(50),
    "emergencyContact" VARCHAR(255),
    "emergencyPhone" VARCHAR(50),
    "membershipTypeId" UUID NOT NULL,
    "membershipTierId" UUID,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATE,
    "renewalDate" DATE,
    "householdId" UUID,
    "isPrimaryMember" BOOLEAN NOT NULL DEFAULT false,
    "referredById" UUID,
    "referralSource" VARCHAR(100),
    "creditBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "outstandingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "creditLimit" DECIMAL(12,2),
    "creditLimitEnabled" BOOLEAN NOT NULL DEFAULT false,
    "creditAlertThreshold" INTEGER NOT NULL DEFAULT 80,
    "creditBlockEnabled" BOOLEAN NOT NULL DEFAULT true,
    "creditOverrideAllowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_limit_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "memberId" UUID NOT NULL,
    "previousLimit" DECIMAL(12,2) NOT NULL,
    "newLimit" DECIMAL(12,2) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "approvedBy" UUID NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_limit_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "memberId" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "relationship" VARCHAR(50) NOT NULL,
    "dateOfBirth" DATE,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dependents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charge_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "defaultPrice" DECIMAL(12,2),
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "glCode" VARCHAR(20),
    "category" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charge_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "invoiceNumber" VARCHAR(30) NOT NULL,
    "memberId" UUID,
    "cityLedgerId" UUID,
    "invoiceDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "paidDate" DATE,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(12,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "internalNotes" TEXT,
    "billingPeriod" VARCHAR(50),
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoiceId" UUID NOT NULL,
    "chargeTypeId" UUID,
    "description" VARCHAR(500) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxType" VARCHAR(10),
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(12,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "receiptNumber" VARCHAR(30) NOT NULL,
    "memberId" UUID,
    "cityLedgerId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "referenceNumber" VARCHAR(100),
    "paymentDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bankName" VARCHAR(100),
    "accountLast4" VARCHAR(4),
    "gatewayId" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'completed',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paymentId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_ledgers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "accountNumber" VARCHAR(30) NOT NULL,
    "accountName" VARCHAR(255) NOT NULL,
    "accountType" "CityLedgerType" NOT NULL DEFAULT 'CORPORATE',
    "contactName" VARCHAR(200),
    "contactEmail" VARCHAR(255),
    "contactPhone" VARCHAR(50),
    "billingAddress" TEXT,
    "taxId" VARCHAR(50),
    "creditLimit" DECIMAL(12,2),
    "creditBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "outstandingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentTerms" INTEGER NOT NULL DEFAULT 30,
    "status" "CityLedgerStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "location" VARCHAR(255),
    "capacity" INTEGER,
    "imageUrl" VARCHAR(500),
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rules" TEXT,
    "bookingDuration" INTEGER NOT NULL DEFAULT 60,
    "minAdvanceHours" INTEGER NOT NULL DEFAULT 1,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 14,
    "cancellationHours" INTEGER NOT NULL DEFAULT 24,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "allowGuests" BOOLEAN NOT NULL DEFAULT true,
    "maxGuests" INTEGER NOT NULL DEFAULT 3,
    "operatingHours" JSONB NOT NULL DEFAULT '{}',
    "memberRate" DECIMAL(12,2),
    "guestRate" DECIMAL(12,2),
    "peakRateMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "peakHours" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facilityId" UUID NOT NULL,
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "bookingNumber" VARCHAR(30) NOT NULL,
    "memberId" UUID NOT NULL,
    "bookingType" "BookingType" NOT NULL DEFAULT 'FACILITY',
    "facilityId" UUID,
    "resourceId" UUID,
    "serviceId" UUID,
    "staffId" UUID,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "noShowMarkedAt" TIMESTAMP(3),
    "guestCount" INTEGER NOT NULL DEFAULT 0,
    "guestInfo" JSONB,
    "sponsoringMemberId" TEXT,
    "selectedVariations" JSONB,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "tierDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "variationsTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2),
    "bookingPaymentMethod" "BookingPaymentMethod" NOT NULL DEFAULT 'ON_ACCOUNT',
    "bookingPaymentStatus" "BookingPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "creditsUsed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "revenueCenterId" VARCHAR(50),
    "outletId" VARCHAR(50),
    "consumablesUsed" JSONB,
    "notes" TEXT,
    "internalNotes" TEXT,
    "cancelReason" VARCHAR(500),
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" UUID,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" UUID,
    "teeTimePlayerId" UUID,
    "invitedById" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "convertedToLeadId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "avatarUrl" VARCHAR(500),
    "userId" UUID,
    "defaultFacilityId" UUID,
    "workingSchedule" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_capabilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "staffId" UUID NOT NULL,
    "capability" VARCHAR(100) NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_certifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "staffId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "issuedBy" VARCHAR(255),
    "issuedDate" DATE,
    "expiryDate" DATE,
    "documentUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "tierDiscounts" JSONB,
    "requiredCapabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equipmentNeeds" JSONB,
    "consumableNeeds" JSONB,
    "revenueCenterId" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_variations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "serviceId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "priceType" "VariationPriceType" NOT NULL DEFAULT 'FIXED_ADD',
    "priceValue" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_variations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "facilityId" UUID,
    "serviceId" UUID,
    "staffId" UUID,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" VARCHAR(50),
    "position" INTEGER NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "offeredAt" TIMESTAMP(3),
    "offerExpiresAt" TIMESTAMP(3),
    "bookingId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "unit" VARCHAR(50) NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "reorderThreshold" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumable_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "consumableId" UUID NOT NULL,
    "bookingId" TEXT,
    "quantity" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "consumable_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "holes" INTEGER NOT NULL DEFAULT 18,
    "par" INTEGER NOT NULL DEFAULT 72,
    "yardage" INTEGER,
    "rating" DECIMAL(4,1),
    "slope" INTEGER,
    "imageUrl" VARCHAR(500),
    "firstTeeTime" VARCHAR(5) NOT NULL DEFAULT '06:00',
    "lastTeeTime" VARCHAR(5) NOT NULL DEFAULT '16:00',
    "teeInterval" INTEGER NOT NULL DEFAULT 8,
    "maxPlayers" INTEGER NOT NULL DEFAULT 4,
    "memberAdvanceDays" INTEGER NOT NULL DEFAULT 7,
    "guestAdvanceDays" INTEGER NOT NULL DEFAULT 3,
    "cancellationHours" INTEGER NOT NULL DEFAULT 24,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_fee_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "playerType" "PlayerType" NOT NULL,
    "holes" INTEGER NOT NULL DEFAULT 18,
    "dayType" VARCHAR(20) NOT NULL,
    "timeSlot" VARCHAR(20),
    "rate" DECIMAL(12,2) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "green_fee_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_course_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "seasonName" VARCHAR(50) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "firstTeeTime" VARCHAR(5) NOT NULL,
    "lastTeeTime" VARCHAR(5) NOT NULL,
    "playFormat" "PlayFormat" NOT NULL DEFAULT 'EIGHTEEN_HOLE',
    "paceOfPlay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_course_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_course_intervals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scheduleId" UUID NOT NULL,
    "dayType" "DayType" NOT NULL,
    "timeStart" VARCHAR(5) NOT NULL,
    "timeEnd" VARCHAR(5) NOT NULL,
    "intervalMin" INTEGER NOT NULL DEFAULT 8,
    "isPrimeTime" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_course_intervals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_course_holidays" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "date" DATE NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_course_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_schedule_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "weekdayFirstTee" VARCHAR(5) NOT NULL DEFAULT '06:00',
    "weekdayLastTee" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "weekdayBookingMode" "BookingMode" NOT NULL DEFAULT 'EIGHTEEN',
    "weekendFirstTee" VARCHAR(5) NOT NULL DEFAULT '06:00',
    "weekendLastTee" VARCHAR(5) NOT NULL DEFAULT '17:30',
    "weekendBookingMode" "BookingMode" NOT NULL DEFAULT 'EIGHTEEN',
    "twilightMode" "TwilightMode" NOT NULL DEFAULT 'FIXED',
    "twilightMinutesBeforeSunset" INTEGER NOT NULL DEFAULT 90,
    "twilightFixedDefault" VARCHAR(5) NOT NULL DEFAULT '16:00',
    "clubLatitude" DECIMAL(10,7),
    "clubLongitude" DECIMAL(10,7),
    "defaultBookingWindowDays" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_schedule_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_schedule_time_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scheduleId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5),
    "intervalMinutes" INTEGER NOT NULL DEFAULT 10,
    "isPrimeTime" BOOLEAN NOT NULL DEFAULT false,
    "applicableDays" "ApplicableDays" NOT NULL DEFAULT 'ALL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_schedule_time_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_schedule_seasons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scheduleId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "startDay" INTEGER NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "endDay" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "overrideFirstTee" VARCHAR(5),
    "overrideLastTee" VARCHAR(5),
    "overrideBookingWindow" INTEGER,
    "overrideTwilightTime" VARCHAR(5),
    "overrideTimePeriods" BOOLEAN NOT NULL DEFAULT false,
    "weekdayBookingMode" "BookingMode",
    "weekendBookingMode" "BookingMode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_schedule_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_season_time_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seasonId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5),
    "intervalMinutes" INTEGER NOT NULL DEFAULT 10,
    "isPrimeTime" BOOLEAN NOT NULL DEFAULT false,
    "applicableDays" "ApplicableDays" NOT NULL DEFAULT 'ALL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_season_time_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_schedule_special_days" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scheduleId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "startDate" VARCHAR(10) NOT NULL,
    "endDate" VARCHAR(10) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "type" "SpecialDayType" NOT NULL DEFAULT 'WEEKEND',
    "customFirstTee" VARCHAR(5),
    "customLastTee" VARCHAR(5),
    "customTimePeriods" BOOLEAN NOT NULL DEFAULT false,
    "bookingMode" "BookingMode",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_schedule_special_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_special_day_time_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "specialDayId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5),
    "intervalMinutes" INTEGER NOT NULL DEFAULT 10,
    "isPrimeTime" BOOLEAN NOT NULL DEFAULT false,
    "applicableDays" "ApplicableDays" NOT NULL DEFAULT 'ALL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_special_day_time_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tee_time_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "blockType" "BlockType" NOT NULL,
    "reason" VARCHAR(500),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" VARCHAR(100),
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tee_time_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_group_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "groupName" VARCHAR(255) NOT NULL,
    "eventDate" DATE NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "startFormat" "StartFormat" NOT NULL DEFAULT 'SEQUENTIAL',
    "totalPlayers" INTEGER NOT NULL,
    "status" "GroupBookingStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_group_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_group_players" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "groupBookingId" UUID NOT NULL,
    "playerType" "PlayerType" NOT NULL,
    "memberId" UUID,
    "guestName" VARCHAR(255),
    "guestEmail" VARCHAR(255),
    "guestPhone" VARCHAR(50),
    "handicap" INTEGER,
    "assignedFlight" INTEGER,
    "assignedPosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_group_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_lotteries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "lotteryDate" DATE NOT NULL,
    "lotteryType" "LotteryType" NOT NULL DEFAULT 'PRIME_TIME',
    "requestWindowStart" TIMESTAMP(3) NOT NULL,
    "requestWindowEnd" TIMESTAMP(3) NOT NULL,
    "drawTime" TIMESTAMP(3) NOT NULL,
    "timeRangeStart" VARCHAR(5) NOT NULL,
    "timeRangeEnd" VARCHAR(5) NOT NULL,
    "status" "LotteryStatus" NOT NULL DEFAULT 'DRAFT',
    "maxRequestsPerMember" INTEGER NOT NULL DEFAULT 1,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_lotteries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_lottery_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lotteryId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "preference1" VARCHAR(5) NOT NULL,
    "preference2" VARCHAR(5),
    "preference3" VARCHAR(5),
    "playerCount" INTEGER NOT NULL DEFAULT 1,
    "status" "LotteryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "assignedTime" VARCHAR(5),
    "drawOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_lottery_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_waitlists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "requestedDate" DATE NOT NULL,
    "timeRangeStart" VARCHAR(5) NOT NULL,
    "timeRangeEnd" VARCHAR(5) NOT NULL,
    "memberId" UUID,
    "requesterName" VARCHAR(255) NOT NULL,
    "requesterPhone" VARCHAR(50) NOT NULL,
    "requesterEmail" VARCHAR(255),
    "playerCount" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "GolfWaitlistStatus" NOT NULL DEFAULT 'PENDING',
    "notifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "bookedTeeTimeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_waitlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_rate_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_rate_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_fees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rateConfigId" UUID NOT NULL,
    "playerType" VARCHAR(20) NOT NULL,
    "holes" INTEGER NOT NULL,
    "timeCategory" VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    "amount" DECIMAL(10,2) NOT NULL,
    "taxType" VARCHAR(10) NOT NULL DEFAULT 'ADD',
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "green_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rateConfigId" UUID NOT NULL,
    "cartType" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "taxType" VARCHAR(10) NOT NULL DEFAULT 'ADD',
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caddy_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rateConfigId" UUID NOT NULL,
    "caddyType" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "taxType" VARCHAR(10) NOT NULL DEFAULT 'NONE',
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caddy_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caddies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "caddyNumber" VARCHAR(10) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50),
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caddies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tee_times" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "teeTimeNumber" VARCHAR(30) NOT NULL,
    "courseId" UUID NOT NULL,
    "teeDate" DATE NOT NULL,
    "teeTime" VARCHAR(5) NOT NULL,
    "holes" INTEGER NOT NULL DEFAULT 18,
    "startingHole" INTEGER NOT NULL DEFAULT 1,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "internalNotes" TEXT,
    "cancelReason" VARCHAR(500),
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tee_times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tee_time_players" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teeTimeId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "playerType" "PlayerType" NOT NULL,
    "memberId" UUID,
    "dependentId" UUID,
    "guestName" VARCHAR(255),
    "guestEmail" VARCHAR(255),
    "guestPhone" VARCHAR(50),
    "cartType" "CartType" NOT NULL DEFAULT 'WALKING',
    "sharedWithPosition" INTEGER,
    "caddyId" UUID,
    "caddyRequest" VARCHAR(50),
    "cartRequest" VARCHAR(50),
    "cartId" UUID,
    "rentalRequest" VARCHAR(50),
    "cartStatus" "RentalStatus" NOT NULL DEFAULT 'NONE',
    "caddyStatus" "RentalStatus" NOT NULL DEFAULT 'NONE',
    "greenFee" DECIMAL(12,2),
    "cartFee" DECIMAL(12,2),
    "caddyFee" DECIMAL(12,2),
    "totalFee" DECIMAL(12,2),
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tee_time_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_drafts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teeTimeId" UUID NOT NULL,
    "draftData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "cart_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teeTimePlayerId" UUID NOT NULL,
    "type" "LineItemType" NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "baseAmount" DECIMAL(10,2) NOT NULL,
    "taxType" "TaxType" NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "paidViaId" UUID,
    "reference" VARCHAR(100),
    "productId" UUID,
    "variantId" UUID,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isTransferred" BOOLEAN NOT NULL DEFAULT false,
    "transferredFromPlayerId" UUID,
    "transferredToPlayerId" UUID,
    "transferredAt" TIMESTAMP(3),
    "originalPlayerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_check_in_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teeTimePlayerId" UUID NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInBy" UUID NOT NULL,
    "settledAt" TIMESTAMP(3),
    "settledViaId" UUID,
    "settledBy" UUID,
    "totalPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_check_in_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_in_payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(30) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "requiresRef" BOOLEAN NOT NULL DEFAULT false,
    "opensPOS" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_in_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "teeTimeId" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethodId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidBy" TEXT NOT NULL,
    "voidedAt" TIMESTAMP(3),
    "voidedBy" TEXT,
    "voidReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "refundedBy" TEXT,
    "refundAmount" DECIMAL(10,2),
    "refundReason" TEXT,
    "allocatedToRevenue" BOOLEAN NOT NULL DEFAULT false,
    "allocatedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "isBatchPayment" BOOLEAN NOT NULL DEFAULT false,
    "batchPlayerIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paidByMemberId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transactionId" UUID NOT NULL,
    "lineItemId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "applicationNumber" VARCHAR(30) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "membershipTypeId" UUID NOT NULL,
    "sponsorId" UUID,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" VARCHAR(255),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" VARCHAR(255),
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" VARCHAR(255),
    "withdrawnAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "convertedToMemberId" UUID,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "leadNumber" VARCHAR(20) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "source" VARCHAR(100) NOT NULL,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "interestedIn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assignedToId" UUID,
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3),
    "notes" TEXT,
    "convertedToMemberId" UUID,
    "convertedAt" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID,
    "memberId" UUID,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "avatarUrl" VARCHAR(500),
    "phone" VARCHAR(50),
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" VARCHAR(45),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "refreshToken" VARCHAR(500),
    "resetToken" VARCHAR(255),
    "resetTokenExp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "userId" UUID,
    "action" VARCHAR(50) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" UUID,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "channel" VARCHAR(20) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proshop_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "defaultTaxRate" DECIMAL(5,2) NOT NULL DEFAULT 7,
    "defaultTaxType" "TaxType" NOT NULL DEFAULT 'ADD',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proshop_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proshop_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(1000),
    "sku" VARCHAR(50),
    "price" DECIMAL(10,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 7,
    "taxType" "TaxType" NOT NULL DEFAULT 'ADD',
    "useCategoryDefaults" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isQuickAdd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proshop_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proshop_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "sku" VARCHAR(50),
    "priceAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proshop_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "starter_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "teeTimeId" UUID NOT NULL,
    "ticketNumber" VARCHAR(30) NOT NULL,
    "teeTimeValue" TIMESTAMP(3) NOT NULL,
    "course" VARCHAR(100) NOT NULL,
    "startingHole" INTEGER NOT NULL,
    "players" JSONB NOT NULL,
    "cartNumber" VARCHAR(20),
    "caddyName" VARCHAR(100),
    "rentalItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialRequests" TEXT,
    "qrCodeData" VARCHAR(500),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" UUID NOT NULL,
    "printedAt" TIMESTAMP(3),
    "reprintCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "starter_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "itemType" "LineItemType" NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "taxType" "TaxType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50),
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "scope" "DiscountScope" NOT NULL,
    "minimumAmount" DECIMAL(10,2),
    "maximumDiscount" DECIMAL(10,2),
    "membershipTypeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "playerTypes" "PlayerType"[] DEFAULT ARRAY[]::"PlayerType"[],
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvalThreshold" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applied_discounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "discountId" UUID NOT NULL,
    "lineItemId" UUID,
    "transactionId" UUID,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "calculatedAmount" DECIMAL(10,2) NOT NULL,
    "appliedBy" UUID NOT NULL,
    "approvedBy" UUID,
    "approvalNote" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applied_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "parentId" UUID,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "color" VARCHAR(7),
    "iconName" VARCHAR(50),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(1000),
    "sku" VARCHAR(50),
    "productType" "ProductType" NOT NULL DEFAULT 'SIMPLE',
    "basePrice" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2),
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxType" "TaxType" NOT NULL DEFAULT 'ADD',
    "durationMinutes" INTEGER,
    "bufferMinutes" INTEGER DEFAULT 0,
    "requiredCapabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "stockQuantity" INTEGER,
    "lowStockThreshold" INTEGER,
    "imageUrl" VARCHAR(500),
    "thumbnailUrl" VARCHAR(500),
    "sortPriority" INTEGER NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sku" VARCHAR(50),
    "priceAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "stockQuantity" INTEGER,
    "imageUrl" VARCHAR(500),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifier_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "selectionType" "ModifierSelectionType" NOT NULL DEFAULT 'SINGLE',
    "minSelections" INTEGER NOT NULL DEFAULT 0,
    "maxSelections" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modifier_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "groupId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "priceAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_modifier_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "modifierGroupId" UUID NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_modifier_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_outlets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20),
    "outletType" VARCHAR(50),
    "description" VARCHAR(500),
    "location" VARCHAR(200),
    "templateId" UUID,
    "customConfig" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_outlets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlet_product_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "outletId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "categoryId" UUID,
    "displayName" VARCHAR(100),
    "buttonColor" VARCHAR(7),
    "sortPriority" INTEGER,
    "gridPosition" JSONB,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "visibilityRules" JSONB NOT NULL DEFAULT '{}',
    "isQuickKey" BOOLEAN NOT NULL DEFAULT false,
    "quickKeyPosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outlet_product_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlet_category_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "outletId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "colorOverride" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outlet_category_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlet_grid_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "outletId" UUID NOT NULL,
    "gridColumns" INTEGER NOT NULL DEFAULT 6,
    "gridRows" INTEGER NOT NULL DEFAULT 4,
    "tileSize" "TileSize" NOT NULL DEFAULT 'MEDIUM',
    "showImages" BOOLEAN NOT NULL DEFAULT true,
    "showPrices" BOOLEAN NOT NULL DEFAULT true,
    "categoryStyle" "CategoryDisplayStyle" NOT NULL DEFAULT 'TABS',
    "showAllCategory" BOOLEAN NOT NULL DEFAULT true,
    "quickKeysEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quickKeysCount" INTEGER NOT NULL DEFAULT 8,
    "quickKeysPosition" "QuickKeysPosition" NOT NULL DEFAULT 'TOP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outlet_grid_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sales_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "outletId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "quantitySold" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "salesByHour" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_sales_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_product_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "staffId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "outletId" UUID NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_product_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_suggestion_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "outletId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "suggestionCount" INTEGER NOT NULL DEFAULT 6,
    "position" "SuggestionPosition" NOT NULL DEFAULT 'TOP_ROW',
    "timeOfDayWeight" INTEGER NOT NULL DEFAULT 40,
    "salesVelocityWeight" INTEGER NOT NULL DEFAULT 35,
    "staffHistoryWeight" INTEGER NOT NULL DEFAULT 25,
    "refreshIntervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smart_suggestion_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_drawers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(200),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_drawers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_drawer_shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cashDrawerId" UUID NOT NULL,
    "status" "CashDrawerStatus" NOT NULL DEFAULT 'OPEN',
    "openedBy" UUID NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openingFloat" DECIMAL(12,2) NOT NULL,
    "openingDenominations" JSONB,
    "closedBy" UUID,
    "closedAt" TIMESTAMP(3),
    "closingCount" DECIMAL(12,2),
    "closingDenominations" JSONB,
    "expectedCash" DECIMAL(12,2),
    "actualCash" DECIMAL(12,2),
    "variance" DECIMAL(12,2),
    "varianceNote" VARCHAR(500),
    "totalSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalRefunds" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalPaidIn" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalPaidOut" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDrops" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_drawer_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shiftId" UUID NOT NULL,
    "type" "CashMovementType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" VARCHAR(500),
    "reference" VARCHAR(100),
    "reason" VARCHAR(200),
    "approvedBy" UUID,
    "transactionId" UUID,
    "performedBy" UUID NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_settlements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "businessDate" DATE NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'OPEN',
    "totalGrossSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDiscounts" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalNetSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalTax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalServiceCharge" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCard" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalMemberAccount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalOther" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalRefunds" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalVoids" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expectedCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actualCash" DECIMAL(12,2),
    "cashVariance" DECIMAL(12,2),
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "refundCount" INTEGER NOT NULL DEFAULT 0,
    "voidCount" INTEGER NOT NULL DEFAULT 0,
    "openedBy" UUID,
    "openedAt" TIMESTAMP(3),
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "closedBy" UUID,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlement_exceptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "settlementId" UUID NOT NULL,
    "type" "ExceptionType" NOT NULL,
    "severity" "ExceptionSeverity" NOT NULL DEFAULT 'MEDIUM',
    "resolution" "ExceptionResolution" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "transactionId" UUID,
    "shiftId" UUID,
    "lineItemId" UUID,
    "resolvedBy" UUID,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settlement_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "outletType" VARCHAR(50) NOT NULL,
    "toolbarConfig" JSONB NOT NULL DEFAULT '{}',
    "actionBarConfig" JSONB NOT NULL DEFAULT '{}',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_outlet_role_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "outletId" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "buttonOverrides" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_outlet_role_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "minimum_spend_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "membershipTypes" TEXT[],
    "minimumAmount" DECIMAL(12,2) NOT NULL,
    "period" "MinimumSpendPeriod" NOT NULL DEFAULT 'QUARTERLY',
    "includeFoodBeverage" BOOLEAN NOT NULL DEFAULT true,
    "includeGolf" BOOLEAN NOT NULL DEFAULT true,
    "includeSpa" BOOLEAN NOT NULL DEFAULT false,
    "includeRetail" BOOLEAN NOT NULL DEFAULT false,
    "includeEvents" BOOLEAN NOT NULL DEFAULT false,
    "includedCategories" TEXT[],
    "excludedCategories" TEXT[],
    "defaultShortfallAction" "ShortfallAction" NOT NULL DEFAULT 'CHARGE_DIFFERENCE',
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "allowPartialCredit" BOOLEAN NOT NULL DEFAULT false,
    "notifyAtPercent" INTEGER[] DEFAULT ARRAY[50, 75, 90]::INTEGER[],
    "notifyDaysBeforeEnd" INTEGER[] DEFAULT ARRAY[30, 14, 7]::INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "minimum_spend_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_minimum_spends" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "requirementId" UUID NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "periodLabel" VARCHAR(50) NOT NULL,
    "requiredAmount" DECIMAL(12,2) NOT NULL,
    "currentSpend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "projectedSpend" DECIMAL(12,2),
    "shortfallAmount" DECIMAL(12,2),
    "carryForwardAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "MemberSpendStatus" NOT NULL DEFAULT 'ON_TRACK',
    "isExempt" BOOLEAN NOT NULL DEFAULT false,
    "exemptReason" TEXT,
    "exemptBy" UUID,
    "exemptAt" TIMESTAMP(3),
    "shortfallAction" "ShortfallAction",
    "shortfallResolvedBy" UUID,
    "shortfallResolvedAt" TIMESTAMP(3),
    "shortfallNote" TEXT,
    "shortfallInvoiceId" UUID,
    "spendByCategory" JSONB,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_minimum_spends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "relationship" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "pin" VARCHAR(60) NOT NULL,
    "pinAttempts" INTEGER NOT NULL DEFAULT 0,
    "pinLockedUntil" TIMESTAMP(3),
    "status" "SubAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "permissions" "SubAccountPermission"[] DEFAULT ARRAY['ALL']::"SubAccountPermission"[],
    "dailyLimit" DECIMAL(12,2),
    "weeklyLimit" DECIMAL(12,2),
    "monthlyLimit" DECIMAL(12,2),
    "perTransactionLimit" DECIMAL(12,2),
    "dailySpend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "weeklySpend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "monthlySpend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastResetDaily" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastResetWeekly" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastResetMonthly" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifyPrimaryOnUse" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnLimitReached" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_account_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "subAccountId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "category" "SubAccountPermission" NOT NULL,
    "paymentTransactionId" UUID,
    "lineItemId" UUID,
    "teeTimeId" UUID,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" UUID,
    "locationName" VARCHAR(100),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_account_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stored_payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "stripeCustomerId" VARCHAR(255),
    "stripePaymentMethodId" VARCHAR(255) NOT NULL,
    "type" "StoredPaymentMethodType" NOT NULL DEFAULT 'CARD',
    "brand" VARCHAR(50) NOT NULL,
    "last4" VARCHAR(4) NOT NULL,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "cardholderName" VARCHAR(200),
    "status" "StoredPaymentMethodStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isAutoPayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastFailureReason" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stored_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_pay_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "paymentMethodId" UUID NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule" "AutoPaySchedule" NOT NULL DEFAULT 'INVOICE_DUE',
    "paymentDayOfMonth" INTEGER,
    "maxPaymentAmount" DECIMAL(12,2),
    "monthlyMaxAmount" DECIMAL(12,2),
    "requireApprovalAbove" DECIMAL(12,2),
    "payDuesOnly" BOOLEAN NOT NULL DEFAULT false,
    "excludeCategories" TEXT[],
    "notifyBeforePayment" BOOLEAN NOT NULL DEFAULT true,
    "notifyDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "notifyOnSuccess" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "maxRetryAttempts" INTEGER NOT NULL DEFAULT 3,
    "retryIntervalDays" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_pay_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_pay_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "paymentMethodId" UUID NOT NULL,
    "invoiceId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "AutoPayAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" VARCHAR(255),
    "stripeChargeId" VARCHAR(255),
    "processedAt" TIMESTAMP(3),
    "succeededAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureCode" VARCHAR(100),
    "failureMessage" VARCHAR(500),
    "nextRetryAt" TIMESTAMP(3),
    "isManualRetry" BOOLEAN NOT NULL DEFAULT false,
    "paymentTransactionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_pay_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "creditNoteNumber" VARCHAR(30) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "CreditNoteType" NOT NULL,
    "reason" "CreditNoteReason" NOT NULL,
    "reasonDetail" TEXT,
    "sourceInvoiceId" UUID,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "appliedToBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "refundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "CreditNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" UUID,
    "approvedAt" TIMESTAMP(3),
    "internalNotes" TEXT,
    "memberVisibleNotes" TEXT,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "voidedAt" TIMESTAMP(3),
    "voidedBy" UUID,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note_line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creditNoteId" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "lineTotal" DECIMAL(12,2) NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT false,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "chargeTypeId" UUID,

    CONSTRAINT "credit_note_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creditNoteId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "amountApplied" DECIMAL(12,2) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedBy" UUID NOT NULL,

    CONSTRAINT "credit_note_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "invoiceId" UUID,
    "actionType" "CollectionActionType" NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "templateUsed" VARCHAR(100),
    "sentVia" VARCHAR(20),
    "result" "CollectionResult",
    "resultNotes" TEXT,
    "resultAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedTo" UUID,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "color" VARCHAR(7),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interest_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_interests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "memberId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "interestLevel" SMALLINT NOT NULL DEFAULT 50,
    "source" "InterestSource" NOT NULL DEFAULT 'EXPLICIT',
    "lastActivityAt" TIMESTAMP(3),
    "activityCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependent_interests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dependentId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "interestLevel" SMALLINT NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dependent_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_communication_prefs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "memberId" UUID NOT NULL,
    "emailPromotions" BOOLEAN NOT NULL DEFAULT true,
    "smsPromotions" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_communication_prefs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "clubs"("slug");

-- CreateIndex
CREATE INDEX "clubs_slug_idx" ON "clubs"("slug");

-- CreateIndex
CREATE INDEX "clubs_isActive_idx" ON "clubs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "club_golf_settings_clubId_key" ON "club_golf_settings"("clubId");

-- CreateIndex
CREATE INDEX "club_golf_settings_clubId_idx" ON "club_golf_settings"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "club_billing_settings_clubId_key" ON "club_billing_settings"("clubId");

-- CreateIndex
CREATE INDEX "club_billing_settings_clubId_idx" ON "club_billing_settings"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "member_billing_profiles_memberId_key" ON "member_billing_profiles"("memberId");

-- CreateIndex
CREATE INDEX "member_billing_profiles_memberId_idx" ON "member_billing_profiles"("memberId");

-- CreateIndex
CREATE INDEX "member_billing_profiles_nextBillingDate_idx" ON "member_billing_profiles"("nextBillingDate");

-- CreateIndex
CREATE INDEX "membership_types_clubId_idx" ON "membership_types"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "membership_types_clubId_code_key" ON "membership_types"("clubId", "code");

-- CreateIndex
CREATE INDEX "membership_tiers_membershipTypeId_idx" ON "membership_tiers"("membershipTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "membership_tiers_membershipTypeId_code_key" ON "membership_tiers"("membershipTypeId", "code");

-- CreateIndex
CREATE INDEX "households_clubId_idx" ON "households"("clubId");

-- CreateIndex
CREATE INDEX "members_clubId_idx" ON "members"("clubId");

-- CreateIndex
CREATE INDEX "members_clubId_status_idx" ON "members"("clubId", "status");

-- CreateIndex
CREATE INDEX "members_membershipTypeId_idx" ON "members"("membershipTypeId");

-- CreateIndex
CREATE INDEX "members_householdId_idx" ON "members"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "members_clubId_memberId_key" ON "members"("clubId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "members_clubId_email_key" ON "members"("clubId", "email");

-- CreateIndex
CREATE INDEX "credit_limit_overrides_memberId_idx" ON "credit_limit_overrides"("memberId");

-- CreateIndex
CREATE INDEX "credit_limit_overrides_memberId_isActive_idx" ON "credit_limit_overrides"("memberId", "isActive");

-- CreateIndex
CREATE INDEX "dependents_memberId_idx" ON "dependents"("memberId");

-- CreateIndex
CREATE INDEX "charge_types_clubId_idx" ON "charge_types"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "charge_types_clubId_code_key" ON "charge_types"("clubId", "code");

-- CreateIndex
CREATE INDEX "invoices_clubId_idx" ON "invoices"("clubId");

-- CreateIndex
CREATE INDEX "invoices_clubId_status_idx" ON "invoices"("clubId", "status");

-- CreateIndex
CREATE INDEX "invoices_memberId_idx" ON "invoices"("memberId");

-- CreateIndex
CREATE INDEX "invoices_cityLedgerId_idx" ON "invoices"("cityLedgerId");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_clubId_invoiceNumber_key" ON "invoices"("clubId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoiceId_idx" ON "invoice_line_items"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_clubId_idx" ON "payments"("clubId");

-- CreateIndex
CREATE INDEX "payments_memberId_idx" ON "payments"("memberId");

-- CreateIndex
CREATE INDEX "payments_cityLedgerId_idx" ON "payments"("cityLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_clubId_receiptNumber_key" ON "payments"("clubId", "receiptNumber");

-- CreateIndex
CREATE INDEX "payment_allocations_paymentId_idx" ON "payment_allocations"("paymentId");

-- CreateIndex
CREATE INDEX "payment_allocations_invoiceId_idx" ON "payment_allocations"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocations_paymentId_invoiceId_key" ON "payment_allocations"("paymentId", "invoiceId");

-- CreateIndex
CREATE INDEX "city_ledgers_clubId_idx" ON "city_ledgers"("clubId");

-- CreateIndex
CREATE INDEX "city_ledgers_clubId_status_idx" ON "city_ledgers"("clubId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "city_ledgers_clubId_accountNumber_key" ON "city_ledgers"("clubId", "accountNumber");

-- CreateIndex
CREATE INDEX "facilities_clubId_idx" ON "facilities"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_clubId_code_key" ON "facilities"("clubId", "code");

-- CreateIndex
CREATE INDEX "resources_facilityId_idx" ON "resources"("facilityId");

-- CreateIndex
CREATE INDEX "resources_clubId_idx" ON "resources"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "resources_facilityId_code_key" ON "resources"("facilityId", "code");

-- CreateIndex
CREATE INDEX "bookings_clubId_idx" ON "bookings"("clubId");

-- CreateIndex
CREATE INDEX "bookings_memberId_idx" ON "bookings"("memberId");

-- CreateIndex
CREATE INDEX "bookings_facilityId_idx" ON "bookings"("facilityId");

-- CreateIndex
CREATE INDEX "bookings_resourceId_idx" ON "bookings"("resourceId");

-- CreateIndex
CREATE INDEX "bookings_serviceId_idx" ON "bookings"("serviceId");

-- CreateIndex
CREATE INDEX "bookings_staffId_idx" ON "bookings"("staffId");

-- CreateIndex
CREATE INDEX "bookings_clubId_startTime_idx" ON "bookings"("clubId", "startTime");

-- CreateIndex
CREATE INDEX "bookings_staffId_startTime_idx" ON "bookings"("staffId", "startTime");

-- CreateIndex
CREATE INDEX "bookings_startTime_idx" ON "bookings"("startTime");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_clubId_bookingNumber_key" ON "bookings"("clubId", "bookingNumber");

-- CreateIndex
CREATE INDEX "guests_bookingId_idx" ON "guests"("bookingId");

-- CreateIndex
CREATE INDEX "guests_teeTimePlayerId_idx" ON "guests"("teeTimePlayerId");

-- CreateIndex
CREATE INDEX "guests_invitedById_idx" ON "guests"("invitedById");

-- CreateIndex
CREATE UNIQUE INDEX "staff_userId_key" ON "staff"("userId");

-- CreateIndex
CREATE INDEX "staff_clubId_idx" ON "staff"("clubId");

-- CreateIndex
CREATE INDEX "staff_userId_idx" ON "staff"("userId");

-- CreateIndex
CREATE INDEX "staff_capabilities_staffId_idx" ON "staff_capabilities"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_capabilities_staffId_capability_key" ON "staff_capabilities"("staffId", "capability");

-- CreateIndex
CREATE INDEX "staff_certifications_staffId_idx" ON "staff_certifications"("staffId");

-- CreateIndex
CREATE INDEX "services_clubId_idx" ON "services"("clubId");

-- CreateIndex
CREATE INDEX "services_category_idx" ON "services"("category");

-- CreateIndex
CREATE INDEX "service_variations_serviceId_idx" ON "service_variations"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_bookingId_key" ON "waitlist_entries"("bookingId");

-- CreateIndex
CREATE INDEX "waitlist_entries_clubId_facilityId_preferredDate_idx" ON "waitlist_entries"("clubId", "facilityId", "preferredDate");

-- CreateIndex
CREATE INDEX "waitlist_entries_clubId_serviceId_preferredDate_idx" ON "waitlist_entries"("clubId", "serviceId", "preferredDate");

-- CreateIndex
CREATE INDEX "waitlist_entries_memberId_idx" ON "waitlist_entries"("memberId");

-- CreateIndex
CREATE INDEX "consumables_clubId_idx" ON "consumables"("clubId");

-- CreateIndex
CREATE INDEX "consumable_usage_consumableId_idx" ON "consumable_usage"("consumableId");

-- CreateIndex
CREATE INDEX "consumable_usage_bookingId_idx" ON "consumable_usage"("bookingId");

-- CreateIndex
CREATE INDEX "golf_courses_clubId_idx" ON "golf_courses"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "golf_courses_clubId_code_key" ON "golf_courses"("clubId", "code");

-- CreateIndex
CREATE INDEX "green_fee_rates_courseId_idx" ON "green_fee_rates"("courseId");

-- CreateIndex
CREATE INDEX "golf_course_schedules_courseId_idx" ON "golf_course_schedules"("courseId");

-- CreateIndex
CREATE INDEX "golf_course_schedules_courseId_startDate_endDate_idx" ON "golf_course_schedules"("courseId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "golf_course_intervals_scheduleId_idx" ON "golf_course_intervals"("scheduleId");

-- CreateIndex
CREATE INDEX "golf_course_holidays_courseId_idx" ON "golf_course_holidays"("courseId");

-- CreateIndex
CREATE INDEX "golf_course_holidays_courseId_date_idx" ON "golf_course_holidays"("courseId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "golf_schedule_configs_courseId_key" ON "golf_schedule_configs"("courseId");

-- CreateIndex
CREATE INDEX "golf_schedule_configs_courseId_idx" ON "golf_schedule_configs"("courseId");

-- CreateIndex
CREATE INDEX "golf_schedule_time_periods_scheduleId_idx" ON "golf_schedule_time_periods"("scheduleId");

-- CreateIndex
CREATE INDEX "golf_schedule_seasons_scheduleId_idx" ON "golf_schedule_seasons"("scheduleId");

-- CreateIndex
CREATE INDEX "golf_season_time_periods_seasonId_idx" ON "golf_season_time_periods"("seasonId");

-- CreateIndex
CREATE INDEX "golf_schedule_special_days_scheduleId_idx" ON "golf_schedule_special_days"("scheduleId");

-- CreateIndex
CREATE INDEX "golf_special_day_time_periods_specialDayId_idx" ON "golf_special_day_time_periods"("specialDayId");

-- CreateIndex
CREATE INDEX "tee_time_blocks_courseId_idx" ON "tee_time_blocks"("courseId");

-- CreateIndex
CREATE INDEX "tee_time_blocks_courseId_startTime_endTime_idx" ON "tee_time_blocks"("courseId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "golf_group_bookings_clubId_idx" ON "golf_group_bookings"("clubId");

-- CreateIndex
CREATE INDEX "golf_group_bookings_courseId_eventDate_idx" ON "golf_group_bookings"("courseId", "eventDate");

-- CreateIndex
CREATE INDEX "golf_group_players_groupBookingId_idx" ON "golf_group_players"("groupBookingId");

-- CreateIndex
CREATE INDEX "golf_lotteries_clubId_idx" ON "golf_lotteries"("clubId");

-- CreateIndex
CREATE INDEX "golf_lotteries_courseId_lotteryDate_idx" ON "golf_lotteries"("courseId", "lotteryDate");

-- CreateIndex
CREATE INDEX "golf_lottery_requests_lotteryId_idx" ON "golf_lottery_requests"("lotteryId");

-- CreateIndex
CREATE INDEX "golf_lottery_requests_memberId_idx" ON "golf_lottery_requests"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "golf_lottery_requests_lotteryId_memberId_key" ON "golf_lottery_requests"("lotteryId", "memberId");

-- CreateIndex
CREATE INDEX "golf_waitlists_clubId_idx" ON "golf_waitlists"("clubId");

-- CreateIndex
CREATE INDEX "golf_waitlists_courseId_requestedDate_idx" ON "golf_waitlists"("courseId", "requestedDate");

-- CreateIndex
CREATE INDEX "golf_waitlists_status_idx" ON "golf_waitlists"("status");

-- CreateIndex
CREATE INDEX "golf_rate_configs_clubId_idx" ON "golf_rate_configs"("clubId");

-- CreateIndex
CREATE INDEX "golf_rate_configs_courseId_idx" ON "golf_rate_configs"("courseId");

-- CreateIndex
CREATE INDEX "golf_rate_configs_clubId_isActive_idx" ON "golf_rate_configs"("clubId", "isActive");

-- CreateIndex
CREATE INDEX "golf_rate_configs_courseId_effectiveFrom_effectiveTo_idx" ON "golf_rate_configs"("courseId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "green_fees_rateConfigId_idx" ON "green_fees"("rateConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "green_fees_rateConfigId_playerType_holes_timeCategory_key" ON "green_fees"("rateConfigId", "playerType", "holes", "timeCategory");

-- CreateIndex
CREATE INDEX "cart_rates_rateConfigId_idx" ON "cart_rates"("rateConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_rates_rateConfigId_cartType_key" ON "cart_rates"("rateConfigId", "cartType");

-- CreateIndex
CREATE INDEX "caddy_rates_rateConfigId_idx" ON "caddy_rates"("rateConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "caddy_rates_rateConfigId_caddyType_key" ON "caddy_rates"("rateConfigId", "caddyType");

-- CreateIndex
CREATE INDEX "caddies_clubId_idx" ON "caddies"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "caddies_clubId_caddyNumber_key" ON "caddies"("clubId", "caddyNumber");

-- CreateIndex
CREATE INDEX "tee_times_courseId_teeDate_teeTime_idx" ON "tee_times"("courseId", "teeDate", "teeTime");

-- CreateIndex
CREATE INDEX "tee_times_clubId_idx" ON "tee_times"("clubId");

-- CreateIndex
CREATE INDEX "tee_times_courseId_idx" ON "tee_times"("courseId");

-- CreateIndex
CREATE INDEX "tee_times_teeDate_idx" ON "tee_times"("teeDate");

-- CreateIndex
CREATE INDEX "tee_times_status_idx" ON "tee_times"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tee_times_clubId_teeTimeNumber_key" ON "tee_times"("clubId", "teeTimeNumber");

-- CreateIndex
CREATE INDEX "tee_time_players_teeTimeId_idx" ON "tee_time_players"("teeTimeId");

-- CreateIndex
CREATE INDEX "tee_time_players_memberId_idx" ON "tee_time_players"("memberId");

-- CreateIndex
CREATE INDEX "tee_time_players_dependentId_idx" ON "tee_time_players"("dependentId");

-- CreateIndex
CREATE UNIQUE INDEX "tee_time_players_teeTimeId_position_key" ON "tee_time_players"("teeTimeId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "cart_drafts_teeTimeId_key" ON "cart_drafts"("teeTimeId");

-- CreateIndex
CREATE INDEX "cart_drafts_teeTimeId_idx" ON "cart_drafts"("teeTimeId");

-- CreateIndex
CREATE INDEX "booking_line_items_teeTimePlayerId_idx" ON "booking_line_items"("teeTimePlayerId");

-- CreateIndex
CREATE INDEX "booking_line_items_teeTimePlayerId_isPaid_idx" ON "booking_line_items"("teeTimePlayerId", "isPaid");

-- CreateIndex
CREATE INDEX "booking_line_items_isTransferred_idx" ON "booking_line_items"("isTransferred");

-- CreateIndex
CREATE UNIQUE INDEX "player_check_in_records_teeTimePlayerId_key" ON "player_check_in_records"("teeTimePlayerId");

-- CreateIndex
CREATE INDEX "player_check_in_records_teeTimePlayerId_idx" ON "player_check_in_records"("teeTimePlayerId");

-- CreateIndex
CREATE INDEX "check_in_payment_methods_clubId_idx" ON "check_in_payment_methods"("clubId");

-- CreateIndex
CREATE INDEX "check_in_payment_methods_clubId_isEnabled_idx" ON "check_in_payment_methods"("clubId", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_transactionNumber_key" ON "payment_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "payment_transactions_teeTimeId_idx" ON "payment_transactions"("teeTimeId");

-- CreateIndex
CREATE INDEX "payment_transactions_clubId_paidAt_idx" ON "payment_transactions"("clubId", "paidAt");

-- CreateIndex
CREATE INDEX "payment_transactions_transactionNumber_idx" ON "payment_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "payment_transactions_paidByMemberId_idx" ON "payment_transactions"("paidByMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_line_items_transactionId_lineItemId_key" ON "transaction_line_items"("transactionId", "lineItemId");

-- CreateIndex
CREATE INDEX "membership_applications_clubId_idx" ON "membership_applications"("clubId");

-- CreateIndex
CREATE INDEX "membership_applications_clubId_status_idx" ON "membership_applications"("clubId", "status");

-- CreateIndex
CREATE INDEX "membership_applications_sponsorId_idx" ON "membership_applications"("sponsorId");

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_clubId_applicationNumber_key" ON "membership_applications"("clubId", "applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_clubId_email_key" ON "membership_applications"("clubId", "email");

-- CreateIndex
CREATE INDEX "leads_clubId_idx" ON "leads"("clubId");

-- CreateIndex
CREATE INDEX "leads_clubId_stage_idx" ON "leads"("clubId", "stage");

-- CreateIndex
CREATE INDEX "leads_assignedToId_idx" ON "leads"("assignedToId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_clubId_leadNumber_key" ON "leads"("clubId", "leadNumber");

-- CreateIndex
CREATE UNIQUE INDEX "leads_clubId_email_key" ON "leads"("clubId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_memberId_key" ON "users"("memberId");

-- CreateIndex
CREATE INDEX "users_clubId_idx" ON "users"("clubId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "users_clubId_email_key" ON "users"("clubId", "email");

-- CreateIndex
CREATE INDEX "audit_logs_clubId_idx" ON "audit_logs"("clubId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_clubId_idx" ON "notifications"("clubId");

-- CreateIndex
CREATE INDEX "notifications_memberId_idx" ON "notifications"("memberId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_readAt_idx" ON "notifications"("readAt");

-- CreateIndex
CREATE INDEX "proshop_categories_clubId_idx" ON "proshop_categories"("clubId");

-- CreateIndex
CREATE INDEX "proshop_categories_clubId_isActive_idx" ON "proshop_categories"("clubId", "isActive");

-- CreateIndex
CREATE INDEX "proshop_products_clubId_categoryId_idx" ON "proshop_products"("clubId", "categoryId");

-- CreateIndex
CREATE INDEX "proshop_products_clubId_idx" ON "proshop_products"("clubId");

-- CreateIndex
CREATE INDEX "proshop_products_clubId_isActive_idx" ON "proshop_products"("clubId", "isActive");

-- CreateIndex
CREATE INDEX "proshop_products_clubId_isQuickAdd_idx" ON "proshop_products"("clubId", "isQuickAdd");

-- CreateIndex
CREATE UNIQUE INDEX "proshop_products_clubId_sku_key" ON "proshop_products"("clubId", "sku");

-- CreateIndex
CREATE INDEX "proshop_variants_productId_idx" ON "proshop_variants"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "starter_tickets_ticketNumber_key" ON "starter_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "starter_tickets_clubId_idx" ON "starter_tickets"("clubId");

-- CreateIndex
CREATE INDEX "starter_tickets_teeTimeId_idx" ON "starter_tickets"("teeTimeId");

-- CreateIndex
CREATE INDEX "starter_tickets_ticketNumber_idx" ON "starter_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "tax_overrides_clubId_idx" ON "tax_overrides"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_overrides_clubId_itemType_key" ON "tax_overrides"("clubId", "itemType");

-- CreateIndex
CREATE INDEX "discounts_clubId_idx" ON "discounts"("clubId");

-- CreateIndex
CREATE INDEX "discounts_clubId_isActive_idx" ON "discounts"("clubId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "discounts_clubId_code_key" ON "discounts"("clubId", "code");

-- CreateIndex
CREATE INDEX "applied_discounts_discountId_idx" ON "applied_discounts"("discountId");

-- CreateIndex
CREATE INDEX "applied_discounts_lineItemId_idx" ON "applied_discounts"("lineItemId");

-- CreateIndex
CREATE INDEX "applied_discounts_transactionId_idx" ON "applied_discounts"("transactionId");

-- CreateIndex
CREATE INDEX "product_categories_clubId_idx" ON "product_categories"("clubId");

-- CreateIndex
CREATE INDEX "product_categories_clubId_parentId_idx" ON "product_categories"("clubId", "parentId");

-- CreateIndex
CREATE INDEX "product_categories_clubId_isActive_idx" ON "product_categories"("clubId", "isActive");

-- CreateIndex
CREATE INDEX "products_clubId_idx" ON "products"("clubId");

-- CreateIndex
CREATE INDEX "products_clubId_categoryId_idx" ON "products"("clubId", "categoryId");

-- CreateIndex
CREATE INDEX "products_clubId_isActive_idx" ON "products"("clubId", "isActive");

-- CreateIndex
CREATE INDEX "products_clubId_productType_idx" ON "products"("clubId", "productType");

-- CreateIndex
CREATE UNIQUE INDEX "products_clubId_sku_key" ON "products"("clubId", "sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_sku_key" ON "product_variants"("productId", "sku");

-- CreateIndex
CREATE INDEX "modifier_groups_clubId_idx" ON "modifier_groups"("clubId");

-- CreateIndex
CREATE INDEX "modifiers_groupId_idx" ON "modifiers"("groupId");

-- CreateIndex
CREATE INDEX "product_modifier_groups_productId_idx" ON "product_modifier_groups"("productId");

-- CreateIndex
CREATE INDEX "product_modifier_groups_modifierGroupId_idx" ON "product_modifier_groups"("modifierGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "product_modifier_groups_productId_modifierGroupId_key" ON "product_modifier_groups"("productId", "modifierGroupId");

-- CreateIndex
CREATE INDEX "pos_outlets_clubId_idx" ON "pos_outlets"("clubId");

-- CreateIndex
CREATE INDEX "pos_outlets_clubId_isActive_idx" ON "pos_outlets"("clubId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "pos_outlets_clubId_name_key" ON "pos_outlets"("clubId", "name");

-- CreateIndex
CREATE INDEX "outlet_product_configs_outletId_idx" ON "outlet_product_configs"("outletId");

-- CreateIndex
CREATE INDEX "outlet_product_configs_outletId_isVisible_idx" ON "outlet_product_configs"("outletId", "isVisible");

-- CreateIndex
CREATE INDEX "outlet_product_configs_outletId_isQuickKey_idx" ON "outlet_product_configs"("outletId", "isQuickKey");

-- CreateIndex
CREATE UNIQUE INDEX "outlet_product_configs_outletId_productId_key" ON "outlet_product_configs"("outletId", "productId");

-- CreateIndex
CREATE INDEX "outlet_category_configs_outletId_idx" ON "outlet_category_configs"("outletId");

-- CreateIndex
CREATE UNIQUE INDEX "outlet_category_configs_outletId_categoryId_key" ON "outlet_category_configs"("outletId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "outlet_grid_configs_outletId_key" ON "outlet_grid_configs"("outletId");

-- CreateIndex
CREATE INDEX "product_sales_metrics_outletId_date_idx" ON "product_sales_metrics"("outletId", "date");

-- CreateIndex
CREATE INDEX "product_sales_metrics_productId_date_idx" ON "product_sales_metrics"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "product_sales_metrics_productId_outletId_date_key" ON "product_sales_metrics"("productId", "outletId", "date");

-- CreateIndex
CREATE INDEX "staff_product_usage_staffId_outletId_idx" ON "staff_product_usage"("staffId", "outletId");

-- CreateIndex
CREATE INDEX "staff_product_usage_outletId_idx" ON "staff_product_usage"("outletId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_product_usage_staffId_productId_outletId_key" ON "staff_product_usage"("staffId", "productId", "outletId");

-- CreateIndex
CREATE UNIQUE INDEX "smart_suggestion_configs_outletId_key" ON "smart_suggestion_configs"("outletId");

-- CreateIndex
CREATE INDEX "cash_drawers_clubId_idx" ON "cash_drawers"("clubId");

-- CreateIndex
CREATE INDEX "cash_drawers_clubId_isActive_idx" ON "cash_drawers"("clubId", "isActive");

-- CreateIndex
CREATE INDEX "cash_drawer_shifts_cashDrawerId_idx" ON "cash_drawer_shifts"("cashDrawerId");

-- CreateIndex
CREATE INDEX "cash_drawer_shifts_cashDrawerId_status_idx" ON "cash_drawer_shifts"("cashDrawerId", "status");

-- CreateIndex
CREATE INDEX "cash_drawer_shifts_openedAt_idx" ON "cash_drawer_shifts"("openedAt");

-- CreateIndex
CREATE INDEX "cash_movements_shiftId_idx" ON "cash_movements"("shiftId");

-- CreateIndex
CREATE INDEX "cash_movements_shiftId_type_idx" ON "cash_movements"("shiftId", "type");

-- CreateIndex
CREATE INDEX "cash_movements_performedAt_idx" ON "cash_movements"("performedAt");

-- CreateIndex
CREATE INDEX "daily_settlements_clubId_idx" ON "daily_settlements"("clubId");

-- CreateIndex
CREATE INDEX "daily_settlements_clubId_status_idx" ON "daily_settlements"("clubId", "status");

-- CreateIndex
CREATE INDEX "daily_settlements_businessDate_idx" ON "daily_settlements"("businessDate");

-- CreateIndex
CREATE UNIQUE INDEX "daily_settlements_clubId_businessDate_key" ON "daily_settlements"("clubId", "businessDate");

-- CreateIndex
CREATE INDEX "settlement_exceptions_settlementId_idx" ON "settlement_exceptions"("settlementId");

-- CreateIndex
CREATE INDEX "settlement_exceptions_settlementId_resolution_idx" ON "settlement_exceptions"("settlementId", "resolution");

-- CreateIndex
CREATE INDEX "settlement_exceptions_type_idx" ON "settlement_exceptions"("type");

-- CreateIndex
CREATE INDEX "settlement_exceptions_severity_idx" ON "settlement_exceptions"("severity");

-- CreateIndex
CREATE INDEX "pos_templates_clubId_idx" ON "pos_templates"("clubId");

-- CreateIndex
CREATE INDEX "pos_templates_clubId_outletType_idx" ON "pos_templates"("clubId", "outletType");

-- CreateIndex
CREATE UNIQUE INDEX "pos_templates_clubId_name_key" ON "pos_templates"("clubId", "name");

-- CreateIndex
CREATE INDEX "pos_outlet_role_configs_outletId_idx" ON "pos_outlet_role_configs"("outletId");

-- CreateIndex
CREATE UNIQUE INDEX "pos_outlet_role_configs_outletId_role_key" ON "pos_outlet_role_configs"("outletId", "role");

-- CreateIndex
CREATE INDEX "minimum_spend_requirements_clubId_idx" ON "minimum_spend_requirements"("clubId");

-- CreateIndex
CREATE INDEX "minimum_spend_requirements_clubId_isActive_idx" ON "minimum_spend_requirements"("clubId", "isActive");

-- CreateIndex
CREATE INDEX "member_minimum_spends_clubId_idx" ON "member_minimum_spends"("clubId");

-- CreateIndex
CREATE INDEX "member_minimum_spends_memberId_idx" ON "member_minimum_spends"("memberId");

-- CreateIndex
CREATE INDEX "member_minimum_spends_requirementId_idx" ON "member_minimum_spends"("requirementId");

-- CreateIndex
CREATE INDEX "member_minimum_spends_clubId_periodStart_periodEnd_idx" ON "member_minimum_spends"("clubId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "member_minimum_spends_clubId_status_idx" ON "member_minimum_spends"("clubId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "member_minimum_spends_memberId_requirementId_periodStart_key" ON "member_minimum_spends"("memberId", "requirementId", "periodStart");

-- CreateIndex
CREATE INDEX "sub_accounts_clubId_idx" ON "sub_accounts"("clubId");

-- CreateIndex
CREATE INDEX "sub_accounts_memberId_idx" ON "sub_accounts"("memberId");

-- CreateIndex
CREATE INDEX "sub_accounts_clubId_status_idx" ON "sub_accounts"("clubId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sub_accounts_clubId_memberId_name_key" ON "sub_accounts"("clubId", "memberId", "name");

-- CreateIndex
CREATE INDEX "sub_account_transactions_clubId_idx" ON "sub_account_transactions"("clubId");

-- CreateIndex
CREATE INDEX "sub_account_transactions_subAccountId_idx" ON "sub_account_transactions"("subAccountId");

-- CreateIndex
CREATE INDEX "sub_account_transactions_clubId_createdAt_idx" ON "sub_account_transactions"("clubId", "createdAt");

-- CreateIndex
CREATE INDEX "sub_account_transactions_subAccountId_createdAt_idx" ON "sub_account_transactions"("subAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "stored_payment_methods_clubId_idx" ON "stored_payment_methods"("clubId");

-- CreateIndex
CREATE INDEX "stored_payment_methods_memberId_idx" ON "stored_payment_methods"("memberId");

-- CreateIndex
CREATE INDEX "stored_payment_methods_clubId_status_idx" ON "stored_payment_methods"("clubId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "stored_payment_methods_memberId_stripePaymentMethodId_key" ON "stored_payment_methods"("memberId", "stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "auto_pay_settings_clubId_idx" ON "auto_pay_settings"("clubId");

-- CreateIndex
CREATE INDEX "auto_pay_settings_paymentMethodId_idx" ON "auto_pay_settings"("paymentMethodId");

-- CreateIndex
CREATE INDEX "auto_pay_settings_clubId_isEnabled_idx" ON "auto_pay_settings"("clubId", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "auto_pay_settings_memberId_key" ON "auto_pay_settings"("memberId");

-- CreateIndex
CREATE INDEX "auto_pay_attempts_clubId_idx" ON "auto_pay_attempts"("clubId");

-- CreateIndex
CREATE INDEX "auto_pay_attempts_memberId_idx" ON "auto_pay_attempts"("memberId");

-- CreateIndex
CREATE INDEX "auto_pay_attempts_paymentMethodId_idx" ON "auto_pay_attempts"("paymentMethodId");

-- CreateIndex
CREATE INDEX "auto_pay_attempts_invoiceId_idx" ON "auto_pay_attempts"("invoiceId");

-- CreateIndex
CREATE INDEX "auto_pay_attempts_status_idx" ON "auto_pay_attempts"("status");

-- CreateIndex
CREATE INDEX "auto_pay_attempts_clubId_status_nextRetryAt_idx" ON "auto_pay_attempts"("clubId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "credit_notes_clubId_idx" ON "credit_notes"("clubId");

-- CreateIndex
CREATE INDEX "credit_notes_clubId_memberId_idx" ON "credit_notes"("clubId", "memberId");

-- CreateIndex
CREATE INDEX "credit_notes_creditNoteNumber_idx" ON "credit_notes"("creditNoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_clubId_creditNoteNumber_key" ON "credit_notes"("clubId", "creditNoteNumber");

-- CreateIndex
CREATE INDEX "credit_note_line_items_creditNoteId_idx" ON "credit_note_line_items"("creditNoteId");

-- CreateIndex
CREATE INDEX "credit_note_applications_creditNoteId_idx" ON "credit_note_applications"("creditNoteId");

-- CreateIndex
CREATE INDEX "credit_note_applications_invoiceId_idx" ON "credit_note_applications"("invoiceId");

-- CreateIndex
CREATE INDEX "collection_actions_clubId_memberId_idx" ON "collection_actions"("clubId", "memberId");

-- CreateIndex
CREATE INDEX "collection_actions_scheduledAt_idx" ON "collection_actions"("scheduledAt");

-- CreateIndex
CREATE INDEX "collection_actions_clubId_actionType_idx" ON "collection_actions"("clubId", "actionType");

-- CreateIndex
CREATE INDEX "interest_categories_clubId_isActive_idx" ON "interest_categories"("clubId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "interest_categories_clubId_code_key" ON "interest_categories"("clubId", "code");

-- CreateIndex
CREATE INDEX "member_interests_memberId_idx" ON "member_interests"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "member_interests_memberId_categoryId_key" ON "member_interests"("memberId", "categoryId");

-- CreateIndex
CREATE INDEX "dependent_interests_dependentId_idx" ON "dependent_interests"("dependentId");

-- CreateIndex
CREATE UNIQUE INDEX "dependent_interests_dependentId_categoryId_key" ON "dependent_interests"("dependentId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "member_communication_prefs_memberId_key" ON "member_communication_prefs"("memberId");

-- AddForeignKey
ALTER TABLE "club_golf_settings" ADD CONSTRAINT "club_golf_settings_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_billing_settings" ADD CONSTRAINT "club_billing_settings_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_billing_profiles" ADD CONSTRAINT "member_billing_profiles_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_types" ADD CONSTRAINT "membership_types_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_tiers" ADD CONSTRAINT "membership_tiers_membershipTypeId_fkey" FOREIGN KEY ("membershipTypeId") REFERENCES "membership_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_membershipTierId_fkey" FOREIGN KEY ("membershipTierId") REFERENCES "membership_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_membershipTypeId_fkey" FOREIGN KEY ("membershipTypeId") REFERENCES "membership_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_limit_overrides" ADD CONSTRAINT "credit_limit_overrides_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependents" ADD CONSTRAINT "dependents_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_types" ADD CONSTRAINT "charge_types_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_cityLedgerId_fkey" FOREIGN KEY ("cityLedgerId") REFERENCES "city_ledgers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_chargeTypeId_fkey" FOREIGN KEY ("chargeTypeId") REFERENCES "charge_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_cityLedgerId_fkey" FOREIGN KEY ("cityLedgerId") REFERENCES "city_ledgers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_ledgers" ADD CONSTRAINT "city_ledgers_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_convertedToLeadId_fkey" FOREIGN KEY ("convertedToLeadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_teeTimePlayerId_fkey" FOREIGN KEY ("teeTimePlayerId") REFERENCES "tee_time_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_defaultFacilityId_fkey" FOREIGN KEY ("defaultFacilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_capabilities" ADD CONSTRAINT "staff_capabilities_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_certifications" ADD CONSTRAINT "staff_certifications_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_variations" ADD CONSTRAINT "service_variations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumables" ADD CONSTRAINT "consumables_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumable_usage" ADD CONSTRAINT "consumable_usage_consumableId_fkey" FOREIGN KEY ("consumableId") REFERENCES "consumables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_courses" ADD CONSTRAINT "golf_courses_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "green_fee_rates" ADD CONSTRAINT "green_fee_rates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_course_schedules" ADD CONSTRAINT "golf_course_schedules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_course_intervals" ADD CONSTRAINT "golf_course_intervals_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "golf_course_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_course_holidays" ADD CONSTRAINT "golf_course_holidays_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_schedule_configs" ADD CONSTRAINT "golf_schedule_configs_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_schedule_time_periods" ADD CONSTRAINT "golf_schedule_time_periods_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "golf_schedule_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_schedule_seasons" ADD CONSTRAINT "golf_schedule_seasons_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "golf_schedule_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_season_time_periods" ADD CONSTRAINT "golf_season_time_periods_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "golf_schedule_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_schedule_special_days" ADD CONSTRAINT "golf_schedule_special_days_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "golf_schedule_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_special_day_time_periods" ADD CONSTRAINT "golf_special_day_time_periods_specialDayId_fkey" FOREIGN KEY ("specialDayId") REFERENCES "golf_schedule_special_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tee_time_blocks" ADD CONSTRAINT "tee_time_blocks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_group_bookings" ADD CONSTRAINT "golf_group_bookings_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_group_players" ADD CONSTRAINT "golf_group_players_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "golf_group_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_lotteries" ADD CONSTRAINT "golf_lotteries_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_lottery_requests" ADD CONSTRAINT "golf_lottery_requests_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "golf_lotteries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_waitlists" ADD CONSTRAINT "golf_waitlists_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_rate_configs" ADD CONSTRAINT "golf_rate_configs_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_rate_configs" ADD CONSTRAINT "golf_rate_configs_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "green_fees" ADD CONSTRAINT "green_fees_rateConfigId_fkey" FOREIGN KEY ("rateConfigId") REFERENCES "golf_rate_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_rates" ADD CONSTRAINT "cart_rates_rateConfigId_fkey" FOREIGN KEY ("rateConfigId") REFERENCES "golf_rate_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caddy_rates" ADD CONSTRAINT "caddy_rates_rateConfigId_fkey" FOREIGN KEY ("rateConfigId") REFERENCES "golf_rate_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caddies" ADD CONSTRAINT "caddies_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tee_times" ADD CONSTRAINT "tee_times_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tee_times" ADD CONSTRAINT "tee_times_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "golf_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tee_time_players" ADD CONSTRAINT "tee_time_players_caddyId_fkey" FOREIGN KEY ("caddyId") REFERENCES "caddies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tee_time_players" ADD CONSTRAINT "tee_time_players_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "dependents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tee_time_players" ADD CONSTRAINT "tee_time_players_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tee_time_players" ADD CONSTRAINT "tee_time_players_teeTimeId_fkey" FOREIGN KEY ("teeTimeId") REFERENCES "tee_times"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_drafts" ADD CONSTRAINT "cart_drafts_teeTimeId_fkey" FOREIGN KEY ("teeTimeId") REFERENCES "tee_times"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_line_items" ADD CONSTRAINT "booking_line_items_paidViaId_fkey" FOREIGN KEY ("paidViaId") REFERENCES "check_in_payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_line_items" ADD CONSTRAINT "booking_line_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "proshop_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_line_items" ADD CONSTRAINT "booking_line_items_teeTimePlayerId_fkey" FOREIGN KEY ("teeTimePlayerId") REFERENCES "tee_time_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_line_items" ADD CONSTRAINT "booking_line_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "proshop_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_line_items" ADD CONSTRAINT "booking_line_items_transferredFromPlayerId_fkey" FOREIGN KEY ("transferredFromPlayerId") REFERENCES "tee_time_players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_line_items" ADD CONSTRAINT "booking_line_items_transferredToPlayerId_fkey" FOREIGN KEY ("transferredToPlayerId") REFERENCES "tee_time_players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_check_in_records" ADD CONSTRAINT "player_check_in_records_settledViaId_fkey" FOREIGN KEY ("settledViaId") REFERENCES "check_in_payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_check_in_records" ADD CONSTRAINT "player_check_in_records_teeTimePlayerId_fkey" FOREIGN KEY ("teeTimePlayerId") REFERENCES "tee_time_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_payment_methods" ADD CONSTRAINT "check_in_payment_methods_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "check_in_payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_paidByMemberId_fkey" FOREIGN KEY ("paidByMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_teeTimeId_fkey" FOREIGN KEY ("teeTimeId") REFERENCES "tee_times"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_line_items" ADD CONSTRAINT "transaction_line_items_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "booking_line_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_line_items" ADD CONSTRAINT "transaction_line_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_membershipTypeId_fkey" FOREIGN KEY ("membershipTypeId") REFERENCES "membership_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proshop_categories" ADD CONSTRAINT "proshop_categories_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proshop_products" ADD CONSTRAINT "proshop_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "proshop_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proshop_products" ADD CONSTRAINT "proshop_products_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proshop_variants" ADD CONSTRAINT "proshop_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "proshop_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "starter_tickets" ADD CONSTRAINT "starter_tickets_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "starter_tickets" ADD CONSTRAINT "starter_tickets_teeTimeId_fkey" FOREIGN KEY ("teeTimeId") REFERENCES "tee_times"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_overrides" ADD CONSTRAINT "tax_overrides_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applied_discounts" ADD CONSTRAINT "applied_discounts_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applied_discounts" ADD CONSTRAINT "applied_discounts_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "booking_line_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applied_discounts" ADD CONSTRAINT "applied_discounts_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifier_groups" ADD CONSTRAINT "modifier_groups_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifiers" ADD CONSTRAINT "modifiers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "modifier_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_modifierGroupId_fkey" FOREIGN KEY ("modifierGroupId") REFERENCES "modifier_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_outlets" ADD CONSTRAINT "pos_outlets_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_outlets" ADD CONSTRAINT "pos_outlets_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "pos_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_product_configs" ADD CONSTRAINT "outlet_product_configs_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "pos_outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_product_configs" ADD CONSTRAINT "outlet_product_configs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_category_configs" ADD CONSTRAINT "outlet_category_configs_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "pos_outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_category_configs" ADD CONSTRAINT "outlet_category_configs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_grid_configs" ADD CONSTRAINT "outlet_grid_configs_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "pos_outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sales_metrics" ADD CONSTRAINT "product_sales_metrics_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sales_metrics" ADD CONSTRAINT "product_sales_metrics_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "pos_outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_product_usage" ADD CONSTRAINT "staff_product_usage_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_product_usage" ADD CONSTRAINT "staff_product_usage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_product_usage" ADD CONSTRAINT "staff_product_usage_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "pos_outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_suggestion_configs" ADD CONSTRAINT "smart_suggestion_configs_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "pos_outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_drawers" ADD CONSTRAINT "cash_drawers_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_drawer_shifts" ADD CONSTRAINT "cash_drawer_shifts_cashDrawerId_fkey" FOREIGN KEY ("cashDrawerId") REFERENCES "cash_drawers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "cash_drawer_shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_settlements" ADD CONSTRAINT "daily_settlements_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_exceptions" ADD CONSTRAINT "settlement_exceptions_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "daily_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_templates" ADD CONSTRAINT "pos_templates_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_outlet_role_configs" ADD CONSTRAINT "pos_outlet_role_configs_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "pos_outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_minimum_spends" ADD CONSTRAINT "member_minimum_spends_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "minimum_spend_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_minimum_spends" ADD CONSTRAINT "member_minimum_spends_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_accounts" ADD CONSTRAINT "sub_accounts_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_account_transactions" ADD CONSTRAINT "sub_account_transactions_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "sub_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_payment_methods" ADD CONSTRAINT "stored_payment_methods_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_pay_settings" ADD CONSTRAINT "auto_pay_settings_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "stored_payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_pay_attempts" ADD CONSTRAINT "auto_pay_attempts_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "stored_payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_pay_attempts" ADD CONSTRAINT "auto_pay_attempts_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_sourceInvoiceId_fkey" FOREIGN KEY ("sourceInvoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_line_items" ADD CONSTRAINT "credit_note_line_items_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "credit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_line_items" ADD CONSTRAINT "credit_note_line_items_chargeTypeId_fkey" FOREIGN KEY ("chargeTypeId") REFERENCES "charge_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_applications" ADD CONSTRAINT "credit_note_applications_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "credit_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_applications" ADD CONSTRAINT "credit_note_applications_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_actions" ADD CONSTRAINT "collection_actions_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_actions" ADD CONSTRAINT "collection_actions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_actions" ADD CONSTRAINT "collection_actions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_categories" ADD CONSTRAINT "interest_categories_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_interests" ADD CONSTRAINT "member_interests_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_interests" ADD CONSTRAINT "member_interests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "interest_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependent_interests" ADD CONSTRAINT "dependent_interests_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "dependents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependent_interests" ADD CONSTRAINT "dependent_interests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "interest_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_communication_prefs" ADD CONSTRAINT "member_communication_prefs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

