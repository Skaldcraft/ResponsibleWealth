import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import { NewsletterSignup } from "@/components/newsletter-signup";

export default async function HowItWorksPage() {
  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">How it works</div>
        <div className="hero-grid hero-grid--single-focus">
          <div className="section">
            <h1>Responsible investing with a calmer, medium-term lens</h1>
            <p className="lede">
              Responsible Wealth helps readers follow durable, real-world companies through a practical responsible-investing framework. The goal is clarity over noise: understanding how ideas evolve over months and years rather than chasing short-term signals.
            </p>
            <div className="kicker-row">
              <Link className="button" href="/">Explore the HALO ESG index</Link>
              <Link className="button secondary" href="/methodology">Read Our Approach</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="grid-home">
        <div className="card">
          <div className="eyebrow">What this site does</div>
          <h2>Follow a curated basket with context</h2>
          <p>Here, you can follow the basket, understand why companies are included, and see how each role changes over time.</p>
        </div>
        <div className="card">
          <div className="eyebrow">How to use it</div>
          <h2>Read it in layers</h2>
          <p>Start with the basket and charts, move to company pages for detail, and return each month for changes that matter over the medium term.</p>
        </div>
      </section>
      <section className="grid-3">
        <div className="card"><div className="eyebrow">What this is</div><h2>Research, not instruction</h2><p>Here, you can follow the basket, understand why companies are included, and see how each role changes over time.</p></div>
        <div className="card"><div className="eyebrow">What matters here</div><h2>Durability over noise</h2><p>Charts and commentary focus on monthly and multi-year windows, with attention to infrastructure, essential services, and practical ESG relevance.</p></div>
        <div className="card"><div className="eyebrow">What to expect</div><h2>Living updates</h2><p>Monthly reviews, company updates, and newsletter summaries are designed to give each visitor a reason to return after their first read.</p></div>
      </section>
      <section className="editorial-block">
        <div className="eyebrow">Monthly digest</div>
        <h2>Receive a friendly monthly update</h2>
        <p className="lede">Each issue gives you a clear view of how the basket progressed over the past month, shares a few meaningful updates, and offers steady, down-to-earth insights to help you stay informed.</p>
        <NewsletterSignup />
      </section>
      <Disclaimer />
    </div>
  );
}

