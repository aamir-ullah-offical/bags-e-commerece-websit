import { Router } from "express";
import {
  getBanners, createBanner, updateBanner, deleteBanner, bulkUpdateBanners,
} from "../controllers/bannerController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", getBanners);

router.post("/", protect, requireAdmin, createBanner);
router.put("/bulk", protect, requireAdmin, bulkUpdateBanners);
router.put("/:id", protect, requireAdmin, updateBanner);
router.delete("/:id", protect, requireAdmin, deleteBanner);

export default router;
