/*
  Warnings:

  - You are about to drop the column `mtm_loss` on the `MasterAccount` table. All the data in the column will be lost.
  - You are about to drop the column `mtm_loss_toggle` on the `MasterAccount` table. All the data in the column will be lost.
  - You are about to drop the column `mtm_target` on the `MasterAccount` table. All the data in the column will be lost.
  - You are about to drop the column `mtm_target_toggle` on the `MasterAccount` table. All the data in the column will be lost.
  - You are about to drop the column `trailing_sl_points` on the `MasterAccount` table. All the data in the column will be lost.
  - You are about to drop the column `tsl` on the `MasterAccount` table. All the data in the column will be lost.
  - You are about to drop the column `child_account_id` on the `Prefrences` table. All the data in the column will be lost.
  - You are about to drop the column `master_account_id` on the `Prefrences` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `Prefrences` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Prefrences" DROP CONSTRAINT "Prefrences_child_account_id_fkey";

-- DropForeignKey
ALTER TABLE "Prefrences" DROP CONSTRAINT "Prefrences_master_account_id_fkey";

-- DropIndex
DROP INDEX "Prefrences_child_account_id_key";

-- DropIndex
DROP INDEX "Prefrences_master_account_id_key";

-- AlterTable
ALTER TABLE "MasterAccount" DROP COLUMN "mtm_loss",
DROP COLUMN "mtm_loss_toggle",
DROP COLUMN "mtm_target",
DROP COLUMN "mtm_target_toggle",
DROP COLUMN "trailing_sl_points",
DROP COLUMN "tsl";

-- AlterTable
ALTER TABLE "Prefrences" DROP COLUMN "child_account_id",
DROP COLUMN "master_account_id",
ADD COLUMN     "account_id" TEXT,
ADD COLUMN     "mtm_sl_increment" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "mtm_stoploss" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "mtm_target" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "mtm_target_increment" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "mtm_trailing_point" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sl_increment" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stoploss" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "target" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "target_increment" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "trailing_point" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ref_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_ref_id_key" ON "Transaction"("ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "Prefrences_account_id_key" ON "Prefrences"("account_id");

-- AddForeignKey
ALTER TABLE "Prefrences" ADD CONSTRAINT "Prefrences_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "MasterAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
