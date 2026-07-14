"use server";

import { revalidatePath } from "next/cache";
import { requireSession, requireManagerOrAbove } from "@/lib/session";
import { createLeaveRequest, decideLeaveRequest } from "@/lib/services/leave";

export async function submitLeaveRequest(formData: FormData) {
  const session = await requireSession();
  if (!session.employeeId) throw new Error("No employee record linked to this account");

  await createLeaveRequest(session.employeeId, {
    leaveTypeId: String(formData.get("leaveTypeId")),
    startDate: new Date(String(formData.get("startDate"))),
    endDate: new Date(String(formData.get("endDate"))),
    reason: String(formData.get("reason") ?? ""),
  });

  revalidatePath("/me/leave");
  revalidatePath("/dashboard/leave");
}

export async function decideLeaveRequestAction(requestId: string, approve: boolean, formData: FormData) {
  const session = await requireManagerOrAbove();
  if (!session.employeeId) throw new Error("Approver has no employee record");

  await decideLeaveRequest(requestId, session.employeeId, approve, String(formData.get("note") ?? ""));

  revalidatePath("/dashboard/leave");
  revalidatePath("/me/leave");
}
