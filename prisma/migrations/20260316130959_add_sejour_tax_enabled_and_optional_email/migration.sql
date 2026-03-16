-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "sejourTaxEnabled" BOOLEAN NOT NULL DEFAULT true;
