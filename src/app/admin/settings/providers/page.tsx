export default function AdminProvidersPage() {
  return (
    <div className="section">
      <section className="admin-panel">
        <div className="eyebrow">Providers</div>
        <h1>Provider settings</h1>
        <p className="muted">This page documents the current configuration surface for market data, email, and authentication providers. In the MVP, values are driven by environment variables.</p>
        <ul>
          <li>Market data provider: delayed or end-of-day only</li>
          <li>Email provider: SendPulse-compatible</li>
          <li>Admin auth: environment-backed operator credentials</li>
        </ul>
      </section>
    </div>
  );
}
