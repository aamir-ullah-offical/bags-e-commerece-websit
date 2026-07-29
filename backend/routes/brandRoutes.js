import { Router } from "express";
import { getBrands, createBrand, updateBrand, deleteBrand } from "../controllers/brandController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", getBrands);
router.post("/", protect, requireAdmin, createBrand);
router.put("/:id", protect, requireAdmin, updateBrand);
router.delete("/:id", protect, requireAdmin, deleteBrand);

export default router;
