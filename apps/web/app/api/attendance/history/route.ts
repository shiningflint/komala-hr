import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { listAttendanceHistory } from "@/lib/services/attendance";

export async function GET(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const records = await listAttendanceHistory(session.employeeId);
  return NextResponse.json({ records });
}
