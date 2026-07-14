import { notFound } from "next/navigation";
import { getPayrollPeriod } from "@/lib/services/payroll";
import { processPayrollPeriodAction, markPayrollPeriodPaidAction } from "@/lib/actions/payroll";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function PayrollPeriodPage({ params }: { params: { periodId: string } }) {
  const period = await getPayrollPeriod(params.periodId);
  if (!period) notFound();

  const processAction = processPayrollPeriodAction.bind(null, period.id);
  const markPaidAction = markPayrollPeriodPaidAction.bind(null, period.id);

  const totals = period.payslips.reduce(
    (acc, p) => ({
      gross: acc.gross + p.grossPay,
      net: acc.net + p.netPay,
      pph21: acc.pph21 + (p.pph21TrueUp != null ? Math.max(0, p.pph21TrueUp) : p.pph21Monthly),
    }),
    { gross: 0, net: 0, pph21: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Payroll — {period.month}/{period.year}
          </h1>
          <span className="badge-slate mt-1 inline-block">{period.status}</span>
        </div>
        <div className="flex gap-2">
          {period.status === "DRAFT" && (
            <form action={processAction}>
              <button className="btn-primary">Run payroll</button>
            </form>
          )}
          {period.status === "PROCESSED" && (
            <form action={markPaidAction}>
              <button className="btn-primary">Mark as paid</button>
            </form>
          )}
        </div>
      </div>

      {period.month === 12 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          December period: PPh21 is recalculated using progressive annual rates and reconciled against
          TER withheld earlier in the year (true-up shown per employee below).
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs text-slate-500">Total gross</p>
          <p className="mt-1 text-xl font-semibold text-brand-800">{formatIDR(totals.gross)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Total PPh21 withheld</p>
          <p className="mt-1 text-xl font-semibold text-brand-800">{formatIDR(totals.pph21)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Total net pay</p>
          <p className="mt-1 text-xl font-semibold text-brand-800">{formatIDR(totals.net)}</p>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">TER</th>
              <th className="px-4 py-3">PPh21</th>
              <th className="px-4 py-3">BPJS (employee)</th>
              <th className="px-4 py-3">Net pay</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {period.payslips.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{p.employee.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatIDR(p.grossPay)}</td>
                <td className="px-4 py-3">
                  <span className="badge-slate">{p.terCategory ?? "—"}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatIDR(p.pph21Monthly)}
                  {p.pph21TrueUp != null && (
                    <span className="ml-1 text-xs text-amber-600">
                      ({p.pph21TrueUp >= 0 ? "+" : ""}
                      {formatIDR(p.pph21TrueUp)} true-up)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatIDR(p.bpjsKesehatanEmployee + p.bpjsJhtEmployee + p.bpjsJpEmployee)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{formatIDR(p.netPay)}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/api/payslips/${p.id}/pdf`}
                    target="_blank"
                    className="text-brand-600 hover:underline"
                  >
                    View PDF
                  </a>
                </td>
              </tr>
            ))}
            {period.payslips.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Not processed yet — click &quot;Run payroll&quot; to generate payslips.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
