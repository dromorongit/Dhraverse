-- 20260910_wallet_redemption.sql
-- Additive migration for wallet balance redemption to checkout integration.
-- Run manually against the target database after review; do NOT apply automatically.

-- 1. CustomerLoyalty: add spendable wallet balance
ALTER TABLE "customer_loyalty"
  ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- 2. Order: track how much wallet balance was applied to the order
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "walletAmountApplied" DOUBLE PRECISION;

-- Index to speed up wallet balance lookups
CREATE INDEX IF NOT EXISTS "customer_loyalty_walletBalance_idx" ON "customer_loyalty" ("walletBalance");
CREATE INDEX IF NOT EXISTS "orders_walletAmountApplied_idx" ON "orders" ("walletAmountApplied");
