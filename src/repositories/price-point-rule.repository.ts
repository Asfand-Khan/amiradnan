import prisma from "../config/database.js";
import { PricePointRule } from "@prisma/client";

export class PricePointRuleRepository {
  async create(
    pointsPerUnit: number,
    unitValue: number
  ): Promise<PricePointRule> {
    return await prisma.pricePointRule.create({
      data: {
        pointsPerUnit,
        unitValue,
      },
    });
  }

  async findAll(): Promise<PricePointRule[]> {
    return await prisma.pricePointRule.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number): Promise<PricePointRule | null> {
    return await prisma.pricePointRule.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    data: Partial<PricePointRule>
  ): Promise<PricePointRule> {
    return await prisma.pricePointRule.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<PricePointRule> {
    return await prisma.pricePointRule.delete({
      where: { id },
    });
  }

  // To find the currently applicable rule (usually the latest one)
  async findLatest(): Promise<PricePointRule | null> {
    return await prisma.pricePointRule.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }
}
