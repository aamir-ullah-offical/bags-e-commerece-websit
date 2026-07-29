import { Router } from "express";
import {
  getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon,
} from "../controllers/couponController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validateCouponCreate } from "../middleware/validate.js";

const router = Router();

router.post("/validate", protect, validateCoupon);

// Admin only
router.get("/", protect, requireAdmin, getCoupons);
router.post("/", protect, requireAdmin, validateCouponCreate, createCoupon);
router.put("/:id", protect, requireAdmin, updateCoupon);
router.delete("/:id", protect, requireAdmin, deleteCoupon);

export default router;
