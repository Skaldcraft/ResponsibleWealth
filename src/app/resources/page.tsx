import Link from "next/link";
import { getResources } from "@/lib/server/repository";

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Resources</div>
            <h1>Guides to tools and platforms</h1>
          </div>
          <div className="hero__visual">📚</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            This section is intentionally separated from our main editorial and company research pages.
          </p>
          <p className="lede">
            It focuses on explaining external tools and data access options, rather than re-evaluating research conclusions.
          </p>
        </div>
      </section>
      <section className="grid-2">
        {resources.map((resource: { slug: string; title: string; summary: string; disclosure: string }) => (
          <div className="card" key={resource.slug}>
            <div className="eyebrow">Resource guide</div>
            <h2>{resource.title}</h2>
            <p>{resource.summary}</p>
            <div className="disclaimer">{resource.disclosure}</div>
            <Link className="button secondary" href={`/resources/${resource.slug}`}>Read guide</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
