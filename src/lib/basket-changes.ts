import { basketChanges } from "@/data/basketChanges";
import { companies, getCompanyDirectoryEntry } from "@/data/companies";
import type { Company, BasketStatus } from "@/types/company";

type JoinedMonthlyChange = Company & {
  ticker: string;
  status: BasketStatus;
  profileHref: string;
};

export interface BasketChangeTrendPoint {
  label: string;
  monthLabel: string;
  basketCount: number;
  changedCount: number;
}

export interface BasketChangeMonthSummary {
  month: number;
  monthLabel: string;
  basketCount: number;
  changedCount: number;
  rows: JoinedMonthlyChange[];
}

export interface BasketChangeYearSummary {
  year: number;
  availableYears: number[];
  months: BasketChangeMonthSummary[];
  trend: BasketChangeTrendPoint[];
  trackedCompanies: number;
  totalChangeEvents: number;
}

const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

function joinCompany(ticker: string) {
  const normalizedTicker = ticker.toUpperCase();
  const company = getCompanyDirectoryEntry(normalizedTicker);

  return {
    ticker: normalizedTicker,
    name: company?.name ?? normalizedTicker,
    theme: company?.theme ?? "Unmatched company",
    country: company?.country ?? "Unknown",
    currency: company?.currency ?? "N/A",
    profileHref: `/company-profiles#${normalizedTicker.toLowerCase()}`
  };
}

export function getBasketChangeYearSummary(requestedYear?: number): BasketChangeYearSummary {
  const availableYears = Array.from(new Set(basketChanges.map((entry) => entry.year))).sort((a, b) => a - b);
  const currentYear = new Date().getFullYear();
  const fallbackYear = availableYears.at(-1) ?? currentYear;
  const year = requestedYear && availableYears.includes(requestedYear)
    ? requestedYear
    : availableYears.includes(currentYear)
      ? currentYear
      : fallbackYear;

  const yearEntries = basketChanges
    .filter((entry) => entry.year === year)
    .sort((left, right) => left.month - right.month || left.ticker.localeCompare(right.ticker));

  const monthMap = new Map<number, typeof yearEntries>();
  for (const entry of yearEntries) {
    const monthEntries = monthMap.get(entry.month) ?? [];
    monthEntries.push(entry);
    monthMap.set(entry.month, monthEntries);
  }

  const months: BasketChangeMonthSummary[] = [];

  for (const month of Array.from(monthMap.keys()).sort((a, b) => a - b)) {
    const entries = monthMap.get(month) ?? [];

    const rows = entries
      .map((entry) => ({
        ...joinCompany(entry.ticker),
        status: entry.status
      }))
      .sort((left, right) => left.name.localeCompare(right.name) || left.ticker.localeCompare(right.ticker));

    months.push({
      month,
      monthLabel: monthFormatter.format(new Date(year, month - 1, 1)),
      basketCount: entries.filter((entry) => entry.status === "added" || entry.status === "maintained").length,
      changedCount: entries.filter((entry) => entry.status === "added" || entry.status === "removed").length,
      rows
    });
  }

  return {
    year,
    availableYears,
    months,
    trend: months.map((month) => ({
      label: month.monthLabel.slice(0, 3),
      monthLabel: month.monthLabel,
      basketCount: month.basketCount,
      changedCount: month.changedCount
    })),
    trackedCompanies: new Set(yearEntries.map((entry) => entry.ticker.toUpperCase())).size,
    totalChangeEvents: yearEntries.filter((entry) => entry.status === "added" || entry.status === "removed").length
  };
}