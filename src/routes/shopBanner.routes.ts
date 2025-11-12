import { Router } from "express";
import { ShopBannerController } from "../controllers/shopBanner.controller.js";
import { validateResource } from "../middleware/validation.middleware.js";
import { createShopBannerSchema } from "../validations/shopBanner.validations.js";

const router = Router();
const shopBannerController = new ShopBannerController();

router.post("/", validateResource(createShopBannerSchema), shopBannerController.createBanners);
router.get("/", shopBannerController.getAllBanners);
router.get("/:id", shopBannerController.getBannerById);
router.delete("/:id", shopBannerController.deleteBanner);
router.patch("/:id/toggle-active", shopBannerController.toggleActive);

export default router;
