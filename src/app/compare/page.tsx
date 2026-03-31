import { Disclaimer } from "@/components/disclaimer";
import ThisIsTheCalculator from "@/components/this-is-the-calculator";

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
            Use the side-by-side analysis to compare HALO ESG index companies across fit, thesis, performance context, and excluded alternatives.
          </p>
          <p className="lede">
            The focus stays on medium-term interpretation rather than day-to-day market noise.
          </p>
        </div>
      </section>
      <Disclaimer compact />
      <section className="card">
        <ThisIsTheCalculator />
      </section>
    </div>
  );
}
