import z from "zod";

export const createPromotionSchema = z.object({
  image: z
    .string({
      required_error: "Image Base 64 is required",
    })
    .refine(
      (val) => {
        if (!val) return true;
        const base64Pattern =
          /^data:image\/(png|jpg|jpeg|gif|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
        return base64Pattern.test(val);
      },
      {
        message:
          "Image must be a valid base64-encoded string (png, jpg, jpeg, gif, or webp).",
      }
    ),
});

export const updatePromotionSchema = createPromotionSchema.partial().extend({
    active: z.boolean().optional()
})

export type CreatePromotion = z.infer<typeof createPromotionSchema>;
export type UpdatePromotion = z.infer<typeof updatePromotionSchema>;