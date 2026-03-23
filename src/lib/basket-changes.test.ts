import { describe, expect, it } from "vitest";
import { getBasketChangeYearSummary } from "@/lib/basket-changes";

describe("basket changes", () => {
  it("builds a month-by-month summary for a non-latest year", () => {
    const summary = getBasketChangeYearSummary(2025);

    expect(summary.year).toBe(2025);
    expect(summary.availableYears).toEqual([2025, 2026]);
    expect(summary.months).toHaveLength(3);
    expect(summary.months[0]?.basketCount).toBe(12);
    expect(summary.months[0]?.changedCount).toBe(12);
    expect(summary.months[1]?.basketCount).toBe(14);
    expect(summary.months[1]?.changedCount).toBe(2);
    expect(summary.months[2]?.basketCount).toBe(14);
    expect(summary.months[2]?.changedCount).toBe(2);
    expect(summary.totalChangeEvents).toBe(16);
  });

  it("builds a month-by-month summary for the latest available year", () => {
    const summary = getBasketChangeYearSummary();

    expect(summary.year).toBe(2026);
    expect(summary.availableYears).toEqual([2025, 2026]);
    expect(summary.months).toHaveLength(3);
    expect(summary.months[0]?.basketCount).toBe(18);
    expect(summary.months[0]?.changedCount).toBe(18);
    expect(summary.months[1]?.basketCount).toBe(20);
    expect(summary.months[1]?.changedCount).toBe(4);
    expect(summary.months[2]?.basketCount).toBe(21);
    expect(summary.months[2]?.changedCount).toBe(3);
    expect(summary.totalChangeEvents).toBe(25);
    expect(summary.trend.map((point) => point.basketCount)).toEqual([18, 20, 21]);
  });

  it("joins change rows with company metadata and profile anchors", () => {
    const summary = getBasketChangeYearSummary(2026);
    const row = summary.months[0]?.rows.find((entry) => entry.ticker === "NEE");
    const inactiveRow = summary.months[0]?.rows.find((entry) => entry.ticker === "ORSTED");

    expect(row?.name).toBe("NextEra Energy");
    expect(row?.theme).toBe("Renewable Utilities");
    expect(row?.profileHref).toBe("/company-profiles#nee");
    expect(inactiveRow?.status).toBe("inactive");
  });

  it("falls back to the latest available year when the requested year is missing", () => {
    const summary = getBasketChangeYearSummary(2030);

    expect(summary.year).toBe(2026);
    expect(summary.availableYears).toEqual([2025, 2026]);
  });
});