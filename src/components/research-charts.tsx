type PerformancePoint = {
  window: string;
  basket: number;
  benchmark: number;
  broaderHalo?: number;
};

type SectorPoint = {
  sector: string;
  count: number;
};

type ScorePoint = {
  label: string;
  value: number;
  fullMark: number;
};

const CHART_COLORS = {
  basket: "#2d6a4f",
  benchmark: "#7d5a11",
  broaderHalo: "#7d8f86",
  bars: ["#2d6a4f", "#4d7c61", "#7ba286", "#9bb8a0", "#bfd0bf", "#d7dfcf"]
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function buildLinePath(values: number[], width: number, height: number, padding: number, minValue: number, maxValue: number) {
  if (!values.length) return "";
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const denominator = Math.max(maxValue - minValue, 1);

  return values
    .map((value, index) => {
      const x = padding + (innerWidth * index) / Math.max(values.length - 1, 1);
      const y = padding + innerHeight - ((value - minValue) / denominator) * innerHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function getPointCoordinates(values: number[], width: number, height: number, padding: number, minValue: number, maxValue: number) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const denominator = Math.max(maxValue - minValue, 1);

  return values.map((value, index) => ({
    value,
    x: padding + (innerWidth * index) / Math.max(values.length - 1, 1),
    y: padding + innerHeight - ((value - minValue) / denominator) * innerHeight
  }));
}

function getPerformanceHighlight(data: PerformancePoint[]) {
  if (!data.length) return "This chart will become more descriptive as more historical points are stored.";
  const latest = data[data.length - 1];
  const gap = latest.basket - latest.benchmark;
  if (gap > 1.5) return `Over the latest ${latest.window} window, the basket is outperforming the benchmark by ${formatPercent(gap)}.`;
  if (gap < -1.5) return `Over the latest ${latest.window} window, the basket trails the benchmark by ${formatPercent(Math.abs(gap))}, which is worth watching in context.`;
  return `Over the latest ${latest.window} window, the basket and benchmark remain relatively close, which supports a calmer, medium-term reading.`;
}

export function PerformanceComparisonChart({ data }: { data: PerformancePoint[] }) {
  const width = 760;
  const height = 320;
  const padding = 34;
  const allValues = data.flatMap((item) => [item.basket, item.benchmark, ...(typeof item.broaderHalo === "number" ? [item.broaderHalo] : [])]);
  const minValue = Math.min(0, ...allValues) - 2;
  const maxValue = Math.max(0, ...allValues) + 2;
  const basketValues = data.map((item) => item.basket);
  const benchmarkValues = data.map((item) => item.benchmark);
  const broaderValues = data.map((item) => item.broaderHalo ?? Number.NaN);
  const basketPoints = getPointCoordinates(basketValues, width, height, padding, minValue, maxValue);
  const benchmarkPoints = getPointCoordinates(benchmarkValues, width, height, padding, minValue, maxValue);
  const broaderPoints = getPointCoordinates(broaderValues.map((value) => (Number.isNaN(value) ? minValue : value)), width, height, padding, minValue, maxValue);
  const yTicks = 4;

  return (
    <div className="chart-shell">
      <div className="chart-shell__header">
        <div className="eyebrow">Performance path</div>
        <h2>Basket vs benchmark</h2>
        <p className="muted">A medium-term comparison across the windows that matter most for this project.</p>
        <div className="chart-shell__meta">
          <span className="chart-note">Medium-term windows only</span>
          <span className="chart-note">Context before signals</span>
        </div>
      </div>
      <div className="chart-area">
        <svg aria-label="Basket versus benchmark performance chart" className="chart-svg" viewBox={`0 0 ${width} ${height}`}>
          {Array.from({ length: yTicks + 1 }).map((_, index) => {
            const ratio = index / yTicks;
            const y = padding + (height - padding * 2) * ratio;
            const tickValue = maxValue - (maxValue - minValue) * ratio;
            return (
              <g key={tickValue}>
                <line className="chart-grid-line" x1={padding} x2={width - padding} y1={y} y2={y} />
                <text className="chart-axis-label" x={10} y={y + 4}>
                  {Math.round(tickValue)}%
                </text>
              </g>
            );
          })}
          {data.map((item, index) => {
            const x = padding + ((width - padding * 2) * index) / Math.max(data.length - 1, 1);
            return (
              <text className="chart-axis-label" key={item.window} textAnchor="middle" x={x} y={height - 10}>
                {item.window}
              </text>
            );
          })}
          <path className="chart-line chart-line--basket" d={buildLinePath(basketValues, width, height, padding, minValue, maxValue)} />
          <path className="chart-line chart-line--benchmark" d={buildLinePath(benchmarkValues, width, height, padding, minValue, maxValue)} />
          {data.some((item) => typeof item.broaderHalo === "number") ? (
            <path className="chart-line chart-line--broader" d={buildLinePath(broaderValues.map((value) => (Number.isNaN(value) ? minValue : value)), width, height, padding, minValue, maxValue)} />
          ) : null}
          {basketPoints.map((point, index) => (
            <circle className="chart-dot chart-dot--basket" cx={point.x} cy={point.y} key={`basket-${data[index]?.window ?? index}`} r="4.5" />
          ))}
          {benchmarkPoints.map((point, index) => (
            <circle className="chart-dot chart-dot--benchmark" cx={point.x} cy={point.y} key={`benchmark-${data[index]?.window ?? index}`} r="4.5" />
          ))}
          {data.some((item) => typeof item.broaderHalo === "number")
            ? broaderPoints.map((point, index) =>
                typeof data[index]?.broaderHalo === "number" ? <circle className="chart-dot chart-dot--broader" cx={point.x} cy={point.y} key={`broader-${data[index]?.window ?? index}`} r="3.5" /> : null
              )
            : null}
        </svg>
      </div>
      <div className="chart-legend" aria-hidden="true">
        <span><i className="chart-swatch chart-swatch--basket" /> HALO ESG</span>
        <span><i className="chart-swatch chart-swatch--benchmark" /> Benchmark</span>
        {data.some((item) => typeof item.broaderHalo === "number") ? <span><i className="chart-swatch chart-swatch--broader" /> Broader HALO</span> : null}
      </div>
      <div className="chart-annotation">{getPerformanceHighlight(data)}</div>
      <div className="chart-summary-grid">
        {data.map((item) => (
          <div className="chart-summary-card" key={item.window}>
            <strong>{item.window}</strong>
            <span>HALO ESG {formatPercent(item.basket)}</span>
            <span>Benchmark {formatPercent(item.benchmark)}</span>
            {typeof item.broaderHalo === "number" ? <span>Broader HALO {formatPercent(item.broaderHalo)}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectorCompositionChart({ data }: { data: SectorPoint[] }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const largest = data[0];

  return (
    <div className="chart-shell">
      <div className="chart-shell__header">
        <div className="eyebrow">Composition</div>
        <h2>Sector spread</h2>
        <p className="muted">A quick way to see how the basket is distributed across utilities, water, rail, efficiency, and other durable themes.</p>
      </div>
      <div className="chart-bars" role="img" aria-label="Sector composition chart">
        {data.map((item, index) => (
          <div className="chart-bar-row" key={item.sector}>
            <div className="chart-bar-label-row">
              <span>{item.sector}</span>
              <strong>{item.count}</strong>
            </div>
            <div className="chart-bar-track">
              <div className="chart-bar-fill" style={{ background: CHART_COLORS.bars[index % CHART_COLORS.bars.length], width: `${(item.count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompanyScoreChart({ data }: { data: ScorePoint[] }) {
  const strongest = [...data].sort((left, right) => right.value - left.value)[0];

  return (
    <div className="chart-shell">
      <div className="chart-shell__header">
        <div className="eyebrow">Research profile</div>
        <h2>Score profile</h2>
        <p className="muted">A compact view of how the company currently scores across fit, ESG alignment, and medium-term relevance.</p>
      </div>
      <div className="chart-bars chart-bars--scores" role="img" aria-label="Company score profile">
        {data.map((item) => {
          const percentage = (item.value / item.fullMark) * 100;
          return (
            <div className="chart-bar-row" key={item.label}>
              <div className="chart-bar-label-row">
                <span>{item.label}</span>
                <strong>{item.value.toFixed(1)} / {item.fullMark}</strong>
              </div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill chart-bar-fill--score" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {strongest ? <div className="chart-annotation">The strongest current signal is {strongest.label.toLowerCase()}, which helps frame how this company is being monitored.</div> : null}
    </div>
  );
}
