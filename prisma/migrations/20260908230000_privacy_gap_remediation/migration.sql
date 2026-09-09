-- AlterTable
ALTER TABLE "users" ADD COLUMN "behavioralTrackingConsent" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "super_admin_settings" ADD COLUMN "auditLogRetentionDays" INTEGER NOT NULL DEFAULT 90;
