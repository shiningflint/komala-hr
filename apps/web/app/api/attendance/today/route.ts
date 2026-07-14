import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { getTodayAttendance } from "@/lib/services/attendance";

export async function GET(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const record = await getTodayAttendance(session.employeeId);
  return NextResponse.json({ record });
}
