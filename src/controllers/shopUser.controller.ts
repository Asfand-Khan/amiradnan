import { Request, Response } from "express";
import { ShopUserService } from "../services/shopUser.service.js";
import {
  CreateShopUser,
  LoginUser,
  ToggleStatus,
  UpdatePassword,
  UpdateShopUser,
  UserFilters,
} from "../validations/shopUser.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { AuthRequest } from "../types/index.js";
import { UpdateMenuRights } from "../validations/menu.validations.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../middleware/error.middleware.js";

export class ShopUserController {
  private shopUserService: ShopUserService;

  constructor() {
    this.shopUserService = new ShopUserService();
  }

  registerShopUser = catchAsync(async (req: Request, res: Response) => {
    const body: CreateShopUser = req.body;
    const user = await this.shopUserService.register(body);
    ResponseUtil.success(res, user, "User created successfully", 201);
  });

  loginUser = catchAsync(async (req: Request, res: Response) => {
    const data: LoginUser = req.body;
    const result = await this.shopUserService.login(data);
    ResponseUtil.success(res, result, "Login successful");
  });

  getUserById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.shopUserService.getUserById(Number(id));
    ResponseUtil.success(res, user, "User retrieved successfully");
  });

  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const { locationId, role, isActive, search }: UserFilters = req.body;

    const filters = {
      ...(locationId && { locationId: Number(locationId) }),
      ...(role && { role: role as string }),
      ...(isActive !== undefined && { isActive: isActive === true }),
      ...(search && { search: search as string }),
    };

    const users = await this.shopUserService.getAllUsers(filters);
    ResponseUtil.success(res, users, "Users retrieved successfully");
  });

  updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateShopUser = req.body;

    const updatedUser = await this.shopUserService.updateUser(Number(id), data);

    ResponseUtil.success(res, updatedUser, "User updated successfully");
  });

  updatePassword = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword }: UpdatePassword =
      req.body;

    if (newPassword !== confirmPassword) {
      throw new AppError("New password and confirm password do not match", 400);
    }

    const result = await this.shopUserService.updatePassword(
      Number(id),
      currentPassword,
      newPassword
    );
    ResponseUtil.success(res, result, "Password updated successfully");
  });

  deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.shopUserService.deleteUser(Number(id));
    ResponseUtil.success(res, result, "User deleted successfully");
  });

  toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive }: ToggleStatus = req.body;

    const updatedUser = await this.shopUserService.toggleUserStatus(
      Number(id),
      isActive
    );
    ResponseUtil.success(
      res,
      updatedUser,
      `User ${isActive ? "activated" : "deactivated"} successfully`
    );
  });

  updateUserMenuRights = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { menuRights }: UpdateMenuRights = req.body;

    const result = await this.shopUserService.updateUserMenuRights(
      Number(id),
      menuRights
    );
    ResponseUtil.success(res, result, "Menu rights updated successfully");
  });

  getUserMenuRights = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const menuRights = await this.shopUserService.getUserMenuRights(Number(id));
    ResponseUtil.success(res, menuRights, "Menu rights retrieved successfully");
  });

  getUserAccessibleMenus = catchAsync(
    async (req: AuthRequest, res: Response) => {
      // Get from params or use authenticated user's ID
      const userId = req.params.id ? Number(req.params.id) : req.user!.id;

      const menus = await this.shopUserService.getUserAccessibleMenus(userId);
      ResponseUtil.success(
        res,
        menus,
        "Accessible menus retrieved successfully"
      );
    }
  );

  getUserStats = catchAsync(async (req: Request, res: Response) => {
    const { locationId, role }: UserFilters = req.body;

    const filters = {
      ...(locationId && { locationId: Number(locationId) }),
      ...(role && { role: role as string }),
    };

    const stats = await this.shopUserService.getUserStats(filters);
    ResponseUtil.success(res, stats, "User statistics retrieved successfully");
  });

  getCurrentUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const user = await this.shopUserService.getUserById(userId);
    ResponseUtil.success(res, user, "Current user retrieved successfully");
  });
}
