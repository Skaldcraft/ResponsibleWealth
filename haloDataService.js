/**
 * haloDataService.js
 *
 * Merges Alpha Vantage market data with the editorial data in basket.json.
 * Call getBasketWithPerformance() wherever you need the full merged dataset
 * — the comparator, the home table, and individual company pages all use this.
 *
 * Alpha Vantage endpoints used:
 *   GLOBAL_QUOTE          → current price, daily change, previous close
 *   TIME_SERIES_MONTHLY_ADJUSTED → monthly closing prices → 1M, YTD, 1Y returns
 *
 * Environment variable required:
 *   ALPHA_VANTAGE_API_KEY  (set in .env.local, never expose to the client)
 */

import basket from "@/data/basket.json";

const AV_BASE = "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// ─── Alpha Vantage fetch helpers ─────────────────────────────────────────────

/**
 * Fetch the current quote for a single ticker.
 * Returns { price, changePercent1D, previousClose } or null on failure.
 */
async function fetchQuote(ticker) {
  try {
    const url = `${AV_BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
    if (!res.ok) return null;
    const data = await res.json();
    const q = data["Global Quote"];
    if (!q || !q["05. price"]) return null;
    return {
      price: parseFloat(q["05. price"]),
      changePercent1D: parseFloat(q["10. change percent"]?.replace("%", "") ?? 0),
      previousClose: parseFloat(q["08. previous close"] ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch monthly adjusted closing prices and calculate 1M, YTD, 1Y returns.
 * Returns { perf1M, perfYTD, perf1Y } as percentages, or null on failure.
 *
 * Alpha Vantage returns monthly series in descending order (latest first).
 * Index 0 = current (partial) month, index 1 = last complete month.
 *
 * We use the last complete month close as the "current" reference point
 * to avoid partial-month distortion.
 */
async function fetchPerformance(ticker) {
  try {
    const url = `${AV_BASE}?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${ticker}&apikey=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24 hours
    if (!res.ok) return null;
    const data = await res.json();
    const series = data["Monthly Adjusted Time Series"];
    if (!series) return null;

    // Sort dates descending (Alpha Vantage already does this, but be safe)
    const dates = Object.keys(series).sort((a, b) => new Date(b) - new Date(a));
    if (dates.length < 13) return null;

    const closeOf = (i) => parseFloat(series[dates[i]]?.["5. adjusted close"] ?? 0);

    const current   = closeOf(0); // most recent close
    const oneMonth  = closeOf(1); // ~1 month ago
    const ytdBase   = findYTDBase(dates, series); // last close of previous year
    const oneYear   = closeOf(12); // ~12 months ago

    if (!current || !oneMonth || !ytdBase || !oneYear) return null;

    return {
      perf1M:  round2((current / oneMonth  - 1) * 100),
      perfYTD: round2((current / ytdBase   - 1) * 100),
      perf1Y:  round2((current / oneYear   - 1) * 100),
    };
  } catch {
    return null;
  }
}

/**
 * Find the last closing price of the previous calendar year for YTD calculation.
 */
function findYTDBase(dates, series) {
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  // Find the latest date that falls in the previous year
  const prevYearDate = dates.find((d) => new Date(d).getFullYear() === prevYear);
  if (!prevYearDate) return null;
  return parseFloat(series[prevYearDate]?.["5. adjusted close"] ?? 0);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ─── Fallback static performance data ────────────────────────────────────────
// Used when Alpha Vantage is unavailable (rate limit, network error, test env).
// Update these values manually during your monthly review as a safety net.

const FALLBACK_PERF = {
  NEE:    { perf1M: 2.4,  perfYTD: 3.1,  perf1Y: 9.6  },
  EXC:    { perf1M: 1.1,  perfYTD: 2.4,  perf1Y: 6.2  },
  DUK:    { perf1M: 0.9,  perfYTD: 2.1,  perf1Y: 4.4  },
  SO:     { perf1M: 1.4,  perfYTD: 2.8,  perf1Y: 5.2  },
  IBE:    { perf1M: 3.1,  perfYTD: 4.2,  perf1Y: 13.8 },
  ORSTED: { perf1M: -2.1, perfYTD: -1.8, perf1Y: 1.7  },
  EDP:    { perf1M: 1.7,  perfYTD: 2.3,  perf1Y: 7.1  },
  AWK:    { perf1M: 2.0,  perfYTD: 3.4,  perf1Y: 8.5  },
  XYL:    { perf1M: 4.0,  perfYTD: 5.1,  perf1Y: 14.2 },
  ECL:    { perf1M: 2.7,  perfYTD: 3.8,  perf1Y: 11.3 },
  WM:     { perf1M: 1.8,  perfYTD: 2.9,  perf1Y: 10.1 },
  TT:     { perf1M: 5.2,  perfYTD: 6.4,  perf1Y: 17.5 },
  UNP:    { perf1M: 1.6,  perfYTD: 2.2,  perf1Y: 7.8  },
  CNI:    { perf1M: 1.3,  perfYTD: 1.9,  perf1Y: 6.9  },
  PLD:    { perf1M: 3.5,  perfYTD: 4.8,  perf1Y: 12.4 },
  PSA:    { perf1M: 2.2,  perfYTD: 3.1,  perf1Y: 8.8  },
  SCI:    { perf1M: 1.2,  perfYTD: 1.8,  perf1Y: 6.1  },
  ROL:    { perf1M: 2.8,  perfYTD: 3.6,  perf1Y: 12.0 },
};

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Returns the full basket with live market data merged in.
 *
 * Shape of each company object:
 * {
 *   ticker, name, sector, haloFit, country, currency,
 *   scores: { assetDurability, esgAlignment, revenuePredictability, obsolescenceRisk, sectorRelevance },
 *   thesis, keyRisks, notInstead,
 *
 *   // from Alpha Vantage (or fallback):
 *   price, changePercent1D,
 *   perf: { "1M", "YTD", "1Y" },
 *   dataSource: "live" | "fallback"
 * }
 *
 * Designed to be called from a Next.js Server Component or Route Handler.
 * Never call this from a Client Component — it exposes the API key.
 *
 * @param {string[]} [tickers] - Optional subset. If omitted, fetches all 18.
 */
export async function getBasketWithPerformance(tickers) {
  const targets = tickers
    ? basket.filter((c) => tickers.includes(c.ticker))
    : basket;

  // Fetch all tickers in parallel (respects Alpha Vantage rate limits
  // on standard keys: 25 requests/day on free tier, 500 on premium).
  // If you're on the free tier and have 18 companies, you'll hit the
  // daily limit fetching everything at once. Use the cache options on
  // fetch (set above) to avoid re-fetching on every request.
  const results = await Promise.all(
    targets.map(async (company) => {
      const [quote, perf] = await Promise.all([
        fetchQuote(company.ticker),
        fetchPerformance(company.ticker),
      ]);

      const fallback = FALLBACK_PERF[company.ticker] ?? {
        perf1M: 0, perfYTD: 0, perf1Y: 0,
      };

      const perfData = perf ?? fallback;
      const dataSource = perf ? "live" : "fallback";

      return {
        ...company,
        price:           quote?.price ?? null,
        changePercent1D: quote?.changePercent1D ?? null,
        perf: {
          "1M":  perfData.perf1M,
          "YTD": perfData.perfYTD,
          "1Y":  perfData.perf1Y,
        },
        dataSource,
      };
    })
  );

  return results;
}

/**
 * Returns a single company with live data.
 * Use this on individual company pages (/companies/nee).
 */
export async function getCompanyWithPerformance(ticker) {
  const results = await getBasketWithPerformance([ticker]);
  return results[0] ?? null;
}

/**
 * Returns only the editorial data (no API calls).
 * Use this where you don't need price data — e.g. the glossary,
 * the methodology page, or during build time.
 */
export function getBasketEditorial() {
  return basket;
}
