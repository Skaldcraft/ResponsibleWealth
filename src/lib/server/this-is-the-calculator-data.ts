import { getBasketOverview, getCompanyLifecycleGroups } from "@/lib/server/repository";

type ComparisonScores = {
  assetDurability: number;
  esgAlignment: number;
  revenuePredictability: number;
  obsolescenceRisk: number;
  sectorRelevance: number;
};

type ComparisonPeer = {
  ticker: string;
  name: string;
  lifecycleLabel: string;
  why: string;
};

type LifecyclePeer = {
  ticker: string;
  name: string;
  sector: string;
  lifecycleStatus: string;
  esgCategory: string;
  monthReturnPct: number | null;
};

export type ComparisonCompany = {
  ticker: string;
  name: string;
  sector: string;
  currency: string;
  price: number;
  changePercent1D: number;
  perf: {
    "1M": number;
    "YTD": number;
    "1Y": number;
  };
  isDelayed: boolean;
  fitLabel: string;
  esgCategoryLabel: string;
  scores: ComparisonScores;
  thesisShort: string;
  thesis: string;
  keyRisks: string;
  watchpoints: string[];
  notInstead: ComparisonPeer[];
};

const DEFAULT_SCORE_PRESET: ComparisonScores = {
  assetDurability: 7,
  esgAlignment: 7,
  revenuePredictability: 7,
  obsolescenceRisk: 7,
  sectorRelevance: 7
};

const SECTOR_SCORE_PRESETS: Record<string, ComparisonScores> = {
  "Renewable Utilities": { assetDurability: 9, esgAlignment: 9, revenuePredictability: 8, obsolescenceRisk: 9, sectorRelevance: 10 },
  "Regulated Utilities": { assetDurability: 9, esgAlignment: 7, revenuePredictability: 10, obsolescenceRisk: 9, sectorRelevance: 8 },
  "Utilities": { assetDurability: 9, esgAlignment: 7, revenuePredictability: 9, obsolescenceRisk: 9, sectorRelevance: 8 },
  "Electricity Transmission": { assetDurability: 9, esgAlignment: 8, revenuePredictability: 10, obsolescenceRisk: 9, sectorRelevance: 9 },
  "Offshore Wind": { assetDurability: 8, esgAlignment: 10, revenuePredictability: 5, obsolescenceRisk: 7, sectorRelevance: 10 },
  "Renewables": { assetDurability: 8, esgAlignment: 9, revenuePredictability: 7, obsolescenceRisk: 8, sectorRelevance: 9 },
  "Water Infrastructure": { assetDurability: 10, esgAlignment: 9, revenuePredictability: 10, obsolescenceRisk: 10, sectorRelevance: 10 },
  "Water Technology": { assetDurability: 7, esgAlignment: 9, revenuePredictability: 7, obsolescenceRisk: 7, sectorRelevance: 9 },
  "Water and Sustainability Solutions": { assetDurability: 6, esgAlignment: 8, revenuePredictability: 8, obsolescenceRisk: 8, sectorRelevance: 8 },
  "Circular Economy": { assetDurability: 9, esgAlignment: 7, revenuePredictability: 9, obsolescenceRisk: 9, sectorRelevance: 8 },
  "Energy Efficiency": { assetDurability: 7, esgAlignment: 9, revenuePredictability: 7, obsolescenceRisk: 7, sectorRelevance: 9 },
  "Rail Infrastructure": { assetDurability: 10, esgAlignment: 7, revenuePredictability: 8, obsolescenceRisk: 10, sectorRelevance: 8 },
  "Airport & Transport Infrastructure": { assetDurability: 9, esgAlignment: 7, revenuePredictability: 7, obsolescenceRisk: 8, sectorRelevance: 8 },
  "Telecom Infrastructure": { assetDurability: 9, esgAlignment: 7, revenuePredictability: 8, obsolescenceRisk: 8, sectorRelevance: 8 },
  "Sustainable Logistics REIT": { assetDurability: 9, esgAlignment: 8, revenuePredictability: 8, obsolescenceRisk: 8, sectorRelevance: 9 },
  "Storage REIT": { assetDurability: 9, esgAlignment: 5, revenuePredictability: 8, obsolescenceRisk: 9, sectorRelevance: 6 },
  "Essential Services": { assetDurability: 7, esgAlignment: 6, revenuePredictability: 9, obsolescenceRisk: 9, sectorRelevance: 7 }
};

function clampScore(value: number) {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function fitLabel(haloFit: number) {
  if (haloFit >= 4.5) return "Core";
  if (haloFit >= 3) return "Watch";
  return "Marginal";
}

function adjustScore(base: number, delta: number) {
  return clampScore(base + delta);
}

function scorePresetForSector(sector: string) {
  return SECTOR_SCORE_PRESETS[sector] ?? DEFAULT_SCORE_PRESET;
}

function scoreModel(company: { haloFit: number; esgFit: number; mediumTermScore: number; sector: string }): ComparisonScores {
  const preset = scorePresetForSector(company.sector);
  const haloDelta = (company.haloFit - 4) * 0.8;
  const esgDelta = (company.esgFit - 4) * 0.9;
  const mediumDelta = (company.mediumTermScore - 4) * 0.8;

  return {
    assetDurability: adjustScore(preset.assetDurability, haloDelta),
    esgAlignment: adjustScore(preset.esgAlignment, esgDelta),
    revenuePredictability: adjustScore(preset.revenuePredictability, mediumDelta + (company.haloFit >= 5 ? 0.4 : 0)),
    obsolescenceRisk: adjustScore(preset.obsolescenceRisk, ((company.haloFit + company.mediumTermScore) / 2 - 4) * 0.9),
    sectorRelevance: adjustScore(preset.sectorRelevance, mediumDelta + (company.haloFit - 4) * 0.4)
  };
}

function lifecycleLabel(status: string) {
  if (status === "candidate") return "Candidate";
  if (status === "under_review") return "Under review";
  if (status === "removed") return "Removed";
  if (status === "archived") return "Archived";
  return "Excluded";
}

function esgCategoryLabel(category: string) {
  if (category === "green") return "ESG: Green";
  if (category === "mixed") return "ESG: Mixed";
  return "ESG: Excluded";
}

function normalizeSectorTokens(sector: string) {
  return String(sector || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((token) => !["and", "the", "solutions"].includes(token));
}

function similarityScore(company: { sector: string }, peer: LifecyclePeer) {
  const companyTokens = normalizeSectorTokens(company.sector);
  const peerTokens = normalizeSectorTokens(peer.sector);
  const sharedTokenCount = companyTokens.filter((token) => peerTokens.includes(token)).length;
  const exactSectorBoost = peer.sector === company.sector ? 6 : 0;
  const tokenBoost = sharedTokenCount * 1.75;
  const lifecycleBoost = peer.lifecycleStatus === "under_review" ? 1.25 : peer.lifecycleStatus === "candidate" ? 1 : peer.lifecycleStatus === "removed" ? 0.5 : 0.25;
  const esgBoost = peer.esgCategory === "mixed" ? 0.75 : peer.esgCategory === "excluded" ? 0.5 : 0.25;
  const performanceBoost = peer.monthReturnPct != null ? Math.max(0, 1 - Math.abs(peer.monthReturnPct) / 20) : 0;

  return exactSectorBoost + tokenBoost + lifecycleBoost + esgBoost + performanceBoost;
}

function exclusionReason(
  peer: { sector: string; lifecycleStatus: string; esgCategory: string },
  company: { sector: string; ticker: string }
) {
  const sectorSentence = peer.sector === company.sector
    ? `It sits in the same sector theme as ${company.ticker}.`
    : "It overlaps with the same broad HALO infrastructure lens.";

  const lifecycleSentence = peer.lifecycleStatus === "candidate"
    ? "It is still a candidate rather than an active inclusion, so the case is not yet strong enough for the current index."
    : peer.lifecycleStatus === "under_review"
      ? "It is under review rather than active, so the present evidence is not yet decisive enough for inclusion."
      : "It is not part of the active index today, which means the current case is weaker than the selected holding.";

  const esgSentence = peer.esgCategory === "excluded"
    ? "Its current ESG category is more problematic inside this framework."
    : peer.esgCategory === "mixed"
      ? "Its ESG profile is currently less straightforward than the selected company."
      : "Its overall case is simply not preferred right now.";

  return `${sectorSentence} ${lifecycleSentence} ${esgSentence}`;
}

function buildExcludedPeers(
  company: { ticker: string; sector: string },
  pool: LifecyclePeer[]
) {
  return pool
    .filter((peer) => peer.ticker !== company.ticker)
    .sort((left, right) => {
      const scoreDifference = similarityScore(company, right) - similarityScore(company, left);
      if (scoreDifference !== 0) return scoreDifference;
      return left.name.localeCompare(right.name);
    })
    .slice(0, 3)
    .map((peer) => ({
      ticker: peer.ticker,
      name: peer.name,
      lifecycleLabel: lifecycleLabel(peer.lifecycleStatus),
      why: exclusionReason(peer, company)
    }));
}

export async function getThisIsTheCalculatorCompanies(): Promise<ComparisonCompany[]> {
  const [overview, lifecycleGroups] = await Promise.all([
    getBasketOverview(),
    getCompanyLifecycleGroups()
  ]);

  const excludedPool = [
    ...lifecycleGroups.candidates,
    ...lifecycleGroups.underReview,
    ...lifecycleGroups.removed
  ] as LifecyclePeer[];

  return overview.companies.map((company) => ({
    ticker: company.ticker,
    name: company.name,
    sector: company.sector,
    currency: company.snapshot.currency,
    price: Number(company.snapshot.closePrice ?? 0),
    changePercent1D: Number(company.snapshot.dayChangePct ?? 0),
    perf: {
      "1M": Number(company.snapshot.monthReturnPct ?? 0),
      "YTD": Number(company.snapshot.ytdReturnPct ?? 0),
      "1Y": Number(company.snapshot.oneYearReturnPct ?? 0)
    },
    isDelayed: Boolean(company.snapshot.isDelayed),
    fitLabel: fitLabel(company.haloFit),
    esgCategoryLabel: esgCategoryLabel(company.esgCategory),
    scores: scoreModel(company),
    thesisShort: company.rationaleShort,
    thesis: company.rationaleLong,
    keyRisks: company.concerns || "No key risk summary is documented yet.",
    watchpoints: company.watchpoints || [],
    notInstead: buildExcludedPeers(company, excludedPool)
  }));
}