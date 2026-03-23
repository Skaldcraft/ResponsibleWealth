"use client";

import { useState, useEffect, useRef } from "react";

// ─── Inline data (paste halo-comparator-data.js content here in production,
//     or import from a separate file) ─────────────────────────────────────────

const COMPANIES = [
  { ticker:"NEE", name:"NextEra Energy", sector:"Renewable Utilities", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:9,revenuePredictability:8,obsolescenceRisk:9,sectorRelevance:10},
    perf:{"1M":2.4,"YTD":3.1,"1Y":9.6},
    thesis:"The largest US renewable energy company by capacity. Combines a regulated Florida utility (FPL) providing stable cash flows with one of the world's largest wind and solar development platforms. The regulated base offsets development risk. Grid infrastructure is heavy, essential, and irreplaceable on any reasonable horizon.",
    keyRisks:"Interest rate sensitivity — renewable development relies heavily on financing. Regulatory changes in Florida could affect the utility subsidiary. Project cancellations in the development arm.",
    notInstead:[{ticker:"ENPH",name:"Enphase Energy",why:"Microinverter manufacturer — technology hardware, not infrastructure. High obsolescence risk as technology evolves."},{ticker:"FSLR",name:"First Solar",why:"Solar panel manufacturer with supply chain and technology disruption risk. Manufacturing assets depreciate faster than grid infrastructure."}]},
  { ticker:"EXC", name:"Exelon", sector:"Regulated Utilities", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:7,revenuePredictability:10,obsolescenceRisk:9,sectorRelevance:8},
    perf:{"1M":1.1,"YTD":2.4,"1Y":6.2},
    thesis:"Pure-play regulated electric and gas utility — the clearest example of the HALO model. Serves 10 million customers across 6 states through subsidiaries including ComEd and PECO. Revenue is guaranteed by state regulators. Assets are physical transmission and distribution networks with 50–100 year lifespans.",
    keyRisks:"Rate case outcomes depend on state regulators. Grid modernization requires sustained capital investment. Climate-related extreme weather increasing operational costs.",
    notInstead:[{ticker:"AES",name:"AES Corporation",why:"Significant international exposure with higher political and currency risk. Less purely regulated than Exelon."},{ticker:"PPL",name:"PPL Corporation",why:"Similar regulated utility profile but smaller scale and historically higher UK exposure."}]},
  { ticker:"DUK", name:"Duke Energy", sector:"Utilities", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:7,revenuePredictability:9,obsolescenceRisk:9,sectorRelevance:8},
    perf:{"1M":0.9,"YTD":2.1,"1Y":4.4},
    thesis:"One of the largest US electric utilities, serving 8 million customers across the Carolinas, Florida, Indiana, Ohio, and Kentucky. The Southeast focus gives exposure to strong population growth. Ongoing coal retirement and renewable transition supported by long-term capital plans.",
    keyRisks:"Legacy coal assets create stranded asset risk. The Carolinas regulatory environment has been contentious. Capital-intensive clean energy transition requires consistent access to capital markets.",
    notInstead:[{ticker:"ETR",name:"Entergy",why:"Similar Southeast utility but with nuclear fleet complexity and a weaker regulatory track record."},{ticker:"D",name:"Dominion Energy",why:"Underwent major strategic restructuring creating uncertainty that conflicts with HALO's predictability criterion."}]},
  { ticker:"SO", name:"Southern Company", sector:"Utilities", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:7,revenuePredictability:9,obsolescenceRisk:9,sectorRelevance:8},
    perf:{"1M":1.4,"YTD":2.8,"1Y":5.2},
    thesis:"Regulated utility serving Georgia, Alabama, and Mississippi. Completion of Vogtle Units 3 and 4 — the first new US nuclear reactors in 30 years — adds zero-carbon baseload generation. The regulated Southeast market is growing due to population inflows and industrial expansion.",
    keyRisks:"Vogtle cost overruns created significant financial strain. Nuclear operations add operational complexity. Southeast states face increasing climate risk.",
    notInstead:[{ticker:"PNW",name:"Pinnacle West / APS",why:"Arizona utility with similar regulated profile but smaller scale and more contentious regulatory history."}]},
  { ticker:"IBE", name:"Iberdrola", sector:"Renewable Utilities", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:10,revenuePredictability:8,obsolescenceRisk:9,sectorRelevance:10},
    perf:{"1M":3.1,"YTD":4.2,"1Y":13.8},
    thesis:"One of the world's largest electric utilities with regulated grid and renewable assets across Spain, the UK, US (via Avangrid), Brazil, and Mexico. Consistently top-ranked for ESG quality. A benchmark for what a large utility transitioning to clean energy looks like.",
    keyRisks:"Multi-jurisdictional regulatory exposure. Currency risk from US/Brazil/UK operations. Political risk in some markets.",
    notInstead:[{ticker:"ENEL",name:"Enel",why:"Similar scale but significantly more emerging market exposure (Latin America, Africa) adding political and currency risk."},{ticker:"EDPR",name:"EDP parent",why:"The EDP Renovaveis subsidiary is in the basket for cleaner HALO exposure without the parent's complexity."}]},
  { ticker:"ORSTED", name:"Orsted", sector:"Offshore Wind", haloFit:"Watch",
    scores:{assetDurability:8,esgAlignment:10,revenuePredictability:5,obsolescenceRisk:7,sectorRelevance:10},
    perf:{"1M":-2.1,"YTD":-1.8,"1Y":1.7},
    thesis:"The global pioneer of offshore wind. Operating assets are durable and contracted under long-term power purchase agreements. Best-in-class ESG. The 'Watch' status reflects US project cancellations and rising capital costs that have pressured near-term profitability.",
    keyRisks:"Offshore wind development is capital-intensive and exposed to supply chain inflation. US project cancellations 2023-2024. Revenue predictability lower than regulated utilities. FX exposure.",
    notInstead:[{ticker:"VWSYF",name:"Vestas Wind Systems",why:"Wind turbine manufacturer — hardware with manufacturing risk, not infrastructure operator. Different HALO profile entirely."}]},
  { ticker:"EDP", name:"EDP Renovaveis", sector:"Renewables", haloFit:"Core",
    scores:{assetDurability:8,esgAlignment:9,revenuePredictability:7,obsolescenceRisk:8,sectorRelevance:9},
    perf:{"1M":1.7,"YTD":2.3,"1Y":7.1},
    thesis:"The renewable energy development arm of EDP Group with wind and solar operations across Europe, North America, and Brazil. Physical generating infrastructure with contracted revenues. Global diversification across mature renewable markets provides balance.",
    keyRisks:"Development pipeline depends on financing conditions. Some currency exposure from Brazil. Less regulated than grid-owning utilities.",
    notInstead:[{ticker:"BEP",name:"Brookfield Renewable",why:"Similar renewable operator but structured as a limited partnership — adds complexity. More acquisition-driven growth, less organic."}]},
  { ticker:"AWK", name:"American Water Works", sector:"Water Infrastructure", haloFit:"Core",
    scores:{assetDurability:10,esgAlignment:9,revenuePredictability:10,obsolescenceRisk:10,sectorRelevance:10},
    perf:{"1M":2.0,"YTD":3.4,"1Y":8.5},
    thesis:"The clearest HALO company in the basket. The largest US water and wastewater utility, serving 14 million people. Water pipes last 50–100 years. Demand is completely inelastic. Revenue is regulated. No technology can make water infrastructure obsolete. The US has a $1 trillion+ water infrastructure gap, meaning decades of regulated capital investment ahead.",
    keyRisks:"Valuation is premium due to scarcity of high-quality regulated water assets. Rate case decisions can be delayed. Drought conditions in some service areas.",
    notInstead:[{ticker:"MSEX",name:"Middlesex Water",why:"Similar profile but much smaller — less liquidity and less diversified geographic exposure."},{ticker:"YORW",name:"York Water",why:"Pure regulated water utility but tiny scale (Pennsylvania only). Same thesis, insufficient liquidity."}]},
  { ticker:"XYL", name:"Xylem", sector:"Water Technology", haloFit:"Core",
    scores:{assetDurability:7,esgAlignment:9,revenuePredictability:7,obsolescenceRisk:7,sectorRelevance:9},
    perf:{"1M":4.0,"YTD":5.1,"1Y":14.2},
    thesis:"Water technology and treatment solutions — pumps, sensors, treatment systems, smart meters. Demand driven by the global water infrastructure upgrade cycle. The 2023 merger with Evoqua Water Technologies deepened treatment capabilities. Serves utilities, municipalities, and industrial customers globally.",
    keyRisks:"More technology-exposed than pure infrastructure — product cycles create some obsolescence risk. Revenue is more cyclical than regulated utilities. Integration risk from the Evoqua merger.",
    notInstead:[{ticker:"ITRI",name:"Itron",why:"Smart meters and grid technology with overlapping customers, but broader utility focus dilutes the water-specific thesis."}]},
  { ticker:"ECL", name:"Ecolab", sector:"Water and Sustainability Solutions", haloFit:"Core",
    scores:{assetDurability:6,esgAlignment:8,revenuePredictability:8,obsolescenceRisk:8,sectorRelevance:8},
    perf:{"1M":2.7,"YTD":3.8,"1Y":11.3},
    thesis:"Water treatment, hygiene, and infection prevention for food, hospitality, healthcare, and industrial customers. Core water efficiency business helps industrial customers use dramatically less water. Long-term contracts and mission-critical services provide recurring revenue.",
    keyRisks:"More exposed to economic cycles than regulated utilities. Chemical input costs affect margins. Lower physical asset base than pure infrastructure.",
    notInstead:[{ticker:"VEOL",name:"Veolia",why:"French utility with broader water and waste management — stronger infrastructure but adds French regulatory and political risk."}]},
  { ticker:"WM", name:"Waste Management", sector:"Circular Economy", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:7,revenuePredictability:9,obsolescenceRisk:9,sectorRelevance:8},
    perf:{"1M":1.8,"YTD":2.9,"1Y":10.1},
    thesis:"The largest US waste and recycling company. Landfills are among the most durable physical assets — permitted, capital-intensive, impossible to replicate. Pricing power comes from limited permitted disposal capacity. Renewable natural gas from landfills adds an ESG dimension.",
    keyRisks:"Landfills have finite capacity. Recycling economics are volatile. Regulatory pressure on landfill emissions.",
    notInstead:[{ticker:"RSG",name:"Republic Services",why:"Very similar HALO fit — WM is larger with slightly better ESG metrics. Both are strong; the basket holds WM for scale."},{ticker:"CWST",name:"Casella Waste",why:"Similar model in the Northeast but much smaller scale."}]},
  { ticker:"TT", name:"Trane Technologies", sector:"Energy Efficiency", haloFit:"Core",
    scores:{assetDurability:7,esgAlignment:9,revenuePredictability:7,obsolescenceRisk:7,sectorRelevance:9},
    perf:{"1M":5.2,"YTD":6.4,"1Y":17.5},
    thesis:"HVAC and building climate systems. Buildings account for ~40% of global energy use; improving their efficiency is one of the most cost-effective climate interventions. Service contracts are recurring. The 'Gigaton Challenge' commitment (reduce customer carbon by 1 billion metric tons by 2030) is an unusually concrete ESG commitment.",
    keyRisks:"Construction cycle exposure. Heat pump adoption depends partly on policy incentives. Supply chain constraints in high-demand periods.",
    notInstead:[{ticker:"CARR",name:"Carrier Global",why:"Similar HVAC exposure but more diverse product mix (fire, security) and less focused ESG narrative."},{ticker:"JCI",name:"Johnson Controls",why:"Building controls and security — less concentrated on the energy efficiency/climate transition thesis."}]},
  { ticker:"UNP", name:"Union Pacific", sector:"Rail Infrastructure", haloFit:"Core",
    scores:{assetDurability:10,esgAlignment:7,revenuePredictability:8,obsolescenceRisk:10,sectorRelevance:8},
    perf:{"1M":1.6,"YTD":2.2,"1Y":7.8},
    thesis:"One of two major freight railroads serving the western US. Rail track is the most durable transportation infrastructure that exists. Rail moves freight at roughly 1/4 the carbon intensity of trucking. The duopoly nature of US Class I freight rail provides extraordinary pricing power. The physical network is irreplaceable.",
    keyRisks:"Volume sensitivity to economic cycles. Labor relations have been contentious. Competition from trucking on short-haul routes.",
    notInstead:[{ticker:"NSC",name:"Norfolk Southern",why:"Eastern US rail counterpart. Very similar HALO profile. CNI is in the basket for geographic diversification."},{ticker:"CSX",name:"CSX",why:"Eastern US intermodal and coal focus. Higher coal revenue exposure creates more ESG tension."}]},
  { ticker:"CNI", name:"Canadian National Railway", sector:"Rail Infrastructure", haloFit:"Core",
    scores:{assetDurability:10,esgAlignment:7,revenuePredictability:8,obsolescenceRisk:10,sectorRelevance:8},
    perf:{"1M":1.3,"YTD":1.9,"1Y":6.9},
    thesis:"The only railroad in North America connecting three coasts — Atlantic, Pacific, and Gulf of Mexico. This geographic uniqueness is CNI's most distinctive HALO characteristic. Grain, potash, intermodal, and forest products all depend on this physical network. Canadian Pacific/Kansas City is the only comparable.",
    keyRisks:"Canadian dollar currency risk for US investors. Exposure to grain and commodity volumes. Labor disruptions have affected Canadian rail.",
    notInstead:[{ticker:"CP",name:"Canadian Pacific Kansas City",why:"Strong competitor with different geographic footprint (north-south vs CNI's coast-to-coast). Complementary but less unique."}]},
  { ticker:"PLD", name:"Prologis", sector:"Sustainable Logistics REIT", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:8,revenuePredictability:8,obsolescenceRisk:8,sectorRelevance:9},
    perf:{"1M":3.5,"YTD":4.8,"1Y":12.4},
    thesis:"The world's largest industrial real estate company — logistics warehouses near major ports, airports, and population centers. Deploying solar on warehouse rooftops and EV charging at scale. Physical real estate in strategic constrained locations is the definition of heavy assets.",
    keyRisks:"Interest rate sensitivity. E-commerce growth moderation post-COVID. Oversupply risk in some logistics markets.",
    notInstead:[{ticker:"EGP",name:"EastGroup Properties",why:"Sunbelt-focused industrial REIT with similar logistics thesis but much smaller scale and less international diversification."}]},
  { ticker:"PSA", name:"Public Storage", sector:"Storage REIT", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:5,revenuePredictability:8,obsolescenceRisk:9,sectorRelevance:6},
    perf:{"1M":2.2,"YTD":3.1,"1Y":8.8},
    thesis:"The largest self-storage REIT in the US. Storage facilities are concrete boxes with minimal maintenance requirements and extremely long useful lives. Demand is recession-resistant. PSA is the lowest ESG-scored company in the basket but the HALO physical asset case is strong.",
    keyRisks:"Oversupply cycles have historically pressured self-storage economics. Limited ESG differentiation compared to other basket members.",
    notInstead:[{ticker:"EXR",name:"Extra Space Storage",why:"Very similar business — now the second-largest US self-storage REIT. PSA's scale and brand give it slight advantages but EXR is a near-equivalent."}]},
  { ticker:"SCI", name:"Service Corporation International", sector:"Essential Services", haloFit:"Core",
    scores:{assetDurability:9,esgAlignment:6,revenuePredictability:9,obsolescenceRisk:10,sectorRelevance:7},
    perf:{"1M":1.2,"YTD":1.8,"1Y":6.1},
    thesis:"The largest funeral and cemetery services company in the US. Physical assets (cemeteries are permanent by definition), completely essential and demand-inelastic services, and essentially zero obsolescence risk. No technology can make funeral services obsolete. 1,500+ funeral homes and 500+ cemeteries create geographic pricing power.",
    keyRisks:"Death rate is not perfectly predictable year to year. Cremation trend reduces revenue per service. Limited ESG narrative.",
    notInstead:[{ticker:"CSV",name:"Carriage Services",why:"Second-tier death care company with similar HALO fit but much smaller scale."}]},
  { ticker:"ROL", name:"Rollins", sector:"Essential Services", haloFit:"Core",
    scores:{assetDurability:6,esgAlignment:6,revenuePredictability:9,obsolescenceRisk:9,sectorRelevance:7},
    perf:{"1M":2.8,"YTD":3.6,"1Y":12.0},
    thesis:"The world's largest pest control company, operating Orkin and other brands. Pest control has existed for a century and will exist for a century more. No technology makes pests go away. Recurring service contracts provide revenue predictability. HALO in its purest essential services form: not glamorous, absolutely necessary.",
    keyRisks:"Limited ESG differentiation — chemical-heavy operations. Growth is largely through acquisition. Low physical asset base compared to infrastructure companies.",
    notInstead:[{ticker:"RSKIA",name:"Rentokil Initial",why:"UK-listed global competitor, now larger after Terminix acquisition. European listing adds currency and regulatory complexity for US-focused portfolio."}]},
];

const SCORE_LABELS = {
  assetDurability: "Asset durability",
  esgAlignment: "ESG alignment",
  revenuePredictability: "Revenue predictability",
  obsolescenceRisk: "Low obsolescence",
  sectorRelevance: "Sector relevance",
};

const SCORE_DESCRIPTIONS = {
  assetDurability: "How physical, tangible, and long-lasting are the company's core assets? Power grids and railroad tracks score highest; service businesses score lower.",
  esgAlignment: "How well does the company align with environmental, social, and governance criteria used in the HALO framework?",
  revenuePredictability: "How stable and predictable is the company's revenue? Regulated utilities score highest; development-stage companies score lower.",
  obsolescenceRisk: "How low is the risk that the company's business model becomes obsolete? This is inverted — a 10 means the business is extremely unlikely to be disrupted.",
  sectorRelevance: "How central is this company to infrastructure needs that will grow over the next 10–30 years?",
};

// ─── sub-components ──────────────────────────────────────────────────────────

const C = {
  green: "#3B6D11",
  greenLt: "#EAF3DE",
  greenMid: "#97C459",
  navy: "#1A3550",
  text: "var(--rw-text, #1a2030)",
  muted: "var(--rw-text-muted, #5a6070)",
  faint: "var(--rw-text-faint, #8a9099)",
  bg: "var(--rw-bg, #ffffff)",
  bgSec: "var(--rw-bg-secondary, #f5f5f2)",
  border: "var(--rw-border, #e0e0da)",
  red: "#c0392b",
  amber: "#c47a00",
};

function ScoreBar({ value, max = 10, color = C.green }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: C.bgSec, borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            width: `${(value / max) * 100}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 0.5s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: C.text, minWidth: 16, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function HaloFitBadge({ fit }) {
  const styles = {
    Core: { bg: "#EAF3DE", color: "#27500A", border: "#97C459" },
    Watch: { bg: "#FEF3D7", color: "#7a4800", border: "#E4A020" },
    Marginal: { bg: "#FDEAEA", color: "#7a1a1a", border: "#E24B4A" },
  };
  const s = styles[fit] || styles.Core;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        letterSpacing: "0.03em",
      }}
    >
      {fit}
    </span>
  );
}

function PerfCell({ value }) {
  const pos = value > 0;
  const color = pos ? C.green : C.red;
  return (
    <span style={{ fontSize: 14, fontWeight: 500, color }}>
      {pos ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

function ScoreTooltip({ label, description, visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: C.navy,
        color: "#e8e8e4",
        fontSize: 12,
        lineHeight: 1.5,
        padding: "8px 12px",
        borderRadius: 6,
        width: 220,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <strong style={{ display: "block", marginBottom: 4, color: "#ffffff" }}>{label}</strong>
      {description}
    </div>
  );
}

function CompanySelector({ value, onChange, exclude, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: C.muted,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "9px 14px",
          fontSize: 15,
          fontWeight: 500,
          border: `1.5px solid ${C.green}`,
          borderRadius: 8,
          background: C.bg,
          color: C.text,
          cursor: "pointer",
          fontFamily: "inherit",
          outline: "none",
          minWidth: 220,
        }}
      >
        {COMPANIES.filter((c) => c.ticker !== exclude).map((c) => (
          <option key={c.ticker} value={c.ticker}>
            {c.ticker} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function RadarChart({ company1, company2 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const load = async () => {
      if (!window.Chart) {
        await new Promise((resolve) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
          s.onload = resolve;
          document.head.appendChild(s);
        });
      }

      const labels = Object.values(SCORE_LABELS);
      const d1 = Object.keys(SCORE_LABELS).map((k) => company1.scores[k]);
      const d2 = Object.keys(SCORE_LABELS).map((k) => company2.scores[k]);

      if (chartRef.current) chartRef.current.destroy();
      if (!canvasRef.current) return;

      chartRef.current = new window.Chart(canvasRef.current, {
        type: "radar",
        data: {
          labels,
          datasets: [
            {
              label: company1.ticker,
              data: d1,
              borderColor: C.green,
              backgroundColor: "rgba(59,109,17,0.12)",
              borderWidth: 2,
              pointBackgroundColor: C.green,
              pointRadius: 4,
            },
            {
              label: company2.ticker,
              data: d2,
              borderColor: "#378ADD",
              backgroundColor: "rgba(55,138,221,0.08)",
              borderWidth: 2,
              pointBackgroundColor: "#378ADD",
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              min: 0,
              max: 10,
              ticks: {
                stepSize: 2,
                font: { size: 10 },
                color: "#8a9099",
                backdropColor: "transparent",
              },
              grid: { color: "rgba(128,128,128,0.12)" },
              angleLines: { color: "rgba(128,128,128,0.12)" },
              pointLabels: {
                font: { size: 11 },
                color: "#5a6070",
              },
            },
          },
        },
      });
    };

    load();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [company1.ticker, company2.ticker]);

  return (
    <div style={{ position: "relative", height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ScoreSection({ company1, company2 }) {
  const [tooltip, setTooltip] = useState(null);
  const keys = Object.keys(SCORE_LABELS);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {[company1, company2].map((co, ci) => (
          <div key={co.ticker}>
            <div style={{ fontSize: 13, fontWeight: 500, color: ci === 0 ? C.green : "#378ADD", marginBottom: 10 }}>
              {co.ticker}
            </div>
            {keys.map((k) => (
              <div
                key={k}
                style={{ marginBottom: 10, position: "relative" }}
                onMouseEnter={() => setTooltip(k)}
                onMouseLeave={() => setTooltip(null)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.muted, cursor: "help" }}>
                    {SCORE_LABELS[k]} {tooltip === k ? "ⓘ" : ""}
                  </span>
                </div>
                <ScoreBar value={co.scores[k]} color={ci === 0 ? C.green : "#378ADD"} />
                {ci === 0 && tooltip === k && (
                  <ScoreTooltip label={SCORE_LABELS[k]} description={SCORE_DESCRIPTIONS[k]} visible />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PerfSection({ company1, company2 }) {
  const windows = ["1M", "YTD", "1Y"];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 0", color: C.muted, fontWeight: 400, fontSize: 12 }}>
              Window
            </th>
            <th style={{ textAlign: "right", padding: "8px 12px", color: C.green, fontWeight: 500, fontSize: 13 }}>
              {company1.ticker}
            </th>
            <th style={{ textAlign: "right", padding: "8px 0", color: "#378ADD", fontWeight: 500, fontSize: 13 }}>
              {company2.ticker}
            </th>
            <th style={{ textAlign: "right", padding: "8px 0 8px 12px", color: C.muted, fontWeight: 400, fontSize: 12 }}>
              Difference
            </th>
          </tr>
        </thead>
        <tbody>
          {windows.map((w, i) => {
            const v1 = company1.perf[w];
            const v2 = company2.perf[w];
            const diff = v1 - v2;
            return (
              <tr key={w} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 0", color: C.muted, fontSize: 13 }}>{w}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  <PerfCell value={v1} />
                </td>
                <td style={{ padding: "10px 0", textAlign: "right" }}>
                  <PerfCell value={v2} />
                </td>
                <td style={{ padding: "10px 0 10px 12px", textAlign: "right", fontSize: 13, color: C.faint }}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.6 }}>
        Data may be delayed. Performance figures are for reference only and do not constitute a recommendation.
      </p>
    </div>
  );
}

function NotInsteadSection({ company }) {
  if (!company.notInstead || company.notInstead.length === 0) return null;
  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>
        These are companies with similar characteristics that are <em>not</em> in the HALO basket — and why.
        Understanding what's excluded is often as revealing as understanding what's included.
      </p>
      {company.notInstead.map((peer) => (
        <div
          key={peer.ticker}
          style={{
            padding: "12px 14px",
            background: C.bgSec,
            borderRadius: 8,
            marginBottom: 8,
            borderLeft: `3px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: "monospace" }}>
              {peer.ticker}
            </span>
            <span style={{ fontSize: 13, color: C.muted }}>— {peer.name}</span>
          </div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{peer.why}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Comparator ─────────────────────────────────────────────────────────

export default function HALOComparator() {
  const [ticker1, setTicker1] = useState("NEE");
  const [ticker2, setTicker2] = useState("AWK");
  const [activeTab, setActiveTab] = useState("overview");

  const co1 = COMPANIES.find((c) => c.ticker === ticker1);
  const co2 = COMPANIES.find((c) => c.ticker === ticker2);

  // Swap handler
  const handleSwap = () => {
    setTicker1(ticker2);
    setTicker2(ticker1);
  };

  // Ensure no duplicate
  const handleTicker1 = (v) => {
    setTicker1(v);
    if (v === ticker2) setTicker2(COMPANIES.find((c) => c.ticker !== v).ticker);
  };
  const handleTicker2 = (v) => {
    setTicker2(v);
    if (v === ticker1) setTicker1(COMPANIES.find((c) => c.ticker !== v).ticker);
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "scores", label: "HALO scores" },
    { key: "performance", label: "Performance" },
    { key: "thesis", label: "Investment thesis" },
    { key: "excluded", label: "Why not instead?" },
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
    whiteSpace: "nowrap",
  });

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 6 }}>
          Compare HALO basket companies
        </h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 620 }}>
          Side-by-side analysis of any two companies in the basket — including the
          companies that are similar but not included, and why.
        </p>
      </div>

      {/* Selectors */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          padding: "1.25rem",
          background: C.bgSec,
          borderRadius: 10,
        }}
      >
        <CompanySelector value={ticker1} onChange={handleTicker1} exclude={ticker2} label="Company A" />

        <button
          onClick={handleSwap}
          title="Swap companies"
          style={{
            padding: "9px 14px",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            background: C.bg,
            color: C.muted,
            cursor: "pointer",
            fontSize: 16,
            marginBottom: 2,
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          ⇄
        </button>

        <CompanySelector value={ticker2} onChange={handleTicker2} exclude={ticker1} label="Company B" />
      </div>

      {/* Quick summary bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 0,
          marginBottom: "1.5rem",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {[co1, co2].map((co, i) => (
          <div
            key={co.ticker}
            style={{
              padding: "1rem 1.25rem",
              background: i === 0 ? "rgba(59,109,17,0.04)" : "rgba(55,138,221,0.04)",
              borderRight: i === 0 ? `1px solid ${C.border}` : "none",
              borderLeft: i === 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "monospace",
                  background: i === 0 ? C.greenLt : "#E3F0FF",
                  color: i === 0 ? "#27500A" : "#0C447C",
                  padding: "2px 7px",
                  borderRadius: 4,
                  letterSpacing: "0.05em",
                }}
              >
                {co.ticker}
              </span>
              <HaloFitBadge fit={co.haloFit} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 3 }}>
              {co.name}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>{co.sector}</div>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {["1M", "YTD", "1Y"].map((w) => (
                <div key={w}>
                  <div style={{ fontSize: 10, color: C.faint, marginBottom: 2 }}>{w}</div>
                  <PerfCell value={co.perf[w]} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Middle divider with vs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            background: C.bg,
          }}
        >
          <span style={{ fontSize: 11, color: C.faint, fontWeight: 500 }}>VS</span>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${C.border}`,
          marginBottom: "1.5rem",
          overflowX: "auto",
          gap: 0,
        }}
      >
        {tabs.map((t) => (
          <button key={t.key} style={tabStyle(t.key)} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ─────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div>
          <RadarChart company1={co1} company2={co2} />

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12, marginBottom: 24 }}>
            {[co1, co2].map((co, i) => (
              <span key={co.ticker} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.muted }}>
                <span style={{ width: 16, height: 3, background: i === 0 ? C.green : "#378ADD", borderRadius: 2, display: "inline-block" }} />
                {co.ticker} — {co.name}
              </span>
            ))}
          </div>

          {/* Score summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {Object.keys(SCORE_LABELS).map((k) => {
              const s1 = co1.scores[k];
              const s2 = co2.scores[k];
              const leader = s1 > s2 ? co1.ticker : s2 > s1 ? co2.ticker : null;
              return (
                <div
                  key={k}
                  style={{
                    padding: "10px 14px",
                    background: C.bgSec,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: C.muted, flex: 1 }}>{SCORE_LABELS[k]}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.green }}>{s1}</span>
                  <span style={{ fontSize: 10, color: C.faint }}>vs</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#378ADD" }}>{s2}</span>
                  {leader && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 20,
                        background: leader === co1.ticker ? C.greenLt : "#E3F0FF",
                        color: leader === co1.ticker ? "#27500A" : "#0C447C",
                        fontWeight: 500,
                        minWidth: 32,
                        textAlign: "center",
                      }}
                    >
                      {leader}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 13, color: C.faint, lineHeight: 1.6 }}>
            Scores reflect the HALO+ESG framework applied to each company at the time of last review.
            Hover over individual score bars in the <button onClick={() => setActiveTab("scores")} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", textDecoration: "underline", fontSize: 13, fontFamily: "inherit", padding: 0 }}>HALO scores tab</button> for explanations of each dimension.
          </p>
        </div>
      )}

      {/* ── TAB: SCORES ───────────────────────────────────────────── */}
      {activeTab === "scores" && (
        <div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: "1.25rem", maxWidth: 580 }}>
            Each dimension is scored 1–10. Hover over any dimension label to see what it measures.
            These scores are the basis for inclusion in — and occasional removal from — the HALO basket.
          </p>
          <ScoreSection company1={co1} company2={co2} />

          <div style={{ marginTop: 20, padding: "14px 16px", background: C.bgSec, borderRadius: 8, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
            <strong style={{ color: C.text, fontWeight: 500 }}>How to read these scores:</strong> A high score
            on <em>Asset Durability</em> means the company owns physical, long-lived infrastructure.
            A high score on <em>Low Obsolescence</em> means the business is extremely unlikely to be disrupted
            by technology or changing demand. No company needs to score perfectly on all five — the combination matters.
          </div>
        </div>
      )}

      {/* ── TAB: PERFORMANCE ──────────────────────────────────────── */}
      {activeTab === "performance" && (
        <div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: "1.25rem", maxWidth: 580 }}>
            Performance is shown for context, not as a signal. The HALO framework focuses on
            medium-term windows of months and years. Short-term movement is noise.
          </p>
          <PerfSection company1={co1} company2={co2} />

          <div style={{ marginTop: 20, padding: "14px 16px", background: C.bgSec, borderRadius: 8, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
            <strong style={{ color: C.text, fontWeight: 500 }}>A note on underperformance:</strong> If either
            company is trailing the S&P 500 in a given window, that alone is not a reason to reconsider.
            The HALO basket is designed for the investor who is more interested in understanding
            durable, responsible businesses than in chasing market benchmarks. See{" "}
            <a href="/methodology" style={{ color: C.green, textDecoration: "underline" }}>Our Approach</a>{" "}
            for more on how we think about performance context.
          </div>
        </div>
      )}

      {/* ── TAB: THESIS ───────────────────────────────────────────── */}
      {activeTab === "thesis" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[co1, co2].map((co, i) => (
            <div key={co.ticker}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: `2px solid ${i === 0 ? C.green : "#378ADD"}`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: i === 0 ? C.green : "#378ADD" }}>
                  {co.ticker}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{co.name}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.faint, marginBottom: 6 }}>
                  Why it's in the basket
                </div>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0 }}>{co.thesis}</p>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  background: "#FEF3D7",
                  borderRadius: 8,
                  borderLeft: "3px solid #E4A020",
                }}
              >
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#7a4800", marginBottom: 6 }}>
                  Key risks
                </div>
                <p style={{ fontSize: 13, color: "#5a3800", lineHeight: 1.65, margin: 0 }}>{co.keyRisks}</p>
              </div>

              <div style={{ marginTop: 12 }}>
                <HaloFitBadge fit={co.haloFit} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: EXCLUDED ─────────────────────────────────────────── */}
      {activeTab === "excluded" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {[co1, co2].map((co, i) => (
            <div key={co.ticker}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: `2px solid ${i === 0 ? C.green : "#378ADD"}`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: i === 0 ? C.green : "#378ADD" }}>
                  {co.ticker}
                </span>
                <span style={{ fontSize: 14, color: C.muted }}>— similar companies not included</span>
              </div>
              <NotInsteadSection company={co} />
            </div>
          ))}
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "14px 16px",
              background: C.bgSec,
              borderRadius: 8,
              fontSize: 13,
              color: C.muted,
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: C.text, fontWeight: 500 }}>Why this matters:</strong>{" "}
            Understanding what's excluded — and why — reveals the methodology more clearly
            than the inclusions alone. The HALO framework isn't just "infrastructure companies";
            it has a specific view on asset durability, ESG alignment, revenue predictability,
            and obsolescence risk. Companies that miss on one dimension are often excluded even
            if they look superficially similar to something already in the basket.
          </div>
        </div>
      )}

      {/* Bottom disclaimer */}
      <p
        style={{
          fontSize: 11,
          color: C.faint,
          lineHeight: 1.7,
          borderTop: `1px solid ${C.border}`,
          paddingTop: "1rem",
          marginTop: "2rem",
        }}
      >
        HALO scores are based on the Responsible Wealth framework and represent the editorial
        judgment of this platform, not a financial rating. Performance data may be delayed.
        Nothing on this page constitutes personalized investment advice or a recommendation
        to buy, sell, or hold any security.
      </p>
    </div>
  );
}
