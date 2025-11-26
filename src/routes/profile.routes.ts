import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { CustomerController } from "../controllers/customer.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createCustomerMeasurementSchema,
  updateCustomerSchema,
} from "../validations/customer.validaions.js";

const router = Router();
const customerController = new CustomerController();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/", customerController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/",
  validateResource(updateCustomerSchema),
  customerController.updateProfile
);

/**
 * @route   POST /api/profile/create-measurements
 * @desc    Create customer measurements
 * @access  Private
 */
router.post(
  "/create-measurements",
  validateResource(createCustomerMeasurementSchema),
  customerController.createMeasurement
);

/**
 * @route   GET /api/profile/customer-measurements
 * @desc    Get customer measurements
 * @access  Private
 */
router.get("/measurements", customerController.getMeasurements);

/**
 * @route   PUT /api/profile/measurements
 * @desc    Update customer measurements
 * @access  Private
 */
router.put(
  "/measurements",
  validateResource(createCustomerMeasurementSchema.partial()),
  customerController.updateMeasurement
);

/**
 * @route   GET /api/profile/remove-fcm-token
 * @desc    Remove fcm token
 * @access  Private
 */
router.get("/remove-fcm-token", customerController.removeFcmToken);

export default router;
