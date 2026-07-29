import { body, param, query, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth validators ────────────────────────────────────────────────────────────
export const validateRegister = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 3, max: 60 }).withMessage("Full name must be 3–60 characters")
    .matches(/^[a-zA-Z\s'-]+$/).withMessage("Full name must contain only letters, spaces, hyphens, or apostrophes"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .isLength({ max: 128 }).withMessage("Password cannot exceed 128 characters"),

  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

export const validateForgotPassword = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  handleValidationErrors,
];

export const validateResetPassword = [
  param("token")
    .notEmpty().withMessage("Reset token is required")
    .isLength({ min: 64, max: 64 }).withMessage("Invalid reset token format"),

  body("password")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .isLength({ max: 128 }).withMessage("Password cannot exceed 128 characters"),

  handleValidationErrors,
];

export const validateChangePassword = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
    .isLength({ max: 128 }).withMessage("Password cannot exceed 128 characters")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),

  handleValidationErrors,
];

// ── Product validators ─────────────────────────────────────────────────────────
export const validateProductCreate = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required")
    .isLength({ max: 200 }).withMessage("Product name cannot exceed 200 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("stock")
    .notEmpty().withMessage("Stock is required")
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required"),

  body("brand")
    .trim()
    .notEmpty().withMessage("Brand is required"),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Discount must be between 0 and 100"),

  handleValidationErrors,
];

// ── Product update validator (all fields optional) ────────────────────────────
export const validateProductUpdate = [
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("Product name cannot be empty")
    .isLength({ max: 200 }).withMessage("Product name cannot exceed 200 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Discount must be between 0 and 100"),

  handleValidationErrors,
];

// ── Order validators ───────────────────────────────────────────────────────────
export const validatePlaceOrder = [
  body("shippingAddress.fullName")
    .trim()
    .notEmpty().withMessage("Shipping address: full name is required"),

  body("shippingAddress.email")
    .trim()
    .notEmpty().withMessage("Shipping address: email is required")
    .isEmail().withMessage("Shipping address: must be a valid email"),

  body("shippingAddress.street")
    .trim()
    .notEmpty().withMessage("Shipping address: street is required"),

  body("shippingAddress.city")
    .trim()
    .notEmpty().withMessage("Shipping address: city is required"),

  body("paymentMethod")
    .optional()
    .isIn(["Cash On Delivery", "Card", "JazzCash", "EasyPaisa", "Bank Transfer"])
    .withMessage("Invalid payment method"),

  handleValidationErrors,
];

// ── Coupon validators ──────────────────────────────────────────────────────────
export const validateCouponCreate = [
  body("code")
    .trim()
    .notEmpty().withMessage("Coupon code is required")
    .isLength({ min: 3, max: 20 }).withMessage("Code must be 3–20 characters")
    .matches(/^[A-Z0-9_-]+$/i).withMessage("Code can only contain letters, numbers, underscores, hyphens"),

  body("discountType")
    .notEmpty().withMessage("Discount type is required")
    .isIn(["percentage", "fixed"]).withMessage("Discount type must be 'percentage' or 'fixed'"),

  body("discountValue")
    .notEmpty().withMessage("Discount value is required")
    .isFloat({ min: 0.01 }).withMessage("Discount value must be greater than 0"),

  body("expiresAt")
    .optional()
    .isISO8601().withMessage("Expiry date must be a valid date"),

  handleValidationErrors,
];

// ── Review validators ──────────────────────────────────────────────────────────
export const validateReview = [
  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("comment")
    .trim()
    .notEmpty().withMessage("Comment is required")
    .isLength({ min: 10 }).withMessage("Comment must be at least 10 characters")
    .isLength({ max: 1000 }).withMessage("Comment cannot exceed 1000 characters"),

  handleValidationErrors,
];

// ── Pagination query validator ─────────────────────────────────────────────────
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];
