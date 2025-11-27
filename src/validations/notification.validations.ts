import { z } from "zod";

export const NotificationTypeEnum = z.enum([
  "welcome",
  "tier_update",
  "challenge_completed",
  "promo",
  "transaction",
]);

export const createNotificationSchema = z.object({
  title: z
    .string()
    .min(1, "Title must contain at least one character.")
    .max(255, "Title must be under 255 characters."),

  body: z
    .string()
    .min(1, "Body must contain content.")
    .max(5000, "Body content must stay within acceptable limits."),

  type: NotificationTypeEnum.default("promo"),
});

export const getSingleNotificationSchema = z.object({
  id: z.number(),
});

export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type GetSingleNotification = z.infer<typeof getSingleNotificationSchema>;
