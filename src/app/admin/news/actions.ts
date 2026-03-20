"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { collectNews } from "@/lib/server/news-collector";
import { canVerifyNews, normalizeNewsTag } from "@/lib/news-policy";

export async function collectNewsAction() {
  await collectNews();
  revalidatePath("/admin/news");
  revalidatePath("/admin");
}

function parseReviewValues(formData: FormData) {
  const rawTag = String(formData.get("tag") ?? "");
  const rawImportanceScore = Number(formData.get("importanceScore") ?? 3);
  return {
    tag: normalizeNewsTag(rawTag),
    importanceScore: Math.max(1, Math.min(5, Number.isFinite(rawImportanceScore) ? rawImportanceScore : 3))
  };
}

export async function verifyNewsAction(newsId: string, formData: FormData) {
  const { tag, importanceScore } = parseReviewValues(formData);
  await prisma.newsItem.update({
    where: { id: newsId },
    data: {
      tag,
      importanceScore,
      verified: canVerifyNews(importanceScore)
    }
  });
  revalidatePath("/admin/news");
  revalidatePath("/admin");
}

export async function updateVerifiedNewsAction(newsId: string, formData: FormData) {
  const { tag, importanceScore } = parseReviewValues(formData);
  await prisma.newsItem.update({
    where: { id: newsId },
    data: {
      tag,
      importanceScore,
      verified: canVerifyNews(importanceScore)
    }
  });
  revalidatePath("/admin/news");
  revalidatePath("/admin");
}

export async function unverifyNewsAction(newsId: string) {
  await prisma.newsItem.update({
    where: { id: newsId },
    data: { verified: false }
  });
  revalidatePath("/admin/news");
  revalidatePath("/admin");
}
