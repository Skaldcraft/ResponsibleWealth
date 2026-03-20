import { AdminSidebar } from "@/components/admin-sidebar";
import { requireAdminSession } from "@/lib/server/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div>{children}</div>
    </div>
  );
}
