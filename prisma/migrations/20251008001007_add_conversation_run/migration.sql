-- CreateEnum
CREATE TYPE "public"."RunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'ERROR');

-- DropIndex
DROP INDEX "public"."VerificationToken_token_key";

-- CreateTable
CREATE TABLE "public"."ConversationRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "sources" JSONB,
    "status" "public"."RunStatus" NOT NULL DEFAULT 'RUNNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationRun_userId_updatedAt_idx" ON "public"."ConversationRun"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ConversationRun_status_idx" ON "public"."ConversationRun"("status");

-- AddForeignKey
ALTER TABLE "public"."ConversationRun" ADD CONSTRAINT "ConversationRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
