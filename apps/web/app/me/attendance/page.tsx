import { requireSession } from "@/lib/session";
import { listAttendanceHistory } from "@/lib/services/attendance";
import { formatCalendarDate } from "@/lib/format";

function fmtTime(d: Date | null) {
  return d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}

export default async function MyAttendancePage() {
  const session = await requireSession();
  const records = session.employeeId ? await listAttendanceHistory(session.employeeId, 60) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">My Attendance</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Clock in</th>
              <th className="px-4 py-3">Clock out</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-600">{formatCalendarDate(r.date)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.status === "LATE"
                        ? "badge-yellow"
                        : r.status === "ABSENT"
                        ? "badge-red"
                        : "badge-green"
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {fmtTime(r.clockInAt)}
                  {r.clockInInsideGeofence === false && (
                    <span className="ml-2 text-xs text-amber-600">outside geofence</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {fmtTime(r.clockOutAt)}
                  {r.clockOutInsideGeofence === false && (
                    <span className="ml-2 text-xs text-amber-600">outside geofence</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{r.clockInNote ?? r.clockOutNote ?? "—"}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
