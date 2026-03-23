import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import type { Company, BasketStatus } from "@/types/company";
import { companies } from "@/data/companies";
import { basketChanges, type MonthlyChange } from "@/data/basketChanges";
import { formatCountry } from "@/lib/utils";

const MONTH_LABELS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function statusLabel(status: BasketStatus) {
  if (status === "added") return "Added";
  if (status === "removed") return "Removed";
  if (status === "inactive") return "Inactive";
  return "Maintained";
}

function getMonthsForYear(year: number, allChanges: MonthlyChange[]) {
  const monthSet = new Set<number>();
  for (const change of allChanges) {
    if (change.year === year) monthSet.add(change.month);
  }
  return Array.from(monthSet).sort((left, right) => left - right);
}

function getStatusByMonthAndTicker(year: number, allChanges: MonthlyChange[]) {
  const months = getMonthsForYear(year, allChanges);
  const perMonth: Record<number, Record<string, BasketStatus>> = {};

  for (const month of months) {
    perMonth[month] = {};

    const monthChanges = allChanges.filter((change) => change.year === year && change.month === month);
    for (const change of monthChanges) {
      perMonth[month][change.ticker.toUpperCase()] = change.status;
    }
  }

  return { months, perMonth };
}

export default async function ChangesPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { year } = await searchParams;
  const availableYears = Array.from(new Set(basketChanges.map((change) => change.year))).sort((left, right) => left - right);
  const latestYear = availableYears.at(-1) ?? 2026;
  const requestedYear = Number.isInteger(Number(year)) ? Number(year) : undefined;
  const selectedYear = requestedYear && availableYears.includes(requestedYear) ? requestedYear : latestYear;
  const { months, perMonth } = getStatusByMonthAndTicker(selectedYear, basketChanges);

  const monthlySummary = months.map((month) => {
    const statusMap = perMonth[month] ?? {};

    let changedCount = 0;
    let inBasketCount = 0;

    for (const company of companies) {
      const status = statusMap[company.ticker.toUpperCase()] ?? "inactive";

      if (status === "added" || status === "maintained") {
        inBasketCount += 1;
      }
      if (status === "added" || status === "removed") {
        changedCount += 1;
      }
    }

    return { month, inBasketCount, changedCount };
  });

  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Basket history</div>
            <h1>How the basket evolves over time</h1>
          </div>
          <div className="hero__visual">📜</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            Monthly overview of the HALO-aligned basket in {selectedYear}. Each company appears every month, with its status for that month.
          </p>
          <p className="lede">
            This uses the shared company list and the manual basket history file so the page stays transparent and easy to maintain.
          </p>
        </div>
        <div className="grid-4">
          <div className="card stat"><span>Year</span><strong>{selectedYear}</strong></div>
          <div className="card stat"><span>Months logged</span><strong>{months.length}</strong></div>
          <div className="card stat"><span>Tracked companies</span><strong>{companies.length}</strong></div>
          <div className="card stat"><span>Latest month changes</span><strong>{monthlySummary.at(-1)?.changedCount ?? 0}</strong></div>
        </div>
      </section>

      <Disclaimer compact />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Year selector</div>
            <h2>Browse basket history by year</h2>
          </div>
          <p className="muted">The newest available year is selected automatically if no year is provided.</p>
        </div>
        <div className="year-filter-group" role="navigation" aria-label="Available basket history years">
          {availableYears.map((availableYear) => {
            const isActive = availableYear === selectedYear;
            return (
              <Link
                className={`button secondary year-filter ${isActive ? "year-filter--active" : ""}`}
                href={availableYear === latestYear ? "/changes" : `/changes?year=${availableYear}`}
                key={availableYear}
                aria-current={isActive ? "page" : undefined}
              >
                {availableYear}
              </Link>
            );
          })}
        </div>
        <div className="chart-annotation">
          Sample data note: the 2025 and 2026 monthly histories on this page are placeholders so the selector, chart, and table can be reviewed before the real basket log is entered.
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">{selectedYear} overview</div>
            <h2>Monthly overview</h2>
          </div>
          <p className="muted">Chart-ready monthly counts based on the manual basket history.</p>
        </div>

        <div className="grid-3">
          {monthlySummary.map(({ month, inBasketCount, changedCount }) => (
            <article className="card" key={month}>
              <div className="eyebrow">{MONTH_LABELS[month]}</div>
              <h3>{MONTH_LABELS[month]} {selectedYear}</h3>
              <p>Companies in basket: {inBasketCount}</p>
              <p>Companies changed: {changedCount}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        {months.map((month) => {
          const statusMap = perMonth[month] ?? {};

          return (
          <section className="section-block" key={`${selectedYear}-${month}`} id={`month-${month}`}>
            <div className="section-heading">
              <div>
                <div className="eyebrow">Month {month}</div>
                <h3>{MONTH_LABELS[month]} {selectedYear}</h3>
              </div>
              <p className="muted">Status of each basket member this month.</p>
            </div>

            <div className="table-wrap table-wrap--changes">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Ticker</th>
                    <th>Theme</th>
                    <th>Country</th>
                    <th>Currency</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => {
                    const status = statusMap[company.ticker.toUpperCase()] ?? "inactive";

                    return (
                    <tr key={`${selectedYear}-${month}-${company.ticker}`}>
                      <td>
                        <Link className="inline-link" href={`/company-profiles#${company.ticker.toLowerCase()}`}>
                          {company.name}
                        </Link>
                      </td>
                      <td>{company.ticker}</td>
                      <td>{company.theme}</td>
                      <td>{formatCountry(company.country)}</td>
                      <td>{company.currency}</td>
                      <td>
                        <span className={`pill status-pill status-pill--${status}`}>{statusLabel(status)}</span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          );
        })}
      </section>
    </div>
  );
}
