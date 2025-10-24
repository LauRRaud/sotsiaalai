-- Create enums for accessibility preferences
CREATE TYPE "AccessibilityContrast" AS ENUM ('normal', 'high');
CREATE TYPE "AccessibilityFontSize" AS ENUM ('md', 'lg', 'xl');
CREATE TYPE "AccessibilityMotion" AS ENUM ('normal', 'reduce');

-- Create user preference table
CREATE TABLE "t_user_prefs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "locale" TEXT,
  "contrast" "AccessibilityContrast" NOT NULL DEFAULT 'normal',
  "fontSize" "AccessibilityFontSize" NOT NULL DEFAULT 'md',
  "motion" "AccessibilityMotion" NOT NULL DEFAULT 'normal',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "t_user_prefs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "t_user_prefs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX "t_user_prefs_userId_key" ON "t_user_prefs" ("userId");
