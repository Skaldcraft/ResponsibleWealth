import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { createNewsletterDraft } from "@/lib/server/newsletter";

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await createNewsletterDraft());
}
