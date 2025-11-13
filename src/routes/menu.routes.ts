import { Router } from "express";
import { MenuController } from "../controllers/menu.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { createMenuSchema, menuSortingSchema, toggleStatusSchema, UpdateMenuSchema, updateMenuRightsSchema, updateSingleMenuRightSchema } from "../validations/menu.validations.js";

const router = Router();
const menuController = new MenuController();

// All routes require authentication
router.use(authenticateToken);

router.post("/", validateResource(createMenuSchema), menuController.createMenu); // Create menu
router.get("/my-menus", menuController.getCurrentUserMenus); // Get current user's menus
router.get("/", menuController.getAllMenus); // Get All Menus
router.get("/parents", menuController.getParentMenus); // Get All Parent Menus
router.get("/hierarchy", menuController.getMenuHierarchy); // Get Menu Hierarchy
router.get("/:id", menuController.getMenuById); // Get Single Menu
router.put("/:id", validateResource(UpdateMenuSchema), menuController.updateMenu); // Update Menu
router.delete("/:id", menuController.deleteMenu); // Delete Menu
router.patch("/:id/status", validateResource(toggleStatusSchema), menuController.toggleMenuStatus); // Toggle menu status
router.put("/sorting", validateResource(menuSortingSchema), menuController.updateMenuSorting); // Update menu sorting
router.post("/users/:userId/assign", validateResource(updateMenuRightsSchema), menuController.assignMenuToUser); // Assign menu to user
router.get("/users/:userId/rights", menuController.getUserMenuRights); // Get user menu rights
router.get("/users/:userId/accessible", menuController.getUserAccessibleMenus); // Get user accessible menus
router.put("/users/:userId/:menuId", validateResource(updateSingleMenuRightSchema), menuController.updateUserMenuRight); // Update user menu right
router.delete("/users/:userId/:menuId", menuController.removeUserMenuRight); // Remove user menu right
router.get("/users/:userId/:menuId/check", menuController.checkUserPermission); // Check user permission
router.get("/:id/users", menuController.getMenuUsers); // Get menu users

export default router;