-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_seq INCREMENT BY 1 MINVALUE 1 START WITH 1;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "invoiceNumber" SET DEFAULT concat('INV-', to_char(now(), 'YYYYMMDD'), '-', lpad(nextval('invoice_seq')::text, 4, '0'));
