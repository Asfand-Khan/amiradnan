import prisma from "../config/database.js";
import { PointsExpiryDefault } from "@prisma/client";

export class PointsExpiryDefaultRepository {
  async create(
    name: string,
    expiryDays: number,
    createdBy: number,
    active: boolean
  ): Promise<PointsExpiryDefault> {
    return await prisma.pointsExpiryDefault.create({
      data: {
        name,
        expiryDays,
        createdBy,
        active,
      },
    });
  }

  async findAll(): Promise<PointsExpiryDefault[]> {
    return await prisma.pointsExpiryDefault.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number): Promise<PointsExpiryDefault | null> {
    return await prisma.pointsExpiryDefault.findUnique({
      where: { id },
    });
  }

  async findActive(): Promise<PointsExpiryDefault | null> {
    return await prisma.pointsExpiryDefault.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: number,
    data: Partial<PointsExpiryDefault>
  ): Promise<PointsExpiryDefault> {
    return await prisma.pointsExpiryDefault.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<PointsExpiryDefault> {
    return await prisma.pointsExpiryDefault.delete({
      where: { id },
    });
  }

  async deactivateAll(): Promise<void> {
    await prisma.pointsExpiryDefault.updateMany({
      data: { active: false },
    });
  }
}
