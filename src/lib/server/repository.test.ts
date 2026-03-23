import { describe, expect, it } from "vitest";
import { getBasketOverview, getCompanyByTicker, getNewsletterBySlug } from "@/lib/server/repository";

describe("repository", () => {
  it("returns the seeded basket overview", async () => {
    const overview = await getBasketOverview();
    expect(overview.basket.slug).toBe("halo-esg");
    expect(overview.companies.length).toBe(24);
  }, 20000);

  it("finds companies by ticker", async () => {
    expect((await getCompanyByTicker("ibe"))?.name).toBe("Iberdrola");
  }, 20000);

  it("finds newsletter archive issues", async () => {
    expect((await getNewsletterBySlug("march-2026-halo-esg-review"))?.title).toContain("March 2026");
  }, 20000);
});
