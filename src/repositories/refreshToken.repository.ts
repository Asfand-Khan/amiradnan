import prisma from "../config/database.js";
import { RefreshToken } from "@prisma/client";

export class RefreshTokenRepository {
  private repository = prisma.refreshToken;

  async create(
    token: string,
    expiresAt: Date,
    userId?: number,
    customerId?: number
  ): Promise<RefreshToken> {
    const refreshToken = await this.repository.create({
      data: {
        userId,
        customerId,
        token,
        expiresAt,
      },
    });
    return refreshToken;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return await this.repository.findUnique({
      where: { token },
      include: { user: true, customer: true },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.repository.delete({
      where: {
        token,
      },
    });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.repository.deleteMany({ where: { userId } });
  }

  async deleteByCustomerId(customerId: number): Promise<void> {
    await this.repository.deleteMany({ where: { customerId } });
  }

  async deleteExpired(): Promise<void> {
    await this.repository.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  async getUserTokens(userId: number): Promise<RefreshToken[]> {
    return await this.repository.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCustomerTokens(customerId: number): Promise<RefreshToken[]> {
    return await this.repository.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }
}
