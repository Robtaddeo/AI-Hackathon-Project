import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  servings: z.string(),
  steps: z.array(z.object({
    number: z.number(),
    title: z.string(),
    description: z.string()
  }))
});

