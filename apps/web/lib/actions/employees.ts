"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { employeeSchema } from "@komala/shared";

const DEFAULT_NEW_EMPLOYEE_PASSWORD = "Komala123!";

function readEmployeeForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? "") || undefined,
    role: String(formData.get("role") ?? "EMPLOYEE") as any,
    employeeCode: String(formData.get("employeeCode") ?? ""),
    nik: String(formData.get("nik") ?? ""),
    npwp: String(formData.get("npwp") ?? "") || null,
    ptkpStatus: String(formData.get("ptkpStatus") ?? "TK0") as any,
    joinDate: String(formData.get("joinDate") ?? new Date().toISOString().slice(0, 10)),
    employmentType: String(formData.get("employmentType") ?? "PERMANENT") as any,
    riskClass: String(formData.get("riskClass") ?? "LOW") as any,
    basicSalary: Number(formData.get("basicSalary") ?? 0),
    bankName: String(formData.get("bankName") ?? "") || null,
    bankAccountNo: String(formData.get("bankAccountNo") ?? "") || null,
    departmentId: String(formData.get("departmentId") ?? "") || null,
    positionId: String(formData.get("positionId") ?? "") || null,
    officeId: String(formData.get("officeId") ?? "") || null,
    managerId: String(formData.get("managerId") ?? "") || null,
  };
}

export async function createEmployee(formData: FormData) {
  await requireAdmin();
  const parsed = employeeSchema.parse(readEmployeeForm(formData));

  const passwordHash = await bcrypt.hash(parsed.password ?? DEFAULT_NEW_EMPLOYEE_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: parsed.email, passwordHash, role: parsed.role },
    });
    await tx.employee.create({
      data: {
        userId: user.id,
        employeeCode: parsed.employeeCode,
        name: parsed.name,
        nik: parsed.nik,
        npwp: parsed.npwp,
        ptkpStatus: parsed.ptkpStatus,
        joinDate: parsed.joinDate,
        employmentType: parsed.employmentType,
        riskClass: parsed.riskClass,
        basicSalary: parsed.basicSalary,
        bankName: parsed.bankName,
        bankAccountNo: parsed.bankAccountNo,
        departmentId: parsed.departmentId,
        positionId: parsed.positionId,
        officeId: parsed.officeId,
        managerId: parsed.managerId,
      },
    });
  });

  revalidatePath("/dashboard/employees");
  redirect("/dashboard/employees");
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  await requireAdmin();
  const raw = readEmployeeForm(formData);
  const parsed = employeeSchema.omit({ password: true }).parse(raw);

  const employee = await prisma.employee.findUniqueOrThrow({ where: { id: employeeId } });

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: employee.userId },
      data: { email: parsed.email, role: parsed.role },
    });
    await tx.employee.update({
      where: { id: employeeId },
      data: {
        employeeCode: parsed.employeeCode,
        name: parsed.name,
        nik: parsed.nik,
        npwp: parsed.npwp,
        ptkpStatus: parsed.ptkpStatus,
        joinDate: parsed.joinDate,
        employmentType: parsed.employmentType,
        riskClass: parsed.riskClass,
        basicSalary: parsed.basicSalary,
        bankName: parsed.bankName,
        bankAccountNo: parsed.bankAccountNo,
        departmentId: parsed.departmentId,
        positionId: parsed.positionId,
        officeId: parsed.officeId,
        managerId: parsed.managerId,
      },
    });
  });

  revalidatePath("/dashboard/employees");
  revalidatePath(`/dashboard/employees/${employeeId}`);
  redirect("/dashboard/employees");
}
