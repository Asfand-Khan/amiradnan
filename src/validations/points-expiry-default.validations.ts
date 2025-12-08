import z from "zod";

export const createPointsExpiryDefaultSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name cannot exceed 200 characters"),
  expiryDays: z
    .number({
      required_error: "Expiry days is required",
      invalid_type_error: "Expiry days must be a number",
    })
    .int()
    .positive(),
  active: z.boolean().default(true),
});

export const updatePointsExpiryDefaultSchema = createPointsExpiryDefaultSchema
  .partial()
  .extend({
    configId: z
      .number({
        required_error: "Config ID is required",
      })
      .int()
      .positive(),
  });

export const singlePointsExpiryDefaultSchema = z.object({
  id: z
    .number({
      required_error: "Config ID is required",
    })
    .int()
    .positive(),
});

export type CreatePointsExpiryDefault = z.infer<
  typeof createPointsExpiryDefaultSchema
>;
export type UpdatePointsExpiryDefault = z.infer<
  typeof updatePointsExpiryDefaultSchema
>;
export type SinglePointsExpiryDefault = z.infer<
  typeof singlePointsExpiryDefaultSchema
>;
