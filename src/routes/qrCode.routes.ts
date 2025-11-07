import { Router } from "express";
import { QrCodeController } from "../controllers/qrCode.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { qrCodeByCodeValueSchema, qrCodeByCustomerSchema, qrCodeByIdSchema, qrCodeFilterSchema } from "../validations/qrCode.validations.js";

const router = Router();
const qrCodeController = new QrCodeController();

router.use(authenticateToken);

/**
 * @route   GET /api/qr-codes
 * @desc    Create a qr-code
 * @access  Private
 */
router.get("/", qrCodeController.generate);

/**
 * @route   POST /api/qr-codes
 * @desc    Get All qr-code
 * @access  Private
 */
router.post("/", validateResource(qrCodeFilterSchema), qrCodeController.getAll);

/**
 * @route   POST /api/qr-codes/customer
 * @desc    Get qr-code by customer
 * @access  Private
 */
router.post("/customer", validateResource(qrCodeByCustomerSchema), qrCodeController.getByCustomer);

/**
 * @route   POST /api/qr-codes/code
 * @desc    Get qr-code by code
 * @access  Private
 */
router.post("/code", validateResource(qrCodeByCodeValueSchema), qrCodeController.getByCode);

/**
 * @route   POST /api/qr-codes/deactivate
 * @desc    Deactivate qr-code
 * @access  Private
 */
router.post("/deactivate", validateResource(qrCodeByIdSchema), qrCodeController.deactivate);

/**
 * @route   DELETE /api/qr-codes/
 * @desc    DELETE qr-code
 * @access  Private
 */
router.delete("/", validateResource(qrCodeByIdSchema), qrCodeController.delete);

export default router;
