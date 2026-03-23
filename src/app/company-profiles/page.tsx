import { getSourcesDirectory } from "@/lib/server/repository";
import { formatCountry } from "@/lib/utils";

export default async function SourcesPage() {
  const directory = await getSourcesDirectory();
  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Company profiles</div>
            <h1>The research behind the basket</h1>
          </div>
          <div className="hero__visual">🔍</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            Every company page links directly to external materials, inviting you to explore and verify the background research yourself.
          </p>
          <p className="lede">
            This project is not a black box; it’s a shared space built for transparency, educational trust, and verifiable information.
          </p>
        </div>
      </section>
      <section className="grid-2">
        {directory.map((entry) => (
          <div className="card profile-anchor" id={entry.ticker.toLowerCase()} key={entry.ticker}>
            <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line-soft)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div className="eyebrow" style={{ opacity: 0.6 }}>{entry.ticker} · {formatCountry(entry.country)}</div>
                <h2 style={{ margin: '4px 0 0' }}>{entry.name}</h2>
              </div>
              <div className="pill green" style={{ fontSize: '0.74rem' }}>{entry.sector}</div>
            </div>
            
            <div className="profile-info">
              <p><strong>Overview:</strong> {entry.shortDescription}</p>
              <p><strong>Rationale:</strong> {entry.rationaleShort}</p>
              {entry.strengths && <p><strong>Strengths:</strong> {entry.strengths}</p>}
              {entry.concerns && <p><strong>Concerns:</strong> {entry.concerns}</p>}
            </div>

            <div className="source-grid">
              {entry.sources.map((source: { url: string; label: string }) => (
                <a 
                  key={source.url} 
                  href={source.url} 
                  rel="noreferrer" 
                  target="_blank"
                  className="source-link"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
