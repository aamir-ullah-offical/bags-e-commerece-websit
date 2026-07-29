import { Router } from "express";
import {
  getProductReviews, addReview, updateReview, deleteReview,
  getAllReviews, approveReview,
} from "../controllers/reviewController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validateReview } from "../middleware/validate.js";

const router = Router();

// Product-specific reviews
router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protect, validateReview, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

// Admin
router.get("/", protect, requireAdmin, getAllReviews);
router.put("/:id/approve", protect, requireAdmin, approveReview);

export default router;
