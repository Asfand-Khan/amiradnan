import { Router } from "express";
import { RedemptionController } from "../controllers/redemption.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createRedemptionSchema,
  listRedemptionsSchema,
  singleRedemptionSchema,
  updateRedemptionSchema,
  searchRedemptionSchema,
} from "../validations/redemption.validations.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();
const redemptionController = new RedemptionController();

// Authentication applied globally
router.use(authenticateToken);

// Create redemption
router.post(
  "/create",
  validateResource(createRedemptionSchema),
  redemptionController.create
);

// Fetch single redemption
router.post(
  "/get",
  validateResource(singleRedemptionSchema),
  redemptionController.getById
);

// List redemptions
router.get(
  "/list",
  validateResource(listRedemptionsSchema),
  redemptionController.getAll
);

// List redemptions
router.get("/all", redemptionController.getAllRedemptionList);

// Update redemption
router.put(
  "/update",
  validateResource(updateRedemptionSchema),
  redemptionController.update
);

// Delete redemption
router.delete(
  "/delete",
  validateResource(singleRedemptionSchema),
  redemptionController.delete
);

// Stats
router.post(
  "/stats",
  validateResource(singleRedemptionSchema),
  redemptionController.getStats
);

// Search
router.get(
  "/search",
  validateResource(searchRedemptionSchema),
  redemptionController.search
);

export default router;
