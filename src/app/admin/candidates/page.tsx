import Link from "next/link";
import { getCompanyLifecycleGroups } from "@/lib/server/repository";
import { formatPercent } from "@/lib/utils";

function CompanyTable({
  title,
  description,
  companies
}: {
  title: string;
  description: string;
  companies: Array<{ ticker: string; name: string; sector: string; esgCategory: string; monthReturnPct: number | null }>;
}) {
  return (
    <section className="admin-panel">
      <div className="eyebrow">{title}</div>
      <p className="muted">{description}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th>Sector</th>
              <th>ESG</th>
              <th>1M</th>
            </tr>
          </thead>
          <tbody>
            {companies.length ? companies.map((company) => (
              <tr key={company.ticker}>
                <td>
                  <Link href={`/admin/companies/${company.ticker.toLowerCase()}`}>{company.ticker}</Link>
                </td>
                <td>{company.name}</td>
                <td>{company.sector}</td>
                <td>{company.esgCategory}</td>
                <td>{formatPercent(company.monthReturnPct ?? 0)}</td>
              </tr>
            )) : <tr><td colSpan={5}>No companies in this state yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function AdminCandidatesPage() {
  const groups = await getCompanyLifecycleGroups();

  return (
    <div className="section">
      <section className="admin-panel">
        <div className="eyebrow">Candidates</div>
        <h1>Rolling-selection workflow</h1>
        <p className="muted">
          This dashboard helps keep the basket flexible. Add candidate names, move them into review, promote them to active membership, or retire them when the medium-term case weakens.
        </p>
      </section>

      <CompanyTable title="Candidates" description="Early-stage ideas that seem directionally interesting but are not ready for inclusion." companies={groups.candidates} />
      <CompanyTable title="Under review" description="Names that are being actively reassessed before entering or leaving the public basket." companies={groups.underReview} />
      <CompanyTable title="Active basket members" description="Current public-basket constituents." companies={groups.active} />
      <CompanyTable title="Removed or archived" description="Former names retained for historical context and methodology transparency." companies={groups.removed} />
    </div>
  );
}
