-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

DO $$
BEGIN
    CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'SOCIAL_WORKER', 'CLIENT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('NONE', 'ACTIVE', 'CANCELED', 'PAST_DUE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "public"."PaymentProvider" AS ENUM ('MAKSEKESKUS', 'TEST');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "public"."PaymentStatus" AS ENUM ('INITIATED', 'PAID', 'CANCELED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "public"."RagSourceType" AS ENUM ('FILE', 'URL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "public"."RagStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "public"."Audience" AS ENUM ('SOCIAL_WORKER', 'CLIENT', 'BOTH');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CLIENT',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);