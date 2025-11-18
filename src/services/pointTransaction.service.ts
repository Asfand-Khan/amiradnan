import {
  PointsExpiryDefault,
  PointsTransaction,
  Prisma,
  TransactionType,
} from "@prisma/client";
import { PointsTransactionRepository } from "../repositories/pointsTransaction.repository.js";
import { AppError } from "../middleware/error.middleware.js";

export class PointsTransactionService {
  private pointsTransactionRepository: PointsTransactionRepository;

  constructor() {
    this.pointsTransactionRepository = new PointsTransactionRepository();
  }

  async createTransaction(data: {
    customerId: number;
    challengeId?: number;
    points: number;
    type: TransactionType;
    referenceId?: string;
    locationId?: number;
    orderAmount?: number;
    note?: string;
    expiryDate: string;
  }): Promise<PointsTransaction> {
    // Check if reference ID already exists (prevent duplicates)
    if (data.referenceId) {
      const existing = await this.pointsTransactionRepository.findByReferenceId(
        data.referenceId
      );
      if (existing) {
        throw new AppError("Transaction with this reference ID already exists");
      }
    }

    // Validate customer has sufficient points for debit transactions
    // if (data.points < 0) {
    //   const balance = await this.pointsTransactionRepository.getCustomerBalance(
    //     data.customerId
    //   );

    //   if (!balance || balance.availablePoints < Math.abs(data.points)) {
    //     throw new Error("Insufficient points balance");
    //   }
    // }

    const transactionData: Prisma.PointsTransactionCreateInput = {
      customer: { connect: { id: data.customerId } },
      challenge: data.challengeId
        ? { connect: { id: data.challengeId } }
        : undefined,
      location: data.locationId
        ? { connect: { id: data.locationId } }
        : undefined,
      points: data.points,
      type: data.type,
      referenceId: data.referenceId,
      orderAmount: data.orderAmount,
      note: data.note,
      expiryDate: data.expiryDate,
    };

    // Create transaction
    const transaction = await this.pointsTransactionRepository.create(
      transactionData
    );

    // Update customer balance
    // await this.pointsTransactionRepository.createOrUpdateBalance(
    //   data.customerId,
    //   data.points
    // );

    // Create expiry batch for credit transactions
    // if (data.points > 0) {
    //   const expiryDate = new Date(data.expiryDate);
    //   await this.pointsTransactionRepository.createExpiryBatch(
    //     data.customerId,
    //     transaction.id,
    //     data.points,
    //     expiryDate
    //   );
    // }

    // Deduct from expiry batches for debit transactions
    // if (data.points < 0) {
    //   await this.pointsTransactionRepository.deductFromExpiryBatches(
    //     data.customerId,
    //     Math.abs(data.points)
    //   );
    // }

    return transaction;
  }

  async creditPoints(data: {
    customerId: number;
    points: number;
    type: TransactionType;
    referenceId?: string;
    locationId?: number;
    challengeId?: number;
    orderAmount?: number;
    note?: string;
    expiryDays?: number;
  }): Promise<PointsTransaction> {
    // Calculate expiry date
    const expiryDays = data.expiryDays || 365; // Default 1 year
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    return await this.createTransaction({
      customerId: data.customerId,
      challengeId: data.challengeId,
      points: data.points,
      type: data.type,
      referenceId: data.referenceId,
      locationId: data.locationId,
      orderAmount: data.orderAmount,
      note: data.note,
      expiryDate: expiryDate.toISOString(),
    });
  }

  async pointsExpiryDefault(): Promise<PointsExpiryDefault | null> {
    return await this.pointsTransactionRepository.getPointsExpiryDefault();
  }

  async getAvailablePoints(customerId: number): Promise<number> {
    return await this.pointsTransactionRepository.sumAvailablePoints(customerId);
  }

  async getCustomerTransaction(customerId: number): Promise<any[]> {
    return await this.pointsTransactionRepository.getCustomerTransactions(customerId);
  }
}
