-- CreateTable
CREATE TABLE "Prefrences" (
    "id" TEXT NOT NULL,
    "master_account_id" TEXT,
    "child_account_id" TEXT,

    CONSTRAINT "Prefrences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prefrences_master_account_id_key" ON "Prefrences"("master_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Prefrences_child_account_id_key" ON "Prefrences"("child_account_id");

-- AddForeignKey
ALTER TABLE "Prefrences" ADD CONSTRAINT "Prefrences_master_account_id_fkey" FOREIGN KEY ("master_account_id") REFERENCES "MasterAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prefrences" ADD CONSTRAINT "Prefrences_child_account_id_fkey" FOREIGN KEY ("child_account_id") REFERENCES "ChildAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
