/*
  Warnings:

  - A unique constraint covering the columns `[broker_id]` on the table `ChildAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[broker_id]` on the table `MasterAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChildAccount_broker_id_key" ON "ChildAccount"("broker_id");

-- CreateIndex
CREATE UNIQUE INDEX "MasterAccount_broker_id_key" ON "MasterAccount"("broker_id");
