/*
  Warnings:

  - The `status` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "invoiceNumber" SET DEFAULT concat('INV-', to_char(now(), 'YYYYMMDD'), '-', lpad(nextval('invoice_seq')::text, 4, '0')),
DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'draft';
