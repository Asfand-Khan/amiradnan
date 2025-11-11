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

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
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
      const profile = await this.customerService.createMeasurement(
        userId,
        data
      );
      ResponseUtil.success(
        res,
        profile,
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
}
