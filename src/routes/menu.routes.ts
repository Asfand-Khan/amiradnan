import { Router } from "express";
import { MenuController } from "../controllers/menu.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { createMenuSchema } from "../validations/menu.validations.js";

const router = Router();
const menuController = new MenuController();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/menus
 * @desc    Create a menu
 * @access  Private
 */
router.post("/", validateResource(createMenuSchema), menuController.createMenu);

export default router;