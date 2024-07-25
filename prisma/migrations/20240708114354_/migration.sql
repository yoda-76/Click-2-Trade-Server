-- AlterTable
ALTER TABLE "ChildAccount" ADD COLUMN     "mtm_loss_toggle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mtm_target_toggle" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "access_token" DROP NOT NULL,
ALTER COLUMN "last_token_generated_at" DROP NOT NULL,
ALTER COLUMN "pnl" SET DEFAULT 0,
ALTER COLUMN "mtm_target" SET DEFAULT 100,
ALTER COLUMN "mtm_loss" SET DEFAULT 40;
