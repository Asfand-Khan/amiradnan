import prisma from "../config/database.js";
import { Notification, Prisma } from "@prisma/client";

export class NotificationRepository {
  private repository = prisma.notification;

  async create(
    data: Prisma.NotificationUncheckedCreateInput
  ): Promise<Notification> {
    return await this.repository.create({
      data,
    });
  }

  async findAllByCustomerId(
    customerId: number
  ): Promise<{ notifications: Notification[] }> {
    const notifications = await this.repository.findMany({
      where: {
        customerId,
      },
      orderBy: { createdAt: "desc" },
    });

    return { notifications };
  }

  async findAll(
    customerId?: number | undefined | null
  ): Promise<{ notifications: Notification[] }> {
    const where: Prisma.NotificationWhereInput = customerId
      ? { OR: [{ customerId }, { customerId: null }] }
      : {};

    const notifications = await this.repository.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { notifications };
  }

  async findById(id: number): Promise<Notification | null> {
    return await this.repository.findUnique({
      where: { id },
    });
  }
}
