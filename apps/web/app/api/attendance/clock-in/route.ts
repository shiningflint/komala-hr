import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { clockEventSchema } from "@komala/shared";
import { clockIn } from "@/lib/services/attendance";

export async function POST(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = clockEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid location payload" }, { status: 400 });
  }

  try {
    const record = await clockIn(session.employeeId, {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracyM: parsed.data.accuracyM,
      note: parsed.data.note,
    });
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
