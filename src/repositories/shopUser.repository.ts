import { ShopUser } from "@prisma/client";
import prisma from "../config/database.js";
import { CreateShopUser } from "../validations/shopUser.validations.js";
export class ShopUserRepository {
  private repository = prisma.shopUser;

  async create(userData: CreateShopUser): Promise<ShopUser> {
    const user = await this.repository.create({
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        password: userData.password,
        isActive: userData.isActive,
        locationId: userData.locationId,
      },
    });
    return user;
  }

  async findByEmail(email: string): Promise<ShopUser | null> {
    return await this.repository.findUnique({ where: { email } });
  }
}
