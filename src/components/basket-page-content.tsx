import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import { PerformanceComparisonChart, SectorCompositionChart } from "@/components/research-charts";
import { getBasketOverview } from "@/lib/server/repository";
import { formatDate, formatPercent } from "@/lib/utils";

export async function BasketPageContent() {
  const overview = await getBasketOverview();
  const latestAsOfDate = overview.companies[0]?.snapshot.asOfDate ?? overview.benchmark.snapshot.asOfDate;
  const performanceData = [
    {
      window: "1M",
      basket: Number(overview.averageMonthReturn.toFixed(1)),
      benchmark: overview.benchmark.snapshot.monthReturnPct,
      broaderHalo: 1.3
    },
    {
      window: "YTD",
      basket: Number((overview.companies.reduce((sum, company) => sum + company.snapshot.ytdReturnPct, 0) / Math.max(overview.companies.length, 1)).toFixed(1)),
      benchmark: overview.benchmark.snapshot.ytdReturnPct,
      broaderHalo: 6.1
    },
    {
      window: "1Y",
      basket: Number((overview.companies.reduce((sum, company) => sum + company.snapshot.oneYearReturnPct, 0) / Math.max(overview.companies.length, 1)).toFixed(1)),
      benchmark: overview.benchmark.snapshot.oneYearReturnPct,
      broaderHalo: 11.6
    }
  ];
  const sectorData = Object.entries(
    overview.companies.reduce<Record<string, number>>((accumulator, company) => {
      accumulator[company.sector] = (accumulator[company.sector] ?? 0) + 1;
      return accumulator;
    }, {})
  )
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count || a.sector.localeCompare(b.sector));

  return (
    <div className="section">
      <section className="hero">
        <div className="eyebrow">HALO ESG basket</div>
        <h1>{overview.basket.name}</h1>
        <p className="lede">{overview.basket.description}</p>
        <div className="grid-4">
          <div className="card stat"><span>Companies</span><strong>{overview.companies.length}</strong></div>
          <div className="card stat"><span>Average 1M return</span><strong>{formatPercent(overview.averageMonthReturn)}</strong></div>
          <div className="card stat"><span>Benchmark</span><strong>{overview.benchmark.name}</strong></div>
          <div className="card stat"><span>Last updated</span><strong>{formatDate(latestAsOfDate)}</strong></div>
        </div>
      </section>
      <Disclaimer compact />
      <section className="grid-2">
        <div className="card">
          <PerformanceComparisonChart data={performanceData} />
        </div>
        <div className="card">
          <SectorCompositionChart data={sectorData} />
        </div>
      </section>
      <section className="table-wrap">
        {overview.companies.length ? (
          <table>
            <thead><tr><th>Ticker</th><th>Company</th><th>Sector</th><th>Category</th><th>Price</th><th>1D</th><th>1M</th><th>1Y</th></tr></thead>
            <tbody>
              {overview.companies.map((company: { ticker: string; name: string; sector: string; esgCategory: string; snapshot: { currency: string; closePrice: number; dayChangePct: number; monthReturnPct: number; oneYearReturnPct: number } }) => (
                <tr key={company.ticker}>
                  <td><Link href={`/companies/${company.ticker.toLowerCase()}`}>{company.ticker}</Link></td>
                  <td>{company.name}</td>
                  <td>{company.sector}</td>
                  <td><span className={`pill ${company.esgCategory}`}>{company.esgCategory}</span></td>
                  <td>{company.snapshot.currency} {company.snapshot.closePrice}</td>
                  <td>{formatPercent(company.snapshot.dayChangePct)}</td>
                  <td>{formatPercent(company.snapshot.monthReturnPct)}</td>
                  <td>{formatPercent(company.snapshot.oneYearReturnPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="card">
            <h2>No active basket members yet</h2>
            <p>The basket record exists, but there are no active companies linked to it yet. This usually means the database was connected before the seed data finished loading.</p>
          </div>
        )}
      </section>
    </div>
  );
}
