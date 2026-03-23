export type HaloScenario = {
  key: string;
  label: string;
  rate: number;
  color: string;
  dash: number[];
  width: number;
  explain: string;
  highlight?: boolean;
};

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export const HALO_SCENARIOS: HaloScenario[] = [
  {
    key: "bank",
    label: "Big bank savings",
    rate: 0.004,
    color: "#888780",
    dash: [5, 4],
    width: 1.5,
    explain:
      "A traditional savings account at a large bank. It is liquid and stable, but the expected return is usually very low and often below inflation."
  },
  {
    key: "hysa",
    label: "High-yield savings",
    rate: 0.045,
    color: "#378ADD",
    dash: [5, 4],
    width: 1.5,
    explain:
      "An online savings account that generally pays a higher variable rate than large retail banks. Better nominal yield, but still cash-like and rate-sensitive."
  },
  {
    key: "cd",
    label: "2-year CD (rolled)",
    rate: 0.047,
    color: "#73726c",
    dash: [5, 4],
    width: 1.5,
    explain:
      "A fixed-term bank deposit. You gain predictability but sacrifice liquidity until maturity, then reinvest at prevailing rates."
  },
  {
    key: "sp500",
    label: "S&P 500 index fund",
    rate: 0.1,
    color: "#c0392b",
    dash: [5, 4],
    width: 1.5,
    explain:
      "A broad US equity benchmark with strong long-run return history and materially higher volatility than cash products."
  },
  {
    key: "halo",
    label: "HALO+ESG basket",
    rate: 0.09,
    color: "#3B6D11",
    dash: [],
    width: 2.6,
    highlight: true,
    explain:
      "Responsible Wealth's infrastructure-centered basket selected under HALO + ESG criteria. The focus is durable real-economy exposure and explainability."
  }
];

export const HALO_INFLATION = 0.03;

export const HALO_HORIZONS = [5, 10, 20] as const;

export const HALO_GLOSSARY: GlossaryEntry[] = [
  {
    term: "APY (Annual Percentage Yield)",
    definition: "Annualized yield including compounding effects over a one-year period."
  },
  {
    term: "Inflation",
    definition: "General increase in price levels over time; reduces real purchasing power."
  },
  {
    term: "Purchasing power",
    definition: "What your money can actually buy after accounting for inflation."
  },
  {
    term: "Index fund",
    definition: "A fund that passively tracks an index, such as the S&P 500."
  },
  {
    term: "ESG",
    definition: "Environmental, Social, and Governance criteria used alongside financial analysis."
  },
  {
    term: "HALO",
    definition: "Heavy Assets, Low Obsolescence; a lens emphasizing durable infrastructure businesses."
  },
  {
    term: "CD (Certificate of Deposit)",
    definition: "Fixed-term bank product with pre-defined rate and limited liquidity before maturity."
  },
  {
    term: "Compound growth",
    definition: "Returns generated on both principal and accumulated prior returns."
  },
  {
    term: "Benchmark",
    definition: "Reference used to compare performance, often the S&P 500 for equities."
  },
  {
    term: "Diversification",
    definition: "Spreading exposure across holdings to reduce concentration risk."
  }
];

export const HALO_DIFFERENCES = [
  {
    label: "Primary objective",
    bank: "Liquidity and capital stability",
    hysa: "Higher cash yield",
    cd: "Yield certainty over fixed term",
    sp500: "Broad market growth",
    halo: "Durable, values-aligned growth"
  },
  {
    label: "Return behavior",
    bank: "Very low, often below inflation",
    hysa: "Moderate, variable",
    cd: "Moderate, term-locked",
    sp500: "Higher expected, volatile",
    halo: "Competitive expected, thematic"
  },
  {
    label: "Volatility",
    bank: "Minimal",
    hysa: "Minimal",
    cd: "Minimal (if held to maturity)",
    sp500: "High",
    halo: "Medium to high"
  },
  {
    label: "Liquidity",
    bank: "Immediate",
    hysa: "High",
    cd: "Low until maturity",
    sp500: "High (market hours)",
    halo: "High (market hours)"
  },
  {
    label: "Inflation resilience",
    bank: "Weak",
    hysa: "Mixed",
    cd: "Mixed",
    sp500: "Historically stronger",
    halo: "Targeted toward real-economy resilience"
  }
] as const;
