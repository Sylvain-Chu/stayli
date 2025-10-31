-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "adults" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "children" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cleaningFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "specialRequests" TEXT,
ADD COLUMN     "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "invoiceNumber" SET DEFAULT concat('INV-', to_char(now(), 'YYYYMMDD'), '-', lpad(nextval('invoice_seq')::text, 4, '0'));
