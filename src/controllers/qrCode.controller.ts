import { Request, Response } from "express";
import { QrCodeService } from "../services/qrCode.service.js";
import { AuthRequest } from "../types/index.js";
import {
  QrCodeByCodeValueSchema,
  QrCodeByCustomerSchema,
  QrCodeByIdSchema,
  QrCodeFilterSchema,
} from "../validations/qrCode.validations.js";
import { catchAsync } from "../utils/catchAsync.js";

export class QrCodeController {
  private qrCodeService: QrCodeService;

  constructor() {
    this.qrCodeService = new QrCodeService();
  }

  generate = catchAsync(async (req: AuthRequest, res: Response) => {
    const customerId = req.user!.id;
    const qrCode = await this.qrCodeService.generate(
      customerId,
      1 // expiresInHours
    );
    res.status(201).json({ success: true, data: qrCode });
  });

  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const body: QrCodeFilterSchema = req.body;
    const data = await this.qrCodeService.getAll(
      body.page,
      body.limit,
      body.search
    );
    res.json({ success: true, data: data });
  });

  getByCustomer = catchAsync(async (req: Request, res: Response) => {
    const body: QrCodeByCustomerSchema = req.body;
    const qrCodes = await this.qrCodeService.getByCustomer(body.customerId);
    res.json({ success: true, data: qrCodes });
  });

  getByCode = catchAsync(async (req: AuthRequest, res: Response) => {
    const body: QrCodeByCodeValueSchema = req.body;
    const qrCode = await this.qrCodeService.getByCode(body.codeValue);
    res.json({ success: true, data: qrCode });
  });

  deactivate = catchAsync(async (req: AuthRequest, res: Response) => {
    const body: QrCodeByIdSchema = req.body;
    const qrCode = await this.qrCodeService.deactivate(body.qrCodeId);
    res.json({ success: true, data: qrCode });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    const body: QrCodeByIdSchema = req.body;
    const qrCode = await this.qrCodeService.delete(body.qrCodeId);
    res.json({ success: true, data: qrCode });
  });
}
