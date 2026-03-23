export function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(value));
}

const countryFallbackLabels: Record<string, string> = {
  CA: "Canada",
  DK: "Denmark",
  ES: "Spain",
  FR: "France",
  IE: "Ireland",
  IT: "Italy",
  PT: "Portugal",
  US: "United States"
};

const countryDisplayNames = typeof Intl.DisplayNames === "function"
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;

export function formatCountry(codeOrLabel: string) {
  const normalized = codeOrLabel.trim();
  if (!normalized) {
    return normalized;
  }

  if (normalized.length !== 2) {
    return normalized;
  }

  const regionCode = normalized.toUpperCase();
  return countryDisplayNames?.of(regionCode) ?? countryFallbackLabels[regionCode] ?? regionCode;
}
