import { Router } from "express";
import { ShopUserController } from "../controllers/shopUser.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { createShopUserSchema } from "../validations/shopUser.validations.js";

const router = Router();
const shopUserController = new ShopUserController();

router.use(authenticateToken);

/**
 * @route   GET /api/shop-users
 * @desc    Create a shop user
 * @access  Private
 */
router.post(
  "/",
  validateResource(createShopUserSchema),
  shopUserController.registerShopUser
);

export default router;