import { requireSession } from "@/lib/session";
import { listMyReimbursements } from "@/lib/services/reimbursement";
import { submitReimbursementClaim } from "@/lib/actions/reimbursement";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function MyReimbursementPage() {
  const session = await requireSession();
  const claims = session.employeeId ? await listMyReimbursements(session.employeeId) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Reimbursement</h1>

      <div className="card max-w-xl">
        <h2 className="mb-3 font-medium text-slate-900">Submit a claim</h2>
        <form action={submitReimbursementClaim} className="space-y-4">
          <div>
            <label className="label">Category</label>
            <input name="category" className="input" placeholder="Transport, Client Entertainment, ..." required />
          </div>
          <div>
            <label className="label">Amount (Rp)</label>
            <input name="amount" type="number" className="input" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" className="input" rows={2} required />
          </div>
          <div>
            <label className="label">Receipt URL (optional)</label>
            <input name="receiptUrl" className="input" placeholder="Link to scanned receipt" />
          </div>
          <button type="submit" className="btn-primary">
            Submit claim
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-900">{c.category}</td>
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
                <td className="px-4 py-3 text-slate-500">{c.approverNote ?? "—"}</td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
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
