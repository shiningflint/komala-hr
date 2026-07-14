import { prisma } from "@/lib/prisma";
import { createDepartment, createPosition } from "@/lib/actions/org";

export default async function DepartmentsPage() {
  const [departments, positions] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.position.findMany({ include: { department: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Departments &amp; Positions</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-medium text-slate-900">Departments</h2>
          <ul className="mb-4 divide-y divide-slate-100">
            {departments.map((d) => (
              <li key={d.id} className="py-2 text-sm text-slate-700">
                {d.name}
              </li>
            ))}
          </ul>
          <form action={createDepartment} className="flex gap-2">
            <input name="name" className="input" placeholder="New department name" required />
            <button type="submit" className="btn-secondary shrink-0">
              Add
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="mb-3 font-medium text-slate-900">Positions</h2>
          <ul className="mb-4 divide-y divide-slate-100">
            {positions.map((p) => (
              <li key={p.id} className="py-2 text-sm text-slate-700">
                {p.name}{" "}
                {p.department && <span className="text-xs text-slate-400">— {p.department.name}</span>}
              </li>
            ))}
          </ul>
          <form action={createPosition} className="space-y-2">
            <input name="name" className="input" placeholder="New position name" required />
            <select name="departmentId" className="input">
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-secondary w-full">
              Add position
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
