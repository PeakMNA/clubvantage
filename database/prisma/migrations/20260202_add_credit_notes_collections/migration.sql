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

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_clubId_creditNoteNumber_key" ON "credit_notes"("clubId", "creditNoteNumber");

-- CreateIndex
CREATE INDEX "credit_notes_clubId_idx" ON "credit_notes"("clubId");

-- CreateIndex
CREATE INDEX "credit_notes_clubId_memberId_idx" ON "credit_notes"("clubId", "memberId");

-- CreateIndex
CREATE INDEX "credit_notes_creditNoteNumber_idx" ON "credit_notes"("creditNoteNumber");

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
