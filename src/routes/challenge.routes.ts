import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
// import { validateResource } from "../middleware/validation.middleware.js";
import { ChallengeController } from "../controllers/challenge.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createChallengeSchema,
  singleChallengeSchema,
  updateChallengeSchema,
} from "../validations/challenge.validations.js";

const router = Router();
const challengeController = new ChallengeController();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/challenges/dashboard
 * @desc    Get all challenges
 * @access  Private
 */
router.get("/dashboard", challengeController.getAllChallenges);

/**
 * @route   GET /api/challenges
 * @desc    Get all challenges
 * @access  Private
 */
router.get("/", challengeController.getAll);

/**
 * @route   POST /api/challenges
 * @desc    Create a new challenge
 * @access  Private
 */
router.post(
  "/",
  validateResource(createChallengeSchema),
  challengeController.create
);

/**
 * @route   GET /api/challenges/:id
 * @desc    Get a single challenge
 * @access  Private
 */
router.post(
  "/single",
  validateResource(singleChallengeSchema),
  challengeController.getById
);

/**
 * @route   PUT /api/challenges/:id
 * @desc    Update a challenge
 * @access  Private
 */
router.put(
  "/update",
  validateResource(updateChallengeSchema),
  challengeController.update
);

/**
 * @route   DELETE /api/challenges/:id
 * @desc    Delete a challenge
 * @access  Private
 */
router.delete(
  "/",
  validateResource(singleChallengeSchema),
  challengeController.delete
);

export default router;
