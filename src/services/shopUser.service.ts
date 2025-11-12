import { AppError } from "../middleware/error.middleware.js";
import { MenuRepository } from "../repositories/menu.repository.js";
import { ShopUserRepository } from "../repositories/shopUser.repository.js";
import { hashPassword } from "../utils/password.util.js";
import { CreateShopUser } from "../validations/shopUser.validations.js";

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

    this.menuRepository.assignMenu(data.menuRights, shopUser.id);

    return shopUser;
  }
}
