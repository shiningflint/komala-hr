import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { listLeaveTypes, listLeaveBalances } from "@/lib/services/leave";

export async function GET(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const types = await listLeaveTypes();
  const balances = session.employeeId
    ? await listLeaveBalances(session.employeeId, new Date().getFullYear())
    : [];
  return NextResponse.json({ types, balances });
}
