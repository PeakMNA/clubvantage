-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'PENDING_BOARD', 'APPROVED', 'REJECTED', 'WITHDRAWN');

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

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_membershipTypeId_fkey" FOREIGN KEY ("membershipTypeId") REFERENCES "membership_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
