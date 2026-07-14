import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ClockCard } from "@/components/ClockCard";

export default async function EssHomePage() {
  const session = await requireSession();
  const employee = session.employeeId
    ? await prisma.employee.findUnique({
        where: { id: session.employeeId },
        include: { department: true, position: true, office: true, manager: true },
      })
    : null;

  if (!employee) {
    return <p className="text-sm text-slate-500">No employee record linked to this account.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Hi, {employee.name.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">
            {employee.position?.name ?? "—"} · {employee.department?.name ?? "—"} · {employee.employeeCode}
          </p>
        </div>
        <span className="badge-slate">{session.role.replace("_", " ")}</span>
      </div>

      <ClockCard office={employee.office} />
    </div>
  );
}
