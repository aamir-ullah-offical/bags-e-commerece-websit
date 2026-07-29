import { Router } from "express";
import {
  getTestimonials, createTestimonial, updateTestimonial,
  deleteTestimonial, bulkUpdateTestimonials,
} from "../controllers/testimonialController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", getTestimonials);

router.post("/", protect, requireAdmin, createTestimonial);
router.put("/bulk", protect, requireAdmin, bulkUpdateTestimonials);
router.put("/:id", protect, requireAdmin, updateTestimonial);
router.delete("/:id", protect, requireAdmin, deleteTestimonial);

export default router;
