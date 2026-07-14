import { z } from "zod";

export const clockEventSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyM: z.number().nonnegative().optional(),
  note: z.string().optional(),
});
export type ClockEventInput = z.infer<typeof clockEventSchema>;
