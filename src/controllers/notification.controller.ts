import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { NotificationType } from "@prisma/client";
import { ResponseUtil } from "../utils/response.util.js";
import { AuthRequest } from "../types/index.js";
import { CreateNotification } from "../validations/notification.validations.js";

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  public sendNotification = catchAsync(
    async (req: AuthRequest, res: Response) => {
      const createdBy = req.user!.id;
      const { title, body, type }: CreateNotification = req.body;

      const notification = await this.notificationService.sendNotification(
        title,
        body,
        type as NotificationType,
        createdBy
      );

      ResponseUtil.created(res, notification, "Notification sent successfully");
    }
  );

  public getAll = catchAsync(async (_req: Request, res: Response) => {
    const result = await this.notificationService.getAllNotifications();
    ResponseUtil.success(res, result, "Notifications retrieved successfully");
  });
}
