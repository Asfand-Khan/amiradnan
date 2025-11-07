import { QrCode } from "@prisma/client";
import { QrCodeRepository } from "../repositories/qrCode.repository.js";
import { randomUUID } from "crypto";
import { AppError } from "../middleware/error.middleware.js";

export class QrCodeService {
  private qrCodeRepository: QrCodeRepository;

  constructor() {
    this.qrCodeRepository = new QrCodeRepository();
  }

  async generate(customerId: number, expiresInHours: number): Promise<QrCode> {
    const codeValue = randomUUID();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const qrCode = await this.qrCodeRepository.create(
      customerId,
      codeValue,
      expiresAt
    );
    return qrCode;
  }

  async getAll(page: number = 1, limit: number = 20, search?: string) {
    const { qrCodes, total } = await this.qrCodeRepository.findAll(
      page,
      limit,
      search
    );

    return {
      items: qrCodes.map((code) => ({
        id: code.id,
        customerId: code.customerId,
        codeValue: code.codeValue,
        active: code.active,
        expiresAt: code.expiresAt,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getByCustomer(customerId: number) {
    return await this.qrCodeRepository.findByCustomerId(customerId);
  }

  async getByCode(codeValue: string) {
    const code = await this.qrCodeRepository.findByCode(codeValue);
    if (!code) throw new AppError("QR Code not found", 404);

    if (code.expiresAt < new Date() || code.active === 0) {
      throw new AppError("QR Code expired or inactive", 400);
    }

    return code;
  }

  async deactivate(id: number) {
    const existing = await this.qrCodeRepository.findById(id);
    if (!existing) throw new AppError("QR Code not found", 404);

    return await this.qrCodeRepository.deactivateById(id);
  }

  async delete(id: number) {
    const existing = await this.qrCodeRepository.findById(id);
    if (!existing) throw new AppError("QR Code not found", 404);

    return await this.qrCodeRepository.delete(id);
  }

  async deactivateExpiredCodes(): Promise<{ count: number }> {
    const count = await this.qrCodeRepository.deactivateExpiredCodes();
    return { count };
  }
}
