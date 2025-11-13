import { Router } from "express";
import { ShopUserController } from "../controllers/shopUser.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { createShopUserSchema, loginUserSchema, toggleStatusSchema, updatePasswordSchema, updateShopUserSchema, userFiltersSchema } from "../validations/shopUser.validations.js";
import { updateMenuRightsSchema } from "../validations/menu.validations.js";

const router = Router();
const shopUserController = new ShopUserController();

router.post("/login", validateResource(loginUserSchema), shopUserController.loginUser); // login shop user

router.use(authenticateToken);

router.post("/", validateResource(createShopUserSchema), shopUserController.registerShopUser); // register shop user
router.get("/me", shopUserController.getCurrentUser); // Get current user
router.get("/me/menus", shopUserController.getUserAccessibleMenus); // Get current user's accessible menus
router.get("/", validateResource(userFiltersSchema), shopUserController.getAllUsers); // Get all users
router.get("/stats", validateResource(userFiltersSchema), shopUserController.getUserStats); // Get all users stats
router.get("/:id", shopUserController.getUserById); // Get Single user by id
router.put("/:id", validateResource(updateShopUserSchema), shopUserController.updateUser); // Update shop user
router.put("/:id/password", validateResource(updatePasswordSchema), shopUserController.updatePassword); // Update shop user password
router.delete("/:id", shopUserController.deleteUser); // Soft delete a user
router.patch("/:id/status", validateResource(toggleStatusSchema), shopUserController.toggleUserStatus); // Toggle shop user status
router.put("/:id/menu-rights", validateResource(updateMenuRightsSchema), shopUserController.updateUserMenuRights); // Update shop user menu rights
router.get("/:id/menu-rights", shopUserController.getUserMenuRights); // Get shop user menu rights
router.get("/:id/menus", shopUserController.getUserAccessibleMenus); // Get shop user accessible menus

export default router;