/*
  Warnings:

  - You are about to drop the column `name_teag` on the `MasterAccount` table. All the data in the column will be lost.
  - Added the required column `name_tag` to the `MasterAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MasterAccount" DROP COLUMN "name_teag",
ADD COLUMN     "mtm_loss_toggle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mtm_target_toggle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name_tag" TEXT NOT NULL,
ALTER COLUMN "access_token" DROP NOT NULL,
ALTER COLUMN "last_token_generated_at" DROP NOT NULL,
ALTER COLUMN "pnl" SET DEFAULT 0,
ALTER COLUMN "mtm_target" SET DEFAULT 100,
ALTER COLUMN "mtm_loss" SET DEFAULT 40;
