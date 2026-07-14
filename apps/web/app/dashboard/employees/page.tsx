import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: { department: true, position: true, user: true },
    orderBy: { employeeCode: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">{employees.length} total</p>
        </div>
        <Link href="/dashboard/employees/new" className="btn-primary">
          + Add employee
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">PTKP</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{e.employeeCode}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{e.name}</td>
                <td className="px-4 py-3 text-slate-600">{e.department?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{e.position?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="badge-slate">{e.ptkpStatus}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{e.user.role.replace("_", " ")}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/employees/${e.id}`} className="text-brand-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
