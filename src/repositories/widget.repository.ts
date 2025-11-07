import { FontColor, Widget } from "@prisma/client";
import prisma from "../config/database.js";

export class WidgetRepository {
  private repository = prisma.widget;

  async create(
    title: string,
    subTitle: string,
    image: string,
    fontColor: FontColor,
    byDefault: 0 | 1
  ): Promise<Widget> {
    return await this.repository.create({
      data: {
        title,
        subTitle,
        image,
        fontColor,
        default: byDefault,
      },
    });
  }

  //   async findById(id: number): Promise<QrCode | null> {
  //     return await this.repository.findUnique({ where: { id } });
  //   }

  //   async findByCode(codeValue: string): Promise<QrCode | null> {
  //     return await this.repository.findUnique({ where: { codeValue } });
  //   }

  //   async findAll(
  //     page: number = 1,
  //     limit: number = 20,
  //     search?: string
  //   ): Promise<{ qrCodes: QrCode[]; total: number }> {
  //     const where: any = {};

  //     if (search) {
  //       where.OR = [{ codeValue: { contains: search } }];
  //     }

  //     const [qrCodes, total] = await Promise.all([
  //       this.repository.findMany({
  //         where,
  //         include: { customer: true },
  //         skip: (page - 1) * limit,
  //         take: limit,
  //         orderBy: { createdAt: "desc" },
  //       }),
  //       this.repository.count({ where }),
  //     ]);

  //     return { qrCodes, total };
  //   }

  //   async findByCustomerId(customerId: number): Promise<QrCode[]> {
  //     return await this.repository.findMany({
  //       where: { customerId },
  //       orderBy: { createdAt: "desc" },
  //     });
  //   }

  //   async deactivateExpiredCodes(): Promise<number> {
  //     const result = await this.repository.updateMany({
  //       where: {
  //         expiresAt: { lt: new Date() },
  //         active: 1,
  //       },
  //       data: { active: 0 },
  //     });
  //     return result.count;
  //   }

  //   async deactivateById(id: number): Promise<QrCode> {
  //     return await this.repository.update({
  //       where: { id },
  //       data: { active: 0 },
  //     });
  //   }

  //   async delete(id: number): Promise<QrCode> {
  //     return await this.repository.delete({ where: { id } });
  //   }
}
