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

  async findAll(): Promise<{ notifications: Notification[] }> {
    const notifications = await this.repository.findMany({
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
