import { Router } from "express";
import { WidgetController } from "../controllers/widget.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { createWidgetSchema } from "../validations/widget.validations.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();
const widgetController = new WidgetController();

// All routes require authentication
router.use(authenticateToken);

router.post("/", validateResource(createWidgetSchema), widgetController.create);
router.get("/", widgetController.getAll);

export default router;
