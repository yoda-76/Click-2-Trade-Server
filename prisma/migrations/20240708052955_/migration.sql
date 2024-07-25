/*
  Warnings:

  - You are about to drop the column `broker` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `child` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `order_book` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `parent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `secret` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `today_pnl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `trade_book` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `OrderBook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TradeBook` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ph_number` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('UNASSIGNED', 'MASTER', 'CHILD', 'ADMIN');

-- DropForeignKey
ALTER TABLE "OrderBook" DROP CONSTRAINT "OrderBook_user_id_fkey";

-- DropForeignKey
ALTER TABLE "TradeBook" DROP CONSTRAINT "TradeBook_user_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "broker",
DROP COLUMN "child",
DROP COLUMN "key",
DROP COLUMN "order_book",
DROP COLUMN "parent",
DROP COLUMN "role",
DROP COLUMN "secret",
DROP COLUMN "today_pnl",
DROP COLUMN "trade_book",
ADD COLUMN     "ph_number" INTEGER NOT NULL,
ADD COLUMN     "photo" TEXT,
ALTER COLUMN "total_pnl" DROP DEFAULT;

-- DropTable
DROP TABLE "OrderBook";

-- DropTable
DROP TABLE "TradeBook";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "MasterAccount" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "broker" "Broker" NOT NULL,
    "broker_id" TEXT NOT NULL,
    "name_teag" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "last_token_generated_at" TIMESTAMP(3) NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pnl" INTEGER NOT NULL,
    "mtm_target" INTEGER NOT NULL,
    "mtm_loss" INTEGER NOT NULL,
    "trailing_sl_points" INTEGER NOT NULL DEFAULT 1,
    "tsl" INTEGER,

    CONSTRAINT "MasterAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildAccount" (
    "id" TEXT NOT NULL,
    "master_id" TEXT NOT NULL,
    "broker" "Broker" NOT NULL,
    "broker_id" TEXT NOT NULL,
    "name_teag" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "last_token_generated_at" TIMESTAMP(3) NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pnl" INTEGER NOT NULL,
    "mtm_target" INTEGER NOT NULL,
    "mtm_loss" INTEGER NOT NULL,

    CONSTRAINT "ChildAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MasterAccount" ADD CONSTRAINT "MasterAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildAccount" ADD CONSTRAINT "ChildAccount_master_id_fkey" FOREIGN KEY ("master_id") REFERENCES "MasterAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
