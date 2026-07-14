"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createPayrollPeriod, processPayrollPeriod, markPayrollPeriodPaid } from "@/lib/services/payroll";

export async function createPayrollPeriodAction(formData: FormData) {
  await requireAdmin();
  const company = await prisma.company.findFirstOrThrow();
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));

  const period = await createPayrollPeriod(company.id, year, month);
  revalidatePath("/dashboard/payroll");
  redirect(`/dashboard/payroll/${period.id}`);
}

export async function processPayrollPeriodAction(periodId: string) {
  await requireAdmin();
  await processPayrollPeriod(periodId);
  revalidatePath(`/dashboard/payroll/${periodId}`);
}

export async function markPayrollPeriodPaidAction(periodId: string) {
  await requireAdmin();
  await markPayrollPeriodPaid(periodId);
  revalidatePath(`/dashboard/payroll/${periodId}`);
}
