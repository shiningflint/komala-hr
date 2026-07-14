import { prisma } from "@/lib/prisma";

function daysBetweenInclusive(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export async function listLeaveTypes() {
  return prisma.leaveType.findMany({ orderBy: { name: "asc" } });
}

export async function listLeaveBalances(employeeId: string, year: number) {
  return prisma.leaveBalance.findMany({
    where: { employeeId, year },
    include: { leaveType: true },
    orderBy: { leaveType: { name: "asc" } },
  });
}

export async function listMyLeaveRequests(employeeId: string) {
  return prisma.leaveRequest.findMany({
    where: { employeeId },
    include: { leaveType: true, approver: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllLeaveRequests() {
  return prisma.leaveRequest.findMany({
    include: { leaveType: true, employee: true, approver: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLeaveRequest(
  employeeId: string,
  input: { leaveTypeId: string; startDate: Date; endDate: Date; reason: string }
) {
  const daysCount = daysBetweenInclusive(input.startDate, input.endDate);
  if (daysCount <= 0) throw new Error("End date must be on/after start date");

  const year = input.startDate.getFullYear();
  const balance = await prisma.leaveBalance.findUnique({
    where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId: input.leaveTypeId, year } },
  });
  if (balance && balance.allocatedDays - balance.usedDays < daysCount) {
    throw new Error("Insufficient leave balance for the requested dates");
  }

  return prisma.leaveRequest.create({
    data: {
      employeeId,
      leaveTypeId: input.leaveTypeId,
      startDate: input.startDate,
      endDate: input.endDate,
      daysCount,
      reason: input.reason,
      status: "PENDING",
    },
  });
}

export async function decideLeaveRequest(
  requestId: string,
  approverId: string,
  approve: boolean,
  note?: string
) {
  const request = await prisma.leaveRequest.findUniqueOrThrow({ where: { id: requestId } });
  if (request.status !== "PENDING") throw new Error("This request has already been decided");

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      approverId,
      approverNote: note,
      decidedAt: new Date(),
    },
  });

  if (approve) {
    const year = request.startDate.getFullYear();
    await prisma.leaveBalance.updateMany({
      where: { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year },
      data: { usedDays: { increment: request.daysCount } },
    });
  }
}
