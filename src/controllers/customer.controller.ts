import { Response } from "express";
import { CustomerService } from "../services/customer.service.js";
import { ResponseUtil } from "../utils/response.util.js";
import { AuthRequest } from "../types/index.js";
import { catchAsync } from "../utils/catchAsync.js";
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

  getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = await this.customerService.getProfile(userId);
    ResponseUtil.success(res, profile);
  });

  updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const data: UpdateCustomer = req.body;
    const profile = await this.customerService.updateProfile(userId, data);
    ResponseUtil.success(res, profile, "Profile updated successfully");
  });

  getUserById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { customerId }: CustomerById = req.body;
    const user = await this.customerService.getCustomerById(customerId);
    ResponseUtil.success(res, user);
  });

  getAllCustomers = catchAsync(async (req: AuthRequest, res: Response) => {
    const query: CustomerFilter = {
      page: req.body.page ? parseInt(req.body.page as string) : 1,
      limit: req.body.limit ? parseInt(req.body.limit as string) : 20,
      search: req.body.search as string,
    };

    const users = await this.customerService.getAllCustomers(query);
    ResponseUtil.success(res, users);
  });

  createMeasurement = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const data: CreateCustomerMeasurement = req.body;
    const measurements = await this.customerService.createMeasurement(
      userId,
      data
    );

    if (
      measurements &&
      measurements.length !== null &&
      measurements.width !== null &&
      measurements.waist !== null &&
      measurements.hip !== null
    ) {
      this.customerService.updateProfileCompleted(measurements.customer_id); // mark profile completed

      const challenge = await this.challengeService.getChallengeByType(
        ChallengeType.profile_based
      ); // check if the profile based challenge is active
      if (challenge) {
        const pointsExpiry =
          await this.pointsTransactionService.pointsExpiryDefault(); // get default expiry days or duration
        await this.challengeService.enrollCustomer(
          challenge.id,
          measurements.customer_id,
          1,
          challenge.customerUsage === 1 ? 1 : 0
        ); // enroll the customer to the challenge
        await this.pointsTransactionService.creditPoints({
          customerId: measurements.customer_id,
          points: challenge.bonusPoints,
          type: TransactionType.profile_complete,
          challengeId: challenge.id,
          expiryDays: pointsExpiry ? pointsExpiry.expiryDays : 365,
        }); // credit the respective points to the customer

        const availablePoints =
          await this.pointsTransactionService.getAvailablePoints(
            measurements.customer_id
          ); // calculate available points
        await this.tierService.autoAssignTierToCustomer(
          measurements.customer_id,
          availablePoints
        ); // assign customer to a tier
      }
    }

    ResponseUtil.success(
      res,
      measurements,
      "Profile Measurements created successfully"
    );
  });

  getMeasurements = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = await this.customerService.getMeasurementsByCustomerId(
      userId
    );
    ResponseUtil.success(
      res,
      profile,
      "Profile Measurements fetched successfully"
    );
  });

  updateMeasurement = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const data: Partial<CreateCustomerMeasurement> = req.body;
    const profile = await this.customerService.updateMeasurement(userId, data);
    ResponseUtil.success(
      res,
      profile,
      "Profile Measurements updated successfully"
    );
  });

  getCustomerDetails = catchAsync(async (req: AuthRequest, res: Response) => {
    const customerId = req.user!.id; // Here Token Must Be Of Customer
    const widget = await this.widgetService.getByDefault();
    const availablePoints =
      await this.pointsTransactionService.getAvailablePoints(customerId);
    const tier = await this.tierService.calculateTierByPoints(availablePoints);
    const challenges = await this.challengeService.getEachTypeLatestChallenge();
    const transactions =
      await this.pointsTransactionService.getCustomerTransaction(customerId);
    ResponseUtil.success(
      res,
      {
        widget,
        availablePoints,
        tier,
        challenges,
        transactions,
      },
      "Customer details fetched successfully"
    );
  });

  getCustomerJourney = catchAsync(async (req: AuthRequest, res: Response) => {
    const customerId = req.user!.id;
    const availablePoints =
      await this.pointsTransactionService.getAvailablePoints(customerId);
    const totalPoints = await this.tierService.getMaxThresholdValue();
    const tier = await this.tierService.getAllActiveTiers();
    const nextTier = await this.tierService.getNextTierInfo(availablePoints);
    ResponseUtil.success(
      res,
      {
        availablePoints,
        totalPoints,
        nextTier,
        tier,
      },
      "Customer journey fetched successfully"
    );
  });
}
