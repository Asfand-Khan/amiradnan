import { Router } from "express";
import { WidgetController } from "../controllers/widget.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import {
  createWidgetSchema,
  singleWidgetSchema,
  updateWidgetSchema,
} from "../validations/widget.validations.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();
const widgetController = new WidgetController();

// All routes require authentication '
router.use(authenticateToken);

router.post("/", validateResource(createWidgetSchema), widgetController.create);
router.get("/", widgetController.getAll);
router.get(
  "/single",
  validateResource(singleWidgetSchema),
  widgetController.getById
);
router.put("/", validateResource(updateWidgetSchema), widgetController.update);
router.patch(
  "/",
  validateResource(singleWidgetSchema),
  widgetController.toggleActive
);
router.delete(
  "/",
  validateResource(singleWidgetSchema),
  widgetController.delete
);

export default router;
