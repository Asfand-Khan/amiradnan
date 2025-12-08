import { PointsExpiryDefault } from "@prisma/client";
import { PointsExpiryDefaultRepository } from "../repositories/points-expiry-default.repository.js";
import { UpdatePointsExpiryDefault } from "../validations/points-expiry-default.validations.js";

export class PointsExpiryDefaultService {
  private repository: PointsExpiryDefaultRepository;

  constructor() {
    this.repository = new PointsExpiryDefaultRepository();
  }

  async create(
    name: string,
    expiryDays: number,
    createdBy: number,
    active: boolean
  ): Promise<PointsExpiryDefault> {
    if (active) {
      await this.repository.deactivateAll();
    }
    return await this.repository.create(name, expiryDays, createdBy, active);
  }

  async getAll(): Promise<PointsExpiryDefault[]> {
    return await this.repository.findAll();
  }

  async getById(id: number): Promise<PointsExpiryDefault | null> {
    return await this.repository.findById(id);
  }

  async update(data: UpdatePointsExpiryDefault): Promise<PointsExpiryDefault> {
    const { configId, ...updateData } = data;
    const config = await this.repository.findById(configId!); // zod validates existence if part of payload but repo needs ID
    if (!config) throw new Error("Points Expiry Configuration not found");

    if (updateData.active) {
      await this.repository.deactivateAll();
    }

    return await this.repository.update(configId!, updateData);
  }

  async delete(id: number): Promise<PointsExpiryDefault> {
    const config = await this.repository.findById(id);
    if (!config) throw new Error("Points Expiry Configuration not found");
    return await this.repository.delete(id);
  }
}
