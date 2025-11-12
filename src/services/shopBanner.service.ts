import path from "path";
import fs from "fs";
import { AppError } from "../middleware/error.middleware.js";
import { ShopBannerRepository } from "../repositories/shopBanner.repository.js";
import { saveBase64Image } from "../utils/file.util.js";
import { CreateShopBanner } from "../validations/shopBanner.validations.js";

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

  async delete(id: number) {
    const existing = await this.shopBannerRepository.getById(id);
    if (!existing) throw new Error("Banner not found");

    // Remove image file
    const filePath = path.join(process.cwd(), existing.imageUrl!);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await this.shopBannerRepository.delete(id);
  }

  async toggleActive(id: number) {
    const banner = await this.shopBannerRepository.getById(id);
    if (!banner) throw new Error("Banner not found");

    const newStatus = banner.active === 1 ? 0 : 1;
    return await this.shopBannerRepository.update(id, { active: newStatus });
  }
}
