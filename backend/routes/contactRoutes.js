import { Router } from "express";
import {
  submitContact,
  getContactMessages,
  markAsRead,
  deleteMessage,
} from "../controllers/contactController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public — anyone can submit a contact message
router.post("/", submitContact);

// Admin only
router.get("/", protect, requireAdmin, getContactMessages);
router.put("/:id/read", protect, requireAdmin, markAsRead);
router.delete("/:id", protect, requireAdmin, deleteMessage);

export default router;
