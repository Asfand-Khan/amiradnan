import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateResource } from '../middleware/validation.middleware.js';
import { customerByIdSchema, customerFilterSchema } from '../validations/customer.validaions.js';
// import { upload } from '../middleware/upload.middleware';

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
  '/',
  validateResource(customerFilterSchema),
  customerController.getAllCustomers
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private
 */
router.post('/single', validateResource(customerByIdSchema) ,customerController.getUserById);

export default router;