import { Router } from "express";
import {
  getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyCoupon,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.post("/coupon", applyCoupon);
router.put("/:itemId", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/:itemId", removeCartItem);

export default router;
