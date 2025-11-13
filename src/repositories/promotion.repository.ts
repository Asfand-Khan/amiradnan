import { Promotion } from "@prisma/client";
import prisma from "../config/database.js";
import {
  CreatePromotion,
  UpdatePromotion,
} from "../validations/promotions.validations.js";

export class PromotionRepository {
  private repository = prisma.promotion;

  async create(userData: CreatePromotion): Promise<Promotion> {
    return await this.repository.create({
      data: {
        image: userData.image,
      },
    });
  }

  async findById(id: number): Promise<Promotion | null> {
    return await this.repository.findUnique({ where: { id } });
  }

  async findAll(): Promise<Promotion[]> {
    return await this.repository.findMany({
      where: { isDeleted: false },
    });
  }

  async update(
    id: number,
    promotionData: UpdatePromotion
  ): Promise<Promotion | null> {
    const updated = await this.repository.update({
      where: { id },
      data: {
        image: promotionData.image,
        active: promotionData.active,
      },
    });
    return updated;
  }

  async softDelete(id: number): Promise<Promotion | null> {
    return await this.repository.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}
