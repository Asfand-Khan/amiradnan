import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createNotificationSchema,
  getSingleNotificationSchema,
} from "../validations/notification.validations.js";

const router = Router();
const notificationController = new NotificationController();

router.use(authenticateToken);

router.get("/", notificationController.getAll);
router.post(
  "/",
  validateResource(getSingleNotificationSchema),
  notificationController.getAllNotificationsCustomerWise
);

router.post(
  "/send",
  validateResource(createNotificationSchema),
  notificationController.sendNotification
);

router.post(
  "/single",
  validateResource(getSingleNotificationSchema),
  notificationController.getSingleNotification
);

export default router;
