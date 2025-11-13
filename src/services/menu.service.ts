import { AppError } from "../middleware/error.middleware.js";
import { MenuRepository } from "../repositories/menu.repository.js";
import { CreateMenu, UpdateMenu } from "../validations/menu.validations.js";
import { MenuRight } from "../validations/shopUser.validations.js";

export class MenuService {
  private menuRepository: MenuRepository;

  constructor() {
    this.menuRepository = new MenuRepository();
  }

  async createMenu(menuData: CreateMenu, createdBy: number) {
    // Validate parent menu exists if parentId is provided
    if (menuData.parentId) {
      const parentMenu = await this.menuRepository.getById(menuData.parentId);
      if (!parentMenu) {
        throw new AppError("Parent menu not found", 404);
      }
    }

    const menu = await this.menuRepository.create(menuData, createdBy);
    return menu;
  }

  async getAllMenus(includeChildren: boolean = true) {
    const menus = await this.menuRepository.getAll(includeChildren);
    return menus;
  }

  async getParentMenus() {
    const menus = await this.menuRepository.getParentMenus();
    return menus;
  }

  async getMenuById(id: number) {
    const menu = await this.menuRepository.getById(id);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }
    return menu;
  }

  async updateMenu(id: number, menuData: UpdateMenu) {
    const existingMenu = await this.menuRepository.getById(id);
    if (!existingMenu) {
      throw new AppError("Menu not found", 404);
    }

    // Validate parent menu exists if parentId is being updated
    if (menuData.parentId !== undefined && menuData.parentId !== null) {
      if (menuData.parentId === id) {
        throw new AppError("Menu cannot be its own parent", 400);
      }

      const parentMenu = await this.menuRepository.getById(menuData.parentId);
      if (!parentMenu) {
        throw new AppError("Parent menu not found", 404);
      }

      // Prevent circular references
      if (parentMenu.parentId === id) {
        throw new AppError("Cannot create circular menu hierarchy", 400);
      }
    }

    const updatedMenu = await this.menuRepository.update(id, menuData);
    return updatedMenu;
  }

  async deleteMenu(id: number, deletedBy: number) {
    const menu = await this.menuRepository.getById(id);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }

    // Check if menu has children
    if (menu.children && menu.children.length > 0) {
      throw new AppError(
        "Cannot delete menu with children. Delete or reassign child menus first.",
        400
      );
    }

    await this.menuRepository.softDelete(id, deletedBy);
    return { message: "Menu deleted successfully" };
  }

  async toggleMenuStatus(id: number, isActive: boolean) {
    const menu = await this.menuRepository.getById(id);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }

    const updatedMenu = await this.menuRepository.toggleActiveStatus(
      id,
      isActive
    );
    return updatedMenu;
  }

  async assignMenuToUser(userId: number, menuRights: MenuRight[]) {
    // Validate all menus exist
    const menuIds = menuRights.map((right) => right.menu_id);
    const uniqueMenuIds = [...new Set(menuIds)];

    for (const menuId of uniqueMenuIds) {
      const menu = await this.menuRepository.getById(menuId);
      if (!menu) {
        throw new AppError(`Menu with ID ${menuId} not found`, 404);
      }
    }

    await this.menuRepository.assignMenu(menuRights, userId);
    return { message: "Menu rights assigned successfully" };
  }

  async updateUserMenuRight(
    userId: number,
    menuId: number,
    rights: Partial<Omit<MenuRight, "menu_id">>
  ) {
    const menu = await this.menuRepository.getById(menuId);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }

    const updatedRight = await this.menuRepository.updateMenuRights(
      userId,
      menuId,
      rights
    );
    return updatedRight;
  }

  async removeUserMenuRight(userId: number, menuId: number) {
    const menu = await this.menuRepository.getById(menuId);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }

    await this.menuRepository.removeMenuRight(userId, menuId);
    return { message: "Menu right removed successfully" };
  }

  async getUserMenuRights(userId: number) {
    const menuRights = await this.menuRepository.getUserMenuRights(userId);
    return menuRights;
  }

  async getUserAccessibleMenus(userId: number) {
    const menus = await this.menuRepository.getUserAccessibleMenus(userId);
    return menus;
  }

  async checkUserPermission(
    userId: number,
    menuId: number,
    permission: "view" | "create" | "edit" | "delete"
  ) {
    const hasPermission = await this.menuRepository.checkUserPermission(
      userId,
      menuId,
      permission
    );
    return { hasPermission };
  }

  async getMenuUsers(menuId: number) {
    const menu = await this.menuRepository.getById(menuId);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }

    const users = await this.menuRepository.getMenuUsers(menuId);
    return users;
  }

  async updateMenuSorting(sortingData: { id: number; sorting: number }[]) {
    // Validate all menus exist
    for (const item of sortingData) {
      const menu = await this.menuRepository.getById(item.id);
      if (!menu) {
        throw new AppError(`Menu with ID ${item.id} not found`, 404);
      }
    }

    await this.menuRepository.updateSorting(sortingData);
    return { message: "Menu sorting updated successfully" };
  }

  async getMenuHierarchy() {
    const allMenus = await this.menuRepository.getAll(true);

    // Build hierarchical structure
    const menuMap = new Map();
    const rootMenus: any[] = [];

    allMenus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    allMenus.forEach((menu) => {
      if (menu.parentId === null) {
        rootMenus.push(menuMap.get(menu.id));
      } else {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuMap.get(menu.id));
        }
      }
    });

    return rootMenus;
  }
}
