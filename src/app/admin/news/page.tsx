import { collectNewsAction, unverifyNewsAction, updateVerifiedNewsAction, verifyNewsAction } from "@/app/admin/news/actions";
import {
  NEWS_PRIORITY_OPTIONS,
  NEWS_REVIEW_CRITERIA,
  NEWS_TAGS,
  NEWSLETTER_SELECTION_RULES,
  VERIFYABLE_NEWS_MIN_PRIORITY,
  getPriorityLabel
} from "@/lib/news-policy";
import { getNewsItems } from "@/lib/server/repository";
import { formatDate } from "@/lib/utils";

export default async function AdminNewsPage() {
  const newsItems = await getNewsItems();
  return (
    <div className="section">
      <section className="admin-panel"><div className="eyebrow">News</div><h1>Verified news workflow</h1><p className="muted">Collect from allowed APIs and configured feeds, then verify only the items that deserve to feed the public research workflow.</p></section>
      <form action={collectNewsAction}>
        <button type="submit">Collect latest news</button>
      </form>
      <section className="grid-2">
        <div className="admin-panel">
          <div className="eyebrow">Review criteria</div>
          <h2>Verify only high-signal items</h2>
          <ul className="plain-list">
            {NEWS_REVIEW_CRITERIA.map((criterion) => <li key={criterion}>{criterion}</li>)}
          </ul>
        </div>
        <div className="admin-panel">
          <div className="eyebrow">Newsletter rules</div>
          <h2>What can reach the monthly report</h2>
          <ul className="plain-list">
            {NEWSLETTER_SELECTION_RULES.map((criterion) => <li key={criterion}>{criterion}</li>)}
          </ul>
        </div>
      </section>
      <section className="grid-2">
        {newsItems.length ? newsItems.map((item: { id: string; title: string; summary: string; sourceName: string; publishedAt: string; verified: boolean; url: string; companyName: string | null; ticker: string | null; tag: string; importanceScore: number }) => (
          <div className="admin-panel" key={item.id}>
            <div className="eyebrow">{formatDate(item.publishedAt)}</div>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <p className="muted">{item.sourceName}{item.companyName ? ` · ${item.companyName}` : ""}</p>
            <p className="muted">Tag: {item.tag} · Priority: {getPriorityLabel(item.importanceScore)}</p>
            <a href={item.url} rel="noreferrer" target="_blank">Open source</a>
            <div className="kicker-row">
              <form className="stack-form" action={(item.verified ? updateVerifiedNewsAction : verifyNewsAction).bind(null, item.id)}>
                <label>
                  Tag
                  <select defaultValue={item.tag} name="tag">
                    {NEWS_TAGS.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                </label>
                <label>
                  Priority
                  <select defaultValue={String(Math.max(item.importanceScore, VERIFYABLE_NEWS_MIN_PRIORITY))} name="importanceScore">
                    {NEWS_PRIORITY_OPTIONS.filter((option) => option.value >= VERIFYABLE_NEWS_MIN_PRIORITY).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit">{item.verified ? "Save review" : "Verify item"}</button>
              </form>
              {item.verified ? (
                <form action={unverifyNewsAction.bind(null, item.id)}>
                  <button type="submit">Mark unverified</button>
                </form>
              ) : null}
            </div>
          </div>
        )) : <div className="admin-panel">No collected news yet.</div>}
      </section>
    </div>
  );
}
