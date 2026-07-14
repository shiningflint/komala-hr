import { requireSession } from "@/lib/session";
import { listMyPayslips } from "@/lib/services/payroll";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function MyPayslipsPage() {
  const session = await requireSession();
  const payslips = session.employeeId ? await listMyPayslips(session.employeeId) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">My Payslips</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">PPh21</th>
              <th className="px-4 py-3">Net pay</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {payslips.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {p.payrollPeriod.month}/{p.payrollPeriod.year}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatIDR(p.grossPay)}</td>
                <td className="px-4 py-3 text-slate-600">{formatIDR(p.pph21Monthly)}</td>
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
            {payslips.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No payslips yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
