import { prisma } from "@/lib/prisma";
import { createEmployee } from "@/lib/actions/employees";
import { EmployeeForm } from "@/components/EmployeeForm";

export default async function NewEmployeePage() {
  const [departments, positions, offices, managers] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.position.findMany({ orderBy: { name: "asc" } }),
    prisma.office.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Add employee</h1>
      <EmployeeForm
        mode="create"
        action={createEmployee}
        options={{ departments, positions, offices, managers }}
      />
    </div>
  );
}
