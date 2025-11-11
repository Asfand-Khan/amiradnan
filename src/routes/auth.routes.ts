import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createCustomerSchema,
  forgotPasswordSchema,
  googleLoginSchema,
  loginCustomerSchema,
  refreshAccessTokenSchema,
  resetPassword,
  setPasswordSchema,
} from "../validations/customer.validaions.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  validateResource(createCustomerSchema),
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  validateResource(loginCustomerSchema),
  authController.login
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  "/refresh-token",
  validateResource(refreshAccessTokenSchema),
  authController.refreshToken
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  "/forgot-password",
  validateResource(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  "/reset-password",
  validateResource(resetPassword),
  authController.resetPassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post(
  "/logout",
  validateResource(refreshAccessTokenSchema),
  authController.logout
);

/**
 * @route   POST /api/auth/google-login
 * @desc    Login user by Google
 * @access  Public
 */
router.post(
  "/google-login",
  validateResource(googleLoginSchema),
  authController.googleLogin
);

// All routes require authentication below this line
router.use(authenticateToken);

/**
 * @route   POST /api/auth/set-password
 * @desc    Set Password
 * @access  Private
 */
router.post(
  "/set-password",
  validateResource(setPasswordSchema),
  authController.setPassword
);

export default router;
