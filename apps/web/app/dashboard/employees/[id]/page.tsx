import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateEmployee } from "@/lib/actions/employees";
import { EmployeeForm } from "@/components/EmployeeForm";

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!employee) notFound();

  const [departments, positions, offices, managers] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.position.findMany({ orderBy: { name: "asc" } }),
    prisma.office.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { id: { not: employee.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const boundAction = updateEmployee.bind(null, employee.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Edit {employee.name}</h1>
      <EmployeeForm
        mode="edit"
        action={boundAction}
        options={{ departments, positions, offices, managers }}
        initial={{
          name: employee.name,
          email: employee.user.email,
          role: employee.user.role,
          employeeCode: employee.employeeCode,
          nik: employee.nik,
          npwp: employee.npwp,
          ptkpStatus: employee.ptkpStatus,
          joinDate: employee.joinDate.toISOString().slice(0, 10),
          employmentType: employee.employmentType,
          riskClass: employee.riskClass,
          basicSalary: employee.basicSalary,
          bankName: employee.bankName,
          bankAccountNo: employee.bankAccountNo,
          departmentId: employee.departmentId,
          positionId: employee.positionId,
          officeId: employee.officeId,
          managerId: employee.managerId,
        }}
      />
    </div>
  );
}
