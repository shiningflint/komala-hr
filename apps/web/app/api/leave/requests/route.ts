import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { leaveRequestSchema } from "@komala/shared";
import { createLeaveRequest, listMyLeaveRequests, listAllLeaveRequests } from "@/lib/services/leave";

export async function GET(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdminRole = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"].includes(session.role);
  const requests =
    isAdminRole && req.nextUrl.searchParams.get("scope") === "all"
      ? await listAllLeaveRequests()
      : session.employeeId
      ? await listMyLeaveRequests(session.employeeId)
      : [];
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = leaveRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const request = await createLeaveRequest(session.employeeId, parsed.data);
    return NextResponse.json({ request });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
