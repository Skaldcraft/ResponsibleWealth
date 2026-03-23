import { companies } from "@/data/companies";
import { monthlyCloseOverrides } from "@/data/monthly-close-overrides";
import { seedCompanies } from "@/lib/content/seed";

export interface MonthlyClosePoint {
  year: number;
  month: number;
  ticker: string;
  close: number;
}

const TEMPLATE_MONTHS = [
  { year: 2025, month: 1, factor: 0.965 },
  { year: 2025, month: 2, factor: 0.988 },
  { year: 2025, month: 3, factor: 1.012 },
  { year: 2026, month: 1, factor: 0.996 },
  { year: 2026, month: 2, factor: 1.014 },
  { year: 2026, month: 3, factor: 1.029 }
] as const;

const seedCloseByTicker = new Map(
  seedCompanies.map((company) => [company.ticker.toUpperCase(), company.snapshot.closePrice])
);

function tickerSeed(ticker: string) {
  return ticker
    .toUpperCase()
    .split("")
    .reduce((accumulator, letter, index) => accumulator + letter.charCodeAt(0) * (index + 1), 0);
}

function buildTemplateCloses() {
  const points: MonthlyClosePoint[] = [];

  for (const company of companies) {
    const ticker = company.ticker.toUpperCase();
    const baseClose = seedCloseByTicker.get(ticker) ?? 100;
    const jitter = ((tickerSeed(ticker) % 9) - 4) * 0.0045;

    for (const [index, month] of TEMPLATE_MONTHS.entries()) {
      const drift = 1 + jitter * index;
      const close = Number((baseClose * month.factor * drift).toFixed(2));
      points.push({
        year: month.year,
        month: month.month,
        ticker,
        close
      });
    }
  }

  return points;
}

const templateMonthlyCloses = buildTemplateCloses();

// Last value wins for the same year/month/ticker key.
export const monthlyCloses: MonthlyClosePoint[] = [
  ...templateMonthlyCloses,
  ...monthlyCloseOverrides
];
