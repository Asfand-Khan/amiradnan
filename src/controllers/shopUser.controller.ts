import { NextFunction, Request, Response } from "express";
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

export class ShopUserController {
  private shopUserService: ShopUserService;

  constructor() {
    this.shopUserService = new ShopUserService();
  }

  registerShopUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: CreateShopUser = req.body;
      const user = await this.shopUserService.register(body);
      ResponseUtil.success(res, user, "User created successfully", 201);
    } catch (err) {
      next(err);
    }
  };

  loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: LoginUser = req.body;
      const result = await this.shopUserService.login(data);
      ResponseUtil.success(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.shopUserService.getUserById(Number(id));
      ResponseUtil.success(res, user, "User retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { locationId, role, isActive, search }: UserFilters = req.body;

      const filters = {
        ...(locationId && { locationId: Number(locationId) }),
        ...(role && { role: role as string }),
        ...(isActive !== undefined && { isActive: isActive === true }),
        ...(search && { search: search as string }),
      };

      const users = await this.shopUserService.getAllUsers(filters);
      ResponseUtil.success(res, users, "Users retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateShopUser = req.body;

      const updatedUser = await this.shopUserService.updateUser(
        Number(id),
        data
      );

      ResponseUtil.success(res, updatedUser, "User updated successfully");
    } catch (err) {
      next(err);
    }
  };

  updatePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword, confirmPassword }: UpdatePassword =
        req.body;

      if (newPassword !== confirmPassword) {
        ResponseUtil.error(
          res,
          "New password and confirm password do not match",
          400
        );
      }

      const result = await this.shopUserService.updatePassword(
        Number(id),
        currentPassword,
        newPassword
      );
      ResponseUtil.success(res, result, "Password updated successfully");
    } catch (err) {
      next(err);
    }
  };

  deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.shopUserService.deleteUser(Number(id));
      ResponseUtil.success(res, result, "User deleted successfully");
    } catch (err) {
      next(err);
    }
  };

  toggleUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
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
    } catch (err) {
      next(err);
    }
  };

  updateUserMenuRights = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { menuRights }: UpdateMenuRights = req.body;

      const result = await this.shopUserService.updateUserMenuRights(
        Number(id),
        menuRights
      );
      ResponseUtil.success(res, result, "Menu rights updated successfully");
    } catch (err) {
      next(err);
    }
  };

  getUserMenuRights = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const menuRights = await this.shopUserService.getUserMenuRights(
        Number(id)
      );
      ResponseUtil.success(
        res,
        menuRights,
        "Menu rights retrieved successfully"
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
      const userId = req.params.id ? Number(req.params.id) : req.user!.id;

      const menus = await this.shopUserService.getUserAccessibleMenus(userId);
      ResponseUtil.success(
        res,
        menus,
        "Accessible menus retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  };

  getUserStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { locationId, role }: UserFilters = req.body;

      const filters = {
        ...(locationId && { locationId: Number(locationId) }),
        ...(role && { role: role as string }),
      };

      const stats = await this.shopUserService.getUserStats(filters);
      ResponseUtil.success(
        res,
        stats,
        "User statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  };

  getCurrentUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const user = await this.shopUserService.getUserById(userId);
      ResponseUtil.success(res, user, "Current user retrieved successfully");
    } catch (err) {
      next(err);
    }
  };
}
