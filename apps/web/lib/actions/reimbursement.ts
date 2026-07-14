"use server";

import { revalidatePath } from "next/cache";
import { requireSession, requireManagerOrAbove } from "@/lib/session";
import { createReimbursementClaim, decideReimbursementClaim } from "@/lib/services/reimbursement";

export async function submitReimbursementClaim(formData: FormData) {
  const session = await requireSession();
  if (!session.employeeId) throw new Error("No employee record linked to this account");

  await createReimbursementClaim(session.employeeId, {
    category: String(formData.get("category")),
    amount: Number(formData.get("amount")),
    description: String(formData.get("description") ?? ""),
    receiptUrl: String(formData.get("receiptUrl") ?? "") || null,
  });

  revalidatePath("/me/reimbursement");
  revalidatePath("/dashboard/reimbursement");
}

export async function decideReimbursementAction(claimId: string, approve: boolean, formData: FormData) {
  const session = await requireManagerOrAbove();
  if (!session.employeeId) throw new Error("Approver has no employee record");

  await decideReimbursementClaim(claimId, session.employeeId, approve, String(formData.get("note") ?? ""));

  revalidatePath("/dashboard/reimbursement");
  revalidatePath("/me/reimbursement");
}
