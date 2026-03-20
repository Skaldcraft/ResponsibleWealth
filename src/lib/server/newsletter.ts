import { NewsletterRunStatus, NewsletterSendStatus, NewsletterSubscriberStatus } from "@prisma/client";
import { NEWSLETTER_MIN_PRIORITY, isBroaderContextTag } from "@/lib/news-policy";
import { prisma } from "@/lib/server/prisma";
import { getBasketOverview, getNewsletterBySlug, getNewsItems } from "@/lib/server/repository";
import { isSendPulseConfigured, sendNewsletterViaSendPulse } from "@/lib/server/sendpulse";

export async function buildMonthlyDigestPayload() {
  const overview = await getBasketOverview();
  const sorted = [...overview.companies].sort((a, b) => b.snapshot.monthReturnPct - a.snapshot.monthReturnPct);
  const newsPool = await getNewsItems({ verifiedOnly: true, minimumImportanceScore: NEWSLETTER_MIN_PRIORITY, limit: 20 });
  const companyDevelopments = newsPool.filter((item) => !isBroaderContextTag(item.tag)).slice(0, 3);
  const broaderContext = newsPool.filter((item) => isBroaderContextTag(item.tag)).slice(0, 2);

  return {
    periodLabel: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(overview.companies[0]?.snapshot.asOfDate ?? Date.now())),
    basketName: overview.basket.name,
    averageMonthReturn: Number(overview.averageMonthReturn.toFixed(1)),
    benchmarkName: overview.benchmark.name,
    benchmarkReturn: overview.benchmark.snapshot.monthReturnPct,
    topPerformers: sorted.slice(0, 3).map((company) => `${company.ticker} (${company.snapshot.monthReturnPct.toFixed(1)}%)`),
    bottomPerformers: sorted.slice(-3).reverse().map((company) => `${company.ticker} (${company.snapshot.monthReturnPct.toFixed(1)}%)`),
    companyDevelopments,
    broaderContext
  };
}

export async function generateNewsletterDraftData() {
  const payload = await buildMonthlyDigestPayload();
  const subject = `${payload.periodLabel} HALO ESG Review`;
  const preheader = "A calm recap of the last month across the Responsible Wealth basket.";
  const textBody = [
    `${payload.periodLabel} was a constructive month for the ${payload.basketName}.`,
    `The basket's average one-month return was ${payload.averageMonthReturn}% versus ${payload.benchmarkName} at ${payload.benchmarkReturn}%.`,
    `Top contributors: ${payload.topPerformers.join(", ")}.`,
    `Lagging names: ${payload.bottomPerformers.join(", ")}.`,
    "",
    ...(payload.companyDevelopments.length
      ? ["Company-level developments worth watching:", ...payload.companyDevelopments.map((item) => `- ${item.ticker ?? item.companyName ?? "Company"}: ${item.title}`), ""]
      : []),
    ...(payload.broaderContext.length
      ? ["Broader backdrop and trend items:", ...payload.broaderContext.map((item) => `- ${item.sourceName}: ${item.title}`), ""]
      : []),
    "",
    "From a medium-term perspective, the more useful story remains the same: durable infrastructure, essential services, and practical responsible-investing themes continue to evolve gradually rather than all at once.",
    "",
    "This newsletter is for informational purposes only and does not constitute investment advice."
  ].join("\n");

  return {
    subject,
    preheader,
    htmlBody: textBody.split("\n\n").map((paragraph) => `<p>${paragraph}</p>`).join(""),
    textBody,
    webTitle: subject,
    webSlug: `${payload.periodLabel.toLowerCase().replace(/\s+/g, "-")}-halo-esg-review`,
    modelName: "responsible-wealth-template",
    promptVersion: "v1"
  };
}

export async function createNewsletterDraft() {
  const draft = await generateNewsletterDraftData();
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  const run = await prisma.newsletterRun.create({
    data: {
      periodStart,
      periodEnd,
      status: NewsletterRunStatus.review_required,
      generatedAt: now
    }
  });

  return prisma.newsletterDraft.create({
    data: {
      newsletterRunId: run.id,
      ...draft
    }
  });
}

export async function updateNewsletterDraft(draftId: string, formData: FormData) {
  return prisma.newsletterDraft.update({
    where: { id: draftId },
    data: {
      subject: String(formData.get("subject") ?? ""),
      preheader: String(formData.get("preheader") ?? ""),
      htmlBody: String(formData.get("htmlBody") ?? ""),
      textBody: String(formData.get("textBody") ?? ""),
      webTitle: String(formData.get("webTitle") ?? ""),
      webSlug: String(formData.get("webSlug") ?? "")
    }
  });
}

export async function approveNewsletterDraft(draftId: string) {
  const draft = await prisma.newsletterDraft.findUniqueOrThrow({ where: { id: draftId } });
  await prisma.newsletterRun.update({
    where: { id: draft.newsletterRunId },
    data: {
      status: NewsletterRunStatus.approved,
      approvedAt: new Date()
    }
  });
}

export async function sendNewsletterDraft(draftId: string) {
  const draft = await prisma.newsletterDraft.findUniqueOrThrow({
    where: { id: draftId },
    include: { newsletterRun: true }
  });
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: NewsletterSubscriberStatus.active }
  });

  const from = process.env.NEWSLETTER_FROM_EMAIL;

  if (from && subscribers.length > 0 && isSendPulseConfigured()) {
    const response = await sendNewsletterViaSendPulse({
      fromEmail: from,
      subject: draft.subject,
      html: `${draft.htmlBody}<p style="font-size:12px;color:#666;">Responsible Wealth is an informational research platform. To unsubscribe, use the site unsubscribe flow.</p>`,
      text: `${draft.textBody}\n\nResponsible Wealth is an informational research platform.`,
      recipients: subscribers.map((subscriber) => ({ email: subscriber.email }))
    });

    for (const subscriber of subscribers) {
      await prisma.newsletterSendLog.create({
        data: {
          newsletterRunId: draft.newsletterRunId,
          subscriberId: subscriber.id,
          providerMessageId: String((response as { id?: string } | null)?.id ?? "sendpulse"),
          status: NewsletterSendStatus.sent,
          sentAt: new Date()
        }
      });
    }
  } else {
    for (const subscriber of subscribers) {
      await prisma.newsletterSendLog.create({
        data: {
          newsletterRunId: draft.newsletterRunId,
          subscriberId: subscriber.id,
          providerMessageId: "preview-only",
          status: NewsletterSendStatus.sent,
          sentAt: new Date()
        }
      });
    }
  }

  await prisma.newsletterRun.update({
    where: { id: draft.newsletterRunId },
    data: {
      status: NewsletterRunStatus.sent,
      sentAt: new Date()
    }
  });

  return getNewsletterBySlug(draft.webSlug);
}
