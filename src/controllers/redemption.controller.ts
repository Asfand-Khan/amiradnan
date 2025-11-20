import { Request, Response, NextFunction } from "express";
import { RedemptionService } from "../services/redemption.service.js";
import {
  CreateRedemptionInput,
  DeleteRedemptionInput,
  GetRedemptionInput,
  ListRedemptionsInput,
  UpdateRedemptionInput,
  SearchRedemptionsInput,
} from "../validations/redemption.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { AppError } from "../middleware/error.middleware.js";
import { AuthRequest } from "../types/index.js";

export class RedemptionController {
  private redemptionService: RedemptionService;

  constructor() {
    this.redemptionService = new RedemptionService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: CreateRedemptionInput = req.body;
      const redemption = await this.redemptionService.createRedemption(body);
      ResponseUtil.success(res, redemption, "Redemption created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { redemptionId }: GetRedemptionInput = req.body;
      const redemption = await this.redemptionService.getRedemptionById(redemptionId);
      ResponseUtil.success(res, redemption);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: ListRedemptionsInput = req.body;
      const customerId = req.user ? req.user.id : query.customerId;

      console.log("Customer ID: ", customerId);
      const redemptions = await this.redemptionService.getAllRedemptions({
        customerId,
        rewardId: query.rewardId,
        locationId: query.locationId,
        search: query.search,
      });
      ResponseUtil.success(res, redemptions);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { redemptionId, ...updateData }: UpdateRedemptionInput = req.body;
      const updated = await this.redemptionService.updateRedemption(
        redemptionId,
        updateData
      );
      ResponseUtil.success(res, updated, "Redemption updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { redemptionId }: DeleteRedemptionInput = req.body;
      await this.redemptionService.deleteRedemption(redemptionId);
      ResponseUtil.success(res, null, "Redemption deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { redemptionId }: GetRedemptionInput = req.body;
      const stats = await this.redemptionService.getRedemptionStats(
        redemptionId
      );
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search }: SearchRedemptionsInput = req.query as any;

      if (!search || typeof search !== "string") {
        throw new AppError("Search parameter is required");
      }

      const results = await this.redemptionService.searchRedemptions(search);
      ResponseUtil.success(res, results);
    } catch (error) {
      next(error);
    }
  };
}
