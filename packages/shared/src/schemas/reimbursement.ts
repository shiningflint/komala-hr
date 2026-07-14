import { z } from "zod";

export const reimbursementClaimSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
  receiptUrl: z.string().optional().nullable(),
});
export type ReimbursementClaimInput = z.infer<typeof reimbursementClaimSchema>;

export const reimbursementDecisionSchema = z.object({
  approve: z.boolean(),
  note: z.string().optional(),
});
export type ReimbursementDecisionInput = z.infer<typeof reimbursementDecisionSchema>;
