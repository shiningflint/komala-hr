import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardOverviewPage() {
  const [employeeCount, pendingLeave, pendingReimbursement, latestPeriod] = await Promise.all([
    prisma.employee.count(),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.reimbursementClaim.count({ where: { status: "PENDING" } }),
    prisma.payrollPeriod.findFirst({ orderBy: [{ year: "desc" }, { month: "desc" }] }),
  ]);

  const stats = [
    { label: "Employees", value: employeeCount, href: "/dashboard/employees" },
    { label: "Pending leave requests", value: pendingLeave, href: "/dashboard/leave" },
    { label: "Pending reimbursements", value: pendingReimbursement, href: "/dashboard/reimbursement" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">PT Komala Indonesia — HR &amp; payroll snapshot</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card block hover:border-brand-300">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-brand-800">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-3 font-medium text-slate-900">Latest payroll period</h2>
        {latestPeriod ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {latestPeriod.month}/{latestPeriod.year} — <span className="badge-slate">{latestPeriod.status}</span>
            </p>
            <Link href={`/dashboard/payroll/${latestPeriod.id}`} className="btn-secondary text-sm">
              View
            </Link>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No payroll periods yet.</p>
        )}
      </div>
    </div>
  );
}
