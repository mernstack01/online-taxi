CREATE TYPE "OrderStatus" AS ENUM (
    'pending',
    'accepted',
    'arrived',
    'started',
    'completed',
    'cancelled'
);

ALTER TABLE "Order"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "OrderStatus"
USING "status"::"OrderStatus",
ALTER COLUMN "status" SET DEFAULT 'pending';
