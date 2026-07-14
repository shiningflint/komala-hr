import { z } from "zod";

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().min(1),
});
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;

export const leaveDecisionSchema = z.object({
  approve: z.boolean(),
  note: z.string().optional(),
});
export type LeaveDecisionInput = z.infer<typeof leaveDecisionSchema>;
