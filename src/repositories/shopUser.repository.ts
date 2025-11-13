import { Prisma, ShopUser } from "@prisma/client";
import prisma from "../config/database.js";
import { CreateShopUser, UpdateShopUser } from "../validations/shopUser.validations.js";
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

  async findById(id: number): Promise<ShopUser | null> {
    return await this.repository.findUnique({
      where: { id, isDeleted: false },
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        userMenuRights: {
          include: {
            menu: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<ShopUser | null> {
    return await this.repository.findUnique({
      where: { email, isDeleted: false },
    });
  }

  async findAll(filters?: {
    locationId?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<ShopUser[]> {
    const where: Prisma.ShopUserWhereInput = {
      isDeleted: false,
      ...(filters?.locationId && { locationId: filters.locationId }),
      ...(filters?.role && { role: filters.role as any }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search } },
          { email: { contains: filters.search } },
          { phone: { contains: filters.search } },
        ],
      }),
    };

    return await this.repository.findMany({
      where,
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: number,
    data: UpdateShopUser
  ): Promise<ShopUser> {
    return await this.repository.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.role && { role: data.role }),
        ...(data.locationId !== undefined && { locationId: data.locationId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async updatePassword(id: number, hashedPassword: string): Promise<ShopUser> {
    return await this.repository.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async softDelete(id: number): Promise<ShopUser> {
    return await this.repository.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }

  async toggleActiveStatus(id: number, isActive: boolean): Promise<ShopUser> {
    return await this.repository.update({
      where: { id },
      data: { isActive },
    });
  }

  async count(filters?: {
    locationId?: number;
    role?: string;
    isActive?: boolean;
  }): Promise<number> {
    const where: Prisma.ShopUserWhereInput = {
      isDeleted: false,
      ...(filters?.locationId && { locationId: filters.locationId }),
      ...(filters?.role && { role: filters.role as any }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    return await this.repository.count({ where });
  }
}
