import { Reward, Prisma } from "@prisma/client";
import { AppError } from "../middleware/error.middleware.js";
import { RewardRepository } from "../repositories/reward.repository.js";

export class RewardService {
  private rewardRepository: RewardRepository;

  constructor() {
    this.rewardRepository = new RewardRepository();
  }

  async createReward(data: {
    name: string;
    description?: string;
    active: boolean;
  }): Promise<Reward> {
    // Check if reward with same name already exists
    const existingReward = await this.rewardRepository.findByName(data.name);

    if (existingReward) {
      throw new AppError("A reward with this name already exists", 409);
    }

    const rewardData: Prisma.RewardCreateInput = {
      name: data.name,
      description: data.description,
      active: data.active,
    };

    return await this.rewardRepository.create(rewardData);
  }

  async getRewardById(id: number): Promise<Reward> {
    const reward = await this.rewardRepository.findById(id);

    if (!reward || reward.isDeleted) {
      throw new AppError("Reward not found", 404);
    }

    return reward;
  }

  async getAllRewards(params: {
    active?: boolean;
    search?: string;
  }): Promise<Reward[]> {
    const where: Prisma.RewardWhereInput = {
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

    return await this.rewardRepository.findAll(where);
  }

  async updateReward(
    id: number,
    data: Partial<{
      name: string;
      description?: string;
      active: boolean;
    }>
  ): Promise<Reward> {
    // Check if reward exists
    await this.getRewardById(id);

    // If updating name, check for duplicates
    if (data.name) {
      const existingReward = await this.rewardRepository.findByName(data.name);

      if (existingReward && existingReward.id !== id) {
        throw new AppError("A reward with this name already exists", 409);
      }
    }

    const updateData: Prisma.RewardUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.active !== undefined) updateData.active = data.active;

    return await this.rewardRepository.update(id, updateData);
  }

  async deleteReward(id: number): Promise<Reward> {
    // Check if reward exists
    await this.getRewardById(id);

    // Check if reward has redemptions
    const stats = await this.rewardRepository.getRewardStats(id);

    if (stats.redemptionCount > 0) {
      throw new AppError(
        "Cannot delete reward with existing redemptions. Deactivate it instead.",
        400
      );
    }

    // Soft delete
    return await this.rewardRepository.softDelete(id);
  }

  async restoreReward(id: number): Promise<Reward> {
    const reward = await this.rewardRepository.findById(id);

    if (!reward) {
      throw new AppError("Reward not found", 404);
    }

    if (!reward.isDeleted) {
      throw new AppError("Reward is not deleted", 400);
    }

    return await this.rewardRepository.restore(id);
  }

  async hardDeleteReward(id: number): Promise<Reward> {
    const reward = await this.rewardRepository.findById(id);

    if (!reward) {
      throw new AppError("Reward not found", 404);
    }

    // Check if reward has redemptions
    const stats = await this.rewardRepository.getRewardStats(id);

    if (stats.redemptionCount > 0) {
      throw new AppError(
        "Cannot permanently delete reward with existing redemptions.",
        400
      );
    }

    return await this.rewardRepository.hardDelete(id);
  }

  async getActiveRewards(): Promise<Reward[]> {
    return await this.rewardRepository.getActiveRewards();
  }

  async getRewardStats(id: number) {
    await this.getRewardById(id);
    return await this.rewardRepository.getRewardStats(id);
  }

  async getRewardsByTier(tierId: number): Promise<Reward[]> {
    return await this.rewardRepository.getRewardsByTier(tierId);
  }

  async toggleRewardStatus(id: number): Promise<Reward> {
    const reward = await this.getRewardById(id);

    return await this.rewardRepository.update(id, {
      active: !reward.active,
    });
  }

  async bulkUpdateStatus(
    rewardIds: number[],
    active: boolean
  ): Promise<{ updated: number }> {
    let updated = 0;

    for (const id of rewardIds) {
      try {
        await this.updateReward(id, { active });
        updated++;
      } catch (error) {
        console.error(`Failed to update reward ${id}:`, error);
      }
    }

    return { updated };
  }

  async searchRewards(searchTerm: string): Promise<Reward[]> {
    return await this.getAllRewards({ search: searchTerm });
  }
}
