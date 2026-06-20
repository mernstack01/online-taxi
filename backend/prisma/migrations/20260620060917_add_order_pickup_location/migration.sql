/*
  Warnings:

  - Added the required column `pickupLat` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupLng` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "pickupLat" DOUBLE PRECISION,
ADD COLUMN "pickupLng" DOUBLE PRECISION;

UPDATE "Order"
SET
    "pickupLat" = 0,
    "pickupLng" = 0
WHERE
    "pickupLat" IS NULL
    OR "pickupLng" IS NULL;

ALTER TABLE "Order"
ALTER COLUMN "pickupLat" SET NOT NULL,
ALTER COLUMN "pickupLng" SET NOT NULL;
