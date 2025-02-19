import { z } from "zod";

export const devisProgressSchema = z.object({
  currentStep: z.number(),
  completedSteps: z.array(z.number()),
  currentStepHasChanged: z.boolean(),
});

export type DevisProgressType = z.infer<typeof devisProgressSchema>;
