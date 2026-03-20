import { notFound } from "next/navigation";
import { approveDraftAction, sendDraftAction, updateDraftAction } from "@/app/admin/newsletters/actions";
import { getNewsletterBySlug } from "@/lib/server/repository";

export default async function AdminNewsletterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await getNewsletterBySlug(id);
  if (!issue) notFound();

  return (
    <div className="section">
      <section className="admin-panel"><div className="eyebrow">Newsletter issue</div><h1>{issue.title}</h1><p className="muted">This view is ready to evolve into an editor, approval, and send workflow.</p></section>
      <form className="admin-panel stack-form" action={updateDraftAction.bind(null, issue.id ?? issue.slug)}>
        <label>Subject<input name="subject" defaultValue={issue.title} /></label>
        <label>Preheader<input name="preheader" defaultValue={issue.preheader} /></label>
        <label>Web title<input name="webTitle" defaultValue={issue.title} /></label>
        <label>Web slug<input name="webSlug" defaultValue={issue.slug} /></label>
        <label>HTML body<textarea name="htmlBody" defaultValue={issue.htmlBody} /></label>
        <label>Text body<textarea name="textBody" defaultValue={issue.textBody} /></label>
        <button type="submit">Save draft</button>
      </form>
      <div className="kicker-row">
        <form action={approveDraftAction.bind(null, issue.id ?? issue.slug)}>
          <button type="submit">Approve draft</button>
        </form>
        <form action={sendDraftAction.bind(null, issue.id ?? issue.slug)}>
          <button type="submit">Send / publish issue</button>
        </form>
      </div>
    </div>
  );
}
