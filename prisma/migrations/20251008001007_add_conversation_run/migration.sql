-- 1) RunStatus ENUM – loo kui puudub; lisa DELETED kui puudu
DO $$
BEGIN
  -- loo tüüp, kui puudub
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RunStatus') THEN
    CREATE TYPE "public"."RunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'ERROR', 'DELETED');
  END IF;

  -- lisa väärtus DELETED, kui puudub (juhtudel, kus tüüp oli varem olemas)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'RunStatus' AND e.enumlabel = 'DELETED'
  ) THEN
    ALTER TYPE "public"."RunStatus" ADD VALUE 'DELETED';
  END IF;
END
$$;

-- 2) (mittevajalik, aga ohutu) – mõned hostid loovad selle indeksi; kui seda pole, siis NOOP
DROP INDEX IF EXISTS "public"."VerificationToken_token_key";

-- 3) ConversationRun tabel (kui puudub)
CREATE TABLE IF NOT EXISTS "public"."ConversationRun" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "role"      "public"."Role" NOT NULL,
  "text"      TEXT NOT NULL DEFAULT '',
  "sources"   JSONB,
  "status"    "public"."RunStatus" NOT NULL DEFAULT 'RUNNING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationRun_pkey" PRIMARY KEY ("id")
);

-- 4) Indeksid (kui puuduvad)
CREATE INDEX IF NOT EXISTS "ConversationRun_userId_updatedAt_idx"
  ON "public"."ConversationRun" ("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "ConversationRun_status_idx"
  ON "public"."ConversationRun" ("status");

-- (soovi korral, kui sageli küsid status<>DELETED ja sort updatedAt DESC)
-- CREATE INDEX IF NOT EXISTS "ConversationRun_userId_status_updatedAt_idx"
--   ON "public"."ConversationRun" ("userId", "status", "updatedAt" DESC);

-- 5) Välisvõti (lisame ainult siis, kui puudub)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'ConversationRun_userId_fkey'
      AND table_name = 'ConversationRun'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE "public"."ConversationRun"
      ADD CONSTRAINT "ConversationRun_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
