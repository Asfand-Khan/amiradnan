import z from "zod";

export const createWidgetSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title cannot exceed 255 characters"),
  subTitle: z
    .string()
    .min(1, "Sub Title is required")
    .max(255, "Sub Title cannot exceed 255 characters"),
  image: z
    .string()
    .refine(
      (val) =>
        /^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(
          val
        ),
      {
        message:
          "Image must be a valid Base64 encoded string (e.g., data:image/png;base64,...)",
      }
    ),
  fontColor: z.enum(["dark", "light"], {
    required_error: "Font color is required e.g. dark, light",
  }),
  byDefault: z.boolean({
    required_error: "By default is required",
    invalid_type_error: "By default must be a boolean",
  }),
});

export type CreateWidget = z.infer<typeof createWidgetSchema>;