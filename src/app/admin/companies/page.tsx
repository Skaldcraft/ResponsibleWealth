import { createCompanyAction } from "@/app/admin/companies/actions";
import Link from "next/link";
import { getAllCompanies } from "@/lib/server/repository";

export default async function AdminCompaniesPage() {
  const companies = await getAllCompanies();
  return (
    <div className="section">
      <section className="admin-panel"><div className="eyebrow">Companies</div><h1>Company records</h1></section>
      <form className="admin-panel stack-form" action={createCompanyAction}>
        <h2>Add candidate company</h2>
        <label>Ticker<input name="ticker" required /></label>
        <label>Slug<input name="slug" required /></label>
        <label>Name<input name="name" required /></label>
        <label>Exchange<input name="exchange" defaultValue="NYSE" /></label>
        <label>Country<input name="country" defaultValue="United States" /></label>
        <label>Sector<input name="sector" required /></label>
        <label>Short description<input name="shortDescription" required /></label>
        <label>HALO fit (1-5)<input name="haloFit" type="number" min="1" max="5" defaultValue="3" /></label>
        <label>ESG fit (1-5)<input name="esgFit" type="number" min="1" max="5" defaultValue="3" /></label>
        <label>Medium-term score (1-5)<input name="mediumTermScore" type="number" min="1" max="5" defaultValue="3" /></label>
        <button type="submit">Create candidate</button>
      </form>
      <section className="table-wrap">
        <table>
          <thead><tr><th>Ticker</th><th>Name</th><th>Lifecycle</th><th>Basket</th><th>ESG</th><th>Sector</th></tr></thead>
          <tbody>{companies.map((company: { ticker: string; name: string; lifecycleStatus: string; basketStatus: string; esgCategory: string; sector: string }) => <tr key={company.ticker}><td><Link href={`/admin/companies/${company.ticker.toLowerCase()}`}>{company.ticker}</Link></td><td>{company.name}</td><td>{company.lifecycleStatus}</td><td>{company.basketStatus}</td><td>{company.esgCategory}</td><td>{company.sector}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
