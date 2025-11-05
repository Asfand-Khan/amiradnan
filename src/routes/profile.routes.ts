import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { CustomerController } from '../controllers/customer.controller.js';
import { validateResource } from '../middleware/validation.middleware.js';
import { createCustomerMeasurementSchema, createCustomerSchema } from '../validations/customer.validaions.js';

const router = Router();
const customerController = new CustomerController();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/', customerController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/',
  validateResource(createCustomerSchema.partial()),
  customerController.updateProfile
);

/**
 * @route   POST /api/profile/create-measurements
 * @desc    Create customer measurements
 * @access  Private
 */
router.post(
  '/create-measurements',
  validateResource(createCustomerMeasurementSchema),
  customerController.createMeasurement
);

/**
 * @route   GET /api/profile/customer-measurements
 * @desc    Get customer measurements
 * @access  Private
 */
router.get(
  '/measurements',
  customerController.getMeasurements
);

/**
 * @route   PUT /api/profile/measurements
 * @desc    Update customer measurements
 * @access  Private
 */
router.put(
  '/measurements',
  validateResource(createCustomerMeasurementSchema.partial()),
  customerController.updateMeasurement
);

export default router;