import { Router } from "express";
import { PricePointRuleController } from "../controllers/price-point-rule.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createPricePointRuleSchema,
  singlePricePointRuleSchema,
  updatePricePointRuleSchema,
} from "../validations/price-point-rule.validations.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new PricePointRuleController();

// Protect all routes
router.use(authenticateToken);

router.get("/", controller.getAll);
router.post(
  "/",
  validateResource(createPricePointRuleSchema),
  controller.create
);
router.post(
  "/single",
  validateResource(singlePricePointRuleSchema),
  controller.getById
);
router.put(
  "/",
  validateResource(updatePricePointRuleSchema),
  controller.update
);
router.delete(
  "/",
  validateResource(singlePricePointRuleSchema),
  controller.delete
);

export default router;
