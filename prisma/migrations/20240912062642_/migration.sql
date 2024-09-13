/*
  Warnings:

  - A unique constraint covering the columns `[u_id]` on the table `ChildAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[u_id]` on the table `MasterAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `u_id` to the `ChildAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `u_id` to the `MasterAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChildAccount" ADD COLUMN     "u_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MasterAccount" ADD COLUMN     "u_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChildAccount_u_id_key" ON "ChildAccount"("u_id");

-- CreateIndex
CREATE UNIQUE INDEX "MasterAccount_u_id_key" ON "MasterAccount"("u_id");
