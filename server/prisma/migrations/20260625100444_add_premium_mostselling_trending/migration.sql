-- AlterTable
ALTER TABLE "products" ADD COLUMN     "most_selling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trending" BOOLEAN NOT NULL DEFAULT false;
