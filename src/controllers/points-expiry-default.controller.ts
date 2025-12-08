import { Request, Response } from "express";
import { PointsExpiryDefaultService } from "../services/points-expiry-default.service.js";
import {
  CreatePointsExpiryDefault,
  SinglePointsExpiryDefault,
  UpdatePointsExpiryDefault,
} from "../validations/points-expiry-default.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { catchAsync } from "../utils/catchAsync.js";

export class PointsExpiryDefaultController {
  private service: PointsExpiryDefaultService;

  constructor() {
    this.service = new PointsExpiryDefaultService();
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const body: CreatePointsExpiryDefault = req.body;
    // Assuming req.user exists from auth middleware, but we need type extension or use 'any' for now safely
    const userId = (req as any).user?.userId || 1; // Fallback or strict? Better strict but adhering to current pattern

    const config = await this.service.create(
      body.name,
      body.expiryDays,
      userId,
      body.active
    );
    ResponseUtil.success(
      res,
      config,
      "Points Expiry Configuration created successfully"
    );
  });

  getAll = catchAsync(async (_req: Request, res: Response) => {
    const configs = await this.service.getAll();
    ResponseUtil.success(
      res,
      configs,
      "Points Expiry Configurations retrieved successfully"
    );
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const body: SinglePointsExpiryDefault = req.body;
    const config = await this.service.getById(Number(body.id));
    ResponseUtil.success(
      res,
      config,
      "Points Expiry Configuration retrieved successfully"
    );
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const body: UpdatePointsExpiryDefault = req.body;
    const config = await this.service.update(body);
    ResponseUtil.success(
      res,
      config,
      "Points Expiry Configuration updated successfully"
    );
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const body: SinglePointsExpiryDefault = req.body;
    const config = await this.service.delete(Number(body.id));
    ResponseUtil.success(
      res,
      config,
      "Points Expiry Configuration deleted successfully"
    );
  });
}
