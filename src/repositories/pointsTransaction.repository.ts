// src/repositories/pointsTransaction.repository.ts
import {
  PointsTransaction,
  PointsBalance,
  PointsExpiryBatch,
  Prisma,
  TransactionType,
  PointsExpiryDefault,
  PricePointRule,
} from "@prisma/client";
import prisma from "../config/database.js";

export class PointsTransactionRepository {
  private repository = prisma.pointsTransaction;
  private balanceRepository = prisma.pointsBalance;
  private expiryBatchRepository = prisma.pointsExpiryBatch;
  private pointsExpiryDefaultRepository = prisma.pointsExpiryDefault;
  private pricePointRuleRepository = prisma.pricePointRule;

  async create(
    data: Prisma.PointsTransactionCreateInput
  ): Promise<PointsTransaction> {
    return await this.repository.create({
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        challenge: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<PointsTransaction | null> {
    return await this.repository.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        challenge: true,
        location: true,
        expiryBatches: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PointsTransactionWhereInput;
    orderBy?: Prisma.PointsTransactionOrderByWithRelationInput;
  }): Promise<{ data: PointsTransaction[]; total: number }> {
    const { skip, take, where, orderBy } = params;

    const [data, total] = await Promise.all([
      this.repository.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          challenge: {
            select: {
              id: true,
              name: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.repository.count({ where }),
    ]);

    return { data, total };
  }

  async findByCustomerId(
    customerId: number,
    skip?: number,
    take?: number,
    where?: Prisma.PointsTransactionWhereInput
  ): Promise<{ data: PointsTransaction[]; total: number }> {
    const whereClause: Prisma.PointsTransactionWhereInput = {
      customerId,
      ...where,
    };

    const [data, total] = await Promise.all([
      this.repository.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          challenge: {
            select: {
              id: true,
              name: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.repository.count({ where: whereClause }),
    ]);

    return { data, total };
  }

  // Points balance methods
  async getCustomerBalance(customerId: number): Promise<PointsBalance | null> {
    return await this.balanceRepository.findUnique({
      where: { customerId },
    });
  }

  async createOrUpdateBalance(
    customerId: number,
    points: number
  ): Promise<PointsBalance> {
    const existingBalance = await this.getCustomerBalance(customerId);

    if (existingBalance) {
      return await this.balanceRepository.update({
        where: { customerId },
        data: {
          totalPoints: existingBalance.totalPoints + points,
          availablePoints: existingBalance.availablePoints + points,
        },
      });
    } else {
      return await this.balanceRepository.create({
        data: {
          customerId,
          totalPoints: Math.max(0, points),
          availablePoints: Math.max(0, points),
        },
      });
    }
  }

  async updateAvailablePoints(
    customerId: number,
    pointsChange: number
  ): Promise<PointsBalance> {
    const balance = await this.getCustomerBalance(customerId);

    if (!balance) {
      throw new Error("Customer balance not found");
    }

    return await this.balanceRepository.update({
      where: { customerId },
      data: {
        availablePoints: balance.availablePoints + pointsChange,
      },
    });
  }

  // Expiry batch methods
  async createExpiryBatch(
    customerId: number,
    transactionId: number,
    points: number,
    expiresAt: Date
  ): Promise<PointsExpiryBatch> {
    return await this.expiryBatchRepository.create({
      data: {
        customerId,
        transactionId,
        pointsAllocated: points,
        pointsRemaining: points,
        expiresAt,
      },
    });
  }

  async getExpiryBatches(customerId: number): Promise<PointsExpiryBatch[]> {
    return await this.expiryBatchRepository.findMany({
      where: {
        customerId,
        pointsRemaining: { gt: 0 },
      },
      orderBy: { expiresAt: "asc" },
    });
  }

  async getExpiringPoints(
    customerId: number,
    daysAhead: number
  ): Promise<PointsExpiryBatch[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await this.expiryBatchRepository.findMany({
      where: {
        customerId,
        pointsRemaining: { gt: 0 },
        expiresAt: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      orderBy: { expiresAt: "asc" },
      include: {
        transaction: {
          select: {
            id: true,
            type: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async deductFromExpiryBatches(
    customerId: number,
    pointsToDeduct: number
  ): Promise<void> {
    const batches = await this.getExpiryBatches(customerId);

    let remaining = pointsToDeduct;

    for (const batch of batches) {
      if (remaining <= 0) break;

      const deductFromBatch = Math.min(batch.pointsRemaining, remaining);

      await this.expiryBatchRepository.update({
        where: { id: batch.id },
        data: {
          pointsRemaining: batch.pointsRemaining - deductFromBatch,
        },
      });

      remaining -= deductFromBatch;
    }

    if (remaining > 0) {
      throw new Error("Insufficient points to deduct");
    }
  }

  async expirePoints(batchId: number): Promise<PointsExpiryBatch> {
    return await this.expiryBatchRepository.update({
      where: { id: batchId },
      data: {
        pointsRemaining: 0,
      },
    });
  }

  // Statistics methods
  async getTransactionStats(params: {
    customerId?: number;
    startDate?: Date;
    endDate?: Date;
    groupBy: "type" | "location" | "date" | "customer";
  }) {
    const where: Prisma.PointsTransactionWhereInput = {};

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    // Group by type
    if (params.groupBy === "type") {
      return await this.repository.groupBy({
        by: ["type"],
        where,
        _sum: { points: true },
        _count: { id: true },
      });
    }

    // Group by location
    if (params.groupBy === "location") {
      return await this.repository.groupBy({
        by: ["locationId"],
        where,
        _sum: { points: true },
        _count: { id: true },
      });
    }

    // Group by customer
    if (params.groupBy === "customer") {
      return await this.repository.groupBy({
        by: ["customerId"],
        where,
        _sum: { points: true },
        _count: { id: true },
      });
    }

    // Default: summary stats
    const [totalTransactions, totalPoints, creditPoints, debitPoints] =
      await Promise.all([
        this.repository.count({ where }),
        this.repository.aggregate({
          where,
          _sum: { points: true },
        }),
        this.repository.aggregate({
          where: { ...where, points: { gt: 0 } },
          _sum: { points: true },
        }),
        this.repository.aggregate({
          where: { ...where, points: { lt: 0 } },
          _sum: { points: true },
        }),
      ]);

    return {
      totalTransactions,
      totalPoints: totalPoints._sum.points || 0,
      creditPoints: creditPoints._sum.points || 0,
      debitPoints: Math.abs(debitPoints._sum.points || 0),
    };
  }

  async getCustomerTransactionSummary(customerId: number) {
    const [
      totalEarned,
      totalSpent,
      totalExpired,
      transactionCount,
      lastTransaction,
    ] = await Promise.all([
      this.repository.aggregate({
        where: { customerId, points: { gt: 0 } },
        _sum: { points: true },
      }),
      this.repository.aggregate({
        where: { customerId, type: TransactionType.redeem },
        _sum: { points: true },
      }),
      this.repository.aggregate({
        where: { customerId, type: TransactionType.expiry },
        _sum: { points: true },
      }),
      this.repository.count({ where: { customerId } }),
      this.repository.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      totalEarned: totalEarned._sum.points || 0,
      totalSpent: Math.abs(totalSpent._sum.points || 0),
      totalExpired: Math.abs(totalExpired._sum.points || 0),
      transactionCount,
      lastTransaction,
    };
  }

  async findByReferenceId(
    referenceId: string
  ): Promise<PointsTransaction | null> {
    return await this.repository.findFirst({
      where: { referenceId },
    });
  }

  async getTotalPointsByType(
    customerId: number,
    type: TransactionType
  ): Promise<number> {
    const result = await this.repository.aggregate({
      where: { customerId, type },
      _sum: { points: true },
    });

    return result._sum.points || 0;
  }

  async getRecentTransactions(
    customerId: number,
    limit: number = 10
  ): Promise<PointsTransaction[]> {
    return await this.repository.findMany({
      where: { customerId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        challenge: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getPointsExpiryDefault(): Promise<PointsExpiryDefault | null> {
    return await this.pointsExpiryDefaultRepository.findFirst({
      where: {
        active: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async sumAvailablePoints(customerId: number): Promise<number> {
    const result = await this.repository.aggregate({
      where: {
        customerId,
        expiryDate: { gt: new Date() },
      },
      _sum: {
        points: true,
      },
    });

    return result._sum.points || 0;
  }

  async getCustomerTransactions(customerId: number) {
    const transactions = await this.repository.findMany({
      where: {
        customerId: customerId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        challenge: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const currentTime = new Date();

    return transactions.map((tx) => ({
      ...tx,
      isExpired: tx.expiryDate < currentTime,
      status: tx.expiryDate < currentTime ? "Expired" : "Valid",
    }));
  }

  async getAllCustomersTransactions(locationId?: number) {
    const where: Prisma.PointsTransactionWhereInput = locationId
      ? { locationId }
      : {};

    const transactions = await this.repository.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        challenge: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const currentTime = new Date();

    return transactions.map((tx) => ({
      ...tx,
      isExpired: tx.expiryDate < currentTime,
      status: tx.expiryDate < currentTime ? "Expired" : "Valid",
    }));
  }

  async getLatestPricePointRule(): Promise<PricePointRule | null> {
    return await this.pricePointRuleRepository.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }
}
