CREATE TYPE "DiscountType" AS ENUM ('percent', 'fixed');
CREATE TYPE "CouponScope" AS ENUM ('all', 'category', 'product');

CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "name" TEXT NOT NULL, "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '', "image_url" TEXT NOT NULL DEFAULT '', "image_public_id" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true, "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

ALTER TABLE "products" ADD COLUMN "category_id" UUID;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "coupons" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "code" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '',
  "discount_type" "DiscountType" NOT NULL, "value" DECIMAL(10,2) NOT NULL, "scope" "CouponScope" NOT NULL DEFAULT 'all',
  "category_id" UUID, "product_id" UUID, "minimum_order" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "maximum_discount" DECIMAL(10,2), "active" BOOLEAN NOT NULL DEFAULT true, "starts_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3), "usage_limit" INTEGER, "used_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "hero_slides" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "title" TEXT NOT NULL, "subtitle" TEXT NOT NULL DEFAULT '',
  "image_url" TEXT NOT NULL, "image_public_id" TEXT, "cta_label" TEXT NOT NULL DEFAULT 'Shop now',
  "cta_url" TEXT NOT NULL DEFAULT '/collection', "product_id" UUID, "active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orders" ADD COLUMN "subtotal_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "coupon_code" TEXT;
ALTER TABLE "orders" ADD COLUMN "coupon_id" UUID;
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
