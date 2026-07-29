import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  resetUserPassword,
} from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireAdmin);

router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/reset-password", resetUserPassword);

export default router;
