-- Add missing financial fields to orders table
ALTER TABLE "orders" ADD COLUMN "grossAmount" DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN "processorFee" DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN "netAmount" DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN "platformCommission" DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN "vendorEarnings" DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN "commissionRate" DOUBLE PRECISION;

-- Add missing financial fields to order_items table
ALTER TABLE "order_items" ADD COLUMN "grossAmount" DOUBLE PRECISION;
ALTER TABLE "order_items" ADD COLUMN "processorFee" DOUBLE PRECISION;
ALTER TABLE "order_items" ADD COLUMN "netAmount" DOUBLE PRECISION;
ALTER TABLE "order_items" ADD COLUMN "platformCommission" DOUBLE PRECISION;
ALTER TABLE "order_items" ADD COLUMN "vendorEarnings" DOUBLE PRECISION;
ALTER TABLE "order_items" ADD COLUMN "commissionRate" DOUBLE PRECISION;