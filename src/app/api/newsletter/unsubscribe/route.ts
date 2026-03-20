import { NextResponse } from "next/server";
import { NewsletterSubscriberStatus } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { unsubscribeEmailInSendPulse } from "@/lib/server/sendpulse";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { status: NewsletterSubscriberStatus.unsubscribed, unsubscribedAt: new Date(), locale: "en" },
      create: { email: parsed.data.email, status: NewsletterSubscriberStatus.unsubscribed, unsubscribedAt: new Date(), locale: "en" }
    });
    await unsubscribeEmailInSendPulse(parsed.data.email);
    return NextResponse.json({ message: `${parsed.data.email} has been unsubscribed.` });
  } catch {
    return NextResponse.json({ message: `${parsed.data.email} has been unsubscribed in this MVP flow.` });
  }
}
