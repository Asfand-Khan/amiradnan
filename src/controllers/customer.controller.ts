import { Response, NextFunction } from "express";
import { CustomerService } from "../services/customer.service.js";
import { ResponseUtil } from "../utils/response.util.js";
import { AuthRequest } from "../types/index.js";
import {
  CreateCustomerMeasurement,
  CustomerById,
  CustomerFilter,
  UpdateCustomer,
} from "../validations/customer.validaions.js";
import { ChallengeService } from "../services/challenge.service.js";
import { PointsTransactionService } from "../services/pointTransaction.service.js";
import { ChallengeType, TransactionType } from "@prisma/client";
import { TierService } from "../services/tier.service.js";
import { WidgetService } from "../services/widget.service.js";

export class CustomerController {
  private customerService: CustomerService;
  private pointsTransactionService: PointsTransactionService;
  private challengeService: ChallengeService;
  private tierService: TierService;
  private widgetService: WidgetService;

  constructor() {
    this.customerService = new CustomerService();
    this.pointsTransactionService = new PointsTransactionService();
    this.challengeService = new ChallengeService();
    this.tierService = new TierService();
    this.widgetService = new WidgetService();
  }

  getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.customerService.getProfile(userId);
      ResponseUtil.success(res, profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const data: UpdateCustomer = req.body;
      const profile = await this.customerService.updateProfile(userId, data);
      ResponseUtil.success(res, profile, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  };

  // uploadProfilePicture = async (
  //   req: AuthRequest,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> => {
  //   try {
  //     const userId = req.user!.id;

  //     if (!req.file) {
  //       ResponseUtil.error(res, "No file uploaded", 400);
  //       return;
  //     }

  //     const filePath = `/uploads/${req.file.filename}`;
  //     const result = await this.userService.updateProfilePicture(
  //       userId,
  //       filePath
  //     );
  //     ResponseUtil.success(
  //       res,
  //       result,
  //       "Profile picture uploaded successfully"
  //     );
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  getUserById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { customerId }: CustomerById = req.body;
      const user = await this.customerService.getCustomerById(customerId);
      ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  };

  getAllCustomers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log(req.user!.id);
      const query: CustomerFilter = {
        page: req.body.page ? parseInt(req.body.page as string) : 1,
        limit: req.body.limit ? parseInt(req.body.limit as string) : 20,
        search: req.body.search as string,
      };

      const users = await this.customerService.getAllCustomers(query);
      ResponseUtil.success(res, users);
    } catch (error) {
      next(error);
    }
  };

  createMeasurement = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const data: CreateCustomerMeasurement = req.body;
      const measurements = await this.customerService.createMeasurement(userId, data);

      if (measurements && measurements.length !== null && measurements.width !== null && measurements.waist !== null && measurements.hip !== null) {
        this.customerService.updateProfileCompleted(measurements.customer_id); // mark profile completed
        
        const challenge = await this.challengeService.getChallengeByType(ChallengeType.profile_based); // check if the profile based challenge is active
        if (challenge) {
          const pointsExpiry = await this.pointsTransactionService.pointsExpiryDefault(); // get default expiry days or duration
          await this.challengeService.enrollCustomer(challenge.id, measurements.customer_id, 1, challenge.customerUsage === 1 ? 1 : 0); // enroll the customer to the challenge
          await this.pointsTransactionService.creditPoints({
              customerId: measurements.customer_id,
              points: challenge.bonusPoints,
              type: TransactionType.profile_complete,
              challengeId: challenge.id,
              expiryDays: pointsExpiry ? pointsExpiry.expiryDays : 365,
            }); // credit the respective points to the customer

          const availablePoints = await this.pointsTransactionService.getAvailablePoints(measurements.customer_id); // calculate available points
          await this.tierService.autoAssignTierToCustomer(measurements.customer_id,availablePoints); // assign customer to a tier
        }
      }

      ResponseUtil.success(
        res,
        measurements,
        "Profile Measurements created successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  getMeasurements = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.customerService.getMeasurementsByCustomerId(
        userId
      );
      ResponseUtil.success(
        res,
        profile,
        "Profile Measurements fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  updateMeasurement = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const data: Partial<CreateCustomerMeasurement> = req.body;
      const profile = await this.customerService.updateMeasurement(
        userId,
        data
      );
      ResponseUtil.success(
        res,
        profile,
        "Profile Measurements updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  getCustomerDetails = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const widget = await this.widgetService.getByDefault();
      const availablePoints = await this.pointsTransactionService.getAvailablePoints(userId);
      const tier = await this.tierService.calculateTierByPoints(availablePoints);
      const challenges = await this.challengeService.getEachTypeLatestChallenge();
      const transactions = await this.pointsTransactionService.getCustomerTransaction(userId);
      ResponseUtil.success(res, {
        widget,
        availablePoints,
        tier,
        challenges,
        transactions
      }, "Customer details fetched successfully");
    } catch (error) {
      next(error);
    }
  };

  getCustomerJourney = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const availablePoints = await this.pointsTransactionService.getAvailablePoints(customerId);
      const tier = await this.tierService.getAllActiveTiers();
      ResponseUtil.success(res, {
        availablePoints,
        tier,
      }, "Customer journey fetched successfully");
    } catch (error) {
      next(error);
    }
  };
}
