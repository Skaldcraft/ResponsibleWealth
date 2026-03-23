export default function DisclaimerPage() {
  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Legal</div>
            <h1>Disclaimer</h1>
          </div>
          <div className="hero__visual">⚖️</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            Responsible Wealth is a public research and educational platform.
          </p>
          <p className="lede">
            The content here is not personalized investment advice, portfolio management, or brokerage services.
          </p>
        </div>
      </section>
      <div className="card prose">
        <p>Content is provided for informational purposes only. Market data may be delayed, incomplete, or sourced from third parties.</p>
        <p>No content on this website should be interpreted as a recommendation to buy, sell, or hold any security.</p>
        <p>Users should verify information independently and consult a qualified professional where appropriate.</p>
      </div>
    </div>
  );
}
