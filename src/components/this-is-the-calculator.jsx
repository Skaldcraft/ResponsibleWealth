"use client";

import { useMemo, useState } from "react";

const SCORE_KEYS = [
  "assetDurability",
  "esgAlignment",
  "revenuePredictability",
  "obsolescenceRisk",
  "sectorRelevance"
];

const SCORE_LABELS = {
  assetDurability: "Asset durability",
  esgAlignment: "ESG alignment",
  revenuePredictability: "Revenue predictability",
  obsolescenceRisk: "Low obsolescence",
  sectorRelevance: "Sector relevance"
};

const SCORE_DESCRIPTIONS = {
  assetDurability: "How physical, tangible, and long-lived are the company's core assets.",
  esgAlignment: "How well the company aligns with the HALO ESG framework currently used on the site.",
  revenuePredictability: "How stable and visible the revenue profile appears over medium-term windows.",
  obsolescenceRisk: "How unlikely the business model is to become obsolete quickly.",
  sectorRelevance: "How central the company is to durable infrastructure and essential real-world demand."
};

const C = {
  green: "#3B6D11",
  greenLt: "#EAF3DE",
  blue: "#378ADD",
  blueLt: "#E3F0FF",
  navy: "#1A3550",
  text: "var(--rw-text, #1a2030)",
  muted: "var(--rw-text-muted, #5a6070)",
  faint: "var(--rw-text-faint, #8a9099)",
  bg: "var(--rw-bg, #ffffff)",
  bgSec: "var(--rw-bg-secondary, #f5f5f2)",
  border: "var(--rw-border, #e0e0da)",
  red: "#c0392b",
  amber: "#c47a00"
};

const PLACEHOLDER_COMPANIES = [
  {
    ticker: "NEE",
    name: "NextEra Energy",
    sector: "Renewable Utilities",
    fitLabel: "Core",
    esgCategoryLabel: "ESG: Green",
    currency: "USD",
    price: 61.42,
    changePercent1D: 0.8,
    isDelayed: true,
    perf: { "1M": 2.4, "YTD": 3.8, "1Y": 9.6 },
    scores: {
      assetDurability: 9,
      esgAlignment: 9,
      revenuePredictability: 8,
      obsolescenceRisk: 9,
      sectorRelevance: 10
    },
    thesisShort: "A core HALO utility with heavy infrastructure and a visible transition path.",
    thesis:
      "NextEra combines regulated utility assets with large renewable development capacity, giving a durable medium-term fit in the index.",
    keyRisks: "Execution risk on large projects and interest-rate sensitivity.",
    watchpoints: [
      "Renewable capacity additions",
      "Project financing conditions",
      "Grid policy support"
    ],
    notInstead: [
      {
        ticker: "ENPH",
        name: "Enphase Energy",
        lifecycleLabel: "Candidate",
        why: "Higher hardware-cycle exposure and less direct heavy-asset infrastructure fit than NEE."
      },
      {
        ticker: "FSLR",
        name: "First Solar",
        lifecycleLabel: "Under review",
        why: "Manufacturing profile is stronger on technology risk and weaker on long-lived regulated assets."
      }
    ]
  },
  {
    ticker: "AWK",
    name: "American Water Works",
    sector: "Water Infrastructure",
    fitLabel: "Core",
    esgCategoryLabel: "ESG: Green",
    currency: "USD",
    price: 122.88,
    changePercent1D: 0.5,
    isDelayed: true,
    perf: { "1M": 2.0, "YTD": 3.0, "1Y": 8.5 },
    scores: {
      assetDurability: 10,
      esgAlignment: 9,
      revenuePredictability: 10,
      obsolescenceRisk: 10,
      sectorRelevance: 10
    },
    thesisShort: "Core water infrastructure exposure with obvious real-world utility.",
    thesis:
      "Water networks are hard to replace, essential, and long-lived, making AWK one of the clearest HALO-style businesses in the index.",
    keyRisks: "Regulatory outcomes and affordability pressures.",
    watchpoints: [
      "Rate-case outcomes",
      "Infrastructure capex cadence",
      "Water quality and resilience programs"
    ],
    notInstead: [
      {
        ticker: "MSEX",
        name: "Middlesex Water",
        lifecycleLabel: "Candidate",
        why: "Comparable profile but smaller scale and lower diversification than AWK."
      },
      {
        ticker: "YORW",
        name: "York Water",
        lifecycleLabel: "Removed",
        why: "Very similar thesis but much smaller and less liquid for index inclusion."
      }
    ]
  },
  {
    ticker: "UNP",
    name: "Union Pacific",
    sector: "Rail Infrastructure",
    fitLabel: "Core",
    esgCategoryLabel: "ESG: Green",
    currency: "USD",
    price: 239.88,
    changePercent1D: -0.1,
    isDelayed: true,
    perf: { "1M": 1.6, "YTD": 2.8, "1Y": 7.8 },
    scores: {
      assetDurability: 10,
      esgAlignment: 7,
      revenuePredictability: 8,
      obsolescenceRisk: 10,
      sectorRelevance: 8
    },
    thesisShort: "A classic rail-infrastructure holding with high asset durability.",
    thesis:
      "Union Pacific fits the framework through long-lived rail networks and lower short-term obsolescence risk.",
    keyRisks: "Freight volume cyclicality and operational execution.",
    watchpoints: [
      "Freight volume trends",
      "Network productivity",
      "Pricing vs service balance"
    ],
    notInstead: [
      {
        ticker: "NSC",
        name: "Norfolk Southern",
        lifecycleLabel: "Under review",
        why: "Similar rail thesis but currently less preferred in the basket composition."
      },
      {
        ticker: "CSX",
        name: "CSX",
        lifecycleLabel: "Candidate",
        why: "Comparable exposure but weaker current fit on risk/consistency dimensions."
      }
    ]
  },
  {
    ticker: "TT",
    name: "Trane Technologies",
    sector: "Energy Efficiency",
    fitLabel: "Watch",
    esgCategoryLabel: "ESG: Green",
    currency: "USD",
    price: 286.2,
    changePercent1D: 1.0,
    isDelayed: true,
    perf: { "1M": 5.2, "YTD": 7.7, "1Y": 17.5 },
    scores: {
      assetDurability: 7,
      esgAlignment: 9,
      revenuePredictability: 7,
      obsolescenceRisk: 7,
      sectorRelevance: 9
    },
    thesisShort: "Efficiency-focused industrial exposure with durable demand drivers.",
    thesis:
      "Trane adds a practical building-efficiency angle to the index, with demand tied to long-lived systems and retrofit cycles.",
    keyRisks: "Industrial cyclicality and valuation sensitivity.",
    watchpoints: [
      "HVAC demand",
      "Retrofit adoption trends",
      "Margin resilience"
    ],
    notInstead: [
      {
        ticker: "CARR",
        name: "Carrier Global",
        lifecycleLabel: "Candidate",
        why: "Similar theme but currently less preferred on consistency and profile clarity."
      }
    ]
  }
];

function polarPoint(cx, cy, radius, angle) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

function percentText(value) {
  if (value == null) return "--";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function fitTone(label) {
  if (label === "Core") return { bg: "#EAF3DE", color: "#27500A", border: "#97C459" };
  if (label === "Watch") return { bg: "#FEF3D7", color: "#7a4800", border: "#E4A020" };
  return { bg: "#FDEAEA", color: "#7a1a1a", border: "#E24B4A" };
}

function HaloFitBadge({ label }) {
  const tone = fitTone(label);
  return (
    <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: tone.bg, color: tone.color, border: `1px solid ${tone.border}` }}>
      {label}
    </span>
  );
}

function PerfCell({ value }) {
  if (value == null) return <span style={{ fontSize: 13, color: C.faint }}>--</span>;
  return <span style={{ fontSize: 13, fontWeight: 500, color: value >= 0 ? C.green : C.red }}>{percentText(value)}</span>;
}

function ScoreBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: C.bgSec, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${(value / 10) * 100}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: C.text, minWidth: 20, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function DataSourceNote({ companies, ticker1, ticker2 }) {
  const first = companies.find((company) => company.ticker === ticker1);
  const second = companies.find((company) => company.ticker === ticker2);
  if (!first?.isDelayed && !second?.isDelayed) return null;

  return (
    <p style={{ fontSize: 11, color: C.amber, marginTop: 6, lineHeight: 1.5 }}>
      Placeholder market data may be delayed. Use this comparison as a simulation until live mapping is reconnected.
    </p>
  );
}

function RadarChart({ co1, co2 }) {
  const size = 340;
  const center = size / 2;
  const radius = 108;
  const angles = SCORE_KEYS.map((_, index) => (Math.PI * 2 * index) / SCORE_KEYS.length - Math.PI / 2);

  const polygon = (level) =>
    angles
      .map((angle) => {
        const point = polarPoint(center, center, (level / 10) * radius, angle);
        return `${point.x},${point.y}`;
      })
      .join(" ");

  const companyPolygon = (company) =>
    angles
      .map((angle, index) => {
        const point = polarPoint(center, center, (company.scores[SCORE_KEYS[index]] / 10) * radius, angle);
        return `${point.x},${point.y}`;
      })
      .join(" ");

  return (
    <svg aria-label="HALO side-by-side score chart" role="img" viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "auto", maxWidth: 340 }}>
      {[2, 4, 6, 8, 10].map((level) => (
        <polygon key={level} fill="none" points={polygon(level)} stroke="rgba(90,96,112,0.18)" strokeWidth="1" />
      ))}
      {angles.map((angle, index) => {
        const axisPoint = polarPoint(center, center, radius, angle);
        const labelPoint = polarPoint(center, center, radius + 24, angle);
        const anchor = labelPoint.x > center + 20 ? "start" : labelPoint.x < center - 20 ? "end" : "middle";

        return (
          <g key={SCORE_KEYS[index]}>
            <line x1={center} x2={axisPoint.x} y1={center} y2={axisPoint.y} stroke="rgba(90,96,112,0.18)" strokeWidth="1" />
            <text fill={C.muted} fontSize="10" textAnchor={anchor} x={labelPoint.x} y={labelPoint.y}>
              {SCORE_LABELS[SCORE_KEYS[index]]}
            </text>
          </g>
        );
      })}
      <polygon fill="rgba(59,109,17,0.12)" points={companyPolygon(co1)} stroke={C.green} strokeWidth="2" />
      <polygon fill="rgba(55,138,221,0.09)" points={companyPolygon(co2)} stroke={C.blue} strokeWidth="2" />
      {SCORE_KEYS.map((key, index) => {
        const point1 = polarPoint(center, center, (co1.scores[key] / 10) * radius, angles[index]);
        const point2 = polarPoint(center, center, (co2.scores[key] / 10) * radius, angles[index]);

        return (
          <g key={key}>
            <circle cx={point1.x} cy={point1.y} fill={C.green} r="4" />
            <circle cx={point2.x} cy={point2.y} fill={C.blue} r="4" />
          </g>
        );
      })}
    </svg>
  );
}

function CompanySelector({ companies, exclude, label, onChange, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted }}>{label}</label>
      <select
        onChange={(event) => onChange(event.target.value)}
        style={{ padding: "9px 14px", fontSize: 15, fontWeight: 500, border: `1.5px solid ${C.green}`, borderRadius: 8, background: C.bg, color: C.text, cursor: "pointer", fontFamily: "inherit", outline: "none", minWidth: 220 }}
        value={value}
      >
        {companies.filter((company) => company.ticker !== exclude).map((company) => (
          <option key={company.ticker} value={company.ticker}>
            {company.ticker} -- {company.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function OverviewTab({ co1, co2 }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)", gap: 20, alignItems: "center", marginBottom: 20 }}>
        <div style={{ justifySelf: "center", width: "100%" }}>
          <RadarChart co1={co1} co2={co2} />
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {[co1, co2].map((company, index) => (
            <div key={company.ticker} style={{ padding: "14px 16px", background: index === 0 ? "rgba(59,109,17,0.05)" : "rgba(55,138,221,0.06)", borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <strong style={{ color: index === 0 ? C.green : C.blue }}>{company.ticker}</strong>
                <HaloFitBadge label={company.fitLabel} />
                <span style={{ fontSize: 12, color: C.muted }}>{company.sector}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{company.thesisShort}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {SCORE_KEYS.map((key) => {
          const score1 = co1.scores[key];
          const score2 = co2.scores[key];
          const leader = score1 === score2 ? null : score1 > score2 ? co1.ticker : co2.ticker;

          return (
            <div key={key} style={{ padding: "10px 12px", background: C.bgSec, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.muted, flex: 1 }}>{SCORE_LABELS[key]}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.green }}>{score1}</span>
              <span style={{ fontSize: 10, color: C.faint }}>vs</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.blue }}>{score2}</span>
              {leader ? (
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: leader === co1.ticker ? C.greenLt : C.blueLt, color: leader === co1.ticker ? "#27500A" : "#0C447C", fontWeight: 500 }}>
                  {leader}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoresTab({ co1, co2 }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: "1rem" }}>
        This is a standalone simulation mode. Score explanations remain interactive while server data wiring is being stabilized.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[co1, co2].map((company, companyIndex) => (
          <div key={company.ticker}>
            <div style={{ fontSize: 12, fontWeight: 500, color: companyIndex === 0 ? C.green : C.blue, marginBottom: 10 }}>{company.ticker}</div>
            {SCORE_KEYS.map((key) => (
              <div
                key={key}
                onMouseEnter={() => companyIndex === 0 && setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                style={{ marginBottom: 10, position: "relative" }}
              >
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, cursor: companyIndex === 0 ? "help" : "default" }}>
                  {SCORE_LABELS[key]}{companyIndex === 0 && hovered === key ? " i" : ""}
                </div>
                <ScoreBar color={companyIndex === 0 ? C.green : C.blue} value={company.scores[key]} />
                {companyIndex === 0 && hovered === key ? (
                  <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: 0, background: C.navy, color: "#e8e8e4", fontSize: 12, lineHeight: 1.5, padding: "8px 12px", borderRadius: 6, width: 220, zIndex: 10, pointerEvents: "none" }}>
                    <strong style={{ display: "block", marginBottom: 3, color: "#fff" }}>{SCORE_LABELS[key]}</strong>
                    {SCORE_DESCRIPTIONS[key]}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceTab({ co1, co2 }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: "1rem", maxWidth: 640 }}>
        Performance is context, not signal. This simulated dataset keeps 1M, YTD, and 1Y windows so the interaction behaves like the final production experience.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 0", color: C.muted, fontWeight: 400, fontSize: 11 }}>Window</th>
            <th style={{ textAlign: "right", padding: "8px 12px", color: C.green, fontWeight: 500, fontSize: 13 }}>{co1.ticker}</th>
            <th style={{ textAlign: "right", padding: "8px 0", color: C.blue, fontWeight: 500, fontSize: 13 }}>{co2.ticker}</th>
            <th style={{ textAlign: "right", padding: "8px 0 8px 12px", color: C.muted, fontWeight: 400, fontSize: 11 }}>Diff</th>
          </tr>
        </thead>
        <tbody>
          {["1M", "YTD", "1Y"].map((windowLabel) => {
            const first = co1.perf?.[windowLabel];
            const second = co2.perf?.[windowLabel];
            const diff = first != null && second != null ? first - second : null;

            return (
              <tr key={windowLabel} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 0", color: C.muted, fontSize: 13 }}>{windowLabel}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}><PerfCell value={first} /></td>
                <td style={{ padding: "10px 0", textAlign: "right" }}><PerfCell value={second} /></td>
                <td style={{ padding: "10px 0 10px 12px", textAlign: "right", fontSize: 13, color: C.faint }}>{diff == null ? "--" : percentText(diff)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ThesisTab({ co1, co2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {[co1, co2].map((company, index) => (
        <div key={company.ticker}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${index === 0 ? C.green : C.blue}` }}>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: index === 0 ? C.green : C.blue }}>{company.ticker}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{company.name}</span>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: C.faint, marginBottom: 6 }}>Why it is in the index</div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, margin: 0 }}>{company.thesis}</p>
          </div>
          <div style={{ padding: "10px 12px", background: "#FEF3D7", borderRadius: 8, borderLeft: "3px solid #E4A020", marginBottom: 12 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#7a4800", marginBottom: 5 }}>Key risks</div>
            <p style={{ fontSize: 13, color: "#5a3800", lineHeight: 1.65, margin: 0 }}>{company.keyRisks}</p>
          </div>
          <div style={{ padding: "10px 12px", background: C.bgSec, borderRadius: 8 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: C.faint, marginBottom: 5 }}>Watchpoints</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
              {company.watchpoints.length ? company.watchpoints.map((item) => <li key={item}>{item}</li>) : <li>No watchpoints are documented yet.</li>}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExcludedTab({ co1, co2 }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
        {[co1, co2].map((company, index) => (
          <div key={company.ticker}>
            <div style={{ fontSize: 12, fontWeight: 500, color: index === 0 ? C.green : C.blue, marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${index === 0 ? C.green : C.blue}` }}>
              {company.ticker} -- similar names currently excluded
            </div>
            {company.notInstead.length ? company.notInstead.map((peer) => (
              <div key={peer.ticker} style={{ padding: "10px 12px", background: C.bgSec, borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "monospace", color: C.text }}>{peer.ticker}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>-- {peer.name}</span>
                  <span style={{ fontSize: 10, color: C.faint }}>{peer.lifecycleLabel}</span>
                </div>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0 }}>{peer.why}</p>
              </div>
            )) : <p style={{ fontSize: 13, color: C.faint }}>No excluded peers configured for this placeholder company.</p>}
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 14px", background: C.bgSec, borderRadius: 8, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
        <strong style={{ color: C.text, fontWeight: 500 }}>Why this matters:</strong> Excluded alternatives make the method auditable by showing what was not chosen and why.
      </div>
    </div>
  );
}

export default function ThisIsTheCalculator({ companies = PLACEHOLDER_COMPANIES }) {
  const safeCompanies = useMemo(() => (companies && companies.length >= 2 ? companies : PLACEHOLDER_COMPANIES), [companies]);
  const [ticker1, setTicker1] = useState(safeCompanies[0]?.ticker ?? "");
  const [ticker2, setTicker2] = useState(safeCompanies[1]?.ticker ?? safeCompanies[0]?.ticker ?? "");
  const [activeTab, setActiveTab] = useState("overview");

  const co1 = safeCompanies.find((company) => company.ticker === ticker1) ?? safeCompanies[0];
  const co2 =
    safeCompanies.find((company) => company.ticker === ticker2 && company.ticker !== co1?.ticker) ??
    safeCompanies.find((company) => company.ticker !== co1?.ticker) ??
    safeCompanies[1] ??
    safeCompanies[0];

  const handleTicker1 = (value) => {
    setTicker1(value);
    if (value === ticker2) {
      const next = safeCompanies.find((company) => company.ticker !== value);
      if (next) setTicker2(next.ticker);
    }
  };

  const handleTicker2 = (value) => {
    setTicker2(value);
    if (value === ticker1) {
      const next = safeCompanies.find((company) => company.ticker !== value);
      if (next) setTicker1(next.ticker);
    }
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "scores", label: "HALO scores" },
    { key: "performance", label: "Performance" },
    { key: "thesis", label: "Investment thesis" },
    { key: "excluded", label: "Why not instead?" }
  ];

  const tabStyle = (key) => ({
    padding: "8px 16px",
    fontSize: 13,
    border: "none",
    borderBottom: activeTab === key ? `2px solid ${C.green}` : "2px solid transparent",
    background: "transparent",
    color: activeTab === key ? C.green : C.muted,
    cursor: "pointer",
    fontWeight: activeTab === key ? 500 : 400,
    transition: "all 0.15s",
    fontFamily: "inherit",
    whiteSpace: "nowrap"
  });

  if (!co1 || !co2) {
    return <div style={{ padding: "2rem 1rem", color: C.muted, fontSize: 14 }}>Add at least two companies to use the side-by-side analysis.</div>;
  }

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: "1.5rem 0", fontFamily: "inherit" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 6 }}>Compare HALO ESG index companies</h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 760 }}>
          Side-by-side analysis including HALO scores, investment thesis, performance context, and companies that are similar but excluded -- and why.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: "1.5rem", padding: "1.25rem", background: C.bgSec, borderRadius: 10 }}>
        <CompanySelector companies={safeCompanies} exclude={co2.ticker} label="Company A" onChange={handleTicker1} value={co1.ticker} />
        <button onClick={() => { setTicker1(co2.ticker); setTicker2(co1.ticker); }} style={{ padding: "9px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.muted, cursor: "pointer", fontSize: 14, marginBottom: 2, fontFamily: "inherit" }} title="Swap companies" type="button">
          Swap
        </button>
        <CompanySelector companies={safeCompanies} exclude={co1.ticker} label="Company B" onChange={handleTicker2} value={co2.ticker} />
        <DataSourceNote companies={safeCompanies} ticker1={co1.ticker} ticker2={co2.ticker} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", marginBottom: "1.5rem", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {[co1, co2].map((company, index) => (
          <div key={company.ticker} style={{ padding: "12px 16px", background: index === 0 ? "rgba(59,109,17,0.04)" : "rgba(55,138,221,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "monospace", background: index === 0 ? C.greenLt : C.blueLt, color: index === 0 ? "#27500A" : "#0C447C", padding: "2px 6px", borderRadius: 4 }}>{company.ticker}</span>
              <HaloFitBadge label={company.fitLabel} />
              <span style={{ fontSize: 11, color: C.faint }}>{company.esgCategoryLabel}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 2 }}>{company.name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{company.sector}</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 3 }}>
              {company.currency} {company.price.toFixed(2)}
              <span style={{ marginLeft: 6, color: company.changePercent1D >= 0 ? C.green : C.red }}>{percentText(company.changePercent1D)} today</span>
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              {["1M", "YTD", "1Y"].map((windowLabel) => (
                <div key={windowLabel}>
                  <div style={{ fontSize: 10, color: C.faint, marginBottom: 2 }}>{windowLabel}</div>
                  <PerfCell value={company.perf?.[windowLabel]} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px", background: C.bg }}>
          <span style={{ fontSize: 11, color: C.faint, fontWeight: 500 }}>VS</span>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: "1.5rem", overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button aria-pressed={activeTab === tab.key} key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabStyle(tab.key)} type="button">
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? <OverviewTab co1={co1} co2={co2} /> : null}
      {activeTab === "scores" ? <ScoresTab co1={co1} co2={co2} /> : null}
      {activeTab === "performance" ? <PerformanceTab co1={co1} co2={co2} /> : null}
      {activeTab === "thesis" ? <ThesisTab co1={co1} co2={co2} /> : null}
      {activeTab === "excluded" ? <ExcludedTab co1={co1} co2={co2} /> : null}

      <p style={{ fontSize: 11, color: C.faint, lineHeight: 1.7, borderTop: `1px solid ${C.border}`, paddingTop: "1rem", marginTop: "2rem" }}>
        Simulation mode enabled: this standalone calculator uses local placeholder data to keep all interactions and tabs fully functional.
      </p>
    </div>
  );
}
