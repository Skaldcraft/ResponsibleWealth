import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { runMarketSync } from "@/lib/server/market-sync";
import { collectNews } from "@/lib/server/news-collector";

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [market, news] = await Promise.all([runMarketSync(), collectNews()]);
  return NextResponse.json({ market, news });
}
