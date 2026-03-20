import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="brand" href="/">
          <strong>Responsible Wealth</strong>
          <span>Responsible, medium-term investment research</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/halo-esg">Index</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/methodology">Our Approach</Link>
          <Link href="/changes">Recent changes</Link>
          <Link href="/sources">Sources</Link>
          <Link href="/newsletter">Newsletter</Link>
          <Link href="/resources">Resources</Link>
        </nav>
      </div>
    </header>
  );
}
