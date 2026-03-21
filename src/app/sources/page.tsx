import { getSourcesDirectory } from "@/lib/server/repository";

export default async function SourcesPage() {
  const directory = await getSourcesDirectory();
  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">Sources</div>
        <h1>Source transparency is part of the product</h1>
        <p className="lede">Every company page links directly to external sources, inviting you to explore and verify the research yourself—because this platform isn’t a black box; it’s a space built for transparency and trust.</p>
      </section>
      <section className="grid-2">
        {directory.map((entry: { ticker: string; name: string; sources: Array<{ url: string; label: string }> }) => (
          <div className="card" key={entry.ticker}>
            <div className="eyebrow">{entry.ticker}</div>
            <h2>{entry.name}</h2>
            <ul>{entry.sources.map((source: { url: string; label: string }) => <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></li>)}</ul>
          </div>
        ))}
      </section>
    </div>
  );
}
