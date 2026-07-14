import { listAllReimbursements } from "@/lib/services/reimbursement";
import { decideReimbursementAction } from "@/lib/actions/reimbursement";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function AdminReimbursementPage() {
  const claims = await listAllReimbursements();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Reimbursement claims</h1>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{c.employee.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.category}</td>
                <td className="px-4 py-3 text-slate-600">{formatIDR(c.amount)}</td>
                <td className="px-4 py-3 text-slate-500">{c.description}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      c.status === "APPROVED"
                        ? "badge-green"
                        : c.status === "REJECTED"
                        ? "badge-red"
                        : "badge-yellow"
                    }
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.status === "PENDING" && (
                    <div className="flex gap-2">
                      <form action={decideReimbursementAction.bind(null, c.id, true)}>
                        <button className="btn-primary px-3 py-1 text-xs">Approve</button>
                      </form>
                      <form action={decideReimbursementAction.bind(null, c.id, false)}>
                        <button className="btn-danger px-3 py-1 text-xs">Reject</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No reimbursement claims yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
