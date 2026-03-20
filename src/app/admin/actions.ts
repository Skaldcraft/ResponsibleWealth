"use server";

import { revalidatePath } from "next/cache";
import { runMarketSync } from "@/lib/server/market-sync";
import { collectNews } from "@/lib/server/news-collector";

export async function triggerMarketSyncAction() {
  await Promise.all([runMarketSync(), collectNews()]);
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  revalidatePath("/halo-esg");
}
