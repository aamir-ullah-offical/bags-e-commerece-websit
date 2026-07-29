import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   {
      type: String, required: true, trim: true, lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"],
    },
    subject: { type: String, trim: true, default: "General Enquiry" },
    message: { type: String, required: true, trim: true, minlength: [10, "Message must be at least 10 characters"] },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
