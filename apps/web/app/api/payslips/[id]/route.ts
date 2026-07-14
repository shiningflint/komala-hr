import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { getPayslip } from "@/lib/services/payroll";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthContext(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payslip = await getPayslip(params.id);
  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdminRole = ["SUPER_ADMIN", "HR_ADMIN"].includes(session.role);
  if (!isAdminRole && payslip.employeeId !== session.employeeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ payslip });
}
