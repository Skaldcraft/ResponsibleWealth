import { triggerMarketSyncAction } from "@/app/admin/actions";
import { getBasketOverview, getNewsletterArchive } from "@/lib/server/repository";
import { getLatestSyncHealth } from "@/lib/server/sync-health";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const overview = await getBasketOverview();
  const archive = await getNewsletterArchive({ includeDrafts: true });
  const provider = process.env.MARKET_DATA_PROVIDER ?? "demo-seed";
  const syncHealth = await getLatestSyncHealth();

  return (
    <div className="section">
      <section className="admin-panel"><div className="eyebrow">Dashboard</div><h1>Operations overview</h1><p className="muted">The MVP admin area is designed for operators managing content, source transparency, and the newsletter pipeline.</p></section>
      <section className="grid-3">
        <div className="admin-panel stat"><span>Tracked companies</span><strong>{overview.companies.length}</strong></div>
        <div className="admin-panel stat"><span>Latest newsletter issue</span><strong>{archive[0]?.title ?? "None"}</strong></div>
        <div className="admin-panel stat"><span>Market sync provider</span><strong>{provider}</strong></div>
      </section>
      <form action={triggerMarketSyncAction}>
        <button type="submit">Run market and news sync</button>
      </form>
      <section className="grid-2">
        <div className="admin-panel">
          <div className="eyebrow">Market sync</div>
          <h2>Latest price refresh</h2>
          {syncHealth.market ? (
            <>
              <p className="muted">Last run: {formatDate(syncHealth.market.syncedAt)} · Status: {syncHealth.market.status}</p>
              <p className="muted">Companies updated: {syncHealth.market.companyCount}</p>
              {syncHealth.market.failures.length ? (
                <>
                  <h3>Failed symbols</h3>
                  <ul className="plain-list">
                    {syncHealth.market.failures.map((failure) => <li key={failure}>{failure}</li>)}
                  </ul>
                </>
              ) : <p className="muted">No market source failures were recorded on the last run.</p>}
            </>
          ) : <p className="muted">No market sync has been recorded yet.</p>}
        </div>
        <div className="admin-panel">
          <div className="eyebrow">News collector</div>
          <h2>Latest source health</h2>
          {syncHealth.news ? (
            <>
              <p className="muted">Last run: {formatDate(syncHealth.news.syncedAt)}</p>
              <p className="muted">Created {syncHealth.news.created} new items from {syncHealth.news.collected} collected candidates.</p>
              <p className="muted">API: {syncHealth.news.apiCount} · Feeds: {syncHealth.news.feedCount} · Pages: {syncHealth.news.pageCount}</p>
              {syncHealth.news.sourceFailures.length ? (
                <>
                  <h3>Sources that failed last run</h3>
                  <ul className="plain-list">
                    {syncHealth.news.sourceFailures.map((failure) => <li key={failure}>{failure}</li>)}
                  </ul>
                </>
              ) : <p className="muted">No feed or page failures were recorded on the last run.</p>}
            </>
          ) : <p className="muted">No news collection run has been recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}
