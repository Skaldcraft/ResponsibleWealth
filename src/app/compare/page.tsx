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
        <div className="eyebrow">Compare</div>
        <h1>Medium-term comparison, not intraday noise</h1>
        <p className="lede">These comparisons are meant to show how the basket evolves over time relative to a benchmark and a broader HALO grouping. Short-term signals are intentionally not the focus.</p>
      </section>
      <Disclaimer compact />
      <section className="card">
        <PerformanceComparisonChart data={performanceData} />
      </section>
      <section className="table-wrap">
        <table>
          <thead><tr><th>Window</th><th>HALO ESG</th><th>{data.benchmark.name}</th><th>Broader HALO</th></tr></thead>
          <tbody>{windows.map((window: keyof typeof data.basketReturns) => <tr key={window}><td>{window}</td><td>{formatPercent(data.basketReturns[window])}</td><td>{formatPercent(data.benchmarkReturns[window])}</td><td>{formatPercent(data.broaderHalo[window])}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
