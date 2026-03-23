import Link from "next/link";
import { getSourcesDirectory } from "@/lib/server/repository";
import { formatCountry } from "@/lib/utils";

function themeAnchor(theme: string) {
  return theme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function SourcesPage() {
  const directory = await getSourcesDirectory();
  const groupedDirectory = Object.entries(
    directory.reduce<Record<string, typeof directory>>((accumulator, entry) => {
      const theme = entry.sector;
      if (!accumulator[theme]) {
        accumulator[theme] = [];
      }
      accumulator[theme].push(entry);
      return accumulator;
    }, {})
  )
    .sort(([leftTheme], [rightTheme]) => leftTheme.localeCompare(rightTheme))
    .map(([theme, entries]) => ({
      anchor: themeAnchor(theme),
      theme,
      entries: [...entries].sort((left, right) => left.name.localeCompare(right.name))
    }));

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

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Theme index</div>
            <h2>Jump to a group</h2>
          </div>
          <p className="muted">Use the index to move directly to the theme you want.</p>
        </div>
        <div className="year-filter-group" role="navigation" aria-label="Company profile themes">
          {groupedDirectory.map(({ anchor, theme, entries }) => (
            <Link className="button secondary year-filter" href={`#${anchor}`} key={anchor}>
              {theme} ({entries.length})
            </Link>
          ))}
        </div>
      </section>

      {groupedDirectory.map(({ anchor, theme, entries }) => (
        <section className="section-block" key={theme} id={anchor}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">Theme</div>
              <h2>{theme}</h2>
            </div>
            <p className="muted">{entries.length} {entries.length === 1 ? "company" : "companies"}</p>
          </div>

          <div className="grid-2">
            {entries.map((entry) => (
              <div className="card profile-anchor" id={entry.ticker.toLowerCase()} key={entry.ticker}>
                <div className="card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--line-soft)", paddingBottom: "14px", marginBottom: "16px" }}>
                  <div>
                    <div className="eyebrow" style={{ opacity: 0.6 }}>{entry.ticker} · {formatCountry(entry.country)}</div>
                    <h3 style={{ margin: "4px 0 0" }}>{entry.name}</h3>
                  </div>
                  <div className="pill green" style={{ fontSize: "0.74rem" }}>{entry.sector}</div>
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
          </div>
        </section>
      ))}
    </div>
  );
}
