import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import type { AuthTokenPayload } from "@komala/shared";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/employees", label: "Employees" },
  { href: "/dashboard/org-chart", label: "Org Chart" },
  { href: "/dashboard/offices", label: "Offices" },
  { href: "/dashboard/departments", label: "Departments" },
  { href: "/dashboard/attendance", label: "Attendance" },
  { href: "/dashboard/leave", label: "Leave" },
  { href: "/dashboard/reimbursement", label: "Reimbursement" },
  { href: "/dashboard/payroll", label: "Payroll" },
  { href: "/dashboard/settings/tax", label: "Tax Settings" },
];

export function DashboardNav({ session }: { session: AuthTokenPayload }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
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
          <Link href="/me" className="text-sm text-slate-500 hover:text-slate-800">
            My profile
          </Link>
          <span className="badge-slate">{session.role.replace("_", " ")}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
