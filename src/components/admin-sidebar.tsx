import Link from "next/link";

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/companies">Companies</Link>
      <Link href="/admin/candidates">Candidates</Link>
      <Link href="/admin/news">News</Link>
      <Link href="/admin/reviews">Reviews</Link>
      <Link href="/admin/newsletters">Newsletters</Link>
      <Link href="/admin/resources">Resources</Link>
      <Link href="/admin/settings/providers">Providers</Link>
    </aside>
  );
}
