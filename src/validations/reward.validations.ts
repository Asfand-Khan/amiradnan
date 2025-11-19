import { z } from "zod";

export const createRewardSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateRewardSchema = createRewardSchema.partial().extend({
  id: z.number().int().positive("ID is required"),
});

export const singleRewardSchema = z.object({
  id: z.number().int().positive("ID is required"),
});

export const listRewardsSchema = z.object({
  query: z.object({
    active: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    search: z.string().optional(),
  }),
});

// Types
export type CreateRewardInput = z.infer<typeof createRewardSchema>;
export type UpdateRewardInput = z.infer<typeof updateRewardSchema>;
export type GetRewardInput = z.infer<typeof singleRewardSchema>;
export type DeleteRewardInput = z.infer<typeof singleRewardSchema>;
export type ListRewardsInput = z.infer<typeof listRewardsSchema>;
export type RestoreRewardInput = z.infer<typeof singleRewardSchema>;
