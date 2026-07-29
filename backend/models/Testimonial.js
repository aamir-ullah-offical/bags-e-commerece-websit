import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    photo: { type: String },
    role: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
