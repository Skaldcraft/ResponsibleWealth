import { Disclaimer } from "@/components/disclaimer";

export default async function MethodologyPage() {
  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">Our Approach</div>
        <h1>How We Choose and Review Companies</h1>
        <p className="lede">This website follows a group of companies selected for two main reasons: they are linked to durable, real-world assets, and they meet a practical set of responsible-investing criteria. The goal is to help you understand and monitor medium- and long-term investment themes in a calm, informed way, without turning the site into a trading tool or a source of personalized advice.</p>
      </section>
      <Disclaimer />
      <section className="card prose">
        <div className="eyebrow">What HALO Means</div>
        <h2>Heavy Assets, Low Obsolescence</h2>
        <p><strong>HALO</strong> stands for <strong>Heavy Assets, Low Obsolescence</strong>.</p>
        <p>This concept gives priority to companies whose businesses rely on tangible, long-lasting assets such as energy networks, water systems, rail infrastructure, logistics property, and other essential physical systems. These are usually businesses that evolve gradually rather than being transformed overnight.</p>
        <p>Why this matters: companies built around durable assets can be easier to follow from a medium- and long-term perspective. Their value often depends less on short-term market noise and more on steady execution, regulation, maintenance, capital investment, and real demand over time.</p>
      </section>
      <section className="card prose">
        <div className="eyebrow">What ESG Means Here</div>
        <h2>Environmental, social, and governance criteria</h2>
        <p><strong>ESG</strong> refers to <strong>environmental, social, and governance</strong> criteria.</p>
        <p>Here, ESG is not treated as a slogan or a marketing label. It works as a practical filter to distinguish between companies that are more aligned, less aligned, or clearly misaligned with a responsible-investing approach.</p>
        <p>That means the analysis goes beyond financial durability alone. It also considers environmental impact, transition credibility, governance quality, controversies, and the broader role a company plays in society and infrastructure.</p>
      </section>
      <section className="card prose">
        <div className="eyebrow">Why Combine HALO and ESG</div>
        <h2>Two ideas that work better together</h2>
        <p>These two ideas are combined because each one is incomplete on its own.</p>
        <p>A company may have durable assets and still raise serious ethical concerns. On the other hand, a company may look strong from a sustainability perspective but still depend on a business model that is too fragile, speculative, or exposed to rapid obsolescence.</p>
        <p>By bringing HALO and ESG together, this site highlights companies that are both:</p>
        <ul>
          <li>built on durable, easy-to-understand businesses</li>
          <li>reasonably aligned with a responsible-investing approach</li>
        </ul>
        <p>That creates a more selective and balanced way for you to follow investment themes over the medium and long term.</p>
      </section>
      <section className="card prose">
        <div className="eyebrow">How This Is Applied on the Website</div>
        <h2>Informational monitoring, not recommendation</h2>
        <p>This website uses that combined approach as an <strong>informational monitoring framework</strong>.</p>
        <p>Companies are reviewed, compared, and updated over time. Some remain central to the basket, some move under review, and others lose relevance or no longer fit the approach. That is intentional: the basket is not meant to be static or automatic.</p>
        <p>Here, the aim is to help you understand:</p>
        <ul>
          <li>why a company is included</li>
          <li>what makes it relevant</li>
          <li>which risks or concerns deserve attention</li>
          <li>how its role may change over time</li>
        </ul>
        <p>In short, this website is designed to explain and monitor, not simply to list companies.</p>
      </section>
      <section className="card prose">
        <div className="eyebrow">How to Read the Information</div>
        <h2>Use it to understand the bigger picture</h2>
        <p>The data and commentary here are meant to support understanding, not quick decisions.</p>
        <p>Price data, charts, company updates, and broader context are presented to help you follow how these themes evolve over months and years. Short-term market movements may appear, but they are not the main focus.</p>
        <p>Whenever possible, the analysis is tied to verifiable sources, including company materials, official disclosures, and structured external data.</p>
      </section>
      <section className="card prose">
        <div className="eyebrow">Important Clarification</div>
        <h2>Informational and educational use only</h2>
        <p>This website is for informational and educational purposes only.</p>
        <p>It does not provide personalized investment advice and should not be understood as a recommendation to buy, sell, or hold any security. Data may be delayed, incomplete, or affected by third-party errors. You should always use your own judgment and, where appropriate, consult a qualified professional.</p>
      </section>
    </div>
  );
}
