import { Reward, Prisma } from "@prisma/client";
import prisma from "../config/database.js";

export class RewardRepository {
  private repository = prisma.reward;

  async create(data: Prisma.RewardCreateInput): Promise<Reward> {
    return await this.repository.create({
      data,
      include: {
        tierRewards: {
          include: {
            tier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: number): Promise<Reward | null> {
    return await this.repository.findUnique({
      where: { id },
      include: {
        tierRewards: {
          include: {
            tier: {
              select: {
                id: true,
                name: true,
                threshold: true,
              },
            },
          },
        },
        redemptions: {
          take: 10,
          orderBy: { redeemedAt: "desc" },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findByTierId(id: number): Promise<Reward[] | null> {
    return await this.repository.findMany({
      where: {
        tierRewards: {
          some: {
            tierId: id,
          },
        },
        isDeleted: false,
        active: true,
      },
    });
  }

  async findAll(where?: Prisma.RewardWhereInput): Promise<Reward[]> {
    return await this.repository.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tierRewards: {
          include: {
            tier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.RewardUpdateInput): Promise<Reward> {
    return await this.repository.update({
      where: { id },
      data,
      include: {
        tierRewards: {
          include: {
            tier: true,
          },
        },
      },
    });
  }

  async softDelete(id: number): Promise<Reward> {
    return await this.repository.update({
      where: { id },
      data: {
        isDeleted: true,
        active: false,
      },
    });
  }

  async restore(id: number): Promise<Reward> {
    return await this.repository.update({
      where: { id },
      data: {
        isDeleted: false,
      },
    });
  }

  async hardDelete(id: number): Promise<Reward> {
    return await this.repository.delete({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Reward | null> {
    return await this.repository.findFirst({
      where: {
        name,
        isDeleted: false,
      },
    });
  }

  async getActiveRewards(): Promise<Reward[]> {
    return await this.repository.findMany({
      where: {
        active: true,
        isDeleted: false,
      },
      orderBy: { name: "asc" },
      include: {
        tierRewards: {
          include: {
            tier: true,
          },
        },
      },
    });
  }

  async getRewardStats(id: number) {
    const [redemptionCount, totalRedemptions] = await Promise.all([
      prisma.redemption.count({
        where: { rewardId: id },
      }),
      prisma.redemption.groupBy({
        by: ["rewardId"],
        where: { rewardId: id },
        _count: { id: true },
      }),
    ]);

    return {
      redemptionCount,
      totalRedemptions: totalRedemptions[0]?._count.id || 0,
    };
  }

  async getRewardsByTier(tierId: number): Promise<Reward[]> {
    return await this.repository.findMany({
      where: {
        tierRewards: {
          some: {
            tierId,
          },
        },
        isDeleted: false,
      },
      include: {
        tierRewards: {
          where: { tierId },
        },
      },
    });
  }

  async checkRewardExists(id: number): Promise<boolean> {
    const count = await this.repository.count({
      where: { id, isDeleted: false },
    });
    return count > 0;
  }
}
