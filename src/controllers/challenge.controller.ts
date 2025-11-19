import { NextFunction, Request, Response } from "express";
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

export class ChallengeController {
  private challengeService: ChallengeService;

  constructor() {
    this.challengeService = new ChallengeService();
  }

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: CreateChallengeInput = req.body;

      if (body.startAt && body.endAt) {
        if (new Date(body.startAt) > new Date(body.endAt)) {
          ResponseUtil.error(
            res,
            "End date must be greater than start date",
            400
          );
          return;
        }
      }

      if (
        body.type === ChallengeType.purchase_based &&
        body.requiredAmount <= 0
      ) {
        ResponseUtil.error(
          res,
          "Purchase-based challenges require a positive required amount",
          400
        );
        return;
      }

      const challenge = await this.challengeService.createChallenge(req.body);

      ResponseUtil.success(
        res,
        challenge,
        "Challenge created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: GetChallengeInput = req.body;
      const challenge = await this.challengeService.getChallengeById(body.id);
      ResponseUtil.success(
        res,
        challenge,
        "Challenge fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  getAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const customerId = req.user!.id; // Here the token must be of customer
      const challenges = await this.challengeService.getAllActiveChallenges(customerId);
      ResponseUtil.success(res, challenges, "All challenges fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: UpdateChallengeInput = req.body;
      const challenge = await this.challengeService.updateChallenge(
        body.challengeId,
        body
      );

      ResponseUtil.success(
        res,
        challenge,
        "Challenge updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: DeleteChallengeInput = req.body;
      await this.challengeService.deleteChallenge(body.id);
      ResponseUtil.success(res, null, "Challenge deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  enrollCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
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
    } catch (error) {
      next(error);
    }
  };

  updateProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
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
    } catch (error) {
      next(error);
    }
  };

  getCustomerChallenges = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
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
    } catch (error) {
      next(error);
    }
  };

  getChallengeStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: GetChallengeInput = req.body;
      const stats = await this.challengeService.getChallengeStats(body.id);
      ResponseUtil.success(res, stats, "Stats fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  getActiveChallenges = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
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
    } catch (error) {
      next(error);
    }
  };
}
