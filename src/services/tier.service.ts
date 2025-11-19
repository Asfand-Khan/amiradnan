import { Tier, Prisma } from "@prisma/client";
import { TierRepository } from "../repositories/tier.repository.js";
import { AppError } from "../middleware/error.middleware.js";
import { saveBase64Image } from "../utils/file.util.js";
export class TierService {
  private tierRepository: TierRepository;

  constructor() {
    this.tierRepository = new TierRepository();
  }

  async createTier(data: {
    name: string;
    threshold: number;
    description?: string;
    displayOrder: number;
    active: number;
    rewards: number[];
    image: string;
  }): Promise<Tier> {
    // Check if tier with same threshold already exists
    const existingTier = await this.tierRepository.findByThreshold(
      data.threshold
    );

    if (existingTier && existingTier.threshold === data.threshold) {
      throw new AppError("A tier with this threshold already exists");
    }

    let image: string | null = null;
    if (data.image) {
      image = await saveBase64Image(data.image, "tiers");
    }

    const tierData: Prisma.TierCreateInput = {
      name: data.name,
      threshold: data.threshold,
      description: data.description,
      displayOrder: data.displayOrder,
      active: data.active,
      image,
      tierRewards: {
        create: data.rewards.map((rewardId) => ({ rewardId })),
      },
    };

    return await this.tierRepository.create(tierData);
  }

  async getTierById(id: number): Promise<Tier> {
    const tier = await this.tierRepository.findById(id);

    if (!tier) {
      throw new AppError("Tier not found");
    }

    return tier;
  }

  async getAllTiers(params: {
    page: number;
    limit: number;
    active?: number;
    search?: string;
  }): Promise<{
    data: Tier[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (params.page - 1) * params.limit;

    const where: Prisma.TierWhereInput = {
      isDeleted: false,
    };

    if (params.active !== undefined) {
      where.active = params.active;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    const { data, total } = await this.tierRepository.findAll({
      skip,
      take: params.limit,
      where,
      orderBy: { displayOrder: "asc" },
    });

    return {
      data,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async getAllActiveTiers(): Promise<Tier[]> {
    const data = await this.tierRepository.findAllActive();
    return data;
  }

  async updateTier(
    id: number,
    data: Partial<{
      name: string;
      threshold: number;
      description?: string;
      displayOrder: number;
      active: number;
      rewards: number[];
      image: string;
    }>
  ): Promise<Tier> {
    // Check if tier exists
    await this.getTierById(id);

    // If updating threshold, check for conflicts
    if (data.threshold !== undefined) {
      const existingTier = await this.tierRepository.findByThreshold(
        data.threshold
      );

      if (
        existingTier &&
        existingTier.id !== id &&
        existingTier.threshold === data.threshold
      ) {
        throw new AppError("A tier with this threshold already exists");
      }
    }

    const updateData: Prisma.TierUpdateInput = {};

    if (data.image !== undefined) {
      const image = await saveBase64Image(data.image, "tiers");
      updateData.image = image;
    }

    if (data.name !== undefined) updateData.name = data.name;
    if (data.threshold !== undefined) updateData.threshold = data.threshold;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.displayOrder !== undefined)
      updateData.displayOrder = data.displayOrder;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.rewards !== undefined) {
      updateData.tierRewards = {
        deleteMany: {},
        create: data.rewards.map((rewardId) => ({ rewardId })),
      };
    }

    return await this.tierRepository.update(id, updateData);
  }

  async deleteTier(id: number): Promise<Tier> {
    // Check if tier exists
    await this.getTierById(id);

    // Check if tier has customers
    const stats = await this.tierRepository.getTierStats(id);

    if (stats.customerCount > 0) {
      throw new AppError(
        "Cannot delete tier with assigned customers. Please reassign customers first."
      );
    }

    return await this.tierRepository.delete(id);
  }

  async assignTierToCustomer(tierId: number, customerId: number) {
    // Check if tier exists
    await this.getTierById(tierId);

    // Check if customer already has this tier
    const existingAssignment = await this.tierRepository.findCustomerTier(
      tierId,
      customerId
    );

    if (existingAssignment) {
      throw new AppError("Customer already has this tier assigned");
    }

    return await this.tierRepository.assignTierToCustomer(tierId, customerId);
  }

  async removeTierFromCustomer(tierId: number, customerId: number) {
    // Check if assignment exists
    const assignment = await this.tierRepository.findCustomerTier(
      tierId,
      customerId
    );

    if (!assignment) {
      throw new AppError("Tier assignment not found");
    }

    return await this.tierRepository.removeTierFromCustomer(tierId, customerId);
  }

  async getCustomerTiers(customerId: number) {
    return await this.tierRepository.findCustomerTiers(customerId);
  }

  async getTierCustomers(
    tierId: number,
    page: number,
    limit: number
  ): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    // Check if tier exists
    await this.getTierById(tierId);

    const skip = (page - 1) * limit;
    const { data, total } = await this.tierRepository.findTierCustomers(
      tierId,
      skip,
      limit
    );

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTierStats(tierId: number) {
    await this.getTierById(tierId);
    return await this.tierRepository.getTierStats(tierId);
  }

  async bulkAssignTiers(
    assignments: Array<{ customerId: number; tierId: number }>
  ) {
    // Validate all tier IDs exist
    const tierIds = [...new Set(assignments.map((a) => a.tierId))];

    for (const tierId of tierIds) {
      await this.getTierById(tierId);
    }

    return await this.tierRepository.bulkAssignTiers(assignments);
  }

  async reorderTiers(orders: Array<{ id: number; displayOrder: number }>) {
    // Validate all tier IDs exist
    for (const order of orders) {
      await this.getTierById(order.id);
    }

    await this.tierRepository.updateDisplayOrders(orders);

    return { success: true, message: "Tiers reordered successfully" };
  }

  async getActiveTiers() {
    return await this.tierRepository.getActiveTiers();
  }

  async getTierForPoints(points: number): Promise<Tier | null> {
    return await this.tierRepository.findByThreshold(points);
  }

  async autoAssignTierToCustomer(customerId: number, totalPoints: number) {
    // Find appropriate tier based on points
    const tier = await this.calculateTierByPoints(totalPoints);

    if (!tier) {
      return null;
    }

    // Get customer's current tiers
    const currentTiers = await this.tierRepository.findCustomerTiers(
      customerId
    );

    // Check if customer already has this tier
    const hasTier = currentTiers.some((ct) => ct.tierId === tier.id);

    if (!hasTier) {
      // Assign new tier
      await this.tierRepository.assignTierToCustomer(tier.id, customerId);

      // Optionally remove lower tiers
      const lowerTiers = currentTiers.filter(
        (ct) => ct.tier.threshold < tier.threshold
      );

      for (const lowerTier of lowerTiers) {
        await this.tierRepository.removeTierFromCustomer(
          lowerTier.tierId,
          customerId
        );
      }
    }

    return tier;
  }

  async calculateTierByPoints(points: number): Promise<Tier | null> {
    const activeTiers = await this.tierRepository.getActiveTiers(); // Get all active tiers ordered by threshold descending
    if (!activeTiers || activeTiers.length === 0) {
      return null;
    }
    const sortedTiers = activeTiers.sort((a, b) => b.threshold - a.threshold); // Sort tiers by threshold in descending order (highest first)
    const qualifyingTier = sortedTiers.find((tier) => points >= tier.threshold); // Find the first tier where points meet or exceed the threshold
    return qualifyingTier || null;
  }
}
