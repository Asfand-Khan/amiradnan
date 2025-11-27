import { Request, Response } from "express";
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
import { catchAsync } from "../utils/catchAsync.js";

export class RedemptionController {
  private redemptionService: RedemptionService;

  constructor() {
    this.redemptionService = new RedemptionService();
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const body: CreateRedemptionInput = req.body;
    const redemption = await this.redemptionService.createRedemption(body);
    ResponseUtil.success(
      res,
      redemption,
      "Redemption created successfully",
      201
    );
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const { redemptionId }: GetRedemptionInput = req.body;
    const redemption = await this.redemptionService.getRedemptionById(
      redemptionId
    );
    ResponseUtil.success(res, redemption);
  });

  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const query: ListRedemptionsInput = req.body;
    const customerId = query.customerId ? query.customerId : req.user!.id;

    const redemptions = await this.redemptionService.getAllRedemptions({
      customerId,
      rewardId: query.rewardId,
      locationId: query.locationId,
      search: query.search,
    });
    ResponseUtil.success(res, redemptions);
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const { redemptionId, ...updateData }: UpdateRedemptionInput = req.body;
    const updated = await this.redemptionService.updateRedemption(
      redemptionId,
      updateData
    );
    ResponseUtil.success(res, updated, "Redemption updated successfully");
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const { redemptionId }: DeleteRedemptionInput = req.body;
    await this.redemptionService.deleteRedemption(redemptionId);
    ResponseUtil.success(res, null, "Redemption deleted successfully");
  });

  getStats = catchAsync(async (req: Request, res: Response) => {
    const { redemptionId }: GetRedemptionInput = req.body;
    const stats = await this.redemptionService.getRedemptionStats(redemptionId);
    ResponseUtil.success(res, stats);
  });

  search = catchAsync(async (req: Request, res: Response) => {
    const { search }: SearchRedemptionsInput = req.query as any;

    if (!search || typeof search !== "string") {
      throw new AppError("Search parameter is required");
    }

    const results = await this.redemptionService.searchRedemptions(search);
    ResponseUtil.success(res, results);
  });
}
