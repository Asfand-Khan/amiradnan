import { NextFunction, Response } from "express";
import { MenuService } from "../services/menu.service.js";
import { AuthRequest } from "../types/index.js";
import { CreateMenu } from "../validations/menu.validations.js";
import { ResponseUtil } from "../utils/response.util.js";

export class MenuController {
  private menuService: MenuService;

  constructor() {
    this.menuService = new MenuService();
  }

  createMenu = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const body: CreateMenu = req.body;
      const menu = await this.menuService.createMenu(body, userId);
      ResponseUtil.success(res, menu, "Menu created successfully");
    } catch (err) {
      next(err);
    }
  };
}
