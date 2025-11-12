import { Request, Response, NextFunction } from "express";
import { ShopBannerService } from "../services/shopBanner.service.js";
import { CreateShopBanner } from "../validations/shopBanner.validations.js";
import { ResponseUtil } from "../utils/response.util.js";

export class ShopBannerController {
  private shopBannerService: ShopBannerService;

  constructor() {
    this.shopBannerService = new ShopBannerService();
  }

  createBanners = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateShopBanner = req.body;
      const result = await this.shopBannerService.create(data);
      ResponseUtil.created(res, result, "Banners creation successful");
    } catch (error) {
      next(error);
    }
  };

  getAllBanners = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.shopBannerService.getAll();
      ResponseUtil.success(res, result, "Banners retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  getBannerById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.shopBannerService.getById(id);
      ResponseUtil.success(res, result, "Banner retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  deleteBanner = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.shopBannerService.delete(id);
      ResponseUtil.success(res, null, "Banner deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.shopBannerService.toggleActive(id);
      ResponseUtil.success(res, result, "Banner active status toggled");
    } catch (error) {
      next(error);
    }
  };
}
