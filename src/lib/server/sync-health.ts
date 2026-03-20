import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

type SyncMetadata = Prisma.InputJsonObject;

export async function recordSyncHealth(entityType: string, entityId: string, action: string, metadata: SyncMetadata) {
  if (!process.env.DATABASE_URL) return;
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        metadata
      }
    });
  } catch {
    // Health logging should never break the underlying sync operation.
  }
}

function getMetadataString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getMetadataNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getMetadataStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asMetadataObject(value: Prisma.JsonValue | null | undefined) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Prisma.JsonObject) : null;
}

export async function getLatestSyncHealth() {
  if (!process.env.DATABASE_URL) {
    return {
      market: null,
      news: null
    };
  }

  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ["market.sync.completed", "news.collect.completed"]
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const latestMarket = logs.find((log) => log.action === "market.sync.completed");
    const latestNews = logs.find((log) => log.action === "news.collect.completed");
    const latestMarketMetadata = asMetadataObject(latestMarket?.metadata);
    const latestNewsMetadata = asMetadataObject(latestNews?.metadata);

    return {
      market: latestMarket
        ? {
            createdAt: latestMarket.createdAt.toISOString(),
            status: getMetadataString(latestMarketMetadata?.status) ?? "unknown",
            provider: getMetadataString(latestMarketMetadata?.provider) ?? "unknown",
            syncedAt: getMetadataString(latestMarketMetadata?.syncedAt) ?? latestMarket.createdAt.toISOString(),
            companyCount: getMetadataNumber(latestMarketMetadata?.companyCount),
            failures: getMetadataStringArray(latestMarketMetadata?.failures)
          }
        : null,
      news: latestNews
        ? {
            createdAt: latestNews.createdAt.toISOString(),
            provider: getMetadataString(latestNewsMetadata?.provider) ?? "unknown",
            syncedAt: getMetadataString(latestNewsMetadata?.syncedAt) ?? latestNews.createdAt.toISOString(),
            collected: getMetadataNumber(latestNewsMetadata?.collected),
            created: getMetadataNumber(latestNewsMetadata?.created),
            apiCount: getMetadataNumber(latestNewsMetadata?.apiCount),
            feedCount: getMetadataNumber(latestNewsMetadata?.feedCount),
            pageCount: getMetadataNumber(latestNewsMetadata?.pageCount),
            sourceFailures: getMetadataStringArray(latestNewsMetadata?.sourceFailures)
          }
        : null
    };
  } catch {
    return {
      market: null,
      news: null
    };
  }
}
