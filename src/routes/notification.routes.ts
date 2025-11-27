import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { createNotificationSchema } from "../validations/notification.validations.js";

const router = Router();
const notificationController = new NotificationController();

router.use(authenticateToken);

router.post(
  "/send",
  validateResource(createNotificationSchema),
  notificationController.sendNotification
);

router.get("/", notificationController.getAll);

export default router;
