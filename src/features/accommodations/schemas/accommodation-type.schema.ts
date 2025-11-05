import { z } from "zod";

export const accommodationTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type AccommodationType = z.infer<typeof accommodationTypeSchema>;
