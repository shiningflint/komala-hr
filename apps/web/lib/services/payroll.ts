import { prisma } from "@/lib/prisma";
import { calcPayslip, type PTKPStatus, type RiskClass } from "@komala/shared";
import { getTaxSettingsForYear } from "@/lib/services/tax-settings";

export async function listPayrollPeriods() {
  return prisma.payrollPeriod.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { _count: { select: { payslips: true } } },
  });
}

export async function getPayrollPeriod(periodId: string) {
  return prisma.payrollPeriod.findUnique({
    where: { id: periodId },
    include: {
      payslips: {
        include: { employee: true },
        orderBy: { employee: { employeeCode: "asc" } },
      },
    },
  });
}

export async function createPayrollPeriod(companyId: string, year: number, month: number) {
  return prisma.payrollPeriod.create({ data: { companyId, year, month, status: "DRAFT" } });
}

async function getYearToDate(employeeId: string, year: number, beforeMonth: number) {
  const priorPayslips = await prisma.payslip.findMany({
    where: {
      employeeId,
      payrollPeriod: { year, month: { lt: beforeMonth } },
    },
  });
  return priorPayslips.reduce(
    (acc, p) => ({
      grossIncome: acc.grossIncome + p.grossPay,
      pph21Withheld: acc.pph21Withheld + p.pph21Monthly,
      employeeBpjsContributions:
        acc.employeeBpjsContributions + p.bpjsKesehatanEmployee + p.bpjsJhtEmployee + p.bpjsJpEmployee,
    }),
    { grossIncome: 0, pph21Withheld: 0, employeeBpjsContributions: 0 }
  );
}

export async function processPayrollPeriod(periodId: string) {
  const period = await prisma.payrollPeriod.findUniqueOrThrow({ where: { id: periodId } });
  if (period.status !== "DRAFT") throw new Error("Only draft periods can be processed");

  const taxSettings = await getTaxSettingsForYear(period.year);
  const employees = await prisma.employee.findMany();
  const isDecember = period.month === 12;

  await prisma.$transaction(async (tx) => {
    for (const employee of employees) {
      const yearToDate = isDecember
        ? await getYearToDate(employee.id, period.year, period.month)
        : undefined;

      const result = calcPayslip(taxSettings, {
        basicSalary: employee.basicSalary,
        allowances: 0,
        overtimePay: 0,
        ptkpStatus: employee.ptkpStatus as PTKPStatus,
        riskClass: employee.riskClass as RiskClass,
        isDecemberOrFinalMonth: isDecember,
        yearToDate,
      });

      await tx.payslip.upsert({
        where: { payrollPeriodId_employeeId: { payrollPeriodId: periodId, employeeId: employee.id } },
        create: {
          payrollPeriodId: periodId,
          employeeId: employee.id,
          basicSalary: employee.basicSalary,
          allowances: 0,
          overtimePay: 0,
          grossPay: result.grossPay,
          bpjsKesehatanEmployee: result.bpjsKesehatanEmployee,
          bpjsKesehatanCompany: result.bpjsKesehatanCompany,
          bpjsJhtEmployee: result.bpjsJhtEmployee,
          bpjsJhtCompany: result.bpjsJhtCompany,
          bpjsJpEmployee: result.bpjsJpEmployee,
          bpjsJpCompany: result.bpjsJpCompany,
          bpjsJkk: result.bpjsJkk,
          bpjsJkm: result.bpjsJkm,
          terCategory: result.terCategory,
          pph21Monthly: result.pph21Monthly,
          pph21Annual: result.pph21Annual,
          pph21AlreadyWithheld: result.pph21AlreadyWithheld,
          pph21TrueUp: result.pph21TrueUp,
          netPay: result.netPay,
          calculationSnapshot: JSON.stringify(result.snapshot),
        },
        update: {
          basicSalary: employee.basicSalary,
          grossPay: result.grossPay,
          bpjsKesehatanEmployee: result.bpjsKesehatanEmployee,
          bpjsKesehatanCompany: result.bpjsKesehatanCompany,
          bpjsJhtEmployee: result.bpjsJhtEmployee,
          bpjsJhtCompany: result.bpjsJhtCompany,
          bpjsJpEmployee: result.bpjsJpEmployee,
          bpjsJpCompany: result.bpjsJpCompany,
          bpjsJkk: result.bpjsJkk,
          bpjsJkm: result.bpjsJkm,
          terCategory: result.terCategory,
          pph21Monthly: result.pph21Monthly,
          pph21Annual: result.pph21Annual,
          pph21AlreadyWithheld: result.pph21AlreadyWithheld,
          pph21TrueUp: result.pph21TrueUp,
          netPay: result.netPay,
          calculationSnapshot: JSON.stringify(result.snapshot),
        },
      });
    }

    await tx.payrollPeriod.update({
      where: { id: periodId },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
  });
}

export async function markPayrollPeriodPaid(periodId: string) {
  const period = await prisma.payrollPeriod.findUniqueOrThrow({ where: { id: periodId } });
  if (period.status !== "PROCESSED") throw new Error("Only processed periods can be marked paid");
  await prisma.payrollPeriod.update({ where: { id: periodId }, data: { status: "PAID", paidAt: new Date() } });
}

export async function listMyPayslips(employeeId: string) {
  return prisma.payslip.findMany({
    where: { employeeId },
    include: { payrollPeriod: true },
    orderBy: [{ payrollPeriod: { year: "desc" } }, { payrollPeriod: { month: "desc" } }],
  });
}

export async function getPayslip(payslipId: string) {
  return prisma.payslip.findUnique({
    where: { id: payslipId },
    include: { employee: true, payrollPeriod: { include: { company: true } } },
  });
}
