import { getBasketOverview } from "@/lib/server/repository";

export default async function AdminReviewsPage() {
  const companies = (await getBasketOverview()).companies;
  return (
    <div className="section">
      <section className="admin-panel"><div className="eyebrow">Reviews</div><h1>Review log overview</h1></section>
      <section className="grid-2">{companies.slice(0, 6).map((company: { ticker: string; name: string; reviews: Array<{ summary: string }> }) => <div className="admin-panel" key={company.ticker}><h2>{company.name}</h2><p className="muted">{company.reviews[0]?.summary}</p></div>)}</section>
    </div>
  );
}
