import { getResources } from "@/lib/server/repository";

export default async function AdminResourcesPage() {
  const resources = await getResources();
  return (
    <div className="section">
      <section className="admin-panel"><div className="eyebrow">Resources</div><h1>Monetized guide inventory</h1></section>
      <section className="grid-2">{resources.map((resource) => <div className="admin-panel" key={resource.slug}><h2>{resource.title}</h2><p>{resource.summary}</p><div className="disclaimer">{resource.disclosure}</div></div>)}</section>
    </div>
  );
}
