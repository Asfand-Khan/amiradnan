import {
  ChallengeType,
  Channel,
  PointsExpiryDefault,
  PointsTransaction,
  Prisma,
  TransactionType,
} from "@prisma/client";
import { PointsTransactionRepository } from "../repositories/pointsTransaction.repository.js";
import { AppError } from "../middleware/error.middleware.js";
import { ChallengeService } from "./challenge.service.js";
import { TierService } from "./tier.service.js";

export class PointsTransactionService {
  private pointsTransactionRepository: PointsTransactionRepository;
  private challengeService: ChallengeService;
  private tierService: TierService;

  constructor() {
    this.pointsTransactionRepository = new PointsTransactionRepository();
    this.challengeService = new ChallengeService();
    this.tierService = new TierService();
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
    return await this.pointsTransactionRepository.sumAvailablePoints(
      customerId
    );
  }

  async getCustomerTransaction(customerId: number): Promise<any[]> {
    return await this.pointsTransactionRepository.getCustomerTransactions(
      customerId
    );
  }

  async findByReferenceId(referenceId: string) {
    return await this.pointsTransactionRepository.findByReferenceId(
      referenceId
    );
  }

  async calculatePoints(amount: number): Promise<number> {
    const rule =
      await this.pointsTransactionRepository.getLatestPricePointRule();

    if (!rule) {
      return Math.floor(amount);
    }

    const points = Math.floor(
      (amount / Number(rule.unitValue)) * rule.pointsPerUnit
    );
    return points;
  }

  private checkProgressCondition(
    challenge: any,
    orderAmount: number,
    requiredAmount: number
  ): boolean {
    switch (challenge.type) {
      case ChallengeType.purchase_based:
        return orderAmount >= requiredAmount;

      case ChallengeType.time_based:
        const now = new Date();
        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.endDate);

        return (
          now >= startDate && now <= endDate && orderAmount >= requiredAmount
        );

      case ChallengeType.channel_based:
        return (
          challenge.channel === Channel.online ||
          challenge.channel === Channel.any
        );

      default:
        return false;
    }
  }

  async checkChallenges(customerId: number, order: any) {
    // 1. Fetch active challenges and ensure it's a clean array
    const activeChallengesResult =
      await this.challengeService.getActiveChallenges();

    let activeChallenges: any[];

    if (
      activeChallengesResult &&
      "data" in activeChallengesResult &&
      Array.isArray(activeChallengesResult.data)
    ) {
      activeChallenges = activeChallengesResult.data;
    } else if (Array.isArray(activeChallengesResult)) {
      activeChallenges = activeChallengesResult;
    } else {
      activeChallenges = [];
    }

    // Use Numbers early for clean comparisons
    const orderAmount = Number(order.total_price);
    if (isNaN(orderAmount)) return;

    for (const challenge of activeChallenges) {
      const requiredAmount = Number(challenge.requiredAmount);
      if (isNaN(requiredAmount)) continue;

      // Check if already enrolled
      let participant = await this.challengeService.getParticipant(
        challenge.id,
        customerId
      );

      if (!participant) {
        let meetsEnrollmentCondition = false;
        const isPurchaseOrChannel =
          challenge.type === ChallengeType.purchase_based ||
          challenge.type === ChallengeType.channel_based;

        if (isPurchaseOrChannel && orderAmount >= requiredAmount) {
          meetsEnrollmentCondition = true;
        } else if (challenge.type === ChallengeType.time_based) {
          const now = new Date();
          const startDate = new Date(challenge.startDate);
          const endDate = new Date(challenge.endDate);

          if (
            now >= startDate &&
            now <= endDate &&
            orderAmount >= requiredAmount
          ) {
            meetsEnrollmentCondition = true;
          }
        }

        if (meetsEnrollmentCondition) {
          await this.challengeService.enrollCustomer(challenge.id, customerId);
          participant = await this.challengeService.getParticipant(
            challenge.id,
            customerId
          );
        }
      }

      // --- PROGRESS UPDATE LOGIC ---
      if (!participant || participant.completed) continue;

      const shouldUpdateProgress = this.checkProgressCondition(
        challenge,
        orderAmount,
        requiredAmount
      );

      if (shouldUpdateProgress) {
        const pointsExpiry = await this.pointsExpiryDefault();
        const progressUpdate = participant.progressCount + 1;

        await this.challengeService.updateProgress(
          challenge.id,
          customerId,
          progressUpdate
        );

        await this.creditPoints({
          customerId,
          points: challenge.bonusPoints,
          type: TransactionType.challenge,
          challengeId: challenge.id,
          expiryDays: pointsExpiry ? pointsExpiry.expiryDays : 365,
        });
      }
    }
  }

  async processOrder(orderNo: string, customerId: number, orderAmt: number) {
    // 1. Check if order already processed (idempotency)
    const existingTx = await this.findByReferenceId(orderNo);
    if (existingTx) {
      throw new AppError("Order already processed", 400);
    }

    // 2. Get Default Points Expiry
    const pointsExpiry = await this.pointsExpiryDefault(); // get default expiry days or duration

    // 3. Calculate Points
    const orderAmount = parseFloat(orderAmt.toString());
    const points = await this.calculatePoints(orderAmount);

    // 4. Assign Points
    await this.creditPoints({
      customerId: customerId,
      points: points,
      type: TransactionType.qr_purchase,
      referenceId: orderNo,
      orderAmount: orderAmount,
      note: `Points for QR Order #${orderNo}`,
      expiryDays: pointsExpiry ? pointsExpiry.expiryDays : 365,
    });

    // 5. Check Challenges
    await this.checkChallenges(customerId, {
      total_price: orderAmount.toString(),
    });

    // 6. Update Tier
    const newTier = await this.tierService.autoAssignTierToCustomer(
      customerId,
      await this.getAvailablePoints(customerId)
    );

    return {
      success: true,
      message: "Order processed successfully",
      pointsAwarded: points,
      newTier: newTier ? newTier.name : "No change",
    };
  }
}
