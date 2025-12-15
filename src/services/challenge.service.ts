import { Challenge, ChallengeType, Channel } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { ChallengeRepository } from "../repositories/challenge.repository.js";
import { AppError } from "../middleware/error.middleware.js";

export class ChallengeService {
  private challengeRepository: ChallengeRepository;

  constructor() {
    this.challengeRepository = new ChallengeRepository();
  }

  async createChallenge(data: {
    name: string;
    description?: string;
    type: ChallengeType;
    requiredAmount: number;
    requiredPurchases: number;
    durationDays?: number;
    customerUsage?: number;
    channel: Channel;
    bonusPoints: number;
    bonusPercent: number;
    startAt?: string;
    endAt?: string;
    active: boolean;
  }): Promise<Challenge> {
    const challengeData: Prisma.ChallengeCreateInput = {
      name: data.name,
      description: data.description,
      type: data.type,
      requiredAmount: data.requiredAmount,
      requiredPurchases: data.requiredPurchases,
      durationDays: data.durationDays,
      customerUsage: data.customerUsage,
      channel: data.channel,
      bonusPoints: data.bonusPoints,
      bonusPercent: data.bonusPercent,
      startAt: data.startAt ? new Date(data.startAt) : null,
      endAt: data.endAt ? new Date(data.endAt) : null,
      active: data.active,
    };

    return await this.challengeRepository.create(challengeData);
  }

  async getChallengeById(id: number): Promise<Challenge> {
    const challenge = await this.challengeRepository.findById(id);

    if (!challenge) {
      throw new AppError("Challenge not found");
    }

    return challenge;
  }

  async getChallengeByType(type: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findByType(type);

    if (!challenge) {
      throw new AppError("Challenge not found");
    }

    return challenge;
  }

  async getAllChallenges(): Promise<Challenge[]> {
    const data = await this.challengeRepository.findAll({
      where: {
        isDeleted: false,
      },
    });
    return data;
  }

  async getAllActiveChallenges(customerId: number): Promise<Challenge[]> {
    return await this.challengeRepository.findAllActive(customerId);
  }

  async updateChallenge(
    id: number,
    data: Partial<{
      name: string;
      description?: string;
      type: ChallengeType;
      requiredAmount: number;
      requiredPurchases: number;
      durationDays?: number;
      customerUsage?: number;
      channel: Channel;
      bonusPoints: number;
      bonusPercent: number;
      startAt?: string;
      endAt?: string;
      active: boolean;
    }>
  ): Promise<Challenge> {
    // Check if challenge exists
    await this.getChallengeById(id);

    const updateData: Prisma.ChallengeUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.requiredAmount !== undefined)
      updateData.requiredAmount = data.requiredAmount;
    if (data.requiredPurchases !== undefined)
      updateData.requiredPurchases = data.requiredPurchases;
    if (data.durationDays !== undefined)
      updateData.durationDays = data.durationDays;
    if (data.customerUsage !== undefined)
      updateData.customerUsage = data.customerUsage;
    if (data.channel !== undefined) updateData.channel = data.channel;
    if (data.bonusPoints !== undefined)
      updateData.bonusPoints = data.bonusPoints;
    if (data.bonusPercent !== undefined)
      updateData.bonusPercent = data.bonusPercent;
    if (data.startAt !== undefined)
      updateData.startAt = data.startAt ? new Date(data.startAt) : null;
    if (data.endAt !== undefined)
      updateData.endAt = data.endAt ? new Date(data.endAt) : null;
    if (data.active !== undefined) updateData.active = data.active;

    return await this.challengeRepository.update(id, updateData);
  }

  async deleteChallenge(id: number): Promise<Challenge> {
    // Check if challenge exists
    await this.getChallengeById(id);

    return await this.challengeRepository.delete(id);
  }

  async enrollCustomer(
    challengeId: number,
    customerId: number,
    progressCount?: number,
    completed?: number
  ) {
    await this.getChallengeById(challengeId); // Check if challenge exists

    const existingParticipant = await this.challengeRepository.findParticipant(
      challengeId,
      customerId
    );
    if (existingParticipant) {
      throw new AppError("Customer is already enrolled in this challenge");
    }

    const result = await this.challengeRepository.enrollCustomer(
      challengeId,
      customerId,
      progressCount,
      completed
    );

    return result;
  }

  async updateProgress(
    challengeId: number,
    customerId: number,
    progressCount: number
  ) {
    const participant = await this.challengeRepository.findParticipant(
      challengeId,
      customerId
    );

    if (!participant) {
      throw new AppError("Customer is not enrolled in this challenge");
    }

    if (participant.completed === 1) {
      throw new AppError("Challenge already completed");
    }

    const challenge = participant.challenge;

    // Update progress
    const updated = await this.challengeRepository.updateProgress(
      challengeId,
      customerId,
      progressCount
    );

    // Check if challenge is completed
    let isCompleted = updated.progressCount == challenge.customerUsage;

    // Mark as completed if conditions met
    if (isCompleted) {
      await this.challengeRepository.markAsCompleted(challengeId, customerId);
    }

    return updated;
  }

  async getCustomerChallenges(
    customerId: number,
    status: "active" | "completed" | "all" = "all"
  ) {
    return await this.challengeRepository.findCustomerChallenges(
      customerId,
      status
    );
  }

  async getChallengeStats(challengeId: number) {
    await this.getChallengeById(challengeId);
    return await this.challengeRepository.getChallengeStats(challengeId);
  }

  async getActiveChallenges(type?: ChallengeType) {
    if (type) {
      return await this.challengeRepository.findActiveByType(type);
    }

    return await this.challengeRepository.findAll({
      where: {
        active: true,
        OR: [
          { startAt: null, endAt: null },
          { startAt: { lte: new Date() }, endAt: { gte: new Date() } },
          { startAt: { lte: new Date() }, endAt: null },
        ],
      },
    });
  }

  async findParticipant(challengeId: number, customerId: number) {
    const existingParticipant = await this.challengeRepository.findParticipant(
      challengeId,
      customerId
    ); // Check if customer is already enrolled

    if (existingParticipant) {
      throw new AppError("Customer is already enrolled in this challenge");
    }

    return existingParticipant;
  }

  async getParticipant(challengeId: number, customerId: number) {
    return await this.challengeRepository.findParticipant(
      challengeId,
      customerId
    );
  }

  async getEachTypeLatestChallenge() {
    return await this.challengeRepository.getLatestEachTypeChallenges();
  }
}
