import { z } from "zod";

export const ShopBannerTypeEnum = z.enum(["slider", "grid"]);

const base64ImageRegex =
  /^data:image\/(png|jpg|jpeg|gif|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

export const createShopBannerSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(1, "Name is required")
    .max(200, "Name must not exceed 200 characters"),
  banners: z.array(
    z.object({
      imageUrl: z
        .string()
        .refine(
          (val) => base64ImageRegex.test(val),
          "Image must be a valid base64-encoded image"
        ),
      targetUrl: z
        .string()
        .url("Target URL must be a valid URL")
        .max(500)
        .optional(),
    })
  ),
  sorting: z.number().int().positive(),
  type: ShopBannerTypeEnum,
  isAuto: z.boolean().optional().default(false),
  delay: z.number().int().positive().optional(),
  active: z.number().int().min(0).max(1).default(1),
});

// Update Schema (partial version)
export const updateShopBannerSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(1, "Name is required")
    .max(200, "Name must not exceed 200 characters")
    .optional(),
  banners: z
    .array(
      z.object({
        id: z.number().optional(),
        imageUrl: z.string(),
        targetUrl: z
          .string()
          .url("Target URL must be a valid URL")
          .max(500)
          .optional(),
        sorting: z.number().int().optional(),
      })
    )
    .optional(),
  sorting: z.number().int().positive().optional(),
  type: ShopBannerTypeEnum.optional(),
  isAuto: z.boolean().optional().default(false),
  delay: z.number().int().positive().optional(),
  active: z.number().int().min(0).max(1).default(1),
});

export type CreateShopBanner = z.infer<typeof createShopBannerSchema>;
export type UpdateShopBanner = z.infer<typeof updateShopBannerSchema>;
