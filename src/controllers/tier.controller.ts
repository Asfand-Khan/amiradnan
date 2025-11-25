import { Request, Response } from "express";
import { TierService } from "../services/tier.service.js";
import {
  AssignTierToCustomerInput,
  BulkAssignTiersInput,
  CreateTierInput,
  DeleteTierInput,
  GetCustomerTiersInput,
  GetTierCustomersInput,
  GetTierInput,
  ListTiersInput,
  RemoveTierFromCustomerInput,
  ReorderTiersInput,
  UpdateTierInput,
} from "../validations/tier.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { catchAsync } from "../utils/catchAsync.js";

export class TierController {
  private tierService: TierService;

  constructor() {
    this.tierService = new TierService();
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const body: CreateTierInput = req.body;
    const tier = await this.tierService.createTier(body);
    ResponseUtil.success(res, tier, "Tier created successfully", 201);
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const body: GetTierInput = req.body;
    const tier = await this.tierService.getTierById(body.tierId);

    ResponseUtil.success(res, tier, "Tier fetched successfully", 200);
  });

  getAll = catchAsync(async (req: Request, res: Response) => {
    const body: ListTiersInput = req.body;
    const result = await this.tierService.getAllTiers({
      page: body.page,
      limit: body.limit,
      active: body.active,
      search: body.search,
    });

    ResponseUtil.success(
      res,
      {
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: req.query.limit,
        },
      },
      "Tiers fetched successfully",
      200
    );
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const body: UpdateTierInput = req.body;
    const tier = await this.tierService.updateTier(body.tierId, body);
    ResponseUtil.success(res, tier, "Tier updated successfully", 200);
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const body: DeleteTierInput = req.body;
    await this.tierService.deleteTier(body.tierId);
    ResponseUtil.success(res, null, "Tier deleted successfully", 200);
  });

  assignToCustomer = catchAsync(async (req: Request, res: Response) => {
    const body: AssignTierToCustomerInput = req.body;
    const assignment = await this.tierService.assignTierToCustomer(
      body.tierId,
      body.customerId
    );
    ResponseUtil.success(
      res,
      assignment,
      "Tier assigned to customer successfully",
      201
    );
  });

  removeFromCustomer = catchAsync(async (req: Request, res: Response) => {
    const body: RemoveTierFromCustomerInput = req.body;
    await this.tierService.removeTierFromCustomer(body.tierId, body.customerId);
    ResponseUtil.success(
      res,
      null,
      "Tier removed from customer successfully",
      200
    );
  });

  getCustomerTiers = catchAsync(async (req: Request, res: Response) => {
    const body: GetCustomerTiersInput = req.body;
    const tiers = await this.tierService.getCustomerTiers(body.customerId);
    ResponseUtil.success(
      res,
      tiers,
      "Customer tiers fetched successfully",
      200
    );
  });

  getTierCustomers = catchAsync(async (req: Request, res: Response) => {
    const body: GetTierCustomersInput = req.body;
    const result = await this.tierService.getTierCustomers(
      body.tierId,
      body.page,
      body.limit
    );

    ResponseUtil.success(
      res,
      {
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: req.query.limit,
        },
      },
      "Tier customers fetched successfully",
      200
    );
  });

  getTierStats = catchAsync(async (req: Request, res: Response) => {
    const body: GetTierInput = req.body;
    const stats = await this.tierService.getTierStats(body.tierId);
    ResponseUtil.success(res, stats, "Tier stats fetched successfully", 200);
  });

  bulkAssign = catchAsync(async (req: Request, res: Response) => {
    const body: BulkAssignTiersInput = req.body;
    const result = await this.tierService.bulkAssignTiers(body.assignments);
    ResponseUtil.success(res, result, "Tiers assigned successfully", 200);
  });

  reorder = catchAsync(async (req: Request, res: Response) => {
    const body: ReorderTiersInput = req.body;
    const result = await this.tierService.reorderTiers(body.tierOrders);
    ResponseUtil.success(res, result, "Tiers reordered successfully", 200);
  });

  getActiveTiers = catchAsync(async (_req: Request, res: Response) => {
    const tiers = await this.tierService.getActiveTiers();
    ResponseUtil.success(res, tiers, "Active Tiers fetched successfully", 200);
  });
}
