-- Make RagDocument.title nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'RagDocument'
      AND column_name  = 'title'
      AND is_nullable  = 'NO'
  ) THEN
    ALTER TABLE "public"."RagDocument"
      ALTER COLUMN "title" DROP NOT NULL;
  END IF;
END
$$;

-- Drop unique constraint on VerificationToken.token if it exists (Prisma name convention)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'VerificationToken'
      AND c.conname = 'VerificationToken_token_key'
  ) THEN
    ALTER TABLE "public"."VerificationToken"
      DROP CONSTRAINT "VerificationToken_token_key";
  END IF;
END
$$;

-- Ensure composite unique (identifier, token) exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'VerificationToken_identifier_token_key'
  ) THEN
    CREATE UNIQUE INDEX "VerificationToken_identifier_token_key"
      ON "public"."VerificationToken" ("identifier","token");
  END IF;
END
$$;
