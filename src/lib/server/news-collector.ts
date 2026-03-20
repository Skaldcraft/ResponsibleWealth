import { prisma } from "@/lib/server/prisma";
import { classifyConfiguredFeedItem, inferImportanceScore, normalizeNewsTag, type NewsTag } from "@/lib/news-policy";
import { recordSyncHealth } from "@/lib/server/sync-health";

type FeedItem = {
  title: string;
  summary: string;
  url: string;
  publishedAt: Date;
  sourceName: string;
  ticker?: string;
  companyId?: string;
  tag: NewsTag;
  importanceBoost?: number;
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

function getAtomLink(block: string) {
  const href = block.match(/<link[^>]*href="([^"]+)"/i);
  return href?.[1] ?? "";
}

function stripHtml(value: string) {
  return decodeXml(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getJsonLdBlocks(html: string) {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
}

function normalizeToArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractJsonLdArticles(value: unknown): Array<Record<string, unknown>> {
  if (!value || typeof value !== "object") return [];

  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractJsonLdArticles(entry));
  }

  const record = value as Record<string, unknown>;
  const type = normalizeToArray(record["@type"]).join(",");
  const itemListEntries = normalizeToArray(record.itemListElement);

  const fromItemList = itemListEntries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const entryRecord = entry as Record<string, unknown>;
    return extractJsonLdArticles(entryRecord.item ?? entryRecord);
  });

  const direct = /NewsArticle|Article|PressRelease/i.test(type) ? [record] : [];
  return [...direct, ...fromItemList];
}

function parseConfiguredPageItems(html: string, pageUrl: string, companyId?: string): FeedItem[] {
  const hostname = new URL(pageUrl).hostname;
  const items: FeedItem[] = [];

  for (const block of getJsonLdBlocks(html)) {
    try {
      const parsed = JSON.parse(block) as unknown;
      const articles = extractJsonLdArticles(parsed);
      for (const article of articles) {
        const title = String(article.headline ?? article.name ?? "").trim();
        const summary = stripHtml(String(article.description ?? ""));
        const url = String(article.url ?? article.mainEntityOfPage ?? "").trim();
        const publishedRaw = String(article.datePublished ?? article.dateModified ?? "").trim();
        if (!title || !url) continue;
        const classification = classifyConfiguredFeedItem({
          feedUrl: pageUrl,
          sourceName: hostname,
          title,
          summary
        });
        items.push({
          title,
          summary: summary.slice(0, 420),
          url,
          publishedAt: publishedRaw ? new Date(publishedRaw) : new Date(),
          sourceName: classification.sourceName,
          companyId,
          tag: classification.tag,
          importanceBoost: classification.importanceBoost
        });
      }
    } catch {
      // Ignore malformed JSON-LD blocks and continue.
    }
  }

  return items;
}

function parseRssItems(xml: string, feedUrl: string): FeedItem[] {
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  const entryBlocks = xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  const blocks = itemBlocks.length ? itemBlocks : entryBlocks;
  const hostname = new URL(feedUrl).hostname;

  return blocks
    .map((block) => {
      const title = getTag(block, "title");
      const summary = getTag(block, "description") || getTag(block, "summary") || getTag(block, "content");
      const url = getTag(block, "link") || getAtomLink(block);
      const publishedRaw = getTag(block, "pubDate") || getTag(block, "published") || getTag(block, "updated");
      const publishedAt = publishedRaw ? new Date(publishedRaw) : new Date();
      const classification = classifyConfiguredFeedItem({
        feedUrl,
        sourceName: hostname,
        title,
        summary
      });
      return {
        title,
        summary: summary.replace(/<[^>]+>/g, "").slice(0, 420),
        url,
        publishedAt,
        sourceName: classification.sourceName,
        tag: classification.tag,
        importanceBoost: classification.importanceBoost
      };
    })
    .filter((item) => item.title && item.url);
}

async function fetchAlphaVantageNews() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return [] as FeedItem[];

  const tickers = (await prisma.company.findMany({
    where: { active: true },
    select: { ticker: true }
  })).map((company) => company.ticker);

  if (!tickers.length) return [];

  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "NEWS_SENTIMENT");
  url.searchParams.set("tickers", tickers.join(","));
  url.searchParams.set("limit", "50");
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, { cache: "no-store" });
  const json = (await response.json()) as { feed?: Array<{ title: string; summary: string; url: string; time_published: string; topics?: Array<{ topic: string }>; ticker_sentiment?: Array<{ ticker: string }> }> };
  const feed = json.feed ?? [];

  return feed.map((item): FeedItem => ({
    title: item.title,
    summary: item.summary ?? "",
    url: item.url,
    publishedAt: item.time_published ? new Date(item.time_published.replace(/^(\d{4})(\d{2})(\d{2})T/, "$1-$2-$3T")) : new Date(),
    sourceName: "Alpha Vantage News",
    ticker: item.ticker_sentiment?.[0]?.ticker,
    tag: normalizeNewsTag(item.topics?.[0]?.topic ?? "", item.title, item.summary ?? "", "Alpha Vantage News"),
    importanceBoost: 0
  }));
}

async function fetchConfiguredFeeds() {
  const urls = (process.env.NEWS_FEED_URLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const items: FeedItem[] = [];
  const sourceFailures: string[] = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      const xml = await response.text();
      items.push(...parseRssItems(xml, url));
    } catch {
      // Keep collection resilient; individual feed failures should not stop ingestion.
      sourceFailures.push(url);
    }
  }

  return { items, sourceFailures };
}

async function fetchConfiguredPages() {
  const envUrls = (process.env.NEWS_PAGE_URLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((url) => ({ url, companyId: undefined as string | undefined }));

  const sourceUrls = await prisma.companySource.findMany({
    where: { active: true, type: "news" },
    select: { url: true, companyId: true }
  });

  const deduped = new Map<string, string | undefined>();
  for (const item of [...sourceUrls, ...envUrls]) {
    deduped.set(item.url, deduped.get(item.url) ?? item.companyId);
  }

  const items: FeedItem[] = [];
  const sourceFailures: string[] = [];
  for (const [url, companyId] of deduped.entries()) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      const html = await response.text();
      items.push(...parseConfiguredPageItems(html, url, companyId));
    } catch {
      // Keep collection resilient; individual page failures should not stop ingestion.
      sourceFailures.push(url);
    }
  }

  return { items, sourceFailures };
}

async function resolveCompanyId(ticker?: string) {
  if (!ticker) return null;
  const company = await prisma.company.findFirst({ where: { ticker: { equals: ticker, mode: "insensitive" } }, select: { id: true } });
  return company?.id ?? null;
}

export async function collectNews() {
  const [apiItems, feedResult, pageResult] = await Promise.all([fetchAlphaVantageNews(), fetchConfiguredFeeds(), fetchConfiguredPages()]);
  const feedItems = feedResult.items;
  const pageItems = pageResult.items;
  const items = [...apiItems, ...feedItems, ...pageItems];

  let created = 0;

  for (const item of items) {
    const existing = await prisma.newsItem.findFirst({
      where: { url: item.url }
    });
    if (existing) continue;

    const companyId = item.companyId ?? (await resolveCompanyId(item.ticker));
    const importanceScore = inferImportanceScore({
      tag: item.tag,
      hasCompany: Boolean(companyId),
      title: item.title,
      summary: item.summary,
      sourceName: item.sourceName
    });
    const boostedImportanceScore = Math.max(1, Math.min(5, importanceScore + (item.importanceBoost ?? 0)));
    await prisma.newsItem.create({
      data: {
        companyId,
        title: item.title,
        summary: item.summary,
        url: item.url,
        sourceName: item.sourceName,
        publishedAt: item.publishedAt,
        tag: item.tag,
        importanceScore: boostedImportanceScore,
        verified: false
      }
    });
    created += 1;
  }

  const result = {
    collected: items.length,
    created,
    provider: process.env.NEWS_PROVIDER ?? "alpha-vantage",
    feedCount: feedItems.length,
    pageCount: pageItems.length,
    apiCount: apiItems.length,
    sourceFailures: [...feedResult.sourceFailures, ...pageResult.sourceFailures],
    syncedAt: new Date().toISOString()
  };

  await recordSyncHealth("news", "collector", "news.collect.completed", result);

  return result;
}
