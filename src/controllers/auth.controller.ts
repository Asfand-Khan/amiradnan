import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { ResponseUtil } from "../utils/response.util.js";
import {
  CreateCustomer,
  ForgotPassword,
  GoogleLogin,
  LoginCustomer,
  RefreshAccessToken,
  SetPassword,
} from "../validations/customer.validaions.js";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateCustomer = req.body;
      const result = await this.authService.register(data);
      ResponseUtil.created(res, result, "Registration successful");
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: LoginCustomer = req.body;
      const result = await this.authService.login(data);
      ResponseUtil.success(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refresh_token }: RefreshAccessToken = req.body;

      if (!refresh_token) {
        ResponseUtil.error(res, "Refresh token is required", 400);
        return;
      }

      const result = await this.authService.refreshAccessToken(refresh_token);
      ResponseUtil.success(res, result, "Token refreshed successfully");
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email }: ForgotPassword = req.body;
      const result = await this.authService.forgotPassword(email);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, new_password } = req.body;
      const result = await this.authService.resetPassword(token, new_password);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refresh_token }: RefreshAccessToken = req.body;

      if (!refresh_token) {
        ResponseUtil.error(res, "Refresh token is required", 400);
        return;
      }

      const result = await this.authService.logout(refresh_token);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token }: GoogleLogin = req.body;

      if (!token) {
        ResponseUtil.error(res, "Google Token is required", 400);
        return;
      }

      const result = await this.authService.googleLogin(token);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  setPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: SetPassword = req.body;
      const result = await this.authService.setPassword(data);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
