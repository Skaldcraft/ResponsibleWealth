"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type PerformancePoint = {
  window: string;
  basket: number;
  benchmark: number;
  broaderHalo?: number;
};

type SectorPoint = {
  sector: string;
  count: number;
};

type ScorePoint = {
  label: string;
  value: number;
  fullMark: number;
};

const CHART_COLORS = {
  basket: "#2d6a4f",
  benchmark: "#7d5a11",
  broaderHalo: "#7d8f86",
  bars: ["#2d6a4f", "#4d7c61", "#7ba286", "#9bb8a0", "#bfd0bf", "#d7dfcf"]
};

function percentTick(value: number) {
  return `${value.toFixed(0)}%`;
}

function formatTooltipPercent(value: unknown) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : String(value ?? "");
}

function formatTooltipCount(value: unknown) {
  return typeof value === "number" ? [`${value}`, "Companies"] : [String(value ?? ""), "Companies"];
}

function formatTooltipScore(value: unknown) {
  return typeof value === "number" ? `${value}/5` : String(value ?? "");
}

function ChartFrame({ children, square = false }: { children: React.ReactNode; square?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`chart-area${square ? " chart-area--square" : ""}`} />;
  }

  return <div className={`chart-area${square ? " chart-area--square" : ""}`}>{children}</div>;
}

export function PerformanceComparisonChart({ data }: { data: PerformancePoint[] }) {
  return (
    <div className="chart-shell">
      <div className="eyebrow">Performance path</div>
      <h2>Basket vs benchmark</h2>
      <p className="muted">A medium-term comparison across the windows that matter most for this project.</p>
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#d5ccb9" strokeDasharray="3 3" />
            <XAxis axisLine={false} dataKey="window" tickLine={false} stroke="#50615a" />
            <YAxis axisLine={false} tickFormatter={percentTick} tickLine={false} stroke="#50615a" />
            <Tooltip
              contentStyle={{ background: "#fffaf2", border: "1px solid #d5ccb9", borderRadius: 16 }}
              formatter={formatTooltipPercent}
            />
            <Legend />
            <Line dataKey="basket" dot={{ r: 4 }} name="HALO ESG" stroke={CHART_COLORS.basket} strokeWidth={3} type="monotone" />
            <Line dataKey="benchmark" dot={{ r: 4 }} name="Benchmark" stroke={CHART_COLORS.benchmark} strokeWidth={2.5} type="monotone" />
            {data.some((item) => typeof item.broaderHalo === "number") ? (
              <Line dataKey="broaderHalo" dot={{ r: 3 }} name="Broader HALO" stroke={CHART_COLORS.broaderHalo} strokeWidth={2} type="monotone" />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

export function SectorCompositionChart({ data }: { data: SectorPoint[] }) {
  return (
    <div className="chart-shell">
      <div className="eyebrow">Composition</div>
      <h2>Sector spread</h2>
      <p className="muted">A quick way to see how the basket is distributed across utilities, water, rail, efficiency, and other durable themes.</p>
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="#e7ddca" />
            <XAxis allowDecimals={false} axisLine={false} tickLine={false} stroke="#50615a" type="number" />
            <YAxis axisLine={false} dataKey="sector" tickLine={false} stroke="#50615a" type="category" width={140} />
            <Tooltip
              contentStyle={{ background: "#fffaf2", border: "1px solid #d5ccb9", borderRadius: 16 }}
              formatter={formatTooltipCount}
            />
            <Bar dataKey="count" radius={[0, 12, 12, 0]}>
              {data.map((entry, index) => (
                <Cell fill={CHART_COLORS.bars[index % CHART_COLORS.bars.length]} key={entry.sector} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

export function CompanyScoreChart({ data }: { data: ScorePoint[] }) {
  return (
    <div className="chart-shell">
      <div className="eyebrow">Research profile</div>
      <h2>Score profile</h2>
      <p className="muted">A compact view of how the company currently scores across fit, ESG alignment, and medium-term relevance.</p>
      <ChartFrame square>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" data={data} outerRadius="72%">
            <PolarGrid stroke="#d5ccb9" />
            <PolarAngleAxis dataKey="label" stroke="#50615a" />
            <Tooltip
              contentStyle={{ background: "#fffaf2", border: "1px solid #d5ccb9", borderRadius: 16 }}
              formatter={formatTooltipScore}
            />
            <Radar dataKey="value" fill={CHART_COLORS.basket} fillOpacity={0.28} stroke={CHART_COLORS.basket} strokeWidth={2.5} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
