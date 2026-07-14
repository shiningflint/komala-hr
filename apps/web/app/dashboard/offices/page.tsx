import { prisma } from "@/lib/prisma";
import { createOffice } from "@/lib/actions/org";

export default async function OfficesPage() {
  const offices = await prisma.office.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Offices</h1>
      <p className="-mt-4 text-sm text-slate-500">
        Each office has a geofence (lat/lng + radius) that employee check-ins are validated against.
      </p>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Coordinates</th>
              <th className="px-4 py-3">Geofence radius</th>
            </tr>
          </thead>
          <tbody>
            {offices.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{o.name}</td>
                <td className="px-4 py-3 text-slate-600">{o.address ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {o.latitude.toFixed(5)}, {o.longitude.toFixed(5)}
                </td>
                <td className="px-4 py-3 text-slate-600">{o.radiusMeters}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card max-w-xl">
        <h2 className="mb-3 font-medium text-slate-900">Add office</h2>
        <form action={createOffice} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="label">Address</label>
            <input name="address" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input name="latitude" type="number" step="any" className="input" required />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input name="longitude" type="number" step="any" className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Geofence radius (meters)</label>
            <input name="radiusMeters" type="number" defaultValue={100} className="input" required />
          </div>
          <button type="submit" className="btn-primary">
            Add office
          </button>
        </form>
      </div>
    </div>
  );
}
