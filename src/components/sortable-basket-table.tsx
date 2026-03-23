"use client";

import Link from "next/link";
import { formatPercent } from "@/lib/utils";

type CompanyRow = {
  ticker: string;
  name: string;
  sector: string;
  esgCategory: string;
  snapshot: {
    currency: string;
    closePrice: number;
    dayChangePct: number;
    monthReturnPct: number;
    oneYearReturnPct: number;
  };
};

function SortIcon({ active, order }: { active: boolean; order?: "asc" | "desc" }) {
  const direction = active ? order : "asc";
  return (
    <span className={`sort-icon ${active ? "sort-icon--active" : ""}`} aria-hidden="true">
      {direction === "desc" ? "▼" : "▲"}
    </span>
  );
}

export function SortableBasketTable({ 
  companies, 
  activeSort, 
  activeOrder 
}: { 
  companies: CompanyRow[];
  activeSort?: "name" | "price";
  activeOrder?: "asc" | "desc";
}) {
  // Helper to get the correct link for a header
  const getSortLink = (key: "name" | "price") => {
    const isCurrent = activeSort === key;
    let newOrder: "asc" | "desc" = "asc";
    
    if (isCurrent) {
      newOrder = activeOrder === "asc" ? "desc" : "asc";
    } else if (key === "price") {
      // Default price to high-to-low (desc) as requested
      newOrder = "desc";
    }
    
    return `/?sort=${key}&order=${newOrder}`;
  };

  return (
    <table>
      <thead>
        <tr>
          <th className="sortable-th">
            <Link href={getSortLink("name")} className="th-content">
              Company
              <SortIcon active={activeSort === "name"} order={activeOrder} />
            </Link>
          </th>
          <th>Ticker</th>
          <th>Sector</th>
          <th className="sortable-th">
            <Link href={getSortLink("price")} className="th-content">
              Price
              <SortIcon active={activeSort === "price"} order={activeOrder} />
            </Link>
          </th>
          <th>1 MONTH</th>
          <th>1 YEAR</th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company) => (
          <tr key={company.ticker}>
            <td>{company.name}</td>
            <td>
              <Link href={`/companies/${company.ticker.toLowerCase()}`}>
                {company.ticker}
              </Link>
            </td>
            <td>{company.sector}</td>
            <td>
              {company.snapshot.currency} {company.snapshot.closePrice}
            </td>
            <td>{formatPercent(company.snapshot.monthReturnPct)}</td>
            <td>{formatPercent(company.snapshot.oneYearReturnPct)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
