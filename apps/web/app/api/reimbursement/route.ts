import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { reimbursementClaimSchema } from "@komala/shared";
import {
  createReimbursementClaim,
  listMyReimbursements,
  listAllReimbursements,
} from "@/lib/services/reimbursement";

export async function GET(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdminRole = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"].includes(session.role);
  const claims =
    isAdminRole && req.nextUrl.searchParams.get("scope") === "all"
      ? await listAllReimbursements()
      : session.employeeId
      ? await listMyReimbursements(session.employeeId)
      : [];
  return NextResponse.json({ claims });
}

export async function POST(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = reimbursementClaimSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const claim = await createReimbursementClaim(session.employeeId, parsed.data);
  return NextResponse.json({ claim });
}
