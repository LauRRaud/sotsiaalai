-- conversation_run.sql
-- Loob vestluste tabeli ning staatused (sh DELETED)

-- CreateEnum (värske installi puhul)
CREATE TYPE "public"."RunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'ERROR', 'DELETED');

-- (Valikuline) Kui sul on olemas vana enum ilma DELETED-ita,
-- JA käivitad seda faili olemasolevas andmebaasis, siis eelnevalt tee:
--   ALTER TYPE "public"."RunStatus" ADD VALUE IF NOT EXISTS 'DELETED';
-- Muidu CREATE TYPE annab vea, et tüüp on juba olemas.

-- DropIndex (kui olemas – mõned hostid loovad selle vaikimisi; kui ei ole, lihtsalt ignoreerib)
DROP INDEX IF EXISTS "public"."VerificationToken_token_key";

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."ConversationRun" (
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
CREATE INDEX IF NOT EXISTS "ConversationRun_userId_updatedAt_idx"
  ON "public"."ConversationRun"("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "ConversationRun_status_idx"
  ON "public"."ConversationRun"("status");

-- (Valikuline) Kui teed tihti päringuid WHERE userId=? AND status<>DELETED ORDER BY updatedAt DESC,
-- võib aidata ka kombineeritud indeks:
-- CREATE INDEX IF NOT EXISTS "ConversationRun_userId_status_updatedAt_idx"
--   ON "public"."ConversationRun"("userId", "status", "updatedAt" DESC);

-- AddForeignKey
ALTER TABLE "public"."ConversationRun"
  ADD CONSTRAINT "ConversationRun_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
