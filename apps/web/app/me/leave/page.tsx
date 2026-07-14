import { requireSession } from "@/lib/session";
import { listLeaveTypes, listLeaveBalances, listMyLeaveRequests } from "@/lib/services/leave";
import { submitLeaveRequest } from "@/lib/actions/leave";
import { formatCalendarDate } from "@/lib/format";

export default async function MyLeavePage() {
  const session = await requireSession();
  const employeeId = session.employeeId!;
  const year = new Date().getFullYear();

  const [types, balances, requests] = await Promise.all([
    listLeaveTypes(),
    listLeaveBalances(employeeId, year),
    listMyLeaveRequests(employeeId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Leave</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {balances.map((b) => (
          <div key={b.id} className="card">
            <p className="text-xs text-slate-500">{b.leaveType.name}</p>
            <p className="mt-1 text-xl font-semibold text-brand-800">
              {b.allocatedDays - b.usedDays}
              <span className="text-sm font-normal text-slate-400"> / {b.allocatedDays} days left</span>
            </p>
          </div>
        ))}
      </div>

      <div className="card max-w-xl">
        <h2 className="mb-3 font-medium text-slate-900">Request leave</h2>
        <form action={submitLeaveRequest} className="space-y-4">
          <div>
            <label className="label">Leave type</label>
            <select name="leaveTypeId" className="input" required>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start date</label>
              <input name="startDate" type="date" className="input" required />
            </div>
            <div>
              <label className="label">End date</label>
              <input name="endDate" type="date" className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea name="reason" className="input" rows={2} required />
          </div>
          <button type="submit" className="btn-primary">
            Submit request
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Approver note</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-900">{r.leaveType.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatCalendarDate(r.startDate)} – {formatCalendarDate(r.endDate)}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.daysCount}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.status === "APPROVED"
                        ? "badge-green"
                        : r.status === "REJECTED"
                        ? "badge-red"
                        : "badge-yellow"
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{r.approverNote ?? "—"}</td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No leave requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
