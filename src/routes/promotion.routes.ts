import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { PromotionController } from "../controllers/promotion.controller.js";
import {
  createPromotionSchema,
  updatePromotionSchema,
} from "../validations/promotions.validations.js";

const router = Router();
const promotionController = new PromotionController();

router.use(authenticateToken);

router.post("/", validateResource(createPromotionSchema), promotionController.createPromotion);
router.get("/", promotionController.getAllPromotions);
router.get("/:id", promotionController.getSinglePromotion);
router.put("/:id", validateResource(updatePromotionSchema), promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);

export default router;