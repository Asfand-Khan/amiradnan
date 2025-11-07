import { Request, Response, NextFunction } from "express";
import { QrCodeService } from "../services/qrCode.service.js";
import { AuthRequest } from "../types/index.js";
import {
  QrCodeByCodeValueSchema,
  QrCodeByCustomerSchema,
  QrCodeByIdSchema,
  QrCodeFilterSchema,
} from "../validations/qrCode.validations.js";

export class QrCodeController {
  private qrCodeService: QrCodeService;

  constructor() {
    this.qrCodeService = new QrCodeService();
  }

  generate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const qrCode = await this.qrCodeService.generate(
        customerId,
        1 // expiresInHours
      );
      res.status(201).json({ success: true, data: qrCode });
    } catch (err) {
      next(err);
    }
  };

  getAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: QrCodeFilterSchema = req.body;
      const data = await this.qrCodeService.getAll(
        body.page,
        body.limit,
        body.search
      );
      res.json({ success: true, data: data });
    } catch (err) {
      next(err);
    }
  };

  getByCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: QrCodeByCustomerSchema = req.body;
      const qrCodes = await this.qrCodeService.getByCustomer(body.customerId);
      res.json({ success: true, data: qrCodes });
    } catch (err) {
      next(err);
    }
  };

  getByCode = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: QrCodeByCodeValueSchema = req.body;
      const qrCode = await this.qrCodeService.getByCode(body.codeValue);
      res.json({ success: true, data: qrCode });
    } catch (err) {
      next(err);
    }
  };

  deactivate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: QrCodeByIdSchema = req.body;
      const qrCode = await this.qrCodeService.deactivate(body.qrCodeId);
      res.json({ success: true, data: qrCode });
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: QrCodeByIdSchema = req.body;
      const qrCode = await this.qrCodeService.delete(body.qrCodeId);
      res.json({ success: true, data: qrCode });
    } catch (err) {
      next(err);
    }
  };
}
