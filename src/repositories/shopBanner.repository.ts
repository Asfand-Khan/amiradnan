import prisma from "../config/database.js";
import {
  CreateShopBanner,
  UpdateShopBanner,
} from "../validations/shopBanner.validations.js";

export class ShopBannerRepository {
  private repository = prisma.shopBanner;

  async create(data: CreateShopBanner): Promise<void> {
    let dataToInsert = data.banners.map((banner) => ({
      name: data.name,
      imageUrl: banner.imageUrl,
      targetUrl: banner.targetUrl,
      sorting: data.sorting,
      type: data.type,
      isAuto: data.isAuto,
      delay: data.delay,
      active: data.active,
    }));

    await this.repository.createMany({ data: dataToInsert });
  }

  async getAll() {
    return await this.repository.findMany({
      orderBy: { id: "desc" },
      where: {
        active: 1,
      },
    });
  }

  async getById(id: number) {
    return await this.repository.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<UpdateShopBanner>) {
    return await this.repository.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    await this.repository.delete({ where: { id } });
  }
}
