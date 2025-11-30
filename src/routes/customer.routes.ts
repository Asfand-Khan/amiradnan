import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  assignPointsSchema,
  customerByIdSchema,
  customerFilterSchema,
} from "../validations/customer.validaions.js";

const router = Router();
const customerController = new CustomerController();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/users
 * @desc    Get all users (with filters)
 * @access  Private
 */
router.post(
  "/",
  validateResource(customerFilterSchema),
  customerController.getAllCustomers
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private
 */
router.post(
  "/single",
  validateResource(customerByIdSchema),
  customerController.getUserById
);

/**
 * @route   GET /api/customers/
 * @desc    Get user by ID
 * @access  Private
 */
router.get("/", customerController.getCustomerDetails);

/**
 * @route   GET /api/customers/journey
 * @desc    Get customer journey for membership
 * @access  Private
 */
router.get("/journey", customerController.getCustomerJourney);

/**
 * @route   POST /api/customers/assign-points
 * @desc    Assign points to customer
 * @access  Private
 */
router.post("/assign-points",validateResource(assignPointsSchema), customerController.assignPoints);

/**
 * @route   GET /api/customers/transactions
 * @desc    Fetch customer transactions
 * @access  Private
 */
router.get("/transactions", customerController.getCustomerTransactionHistory);

export default router;
