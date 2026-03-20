import Link from "next/link";
import { createDraftAction } from "@/app/admin/newsletters/actions";
import { getNewsletterArchive } from "@/lib/server/repository";

export default async function AdminNewslettersPage() {
  const archive = await getNewsletterArchive({ includeDrafts: true });
  return (
    <div className="section">
      <section className="admin-panel"><div className="eyebrow">Newsletters</div><h1>Newsletter pipeline</h1><p className="muted">The MVP ships with archive browsing and API support for draft generation.</p></section>
      <form action={createDraftAction}>
        <button type="submit">Generate monthly draft</button>
      </form>
      <section className="grid-2">{archive.map((issue) => <div className="admin-panel" key={issue.slug}><h2>{issue.title}</h2><p>{issue.preheader}</p><Link className="button secondary" href={`/admin/newsletters/${issue.id ?? issue.slug}`}>Open issue</Link></div>)}</section>
    </div>
  );
}
