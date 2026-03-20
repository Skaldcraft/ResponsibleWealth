import { notFound } from "next/navigation";
import { getNewsletterBySlug } from "@/lib/server/repository";
import { formatDate } from "@/lib/utils";

export default async function NewsletterIssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const issue = await getNewsletterBySlug(slug);
  if (!issue) notFound();

  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">{formatDate(issue.publishedAt)}</div>
        <h1>{issue.title}</h1>
        <p className="lede">{issue.preheader}</p>
      </section>
      <article className="editorial-block prose" dangerouslySetInnerHTML={{ __html: issue.htmlBody }} />
    </div>
  );
}
