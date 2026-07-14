import { requireManagerOrAbove } from "@/lib/session";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireManagerOrAbove();
  return (
    <div className="min-h-screen">
      <DashboardNav session={session} />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
