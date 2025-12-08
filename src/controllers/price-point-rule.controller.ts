import { Request, Response } from "express";
import { PricePointRuleService } from "../services/price-point-rule.service.js";
import {
  CreatePricePointRule,
  SinglePricePointRule,
  UpdatePricePointRule,
} from "../validations/price-point-rule.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { catchAsync } from "../utils/catchAsync.js";

export class PricePointRuleController {
  private service: PricePointRuleService;

  constructor() {
    this.service = new PricePointRuleService();
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const body: CreatePricePointRule = req.body;
    const rule = await this.service.create(body.pointsPerUnit, body.unitValue);
    ResponseUtil.success(res, rule, "Price Point Rule created successfully");
  });

  getAll = catchAsync(async (_req: Request, res: Response) => {
    const rules = await this.service.getAll();
    ResponseUtil.success(
      res,
      rules,
      "Price Point Rules retrieved successfully"
    );
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const body: SinglePricePointRule = req.body;
    console.log(body);
    const rule = await this.service.getById(body.ruleId);
    ResponseUtil.success(res, rule, "Price Point Rule retrieved successfully");
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const body: UpdatePricePointRule = req.body;
    const rule = await this.service.update(body);
    ResponseUtil.success(res, rule, "Price Point Rule updated successfully");
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const body: SinglePricePointRule = req.body;
    const rule = await this.service.delete(body.ruleId);
    ResponseUtil.success(res, rule, "Price Point Rule deleted successfully");
  });
}
