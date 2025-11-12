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

  async findById(id: number): Promise<Widget | null> {
    return await this.repository.findUnique({ where: { id } });
  }

  async findAll(): Promise<Widget[]> {
    const qrCodes = await this.repository.findMany();
    return qrCodes;
  }

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
