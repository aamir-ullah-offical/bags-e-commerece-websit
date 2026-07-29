import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
    source: { type: String, default: "website" },
  },
  { timestamps: true }
);

// email index is created automatically via unique:true
newsletterSchema.index({ isActive: 1 });

export default mongoose.model("Newsletter", newsletterSchema);
