import { Router } from "express";
import { PointsExpiryDefaultController } from "../controllers/points-expiry-default.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createPointsExpiryDefaultSchema,
  singlePointsExpiryDefaultSchema,
  updatePointsExpiryDefaultSchema,
} from "../validations/points-expiry-default.validations.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new PointsExpiryDefaultController();

// Protect all routes
router.use(authenticateToken);

router.post(
  "/",
  validateResource(createPointsExpiryDefaultSchema),
  controller.create
);
router.get("/", controller.getAll);
router.post(
  "/single",
  validateResource(singlePointsExpiryDefaultSchema),
  controller.getById
);
router.put(
  "/",
  validateResource(updatePointsExpiryDefaultSchema),
  controller.update
);
router.delete(
  "/",
  validateResource(singlePointsExpiryDefaultSchema),
  controller.delete
);

export default router;
