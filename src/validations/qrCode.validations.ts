import z from "zod";

export const qrCodeFilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export const qrCodeByCodeValueSchema = z.object({
  codeValue: z
    .string({
      required_error: "Code value is required",
    })
    .min(6, "Code value must be at least 6 characters"),
});

export const qrCodeByIdSchema = z.object({
  qrCodeId: z
    .number({
      required_error: "QR Code ID is required",
    })
    .int({
      message: "QR Code ID must be an integer",
    })
    .positive(),
});

export const qrCodeByCustomerSchema = z.object({
  customerId: z
    .number({
      required_error: "Customer ID is required",
    })
    .int({
      message: "Customer ID must be an integer",
    })
    .positive(),
});

export type QrCodeFilterSchema = z.infer<typeof qrCodeFilterSchema>;
export type QrCodeByCodeValueSchema = z.infer<typeof qrCodeByCodeValueSchema>;
export type QrCodeByIdSchema = z.infer<typeof qrCodeByIdSchema>;
export type QrCodeByCustomerSchema = z.infer<typeof qrCodeByCustomerSchema>;