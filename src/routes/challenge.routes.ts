import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
// import { validateResource } from "../middleware/validation.middleware.js";
import { ChallengeController } from "../controllers/challenge.controller.js";

const router = Router();
const challengeController = new ChallengeController();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/challenges
 * @desc    Get all challenges
 * @access  Private
 */
router.get("/", challengeController.getAll);

export default router;