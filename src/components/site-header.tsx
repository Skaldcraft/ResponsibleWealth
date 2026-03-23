import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <div className="brand-group">
          <Link className="brand" href="/">
            <strong>Responsible Wealth</strong>
            <span>Responsible, medium-term investment research</span>
          </Link>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/compare">Compare</Link>
          <Link href="/changes">Recent changes</Link>
          <Link href="/method-and-purpose">Method and Purpose</Link>
          <Link href="/newsletter">Newsletter</Link>
          <Link href="/sources">Company profiles</Link>
          <Link href="/resources">Resources</Link>
        </nav>
      </div>
    </header>
  );
}
