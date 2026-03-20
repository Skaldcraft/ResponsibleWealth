-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'editor');

-- CreateEnum
CREATE TYPE "EsgCategory" AS ENUM ('green', 'mixed', 'excluded');

-- CreateEnum
CREATE TYPE "CompanySourceType" AS ENUM ('ir', 'sustainability', 'market_data', 'esg_rating', 'news');

-- CreateEnum
CREATE TYPE "EditorialUpdateType" AS ENUM ('thesis', 'esg', 'operations', 'results', 'controversy');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('monthly', 'quarterly', 'annual');

-- CreateEnum
CREATE TYPE "NewsletterRunStatus" AS ENUM ('draft', 'review_required', 'approved', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "NewsletterSubscriberStatus" AS ENUM ('active', 'unsubscribed', 'bounced');

-- CreateEnum
CREATE TYPE "NewsletterSendStatus" AS ENUM ('queued', 'sent', 'failed');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Basket" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "benchmarkId" TEXT,
    CONSTRAINT "Basket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BasketMember" (
    "id" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "membershipStatus" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "note" TEXT,
    CONSTRAINT "BasketMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "closePrice" DOUBLE PRECISION NOT NULL,
    "dayChangePct" DOUBLE PRECISION NOT NULL,
    "monthReturnPct" DOUBLE PRECISION,
    "ytdReturnPct" DOUBLE PRECISION,
    "oneYearReturnPct" DOUBLE PRECISION,
    "sourceProvider" TEXT NOT NULL,
    "isDelayed" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Benchmark" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceProvider" TEXT NOT NULL,
    CONSTRAINT "Benchmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BenchmarkSnapshot" (
    "id" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "closeValue" DOUBLE PRECISION NOT NULL,
    "monthReturnPct" DOUBLE PRECISION,
    "ytdReturnPct" DOUBLE PRECISION,
    "oneYearReturnPct" DOUBLE PRECISION,
    CONSTRAINT "BenchmarkSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EsgProfile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" "EsgCategory" NOT NULL,
    "rationaleShort" TEXT NOT NULL,
    "rationaleLong" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "concerns" TEXT NOT NULL,
    "lastReviewedAt" TIMESTAMP(3),
    CONSTRAINT "EsgProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanySource" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "CompanySourceType" NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CompanySource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EditorialUpdate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updateType" "EditorialUpdateType" NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EditorialUpdate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reviewType" "ReviewType" NOT NULL,
    "summary" TEXT NOT NULL,
    "reviewerUserId" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "tag" TEXT NOT NULL,
    "importanceScore" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsletterRun" (
    "id" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "NewsletterRunStatus" NOT NULL,
    "generatedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsletterRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsletterDraft" (
    "id" TEXT NOT NULL,
    "newsletterRunId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preheader" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT NOT NULL,
    "webTitle" TEXT NOT NULL,
    "webSlug" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    CONSTRAINT "NewsletterDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsletterSource" (
    "id" TEXT NOT NULL,
    "newsletterRunId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceTable" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "companyId" TEXT,
    CONSTRAINT "NewsletterSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "NewsletterSubscriberStatus" NOT NULL,
    "locale" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsletterSendLog" (
    "id" TEXT NOT NULL,
    "newsletterRunId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "status" "NewsletterSendStatus" NOT NULL,
    "sentAt" TIMESTAMP(3),
    CONSTRAINT "NewsletterSendLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
CREATE UNIQUE INDEX "Basket_slug_key" ON "Basket"("slug");
CREATE UNIQUE INDEX "BasketMember_basketId_companyId_key" ON "BasketMember"("basketId", "companyId");
CREATE UNIQUE INDEX "MarketSnapshot_companyId_asOfDate_key" ON "MarketSnapshot"("companyId", "asOfDate");
CREATE UNIQUE INDEX "Benchmark_slug_key" ON "Benchmark"("slug");
CREATE UNIQUE INDEX "Benchmark_symbol_key" ON "Benchmark"("symbol");
CREATE UNIQUE INDEX "BenchmarkSnapshot_benchmarkId_asOfDate_key" ON "BenchmarkSnapshot"("benchmarkId", "asOfDate");
CREATE UNIQUE INDEX "EsgProfile_companyId_key" ON "EsgProfile"("companyId");
CREATE UNIQUE INDEX "NewsletterDraft_newsletterRunId_key" ON "NewsletterDraft"("newsletterRunId");
CREATE UNIQUE INDEX "NewsletterDraft_webSlug_key" ON "NewsletterDraft"("webSlug");
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Basket" ADD CONSTRAINT "Basket_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "Benchmark"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BasketMember" ADD CONSTRAINT "BasketMember_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "Basket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BasketMember" ADD CONSTRAINT "BasketMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BenchmarkSnapshot" ADD CONSTRAINT "BenchmarkSnapshot_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "Benchmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EsgProfile" ADD CONSTRAINT "EsgProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanySource" ADD CONSTRAINT "CompanySource_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialUpdate" ADD CONSTRAINT "EditorialUpdate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NewsletterDraft" ADD CONSTRAINT "NewsletterDraft_newsletterRunId_fkey" FOREIGN KEY ("newsletterRunId") REFERENCES "NewsletterRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewsletterSource" ADD CONSTRAINT "NewsletterSource_newsletterRunId_fkey" FOREIGN KEY ("newsletterRunId") REFERENCES "NewsletterRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewsletterSendLog" ADD CONSTRAINT "NewsletterSendLog_newsletterRunId_fkey" FOREIGN KEY ("newsletterRunId") REFERENCES "NewsletterRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewsletterSendLog" ADD CONSTRAINT "NewsletterSendLog_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
