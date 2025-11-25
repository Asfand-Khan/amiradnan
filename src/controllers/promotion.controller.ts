import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import { ResponseUtil } from "../utils/response.util.js";
import { PromotionService } from "../services/promotion.service.js";
import {
  CreatePromotion,
  UpdatePromotion,
} from "../validations/promotions.validations.js";
import { catchAsync } from "../utils/catchAsync.js";

export class PromotionController {
  private promotionService: PromotionService;

  constructor() {
    this.promotionService = new PromotionService();
  }

  createPromotion = catchAsync(async (req: AuthRequest, res: Response) => {
    const body: CreatePromotion = req.body;
    const promotions = await this.promotionService.createPromotion(body);
    ResponseUtil.success(res, promotions, "Promotions created successfully");
  });

  getAllPromotions = catchAsync(async (_req: AuthRequest, res: Response) => {
    const promotions = await this.promotionService.getAllPromotions();
    ResponseUtil.success(res, promotions, "Promotions retrieved successfully");
  });

  getSinglePromotion = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const promotions = await this.promotionService.getPromotionById(Number(id));
    ResponseUtil.success(
      res,
      promotions,
      "Single promotion retrieved successfully"
    );
  });

  updatePromotion = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const body: UpdatePromotion = req.body;
    const promotion = await this.promotionService.updatePromotion(
      Number(id),
      body
    );
    ResponseUtil.success(res, promotion, "Promotion updated successfully");
  });

  deletePromotion = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const promotion = await this.promotionService.deletePromotion(Number(id));
    ResponseUtil.success(res, promotion, "Promotion deleted successfully");
  });
}
