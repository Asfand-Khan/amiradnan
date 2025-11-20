// src/repositories/location.repository.ts
import { Location, Prisma } from "@prisma/client";
import prisma from "../config/database.js";

export class LocationRepository {
  private repository = prisma.location;

  async create(data: Prisma.LocationCreateInput): Promise<Location> {
    return await this.repository.create({
      data,
      include: {
        shopUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<Location | null> {
    return await this.repository.findUnique({
      where: { id },
      include: {
        shopUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            pointsTransactions: true,
            redemptions: true,
          },
        },
      },
    });
  }

  async findAll(where?: Prisma.LocationWhereInput): Promise<Location[]> {
    return await this.repository.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            shopUsers: true,
            pointsTransactions: true,
            redemptions: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: Prisma.LocationUpdateInput
  ): Promise<Location> {
    return await this.repository.update({
      where: { id },
      data,
      include: {
        shopUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<Location> {
    return await this.repository.delete({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Location | null> {
    return await this.repository.findFirst({
      where: { name },
    });
  }

  async findByCity(city: string): Promise<Location[]> {
    return await this.repository.findMany({
      where: {
        city: {
          contains: city,
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async getLocationStats(id: number) {
    const [transactionCount, redemptionCount, userCount, recentTransactions] =
      await Promise.all([
        prisma.pointsTransaction.count({
          where: { locationId: id },
        }),
        prisma.redemption.count({
          where: { locationId: id },
        }),
        prisma.shopUser.count({
          where: { locationId: id },
        }),
        prisma.pointsTransaction.findMany({
          where: { locationId: id },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

    return {
      transactionCount,
      redemptionCount,
      userCount,
      recentTransactions,
    };
  }

  async checkLocationExists(id: number): Promise<boolean> {
    const count = await this.repository.count({
      where: { id },
    });
    return count > 0;
  }

  async searchLocations(searchTerm: string): Promise<Location[]> {
    return await this.repository.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { address: { contains: searchTerm } },
          { city: { contains: searchTerm } },
        ],
      },
      orderBy: { name: "asc" },
    });
  }
}
