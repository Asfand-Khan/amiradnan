import { Response } from "express";
import { MenuService } from "../services/menu.service.js";
import { AuthRequest } from "../types/index.js";
import {
  CreateMenu,
  MenuSorting,
  ToggleStatus,
  UpdateMenu,
  UpdateMenuRights,
  UpdateSingleMenuRight,
} from "../validations/menu.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { AppError } from "../middleware/error.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";

export class MenuController {
  private menuService: MenuService;

  constructor() {
    this.menuService = new MenuService();
  }

  createMenu = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const body: CreateMenu = req.body;
    const menu = await this.menuService.createMenu(body, userId);
    ResponseUtil.success(res, menu, "Menu created successfully", 201);
  });

  getAllMenus = catchAsync(async (req: AuthRequest, res: Response) => {
    const includeChildren = req.query.includeChildren !== "false";
    const menus = await this.menuService.getAllMenus(includeChildren);
    ResponseUtil.success(res, menus, "Menus retrieved successfully");
  });

  getParentMenus = catchAsync(async (_req: AuthRequest, res: Response) => {
    const menus = await this.menuService.getParentMenus();
    ResponseUtil.success(res, menus, "Parent menus retrieved successfully");
  });

  getMenuById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const menu = await this.menuService.getMenuById(Number(id));
    ResponseUtil.success(res, menu, "Menu retrieved successfully");
  });

  updateMenu = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const body: UpdateMenu = req.body;
    const menu = await this.menuService.updateMenu(Number(id), body);
    ResponseUtil.success(res, menu, "Menu updated successfully");
  });

  deleteMenu = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await this.menuService.deleteMenu(Number(id), userId);
    ResponseUtil.success(res, result, "Menu deleted successfully");
  });

  toggleMenuStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { isActive }: ToggleStatus = req.body;
    const menu = await this.menuService.toggleMenuStatus(Number(id), isActive);
    ResponseUtil.success(
      res,
      menu,
      `Menu ${isActive ? "activated" : "deactivated"} successfully`
    );
  });

  assignMenuToUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { menuRights }: UpdateMenuRights = req.body;

    const result = await this.menuService.assignMenuToUser(
      Number(userId),
      menuRights
    );

    ResponseUtil.success(res, result, "Menu rights assigned successfully");
  });

  updateUserMenuRight = catchAsync(async (req: AuthRequest, res: Response) => {
    const { userId, menuId } = req.params;
    const rights: UpdateSingleMenuRight = req.body;

    if (
      !rights.can_create &&
      !rights.can_edit &&
      !rights.can_delete &&
      !rights.can_view
    ) {
      throw new AppError("At least one right must be assigned");
    }

    const result = await this.menuService.updateUserMenuRight(
      Number(userId),
      Number(menuId),
      rights
    );
    ResponseUtil.success(res, result, "Menu right updated successfully");
  });

  removeUserMenuRight = catchAsync(async (req: AuthRequest, res: Response) => {
    const { userId, menuId } = req.params;
    const result = await this.menuService.removeUserMenuRight(
      Number(userId),
      Number(menuId)
    );
    ResponseUtil.success(res, result, "Menu right removed successfully");
  });

  getUserMenuRights = catchAsync(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const menuRights = await this.menuService.getUserMenuRights(Number(userId));
    ResponseUtil.success(
      res,
      menuRights,
      "User menu rights retrieved successfully"
    );
  });

  getUserAccessibleMenus = catchAsync(
    async (req: AuthRequest, res: Response) => {
      // Get from params or use authenticated user's ID
      const userId = req.params.userId
        ? Number(req.params.userId)
        : req.user!.id;

      const menus = await this.menuService.getUserAccessibleMenus(userId);

      ResponseUtil.success(
        res,
        menus,
        "Accessible menus retrieved successfully"
      );
    }
  );

  checkUserPermission = catchAsync(async (req: AuthRequest, res: Response) => {
    const { userId, menuId } = req.params;
    const { permission } = req.query;

    if (
      !permission ||
      !["view", "create", "edit", "delete"].includes(permission as string)
    ) {
      throw new AppError(
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
  });

  getMenuUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const users = await this.menuService.getMenuUsers(Number(id));
    ResponseUtil.success(res, users, "Menu users retrieved successfully");
  });

  updateMenuSorting = catchAsync(async (req: AuthRequest, res: Response) => {
    const { sortingData }: MenuSorting = req.body;

    if (!Array.isArray(sortingData) || sortingData.length === 0) {
      throw new AppError("sortingData must be a non-empty array", 400);
    }

    const result = await this.menuService.updateMenuSorting(sortingData);
    ResponseUtil.success(res, result, "Menu sorting updated successfully");
  });

  getMenuHierarchy = catchAsync(async (_req: AuthRequest, res: Response) => {
    const hierarchy = await this.menuService.getMenuHierarchy();
    ResponseUtil.success(
      res,
      hierarchy,
      "Menu hierarchy retrieved successfully"
    );
  });

  getCurrentUserMenus = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const menus = await this.menuService.getUserAccessibleMenus(userId);
    ResponseUtil.success(
      res,
      menus,
      "Current user menus retrieved successfully"
    );
  });
}
