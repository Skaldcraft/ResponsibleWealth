import Link from "next/link";
import { Disclaimer } from "@/components/disclaimer";
import type { BasketStatus } from "@/types/company";
import { companies } from "@/data/companies";
import { basketChanges, type MonthlyChange } from "@/data/basketChanges";
import { monthlyCloses } from "@/data/monthly-closes";
import { prisma } from "@/lib/server/prisma";

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

function statusLabel(status: Exclude<BasketStatus, "inactive">) {
  if (status === "added") return "Added";
  if (status === "removed") return "Removed";
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

function buildIndexedSeries(months: number[], statusMap: Record<string, BasketStatus>, ticker: string, monthlyCloseMap: Record<string, number>) {
  const values: Array<number | null> = [];
  let baseClose: number | null = null;

  for (const month of months) {
    const status = statusMap[ticker.toUpperCase()] ?? "inactive";
    const resolvedStatus = statusMap[`${ticker.toUpperCase()}-${month}`] ?? status;
    const monthStatus = (resolvedStatus as BasketStatus) ?? "inactive";

    if (monthStatus === "inactive") {
      values.push(null);
      continue;
    }

    const close = monthlyCloseMap[`${ticker.toUpperCase()}-${month}`];
    if (typeof close !== "number") {
      values.push(null);
      continue;
    }

    if (baseClose == null) {
      baseClose = close;
      values.push(100);
      continue;
    }

    values.push(Number(((close / Math.max(baseClose, 0.0001)) * 100).toFixed(2)));
  }

  return values;
}

function buildSparklinePath(values: Array<number | null>, width: number, height: number, padding: number, minimum: number, maximum: number) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const denominator = Math.max(maximum - minimum, 1);

  let hasStarted = false;
  let path = "";

  for (const [index, value] of values.entries()) {
    if (value == null) {
      hasStarted = false;
      continue;
    }

    const x = padding + (innerWidth * index) / Math.max(values.length - 1, 1);
    const y = padding + innerHeight - ((value - minimum) / denominator) * innerHeight;
    path += `${hasStarted ? " L" : " M"}${x.toFixed(2)} ${y.toFixed(2)}`;
    hasStarted = true;
  }

  return path.trim();
}

function getSeriesStats(values: Array<number | null>) {
  const concreteValues = values.filter((value): value is number => typeof value === "number");
  const start = concreteValues[0] ?? 100;
  const end = concreteValues[concreteValues.length - 1] ?? start;
  const delta = Number((((end - start) / Math.max(start, 1)) * 100).toFixed(1));
  return { start, end, delta, points: concreteValues.length };
}

async function getMonthlyCloseMap(year: number, months: number[]) {
  const fallback = (() => {
    const map: Record<string, number> = {};
    const trackedTickers = new Set(companies.map((company) => company.ticker.toUpperCase()));

    for (const point of monthlyCloses) {
      const ticker = point.ticker.toUpperCase();
      if (point.year !== year || !months.includes(point.month) || !trackedTickers.has(ticker)) {
        continue;
      }
      map[`${ticker}-${point.month}`] = point.close;
    }

    return map;
  })();

  if (!process.env.DATABASE_URL) {
    return { map: fallback, source: "seed" as const };
  }

  try {
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));
    const trackedTickers = companies.map((company) => company.ticker.toUpperCase());

    const snapshots = await prisma.marketSnapshot.findMany({
      where: {
        asOfDate: { gte: startDate, lt: endDate },
        company: {
          ticker: { in: trackedTickers }
        }
      },
      select: {
        asOfDate: true,
        closePrice: true,
        company: { select: { ticker: true } }
      },
      orderBy: { asOfDate: "asc" }
    });

    const latestByTickerMonth = new Map<string, { timestamp: number; close: number }>();
    for (const snapshot of snapshots) {
      const month = snapshot.asOfDate.getUTCMonth() + 1;
      if (!months.includes(month)) continue;

      const key = `${snapshot.company.ticker.toUpperCase()}-${month}`;
      const timestamp = snapshot.asOfDate.getTime();
      const current = latestByTickerMonth.get(key);

      if (!current || timestamp >= current.timestamp) {
        latestByTickerMonth.set(key, { timestamp, close: snapshot.closePrice });
      }
    }

    const map: Record<string, number> = {};
    for (const [key, value] of latestByTickerMonth.entries()) {
      map[key] = value.close;
    }

    const databaseCount = Object.keys(map).length;

    const merged: Record<string, number> = {
      ...fallback,
      ...map
    };

    const fallbackCount = Object.keys(fallback).length;
    const source = databaseCount > 0
      ? (fallbackCount > databaseCount ? "mixed" as const : "database" as const)
      : ("seed" as const);

    return { map: merged, source };
  } catch {
    return { map: fallback, source: "seed" as const };
  }
}

export default async function ChangesPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { year } = await searchParams;
  const availableYears = Array.from(new Set(basketChanges.map((change) => change.year))).sort((left, right) => left - right);
  const latestYear = availableYears.at(-1) ?? 2026;
  const requestedYear = Number.isInteger(Number(year)) ? Number(year) : undefined;
  const selectedYear = requestedYear && availableYears.includes(requestedYear) ? requestedYear : latestYear;
  const { months, perMonth } = getStatusByMonthAndTicker(selectedYear, basketChanges);
  const { map: monthlyCloseMap, source: closeSource } = await getMonthlyCloseMap(selectedYear, months);

  const companySeries = companies.map((company) => {
    const monthStatuses = months.reduce<Record<string, BasketStatus>>((accumulator, month) => {
      accumulator[`${company.ticker.toUpperCase()}-${month}`] = perMonth[month]?.[company.ticker.toUpperCase()] ?? "inactive";
      return accumulator;
    }, {});

    const values = buildIndexedSeries(months, monthStatuses, company.ticker, monthlyCloseMap);
    const stats = getSeriesStats(values);
    const addedCount = Object.values(monthStatuses).filter((status) => status === "added").length;
    const removedCount = Object.values(monthStatuses).filter((status) => status === "removed").length;

    return {
      company,
      values,
      stats,
      addedCount,
      removedCount
    };
  });

  const companiesWithLine = companySeries.filter((series) => series.stats.points >= 2).length;
  const companiesWithSinglePoint = companySeries.filter((series) => series.stats.points === 1).length;
  const companiesWithoutPoints = companySeries.filter((series) => series.stats.points === 0).length;

  const allValues = companySeries
    .flatMap((series) => series.values)
    .filter((value): value is number => typeof value === "number");
  const minimumValue = allValues.length ? Math.floor(Math.min(...allValues) - 1) : 95;
  const maximumValue = allValues.length ? Math.ceil(Math.max(...allValues) + 1) : 105;
  const normalizedMinimum = maximumValue - minimumValue < 6 ? minimumValue - 2 : minimumValue;
  const normalizedMaximum = maximumValue - minimumValue < 6 ? maximumValue + 2 : maximumValue;

  const sparklineWidth = 420;
  const sparklineHeight = 150;
  const sparklinePadding = 14;

  return (
    <div className="section">
      <section className="hero">
        <div className="hero__header">
          <div className="hero__title">
            <div className="eyebrow">Company Trend Overview</div>
            <h1>Company Trend Overview</h1>
          </div>
          <div className="hero__visual">📈</div>
        </div>
        <div className="hero__body">
          <p className="lede">
            Indexed mini-lines provide a calm, comparable view of how each company behaved across the selected period.
          </p>
          <p className="lede">
            Values are normalized to an index base of 100 so cross-currency behavior can be compared at a glance.
          </p>
        </div>
        <div className="kicker-row">
          <span className="pill">Year {selectedYear}</span>
          <span className="pill">Tracked companies {companies.length}</span>
          <span className="pill">Window {months.map((month) => MONTH_LABELS[month].slice(0, 3)).join(" - ")}</span>
        </div>
      </section>

      <Disclaimer compact />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Year selector</div>
            <h2>Browse trend overview by year</h2>
          </div>
          <p className="muted">The newest available year is selected automatically if no year is provided.</p>
        </div>
        <div className="year-filter-group" role="navigation" aria-label="Available trend overview years">
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
          Data source: {closeSource === "database" ? "monthly closes from stored market snapshots" : closeSource === "mixed" ? "database closes plus fallback values" : "fallback monthly close file"}. Charts use the latest close available for each month.
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">{selectedYear} indexed lines</div>
            <h2>Behavior by company</h2>
          </div>
          <div className="changes-legend" aria-label="Trend key">
            <span className="changes-legend__item"><i className="changes-cell changes-cell--added">+/-</i> Period change</span>
            <span className="changes-legend__item"><i className="changes-cell changes-cell--maintained">100</i> Indexed base</span>
          </div>
        </div>

        <div className="chart-annotation">
          Data coverage for {selectedYear}: {companiesWithLine} companies with 2+ monthly points, {companiesWithSinglePoint} with one point, {companiesWithoutPoints} with no points.
        </div>

        <div className="trend-grid">
          {companySeries.map(({ company, values, stats, addedCount, removedCount }) => {
            const path = buildSparklinePath(values, sparklineWidth, sparklineHeight, sparklinePadding, normalizedMinimum, normalizedMaximum);
            const lineClass = stats.delta >= 0 ? "sparkline-line sparkline-line--up" : "sparkline-line sparkline-line--down";

            return (
              <article className="card trend-card" key={company.ticker}>
                <div className="trend-card__header">
                  <div>
                    <h3>
                      <Link className="inline-link" href={`/company-profiles#${company.ticker.toLowerCase()}`}>
                        {company.name} ({company.ticker})
                      </Link>
                    </h3>
                    <p className="muted">{company.theme} · {company.currency}</p>
                  </div>
                  <span className={`trend-chip ${stats.delta >= 0 ? "trend-chip--up" : "trend-chip--down"}`}>
                    {stats.delta > 0 ? "+" : ""}{stats.delta}%
                  </span>
                </div>

                <div className="sparkline-shell">
                  <svg className="sparkline-svg" role="img" aria-label={`${company.name} indexed trend`} viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}>
                    <line className="sparkline-guide" x1={sparklinePadding} x2={sparklineWidth - sparklinePadding} y1={sparklineHeight / 2} y2={sparklineHeight / 2} />
                    {path ? <path className={lineClass} d={path} /> : null}
                    {values.map((value, index) => {
                      if (value == null) return null;
                      const x = sparklinePadding + ((sparklineWidth - sparklinePadding * 2) * index) / Math.max(values.length - 1, 1);
                      const y = sparklinePadding + (sparklineHeight - sparklinePadding * 2) - ((value - normalizedMinimum) / Math.max(normalizedMaximum - normalizedMinimum, 1)) * (sparklineHeight - sparklinePadding * 2);
                      return <circle className="sparkline-dot" cx={x} cy={y} key={`${company.ticker}-${index}`} r="3.5" />;
                    })}
                  </svg>
                  <div className="sparkline-months" aria-hidden="true">
                    {months.map((month) => (
                      <span key={`${company.ticker}-${month}-label`}>{MONTH_LABELS[month].slice(0, 3)}</span>
                    ))}
                  </div>
                </div>

                {stats.points < 2 ? (
                  <p className="muted">Not enough monthly closes yet to draw a full trend line for this company.</p>
                ) : null}

                <div className="trend-card__meta">
                  <span>Index end {stats.end.toFixed(1)}</span>
                  <span>Points {stats.points}</span>
                  <span>A {addedCount} · R {removedCount}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
