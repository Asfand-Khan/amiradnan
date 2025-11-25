import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { ResponseUtil } from "../utils/response.util.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  CreateCustomer,
  ForgotPassword,
  GoogleLogin,
  LoginCustomer,
  RefreshAccessToken,
  SetPassword,
} from "../validations/customer.validaions.js";
import { AppError } from "../middleware/error.middleware.js";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = catchAsync(async (req: Request, res: Response) => {
    const data: CreateCustomer = req.body;
    const result = await this.authService.register(data);
    ResponseUtil.created(res, result, "Registration successful");
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const data: LoginCustomer = req.body;
    const result = await this.authService.login(data);
    ResponseUtil.success(res, result, "Login successful");
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refresh_token }: RefreshAccessToken = req.body;

    if (!refresh_token) {
      throw new AppError("Refresh token is required", 400);
    }

    const result = await this.authService.refreshAccessToken(refresh_token);
    ResponseUtil.success(res, result, "Token refreshed successfully");
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email }: ForgotPassword = req.body;
    const result = await this.authService.forgotPassword(email);
    ResponseUtil.success(res, result);
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, new_password } = req.body;
    const result = await this.authService.resetPassword(token, new_password);
    ResponseUtil.success(res, result);
  });

  logout = catchAsync(async (req: Request, res: Response) => {
    const { refresh_token }: RefreshAccessToken = req.body;

    if (!refresh_token) {
      throw new AppError("Refresh token is required", 400);
    }

    const result = await this.authService.logout(refresh_token);
    ResponseUtil.success(res, result);
  });

  googleLogin = catchAsync(async (req: Request, res: Response) => {
    const { token }: GoogleLogin = req.body;

    if (!token) {
      throw new AppError("Google Token is required", 400);
    }

    const result = await this.authService.googleLogin(token);
    ResponseUtil.success(res, result);
  });

  setPassword = catchAsync(async (req: Request, res: Response) => {
    const data: SetPassword = req.body;
    const result = await this.authService.setPassword(data);
    ResponseUtil.success(res, result);
  });
}
