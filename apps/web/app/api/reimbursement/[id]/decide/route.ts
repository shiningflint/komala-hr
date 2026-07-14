import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { reimbursementDecisionSchema } from "@komala/shared";
import { decideReimbursementClaim } from "@/lib/services/reimbursement";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthContext(req);
  const isAdminRole = session && ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"].includes(session.role);
  if (!session?.employeeId || !isAdminRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = reimbursementDecisionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    await decideReimbursementClaim(params.id, session.employeeId, parsed.data.approve, parsed.data.note);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
