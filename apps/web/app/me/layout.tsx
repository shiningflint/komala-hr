import { requireSession } from "@/lib/session";
import { EssNav } from "@/components/EssNav";

export default async function EssLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <div className="min-h-screen">
      <EssNav session={session} />
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
