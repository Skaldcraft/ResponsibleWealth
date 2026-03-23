import { notFound } from "next/navigation";
import { Disclaimer } from "@/components/disclaimer";
import { CompanyScoreChart } from "@/components/research-charts";
import { getCompanyByTicker } from "@/lib/server/repository";
import { formatCountry, formatDate, formatPercent } from "@/lib/utils";

export default async function CompanyPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const company = await getCompanyByTicker(ticker);
  if (!company) notFound();
  const scoreData = [
    { label: "HALO fit", value: company.haloFit, fullMark: 5 },
    { label: "ESG fit", value: company.esgFit, fullMark: 5 },
    { label: "Medium-term", value: company.mediumTermScore, fullMark: 5 }
  ];
  const latestMovement = [
    `1D ${formatPercent(company.snapshot.dayChangePct)}`,
    `1M ${formatPercent(company.snapshot.monthReturnPct)}`,
    `YTD ${formatPercent(company.snapshot.ytdReturnPct)}`,
    `1Y ${formatPercent(company.snapshot.oneYearReturnPct)}`
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
          <span className="pill">{formatCountry(company.country)}</span>
        </div>
      </section>
      <Disclaimer compact />

      <section className="grid-home">
        <div className="card card--feature">
          <div className="eyebrow">Why it matters now</div>
          <h2>{company.rationaleShort}</h2>
          <p>{company.rationaleLong}</p>
          <div className="chart-annotation">This company is being followed primarily as a medium-term expression of durable assets, operating resilience, and practical ESG alignment.</div>
        </div>
        <div className="card company-snapshot">
          <div className="eyebrow">Latest snapshot</div>
          <h2>{company.snapshot.currency} {company.snapshot.closePrice}</h2>
          <p>As of {formatDate(company.snapshot.asOfDate)}</p>
          <div className="company-snapshot__grid">
            {latestMovement.map((item) => (
              <div className="company-snapshot__item" key={item}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="card card--chart">
        <CompanyScoreChart data={scoreData} />
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="eyebrow">Key strengths and concerns</div>
          <h2>What supports the current thesis</h2>
          <p><strong>Strengths:</strong> {company.strengths}</p>
          <p><strong>Concerns:</strong> {company.concerns}</p>
        </div>
        <div className="card">
          <div className="eyebrow">Medium-term watchpoints</div>
          <h2>What to monitor next</h2>
          <ul>{company.watchpoints.length ? company.watchpoints.map((item: string) => <li key={item}>{item}</li>) : <li>Follow major capital allocation, operating execution, and classification changes over time.</li>}</ul>
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="eyebrow">Recent updates</div>
          <h2>How the story has changed</h2>
          {company.updates.length ? company.updates.map((update: { title: string; effectiveDate: string; summary: string; body: string }) => (
            <article key={`${update.title}-${update.effectiveDate}`} className="update-item">
              <div className="eyebrow">{formatDate(update.effectiveDate)}</div>
              <h3>{update.title}</h3>
              <p>{update.summary}</p>
              <p>{update.body}</p>
            </article>
          )) : <p>No published updates yet.</p>}
        </div>
        <div className="card">
          <div className="eyebrow">Review history</div>
          <h2>Review rhythm over time</h2>
          {company.reviews.length ? company.reviews.map((review: { reviewType: string; reviewedAt: string; summary: string }) => (
            <article key={`${review.reviewType}-${review.reviewedAt}`} className="update-item">
              <div className="eyebrow">{formatDate(review.reviewedAt)}</div>
              <h3>{review.reviewType}</h3>
              <p>{review.summary}</p>
            </article>
          )) : <p>No review log entries yet.</p>}
        </div>
      </section>

      <section className="card">
        <div className="eyebrow">Source links</div>
        <h2>Verify the underlying materials</h2>
        <div className="source-list">
          {company.sources.map((source: { url: string; label: string }) => (
            <a className="source-list__item" href={source.url} key={source.url} rel="noreferrer" target="_blank">
              {source.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
