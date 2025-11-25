import { Response } from "express";
import { ShopifyService } from "../services/shopify.service.js";
import { ResponseUtil } from "../utils/response.util.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../middleware/error.middleware.js";
import { AuthRequest } from "../types/index.js";

export class ShopifyController {
  private shopifyService: ShopifyService;

  constructor() {
    this.shopifyService = new ShopifyService();
  }

  processOrder = catchAsync(async (req: AuthRequest, res: Response) => {
    const customerId = req.user?.id!;
    const { orderNo } = req.body;

    if (!orderNo) {
      throw new AppError("Order number is required", 400);
    }

    const result = await this.shopifyService.processOrder(orderNo, customerId);
    ResponseUtil.success(res, result, "Order processed successfully");
  });
}
