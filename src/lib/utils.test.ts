import { describe, expect, it } from "vitest";
import { formatCountry } from "@/lib/utils";

describe("formatCountry", () => {
  it("formats ISO country codes into readable labels", () => {
    expect(formatCountry("US")).toBe("United States");
    expect(formatCountry("ES")).toBe("Spain");
    expect(formatCountry("DK")).toBe("Denmark");
  });

  it("preserves existing human-readable labels", () => {
    expect(formatCountry("United States")).toBe("United States");
    expect(formatCountry("Canada")).toBe("Canada");
  });

  it("normalizes casing for ISO country codes", () => {
    expect(formatCountry("us")).toBe("United States");
    expect(formatCountry("fr")).toBe("France");
  });
});