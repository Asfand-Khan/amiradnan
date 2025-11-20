import { Prisma, Redemption } from "@prisma/client";
import prisma from "../config/database.js";
export class RedemptionRepository {
  private repository = prisma.redemption;

  async create(data: Prisma.RedemptionCreateInput): Promise<Redemption> {
    return await this.repository.create({
      data,
    });
  }

  async findById(id: number): Promise<Redemption | null> {
    return await this.repository.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        reward: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(where?: Prisma.RedemptionWhereInput): Promise<Redemption[]> {
    return await this.repository.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        reward: {
          select: {
            id: true,
            name: true,
            tierRewards: {
              select: {
                tier: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: Prisma.RedemptionUpdateInput
  ): Promise<Redemption> {
    return await this.repository.update({
      where: { id },
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        reward: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<Redemption> {
    return await this.repository.delete({
      where: { id },
    });
  }

  async findByCustomer(customerId: number): Promise<Redemption[]> {
    return await this.repository.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        reward: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
    });
  }

  async findByLocation(locationId: number): Promise<Redemption[]> {
    return await this.repository.findMany({
      where: { locationId },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        reward: { select: { id: true, name: true } },
      },
    });
  }

  async findByReward(rewardId: number): Promise<Redemption[]> {
    return await this.repository.findMany({
      where: { rewardId },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
    });
  }

  async searchRedemptions(search: string): Promise<Redemption[]> {
    return await this.repository.findMany({
      where: {
        OR: [
          {
            customer: {
              name: { contains: search },
            },
          },
          {
            reward: {
              name: { contains: search },
            },
          },
          {
            location: {
              name: { contains: search },
            },
          },
        ],
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        reward: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getRedemptionStats(id: number) {
    const [customer, reward, location, totalRedemptions, recentRedemptions] =
      await Promise.all([
        prisma.customer.findUnique({
          where: { id },
          select: { id: true, name: true },
        }),
        prisma.reward.findUnique({
          where: { id },
          select: { id: true, name: true },
        }),
        prisma.location.findUnique({
          where: { id },
          select: { id: true, name: true },
        }),
        prisma.redemption.count({
          where: { id },
        }),
        prisma.redemption.findMany({
          where: { id },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { id: true, name: true } },
            reward: { select: { id: true, name: true } },
          },
        }),
      ]);

    return {
      customer,
      reward,
      location,
      totalRedemptions,
      recentRedemptions,
    };
  }

  async checkRedemptionExists(id: number): Promise<boolean> {
    const count = await this.repository.count({
      where: { id },
    });
    return count > 0;
  }

  async checkRedemptionOfCustomerForTierExists(
    tierId: number,
    customerId: number
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        customer: {
          id: customerId,
          customerTiers: {
            some: {
              tierId: tierId,
            },
          },
        },
      },
    });
    return count > 0;
  }
}
