import { listAllLeaveRequests } from "@/lib/services/leave";
import { formatCalendarDate } from "@/lib/format";
import { decideLeaveRequestAction } from "@/lib/actions/leave";

export default async function AdminLeavePage() {
  const requests = await listAllLeaveRequests();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Leave requests</h1>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{r.employee.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.leaveType.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatCalendarDate(r.startDate)} – {formatCalendarDate(r.endDate)}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.daysCount}</td>
                <td className="px-4 py-3 text-slate-500">{r.reason}</td>
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
                <td className="px-4 py-3">
                  {r.status === "PENDING" && (
                    <div className="flex gap-2">
                      <form action={decideLeaveRequestAction.bind(null, r.id, true)}>
                        <button className="btn-primary px-3 py-1 text-xs">Approve</button>
                      </form>
                      <form action={decideLeaveRequestAction.bind(null, r.id, false)}>
                        <button className="btn-danger px-3 py-1 text-xs">Reject</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
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
