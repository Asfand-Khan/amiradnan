import { Challenge, ChallengeParticipant, Prisma } from "@prisma/client";
import prisma from "../config/database.js";
export class ChallengeRepository {
  private repository = prisma.challenge;

  async create(data: Prisma.ChallengeCreateInput): Promise<Challenge> {
    return await this.repository.create({
      data,
    });
  }

  async findById(id: number): Promise<Challenge | null> {
    return await this.repository.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(params: {
    where?: Prisma.ChallengeWhereInput;
    orderBy?: Prisma.ChallengeOrderByWithRelationInput;
  }): Promise<Challenge[]> {
    const { where } = params;

    const data = await this.repository.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return data;
  }

  async findAllActive(customerId: number): Promise<Challenge[]> {
    const query = `
      SELECT
	      c.id,
	      c.name,
	      (CASE WHEN cp.completed = 1 THEN 1 ELSE 0 END) AS is_completed,
	      c.description,
	      c.type,
	      c.required_amount,
	      c.required_purchases,
	      c.bonus_points,
	      c.start_at,
	      c.end_at 
      FROM
	      challenges c
	    LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id 
	    AND cp.customer_id = ${customerId} 
      WHERE
	      c.isDeleted = false 
	      AND c.active = true 
      ORDER BY
	      c.created_at desc
    `;
    return await prisma.$queryRawUnsafe(query);
  }

  async update(
    id: number,
    data: Prisma.ChallengeUpdateInput
  ): Promise<Challenge> {
    return await this.repository.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Challenge> {
    return await this.repository.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async findActiveByType(type: string): Promise<Challenge[]> {
    return await this.repository.findMany({
      where: {
        type: type as any,
        active: true,
        OR: [
          { startAt: null, endAt: null },
          { startAt: { lte: new Date() }, endAt: { gte: new Date() } },
          { startAt: { lte: new Date() }, endAt: null },
        ],
      },
    });
  }

  async findByType(type: string): Promise<Challenge | null> {
    return await this.repository.findFirst({
      where: {
        type: type as any,
        active: true,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Participant methods
  async enrollCustomer(
    challengeId: number,
    customerId: number,
    progressCount?: number,
    completed?: number
  ): Promise<ChallengeParticipant> {
    return await prisma.challengeParticipant.create({
      data: {
        challengeId,
        customerId,
        progressCount: progressCount ? progressCount : 0,
        completed: completed ? completed : 0,
        completedAt: completed ? new Date() : null,
      },
      include: {
        challenge: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findParticipant(
    challengeId: number,
    customerId: number
  ): Promise<any | null> {
    return await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_customerId: {
          challengeId,
          customerId,
        },
      },
      include: {
        challenge: true,
      },
    });
  }

  async updateProgress(
    challengeId: number,
    customerId: number,
    progressCount: number
  ): Promise<ChallengeParticipant> {
    return await prisma.challengeParticipant.update({
      where: {
        challengeId_customerId: {
          challengeId,
          customerId,
        },
      },
      data: {
        progressCount,
      },
      include: {
        challenge: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async markAsCompleted(
    challengeId: number,
    customerId: number
  ): Promise<ChallengeParticipant> {
    return await prisma.challengeParticipant.update({
      where: {
        challengeId_customerId: {
          challengeId,
          customerId,
        },
      },
      data: {
        completed: 1,
        completedAt: new Date(),
      },
      include: {
        challenge: true,
      },
    });
  }

  async findCustomerChallenges(
    customerId: number,
    status?: "active" | "completed" | "all"
  ): Promise<ChallengeParticipant[]> {
    const where: Prisma.ChallengeParticipantWhereInput = {
      customerId,
    };

    if (status === "completed") {
      where.completed = 1;
    } else if (status === "active") {
      where.completed = 0;
    }

    return await prisma.challengeParticipant.findMany({
      where,
      include: {
        challenge: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getChallengeStats(challengeId: number) {
    const [totalParticipants, completedParticipants] = await Promise.all([
      prisma.challengeParticipant.count({
        where: { challengeId },
      }),
      prisma.challengeParticipant.count({
        where: { challengeId, completed: 1 },
      }),
    ]);

    return {
      totalParticipants,
      completedParticipants,
      completionRate:
        totalParticipants > 0
          ? (completedParticipants / totalParticipants) * 100
          : 0,
    };
  }

  async getLatestEachTypeChallenges() {
    const query = `
    SELECT 
      t.id,
	    t.name,
	    t.description,
	    t.type,
	    t.required_amount,
	    t.required_purchases,
	    t.duration_days,
	    t.channel,
	    t.bonus_points,
	    t.start_at,
	    t.end_at
    FROM (
      SELECT 
        c.*,
        ROW_NUMBER() OVER (PARTITION BY c.type ORDER BY c.id DESC) AS rn
      FROM challenges c
      WHERE c.active = 1 AND c.isDeleted = 0
      ) AS t
    WHERE t.rn = 1;`;

    return (await prisma.$queryRawUnsafe(query)) as any[];
  }
}
