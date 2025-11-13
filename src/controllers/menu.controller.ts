import { NextFunction, Response } from "express";
import { MenuService } from "../services/menu.service.js";
import { AuthRequest } from "../types/index.js";
import { CreateMenu, MenuSorting, ToggleStatus, UpdateMenu, UpdateMenuRights, UpdateSingleMenuRight } from "../validations/menu.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { AppError } from "../middleware/error.middleware.js";

export class MenuController {
  private menuService: MenuService;

  constructor() {
    this.menuService = new MenuService();
  }

  createMenu = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const body: CreateMenu = req.body;
      const menu = await this.menuService.createMenu(body, userId);
      ResponseUtil.success(res, menu, "Menu created successfully", 201);
    } catch (err) {
      next(err);
    }
  };

  getAllMenus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const includeChildren = req.query.includeChildren !== "false";
      const menus = await this.menuService.getAllMenus(includeChildren);
      ResponseUtil.success(res, menus, "Menus retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  getParentMenus = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const menus = await this.menuService.getParentMenus();
      ResponseUtil.success(res, menus, "Parent menus retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  getMenuById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const menu = await this.menuService.getMenuById(Number(id));
      ResponseUtil.success(res, menu, "Menu retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  updateMenu = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const body: UpdateMenu = req.body;
      const menu = await this.menuService.updateMenu(Number(id), body);
      ResponseUtil.success(res, menu, "Menu updated successfully");
    } catch (err) {
      next(err);
    }
  };

  deleteMenu = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const result = await this.menuService.deleteMenu(Number(id), userId);
      ResponseUtil.success(res, result, "Menu deleted successfully");
    } catch (err) {
      next(err);
    }
  };

  toggleMenuStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { isActive }: ToggleStatus = req.body;
      const menu = await this.menuService.toggleMenuStatus(
        Number(id),
        isActive
      );
      ResponseUtil.success(
        res,
        menu,
        `Menu ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      next(err);
    }
  };

  assignMenuToUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { menuRights }: UpdateMenuRights = req.body;

      const result = await this.menuService.assignMenuToUser(
        Number(userId),
        menuRights
      );

      ResponseUtil.success(res, result, "Menu rights assigned successfully");
    } catch (err) {
      next(err);
    }
  };

  updateUserMenuRight = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, menuId } = req.params;
      const rights: UpdateSingleMenuRight = req.body;

      if(!rights.can_create && !rights.can_edit && !rights.can_delete && !rights.can_view) {
        throw new AppError("At least one right must be assigned");
      }

      const result = await this.menuService.updateUserMenuRight(
        Number(userId),
        Number(menuId),
        rights
      );
      ResponseUtil.success(res, result, "Menu right updated successfully");
    } catch (err) {
      next(err);
    }
  };

  removeUserMenuRight = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, menuId } = req.params;
      const result = await this.menuService.removeUserMenuRight(
        Number(userId),
        Number(menuId)
      );
      ResponseUtil.success(res, result, "Menu right removed successfully");
    } catch (err) {
      next(err);
    }
  };

  getUserMenuRights = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const menuRights = await this.menuService.getUserMenuRights(
        Number(userId)
      );
      ResponseUtil.success(
        res,
        menuRights,
        "User menu rights retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  };

  getUserAccessibleMenus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get from params or use authenticated user's ID
      const userId = req.params.userId
        ? Number(req.params.userId)
        : req.user!.id;

      const menus = await this.menuService.getUserAccessibleMenus(userId);

      ResponseUtil.success(res, menus, "Accessible menus retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  checkUserPermission = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, menuId } = req.params;
      const { permission } = req.query;

      if (
        !permission ||
        !["view", "create", "edit", "delete"].includes(permission as string)
      ) {
        ResponseUtil.error(
          res,
          "Invalid permission type. Must be one of: view, create, edit, delete",
          400
        );
      }

      const result = await this.menuService.checkUserPermission(
        Number(userId),
        Number(menuId),
        permission as "view" | "create" | "edit" | "delete"
      );
      ResponseUtil.success(res, result, "Permission check completed");
    } catch (err) {
      next(err);
    }
  };

  getMenuUsers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const users = await this.menuService.getMenuUsers(Number(id));
      ResponseUtil.success(res, users, "Menu users retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  updateMenuSorting = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sortingData }: MenuSorting = req.body;

      if (!Array.isArray(sortingData) || sortingData.length === 0) {
        ResponseUtil.error(res, "sortingData must be a non-empty array", 400);
      }

      const result = await this.menuService.updateMenuSorting(sortingData);
      ResponseUtil.success(res, result, "Menu sorting updated successfully");
    } catch (err) {
      next(err);
    }
  };

  getMenuHierarchy = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const hierarchy = await this.menuService.getMenuHierarchy();
      ResponseUtil.success(
        res,
        hierarchy,
        "Menu hierarchy retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  };

  getCurrentUserMenus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const menus = await this.menuService.getUserAccessibleMenus(userId);
      ResponseUtil.success(
        res,
        menus,
        "Current user menus retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  };
}
