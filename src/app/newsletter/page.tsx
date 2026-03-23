import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getNewsletterArchive } from "@/lib/server/repository";
import { formatDate } from "@/lib/utils";

export default async function NewsletterArchivePage() {
  const archive = await getNewsletterArchive();
  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Newsletter archive</div>
            <h1>Monthly research digests</h1>
          </div>
          <div className="hero__visual">🗞️</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            Each issue recaps the basket in a friendly, calm tone and focuses on developments that truly matter over the medium term.
          </p>
          <NewsletterSignup />
        </div>
      </section>
      <section className="grid-2">
        {archive.map((issue: { slug: string; title: string; preheader: string; publishedAt: string }) => (
          <div className="card" key={issue.slug}>
            <div className="eyebrow">{formatDate(issue.publishedAt)}</div>
            <h2>{issue.title}</h2>
            <p>{issue.preheader}</p>
            <Link className="button secondary" href={`/newsletter/${issue.slug}`}>Read issue</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
