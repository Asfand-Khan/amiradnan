import prisma from "../config/database.js";
import {
  CreateShopBanner,
  UpdateShopBanner,
} from "../validations/shopBanner.validations.js";

export class ShopBannerRepository {
  private repository = prisma.shopBanner;

  async create(data: CreateShopBanner) {
    const banner = await this.repository.create({
      data: {
        name: data.name,
        sorting: data.sorting,
        type: data.type,
        isAuto: data.isAuto,
        delay: data.delay,
        active: data.active,
        shopBannerDetails: {
          createMany: {
            data: data.banners.map((item) => ({
              imageUrl: item.imageUrl,
              targetUrl: item.targetUrl,
            })),
          },
        },
      },
      include: {
        shopBannerDetails: true,
      },
    });
    return banner;
  }

  async getAll() {
    return await this.repository.findMany({
      orderBy: { id: "desc" },
      where: {
        active: 1,
      },
      include: {
        shopBannerDetails: true,
      },
    });
  }

  async getById(id: number) {
    return await this.repository.findUnique({
      where: { id },
      include: {
        shopBannerDetails: true,
      },
    });
  }

  async update(id: number, data: Partial<UpdateShopBanner>) {
    const { banners, ...rest } = data;

    return await prisma.$transaction(async (tx) => {
      await tx.shopBanner.update({
        where: { id },
        data: rest,
      });

      if (banners) {
        await tx.shopBannerDetail.deleteMany({
          where: { shopBannerId: id },
        });

        if (banners.length > 0) {
          await tx.shopBannerDetail.createMany({
            data: banners.map((b) => ({
              shopBannerId: id,
              imageUrl: b.imageUrl,
              targetUrl: b.targetUrl,
              sorting: b.sorting,
            })),
          });
        }
      }

      return tx.shopBanner.findUnique({
        where: { id },
        include: {
          shopBannerDetails: true,
        },
      });
    });
  }

  async delete(id: number) {
    await prisma.$transaction(async (tx) => {
      await tx.shopBannerDetail.deleteMany({
        where: { shopBannerId: id },
      });
      await tx.shopBanner.delete({
        where: { id },
      });
    });
  }
}
