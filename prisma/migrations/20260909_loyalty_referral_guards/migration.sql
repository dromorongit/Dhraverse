-- 20260909_loyalty_referral_guards.sql
-- Additive migration for loyalty idempotency fields and referral anti-abuse
-- Run manually against the target database after review; do NOT apply automatically.

-- 1. CustomerLoyalty: add daily-login / profile / follow / wishlist guard columns
ALTER TABLE "customer_loyalty"
  ADD COLUMN IF NOT EXISTS "lastDailyLoginRewardAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "profileCompletionRewarded" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "followVendorRewardClaimed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lastWishlistRewardAt" TIMESTAMP;

-- 2. Users: add referral code + registration IP for anti-abuse
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "referralCode" VARCHAR(32) UNIQUE,
  ADD COLUMN IF NOT EXISTS "registrationIpAddress" VARCHAR(64);

-- 3. ReferralRecord: add anti-abuse flag fields
ALTER TABLE "referral_records"
  ADD COLUMN IF NOT EXISTS "flagged" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "flagReason" TEXT;

-- 4. PendingRegistration: store referral code and registration IP until email verification
ALTER TABLE "pending_registrations"
  ADD COLUMN IF NOT EXISTS "referralCode" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "registrationIpAddress" VARCHAR(64);

-- Indexes to speed up lookups (safe to add after columns exist)
CREATE INDEX IF NOT EXISTS "customer_loyalty_lastDailyLoginRewardAt_idx" ON "customer_loyalty" ("lastDailyLoginRewardAt");
CREATE INDEX IF NOT EXISTS "customer_loyalty_profileCompletionRewarded_idx" ON "customer_loyalty" ("profileCompletionRewarded");
CREATE INDEX IF NOT EXISTS "customer_loyalty_followVendorRewardClaimed_idx" ON "customer_loyalty" ("followVendorRewardClaimed");
CREATE INDEX IF NOT EXISTS "customer_loyalty_lastWishlistRewardAt_idx" ON "customer_loyalty" ("lastWishlistRewardAt");
CREATE INDEX IF NOT EXISTS "users_referralCode_idx" ON "users" ("referralCode");
CREATE INDEX IF NOT EXISTS "users_registrationIpAddress_idx" ON "users" ("registrationIpAddress");
CREATE INDEX IF NOT EXISTS "referral_records_flagged_idx" ON "referral_records" ("flagged");

-- 5. ReferralStatus enum: add FLAGGED for anti-abuse (separate statement due to PostgreSQL transaction-boundary restrictions)
ALTER TYPE "ReferralStatus" ADD VALUE 'FLAGGED';
