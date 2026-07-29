import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    discountText: String,
    image: { type: String, required: true },
    ctaText: { type: String, default: "Shop Now" },
    ctaLink: { type: String, default: "/shop" },
    badge: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bannerSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model("Banner", bannerSchema);
