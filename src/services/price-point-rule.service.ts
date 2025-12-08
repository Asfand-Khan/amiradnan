import { PricePointRule } from "@prisma/client";
import { PricePointRuleRepository } from "../repositories/price-point-rule.repository.js";
import { UpdatePricePointRule } from "../validations/price-point-rule.validations.js";

export class PricePointRuleService {
  private repository: PricePointRuleRepository;

  constructor() {
    this.repository = new PricePointRuleRepository();
  }

  async create(
    pointsPerUnit: number,
    unitValue: number
  ): Promise<PricePointRule> {
    return await this.repository.create(pointsPerUnit, unitValue);
  }

  async getAll(): Promise<PricePointRule[]> {
    return await this.repository.findAll();
  }

  async getById(id: number): Promise<PricePointRule | null> {
    return await this.repository.findById(id);
  }

  async update(data: UpdatePricePointRule): Promise<PricePointRule> {
    const { ruleId, ...updateData } = data;
    const rule = await this.repository.findById(ruleId);
    if (!rule) throw new Error("Price Point Rule not found");

    return await this.repository.update(ruleId, updateData);
  }

  async delete(id: number): Promise<PricePointRule> {
    const rule = await this.repository.findById(id);
    if (!rule) throw new Error("Price Point Rule not found");
    return await this.repository.delete(id);
  }
}
