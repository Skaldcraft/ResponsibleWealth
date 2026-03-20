import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getSiteSummary } from "@/lib/server/repository";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const summary = await getSiteSummary();
  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">Public research platform</div>
        <div className="hero-grid">
          <div className="section">
            <h1>Responsible investing with a calmer, medium-term lens.</h1>
            <p className="lede">
              Responsible Wealth is designed to make durable, lower-obsolescence businesses easier to understand and follow over time. The aim is not to create an investment app, but to build a transparent research home for responsible, lower-stress investing.
            </p>
            <div className="kicker-row">
              <Link className="button" href="/halo-esg">Explore the HALO ESG index</Link>
              <Link className="button secondary" href="/methodology">Read the methodology</Link>
            </div>
          </div>
          <div className="grid-2">
            <div className="card stat"><span>Tracked companies</span><strong>{summary.companyCount}</strong></div>
            <div className="card stat"><span>Benchmark</span><strong>{summary.benchmarkName}</strong></div>
            <div className="card stat"><span>Primary basket</span><strong>{summary.basketName}</strong></div>
            <div className="card stat"><span>Latest data point</span><strong>{formatDate(summary.lastUpdated)}</strong></div>
          </div>
        </div>
      </section>
      <section className="grid-3">
        <div className="card"><div className="eyebrow">What this is</div><h2>Research, not instruction</h2><p>The platform explains how the basket evolves, why companies are included, and which real-world sources help verify the thesis.</p></div>
        <div className="card"><div className="eyebrow">What matters here</div><h2>Durability over noise</h2><p>Charts and commentary focus on monthly and multi-year windows, with attention to infrastructure, essential services, and practical ESG relevance.</p></div>
        <div className="card"><div className="eyebrow">What to expect</div><h2>Living updates</h2><p>Monthly reviews, company change logs, and newsletter summaries are designed to give people a reason to return after the first read.</p></div>
      </section>
      <section className="editorial-block">
        <div className="eyebrow">Monthly digest</div>
        <h2>Receive a friendly monthly update</h2>
        <p className="lede">Each issue summarizes how the basket changed over the last month, highlights a few relevant developments, and keeps the tone practical and calm.</p>
        <NewsletterSignup />
      </section>
      <Disclaimer />
    </div>
  );
}
