import { z } from "zod";

export const recipiesSchema = z.object({
  recipies: z.array(
    z.object({
      title: z.string(),
      description: z.string()
    })
  )
});
