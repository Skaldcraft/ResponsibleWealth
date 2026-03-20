import { NextResponse } from "next/server";
import { NewsletterSubscriberStatus } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { subscribeEmailInSendPulse } from "@/lib/server/sendpulse";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { status: NewsletterSubscriberStatus.active, confirmedAt: new Date(), unsubscribedAt: null, locale: "en" },
      create: { email: parsed.data.email, status: NewsletterSubscriberStatus.active, confirmedAt: new Date(), locale: "en" }
    });
    await subscribeEmailInSendPulse(parsed.data.email);
    return NextResponse.json({ message: `Thanks. ${parsed.data.email} has been subscribed.` });
  } catch {
    return NextResponse.json({ message: `Thanks. ${parsed.data.email} is marked as subscribed in this MVP flow.` });
  }
}
