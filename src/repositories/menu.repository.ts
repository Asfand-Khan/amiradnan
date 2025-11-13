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

  async getParentMenus(): Promise<Menu[]> {
    return await this.repository.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        parentId: null,
      },
      orderBy: { sorting: "asc" },
      include: {
        children: {
          where: { isActive: true, isDeleted: false },
          orderBy: { sorting: "asc" },
        },
      },
    });
  }

  // READ: Get menu by ID
  async getById(id: number): Promise<any | null> {
    const menu = await this.repository.findUnique({
      where: { id, isDeleted: false },
      include: {
        parent: true,
        children: {
          where: { isDeleted: false },
          orderBy: { sorting: "asc" },
        },
        user_menu_rights: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return menu;
  }

  // UPDATE
  async update(id: number, data: UpdateMenu): Promise<Menu> {
    return await this.repository.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.url && { url: data.url }),
        ...(data.icon && { icon: data.icon }),
        ...(data.sorting !== undefined && { sorting: data.sorting }),
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

  async toggleActiveStatus(id: number, isActive: boolean): Promise<Menu> {
    return await this.repository.update({
      where: { id },
      data: { isActive },
    });
  }

  // Assign menu rights
  async assignMenu(data: MenuRight[], userId: number): Promise<void> {
    const menuRights = data.map((right) => ({
      userId,
      menuId: right.menu_id,
      canView: right.can_view ?? true,
      canCreate: right.can_create ?? false,
      canEdit: right.can_edit ?? false,
      canDelete: right.can_delete ?? false,
    }));

    await prisma.$transaction([
      this.rightsRepository.deleteMany({
        where: { userId },
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
            sorting: true,
          },
        },
      },
      orderBy: {
        menu: {
          sorting: "asc",
        },
      },
    });
  }

  // Update specific menu rights for user
  async updateMenuRights(
    userId: number,
    menuId: number,
    rights: Partial<Omit<MenuRight, "menu_id">>
  ): Promise<UserMenuRight> {
    return await this.rightsRepository.upsert({
      where: {
        userId_menuId: {
          userId,
          menuId,
        },
      },
      update: {
        ...(rights.can_view !== undefined && { canView: rights.can_view }),
        ...(rights.can_create !== undefined && {
          canCreate: rights.can_create,
        }),
        ...(rights.can_edit !== undefined && { canEdit: rights.can_edit }),
        ...(rights.can_delete !== undefined && {
          canDelete: rights.can_delete,
        }),
      },
      create: {
        userId,
        menuId,
        canView: rights.can_view ?? true,
        canCreate: rights.can_create ?? false,
        canEdit: rights.can_edit ?? false,
        canDelete: rights.can_delete ?? false,
      },
    });
  }

  // Remove specific menu right
  async removeMenuRight(userId: number, menuId: number): Promise<void> {
    await this.rightsRepository.delete({
      where: {
        userId_menuId: {
          userId,
          menuId,
        },
      },
    });
  }

  // GET USER'S ACCESSIBLE MENUS (hierarchical structure)
  async getUserAccessibleMenus(userId: number): Promise<any[]> {
    const accessibleMenus = await this.repository.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        user_menu_rights: {
          some: {
            userId,
            canView: true,
          },
        },
      },
      include: {
        user_menu_rights: {
          where: { userId },
          select: {
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
          },
        },
        children: {
          where: {
            isActive: true,
            isDeleted: false,
            user_menu_rights: {
              some: { userId, canView: true },
            },
          },
          include: {
            user_menu_rights: {
              where: { userId },
              select: {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true,
              },
            },
          },
          orderBy: { sorting: "asc" },
        },
      },
      orderBy: { sorting: "asc" },
    });

    const transformMenu = (menu: any) => {
      const rights = menu.user_menu_rights?.[0] || {};
      return {
        id: menu.id,
        name: menu.name,
        description: menu.description,
        parentId: menu.parentId,
        url: menu.url,
        icon: menu.icon,
        sorting: menu.sorting,
        canView: rights.canView ?? false,
        canCreate: rights.canCreate ?? false,
        canEdit: rights.canEdit ?? false,
        canDelete: rights.canDelete ?? false,
        children: menu.children?.map(transformMenu) ?? [],
      };
    };

    // Filter to return only parent menus (hierarchy will be in children)
    return accessibleMenus.filter((menu) => menu.parentId === null).map(transformMenu);
  }

  async checkUserPermission(
    userId: number,
    menuId: number,
    permission: "view" | "create" | "edit" | "delete"
  ): Promise<boolean> {
    const right = await this.rightsRepository.findUnique({
      where: {
        userId_menuId: {
          userId,
          menuId,
        },
      },
    });

    if (!right) return false;

    switch (permission) {
      case "view":
        return right.canView;
      case "create":
        return right.canCreate;
      case "edit":
        return right.canEdit;
      case "delete":
        return right.canDelete;
      default:
        return false;
    }
  }

  async getMenuUsers(menuId: number): Promise<UserMenuRight[]> {
    return await this.rightsRepository.findMany({
      where: { menuId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  // Bulk update menu sorting
  async updateSorting(
    sortingData: { id: number; sorting: number }[]
  ): Promise<void> {
    await prisma.$transaction(
      sortingData.map((item) =>
        this.repository.update({
          where: { id: item.id },
          data: { sorting: item.sorting },
        })
      )
    );
  }
}
