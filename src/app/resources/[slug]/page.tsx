import { notFound } from "next/navigation";
import { getResourceBySlug } from "@/lib/server/repository";

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();

  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">{resource.platform}</div>
        <h1>{resource.title}</h1>
        <p className="lede">{resource.summary}</p>
      </section>
      <div className="disclaimer">{resource.disclosure}</div>
      <section className="card">
        <div className="eyebrow">How to use it thoughtfully</div>
        <ul>{resource.sections.map((section) => <li key={section}>{section}</li>)}</ul>
        <a className="button" href={resource.link} rel="noreferrer" target="_blank">Visit {resource.platform}</a>
      </section>
    </div>
  );
}
