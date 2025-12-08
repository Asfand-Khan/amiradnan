import { Request, Response } from "express";
import { ChallengeService } from "../services/challenge.service.js";
import {
  CreateChallengeInput,
  DeleteChallengeInput,
  EnrollCustomerInput,
  GetChallengeInput,
  GetCustomerChallengesInput,
  UpdateChallengeInput,
  UpdateProgressInput,
} from "../validations/challenge.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { ChallengeType } from "@prisma/client";
import { AuthRequest } from "../types/index.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../middleware/error.middleware.js";

export class ChallengeController {
  private challengeService: ChallengeService;

  constructor() {
    this.challengeService = new ChallengeService();
  }

  getAllChallenges = catchAsync(async (_req: AuthRequest, res: Response) => {
    const challenges = await this.challengeService.getAllChallenges();
    ResponseUtil.success(
      res,
      challenges,
      "All challenges fetched successfully",
      200
    );
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const body: CreateChallengeInput = req.body;

    if (body.startAt && body.endAt) {
      if (new Date(body.startAt) > new Date(body.endAt)) {
        throw new AppError("End date must be greater than start date", 400);
      }
    }

    if (
      body.type === ChallengeType.purchase_based &&
      body.requiredAmount <= 0
    ) {
      throw new AppError(
        "Purchase-based challenges require a positive required amount",
        400
      );
    }

    const challenge = await this.challengeService.createChallenge(req.body);
    ResponseUtil.success(res, challenge, "Challenge created successfully", 201);
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const body: GetChallengeInput = req.body;
    const challenge = await this.challengeService.getChallengeById(body.id);
    ResponseUtil.success(res, challenge, "Challenge fetched successfully", 200);
  });

  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const customerId = req.user!.id; // Here the token must be of customer
    const challenges = await this.challengeService.getAllActiveChallenges(
      customerId
    );
    ResponseUtil.success(
      res,
      challenges,
      "All challenges fetched successfully",
      200
    );
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const body: UpdateChallengeInput = req.body;
    const challenge = await this.challengeService.updateChallenge(
      body.challengeId,
      body
    );

    ResponseUtil.success(res, challenge, "Challenge updated successfully", 200);
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const body: DeleteChallengeInput = req.body;
    await this.challengeService.deleteChallenge(body.id);
    ResponseUtil.success(res, null, "Challenge deleted successfully", 200);
  });

  enrollCustomer = catchAsync(async (req: Request, res: Response) => {
    const body: EnrollCustomerInput = req.body;
    const participant = await this.challengeService.enrollCustomer(
      body.challengeId,
      body.customerId
    );
    ResponseUtil.success(
      res,
      participant,
      "Customer enrolled successfully",
      201
    );
  });

  updateProgress = catchAsync(async (req: Request, res: Response) => {
    const body: UpdateProgressInput = req.body;
    const participant = await this.challengeService.updateProgress(
      body.challengeId,
      body.customerId,
      body.progressCount
    );

    ResponseUtil.success(
      res,
      participant,
      "Progress updated successfully",
      200
    );
  });

  getCustomerChallenges = catchAsync(async (req: Request, res: Response) => {
    const body: GetCustomerChallengesInput = req.body;
    const challenges = await this.challengeService.getCustomerChallenges(
      body.customerId,
      body.status
    );
    ResponseUtil.success(
      res,
      challenges,
      "Challenges fetched successfully",
      200
    );
  });

  getChallengeStats = catchAsync(async (req: Request, res: Response) => {
    const body: GetChallengeInput = req.body;
    const stats = await this.challengeService.getChallengeStats(body.id);
    ResponseUtil.success(res, stats, "Stats fetched successfully", 200);
  });

  getActiveChallenges = catchAsync(async (req: Request, res: Response) => {
    const body: UpdateChallengeInput = req.body;
    const challenges = await this.challengeService.getActiveChallenges(
      body.type
    );
    ResponseUtil.success(
      res,
      challenges,
      "Challenges fetched successfully",
      200
    );
  });
}
