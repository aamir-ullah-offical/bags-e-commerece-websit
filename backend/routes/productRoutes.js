import { Router } from "express";
import {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, getRelatedProducts, bulkUpdateProducts,
  getFeaturedProducts, getTopPicks, getTopSelling,
} from "../controllers/productController.js";
import { protect, requireAdmin, optionalAuth } from "../middleware/auth.js";
import { validateProductCreate, validateProductUpdate, validatePagination } from "../middleware/validate.js";

const router = Router();

router.get("/", optionalAuth, validatePagination, getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/top-picks", getTopPicks);
router.get("/top-selling", getTopSelling);
router.get("/:id", optionalAuth, getProductById);
router.get("/:id/related", getRelatedProducts);

router.post("/", protect, requireAdmin, validateProductCreate, createProduct);
router.put("/bulk", protect, requireAdmin, bulkUpdateProducts);
router.put("/:id", protect, requireAdmin, validateProductUpdate, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);

export default router;
