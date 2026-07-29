import { Router } from "express";
import { subscribe, unsubscribe, getSubscribers } from "../controllers/newsletterController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin
router.get("/", protect, requireAdmin, getSubscribers);

export default router;
