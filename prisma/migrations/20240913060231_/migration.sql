/*
  Warnings:

  - You are about to drop the column `ip_address` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `session_token` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `Session` table. All the data in the column will be lost.
  - Added the required column `access_token` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Made the column `last_active_at` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "ip_address",
DROP COLUMN "session_token",
DROP COLUMN "user_agent",
ADD COLUMN     "access_token" TEXT NOT NULL,
ADD COLUMN     "refresh_token" TEXT NOT NULL,
ALTER COLUMN "last_active_at" SET NOT NULL,
ALTER COLUMN "last_active_at" SET DEFAULT CURRENT_TIMESTAMP;
