import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div className="site-footer__note muted">
          Responsible Wealth is an informational research platform. Nothing on this site constitutes personalized investment advice or a recommendation to buy, sell, or hold any security.
        </div>
        <div className="footer-links">
          <Link href="/legal/disclaimer">Disclaimer</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/affiliate-disclosure">Affiliate disclosure</Link>
          <Link href="/admin/login">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
