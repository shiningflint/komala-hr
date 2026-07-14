import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAuthContext } from "@/lib/auth-context";
import { getPayslip } from "@/lib/services/payroll";
import { PayslipDocument } from "@/lib/pdf/PayslipDocument";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthContext(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payslip = await getPayslip(params.id);
  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdminRole = ["SUPER_ADMIN", "HR_ADMIN"].includes(session.role);
  if (!isAdminRole && payslip.employeeId !== session.employeeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await renderToBuffer(
    PayslipDocument({
      companyName: payslip.payrollPeriod.company.name,
      employeeName: payslip.employee.name,
      employeeCode: payslip.employee.employeeCode,
      positionName: null,
      periodLabel: `${payslip.payrollPeriod.month}/${payslip.payrollPeriod.year}`,
      basicSalary: payslip.basicSalary,
      allowances: payslip.allowances,
      overtimePay: payslip.overtimePay,
      grossPay: payslip.grossPay,
      bpjsKesehatanEmployee: payslip.bpjsKesehatanEmployee,
      bpjsKesehatanCompany: payslip.bpjsKesehatanCompany,
      bpjsJhtEmployee: payslip.bpjsJhtEmployee,
      bpjsJhtCompany: payslip.bpjsJhtCompany,
      bpjsJpEmployee: payslip.bpjsJpEmployee,
      bpjsJpCompany: payslip.bpjsJpCompany,
      bpjsJkk: payslip.bpjsJkk,
      bpjsJkm: payslip.bpjsJkm,
      terCategory: payslip.terCategory,
      pph21Monthly: payslip.pph21Monthly,
      pph21Annual: payslip.pph21Annual,
      pph21AlreadyWithheld: payslip.pph21AlreadyWithheld,
      pph21TrueUp: payslip.pph21TrueUp,
      netPay: payslip.netPay,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="payslip-${payslip.employee.employeeCode}-${payslip.payrollPeriod.month}-${payslip.payrollPeriod.year}.pdf"`,
    },
  });
}
