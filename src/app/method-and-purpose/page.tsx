import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import { NewsletterSignup } from "@/components/newsletter-signup";

export default async function MethodAndPurposePage() {
  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Method and Purpose</div>
            <h1>Built for a steadier kind of responsible investing</h1>
          </div>
          <div className="hero__visual">🧭</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            Responsible Wealth follows a selected group of companies linked to durable, real-world assets and screened through a practical responsible-investing lens.
          </p>
          <p className="lede">
            This project is built for readers who want clarity over noise: it focuses on how ideas and companies evolve over months and years, rather than on day-to-day market moves.
          </p>
        </div>
      </section>

      <section className="card prose">
        <div className="eyebrow">The Core Framework</div>
        <h2 style={{ marginBottom: '16px' }}>The HALO + ESG Approach</h2>
        <p>The selection combines two simple concepts. Each is useful on its own, but together they create a more balanced way to follow long-term themes without turning the site into a trading tool.</p>

        <div className="grid-2" style={{ marginTop: '28px', marginBottom: '28px' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--surface-strong) 0%, #e8e0cc 100%)',
            border: 'none',
            padding: '24px',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <div className="eyebrow">HALO</div>
            <h3>Heavy Assets, Low Obsolescence</h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--muted)' }}>Priority is given to companies whose businesses rely on tangible, long-lasting physical systems: energy networks, water systems, rail infrastructure, and logistics property.</p>
            <p style={{ fontSize: '0.94rem', color: 'var(--muted)' }}>These businesses evolve gradually. Value depends less on short-term noise and more on steady execution, regulation, maintenance, and capital investment over years.</p>
          </div>

          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--accent-soft) 0%, #cfddcc 100%)',
            border: 'none',
            padding: '24px',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <div className="eyebrow">ESG</div>
            <h3>Environmental, Social, & Governance</h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--muted)' }}>ESG here is a practical filter, not a marketing label. It distinguishes between companies that are more aligned, less aligned, or misaligned with a responsible-investing approach.</p>
            <p style={{ fontSize: '0.94rem', color: 'var(--muted)' }}>We consider environmental impact, transition credibility, governance quality, and the broader role a company plays in core infrastructure.</p>
          </div>
        </div>

        <p>
          A company may have durable assets and still raise serious ethical concerns. Conversely, a company may look strong from a sustainability perspective but still depend on a business model that is too fragile. By bringing <strong>HALO and ESG together</strong>, we highlight companies that are both anchor-businesses and reasonably aligned with responsible principles.
        </p>
      </section>

      <section className="card prose shadow-soft">
        <div className="eyebrow">The Basket</div>
        <h2>How the selection works</h2>
        <p>The companies are grouped into a basket built from the combined approach. This is an <strong>informational monitoring framework</strong>, not a portfolio model or a ready-made product.</p>
        <p>Companies are reviewed, compared, and updated over time. Some remain central to the basket, some move under review, and others lose relevance or no longer fit the approach. The aim is to help you understand:</p>
        <ul className="plain-list" style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
          <li><strong style={{ color: 'var(--accent)' }}>Why a company is included</strong> and what makes it relevant to the basket.</li>
          <li><strong style={{ color: 'var(--accent)' }}>How its role may change</strong> as its business or alignment evolves.</li>
          <li><strong style={{ color: 'var(--accent)' }}>Which risks or concerns</strong> deserve attention over the medium term.</li>
        </ul>
        <p style={{ marginTop: '20px' }}>Assessments draw on verifiable sources such as official disclosures, company materials, and structured external data.</p>
      </section>

      <section className="card prose">
        <div className="eyebrow">User Guide</div>
        <h2>How to navigate the research</h2>
        <p>The site is designed to be read step by step, moving from the big picture to the specific details.</p>
        <div className="grid-2" style={{ marginTop: '24px', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>1. Start with the Overview</h3>
            <p style={{ fontSize: '0.94rem' }}>Use the home page charts and basket table to see the main themes and how the collective group has moved over time.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>2. Explore individual companies</h3>
            <p style={{ fontSize: '0.94rem' }}>Understand how each business fits the HALO and ESG ideas, and see its recent thematic updates on its dedicated page.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>3. Check Recent Changes</h3>
            <p style={{ fontSize: '0.94rem' }}>Visit the <Link href="/changes" className="inline-link" style={{ fontWeight: 600 }}>recent changes</Link> page to see developments that matter over months, not days.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>4. Verify Official Sources</h3>
            <p style={{ fontSize: '0.94rem' }}>We provide <Link href="/sources" className="inline-link" style={{ fontWeight: 600 }}>direct source links</Link> to help you verify data and ground your own understanding in primary materials.</p>
          </div>
        </div>
      </section>

      <section className="editorial-block">
        <div className="eyebrow">Stay informed</div>
        <h2>Monthly Reviews and Newsletter</h2>
        <p className="lede">Each month, we bring together key developments in the basket, notable events, and a brief reading of the bigger picture. The goal is to keep you informed without being overwhelmed.</p>
        <div className="card card--feature" style={{ marginTop: '12px' }}>
          <p>If you would like a simple summary in your inbox when there is something new to say, you can join our monthly mailing list.</p>
          <div style={{ marginTop: '20px' }}>
            <NewsletterSignup />
          </div>
        </div>
      </section>

      <section className="card prose">
        <div className="eyebrow">Notice</div>
        <h2>Purely informational and educational</h2>
        <p>This website is built to explain and monitor a specific way of looking at companies, not to tell you what to do with your money. Nothing here is personalized investment advice or a recommendation to buy, sell, or hold any security.</p>
        <div style={{ marginTop: '24px' }}>
          <Disclaimer />
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.9rem', opacity: 0.8 }}>
          For more details, please see our <Link href="/legal/disclaimer" className="inline-link">full disclaimer</Link> and <Link href="/legal/terms" className="inline-link">terms of use</Link>.
        </p>
      </section>
    </div>
  );
}