import { notFound } from "next/navigation";
import { addEditorialUpdateAction, updateCompanyAction } from "@/app/admin/companies/actions";
import { getCompanyByTicker } from "@/lib/server/repository";

export default async function AdminCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompanyByTicker(id);
  if (!company) notFound();

  return (
    <div className="section">
      <section className="admin-panel"><div className="eyebrow">{company.ticker}</div><h1>{company.name}</h1><p className="muted">This MVP admin detail view is read-oriented and can be expanded into editable forms in the next pass.</p></section>
      <section className="grid-2">
        <form className="admin-panel stack-form" action={updateCompanyAction.bind(null, company.id)}>
          <h2>Edit company record</h2>
          <input type="hidden" name="ticker" value={company.ticker.toLowerCase()} />
          <label>Name<input name="name" defaultValue={company.name} /></label>
          <label>Sector<input name="sector" defaultValue={company.sector} /></label>
          <label>Short description<input name="shortDescription" defaultValue={company.shortDescription} /></label>
          <label>Lifecycle status<input name="lifecycleStatus" defaultValue={company.lifecycleStatus} /></label>
          <label>ESG category<input name="esgCategory" defaultValue={company.esgCategory} /></label>
          <label>HALO fit (1-5)<input name="haloFit" type="number" min="1" max="5" defaultValue={company.haloFit} /></label>
          <label>ESG fit (1-5)<input name="esgFit" type="number" min="1" max="5" defaultValue={company.esgFit} /></label>
          <label>Medium-term score (1-5)<input name="mediumTermScore" type="number" min="1" max="5" defaultValue={company.mediumTermScore} /></label>
          <label>Include in public basket?<input name="inBasket" defaultValue={company.lifecycleStatus === "active" ? "yes" : "no"} /></label>
          <label>Rationale short<input name="rationaleShort" defaultValue={company.rationaleShort} /></label>
          <label>Rationale long<input name="rationaleLong" defaultValue={company.rationaleLong} /></label>
          <label>Strengths<input name="strengths" defaultValue={company.strengths} /></label>
          <label>Concerns<input name="concerns" defaultValue={company.concerns} /></label>
          <button type="submit">Save company changes</button>
        </form>
        <form className="admin-panel stack-form" action={addEditorialUpdateAction.bind(null, company.id)}>
          <h2>Add published update</h2>
          <input type="hidden" name="ticker" value={company.ticker.toLowerCase()} />
          <label>Title<input name="title" defaultValue={`${company.name} update`} /></label>
          <label>Summary<input name="summary" /></label>
          <label>Body<textarea name="body" /></label>
          <button type="submit">Publish update</button>
        </form>
      </section>
    </div>
  );
}
