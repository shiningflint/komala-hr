import { prisma } from "@/lib/prisma";

export async function listMyReimbursements(employeeId: string) {
  return prisma.reimbursementClaim.findMany({
    where: { employeeId },
    include: { approver: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllReimbursements() {
  return prisma.reimbursementClaim.findMany({
    include: { employee: true, approver: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createReimbursementClaim(
  employeeId: string,
  input: { category: string; amount: number; description: string; receiptUrl?: string | null }
) {
  return prisma.reimbursementClaim.create({
    data: {
      employeeId,
      category: input.category,
      amount: input.amount,
      description: input.description,
      receiptUrl: input.receiptUrl ?? null,
      status: "PENDING",
    },
  });
}

export async function decideReimbursementClaim(
  claimId: string,
  approverId: string,
  approve: boolean,
  note?: string
) {
  const claim = await prisma.reimbursementClaim.findUniqueOrThrow({ where: { id: claimId } });
  if (claim.status !== "PENDING") throw new Error("This claim has already been decided");

  await prisma.reimbursementClaim.update({
    where: { id: claimId },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      approverId,
      approverNote: note,
      decidedAt: new Date(),
    },
  });
}
