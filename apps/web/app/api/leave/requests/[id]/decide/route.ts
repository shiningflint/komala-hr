import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { leaveDecisionSchema } from "@komala/shared";
import { decideLeaveRequest } from "@/lib/services/leave";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthContext(req);
  const isAdminRole = session && ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"].includes(session.role);
  if (!session?.employeeId || !isAdminRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = leaveDecisionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    await decideLeaveRequest(params.id, session.employeeId, parsed.data.approve, parsed.data.note);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
