import { Prisma, UserRole } from "@prisma/client";
import { basketSeed, benchmarkSeed, newsletterArchiveSeed, resourceGuidesSeed, seedCompanies } from "@/lib/content/seed";
import { prisma } from "@/lib/server/prisma";

export async function seedDatabase() {
  const benchmark = await prisma.benchmark.upsert({
    where: { slug: benchmarkSeed.slug },
    update: { name: benchmarkSeed.name, symbol: benchmarkSeed.symbol, sourceProvider: benchmarkSeed.sourceProvider },
    create: { name: benchmarkSeed.name, symbol: benchmarkSeed.symbol, slug: benchmarkSeed.slug, sourceProvider: benchmarkSeed.sourceProvider }
  });

  await prisma.benchmarkSnapshot.upsert({
    where: { benchmarkId_asOfDate: { benchmarkId: benchmark.id, asOfDate: new Date(benchmarkSeed.snapshot.asOfDate) } },
    update: benchmarkSeed.snapshot,
    create: { benchmarkId: benchmark.id, ...benchmarkSeed.snapshot }
  });

  const basket = await prisma.basket.upsert({
    where: { slug: basketSeed.slug },
    update: { name: basketSeed.name, description: basketSeed.description, benchmarkId: benchmark.id, active: true },
    create: { slug: basketSeed.slug, name: basketSeed.name, description: basketSeed.description, benchmarkId: benchmark.id, active: true }
  });

  for (const [index, company] of seedCompanies.entries()) {
    const createdCompany = await prisma.company.upsert({
      where: { ticker: company.ticker },
      update: {
        slug: company.slug,
        name: company.name,
        exchange: company.exchange,
        country: company.country,
        sector: company.sector,
        shortDescription: company.shortDescription,
        active: true,
        lifecycleStatus: company.lifecycleStatus,
        haloFit: company.haloFit,
        esgFit: company.esgFit,
        mediumTermScore: company.mediumTermScore
      },
      create: {
        ticker: company.ticker,
        slug: company.slug,
        name: company.name,
        exchange: company.exchange,
        country: company.country,
        sector: company.sector,
        shortDescription: company.shortDescription,
        active: true,
        lifecycleStatus: company.lifecycleStatus,
        haloFit: company.haloFit,
        esgFit: company.esgFit,
        mediumTermScore: company.mediumTermScore
      }
    });

    await prisma.basketMember.upsert({
      where: { basketId_companyId: { basketId: basket.id, companyId: createdCompany.id } },
      update: { order: index + 1, membershipStatus: "active", startDate: new Date(company.snapshot.asOfDate) },
      create: { basketId: basket.id, companyId: createdCompany.id, order: index + 1, membershipStatus: "active", startDate: new Date(company.snapshot.asOfDate) }
    });

    await prisma.esgProfile.upsert({
      where: { companyId: createdCompany.id },
      update: {
        category: company.esgCategory,
        rationaleShort: company.rationaleShort,
        rationaleLong: company.rationaleLong,
        strengths: company.strengths,
        concerns: company.concerns,
        lastReviewedAt: new Date(company.snapshot.asOfDate)
      },
      create: {
        companyId: createdCompany.id,
        category: company.esgCategory,
        rationaleShort: company.rationaleShort,
        rationaleLong: company.rationaleLong,
        strengths: company.strengths,
        concerns: company.concerns,
        lastReviewedAt: new Date(company.snapshot.asOfDate)
      }
    });

    await prisma.marketSnapshot.upsert({
      where: { companyId_asOfDate: { companyId: createdCompany.id, asOfDate: new Date(company.snapshot.asOfDate) } },
      update: { ...company.snapshot, sourceProvider: benchmarkSeed.sourceProvider },
      create: { companyId: createdCompany.id, ...company.snapshot, sourceProvider: benchmarkSeed.sourceProvider }
    });

    await prisma.companySource.deleteMany({ where: { companyId: createdCompany.id } });
    await prisma.companySource.createMany({
      data: company.sources.map((source, sourceIndex) => ({
        companyId: createdCompany.id,
        type: source.type,
        label: source.label,
        url: source.url,
        sortOrder: sourceIndex,
        active: true
      }))
    });

    await prisma.editorialUpdate.deleteMany({ where: { companyId: createdCompany.id } });
    await prisma.editorialUpdate.createMany({
      data: company.updates.map((update) => ({
        companyId: createdCompany.id,
        title: update.title,
        summary: update.summary,
        body: update.body,
        updateType: update.updateType,
        effectiveDate: new Date(update.effectiveDate),
        published: true
      }))
    });

    await prisma.reviewLog.deleteMany({ where: { companyId: createdCompany.id } });
    await prisma.reviewLog.createMany({
      data: company.reviews.map((review) => ({
        companyId: createdCompany.id,
        reviewType: review.reviewType,
        summary: review.summary,
        reviewedAt: new Date(review.reviewedAt)
      }))
    });
  }

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@example.com" },
    update: { name: "Responsible Wealth Admin", role: UserRole.admin },
    create: { email: process.env.ADMIN_EMAIL ?? "admin@example.com", name: "Responsible Wealth Admin", role: UserRole.admin }
  });

  const existingDraft = await prisma.newsletterDraft.findFirst({ where: { webSlug: newsletterArchiveSeed[0].slug } });
  if (!existingDraft) {
    const run = await prisma.newsletterRun.create({
      data: {
        periodStart: new Date("2026-03-01T00:00:00.000Z"),
        periodEnd: new Date("2026-03-31T00:00:00.000Z"),
        status: "sent",
        generatedAt: new Date(newsletterArchiveSeed[0].publishedAt),
        approvedAt: new Date(newsletterArchiveSeed[0].publishedAt),
        sentAt: new Date(newsletterArchiveSeed[0].publishedAt)
      }
    });

    await prisma.newsletterDraft.create({
      data: {
        newsletterRunId: run.id,
        subject: newsletterArchiveSeed[0].title,
        preheader: newsletterArchiveSeed[0].preheader,
        htmlBody: newsletterArchiveSeed[0].htmlBody,
        textBody: newsletterArchiveSeed[0].textBody,
        webTitle: newsletterArchiveSeed[0].title,
        webSlug: newsletterArchiveSeed[0].slug,
        modelName: "seed",
        promptVersion: "v1"
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      entityType: "seed",
      entityId: basket.id,
      action: "seed.completed",
      metadata: { companies: seedCompanies.length, resources: resourceGuidesSeed.length } satisfies Prisma.JsonObject
    }
  });
}
