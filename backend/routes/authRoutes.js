import { Router } from "express";
import {
  register, login, logout, getMe, updateMe, changePassword,
  forgotPassword, resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from "../middleware/validate.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/logout", protect, logout);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password/:token", validateResetPassword, resetPassword);

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/change-password", protect, validateChangePassword, changePassword);

export default router;
