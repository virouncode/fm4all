import { z } from "zod";

export const foodBeverageSchema = z.object({
  currentFoodBeverageId: z.number(),
});

export type FoodBeverageType = z.infer<typeof foodBeverageSchema>;
