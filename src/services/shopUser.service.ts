import { AppError } from "../middleware/error.middleware.js";
import { MenuRepository } from "../repositories/menu.repository.js";
import { ShopUserRepository } from "../repositories/shopUser.repository.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";
import {
  CreateShopUser,
  LoginUser,
  MenuRight,
  UpdateShopUser,
} from "../validations/shopUser.validations.js";

export class ShopUserService {
  private shopUserRepository: ShopUserRepository;
  private menuRepository: MenuRepository;

  constructor() {
    this.shopUserRepository = new ShopUserRepository();
    this.menuRepository = new MenuRepository();
  }

  async register(data: CreateShopUser) {
    const existingShopUser = await this.shopUserRepository.findByEmail(
      data.email
    );
    if (existingShopUser) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await hashPassword(data.password);

    const shopUser = await this.shopUserRepository.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: data.role,
      phone: data.phone,
      isActive: data.isActive,
      locationId: data.locationId,
      menuRights: data.menuRights,
    });

    // Assign menu rights
    if (data.menuRights && data.menuRights.length > 0) {
      await this.menuRepository.assignMenu(data.menuRights, shopUser.id);
    }

    // Return user without password
    const { password, ...userWithoutPassword } = shopUser;
    return userWithoutPassword;
  }

  async login(data: LoginUser) {
    // Find user with password
    const user = await this.shopUserRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const menus = await this.menuRepository.getUserAccessibleMenus(user.id);
    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    return {
      user,
      access_token: accessToken,
      menus,
    };
  }

  async getUserById(id: number) {
    const user = await this.shopUserRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(filters?: {
    locationId?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const users = await this.shopUserRepository.findAll(filters);
    return users.map(({ password, ...user }) => user);
  }

  async updateUser(userId: number, data: UpdateShopUser) {
    const existingUser = await this.shopUserRepository.findById(userId);
    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.shopUserRepository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError("Email already in use", 409);
      }
    }

    if (data.menuRights && data.menuRights.length > 0) {
      await this.menuRepository.assignMenu(data.menuRights, userId);
    }

    const updatedUser = await this.shopUserRepository.update(userId, data);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.shopUserRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.shopUserRepository.updatePassword(userId, hashedPassword);

    return { message: "Password updated successfully" };
  }

  async deleteUser(id: number) {
    const user = await this.shopUserRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await this.shopUserRepository.softDelete(id);
    return { message: "User deleted successfully" };
  }

  async toggleUserStatus(id: number, isActive: boolean) {
    const user = await this.shopUserRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updatedUser = await this.shopUserRepository.toggleActiveStatus(
      id,
      isActive
    );
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async updateUserMenuRights(userId: number, menuRights: MenuRight[]) {
    const user = await this.shopUserRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await this.menuRepository.assignMenu(menuRights, userId);
    return { message: "Menu rights updated successfully" };
  }

  async getUserMenuRights(userId: number) {
    const user = await this.shopUserRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const menuRights = await this.menuRepository.getUserMenuRights(userId);
    return menuRights;
  }

  async getUserAccessibleMenus(userId: number) {
    const user = await this.shopUserRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const menus = await this.menuRepository.getUserAccessibleMenus(userId);
    return menus;
  }

  async getUserStats(filters?: { locationId?: number; role?: string }) {
    const [total, active, inactive] = await Promise.all([
      this.shopUserRepository.count(filters),
      this.shopUserRepository.count({ ...filters, isActive: true }),
      this.shopUserRepository.count({ ...filters, isActive: false }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}
