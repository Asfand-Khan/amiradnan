import { AppError } from "../middleware/error.middleware.js";
import { PointsTransactionService } from "./pointTransaction.service.js";
import { ChallengeService } from "./challenge.service.js";
import { TierService } from "./tier.service.js";
import prisma from "../config/database.js";
import { TransactionType, ChallengeType, Channel } from "@prisma/client";
import config from "../config/environment.js";

export class ShopifyService {
  private pointsTransactionService: PointsTransactionService;
  private challengeService: ChallengeService;
  private tierService: TierService;
  private shopifyDomain = config.shopify.domain;
  private shopifyToken = config.shopify.accessToken;

  constructor() {
    this.pointsTransactionService = new PointsTransactionService();
    this.challengeService = new ChallengeService();
    this.tierService = new TierService();
  }

  async processOrder(orderNo: string, customerId: number) {
    // 1. Fetch Order from Shopify
    const order = await this.fetchShopifyOrder(orderNo);

    if (!order) {
      throw new AppError("Order not found in Shopify", 404);
    }

    // 2. Check if order is delivered (fulfillment_status === 'fulfilled')
    if (order.fulfillment_status !== "fulfilled") {
      // We proceed only if delivered as per requirement.
      if (order.fulfillment_status !== "fulfilled") {
        return {
          success: false,
          message: "Order is not fulfilled/delivered yet.",
          orderStatus: order.fulfillment_status,
        };
      }
    }

    // 3. Check if order already processed (idempotency)
    const existingTx = await this.pointsTransactionService.findByReferenceId(
      `SHOPIFY:${order.id}`
    );
    if (existingTx) {
      return {
        success: false,
        message: "Order already processed",
        pointsAwarded: existingTx.points,
      };
    }

    // 4. Get Default Points Expiry
    const pointsExpiry =
      await this.pointsTransactionService.pointsExpiryDefault(); // get default expiry days or duration

    // 5. Calculate Points
    const orderAmount = parseFloat(order.total_price);
    const points = await this.calculatePoints(orderAmount);

    // 6. Assign Points
    await this.pointsTransactionService.creditPoints({
      customerId: customerId,
      points: points,
      type: TransactionType.shopify_order,
      referenceId: `SHOPIFY:${order.id}`,
      orderAmount: orderAmount,
      note: `Points for Shopify Order #${order.order_number}`,
      expiryDays: pointsExpiry ? pointsExpiry.expiryDays : 365,
    });

    // 7. Check Challenges
    await this.checkChallenges(customerId, order);

    // 8. Update Tier
    const newTier = await this.tierService.autoAssignTierToCustomer(
      customerId,
      await this.pointsTransactionService.getAvailablePoints(customerId)
    );

    return {
      success: true,
      message: "Order processed successfully",
      pointsAwarded: points,
      newTier: newTier ? newTier.name : "No change",
      orderStatus: order.fulfillment_status,
    };
  }

  private async fetchShopifyOrder(orderNo: string) {
    const url = `${this.shopifyDomain}/admin/api/2024-01/orders.json?name=${orderNo}&status=any`;

    try {
      const response = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": this.shopifyToken,
          "Content-Type": "application/json",
        },
      });

      console.log(response);
      if (!response.ok) {
        throw new Error(`Shopify API Error: ${response.statusText}`);
      }

      const data: any = await response.json();
      if (data.orders && data.orders.length > 0) {
        return data.orders[0];
      }
      return null;
    } catch (error) {
      console.error("Error fetching shopify order:", error);
      throw new AppError("Failed to fetch order from Shopify", 500);
    }
  }

  private async calculatePoints(amount: number): Promise<number> {
    const rule = await prisma.pricePointRule.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!rule) {
      return Math.floor(amount);
    }

    const points = Math.floor(
      (amount / Number(rule.unitValue)) * rule.pointsPerUnit
    );
    return points;
  }

  private async checkChallenges(customerId: number, order: any) {
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
        const pointsExpiry =
          await this.pointsTransactionService.pointsExpiryDefault();
        const progressUpdate = participant.progressCount + 1;

        await this.challengeService.updateProgress(
          challenge.id,
          customerId,
          progressUpdate
        );

        await this.pointsTransactionService.creditPoints({
          customerId,
          points: challenge.bonusPoints,
          type: TransactionType.challenge,
          challengeId: challenge.id,
          expiryDays: pointsExpiry ? pointsExpiry.expiryDays : 365,
        });
      }
    }
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
}
