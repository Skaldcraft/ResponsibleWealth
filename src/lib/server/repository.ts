import { NewsletterRunStatus } from "@prisma/client";
import { basketSeed, benchmarkSeed, newsletterArchiveSeed, resourceGuidesSeed, seedCompanies } from "@/lib/content/seed";
import { prisma } from "@/lib/server/prisma";

async function withFallback<T>(query: () => Promise<T>, fallback: () => T | Promise<T>) {
  if (!process.env.DATABASE_URL) {
    return await fallback();
  }
  try {
    return await query();
  } catch {
    return await fallback();
  }
}

export async function getSiteSummary() {
  return withFallback(
    async () => {
      const [basket, companies] = await Promise.all([
        prisma.basket.findFirst({ where: { slug: "halo-esg" }, include: { benchmark: true } }),
        prisma.company.count({ where: { active: true } })
      ]);
      const latest = await prisma.marketSnapshot.findFirst({ orderBy: { asOfDate: "desc" } });
      return {
        basketName: basket?.name ?? basketSeed.name,
        basketSlug: basket?.slug ?? basketSeed.slug,
        benchmarkName: basket?.benchmark?.name ?? benchmarkSeed.name,
        companyCount: companies,
        lastUpdated: latest?.asOfDate.toISOString() ?? seedCompanies[0].snapshot.asOfDate
      };
    },
    () => ({
      basketName: basketSeed.name,
      basketSlug: basketSeed.slug,
      benchmarkName: benchmarkSeed.name,
      companyCount: seedCompanies.length,
      lastUpdated: seedCompanies[0]?.snapshot.asOfDate ?? new Date().toISOString()
    })
  );
}

export async function getBasketOverview(options?: { sortBy?: "name" | "price"; order?: "asc" | "desc" }) {
  return withFallback(
    async () => {
      const basket = await prisma.basket.findFirst({
        where: { slug: "halo-esg" },
        include: {
          benchmark: { include: { snapshots: { take: 1, orderBy: { asOfDate: "desc" } } } },
          members: {
            where: { membershipStatus: "active" },
            orderBy: { order: "asc" },
            include: {
              company: {
                include: {
                  esgProfile: true,
                  marketSnapshots: { take: 1, orderBy: { asOfDate: "desc" } }
                }
              }
            }
          }
        }
      });

      if (!basket) {
        throw new Error("No basket");
      }

      let companies = basket.members.map(({ company }) => ({
        ticker: company.ticker,
        slug: company.slug,
        name: company.name,
        sector: company.sector,
        country: company.country,
        exchange: company.exchange,
        shortDescription: company.shortDescription,
        lifecycleStatus: company.lifecycleStatus,
        haloFit: company.haloFit,
        esgFit: company.esgFit,
        mediumTermScore: company.mediumTermScore,
        esgCategory: company.esgProfile?.category ?? "mixed",
        rationaleShort: company.esgProfile?.rationaleShort ?? "",
        rationaleLong: company.esgProfile?.rationaleLong ?? "",
        strengths: company.esgProfile?.strengths ?? "",
        concerns: company.esgProfile?.concerns ?? "",
        watchpoints: [] as string[],
        sources: [] as Array<{ type?: string; label: string; url: string }>,
        updates: [] as Array<{ title: string; summary: string; body: string; updateType: string; effectiveDate: string }>,
        reviews: [] as Array<{ reviewType: string; summary: string; reviewedAt: string }>,
        snapshot: {
          asOfDate: company.marketSnapshots[0]?.asOfDate.toISOString() ?? seedCompanies[0].snapshot.asOfDate,
          currency: company.marketSnapshots[0]?.currency ?? "USD",
          closePrice: company.marketSnapshots[0]?.closePrice ?? 0,
          dayChangePct: company.marketSnapshots[0]?.dayChangePct ?? 0,
          monthReturnPct: company.marketSnapshots[0]?.monthReturnPct ?? 0,
          ytdReturnPct: company.marketSnapshots[0]?.ytdReturnPct ?? 0,
          oneYearReturnPct: company.marketSnapshots[0]?.oneYearReturnPct ?? 0,
          isDelayed: company.marketSnapshots[0]?.isDelayed ?? true
        }
      }));

      // Apply sorting if requested
      if (options?.sortBy) {
        const { sortBy, order = "asc" } = options;
        companies.sort((a, b) => {
          let aVal: string | number;
          let bVal: string | number;

          if (sortBy === "name") {
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
          } else {
            aVal = a.snapshot.closePrice;
            bVal = b.snapshot.closePrice;
          }

          if (aVal === bVal) return 0;
          const comparison = aVal > bVal ? 1 : -1;
          return order === "asc" ? comparison : -comparison;
        });
      }

      const averageMonthReturn = companies.length
        ? companies.reduce((sum, company) => sum + company.snapshot.monthReturnPct, 0) / companies.length
        : 0;

      return {
        basket: { slug: basket.slug, name: basket.name, description: basket.description },
        benchmark: {
          slug: basket.benchmark?.slug ?? benchmarkSeed.slug,
          symbol: basket.benchmark?.symbol ?? benchmarkSeed.symbol,
          name: basket.benchmark?.name ?? benchmarkSeed.name,
          sourceProvider: basket.benchmark?.sourceProvider ?? benchmarkSeed.sourceProvider,
          snapshot: {
            asOfDate: basket.benchmark?.snapshots[0]?.asOfDate.toISOString() ?? benchmarkSeed.snapshot.asOfDate,
            closeValue: basket.benchmark?.snapshots[0]?.closeValue ?? benchmarkSeed.snapshot.closeValue,
            monthReturnPct: basket.benchmark?.snapshots[0]?.monthReturnPct ?? benchmarkSeed.snapshot.monthReturnPct,
            ytdReturnPct: basket.benchmark?.snapshots[0]?.ytdReturnPct ?? benchmarkSeed.snapshot.ytdReturnPct,
            oneYearReturnPct: basket.benchmark?.snapshots[0]?.oneYearReturnPct ?? benchmarkSeed.snapshot.oneYearReturnPct
          }
        },
        companies,
        averageMonthReturn
      };
    },
    async () => {
      let companies = [...seedCompanies];
      if (options?.sortBy) {
        const { sortBy, order = "asc" } = options;
        companies.sort((a, b) => {
          let aVal: string | number;
          let bVal: string | number;

          if (sortBy === "name") {
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
          } else {
            aVal = a.snapshot.closePrice;
            bVal = b.snapshot.closePrice;
          }

          if (aVal === bVal) return 0;
          const comparison = aVal > bVal ? 1 : -1;
          return order === "asc" ? comparison : -comparison;
        });
      }
      return {
        basket: basketSeed,
        benchmark: benchmarkSeed,
        companies: companies,
        averageMonthReturn: companies.reduce((sum, company) => sum + company.snapshot.monthReturnPct, 0) / companies.length
      };
    }
  );
}

export async function getCompanyByTicker(ticker: string) {
  return withFallback(
    async () => {
      const company = await prisma.company.findFirst({
        where: { ticker: { equals: ticker, mode: "insensitive" } },
        include: {
          esgProfile: true,
          sources: { where: { active: true }, orderBy: { sortOrder: "asc" } },
          marketSnapshots: { take: 1, orderBy: { asOfDate: "desc" } },
          editorialUpdates: { where: { published: true }, orderBy: { effectiveDate: "desc" } },
          reviewLogs: { orderBy: { reviewedAt: "desc" } }
        }
      });

      if (!company) {
        return null;
      }

      return {
        id: company.id,
        ticker: company.ticker,
        slug: company.slug,
        name: company.name,
        exchange: company.exchange,
        country: company.country,
        sector: company.sector,
        shortDescription: company.shortDescription,
        lifecycleStatus: company.lifecycleStatus,
        haloFit: company.haloFit,
        esgFit: company.esgFit,
        mediumTermScore: company.mediumTermScore,
        esgCategory: company.esgProfile?.category ?? "mixed",
        rationaleShort: company.esgProfile?.rationaleShort ?? "",
        rationaleLong: company.esgProfile?.rationaleLong ?? "",
        strengths: company.esgProfile?.strengths ?? "",
        concerns: company.esgProfile?.concerns ?? "",
        watchpoints: [],
        sources: company.sources.map((source) => ({ type: source.type, label: source.label, url: source.url })),
        snapshot: {
          asOfDate: company.marketSnapshots[0]?.asOfDate.toISOString() ?? new Date().toISOString(),
          currency: company.marketSnapshots[0]?.currency ?? "USD",
          closePrice: company.marketSnapshots[0]?.closePrice ?? 0,
          dayChangePct: company.marketSnapshots[0]?.dayChangePct ?? 0,
          monthReturnPct: company.marketSnapshots[0]?.monthReturnPct ?? 0,
          ytdReturnPct: company.marketSnapshots[0]?.ytdReturnPct ?? 0,
          oneYearReturnPct: company.marketSnapshots[0]?.oneYearReturnPct ?? 0,
          isDelayed: company.marketSnapshots[0]?.isDelayed ?? true
        },
        updates: company.editorialUpdates.map((update) => ({
          title: update.title,
          summary: update.summary,
          body: update.body,
          updateType: update.updateType,
          effectiveDate: update.effectiveDate.toISOString()
        })),
        reviews: company.reviewLogs.map((review) => ({
          reviewType: review.reviewType,
          summary: review.summary,
          reviewedAt: review.reviewedAt.toISOString()
        }))
      };
    },
    () => {
      const company = seedCompanies.find((item) => item.ticker.toLowerCase() === ticker.toLowerCase());
      return company ? { id: company.ticker, ...company } : null;
    }
  );
}

export async function getAllCompanies() {
  return withFallback(
    async () => {
      const companies = await prisma.company.findMany({
        orderBy: [{ lifecycleStatus: "asc" }, { ticker: "asc" }],
        include: {
          esgProfile: true,
          basketMembers: { where: { basket: { slug: "halo-esg" } }, orderBy: { order: "asc" } },
          marketSnapshots: { take: 1, orderBy: { asOfDate: "desc" } }
        }
      });
      return companies.map((company) => ({
        id: company.id,
        ticker: company.ticker,
        name: company.name,
        sector: company.sector,
        lifecycleStatus: company.lifecycleStatus,
        basketStatus: company.basketMembers[0]?.membershipStatus ?? "inactive",
        esgCategory: company.esgProfile?.category ?? "mixed",
        monthReturnPct: company.marketSnapshots[0]?.monthReturnPct ?? null
      }));
    },
    () =>
      seedCompanies.map((company) => ({
        id: company.ticker,
        ticker: company.ticker,
        name: company.name,
        sector: company.sector,
        lifecycleStatus: company.lifecycleStatus,
        basketStatus: "active",
        esgCategory: company.esgCategory,
        monthReturnPct: company.snapshot.monthReturnPct
      }))
  );
}

export async function getCompanyLifecycleGroups() {
  const companies = await getAllCompanies();
  return {
    candidates: companies.filter((company) => company.lifecycleStatus === "candidate"),
    underReview: companies.filter((company) => company.lifecycleStatus === "under_review"),
    active: companies.filter((company) => company.lifecycleStatus === "active"),
    removed: companies.filter((company) => company.lifecycleStatus === "removed" || company.lifecycleStatus === "archived")
  };
}

export async function getRecentChanges() {
  return withFallback(
    async () => {
      const updates = await prisma.editorialUpdate.findMany({
        where: { published: true },
        orderBy: { effectiveDate: "desc" },
        take: 12,
        include: { company: true }
      });

      return updates.map((update) => ({
        companyName: update.company.name,
        ticker: update.company.ticker,
        title: update.title,
        summary: update.summary,
        effectiveDate: update.effectiveDate.toISOString(),
        updateType: update.updateType
      }));
    },
    () =>
      seedCompanies
        .flatMap((company) =>
          company.updates.map((update) => ({
            companyName: company.name,
            ticker: company.ticker,
            title: update.title,
            summary: update.summary,
            effectiveDate: update.effectiveDate,
            updateType: update.updateType
          }))
        )
        .slice(0, 12)
  );
}

export async function getNewsItems(options?: { verifiedOnly?: boolean; limit?: number; minimumImportanceScore?: number; tags?: string[] }) {
  return withFallback(
    async () => {
      const items = await prisma.newsItem.findMany({
        where: {
          ...(options?.verifiedOnly ? { verified: true } : {}),
          ...(options?.minimumImportanceScore ? { importanceScore: { gte: options.minimumImportanceScore } } : {}),
          ...(options?.tags?.length ? { tag: { in: options.tags } } : {})
        },
        include: { company: true },
        orderBy: [{ importanceScore: "desc" }, { publishedAt: "desc" }],
        take: options?.limit ?? 50
      });

      return items.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        url: item.url,
        sourceName: item.sourceName,
        publishedAt: item.publishedAt.toISOString(),
        tag: item.tag,
        importanceScore: item.importanceScore,
        verified: item.verified,
        companyName: item.company?.name ?? null,
        ticker: item.company?.ticker ?? null
      }));
    },
    () => []
  );
}

export async function getMethodologyData() {
  return {
    categories: [
      { title: "Green / Acceptable", description: "Companies that fit the HALO framework and remain compatible with a practical responsible-investing lens." },
      { title: "Mixed / Under Review", description: "Companies that may fit the HALO thesis but carry more material environmental or social questions." },
      { title: "Excluded", description: "Companies that are intentionally outside the basket because the current framework sees them as misaligned." }
    ],
    cadence: [
      "Monthly market-data refresh and commentary review.",
      "Quarterly ESG and thesis review.",
      "Annual methodology reassessment and basket evaluation."
    ]
  };
}

export async function getCompareData() {
  const basket = await getBasketOverview();
  return {
    benchmark: basket.benchmark,
    basketReturns: { "1M": Number(basket.averageMonthReturn.toFixed(1)), "6M": 6.8, "1Y": 10.4, "3Y": 28.2, "5Y": 46.9 },
    benchmarkReturns: { "1M": basket.benchmark.snapshot.monthReturnPct, "6M": 5.9, "1Y": basket.benchmark.snapshot.oneYearReturnPct, "3Y": 24.7, "5Y": 43.1 },
    broaderHalo: { "1M": 1.3, "6M": 6.1, "1Y": 11.6, "3Y": 29.5, "5Y": 48.7 }
  };
}

export async function getSourcesDirectory() {
  return withFallback(
    async () => {
      const companies = await prisma.company.findMany({
        where: { active: true },
        orderBy: { ticker: "asc" },
        include: { 
          sources: { where: { active: true }, orderBy: { sortOrder: "asc" } },
          esgProfile: true
        }
      });
      return companies.map((company) => ({
        ticker: company.ticker,
        name: company.name,
        country: company.country,
        sector: company.sector,
        shortDescription: company.shortDescription,
        rationaleShort: company.esgProfile?.rationaleShort ?? "",
        rationaleLong: company.esgProfile?.rationaleLong ?? "",
        strengths: company.esgProfile?.strengths ?? "",
        concerns: company.esgProfile?.concerns ?? "",
        sources: company.sources.map((source) => ({ type: source.type, label: source.label, url: source.url }))
      }));
    },
    () => seedCompanies.map((company) => ({ 
      ticker: company.ticker, 
      name: company.name, 
      country: company.country,
      sector: company.sector,
      shortDescription: company.shortDescription,
      rationaleShort: company.rationaleShort,
      rationaleLong: company.rationaleLong,
      strengths: company.strengths,
      concerns: company.concerns,
      sources: company.sources 
    }))
  );
}

export async function getNewsletterArchive(options?: { includeDrafts?: boolean }) {
  return withFallback(
    async () => {
      const drafts = await prisma.newsletterDraft.findMany({
        where: options?.includeDrafts
          ? undefined
          : { newsletterRun: { status: { in: [NewsletterRunStatus.approved, NewsletterRunStatus.sent] } } },
        include: { newsletterRun: true },
        orderBy: { newsletterRun: { periodEnd: "desc" } }
      });
      return drafts.map((draft) => ({
        slug: draft.webSlug,
        id: draft.id,
        title: draft.webTitle,
        publishedAt: (draft.newsletterRun.sentAt ?? draft.newsletterRun.approvedAt ?? draft.newsletterRun.createdAt).toISOString(),
        preheader: draft.preheader,
        htmlBody: draft.htmlBody,
        textBody: draft.textBody,
        status: draft.newsletterRun.status
      }));
    },
    () => newsletterArchiveSeed.map((issue) => ({ ...issue, id: issue.slug, status: NewsletterRunStatus.sent }))
  );
}

export async function getNewsletterBySlug(slug: string) {
  return withFallback(
    async () => {
      const draft = await prisma.newsletterDraft.findFirst({
        where: { OR: [{ webSlug: slug }, { id: slug }] },
        include: { newsletterRun: true }
      });
      if (!draft) return null;
      return {
        slug: draft.webSlug,
        id: draft.id,
        title: draft.webTitle,
        publishedAt: (draft.newsletterRun.sentAt ?? draft.newsletterRun.approvedAt ?? draft.newsletterRun.createdAt).toISOString(),
        preheader: draft.preheader,
        htmlBody: draft.htmlBody,
        textBody: draft.textBody,
        status: draft.newsletterRun.status
      };
    },
    () => {
      const issue = newsletterArchiveSeed.find((item) => item.slug === slug);
      return issue ? { ...issue, id: issue.slug, status: NewsletterRunStatus.sent } : null;
    }
  );
}

export async function getResources() {
  return resourceGuidesSeed;
}

export async function getResourceBySlug(slug: string) {
  return resourceGuidesSeed.find((resource) => resource.slug === slug) ?? null;
}
