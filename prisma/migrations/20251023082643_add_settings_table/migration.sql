-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "invoiceNumber" SET DEFAULT concat('INV-', to_char(now(), 'YYYYMMDD'), '-', lpad(nextval('invoice_seq')::text, 4, '0'));

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Vacation Rentals',
    "companyAddress" TEXT,
    "companyPhoneNumber" TEXT,
    "companyEmail" TEXT,
    "companyLogoUrl" TEXT,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'fr',
    "currencyCode" TEXT NOT NULL DEFAULT 'EUR',
    "currencySymbol" TEXT NOT NULL DEFAULT '€',
    "lowSeasonMonths" INTEGER[] DEFAULT ARRAY[1, 2, 3, 11, 12]::INTEGER[],
    "lowSeasonRate" DOUBLE PRECISION NOT NULL DEFAULT 750,
    "highSeasonRate" DOUBLE PRECISION NOT NULL DEFAULT 830,
    "linensOptionPrice" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "cleaningOptionPrice" DOUBLE PRECISION NOT NULL DEFAULT 35,
    "touristTaxRatePerPersonPerDay" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
    "invoiceDueDays" INTEGER NOT NULL DEFAULT 30,
    "invoicePaymentInstructions" TEXT,
    "cancellationInsurancePercentage" DOUBLE PRECISION NOT NULL DEFAULT 6,
    "cancellationInsuranceProviderName" TEXT NOT NULL DEFAULT 'Holiday Peace of Mind Insurance',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
