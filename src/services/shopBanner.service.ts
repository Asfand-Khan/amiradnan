import path from "path";
import fs from "fs";
import { AppError } from "../middleware/error.middleware.js";
import { ShopBannerRepository } from "../repositories/shopBanner.repository.js";
import { saveBase64Image } from "../utils/file.util.js";
import {
  CreateShopBanner,
  UpdateShopBanner,
} from "../validations/shopBanner.validations.js";

export class ShopBannerService {
  private shopBannerRepository: ShopBannerRepository;

  constructor() {
    this.shopBannerRepository = new ShopBannerRepository();
  }

  async create(data: CreateShopBanner) {
    const banners = await Promise.all(
      data.banners.map(async (banner) => ({
        imageUrl: await saveBase64Image(banner.imageUrl, "banners"),
        targetUrl: banner.targetUrl,
      }))
    );

    await this.shopBannerRepository.create({ ...data, banners });
  }

  async getAll() {
    return await this.shopBannerRepository.getAll();
  }

  async getById(id: number) {
    const banner = await this.shopBannerRepository.getById(id);
    if (!banner) throw new AppError("Banner not found", 404);
    return banner;
  }

  async update(id: number, data: Partial<UpdateShopBanner>) {
    const existing = await this.shopBannerRepository.getById(id);
    if (!existing) throw new AppError("Banner not found", 404);

    if (data.banners) {
      const processedBanners = await Promise.all(
        data.banners.map(async (banner) => {
          if (banner.imageUrl.startsWith("data:image")) {
            const imagePath = await saveBase64Image(banner.imageUrl, "banners");
            return { ...banner, imageUrl: imagePath };
          }
          return banner;
        })
      );

      // Delete removed images
      const newImagePaths = new Set(processedBanners.map((b) => b.imageUrl));
      if (existing.shopBannerDetails) {
        existing.shopBannerDetails.forEach((detail) => {
          if (detail.imageUrl && !newImagePaths.has(detail.imageUrl)) {
            const filePath = path.join(process.cwd(), detail.imageUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
        });
      }

      data.banners = processedBanners;
    }

    return await this.shopBannerRepository.update(id, data);
  }

  async delete(id: number) {
    const existing = await this.shopBannerRepository.getById(id);
    if (!existing) throw new AppError("Banner not found", 404);

    if (existing.shopBannerDetails) {
      existing.shopBannerDetails.forEach((detail) => {
        if (detail.imageUrl) {
          const filePath = path.join(process.cwd(), detail.imageUrl);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    await this.shopBannerRepository.delete(id);
  }

  async toggleActive(id: number) {
    const banner = await this.shopBannerRepository.getById(id);
    if (!banner) throw new AppError("Banner not found", 404);

    const newStatus = banner.active === 1 ? 0 : 1;
    return await this.shopBannerRepository.update(id, { active: newStatus });
  }
}
