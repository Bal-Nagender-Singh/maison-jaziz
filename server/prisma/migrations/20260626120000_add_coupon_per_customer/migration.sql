-- Add per_customer field to coupons table
ALTER TABLE "coupons" ADD COLUMN "per_customer" BOOLEAN NOT NULL DEFAULT false;
