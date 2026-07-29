import { Router } from "express";
import {
  getCategories, getCategoryById, createCategory,
  updateCategory, deleteCategory, bulkUpdateCategories,
} from "../controllers/categoryController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post("/", protect, requireAdmin, createCategory);
router.put("/bulk", protect, requireAdmin, bulkUpdateCategories);
router.put("/:id", protect, requireAdmin, updateCategory);
router.delete("/:id", protect, requireAdmin, deleteCategory);

export default router;
