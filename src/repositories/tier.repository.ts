import { CustomerTier, Prisma, Tier } from "@prisma/client";
import prisma from "../config/database.js";

export class TierRepository {
  private repository = prisma.tier;
  private customerTierRepository = prisma.customerTier;

  async create(data: Prisma.TierCreateInput): Promise<Tier> {
    return await this.repository.create({
      data,
    });
  }

  async findById(id: number): Promise<Tier | null> {
    return await this.repository.findUnique({
      where: { id },
      include: {
        tierRewards: {
          select: {
            reward: {
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

  async findAll(params: {
    where?: Prisma.TierWhereInput;
    orderBy?: Prisma.TierOrderByWithRelationInput;
  }): Promise<Tier[]> {
    const { where, orderBy } = params;

    const data = await this.repository.findMany({
      where,
      orderBy: orderBy || { displayOrder: "asc" },
    });

    return data;
  }

  async findAllActive(): Promise<any[]> {
    return await this.repository.findMany({
      where: { active: 1, isDeleted: false },
      include: {
        tierRewards: {
          select: {
            reward: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.TierUpdateInput): Promise<Tier> {
    return await this.repository.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Tier> {
    return await this.repository.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  async findByThreshold(threshold: number): Promise<Tier | null> {
    return await this.repository.findFirst({
      where: {
        threshold: { lte: threshold },
        active: 1,
      },
      orderBy: {
        threshold: "desc",
      },
    });
  }

  async assignTierToCustomer(
    tierId: number,
    customerId: number
  ): Promise<CustomerTier> {
    return await this.customerTierRepository.create({
      data: {
        tierId,
        customerId,
      },
      include: { tier: true },
    });
  }

  async removeTierFromCustomer(
    tierId: number,
    customerId: number
  ): Promise<CustomerTier> {
    return await this.customerTierRepository.delete({
      where: {
        customerId_tierId: {
          customerId,
          tierId,
        },
      },
    });
  }

  async findCustomerTier(
    tierId: number,
    customerId: number
  ): Promise<CustomerTier | null> {
    return await this.customerTierRepository.findUnique({
      where: {
        customerId_tierId: {
          customerId,
          tierId,
        },
      },
    });
  }

  async findCustomerTiers(customerId: number): Promise<any[]> {
    return await this.customerTierRepository.findMany({
      where: { customerId },
      orderBy: {
        assignedAt: "desc",
      },
      include: { tier: true },
    });
  }

  async findTierCustomers(
    tierId: number,
    skip?: number,
    take?: number
  ): Promise<{ data: CustomerTier[]; total: number }> {
    const [data, total] = await Promise.all([
      this.customerTierRepository.findMany({
        where: { tierId },
        skip,
        take,
        orderBy: {
          assignedAt: "desc",
        },
      }),
      this.customerTierRepository.count({ where: { tierId } }),
    ]);

    return { data, total };
  }

  async getTierStats(tierId: number) {
    const customerCount = await this.customerTierRepository.count({
      where: { tierId },
    });

    return {
      customerCount,
    };
  }

  async bulkAssignTiers(
    assignments: Array<{ customerId: number; tierId: number }>
  ): Promise<Prisma.BatchPayload> {
    const data = assignments.map((a) => ({
      customerId: a.customerId,
      tierId: a.tierId,
      assignedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return await this.customerTierRepository.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async updateDisplayOrders(
    orders: Array<{ id: number; displayOrder: number }>
  ): Promise<void> {
    await prisma.$transaction(
      orders.map((order) =>
        this.repository.update({
          where: { id: order.id },
          data: { displayOrder: order.displayOrder },
        })
      )
    );
  }

  async getActiveTiers(): Promise<Tier[]> {
    return await this.repository.findMany({
      where: { active: 1 },
      orderBy: { threshold: "desc" },
    });
  }

  async getTiersByThresholdRange(
    minThreshold: number,
    maxThreshold: number
  ): Promise<Tier[]> {
    return await this.repository.findMany({
      where: {
        threshold: {
          gte: minThreshold,
          lte: maxThreshold,
        },
        active: 1,
      },
      orderBy: { threshold: "asc" },
    });
  }
}
