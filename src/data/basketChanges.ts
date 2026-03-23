import type { BasketStatus } from "@/types/company";
import { companies } from "@/data/companies";

export interface MonthlyChange {
  year: number;
  month: number;
  ticker: string;
  status: BasketStatus;
}

const allTickers = companies.map((company) => company.ticker.toUpperCase());

function makeMonthChanges(
  year: number,
  month: number,
  statuses: Partial<Record<BasketStatus, string[]>>
) {
  const statusByTicker = new Map<string, BasketStatus>();

  for (const [status, tickers] of Object.entries(statuses) as Array<[BasketStatus, string[] | undefined]>) {
    for (const ticker of tickers ?? []) {
      statusByTicker.set(ticker.toUpperCase(), status);
    }
  }

  return allTickers.map((ticker) => ({
    year,
    month,
    ticker,
    status: statusByTicker.get(ticker) ?? "inactive"
  } satisfies MonthlyChange));
}

export const basketChanges: MonthlyChange[] = [
  ...makeMonthChanges(2025, 1, {
    added: ["NEE", "EXC", "DUK", "SO", "IBE", "AWK", "XYL", "WM", "TT", "UNP", "PLD", "AMT"]
  }),
  ...makeMonthChanges(2025, 2, {
    maintained: ["NEE", "EXC", "DUK", "SO", "IBE", "AWK", "XYL", "WM", "TT", "UNP", "PLD", "AMT"],
    added: ["ECL", "ROL"]
  }),
  ...makeMonthChanges(2025, 3, {
    maintained: ["NEE", "EXC", "DUK", "IBE", "AWK", "XYL", "WM", "TT", "UNP", "PLD", "AMT", "ECL", "ROL"],
    removed: ["SO"],
    added: ["CNI"]
  }),
  ...makeMonthChanges(2026, 1, {
    added: ["NEE", "EXC", "DUK", "SO", "IBE", "EDP", "AWK", "XYL", "ECL", "WM", "TT", "UNP", "CNI", "PLD", "PSA", "SCI", "ROL", "AMT"]
  }),
  ...makeMonthChanges(2026, 2, {
    maintained: ["NEE", "EXC", "DUK", "SO", "IBE", "EDP", "AWK", "XYL", "ECL", "WM", "TT", "UNP", "CNI", "PLD", "SCI", "ROL", "AMT"],
    removed: ["PSA"],
    added: ["ORSTED", "CCI", "VIE"]
  }),
  ...makeMonthChanges(2026, 3, {
    maintained: ["NEE", "EXC", "DUK", "SO", "IBE", "EDP", "AWK", "XYL", "ECL", "WM", "TT", "UNP", "CNI", "PLD", "SCI", "ROL", "AMT", "CCI", "VIE"],
    removed: ["ORSTED"],
    added: ["TRN", "FER"]
  })
];