import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import { getRecentChanges } from "@/lib/server/repository";
import { formatDate } from "@/lib/utils";

export default async function ChangesPage() {
  const changes = await getRecentChanges();

  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Recent changes</div>
            <h1>How the basket evolves over time</h1>
          </div>
          <div className="hero__visual">📜</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            This page helps make the research process transparent across months and years.
          </p>
          <p className="lede">
            It tracks how we reassess, update, and place companies in context over time instead of treating them as fixed investment picks.
          </p>
        </div>
      </section>

      <Disclaimer compact />

      <section className="grid-2">
        {changes.map((change: { companyName: string; ticker: string; title: string; summary: string; effectiveDate: string; updateType: string }) => (
          <div className="card" key={`${change.ticker}-${change.effectiveDate}-${change.title}`}>
            <div className="eyebrow">{formatDate(change.effectiveDate)}</div>
            <h2>{change.title}</h2>
            <p>{change.summary}</p>
            <p className="muted">
              {change.companyName} · {change.updateType}
            </p>
            <Link className="button secondary" href={`/companies/${change.ticker.toLowerCase()}`}>
              Open company page
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
