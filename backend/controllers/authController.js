import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import * as R from "../utils/apiResponse.js";
import crypto from "crypto";

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return R.error(res, "Email already registered", 409);

  const user = await User.create({ fullName, email, password });
  const token = generateToken(user._id);

  R.created(res, {
    token,
    user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar },
  }, "Registration successful");
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return R.error(res, "Invalid email or password", 401);
  }

  if (!user.isActive) return R.error(res, "Account has been deactivated", 401);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  R.success(res, {
    token,
    user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar },
  }, "Login successful");
};

export const getMe = async (req, res) => {
  R.success(res, { user: req.user }, "Profile fetched");
};

export const updateMe = async (req, res) => {
  const { fullName, phone, avatar, addresses } = req.body;
  const allowedUpdates = {};
  if (fullName !== undefined) allowedUpdates.fullName = fullName;
  if (phone !== undefined) allowedUpdates.phone = phone;
  if (avatar !== undefined) allowedUpdates.avatar = avatar;
  if (addresses !== undefined) allowedUpdates.addresses = addresses;

  const user = await User.findByIdAndUpdate(req.user._id, allowedUpdates, { new: true, runValidators: true });
  R.success(res, { user }, "Profile updated");
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    return R.error(res, "Current password is incorrect", 400);
  }

  user.password = newPassword;
  await user.save();
  R.success(res, {}, "Password changed successfully");
};

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Always respond the same to prevent user enumeration
    return R.success(res, {}, "If that email exists, a reset link was sent");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // TODO: Send reset email in production. Token logged to server console for local dev only.
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] Password reset token for ${user.email}: ${resetToken}`);
  }

  R.success(res, {}, "If that email exists, a reset link was sent");
};

export const logout = async (req, res) => {
  R.success(res, {}, "Logged out successfully");
};

export const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return R.error(res, "Invalid or expired reset token", 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id);
  R.success(res, { token }, "Password reset successful");
};
