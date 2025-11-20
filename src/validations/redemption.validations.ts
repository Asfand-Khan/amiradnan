import { z } from "zod";

export const createRedemptionSchema = z.object({
  customerId: z.number().int().positive("Customer ID required"),
  rewardId: z.number().int().positive("Reward ID required"),
  locationId: z.number().int().positive("Location ID required"),
});

export const updateRedemptionSchema = createRedemptionSchema.partial().extend({
  redemptionId: z.number().int().positive("Redemption ID required"),
});

export const singleRedemptionSchema = z.object({
  redemptionId: z.number().int().positive("Redemption ID required"),
});

export const deleteRedemptionSchema = singleRedemptionSchema;

export const listRedemptionsSchema = z.object({
  customerId: z.number().int().positive().optional(),
  rewardId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional(),
  search: z.string().optional(),
});

export const searchRedemptionSchema = z.object({
  search: z.string().min(1, "Search term required"),
});

export type CreateRedemptionInput = z.infer<typeof createRedemptionSchema>;
export type UpdateRedemptionInput = z.infer<typeof updateRedemptionSchema>;
export type GetRedemptionInput = z.infer<typeof singleRedemptionSchema>;
export type DeleteRedemptionInput = z.infer<typeof deleteRedemptionSchema>;
export type ListRedemptionsInput = z.infer<typeof listRedemptionsSchema>;
export type SearchRedemptionsInput = z.infer<typeof searchRedemptionSchema>;
