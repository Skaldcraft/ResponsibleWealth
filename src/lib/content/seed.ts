export type SeedCompany = {
  id?: string;
  ticker: string;
  slug: string;
  name: string;
  exchange: string;
  country: string;
  sector: string;
  shortDescription: string;
  lifecycleStatus: "candidate" | "active" | "under_review" | "removed" | "archived";
  haloFit: number;
  esgFit: number;
  mediumTermScore: number;
  esgCategory: "green" | "mixed" | "excluded";
  rationaleShort: string;
  rationaleLong: string;
  strengths: string;
  concerns: string;
  watchpoints: string[];
  sources: Array<{ type: "ir" | "sustainability" | "market_data" | "esg_rating" | "news"; label: string; url: string }>;
  snapshot: {
    asOfDate: string;
    currency: string;
    closePrice: number;
    dayChangePct: number;
    monthReturnPct: number;
    ytdReturnPct: number;
    oneYearReturnPct: number;
    isDelayed: boolean;
  };
  updates: Array<{ title: string; summary: string; body: string; updateType: "thesis" | "esg" | "operations" | "results" | "controversy"; effectiveDate: string }>;
  reviews: Array<{ reviewType: "monthly" | "quarterly" | "annual"; summary: string; reviewedAt: string }>;
};

const date = "2026-03-20T00:00:00.000Z";

function makeCompany(company: Omit<SeedCompany, "sources" | "updates" | "reviews"> & { sustainabilityUrl: string; marketUrl: string; newsUrl?: string }): SeedCompany {
  const sources: SeedCompany["sources"] = [
    { type: "sustainability", label: `${company.name} Sustainability`, url: company.sustainabilityUrl },
    { type: "market_data", label: `Yahoo Finance ${company.ticker}`, url: company.marketUrl }
  ];

  if (company.newsUrl) {
    sources.push({ type: "news", label: `${company.name} Newsroom`, url: company.newsUrl });
  }

  return {
    ...company,
    sources,
    updates: [
      {
        title: `${company.name} remains aligned with the medium-term thesis`,
        summary: "The current view is still shaped more by durable assets and operating progress than by daily market noise.",
        body: `${company.name} remains relevant to the HALO ESG framework because its story is tied to long-lived assets, practical operating outcomes, and a slower-moving research process.`,
        updateType: "thesis",
        effectiveDate: date
      }
    ],
    reviews: [
      {
        reviewType: "quarterly",
        summary: `No classification change. ${company.name} remains in the ${company.esgCategory} category under the current framework.`,
        reviewedAt: date
      }
    ]
  };
}

export const seedCompanies: SeedCompany[] = [
  makeCompany({
    ticker: "NEE",
    slug: "nextera-energy",
    name: "NextEra Energy",
    exchange: "NYSE",
    country: "United States",
    sector: "Renewable Utilities",
    shortDescription: "Large-scale utility and renewable operator with durable infrastructure exposure.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 4,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "A core HALO utility with heavy infrastructure and a visible clean-energy transition pathway.",
    rationaleLong: "NextEra combines regulated utility assets with large renewable development capacity, making it a strong fit for a medium-term responsible investment framework focused on durable physical assets.",
    strengths: "Renewables leadership, long-duration assets, recurring cash flow.",
    concerns: "Execution risk on projects and pace of the energy transition.",
    watchpoints: ["Track renewable capacity additions.", "Monitor project execution and financing conditions.", "Watch policy and grid investment support."],
    sustainabilityUrl: "https://www.investor.nexteraenergy.com/sustainability/sustainability-resources/",
    marketUrl: "https://finance.yahoo.com/quote/NEE/",
    newsUrl: "https://newsroom.nexteraenergy.com/",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 61.42, dayChangePct: 0.8, monthReturnPct: 2.4, ytdReturnPct: 3.8, oneYearReturnPct: 9.6, isDelayed: true }
  }),
  makeCompany({
    ticker: "EXC",
    slug: "exelon",
    name: "Exelon",
    exchange: "NASDAQ",
    country: "United States",
    sector: "Regulated Utilities",
    shortDescription: "Regulated utility network with defensive cash flows and significant grid assets.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 4,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "A lower-volatility utility exposure aligned with medium-term infrastructure themes.",
    rationaleLong: "Exelon offers exposure to electricity transmission and distribution infrastructure with regulated economics, supporting the platform's lower-stress and medium-term framing.",
    strengths: "Regulated model, essential service, high asset intensity.",
    concerns: "Rate-case pressure and regulatory execution risk.",
    watchpoints: ["Monitor grid modernization spending.", "Track regulatory outcomes.", "Watch decarbonization milestones."],
    sustainabilityUrl: "https://www.exeloncorp.com/sustainability",
    marketUrl: "https://finance.yahoo.com/quote/EXC/",
    newsUrl: "https://www.exeloncorp.com/newsroom",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 38.75, dayChangePct: 0.2, monthReturnPct: 1.1, ytdReturnPct: 1.9, oneYearReturnPct: 6.2, isDelayed: true }
  }),
  makeCompany({
    ticker: "DUK",
    slug: "duke-energy",
    name: "Duke Energy",
    exchange: "NYSE",
    country: "United States",
    sector: "Utilities",
    shortDescription: "Large regulated utility with long-lived physical assets.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 3,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "Useful as a slower-moving utility exposure with durable infrastructure.",
    rationaleLong: "Duke's relevance to the HALO framework comes from the durability of the underlying grid assets and the gradual nature of transition and reinvestment.",
    strengths: "Essential service, scale, long-duration infrastructure.",
    concerns: "Transition pace and regulatory constraints.",
    watchpoints: ["Generation mix changes.", "Capital plan execution.", "Regulatory settlements."],
    sustainabilityUrl: "https://www.duke-energy.com/our-company/sustainability",
    marketUrl: "https://finance.yahoo.com/quote/DUK/",
    newsUrl: "https://news.duke-energy.com/",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 96.03, dayChangePct: -0.3, monthReturnPct: 0.9, ytdReturnPct: 2.1, oneYearReturnPct: 4.4, isDelayed: true }
  }),
  makeCompany({
    ticker: "SO",
    slug: "southern-company",
    name: "Southern Company",
    exchange: "NYSE",
    country: "United States",
    sector: "Utilities",
    shortDescription: "Defensive utility exposure with a heavy-asset base and essential-service profile.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 3,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "A practical inclusion for lower-stress utility exposure inside the basket.",
    rationaleLong: "Southern Company is included for its infrastructure footprint and essential-service nature, while still requiring ongoing scrutiny on transition quality and capital discipline.",
    strengths: "Defensive profile, cash-flow visibility, essential infrastructure.",
    concerns: "Capital intensity and transition credibility.",
    watchpoints: ["Capex discipline.", "Transition milestones.", "Operational reliability."],
    sustainabilityUrl: "https://www.southerncompany.com/sustainability.html",
    marketUrl: "https://finance.yahoo.com/quote/SO/",
    newsUrl: "https://www.southerncompany.com/newsroom.html",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 70.11, dayChangePct: 0.4, monthReturnPct: 1.4, ytdReturnPct: 1.8, oneYearReturnPct: 5.2, isDelayed: true }
  }),
  makeCompany({
    ticker: "IBE",
    slug: "iberdrola",
    name: "Iberdrola",
    exchange: "BME",
    country: "Spain",
    sector: "Renewable Utilities",
    shortDescription: "European utility with a strong renewables build-out and grid focus.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 5,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "A flagship European HALO-ESG holding with visible renewable and grid expansion.",
    rationaleLong: "Iberdrola fits the project especially well because it combines durable physical energy infrastructure with a clear medium-term renewable and grid investment roadmap.",
    strengths: "Renewables scale, grid assets, European diversification.",
    concerns: "Execution, rates, and regulatory shifts across markets.",
    watchpoints: ["Renewable capacity targets.", "Grid investment execution.", "European regulatory changes."],
    sustainabilityUrl: "https://www.iberdrola.com/sustainability",
    marketUrl: "https://finance.yahoo.com/quote/IBE.MC/",
    newsUrl: "https://www.iberdrola.com/press-room",
    snapshot: { asOfDate: date, currency: "EUR", closePrice: 13.24, dayChangePct: 0.6, monthReturnPct: 3.1, ytdReturnPct: 5.9, oneYearReturnPct: 13.8, isDelayed: true }
  }),
  makeCompany({
    ticker: "ORSTED",
    slug: "orsted",
    name: "Orsted",
    exchange: "CPH",
    country: "Denmark",
    sector: "Offshore Wind",
    shortDescription: "Offshore wind developer and operator with long-duration physical assets.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 5,
    mediumTermScore: 3,
    esgCategory: "green",
    rationaleShort: "A pure-play energy transition name with heavy offshore infrastructure.",
    rationaleLong: "Orsted broadens the basket with a more specialized renewable infrastructure profile, emphasizing the project's focus on long-lived real-world assets.",
    strengths: "Renewable specialization, tangible infrastructure, transition relevance.",
    concerns: "Project economics and execution volatility.",
    watchpoints: ["Project pipeline economics.", "Capital discipline.", "Offshore demand and permitting."],
    sustainabilityUrl: "https://orsted.com/en/sustainability",
    marketUrl: "https://finance.yahoo.com/quote/ORSTED.CO/",
    newsUrl: "https://orsted.com/en/media/news/",
    snapshot: { asOfDate: date, currency: "DKK", closePrice: 412.5, dayChangePct: -0.5, monthReturnPct: -2.1, ytdReturnPct: -1.2, oneYearReturnPct: 1.7, isDelayed: true }
  }),
  makeCompany({
    ticker: "EDP",
    slug: "edp-renovaveis",
    name: "EDP Renovaveis",
    exchange: "ELI",
    country: "Portugal",
    sector: "Renewables",
    shortDescription: "Renewables-focused operator with long-lived wind and solar assets.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 5,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "Adds dedicated renewable infrastructure exposure to the basket.",
    rationaleLong: "EDP Renovaveis strengthens the European clean-energy side of the HALO ESG approach by focusing on infrastructure that unfolds over years of deployment and operation.",
    strengths: "Renewable asset base, geographic diversification, clear thematic fit.",
    concerns: "Power pricing and project returns.",
    watchpoints: ["Capacity additions.", "Asset profitability.", "Power market conditions."],
    sustainabilityUrl: "https://edp.com/en/responsible-action/environment/",
    marketUrl: "https://finance.yahoo.com/quote/EDPR.LS/",
    newsUrl: "https://edp.com/en/media/news/",
    snapshot: { asOfDate: date, currency: "EUR", closePrice: 10.82, dayChangePct: 0.1, monthReturnPct: 1.7, ytdReturnPct: 2.3, oneYearReturnPct: 7.1, isDelayed: true }
  }),
  makeCompany({
    ticker: "AWK",
    slug: "american-water-works",
    name: "American Water Works",
    exchange: "NYSE",
    country: "United States",
    sector: "Water Infrastructure",
    shortDescription: "Water utility and infrastructure operator focused on essential public-service assets.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 5,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "Core water-infrastructure exposure with obvious real-world utility.",
    rationaleLong: "Water infrastructure is one of the clearest examples of the HALO ESG framework: hard-to-replace physical networks tied to essential services and long-term capital investment.",
    strengths: "Essential service, durable networks, clear responsible-investing relevance.",
    concerns: "Regulatory outcomes and affordability pressures.",
    watchpoints: ["Rate cases.", "Infrastructure investment pipeline.", "Water quality and resilience projects."],
    sustainabilityUrl: "https://ir.amwater.com/sustainability/",
    marketUrl: "https://finance.yahoo.com/quote/AWK/",
    newsUrl: "https://newsroom.amwater.com/",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 122.88, dayChangePct: 0.5, monthReturnPct: 2.0, ytdReturnPct: 3.0, oneYearReturnPct: 8.5, isDelayed: true }
  }),
  makeCompany({
    ticker: "XYL",
    slug: "xylem",
    name: "Xylem",
    exchange: "NYSE",
    country: "United States",
    sector: "Water Technology",
    shortDescription: "Water technology provider tied to long-run infrastructure efficiency and resilience.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 5,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "A strong fit where environmental utility and durable industrial systems overlap.",
    rationaleLong: "Xylem is included because it brings a practical water-infrastructure and efficiency angle to the basket, with measurable relevance to resource use and system resilience.",
    strengths: "Water efficiency, industrial relevance, clear sustainability narrative.",
    concerns: "Industrial demand cycles.",
    watchpoints: ["Water technology demand.", "Municipal and industrial orders.", "Operational execution."],
    sustainabilityUrl: "https://www.xylem.com/en-us/sustainability/",
    marketUrl: "https://finance.yahoo.com/quote/XYL/",
    newsUrl: "https://www.xylem.com/en-us/about-xylem/newsroom/",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 126.4, dayChangePct: 1.2, monthReturnPct: 4.0, ytdReturnPct: 6.6, oneYearReturnPct: 14.2, isDelayed: true }
  }),
  makeCompany({
    ticker: "ECL",
    slug: "ecolab",
    name: "Ecolab",
    exchange: "NYSE",
    country: "United States",
    sector: "Water and Sustainability Solutions",
    shortDescription: "Industrial and water-efficiency company with measurable sustainability relevance.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 5,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "A practical inclusion for readers looking at responsible industrial efficiency.",
    rationaleLong: "Ecolab gives the basket an efficiency and water-management angle that fits the platform's educational mission around practical, medium-term responsible investing.",
    strengths: "Water efficiency, industrial customers, durable operating footprint.",
    concerns: "Input costs and industrial cycles.",
    watchpoints: ["Customer demand trends.", "Water-efficiency milestones.", "Margin resilience."],
    sustainabilityUrl: "https://www.ecolab.com/corporate-responsibility/environment/",
    marketUrl: "https://finance.yahoo.com/quote/ECL/",
    newsUrl: "https://www.ecolab.com/news",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 218.55, dayChangePct: 0.7, monthReturnPct: 2.7, ytdReturnPct: 4.8, oneYearReturnPct: 11.3, isDelayed: true }
  }),
  makeCompany({
    ticker: "WM",
    slug: "waste-management",
    name: "Waste Management",
    exchange: "NYSE",
    country: "United States",
    sector: "Circular Economy",
    shortDescription: "Waste and recycling infrastructure operator with durable essential-service assets.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 5,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "A clear circular-economy infrastructure holding.",
    rationaleLong: "Waste Management is a straightforward fit for the platform because it ties hard assets, recurring demand, and sustainability relevance into one explainable business model.",
    strengths: "Essential infrastructure, pricing power, circular-economy relevance.",
    concerns: "Execution and regulatory compliance.",
    watchpoints: ["Recycling and landfill gas progress.", "Margin trends.", "Capex deployment."],
    sustainabilityUrl: "https://sustainability.wm.com/",
    marketUrl: "https://finance.yahoo.com/quote/WM/",
    newsUrl: "https://investors.wm.com/news-releases",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 202.17, dayChangePct: 0.3, monthReturnPct: 1.8, ytdReturnPct: 4.2, oneYearReturnPct: 10.1, isDelayed: true }
  }),
  makeCompany({
    ticker: "TT",
    slug: "trane-technologies",
    name: "Trane Technologies",
    exchange: "NYSE",
    country: "United States",
    sector: "Energy Efficiency",
    shortDescription: "Industrial HVAC and building-efficiency company tied to long-lived equipment and retrofit demand.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 5,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "Energy-efficiency exposure through durable industrial equipment.",
    rationaleLong: "Trane adds a practical efficiency angle to the basket and reinforces the idea that responsible investing can include the systems that reduce energy demand over time.",
    strengths: "Efficiency theme, industrial durability, retrofit tailwinds.",
    concerns: "Cyclical demand and industrial execution.",
    watchpoints: ["HVAC demand.", "Efficiency retrofit trends.", "Margin discipline."],
    sustainabilityUrl: "https://www.tranetechnologies.com/en/index/sustainability.html",
    marketUrl: "https://finance.yahoo.com/quote/TT/",
    newsUrl: "https://investors.tranetechnologies.com/news-and-events/news-releases",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 286.2, dayChangePct: 1.0, monthReturnPct: 5.2, ytdReturnPct: 7.7, oneYearReturnPct: 17.5, isDelayed: true }
  }),
  makeCompany({
    ticker: "UNP",
    slug: "union-pacific",
    name: "Union Pacific",
    exchange: "NYSE",
    country: "United States",
    sector: "Rail Infrastructure",
    shortDescription: "North American rail network with durable infrastructure and lower-emission freight relevance.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 4,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "A classic HALO holding with clear infrastructure durability.",
    rationaleLong: "Union Pacific illustrates the platform's core thesis well: hard-to-replicate assets, long time horizons, and a business model less vulnerable to rapid obsolescence.",
    strengths: "Network effects, durable rail assets, freight efficiency.",
    concerns: "Volumes, regulation, and service execution.",
    watchpoints: ["Freight volume trends.", "Operational efficiency.", "Capital return vs reinvestment balance."],
    sustainabilityUrl: "https://www.up.com/communities",
    marketUrl: "https://finance.yahoo.com/quote/UNP/",
    newsUrl: "https://www.up.com/news",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 239.88, dayChangePct: -0.1, monthReturnPct: 1.6, ytdReturnPct: 2.8, oneYearReturnPct: 7.8, isDelayed: true }
  }),
  makeCompany({
    ticker: "CNI",
    slug: "canadian-national-railway",
    name: "Canadian National Railway",
    exchange: "TSX",
    country: "Canada",
    sector: "Rail Infrastructure",
    shortDescription: "Rail network exposure with durable assets and a long-run transport role.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 4,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "Complements UNP with a second durable rail operator.",
    rationaleLong: "CNI helps diversify the rail component of the basket while preserving the same lower-obsolescence and infrastructure logic.",
    strengths: "Durable network assets, lower-emission freight relevance, essential transport role.",
    concerns: "Freight cycles and execution.",
    watchpoints: ["Cross-border volume trends.", "Network productivity.", "Operating margins."],
    sustainabilityUrl: "https://investors.duke-energy.com/esg/governance-documents/",
    marketUrl: "https://finance.yahoo.com/quote/CNI/",
    newsUrl: "https://www.cn.ca/en/media/news/",
    snapshot: { asOfDate: date, currency: "CAD", closePrice: 168.42, dayChangePct: 0.2, monthReturnPct: 1.3, ytdReturnPct: 2.4, oneYearReturnPct: 6.9, isDelayed: true }
  }),
  makeCompany({
    ticker: "PLD",
    slug: "prologis",
    name: "Prologis",
    exchange: "NYSE",
    country: "United States",
    sector: "Sustainable Logistics REIT",
    shortDescription: "Logistics real estate owner with durable assets tied to storage and distribution.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 4,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "A property-based HALO name with long-lived logistics assets.",
    rationaleLong: "Prologis adds a real estate angle to the basket while still fitting the heavy-asset and medium-term framework through strategic logistics infrastructure.",
    strengths: "Prime logistics assets, scale, durable cash flow.",
    concerns: "Rate sensitivity and property cycles.",
    watchpoints: ["Occupancy trends.", "Rent growth.", "Balance-sheet discipline."],
    sustainabilityUrl: "https://www.prologis.com/impact-sustainability/",
    marketUrl: "https://finance.yahoo.com/quote/PLD/",
    newsUrl: "https://www.prologis.com/insights-news/",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 127.12, dayChangePct: 0.9, monthReturnPct: 3.5, ytdReturnPct: 4.9, oneYearReturnPct: 12.4, isDelayed: true }
  }),
  makeCompany({
    ticker: "PSA",
    slug: "public-storage",
    name: "Public Storage",
    exchange: "NYSE",
    country: "United States",
    sector: "Storage REIT",
    shortDescription: "Storage real estate platform with durable physical assets and recurring demand.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 4,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "A durable-asset REIT with a simple, explainable business model.",
    rationaleLong: "Public Storage adds lower-complexity real estate exposure to the basket and reinforces the site's preference for understandable, long-lived assets.",
    strengths: "Recurring revenue, durable assets, simple business model.",
    concerns: "Rate sensitivity and local market conditions.",
    watchpoints: ["Occupancy.", "Rental rate trends.", "Development discipline."],
    sustainabilityUrl: "https://www.publicstorage.com/solar-sustainability/solar-sustainability.html/",
    marketUrl: "https://finance.yahoo.com/quote/PSA/",
    newsUrl: "https://investors.publicstorage.com/news-releases/default.aspx",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 282.66, dayChangePct: 0.4, monthReturnPct: 2.2, ytdReturnPct: 3.3, oneYearReturnPct: 8.8, isDelayed: true }
  }),
  makeCompany({
    ticker: "SCI",
    slug: "service-corporation-international",
    name: "Service Corporation International",
    exchange: "NYSE",
    country: "United States",
    sector: "Essential Services",
    shortDescription: "Essential-services operator with a resilient, lower-obsolescence business model.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 3,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "Included for durable demand and essential-service characteristics.",
    rationaleLong: "SCI broadens the HALO conversation beyond classic infrastructure by focusing on essential services that are less exposed to rapid technological displacement.",
    strengths: "Essential service, recurring demand, durability.",
    concerns: "Reputation and demand normalization.",
    watchpoints: ["Margin trends.", "Long-term service demand.", "Capital allocation."],
    sustainabilityUrl: "https://www.sci-corp.com/about/responsibility",
    marketUrl: "https://finance.yahoo.com/quote/SCI/",
    newsUrl: "https://news.sci-corp.com/news-releases",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 74.9, dayChangePct: 0.3, monthReturnPct: 1.2, ytdReturnPct: 2.6, oneYearReturnPct: 6.1, isDelayed: true }
  }),
  makeCompany({
    ticker: "ROL",
    slug: "rollins",
    name: "Rollins",
    exchange: "NYSE",
    country: "United States",
    sector: "Essential Services",
    shortDescription: "Pest-control services business with recurring demand and public-health relevance.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 4,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "An essential-services company with recurring real-world demand.",
    rationaleLong: "Rollins is a practical inclusion because it combines durable demand and service resilience with a business model that remains easy to understand and monitor.",
    strengths: "Recurring service demand, public-health utility, lower obsolescence.",
    concerns: "Valuation and execution.",
    watchpoints: ["Service demand trends.", "Margin expansion.", "Operational consistency."],
    sustainabilityUrl: "https://www.rollins.com/our-culture/our-impact/",
    marketUrl: "https://finance.yahoo.com/quote/ROL/",
    newsUrl: "https://www.rollins.com/investors/press-releases",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 48.33, dayChangePct: 0.5, monthReturnPct: 2.8, ytdReturnPct: 4.1, oneYearReturnPct: 12.0, isDelayed: true }
  }),
  makeCompany({
    ticker: "AMT",
    slug: "american-tower",
    name: "American Tower Corp",
    exchange: "NYSE",
    country: "United States",
    sector: "Telecom Infrastructure",
    shortDescription: "Global operator of wireless communications towers and broadcast infrastructure with long-duration lease contracts.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 4,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "A core infrastructure REIT with durable, hard-to-replicate tower assets and recurring revenues.",
    rationaleLong: "American Tower fits the HALO ESG framework as a classic heavy-asset, lower-obsolescence business. Its global tower portfolio supports the digital backbone of modern connectivity, with long-term contracts providing stable cash flow and limited technology displacement risk.",
    strengths: "Global tower footprint, recurring lease revenue, essential digital infrastructure, macro-tower demand growth.",
    concerns: "Interest-rate sensitivity, leverage levels, and emerging-market currency risk.",
    watchpoints: ["Organic tenant additions.", "Leverage and deleveraging trajectory.", "5G build-out contribution to tower demand."],
    sustainabilityUrl: "https://www.americantower.com/sustainability/",
    marketUrl: "https://finance.yahoo.com/quote/AMT/",
    newsUrl: "https://www.americantower.com/media-hub/",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 176.79, dayChangePct: -3.3, monthReturnPct: -2.8, ytdReturnPct: -1.5, oneYearReturnPct: 4.2, isDelayed: true }
  }),
  makeCompany({
    ticker: "CCI",
    slug: "crown-castle",
    name: "Crown Castle Inc",
    exchange: "NYSE",
    country: "United States",
    sector: "Telecom Infrastructure",
    shortDescription: "US-focused tower and small-cell infrastructure company supporting wireless network densification.",
    lifecycleStatus: "active",
    haloFit: 4,
    esgFit: 4,
    mediumTermScore: 3,
    esgCategory: "green",
    rationaleShort: "A US-centric telecom infrastructure holding with durable tower assets and densification exposure.",
    rationaleLong: "Crown Castle complements AMT with a domestic focus on tower and small-cell infrastructure. Its relevance to the HALO framework lies in the long-lived nature of tower assets and the essential role they play in connectivity, though the fiber divestiture adds a near-term transition dimension.",
    strengths: "US tower portfolio, essential wireless infrastructure, recurring revenue model, densification tailwinds.",
    concerns: "Fiber divestiture execution, interest-rate exposure, and concentrated US footprint.",
    watchpoints: ["Fiber business divestiture timeline.", "Small-cell deployment pace.", "Balance-sheet and dividend sustainability."],
    sustainabilityUrl: "https://www.crowncastle.com/sustainability/",
    marketUrl: "https://finance.yahoo.com/quote/CCI/",
    newsUrl: "https://www.crowncastle.com/news/",
    snapshot: { asOfDate: date, currency: "USD", closePrice: 82.36, dayChangePct: -3.2, monthReturnPct: -4.1, ytdReturnPct: -6.8, oneYearReturnPct: -2.5, isDelayed: true }
  }),
  makeCompany({
    ticker: "VIE",
    slug: "veolia-environnement",
    name: "Veolia Environnement SA",
    exchange: "EPA",
    country: "France",
    sector: "Water Infrastructure",
    shortDescription: "European leader in water, waste, and energy services with critical infrastructure assets across multiple continents.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 5,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "A flagship European water and environmental infrastructure holding with global reach and clear ESG alignment.",
    rationaleLong: "Veolia is one of the strongest fits for the HALO ESG basket because it combines essential public-service water infrastructure with a measurable environmental-impact mandate. Its asset base is durable, hard to replicate, and tied to long-term municipal and industrial contracts.",
    strengths: "Global water and waste infrastructure, essential public-service contracts, scale, and circular-economy positioning.",
    concerns: "Regulatory and political risk in concession markets, integration complexity after Suez acquisition.",
    watchpoints: ["Synergies from Suez integration.", "Municipal contract renewals and pricing.", "Water-stress adaptation investments."],
    sustainabilityUrl: "https://www.veolia.com/en/veolia-group/csr-multifaceted-performance",
    marketUrl: "https://finance.yahoo.com/quote/VEOEY/",
    newsUrl: "https://www.veolia.com/en/newsroom",
    snapshot: { asOfDate: date, currency: "EUR", closePrice: 31.10, dayChangePct: -1.6, monthReturnPct: -3.2, ytdReturnPct: 2.4, oneYearReturnPct: 10.8, isDelayed: true }
  }),
  makeCompany({
    ticker: "TRN",
    slug: "terna",
    name: "Terna",
    exchange: "BIT",
    country: "Italy",
    sector: "Electricity Transmission",
    shortDescription: "Italian electricity transmission system operator with regulated, long-lived grid infrastructure.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 5,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "A regulated European grid operator with highly durable transmission assets and energy-transition relevance.",
    rationaleLong: "Terna is one of the purest infrastructure plays in the basket. As Italy's transmission system operator, it owns and maintains the national electricity grid — assets that are essential, regulated, and virtually impossible to replicate. Its investment plan is closely linked to renewable integration and grid modernization.",
    strengths: "Regulated monopoly, essential grid assets, energy-transition capex, stable cash flow.",
    concerns: "Regulatory re-sets, Italian political risk, capex execution.",
    watchpoints: ["Grid modernization capex execution.", "Regulatory framework updates.", "Interconnector and renewable integration projects."],
    sustainabilityUrl: "https://www.terna.it/en/sustainability",
    marketUrl: "https://finance.yahoo.com/quote/TRN.MI/",
    newsUrl: "https://www.terna.it/en/media/",
    snapshot: { asOfDate: date, currency: "EUR", closePrice: 9.80, dayChangePct: -1.1, monthReturnPct: -1.6, ytdReturnPct: 1.8, oneYearReturnPct: 7.4, isDelayed: true }
  }),
  makeCompany({
    ticker: "RED",
    slug: "redeia",
    name: "Redeia Corporacion SA",
    exchange: "BME",
    country: "Spain",
    sector: "Electricity Transmission",
    shortDescription: "Spanish electricity transmission system operator with regulated infrastructure and telecom assets.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 5,
    mediumTermScore: 4,
    esgCategory: "green",
    rationaleShort: "A regulated Spanish transmission operator with stable, essential grid assets and a small telecom diversification.",
    rationaleLong: "Redeia (formerly Red Eléctrica) operates Spain's high-voltage electricity transmission grid — a regulated monopoly with extreme asset durability and visibility. It complements Terna to give the basket European grid infrastructure exposure across two key energy-transition markets.",
    strengths: "Regulated monopoly, essential grid infrastructure, high dividend visibility, energy-transition capex alignment.",
    concerns: "Regulatory resets, limited growth optionality, Spanish sovereign risk.",
    watchpoints: ["Regulatory WACC updates.", "Renewables integration investment.", "Telecom subsidiary strategy."],
    sustainabilityUrl: "https://www.redeia.com/en/sustainability",
    marketUrl: "https://finance.yahoo.com/quote/RED.MC/",
    newsUrl: "https://www.redeia.com/en/press-office/news/",
    snapshot: { asOfDate: date, currency: "EUR", closePrice: 14.90, dayChangePct: 0.1, monthReturnPct: -0.8, ytdReturnPct: 1.2, oneYearReturnPct: 5.6, isDelayed: true }
  }),
  makeCompany({
    ticker: "FER",
    slug: "ferrovial",
    name: "Ferrovial SE",
    exchange: "AMS",
    country: "Netherlands",
    sector: "Airport & Transport Infrastructure",
    shortDescription: "Global infrastructure operator with major airport, toll road, and construction assets across multiple continents.",
    lifecycleStatus: "active",
    haloFit: 5,
    esgFit: 4,
    mediumTermScore: 5,
    esgCategory: "green",
    rationaleShort: "A diversified transport infrastructure operator with flagship airport and toll-road concessions.",
    rationaleLong: "Ferrovial brings to the HALO basket a unique combination of airport concessions (Heathrow and others), managed toll roads, and construction capabilities. Its infrastructure assets are characterised by long concession periods, high barriers to entry, and essential-service demand patterns — all core HALO qualities.",
    strengths: "Flagship airport concessions, global toll-road portfolio, long-duration concessions, essential transport demand.",
    concerns: "Concession renewal risk, construction cyclicality, Amsterdam listing liquidity.",
    watchpoints: ["Heathrow concession developments.", "Managed Lanes traffic recovery.", "Capital recycling and asset rotation strategy."],
    sustainabilityUrl: "https://www.ferrovial.com/en/sustainability/corporate-social-responsibility/csr-plan/",
    marketUrl: "https://finance.yahoo.com/quote/FER/",
    newsUrl: "https://newsroom.ferrovial.com/en/",
    snapshot: { asOfDate: date, currency: "EUR", closePrice: 53.44, dayChangePct: 0.5, monthReturnPct: -5.2, ytdReturnPct: -8.1, oneYearReturnPct: 3.8, isDelayed: true }
  })
];

export const benchmarkSeed = {
  slug: "sp500",
  symbol: "^GSPC",
  name: "S&P 500",
  sourceProvider: "demo-seed",
  snapshot: { asOfDate: date, closeValue: 5240.1, monthReturnPct: 1.5, ytdReturnPct: 3.4, oneYearReturnPct: 14.1 }
};

export const basketSeed = {
  slug: "halo-esg",
  name: "HALO ESG Index",
  description: "A practical, research-focused basket of heavy-asset, lower-obsolescence companies filtered through a responsible-investing lens."
};

export const newsletterArchiveSeed = [
  {
    slug: "march-2026-halo-esg-review",
    title: "March 2026 HALO ESG Review",
    publishedAt: "2026-03-20T00:00:00.000Z",
    preheader: "A calmer look at how the basket evolved over the last month.",
    htmlBody:
      "<p>March was a constructive month for the basket, with strength in energy efficiency and selected European utilities offsetting softer performance in offshore wind. The main story remained one of gradual progress rather than abrupt change.</p><p>From a medium-term perspective, the more interesting developments were still tied to capital deployment, infrastructure resilience, and the pace of transition across utilities and water-related businesses.</p>",
    textBody:
      "March was a constructive month for the basket, with strength in energy efficiency and selected European utilities offsetting softer performance in offshore wind. The main story remained one of gradual progress rather than abrupt change.\n\nFrom a medium-term perspective, the more interesting developments were still tied to capital deployment, infrastructure resilience, and the pace of transition across utilities and water-related businesses."
  }
];

export const resourceGuidesSeed = [
  {
    slug: "how-to-invest-in-esg-on-tradingview",
    title: "How to Research ESG Investing with TradingView",
    summary: "A practical guide to using charting and watchlists without turning your process into short-term noise.",
    platform: "TradingView",
    disclosure: "This page may contain affiliate links. If you use them, Responsible Wealth may earn a commission at no extra cost to you.",
    sections: [
      "Start by creating a clean watchlist focused on the HALO ESG companies you actually want to follow over time.",
      "Use weekly and monthly views by default so your research stays aligned with a calmer, medium-term process.",
      "Treat third-party tools as research aids rather than signals or recommendations."
    ],
    link: "https://www.tradingview.com/"
  }
];
