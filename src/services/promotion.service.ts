import { AppError } from "../middleware/error.middleware.js";
import { PromotionRepository } from "../repositories/promotion.repository.js";
import { saveBase64Image } from "../utils/file.util.js";
import {
  CreatePromotion,
  UpdatePromotion,
} from "../validations/promotions.validations.js";

export class PromotionService {
  private promotionRepository: PromotionRepository;

  constructor() {
    this.promotionRepository = new PromotionRepository();
  }

  async createPromotion(data: CreatePromotion) {
    const image = await saveBase64Image(data.image, "promotions");
    const promotion = await this.promotionRepository.create({ image });
    return promotion;
  }

  async getPromotionById(id: number) {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }
    return promotion;
  }

  async getAllPromotions() {
    return await this.promotionRepository.findAll();
  }

  async updatePromotion(id: number, data: UpdatePromotion) {
    let image;
    if (data.image) {
      image = await saveBase64Image(data.image, "promotions");
    }

    const promotion = await this.promotionRepository.update(id, {
      image,
      ...data,
    });

    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }

    return promotion;
  }

  async deletePromotion(id: number) {
    const promotion = await this.promotionRepository.softDelete(id);

    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }

    return promotion;
  }
}
