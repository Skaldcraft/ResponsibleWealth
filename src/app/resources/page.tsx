import Link from "next/link";
import { getResources } from "@/lib/server/repository";

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">Resources</div>
        <h1>Guides to tools and platforms</h1>
        <p className="lede">This section is intentionally separated from the editorial research pages. It is for explaining tools and access options, not for changing the research conclusions elsewhere on the site.</p>
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
