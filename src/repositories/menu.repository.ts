import { Menu, UserMenuRight } from "@prisma/client";
import prisma from "../config/database.js";
import { CreateMenu, UpdateMenu } from "../validations/menu.validations.js";
import { MenuRight } from "../validations/shopUser.validations.js";
export class MenuRepository {
  private repository = prisma.menu;
  private rightsRepository = prisma.userMenuRight;

  // CREATE
  async create(data: CreateMenu, createdBy: number): Promise<Menu> {
    const menu = await this.repository.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        url: data.url,
        icon: data.icon,
        sorting: data.sorting,
        createdBy,
      },
    });
    return menu;
  }

  // READ: Get all active menus (with optional children)
  async getAll(includeChildren: boolean = true): Promise<Menu[]> {
    return await this.repository.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { sorting: "asc" },
      include: includeChildren
        ? {
            children: {
              where: { isActive: true, isDeleted: false },
              orderBy: { sorting: "asc" },
              include: { children: true }, // recursive
            },
          }
        : undefined,
    });
  }

  // READ: Get menu by ID
  async getById(id: number): Promise<Menu | null> {
    return await this.repository.findUnique({
      where: { id, isDeleted: false },
      include: {
        parent: true,
        children: {
          where: { isDeleted: false },
          orderBy: { sorting: "asc" },
        },
        user_menu_rights: true,
      },
    });
  }

  // UPDATE
  async update(id: number, data: UpdateMenu): Promise<Menu> {
    return await this.repository.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        url: data.url,
        icon: data.icon,
        sorting: data.sorting,
      },
    });
  }

  // SOFT DELETE
  async softDelete(id: number, deletedBy: number): Promise<Menu> {
    return await this.repository.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }

  // Assign menu rights
  async assignMenu(data: MenuRight[], user_id: number): Promise<void> {
    const menuRights = data.map((right) => ({
      userId: user_id,
      menuId: right.menu_id,
      canView: right.can_view ?? true,
      canCreate: right.can_create ?? false,
      canEdit: right.can_edit ?? false,
      canDelete: right.can_delete ?? false,
    }));

    await prisma.$transaction([
      this.rightsRepository.deleteMany({
        where: { userId: user_id },
      }),

      this.rightsRepository.createMany({
        data: menuRights,
      }),
    ]);
  }

  // GET USER'S MENU RIGHTS
  async getUserMenuRights(userId: number): Promise<UserMenuRight[]> {
    return await this.rightsRepository.findMany({
      where: { userId },
      include: {
        menu: {
          select: {
            id: true,
            name: true,
            url: true,
            icon: true,
            parentId: true,
          },
        },
      },
    });
  }

  // GET USER'S ACCESSIBLE MENUS (with permissions)
  async getUserAccessibleMenus(userId: number): Promise<Menu[]> {
    return await this.repository.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        user_menu_rights: {
          some: {
            userId,
          },
        },
      },
      include: {
        children: {
          where: {
            isActive: true,
            isDeleted: false,
            user_menu_rights: {
              some: { userId },
            },
          },
          orderBy: { sorting: "asc" },
        },
      },
      orderBy: { sorting: "asc" },
    });
  }
}
