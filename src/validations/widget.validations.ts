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
  active: z
    .boolean({
      required_error: "Active is required",
      invalid_type_error: "Active must be a boolean",
    })
    .default(true),
  byDefault: z
    .boolean({
      required_error: "By default is required",
      invalid_type_error: "By default must be a boolean",
    })
    .default(false),
});

export const updateWidgetSchema = createWidgetSchema.partial().extend({
  widgetId: z
    .number({
      required_error: "Widget ID is required",
    })
    .int({
      message: "Widget ID must be an integer",
    })
    .positive(),
});

export const singleWidgetSchema = z.object({
  widgetId: z
    .number({
      required_error: "Widget ID is required",
    })
    .int({
      message: "Widget ID must be an integer",
    })
    .positive(),
});

export type CreateWidget = z.infer<typeof createWidgetSchema>;
export type UpdateWidget = z.infer<typeof updateWidgetSchema>;
export type SingleWidget = z.infer<typeof singleWidgetSchema>;
