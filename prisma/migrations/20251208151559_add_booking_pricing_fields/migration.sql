-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cleaningPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "hasCancellationInsurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasCleaning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasLinens" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "linensPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "invoiceNumber" SET DEFAULT concat('INV-', to_char(now(), 'YYYYMMDD'), '-', lpad(nextval('invoice_seq')::text, 4, '0'));
