import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { ResponseUtil } from "../utils/response.util.js";
import { PromotionService } from "../services/promotion.service.js";
import {
  CreatePromotion,
  UpdatePromotion,
} from "../validations/promotions.validations.js";

export class PromotionController {
  private promotionService: PromotionService;

  constructor() {
    this.promotionService = new PromotionService();
  }

  createPromotion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: CreatePromotion = req.body;
      const promotions = await this.promotionService.createPromotion(body);
      ResponseUtil.success(res, promotions, "Promotions created successfully");
    } catch (error) {
      next(error);
    }
  };

  getAllPromotions = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const promotions = await this.promotionService.getAllPromotions();
      ResponseUtil.success(
        res,
        promotions,
        "Promotions retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  getSinglePromotion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const promotions = await this.promotionService.getPromotionById(
        Number(id)
      );
      ResponseUtil.success(
        res,
        promotions,
        "Single promotion retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  updatePromotion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const body: UpdatePromotion = req.body;
      const promotion = await this.promotionService.updatePromotion(
        Number(id),
        body
      );
      ResponseUtil.success(res, promotion, "Promotion updated successfully");
    } catch (error) {
      next(error);
    }
  };

  deletePromotion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const promotion = await this.promotionService.deletePromotion(Number(id));
      ResponseUtil.success(res, promotion, "Promotion deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
