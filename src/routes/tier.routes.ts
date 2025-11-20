import { Router } from "express";
import { validateResource } from "../middleware/validation.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { TierController } from "../controllers/tier.controller.js";
import { createTierSchema, updateTierSchema } from "../validations/tier.validations.js";

const router = Router();
const tierController = new TierController();

router.use(authenticateToken);

router.post("/", validateResource(createTierSchema), tierController.create);
router.put("/", validateResource(updateTierSchema), tierController.update);

export default router;