export const NEWS_TAGS = [
  "earnings",
  "guidance",
  "operations",
  "sustainability",
  "regulation",
  "controversy",
  "capital_allocation",
  "macro",
  "sector_trend",
  "benchmark_context"
] as const;

export type NewsTag = (typeof NEWS_TAGS)[number];

export const VERIFYABLE_NEWS_MIN_PRIORITY = 3;
export const NEWSLETTER_MIN_PRIORITY = 4;

export const NEWS_PRIORITY_OPTIONS = [
  { value: 1, label: "1 · Background only", description: "Collected for context, but too weak or noisy for public research." },
  { value: 2, label: "2 · Useful background", description: "Potentially helpful context, but usually not worth publishing." },
  { value: 3, label: "3 · Public research relevant", description: "Relevant enough for company pages or recent changes." },
  { value: 4, label: "4 · Strong newsletter candidate", description: "Meaningful enough to consider for the monthly report." },
  { value: 5, label: "5 · Core monthly item", description: "Very important and likely worth highlighting prominently." }
] as const;

export const NEWS_REVIEW_CRITERIA = [
  "Use only allowed, credible sources and keep primary sources at the top of the hierarchy.",
  "Verify only items that clearly matter for a tracked company, sector, or the wider HALO/ESG framework.",
  "Ignore price-noise, duplicated stories, and headlines that do not change the medium-term thesis.",
  "Keep public summaries informational and calm: no recommendations, no hype, no trading language."
] as const;

export const NEWSLETTER_SELECTION_RULES = [
  "Prefer verified items scored 4 or 5.",
  "Include at most three company-specific developments and at most two broader trend items.",
  "Use broader items only when they clarify regulation, macro conditions, benchmark context, or sector direction.",
  "Skip items that feel like daily market noise, even if they are recent."
] as const;

const TAG_ALIASES: Record<string, NewsTag> = {
  earnings: "earnings",
  financials: "earnings",
  guidance: "guidance",
  outlook: "guidance",
  operations: "operations",
  industrials: "operations",
  sustainability: "sustainability",
  energy_transportation: "sector_trend",
  manufacturing: "sector_trend",
  life_sciences: "sector_trend",
  real_estate: "sector_trend",
  retail_wholesale: "sector_trend",
  ipo: "capital_allocation",
  mergers_and_acquisitions: "capital_allocation",
  finance: "capital_allocation",
  economy_fiscal: "macro",
  economy_monetary: "macro",
  economy_macro: "macro",
  regulation: "regulation",
  politics: "regulation",
  environmental: "sustainability",
  blockchain: "benchmark_context"
};

function containsAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern));
}

export function normalizeNewsTag(input: string, title = "", summary = "", sourceName = ""): NewsTag {
  const raw = input.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (raw in TAG_ALIASES) {
    return TAG_ALIASES[raw];
  }
  if ((NEWS_TAGS as readonly string[]).includes(raw)) {
    return raw as NewsTag;
  }

  const haystack = `${title} ${summary} ${sourceName}`.toLowerCase();
  if (containsAny(haystack, ["earnings", "quarter results", "results", "revenue", "eps"])) return "earnings";
  if (containsAny(haystack, ["guidance", "outlook", "forecast"])) return "guidance";
  if (containsAny(haystack, ["sustainability", "emissions", "renewable", "water", "efficiency", "decarbon"])) return "sustainability";
  if (containsAny(haystack, ["regulation", "sec", "policy", "commission", "rule", "filing"])) return "regulation";
  if (containsAny(haystack, ["investigation", "lawsuit", "spill", "controversy", "breach", "complaint"])) return "controversy";
  if (containsAny(haystack, ["buyback", "acquisition", "dividend", "capital plan", "investment plan", "asset sale"])) return "capital_allocation";
  if (containsAny(haystack, ["inflation", "rates", "macro", "economy", "growth", "recession"])) return "macro";
  if (containsAny(haystack, ["benchmark", "index", "market overview"])) return "benchmark_context";
  if (containsAny(haystack, ["sector", "industry", "grid", "offshore", "rail", "utility"])) return "sector_trend";
  return "operations";
}

export function inferImportanceScore(params: {
  tag: NewsTag;
  hasCompany: boolean;
  title: string;
  summary: string;
  sourceName: string;
}) {
  const haystack = `${params.title} ${params.summary} ${params.sourceName}`.toLowerCase();
  let score = params.hasCompany ? 3 : 2;

  if (["earnings", "guidance", "regulation", "controversy", "capital_allocation"].includes(params.tag)) {
    score += 1;
  }

  if (containsAny(haystack, ["material", "major", "cuts guidance", "raises guidance", "investigation", "strategic", "multi-year"])) {
    score += 1;
  }

  if (!params.hasCompany && ["macro", "sector_trend", "benchmark_context"].includes(params.tag)) {
    score = Math.max(score, 3);
  }

  return Math.max(1, Math.min(5, score));
}

export function getPriorityLabel(score: number) {
  return NEWS_PRIORITY_OPTIONS.find((option) => option.value === score)?.label ?? `${score}`;
}

export function canVerifyNews(score: number) {
  return score >= VERIFYABLE_NEWS_MIN_PRIORITY;
}

export function shouldIncludeInNewsletter(item: { verified: boolean; importanceScore: number; tag: string }) {
  const tag = normalizeNewsTag(item.tag);
  return item.verified && item.importanceScore >= NEWSLETTER_MIN_PRIORITY && tag !== "benchmark_context";
}

export function isBroaderContextTag(tag: string) {
  return ["macro", "regulation", "sector_trend", "benchmark_context"].includes(normalizeNewsTag(tag));
}

type FeedClassificationInput = {
  feedUrl?: string;
  sourceName: string;
  title: string;
  summary: string;
};

function containsDomain(hostname: string, candidates: string[]) {
  return candidates.some((candidate) => hostname === candidate || hostname.endsWith(`.${candidate}`));
}

export function classifyConfiguredFeedItem(input: FeedClassificationInput) {
  const hostname = input.feedUrl ? new URL(input.feedUrl).hostname.toLowerCase() : input.sourceName.toLowerCase();
  const path = input.feedUrl ? new URL(input.feedUrl).pathname.toLowerCase() : "";
  const text = `${input.title} ${input.summary} ${hostname} ${path}`.toLowerCase();

  if (containsDomain(hostname, ["sec.gov"])) {
    return {
      sourceName: "SEC",
      tag: normalizeNewsTag("regulation", input.title, input.summary, "SEC"),
      importanceBoost: 1
    };
  }

  if (containsDomain(hostname, ["ecb.europa.eu"])) {
    return {
      sourceName: "European Central Bank",
      tag: normalizeNewsTag("macro", input.title, input.summary, "European Central Bank"),
      importanceBoost: 1
    };
  }

  if (containsDomain(hostname, ["eea.europa.eu"])) {
    return {
      sourceName: "European Environment Agency",
      tag: normalizeNewsTag("sustainability", input.title, input.summary, "European Environment Agency"),
      importanceBoost: 1
    };
  }

  if (containsAny(text, ["sustainability", "climate", "renewable", "emissions", "water", "efficiency", "decarbon"])) {
    return {
      sourceName: input.sourceName,
      tag: normalizeNewsTag("sustainability", input.title, input.summary, input.sourceName),
      importanceBoost: 1
    };
  }

  if (containsAny(text, ["regulation", "policy", "rule", "commission", "authority", "filing"])) {
    return {
      sourceName: input.sourceName,
      tag: normalizeNewsTag("regulation", input.title, input.summary, input.sourceName),
      importanceBoost: 1
    };
  }

  if (containsAny(text, ["inflation", "rates", "economy", "macro", "growth", "recession"])) {
    return {
      sourceName: input.sourceName,
      tag: normalizeNewsTag("macro", input.title, input.summary, input.sourceName),
      importanceBoost: 0
    };
  }

  if (containsAny(text, ["utility", "grid", "offshore", "rail", "infrastructure", "sector"])) {
    return {
      sourceName: input.sourceName,
      tag: normalizeNewsTag("sector_trend", input.title, input.summary, input.sourceName),
      importanceBoost: 0
    };
  }

  if (containsDomain(hostname, ["nexteraenergy.com", "investor.nexteraenergy.com"])) {
    return {
      sourceName: "NextEra Energy",
      tag: normalizeNewsTag("", input.title, input.summary, "NextEra Energy"),
      importanceBoost: 1
    };
  }

  if (containsDomain(hostname, ["iberdrola.com"])) {
    return {
      sourceName: "Iberdrola",
      tag: normalizeNewsTag("", input.title, input.summary, "Iberdrola"),
      importanceBoost: 1
    };
  }

  if (containsDomain(hostname, ["xylem.com"])) {
    return {
      sourceName: "Xylem",
      tag: normalizeNewsTag("", input.title, input.summary, "Xylem"),
      importanceBoost: 1
    };
  }

  if (containsDomain(hostname, ["wm.com", "investors.wm.com"])) {
    return {
      sourceName: "WM",
      tag: normalizeNewsTag("", input.title, input.summary, "WM"),
      importanceBoost: 1
    };
  }

  if (containsDomain(hostname, ["tranetechnologies.com", "investors.tranetechnologies.com"])) {
    return {
      sourceName: "Trane Technologies",
      tag: normalizeNewsTag("", input.title, input.summary, "Trane Technologies"),
      importanceBoost: 1
    };
  }

  return {
    sourceName: input.sourceName,
    tag: normalizeNewsTag("", input.title, input.summary, input.sourceName),
    importanceBoost: 0
  };
}
