import { Router } from "express";
import { validateResource } from "../middleware/validation.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { TierController } from "../controllers/tier.controller.js";
import {
  createTierSchema,
  getTierSchema,
  updateTierSchema,
} from "../validations/tier.validations.js";

const router = Router();
const tierController = new TierController();

router.use(authenticateToken);

router.get("/", tierController.getAll);
router.post("/", validateResource(createTierSchema), tierController.create);
router.post("/single", validateResource(getTierSchema), tierController.getById);
router.put("/", validateResource(updateTierSchema), tierController.update);
router.delete("/", validateResource(updateTierSchema), tierController.delete);

export default router;
