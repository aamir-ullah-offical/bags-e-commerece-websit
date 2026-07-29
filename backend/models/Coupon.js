import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    description: String,
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (orderAmount = 0, userId = null) {
  if (!this.isActive) return { valid: false, message: "Coupon is inactive" };
  if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, message: "Coupon has expired" };
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) return { valid: false, message: "Coupon usage limit reached" };
  if (userId && this.usedBy.some((id) => id.toString() === userId.toString())) {
    return { valid: false, message: "You have already used this coupon" };
  }
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order of Rs. ${this.minOrderAmount.toLocaleString()} required` };
  return { valid: true };
};

export default mongoose.model("Coupon", couponSchema);
