import { NextFunction, Request, Response } from "express";
import { ShopUserService } from "../services/shopUser.service.js";
import { CreateShopUser } from "../validations/shopUser.validations.js";
import { ResponseUtil } from "../utils/response.util.js";

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
      ResponseUtil.success(res, user, "User created successfully");
    } catch (err) {
      next(err);
    }
  };
}
