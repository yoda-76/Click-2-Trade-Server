-- AlterTable
ALTER TABLE "ChildAccount" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "multiplier" INTEGER NOT NULL DEFAULT 1;
