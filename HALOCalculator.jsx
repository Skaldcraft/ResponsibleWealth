"use client";

import { useState, useEffect, useRef } from "react";

// ─── data ────────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    key: "bank",
    label: "Big bank savings",
    rate: 0.004,
    color: "#888780",
    dash: [5, 4],
    width: 1.5,
    explain:
      "A standard savings account at a large bank like Chase, Bank of America, or Wells Fargo. Your money is safe and accessible, but the interest rate is very low — often below 0.5% per year.",
  },
  {
    key: "hysa",
    label: "High-yield savings",
    rate: 0.045,
    color: "#378ADD",
    dash: [5, 4],
    width: 1.5,
    explain:
      "A savings account at an online bank (like Marcus, Ally, or Marcus) that pays much more interest than a big bank. The rate is higher right now because of Federal Reserve policy, but it will change when rates go down.",
  },
  {
    key: "cd",
    label: "2-year CD (rolled)",
    rate: 0.047,
    color: "#73726c",
    dash: [5, 4],
    width: 1.5,
    explain:
      "A Certificate of Deposit — you lock your money with a bank for a fixed period (here, 2 years) and earn a guaranteed rate. 'Rolled' means you reinvest it at the end of each term. The rate is locked in but your money is not accessible until it matures.",
  },
  {
    key: "sp500",
    label: "S&P 500 index fund",
    rate: 0.10,
    color: "#c0392b",
    dash: [5, 4],
    width: 1.5,
    explain:
      "An index fund that tracks the 500 largest US companies. It's the most common benchmark for stock market performance. The ~10% figure is the long-term historical average — actual returns vary year to year, and can be negative in bad years.",
  },
  {
    key: "halo",
    label: "HALO+ESG basket",
    rate: 0.09,
    color: "#3B6D11",
    dash: [],
    width: 2.5,
    highlight: true,
    explain:
      "The 18 companies tracked by Responsible Wealth — selected because they are built on durable, real-world infrastructure and meet responsible investing criteria. The ~9% figure reflects the basket's 1-year return as of March 2026. Like any investment, returns are not guaranteed.",
  },
];

const INFLATION = 0.03;

const GLOSSARY = [
  {
    term: "APY (Annual Percentage Yield)",
    definition:
      "The actual return on your money over one year, including the effect of compound interest. A higher APY means your money grows faster.",
  },
  {
    term: "Inflation",
    definition:
      "The gradual rise in prices over time. If inflation is 3% per year and your savings earn 0.4%, your money is actually losing purchasing power — you can buy less with it next year than you can today.",
  },
  {
    term: "Purchasing power",
    definition:
      "How much your money can actually buy. $10,000 today and $10,400 in a year might sound like a gain, but if everything costs 3% more, you've effectively lost ground.",
  },
  {
    term: "Index fund",
    definition:
      "A fund that automatically invests in a large group of companies — like all 500 in the S&P 500 — rather than picking individual stocks. Low-cost and widely held. The returns vary with the market.",
  },
  {
    term: "ESG",
    definition:
      "Environmental, Social, and Governance — a framework for evaluating companies on factors beyond financial performance. Here it's used as a practical filter, not a label: does this company have meaningful environmental impact, reasonable governance, and a role in society worth supporting?",
  },
  {
    term: "HALO (Heavy Assets, Low Obsolescence)",
    definition:
      "The core idea behind the Responsible Wealth basket. Companies built on physical, long-lasting infrastructure — water systems, power grids, rail networks — that are unlikely to become obsolete overnight. These businesses tend to be more predictable and easier to follow over the long term.",
  },
  {
    term: "CD (Certificate of Deposit)",
    definition:
      "A savings product where you agree to leave your money with a bank for a set period (e.g. 6 months, 1 year, 2 years) in exchange for a guaranteed interest rate. Safe and predictable, but your money is locked in until the term ends.",
  },
  {
    term: "Compound growth",
    definition:
      "When your returns earn returns. If you have $1,000 and it grows 9% in year one, you have $1,090. In year two, the 9% applies to $1,090 — not just $1,000. Over decades, this compounding effect is what drives the large differences between the lines on the chart.",
  },
  {
    term: "Benchmark",
    definition:
      "A standard used to compare performance. The S&P 500 is the most common benchmark for US investing. When the HALO basket trails the S&P 500 in a given year, it doesn't mean it's 'failing' — it means different companies are performing differently, for different reasons.",
  },
  {
    term: "Diversification",
    definition:
      "Spreading your money across multiple companies or asset types to reduce risk. The HALO basket includes 18 companies across sectors like water, utilities, rail, and logistics — that's a form of diversification within a values-aligned approach.",
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
const grow = (pv, r, y) => pv * Math.pow(1 + r, y);

// ─── sub-components ──────────────────────────────────────────────────────────

function ScenarioCard({ scenario, pv, horizon }) {
  const fv = grow(pv, scenario.rate, horizon);
  const gain = fv - pv;
  const pct = ((fv / pv - 1) * 100).toFixed(0);

  return (
    <div
      style={{
        background: scenario.highlight ? "#EAF3DE" : "var(--rw-bg-secondary, #f5f5f2)",
        border: scenario.highlight ? "1.5px solid #97C459" : "1px solid var(--rw-border, #e0e0da)",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: scenario.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: scenario.highlight ? "#3B6D11" : "var(--rw-text-muted, #5a6070)",
            fontWeight: 500,
            lineHeight: 1.3,
          }}
        >
          {scenario.label}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: scenario.highlight ? "#27500A" : "var(--rw-text, #1a2030)",
          marginBottom: 3,
        }}
      >
        {fmt(fv)}
      </div>
      <div style={{ fontSize: 12, color: scenario.highlight ? "#3B6D11" : "var(--rw-text-faint, #8a9099)" }}>
        +{fmt(gain)} · +{pct}% total
      </div>
      <div
        style={{
          fontSize: 11,
          color: scenario.highlight ? "#3B6D11" : "var(--rw-text-faint, #8a9099)",
          marginTop: 2,
          opacity: 0.8,
        }}
      >
        {(scenario.rate * 100).toFixed(1)}% avg/yr · {horizon} yr
      </div>
    </div>
  );
}

function ExplainerRow({ scenario }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid var(--rw-border, #e0e0da)",
        padding: "10px 0",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: scenario.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--rw-text, #1a2030)",
            flex: 1,
          }}
        >
          {scenario.label}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--rw-text-muted, #5a6070)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <p
          style={{
            fontSize: 14,
            color: "var(--rw-text-muted, #5a6070)",
            lineHeight: 1.7,
            margin: "10px 0 4px 20px",
          }}
        >
          {scenario.explain}
        </p>
      )}
    </div>
  );
}

function GlossaryItem({ term, definition }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid var(--rw-border, #e0e0da)",
        padding: "10px 0",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          width: "100%",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--rw-text, #1a2030)" }}>
          {term}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--rw-text-muted, #5a6070)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            display: "inline-block",
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <p
          style={{
            fontSize: 14,
            color: "var(--rw-text-muted, #5a6070)",
            lineHeight: 1.7,
            margin: "10px 0 4px 0",
          }}
        >
          {definition}
        </p>
      )}
    </div>
  );
}

// ─── chart ────────────────────────────────────────────────────────────────────

function GrowthChart({ pv, horizon }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadChart = async () => {
      if (!window.Chart) {
        await new Promise((resolve) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
          s.onload = resolve;
          document.head.appendChild(s);
        });
      }

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
      const tickColor = isDark ? "#9a9a94" : "#8a9099";

      const years = Array.from({ length: horizon + 1 }, (_, i) => i);

      const datasets = SCENARIOS.map((s) => ({
        label: s.label,
        data: years.map((y) => Math.round(grow(pv, s.rate, y))),
        borderColor: s.color,
        backgroundColor: "transparent",
        borderWidth: s.width,
        borderDash: s.dash,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
      }));

      datasets.push({
        label: "Inflation baseline",
        data: years.map((y) => Math.round(grow(pv, INFLATION, y))),
        borderColor: "#c0392b",
        backgroundColor: "rgba(192,57,43,0.08)",
        fill: true,
        borderWidth: 1,
        borderDash: [2, 5],
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 3,
      });

      if (chartRef.current) chartRef.current.destroy();
      if (!canvasRef.current) return;

      chartRef.current = new window.Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: years.map((y) => (y === 0 ? "Now" : y + "yr")),
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label(ctx) {
                  return (
                    " " +
                    ctx.dataset.label +
                    ": $" +
                    ctx.parsed.y.toLocaleString("en-US")
                  );
                },
              },
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: tickColor, font: { size: 11 } },
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: tickColor,
                font: { size: 11 },
                callback(v) {
                  if (v >= 1000000) return "$" + (v / 1000000).toFixed(1) + "M";
                  if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
                  return "$" + v;
                },
              },
            },
          },
          interaction: { mode: "index", intersect: false },
        },
      });
    };

    loadChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [pv, horizon]);

  return (
    <div style={{ position: "relative", width: "100%", height: 300 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function HALOCalculator() {
  const [amount, setAmount] = useState(10000);
  const [rawInput, setRawInput] = useState("10000");
  const [horizon, setHorizon] = useState(10);
  const [activeTab, setActiveTab] = useState("calculator");

  const pv = Math.max(100, amount || 100);

  const bankFV = grow(pv, 0.004, horizon);
  const realBankFV = bankFV / Math.pow(1 + INFLATION, horizon);
  const realLoss = pv - realBankFV;

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setRawInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) setAmount(num);
  };

  const tabStyle = (key) => ({
    padding: "8px 20px",
    fontSize: 14,
    border: "none",
    borderBottom: activeTab === key ? "2px solid #3B6D11" : "2px solid transparent",
    background: "transparent",
    color: activeTab === key ? "#3B6D11" : "var(--rw-text-muted, #5a6070)",
    cursor: "pointer",
    fontWeight: activeTab === key ? 500 : 400,
    transition: "all 0.15s",
    fontFamily: "inherit",
  });

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {/* header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "var(--rw-text, #1a2030)",
            marginBottom: 6,
          }}
        >
          Growth comparison: HALO+ESG vs. traditional options
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--rw-text-muted, #5a6070)",
            lineHeight: 1.6,
            maxWidth: 600,
          }}
        >
          See how the same starting amount grows differently depending on where
          it sits — and what inflation quietly does to the options that feel
          "safe."
        </p>
      </div>

      {/* tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--rw-border, #e0e0da)",
          marginBottom: "1.5rem",
          gap: 0,
        }}
      >
        {[
          { key: "calculator", label: "Calculator" },
          { key: "explained", label: "What each option means" },
          { key: "glossary", label: "Glossary" },
        ].map((t) => (
          <button key={t.key} style={tabStyle(t.key)} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: CALCULATOR ─────────────────────────────────────────── */}
      {activeTab === "calculator" && (
        <>
          {/* controls */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "2rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--rw-text-muted, #5a6070)",
                }}
              >
                Starting amount
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  borderBottom: "2px solid #3B6D11",
                  paddingBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    color: "var(--rw-text-muted, #5a6070)",
                    fontWeight: 400,
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="100"
                  max="10000000"
                  step="500"
                  value={rawInput}
                  onChange={handleAmountChange}
                  aria-label="Starting amount in dollars"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    border: "none",
                    background: "transparent",
                    color: "var(--rw-text, #1a2030)",
                    width: 160,
                    outline: "none",
                    MozAppearance: "textfield",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--rw-text-muted, #5a6070)",
                }}
              >
                Time horizon
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {[5, 10, 20].map((y) => (
                  <button
                    key={y}
                    onClick={() => setHorizon(y)}
                    style={{
                      padding: "7px 18px",
                      fontSize: 13,
                      borderRadius: 20,
                      border: `1px solid ${horizon === y ? "#3B6D11" : "var(--rw-border-strong, #c0c0ba)"}`,
                      background: horizon === y ? "#3B6D11" : "transparent",
                      color: horizon === y ? "#fff" : "var(--rw-text-muted, #5a6070)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    {y} yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* result cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))",
              gap: 10,
              marginBottom: "1rem",
            }}
          >
            {SCENARIOS.map((s) => (
              <ScenarioCard key={s.key} scenario={s} pv={pv} horizon={horizon} />
            ))}
          </div>

          {/* inflation note */}
          <div
            style={{
              fontSize: 13,
              color: "var(--rw-text-muted, #5a6070)",
              padding: "10px 14px",
              borderLeft: "3px solid #c0392b",
              background: "var(--rw-bg-secondary, #f5f5f2)",
              marginBottom: "1.5rem",
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: "var(--rw-text, #1a2030)", fontWeight: 500 }}>
              Inflation context:{" "}
            </strong>
            With ~3% annual inflation, {fmt(pv)} in a big bank savings account
            has the real purchasing power of{" "}
            <strong style={{ color: "var(--rw-text, #1a2030)", fontWeight: 500 }}>
              {fmt(realBankFV)}
            </strong>{" "}
            in today's dollars after {horizon} years — a real loss of{" "}
            {fmt(realLoss)}.{" "}
            <span
              style={{ cursor: "pointer", color: "#3B6D11", textDecoration: "underline" }}
              onClick={() => setActiveTab("glossary")}
            >
              What is purchasing power?
            </span>
          </div>

          {/* chart */}
          <GrowthChart pv={pv} horizon={horizon} />

          {/* chart legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 12,
              marginBottom: "1.5rem",
              fontSize: 12,
              color: "var(--rw-text-muted, #5a6070)",
            }}
          >
            {SCENARIOS.map((s) => (
              <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    width: 18,
                    height: s.highlight ? 3 : 2,
                    background: s.color,
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                {s.label}
              </span>
            ))}
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 18,
                  height: 1,
                  background: "#c0392b",
                  opacity: 0.6,
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              Inflation baseline
            </span>
          </div>

          {/* nudge to explainer tab */}
          <div
            style={{
              padding: "12px 16px",
              background: "var(--rw-bg-secondary, #f5f5f2)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--rw-text-muted, #5a6070)",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
            }}
          >
            Not sure what these options mean?{" "}
            <button
              onClick={() => setActiveTab("explained")}
              style={{
                background: "none",
                border: "none",
                color: "#3B6D11",
                cursor: "pointer",
                fontSize: 13,
                textDecoration: "underline",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Read plain-English explanations of each one →
            </button>
          </div>
        </>
      )}

      {/* ── TAB: EXPLAINED ──────────────────────────────────────────── */}
      {activeTab === "explained" && (
        <div>
          <p
            style={{
              fontSize: 14,
              color: "var(--rw-text-muted, #5a6070)",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
              maxWidth: 600,
            }}
          >
            The calculator compares five ways your money can grow. Here's what each
            one actually means — without financial jargon.
          </p>

          {SCENARIOS.map((s) => (
            <ExplainerRow key={s.key} scenario={s} />
          ))}

          <div
            style={{
              marginTop: "1.5rem",
              padding: "14px 16px",
              background: "#EAF3DE",
              borderRadius: 8,
              fontSize: 13,
              color: "#27500A",
              lineHeight: 1.7,
            }}
          >
            <strong style={{ fontWeight: 500 }}>Why the comparison matters:</strong>{" "}
            The point isn't that HALO always outperforms — it sometimes doesn't.
            The point is that with HALO+ESG you know exactly what you own, why it's
            there, and how it fits your values. With a bank savings account, you have
            no idea how the bank uses your deposits, and the return barely keeps up
            with inflation.
          </div>

          <div
            style={{
              marginTop: "1rem",
              padding: "12px 16px",
              background: "var(--rw-bg-secondary, #f5f5f2)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--rw-text-muted, #5a6070)",
              lineHeight: 1.6,
            }}
          >
            Unfamiliar with a term?{" "}
            <button
              onClick={() => setActiveTab("glossary")}
              style={{
                background: "none",
                border: "none",
                color: "#3B6D11",
                cursor: "pointer",
                fontSize: 13,
                textDecoration: "underline",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Open the glossary →
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: GLOSSARY ───────────────────────────────────────────── */}
      {activeTab === "glossary" && (
        <div>
          <p
            style={{
              fontSize: 14,
              color: "var(--rw-text-muted, #5a6070)",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
              maxWidth: 600,
            }}
          >
            Key terms used in the calculator and on the Responsible Wealth site.
            Click any term to read its explanation.
          </p>

          {GLOSSARY.map((g) => (
            <GlossaryItem key={g.term} term={g.term} definition={g.definition} />
          ))}

          <div
            style={{
              marginTop: "1.5rem",
              fontSize: 13,
              color: "var(--rw-text-faint, #8a9099)",
              lineHeight: 1.6,
            }}
          >
            These definitions are simplified for clarity. For deeper reading, see
            the{" "}
            <a
              href="/methodology"
              style={{ color: "#3B6D11", textDecoration: "underline" }}
            >
              Our Approach
            </a>{" "}
            page.
          </div>
        </div>
      )}

      {/* disclaimer */}
      <p
        style={{
          fontSize: 11,
          color: "var(--rw-text-faint, #8a9099)",
          lineHeight: 1.7,
          borderTop: "1px solid var(--rw-border, #e0e0da)",
          paddingTop: "1rem",
          marginTop: "1.5rem",
        }}
      >
        Historical rates used for illustration only. Big bank savings: 0.4% APY.
        High-yield savings: 4.5% APY (current, rate-dependent on Fed policy).
        2-year CD: 4.7% APY. S&P 500 index fund: ~10% long-term historical
        average. HALO+ESG basket: ~9% (1-year return per Responsible Wealth, March
        2026). Inflation estimate: ~3% annual average. Past performance does not
        guarantee future results. This tool is for educational and informational
        purposes only and does not constitute personalized investment advice or a
        recommendation to buy, sell, or hold any security.
      </p>
    </div>
  );
}
