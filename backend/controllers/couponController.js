import Coupon from "../models/Coupon.js";
import * as R from "../utils/apiResponse.js";

export const getCoupons = async (req, res) => {
  const filter = req.query.active === "true" ? { isActive: true } : {};
  const coupons = await Coupon.find(filter).sort("-createdAt").lean();
  R.success(res, { coupons });
};

export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxUses, isActive, expiresAt, description } = req.body;
  const coupon = await Coupon.create({ code, discountType, discountValue, minOrderAmount, maxUses, isActive, expiresAt, description });
  R.created(res, { coupon }, "Coupon created");
};

export const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return R.error(res, "Coupon not found", 404);
  R.success(res, { coupon }, "Coupon updated");
};

export const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return R.error(res, "Coupon not found", 404);
  R.success(res, {}, "Coupon deleted");
};

export const validateCoupon = async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) return R.error(res, "Invalid coupon code", 400);

  const result = coupon.isValid(subtotal || 0, req.user._id);
  if (!result.valid) return R.error(res, result.message, 400);

  const discount =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  R.success(res, {
    coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
    discount: Math.min(discount, subtotal),
  }, "Coupon is valid");
};
