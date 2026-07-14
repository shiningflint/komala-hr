import { listAllAttendance } from "@/lib/services/attendance";
import { formatCalendarDate } from "@/lib/format";

function fmtTime(d: Date | null) {
  return d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date ? new Date(searchParams.date) : undefined;
  const records = await listAllAttendance({ date });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
        <form className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={searchParams.date ?? ""}
            className="input"
          />
          <button className="btn-secondary" type="submit">
            Filter
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Clock in</th>
              <th className="px-4 py-3">Geofence (in)</th>
              <th className="px-4 py-3">Clock out</th>
              <th className="px-4 py-3">Geofence (out)</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{r.employee.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatCalendarDate(r.date)}
                </td>
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
                <td className="px-4 py-3 text-slate-600">{fmtTime(r.clockInAt)}</td>
                <td className="px-4 py-3">
                  {r.clockInDistanceM != null ? (
                    <span className={r.clockInInsideGeofence ? "text-green-600" : "text-amber-600"}>
                      {Math.round(r.clockInDistanceM)}m
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{fmtTime(r.clockOutAt)}</td>
                <td className="px-4 py-3">
                  {r.clockOutDistanceM != null ? (
                    <span className={r.clockOutInsideGeofence ? "text-green-600" : "text-amber-600"}>
                      {Math.round(r.clockOutDistanceM)}m
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{r.clockInNote ?? r.clockOutNote ?? "—"}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  No attendance records for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
