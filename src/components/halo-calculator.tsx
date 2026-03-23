"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Chart from "chart.js/auto";
import type { ChartConfiguration, ChartDataset, TooltipItem } from "chart.js";
import {
  HALO_DIFFERENCES,
  HALO_GLOSSARY,
  HALO_HORIZONS,
  HALO_INFLATION,
  HALO_SCENARIOS,
  type GlossaryEntry,
  type HaloScenario
} from "@/data/halo-calculator-config";

type ScenarioCardProps = { scenario: HaloScenario; pv: number; horizon: number };
type ExplainerRowProps = { scenario: HaloScenario };
type GlossaryItemProps = GlossaryEntry;
type GrowthChartProps = { pv: number; horizon: number };

const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const grow = (pv: number, r: number, y: number) => pv * Math.pow(1 + r, y);
const VALID_TABS = ["calculator", "explained", "differences", "glossary"] as const;
type TabKey = (typeof VALID_TABS)[number];

function parseAmount(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 10000;
  return Math.min(Math.max(parsed, 100), 10000000);
}

function parseHorizon(value: string | null) {
  const parsed = Number(value);
  return HALO_HORIZONS.includes(parsed as (typeof HALO_HORIZONS)[number])
    ? (parsed as (typeof HALO_HORIZONS)[number])
    : 10;
}

function parseTab(value: string | null): TabKey {
  return VALID_TABS.includes((value ?? "") as TabKey) ? ((value ?? "calculator") as TabKey) : "calculator";
}

function ScenarioCard({ scenario, pv, horizon }: ScenarioCardProps) {
  const fv = grow(pv, scenario.rate, horizon);
  const gain = fv - pv;
  const pct = ((fv / pv - 1) * 100).toFixed(0);

  return (
    <div
      style={{
        background: scenario.highlight ? "#EAF3DE" : "var(--surface, #f5f5f2)",
        border: scenario.highlight ? "1.5px solid #97C459" : "1px solid var(--line-soft, #e0e0da)",
        borderRadius: 10,
        padding: "14px 16px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: scenario.color,
            flexShrink: 0
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: scenario.highlight ? "#3B6D11" : "var(--muted, #5a6070)",
            fontWeight: 500,
            lineHeight: 1.3
          }}
        >
          {scenario.label}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: scenario.highlight ? "#27500A" : "var(--ink, #1a2030)",
          marginBottom: 3
        }}
      >
        {fmt(fv)}
      </div>
      <div style={{ fontSize: 12, color: scenario.highlight ? "#3B6D11" : "var(--muted, #8a9099)" }}>
        +{fmt(gain)} | +{pct}% total
      </div>
      <div
        style={{
          fontSize: 11,
          color: scenario.highlight ? "#3B6D11" : "var(--muted, #8a9099)",
          marginTop: 2,
          opacity: 0.8
        }}
      >
        {(scenario.rate * 100).toFixed(1)}% avg/yr | {horizon} yr
      </div>
    </div>
  );
}

function ExplainerRow({ scenario }: ExplainerRowProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid var(--line-soft, #e0e0da)",
        padding: "10px 0"
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
          textAlign: "left"
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: scenario.color,
            flexShrink: 0
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--ink, #1a2030)",
            flex: 1
          }}
        >
          {scenario.label}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--muted, #5a6070)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            display: "inline-block"
          }}
        >
          ▾
        </span>
      </button>
      {open ? (
        <p
          style={{
            fontSize: 14,
            color: "var(--muted, #5a6070)",
            lineHeight: 1.7,
            margin: "10px 0 4px 20px"
          }}
        >
          {scenario.explain}
        </p>
      ) : null}
    </div>
  );
}

function GlossaryItem({ term, definition }: GlossaryItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid var(--line-soft, #e0e0da)",
        padding: "10px 0"
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
          textAlign: "left"
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink, #1a2030)" }}>{term}</span>
        <span
          style={{
            fontSize: 12,
            color: "var(--muted, #5a6070)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            display: "inline-block",
            flexShrink: 0
          }}
        >
          ▾
        </span>
      </button>
      {open ? (
        <p
          style={{
            fontSize: 14,
            color: "var(--muted, #5a6070)",
            lineHeight: 1.7,
            margin: "10px 0 4px 0"
          }}
        >
          {definition}
        </p>
      ) : null}
    </div>
  );
}

function GrowthChart({ pv, horizon }: GrowthChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
    const tickColor = isDark ? "#9a9a94" : "#8a9099";

    const years = Array.from({ length: horizon + 1 }, (_, i) => i);
    const datasets: ChartDataset<"line", number[]>[] = HALO_SCENARIOS.map((scenario) => ({
      label: scenario.label,
      data: years.map((y) => Math.round(grow(pv, scenario.rate, y))),
      borderColor: scenario.color,
      backgroundColor: "transparent",
      borderWidth: scenario.width,
      borderDash: scenario.dash,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4
    }));

    datasets.push({
      label: "Inflation baseline",
      data: years.map((y) => Math.round(grow(pv, HALO_INFLATION, y))),
      borderColor: "#c0392b",
      backgroundColor: "rgba(192,57,43,0.08)",
      fill: true,
      borderWidth: 1,
      borderDash: [2, 5],
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3
    });

    if (chartRef.current) chartRef.current.destroy();
    if (!canvasRef.current) return;

    const chartConfig: ChartConfiguration<"line", number[], string> = {
        type: "line",
        data: {
          labels: years.map((y) => (y === 0 ? "Now" : `${y}yr`)),
          datasets
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
                label(context: TooltipItem<"line">) {
                  const parsedY = context.parsed.y ?? 0;
                  return ` ${context.dataset.label ?? ""}: $${parsedY.toLocaleString("en-US")}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: tickColor, font: { size: 11 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: tickColor,
                font: { size: 11 },
                callback(value) {
                  const numeric = Number(value);
                  if (numeric >= 1000000) return `$${(numeric / 1000000).toFixed(1)}M`;
                  if (numeric >= 1000) return `$${Math.round(numeric / 1000)}k`;
                  return `$${numeric}`;
                }
              }
            }
          },
          interaction: { mode: "index", intersect: false }
        }
      };

    chartRef.current = new Chart(canvasRef.current, chartConfig);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [pv, horizon]);

  return (
    <div className="halo-calc__chart-wrap">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function HALOCalculator() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      amount: parseAmount(searchParams.get("amount")),
      horizon: parseHorizon(searchParams.get("horizon")),
      tab: parseTab(searchParams.get("tab"))
    }),
    [searchParams]
  );

  const [amount, setAmount] = useState(initialState.amount);
  const [rawInput, setRawInput] = useState(String(initialState.amount));
  const [horizon, setHorizon] = useState<number>(initialState.horizon);
  const [activeTab, setActiveTab] = useState<TabKey>(initialState.tab);

  useEffect(() => {
    setAmount(initialState.amount);
    setRawInput(String(initialState.amount));
    setHorizon(initialState.horizon);
    setActiveTab(initialState.tab);
  }, [initialState]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("amount", String(Math.round(amount)));
    next.set("horizon", String(horizon));
    next.set("tab", activeTab);
    const nextQuery = next.toString();
    const current = searchParams.toString();
    if (nextQuery !== current) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [amount, horizon, activeTab, router, pathname, searchParams]);

  const pv = Math.max(100, amount || 100);
  const bankFV = grow(pv, 0.004, horizon);
  const realBankFV = bankFV / Math.pow(1 + HALO_INFLATION, horizon);
  const realLoss = pv - realBankFV;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawInput(val);
    const num = parseFloat(val);
    if (!Number.isNaN(num) && num > 0) setAmount(num);
  };

  const tabStyle = (key: TabKey): React.CSSProperties => ({
    padding: "8px 20px",
    fontSize: 14,
    border: "none",
    borderBottom: activeTab === key ? "2px solid var(--accent)" : "2px solid transparent",
    background: "transparent",
    color: activeTab === key ? "var(--accent)" : "var(--muted)",
    cursor: "pointer",
    fontWeight: activeTab === key ? 600 : 400,
    transition: "all 0.15s",
    fontFamily: "inherit"
  });

  return (
    <div className="halo-calc">
      <div className="halo-calc__header">
        <h2>
          Growth comparison: HALO+ESG vs. traditional options
        </h2>
        <p>
          Explore how the same starting amount may evolve across different paths, with inflation context included.
        </p>
      </div>

      <div className="halo-calc__tabs">
        {[
          { key: "calculator", label: "Calculator" },
          { key: "explained", label: "What each option means" },
          { key: "differences", label: "Key differences" },
          { key: "glossary", label: "Glossary" }
        ].map((t) => (
          <button key={t.key} style={tabStyle(t.key as TabKey)} onClick={() => setActiveTab(t.key as TabKey)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "calculator" ? (
        <>
          <div className="halo-calc__controls">
            <div className="halo-calc__control-group">
              <label>
                Starting amount
              </label>
              <div className="halo-calc__amount-wrap">
                <span className="halo-calc__currency">$</span>
                <input
                  type="number"
                  min="100"
                  max="10000000"
                  step="500"
                  value={rawInput}
                  onChange={handleAmountChange}
                  aria-label="Starting amount in dollars"
                  className="halo-calc__amount-input"
                />
              </div>
            </div>

            <div className="halo-calc__control-group">
              <label>
                Time horizon
              </label>
              <div className="halo-calc__horizon-row">
                {HALO_HORIZONS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setHorizon(y)}
                    className={`halo-calc__horizon-btn ${horizon === y ? "halo-calc__horizon-btn--active" : ""}`}
                  >
                    {y} yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="halo-calc__results-grid">
            {HALO_SCENARIOS.map((s) => (
              <ScenarioCard key={s.key} scenario={s} pv={pv} horizon={horizon} />
            ))}
          </div>

          <div className="halo-calc__inflation-note">
            <strong>Inflation context: </strong>
            With around 3% annual inflation, {fmt(pv)} in a big bank savings account has the real purchasing power of <strong style={{ color: "var(--ink, #1a2030)", fontWeight: 500 }}>{fmt(realBankFV)}</strong> in today&apos;s dollars after {horizon} years, a real loss of {fmt(realLoss)}. <span style={{ cursor: "pointer", color: "#3B6D11", textDecoration: "underline" }} onClick={() => setActiveTab("glossary")}>What is purchasing power?</span>
          </div>

          <GrowthChart pv={pv} horizon={horizon} />

          <div className="halo-calc__legend">
            {HALO_SCENARIOS.map((s) => (
              <span key={s.key} className="halo-calc__legend-item">
                <span className="halo-calc__legend-swatch" style={{ background: s.color, height: s.highlight ? 3 : 2 }} />
                {s.label}
              </span>
            ))}
            <span className="halo-calc__legend-item">
              <span className="halo-calc__legend-swatch" style={{ background: "#c0392b", height: 1, opacity: 0.6 }} />
              Inflation baseline
            </span>
          </div>
        </>
      ) : null}

      {activeTab === "explained" ? (
        <div>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            The calculator compares five ways money can grow over time. Here is the plain-language meaning of each one.
          </p>
          {HALO_SCENARIOS.map((s) => (
            <ExplainerRow key={s.key} scenario={s} />
          ))}
        </div>
      ) : null}

      {activeTab === "differences" ? (
        <div className="table-wrap table-wrap--editorial table-wrap--compare">
          <div className="table-intro">
            <div>
              <div className="eyebrow">Differences at a glance</div>
              <h3>How the options differ</h3>
            </div>
            <p className="muted">This is a conceptual comparison for educational context, not a prediction.</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Big bank</th>
                <th>HYSA</th>
                <th>2y CD</th>
                <th>S&amp;P 500</th>
                <th>HALO+ESG</th>
              </tr>
            </thead>
            <tbody>
              {HALO_DIFFERENCES.map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td>{item.bank}</td>
                  <td>{item.hysa}</td>
                  <td>{item.cd}</td>
                  <td>{item.sp500}</td>
                  <td>{item.halo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {activeTab === "glossary" ? (
        <div>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            Key terms used in this calculator and across Responsible Wealth.
          </p>
          {HALO_GLOSSARY.map((g) => (
            <GlossaryItem key={g.term} term={g.term} definition={g.definition} />
          ))}
          <div style={{ marginTop: "1.5rem", fontSize: 13, color: "var(--muted, #8a9099)", lineHeight: 1.6 }}>
            For methodology detail, visit <a href="/method-and-purpose" style={{ color: "#3B6D11", textDecoration: "underline" }}>Method and Purpose</a>.
          </div>
        </div>
      ) : null}

      <p className="halo-calc__disclaimer">
        Historical rates are illustrative only. Big bank savings 0.4% APY, high-yield savings 4.5% APY, 2-year CD 4.7% APY, S&P 500 around 10% long-term average, HALO+ESG around 9% reference return, inflation estimate around 3% annual. Educational information only, not individualized investment advice.
      </p>
    </div>
  );
}
