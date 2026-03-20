import { prisma } from "@/lib/server/prisma";
import { benchmarkSeed, seedCompanies } from "@/lib/content/seed";
import { recordSyncHealth } from "@/lib/server/sync-health";

type PricePoint = {
  date: string;
  close: number;
};

function getReferenceValue(points: PricePoint[], daysBack: number) {
  const latest = new Date(points[0].date);
  const target = new Date(latest);
  target.setUTCDate(target.getUTCDate() - daysBack);
  return points.find((point) => new Date(point.date) <= target)?.close ?? points[points.length - 1]?.close ?? points[0]?.close;
}

function getYearStartValue(points: PricePoint[]) {
  const latest = new Date(points[0].date);
  const startOfYear = new Date(Date.UTC(latest.getUTCFullYear(), 0, 1));
  return points.find((point) => new Date(point.date) <= startOfYear)?.close ?? points[points.length - 1]?.close ?? points[0]?.close;
}

async function fetchAlphaVantageSeries(symbol: string) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "TIME_SERIES_DAILY_ADJUSTED");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("outputsize", "full");
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, { cache: "no-store" });
  const json = (await response.json()) as Record<string, Record<string, Record<string, string>>>;
  const series = json["Time Series (Daily)"];
  if (!series) return null;

  return Object.entries(series)
    .map(([date, values]) => ({ date, close: Number(values["4. close"]) }))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

function toSnapshot(points: PricePoint[]) {
  const latest = points[0];
  const prior = points[1] ?? latest;
  const month = getReferenceValue(points, 30);
  const yearStart = getYearStartValue(points);
  const yearAgo = getReferenceValue(points, 365);

  return {
    asOfDate: new Date(`${latest.date}T00:00:00.000Z`),
    closePrice: latest.close,
    dayChangePct: prior.close ? ((latest.close - prior.close) / prior.close) * 100 : 0,
    monthReturnPct: month ? ((latest.close - month) / month) * 100 : 0,
    ytdReturnPct: yearStart ? ((latest.close - yearStart) / yearStart) * 100 : 0,
    oneYearReturnPct: yearAgo ? ((latest.close - yearAgo) / yearAgo) * 100 : 0
  };
}

function getMarketSymbolFromUrl(url: string, fallbackTicker: string) {
  const match = url.match(/quote\/([^/]+)\//i);
  return match?.[1] ?? fallbackTicker;
}

export async function runMarketSync() {
  const provider = process.env.MARKET_DATA_PROVIDER ?? "demo-seed";
  if (provider !== "alpha-vantage" || !process.env.ALPHA_VANTAGE_API_KEY) {
    const result = {
      status: "ok",
      mode: "demo",
      provider,
      syncedAt: new Date().toISOString(),
      companyCount: seedCompanies.length,
      benchmark: benchmarkSeed.name,
      staleWarning: false
    };
    await recordSyncHealth("market", "sync", "market.sync.completed", result);
    return result;
  }

  const companies = await prisma.company.findMany({
    where: { active: true },
    include: { sources: { where: { type: "market_data", active: true }, take: 1 } }
  });
  const benchmark = await prisma.benchmark.findFirst({ where: { slug: "sp500" } });

  let syncedCount = 0;
  const failures: string[] = [];

  for (const company of companies) {
    const symbol = getMarketSymbolFromUrl(company.sources[0]?.url ?? "", company.ticker);
    const points = await fetchAlphaVantageSeries(symbol);
    if (!points?.length) {
      failures.push(company.ticker);
      continue;
    }
    const snapshot = toSnapshot(points);
    await prisma.marketSnapshot.upsert({
      where: { companyId_asOfDate: { companyId: company.id, asOfDate: snapshot.asOfDate } },
      update: {
        currency: "USD",
        closePrice: snapshot.closePrice,
        dayChangePct: snapshot.dayChangePct,
        monthReturnPct: snapshot.monthReturnPct,
        ytdReturnPct: snapshot.ytdReturnPct,
        oneYearReturnPct: snapshot.oneYearReturnPct,
        sourceProvider: provider,
        isDelayed: true
      },
      create: {
        companyId: company.id,
        currency: "USD",
        closePrice: snapshot.closePrice,
        dayChangePct: snapshot.dayChangePct,
        monthReturnPct: snapshot.monthReturnPct,
        ytdReturnPct: snapshot.ytdReturnPct,
        oneYearReturnPct: snapshot.oneYearReturnPct,
        sourceProvider: provider,
        isDelayed: true,
        asOfDate: snapshot.asOfDate
      }
    });
    syncedCount += 1;
  }

  if (benchmark) {
    const points = await fetchAlphaVantageSeries("SPY");
    if (points?.length) {
      const snapshot = toSnapshot(points);
      await prisma.benchmarkSnapshot.upsert({
        where: { benchmarkId_asOfDate: { benchmarkId: benchmark.id, asOfDate: snapshot.asOfDate } },
        update: {
          closeValue: snapshot.closePrice,
          monthReturnPct: snapshot.monthReturnPct,
          ytdReturnPct: snapshot.ytdReturnPct,
          oneYearReturnPct: snapshot.oneYearReturnPct
        },
        create: {
          benchmarkId: benchmark.id,
          asOfDate: snapshot.asOfDate,
          closeValue: snapshot.closePrice,
          monthReturnPct: snapshot.monthReturnPct,
          ytdReturnPct: snapshot.ytdReturnPct,
          oneYearReturnPct: snapshot.oneYearReturnPct
        }
      });
    }
  }

  const result = {
    status: failures.length ? "partial" : "ok",
    mode: "database",
    provider,
    syncedAt: new Date().toISOString(),
    companyCount: syncedCount,
    benchmark: benchmark?.name ?? benchmarkSeed.name,
    staleWarning: false,
    failures
  };
  await recordSyncHealth("market", "sync", "market.sync.completed", result);
  return result;
}
