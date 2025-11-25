import { Request, Response } from "express";
import { RewardService } from "../services/reward.service.js";
import {
  CreateRewardInput,
  DeleteRewardInput,
  GetRewardInput,
  ListRewardsInput,
  RestoreRewardInput,
  UpdateRewardInput,
} from "../validations/reward.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { AppError } from "../middleware/error.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";

export class RewardController {
  private rewardService: RewardService;

  constructor() {
    this.rewardService = new RewardService();
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const body: CreateRewardInput = req.body;
    const reward = await this.rewardService.createReward(body);
    ResponseUtil.success(res, reward, "Reward created successfully", 201);
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const body: GetRewardInput = req.body;
    const reward = await this.rewardService.getRewardById(body.rewardId);
    ResponseUtil.success(res, reward, "Reward fetched successfully", 200);
  });

  getAll = catchAsync(async (req: Request, res: Response) => {
    const body: ListRewardsInput = req.body;
    const rewards = await this.rewardService.getAllRewards({
      active: body.active,
      search: body.search,
    });
    ResponseUtil.success(res, rewards, "Rewards fetched successfully", 200);
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const body: UpdateRewardInput = req.body;
    const reward = await this.rewardService.updateReward(
      body.rewardId,
      req.body
    );
    ResponseUtil.success(res, reward, "Reward updated successfully", 200);
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const body: DeleteRewardInput = req.body;
    await this.rewardService.deleteReward(body.rewardId);
    ResponseUtil.success(res, null, "Reward deleted successfully", 200);
  });

  restore = catchAsync(async (req: Request, res: Response) => {
    const body: RestoreRewardInput = req.body;
    const reward = await this.rewardService.restoreReward(body.rewardId);
    ResponseUtil.success(res, reward, "Reward restored successfully", 200);
  });

  hardDelete = catchAsync(async (req: Request, res: Response) => {
    const body: DeleteRewardInput = req.body;
    await this.rewardService.hardDeleteReward(body.rewardId);
    ResponseUtil.success(res, null, "Reward deleted successfully", 200);
  });

  getActiveRewards = catchAsync(async (_req: Request, res: Response) => {
    const rewards = await this.rewardService.getActiveRewards();
    ResponseUtil.success(res, rewards, "Rewards fetched successfully", 200);
  });

  getStats = catchAsync(async (req: Request, res: Response) => {
    const body: GetRewardInput = req.body;
    const stats = await this.rewardService.getRewardStats(body.rewardId);
    ResponseUtil.success(res, stats, "Rewards stats fetched successfully", 200);
  });

  toggleStatus = catchAsync(async (req: Request, res: Response) => {
    const body: GetRewardInput = req.body;
    const reward = await this.rewardService.toggleRewardStatus(body.rewardId);
    ResponseUtil.success(
      res,
      reward,
      `Reward ${reward.active ? "activated" : "deactivated"} successfully`,
      200
    );
  });

  bulkUpdateStatus = catchAsync(async (req: Request, res: Response) => {
    const { rewardIds, active } = req.body;

    if (!Array.isArray(rewardIds) || rewardIds.length === 0) {
      throw new AppError("rewardIds array is required", 400);
    }

    if (typeof active !== "boolean") {
      throw new AppError("active boolean is required", 400);
    }

    const result = await this.rewardService.bulkUpdateStatus(rewardIds, active);
    ResponseUtil.success(
      res,
      result,
      `${result.updated} rewards updated successfully`,
      200
    );
  });

  searchRewards = catchAsync(async (req: Request, res: Response) => {
    const { search } = req.query;

    if (!search || typeof search !== "string") {
      throw new AppError("search query parameter is required", 400);
    }

    const rewards = await this.rewardService.searchRewards(search);

    ResponseUtil.success(
      res,
      rewards,
      `Search rewards fetched successfully`,
      200
    );
  });
}
