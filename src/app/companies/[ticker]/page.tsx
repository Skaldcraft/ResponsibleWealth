import { notFound } from "next/navigation";
import { Disclaimer } from "@/components/disclaimer";
import { CompanyScoreChart } from "@/components/research-charts";
import { getCompanyByTicker } from "@/lib/server/repository";
import { formatDate, formatPercent } from "@/lib/utils";

export default async function CompanyPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const company = await getCompanyByTicker(ticker);
  if (!company) notFound();
  const scoreData = [
    { label: "HALO fit", value: company.haloFit, fullMark: 5 },
    { label: "ESG fit", value: company.esgFit, fullMark: 5 },
    { label: "Medium-term", value: company.mediumTermScore, fullMark: 5 }
  ];

  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">{company.ticker}</div>
        <h1>{company.name}</h1>
        <p className="lede">{company.shortDescription}</p>
        <div className="kicker-row">
          <span className={`pill ${company.esgCategory}`}>{company.esgCategory}</span>
          <span className="pill">{company.sector}</span>
          <span className="pill">{company.country}</span>
        </div>
      </section>
      <Disclaimer compact />
      <section className="grid-2">
        <div className="card">
          <div className="eyebrow">Why it belongs here</div>
          <h2>{company.rationaleShort}</h2>
          <p>{company.rationaleLong}</p>
          <p><strong>Strengths:</strong> {company.strengths}</p>
          <p><strong>Concerns:</strong> {company.concerns}</p>
        </div>
        <div className="card">
          <div className="eyebrow">Latest data</div>
          <h2>{company.snapshot.currency} {company.snapshot.closePrice}</h2>
          <p>As of {formatDate(company.snapshot.asOfDate)}.</p>
          <p>1D: {formatPercent(company.snapshot.dayChangePct)}</p>
          <p>1M: {formatPercent(company.snapshot.monthReturnPct)}</p>
          <p>YTD: {formatPercent(company.snapshot.ytdReturnPct)}</p>
          <p>1Y: {formatPercent(company.snapshot.oneYearReturnPct)}</p>
        </div>
      </section>
      <section className="card">
        <CompanyScoreChart data={scoreData} />
      </section>
      <section className="grid-2">
        <div className="card">
          <div className="eyebrow">Medium-term watchpoints</div>
          <ul>{company.watchpoints.length ? company.watchpoints.map((item: string) => <li key={item}>{item}</li>) : <li>Follow major capital allocation, operating execution, and classification changes over time.</li>}</ul>
        </div>
        <div className="card">
          <div className="eyebrow">Source links</div>
          <ul>{company.sources.map((source: { url: string; label: string }) => <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></li>)}</ul>
        </div>
      </section>
      <section className="grid-2">
        <div className="card">
          <div className="eyebrow">Recent updates</div>
          {company.updates.length ? company.updates.map((update: { title: string; effectiveDate: string; summary: string; body: string }) => <div key={`${update.title}-${update.effectiveDate}`} className="section"><h3>{update.title}</h3><p>{update.summary}</p><p>{update.body}</p></div>) : <p>No published updates yet.</p>}
        </div>
        <div className="card">
          <div className="eyebrow">Review history</div>
          {company.reviews.length ? company.reviews.map((review: { reviewType: string; reviewedAt: string; summary: string }) => <div key={`${review.reviewType}-${review.reviewedAt}`} className="section"><h3>{review.reviewType}</h3><p>{review.summary}</p><p className="muted">{formatDate(review.reviewedAt)}</p></div>) : <p>No review log entries yet.</p>}
        </div>
      </section>
    </div>
  );
}
