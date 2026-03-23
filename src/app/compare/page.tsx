import { Disclaimer } from "@/components/disclaimer";
import HALOCalculator from "@/components/halo-calculator";

export default function ComparePage() {
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
            Use the interactive calculator to explore how different growth paths can diverge over medium and long horizons.
          </p>
          <p className="lede">
            It keeps the same educational goal: context over noise, with inflation and assumptions shown explicitly.
          </p>
        </div>
      </section>
      <Disclaimer compact />
      <section className="card">
        <HALOCalculator />
      </section>
    </div>
  );
}
