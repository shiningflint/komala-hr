import Link from "next/link";
import { listPayrollPeriods } from "@/lib/services/payroll";
import { createPayrollPeriodAction } from "@/lib/actions/payroll";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function PayrollPage() {
  const periods = await listPayrollPeriods();
  const now = new Date();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Payroll</h1>

      <div className="card max-w-md">
        <h2 className="mb-3 font-medium text-slate-900">Create payroll period</h2>
        <form action={createPayrollPeriodAction} className="flex items-end gap-3">
          <div>
            <label className="label">Month</label>
            <select name="month" className="input" defaultValue={now.getMonth() + 1}>
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <input name="year" type="number" className="input" defaultValue={now.getFullYear()} />
          </div>
          <button type="submit" className="btn-primary">
            Create
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-400">
          December periods automatically run the annual PPh21 true-up (progressive rates vs. TER
          withheld through November).
        </p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payslips</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {MONTH_NAMES[p.month - 1]} {p.year}
                </td>
                <td className="px-4 py-3">
                  <span className="badge-slate">{p.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{p._count.payslips}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/payroll/${p.id}`} className="text-brand-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {periods.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No payroll periods yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
