import { Disclaimer } from "@/components/disclaimer";
import { PerformanceComparisonChart } from "@/components/research-charts";
import { getCompareData } from "@/lib/server/repository";
import { formatPercent } from "@/lib/utils";

export default async function ComparePage() {
  const data = await getCompareData();
  const windows = Object.keys(data.basketReturns) as Array<keyof typeof data.basketReturns>;
  const performanceData = windows.map((window) => ({
    window,
    basket: data.basketReturns[window],
    benchmark: data.benchmarkReturns[window],
    broaderHalo: data.broaderHalo[window]
  }));
  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Compare</div>
            <h1>Medium-term comparison, not intraday noise</h1>
          </div>
          <div className="hero__visual">⚖️</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            These comparisons illustrate how the basket moves over time compared with both a selected benchmark and the broader HALO group.
          </p>
          <p className="lede">
            The emphasis here is on understanding long-term trends and relative performance rather than reacting to temporary market signals.
          </p>
        </div>
      </section>
      <Disclaimer compact />
      <section className="card">
        <PerformanceComparisonChart data={performanceData} />
      </section>
      <section className="table-wrap table-wrap--editorial table-wrap--compare">
        <div className="table-intro">
          <div>
            <div className="eyebrow">Comparison windows</div>
            <h2>Basket, benchmark, and broader context</h2>
          </div>
          <p className="muted">These windows help you compare trajectory and context without drifting into short-term decision-making.</p>
        </div>
        <table>
          <thead><tr><th>Window</th><th>HALO ESG</th><th>{data.benchmark.name}</th><th>Broader HALO</th></tr></thead>
          <tbody>{windows.map((window: keyof typeof data.basketReturns) => <tr key={window}><td>{window}</td><td>{formatPercent(data.basketReturns[window])}</td><td>{formatPercent(data.benchmarkReturns[window])}</td><td>{formatPercent(data.broaderHalo[window])}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
