import { Router } from "express";
import { LocationController } from "../controllers/location.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createLocationSchema,
  listLocationsSchema,
  singleLocationSchema,
  updateLocationSchema,
} from "../validations/location.validations.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();
const locationController = new LocationController();

router.use(authenticateToken);

router.post(
  "/create",
  validateResource(createLocationSchema),
  locationController.create
);

router.post(
  "/get",
  validateResource(singleLocationSchema),
  locationController.getById
);

router.get(
  "/list",
  validateResource(listLocationsSchema),
  locationController.getAll
);

router.put(
  "/update",
  validateResource(updateLocationSchema),
  locationController.update
);

router.delete(
  "/delete",
  validateResource(singleLocationSchema),
  locationController.delete
);

// Additional operations
router.post(
  "/stats",
  validateResource(singleLocationSchema),
  locationController.getStats
);

router.get(
  "/by-city",
  locationController.getByCity
);

router.get(
  "/search",
  locationController.search
);

router.post(
  "/users",
  validateResource(singleLocationSchema),
  locationController.getUsers
);

export default router;