import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAuthContext(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const employee = session.employeeId
    ? await prisma.employee.findUnique({
        where: { id: session.employeeId },
        include: { department: true, position: true, office: true, manager: true },
      })
    : null;

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    role: session.role,
    employee,
  });
}
