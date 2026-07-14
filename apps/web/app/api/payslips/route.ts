import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { listMyPayslips } from "@/lib/services/payroll";

export async function GET(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payslips = await listMyPayslips(session.employeeId);
  return NextResponse.json({ payslips });
}
