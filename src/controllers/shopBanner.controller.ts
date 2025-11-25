import { Request, Response } from "express";
import { ShopBannerService } from "../services/shopBanner.service.js";
import { CreateShopBanner } from "../validations/shopBanner.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { catchAsync } from "../utils/catchAsync.js";

export class ShopBannerController {
  private shopBannerService: ShopBannerService;

  constructor() {
    this.shopBannerService = new ShopBannerService();
  }

  createBanners = catchAsync(async (req: Request, res: Response) => {
    const data: CreateShopBanner = req.body;
    const result = await this.shopBannerService.create(data);
    ResponseUtil.created(res, result, "Banners creation successful");
  });

  getAllBanners = catchAsync(async (_req: Request, res: Response) => {
    const result = await this.shopBannerService.getAll();
    ResponseUtil.success(res, result, "Banners retrieved successfully");
  });

  getBannerById = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await this.shopBannerService.getById(id);
    ResponseUtil.success(res, result, "Banner retrieved successfully");
  });

  deleteBanner = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await this.shopBannerService.delete(id);
    ResponseUtil.success(res, null, "Banner deleted successfully");
  });

  toggleActive = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await this.shopBannerService.toggleActive(id);
    ResponseUtil.success(res, result, "Banner active status toggled");
  });
}
