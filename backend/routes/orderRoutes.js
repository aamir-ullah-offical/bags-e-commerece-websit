import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  addTrackingUpdate,
  cancelOrder,
  trackOrder,
} from "../controllers/orderController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validatePlaceOrder } from "../middleware/validate.js";

const router = Router();

// Public — no auth required (must be before router.use(protect))
router.get("/track/:trackingNumber", trackOrder);

router.use(protect);

router.post("/", validatePlaceOrder, placeOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);
router.post("/:id/tracking", requireAdmin, addTrackingUpdate);

// Admin only
router.get("/", requireAdmin, getAllOrders);
router.put("/:id/status", requireAdmin, updateOrderStatus);

export default router;
