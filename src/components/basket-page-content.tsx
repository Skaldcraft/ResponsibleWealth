import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import { NewsletterSignup } from "@/components/newsletter-signup";
import ThisIsTheCalculator from "@/components/this-is-the-calculator";
import { SectorCompositionChart } from "@/components/research-charts";
import { SortableBasketTable } from "@/components/sortable-basket-table";
import { getBasketOverview, getRecentChanges } from "@/lib/server/repository";
import { formatDate, formatPercent } from "@/lib/utils";

export async function BasketPageContent({ sortBy, order }: { sortBy?: "name" | "price"; order?: "asc" | "desc" }) {
  const [overview, recentChanges] = await Promise.all([
    getBasketOverview({ sortBy, order }),
    getRecentChanges()
  ]);
  const featuredChanges = recentChanges.slice(0, 3);
  const latestAsOfDate = overview.companies[0]?.snapshot.asOfDate ?? overview.benchmark.snapshot.asOfDate;
  
  const SECTOR_MAPPING: Record<string, string> = {
    // 1. Energy Generation & Grid Infrastructure
    "Renewable Utilities": "Energy Generation & Grid Infrastructure",
    "Renewables": "Energy Generation & Grid Infrastructure",
    "Offshore Wind": "Energy Generation & Grid Infrastructure",
    "Utilities": "Energy Generation & Grid Infrastructure",
    "Regulated Utilities": "Energy Generation & Grid Infrastructure",
    "Energy Efficiency": "Energy Generation & Grid Infrastructure",
    "Electricity Transmission": "Energy Generation & Grid Infrastructure",
    
    // 2. Water & Environmental Solutions
    "Water Infrastructure": "Water & Environmental Solutions",
    "Water Technology": "Water & Environmental Solutions",
    "Water and Sustainability Solutions": "Water & Environmental Solutions",
    "Circular Economy": "Water & Environmental Solutions",
    
    // 3. Transport & Mobility Infrastructure
    "Rail Infrastructure": "Transport & Mobility Infrastructure",
    "Airport & Transport Infrastructure": "Transport & Mobility Infrastructure",
    
    // 4. Digital & Communications Infrastructure
    "Telecom Infrastructure": "Digital & Communications Infrastructure",
    
    // 5. Real Estate & Storage
    "Storage REIT": "Real Estate & Storage",
    "Sustainable Logistics REIT": "Real Estate & Storage",
    
    // Fallback/Essential (If needed - merging Essential Services into Real Estate as a physical holding)
    "Essential Services": "Real Estate & Storage"
  };

  const sectorDataMap = overview.companies.reduce<Record<string, number>>((accumulator, company) => {
    const group = SECTOR_MAPPING[company.sector] || "Other Infrastructure";
    accumulator[group] = (accumulator[group] ?? 0) + 1;
    return accumulator;
  }, {});

  const sectorData = Object.entries(sectorDataMap)
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count || a.sector.localeCompare(b.sector));

  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">HALO ESG basket</div>
            <h1>{overview.basket.name}</h1>
          </div>
          <div className="hero__visual">🏛️</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            A basket of durable, real-world companies followed through a practical responsible-investing lens.
          </p>
          <p className="lede">
            The goal is to monitor steady long-term themes. For more details on our selection criteria, visit our <Link className="inline-link" href="/method-and-purpose">Method and Purpose</Link>.
          </p>
        </div>
        <div className="grid-4">
          <div className="card stat"><span>Companies</span><strong>{overview.companies.length}</strong></div>
          <div className="card stat"><span>Average 1M return</span><strong>{formatPercent(overview.averageMonthReturn)}</strong></div>
          <div className="card stat"><span>Benchmark</span><strong>{overview.benchmark.name}</strong></div>
          <div className="card stat"><span>Last updated</span><strong>{formatDate(latestAsOfDate)}</strong></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Interactive analysis</div>
            <h2>Side-by-side comparison inside the index</h2>
          </div>
        </div>
        <div className="card card--chart">
          <ThisIsTheCalculator />
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Visual overview</div>
            <h2>Sector composition at a glance</h2>
          </div>
        </div>
        <div className="card card--chart">
          <SectorCompositionChart data={sectorData} />
        </div>
      </section>

      <section className="section-block">
        <div className="table-wrap table-wrap--editorial">
          {overview.companies.length ? (
            <>
              <div className="table-intro">
                <div>
                  <div className="eyebrow">Constituents</div>
                  <h2>Current basket members</h2>
                </div>
                <p className="muted">This table keeps the focus on the details you are most likely to revisit: sector and performance context. Click "Company" or "Price" to change the sort order.</p>
              </div>
              <SortableBasketTable 
                companies={overview.companies}
                activeSort={sortBy}
                activeOrder={order}
              />
            </>
          ) : (
            <div className="card">
              <h2>No active basket members yet</h2>
              <p>The basket record exists, but there are no active companies linked to it yet. This usually means the database was connected before the seed data finished loading.</p>
            </div>
          )}
        </div>
      </section>

      <Disclaimer compact />

      {featuredChanges.length ? (
        <section className="editorial-block editorial-block--featured">
          <div className="section-heading">
            <div>
              <div className="eyebrow">What changed recently</div>
              <h2>Recent developments shaping the basket</h2>
            </div>
            <Link className="button secondary" href="/changes">View company trend overview</Link>
          </div>
          <div className="grid-3">
            {featuredChanges.map((change: { companyName: string; ticker: string; title: string; summary: string; effectiveDate: string; updateType: string }) => (
              <article className="card card--feature" key={`${change.ticker}-${change.effectiveDate}-${change.title}`}>
                <div className="eyebrow">{formatDate(change.effectiveDate)}</div>
                <h3>{change.title}</h3>
                <p>{change.summary}</p>
                <p className="muted">{change.companyName} · {change.updateType}</p>
                <Link className="inline-link" href={`/companies/${change.ticker.toLowerCase()}`}>Open company page</Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="editorial-block">
        <div className="eyebrow">Monthly digest</div>
        <h2>Receive a friendly monthly update</h2>
        <p className="lede">Each issue gives you a clear view of how the basket progressed over the past month, shares a few meaningful updates, and offers steady, down-to-earth insights to help you stay informed.</p>
        <NewsletterSignup />
      </section>
    </div>
  );
}
