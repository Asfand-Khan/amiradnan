import { MenuRepository } from "../repositories/menu.repository.js";
import { CreateMenu } from "../validations/menu.validations.js";

export class MenuService {
  private menuRepository: MenuRepository;

  constructor() {
    this.menuRepository = new MenuRepository();
  }

  async createMenu(menuData: CreateMenu, createdBy: number) {
    const menu = await this.menuRepository.create(menuData, createdBy);
    return menu;
  }

  async getAllMenus() {
    const menus = await this.menuRepository.getAll();
    return menus;
  }
}
