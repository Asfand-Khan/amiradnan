import { Router } from "express";
import { ShopifyController } from "../controllers/shopify.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();
const shopifyController = new ShopifyController();

router.use(authenticateToken);

router.post(
  "/process-order",
  authenticateToken,
  shopifyController.processOrder
);

export default router;
