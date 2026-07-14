import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import type { AuthTokenPayload } from "@komala/shared";
import { isManagerOrAbove } from "@/lib/session";

const NAV_ITEMS = [
  { href: "/me", label: "Home" },
  { href: "/me/attendance", label: "Attendance" },
  { href: "/me/leave", label: "Leave" },
  { href: "/me/reimbursement", label: "Reimbursement" },
  { href: "/me/payslips", label: "Payslips" },
];

export function EssNav({ session }: { session: AuthTokenPayload }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <span className="text-lg font-semibold text-brand-800">Komala HR</span>
          <nav className="hidden gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isManagerOrAbove(session) && (
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
              Admin dashboard
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
