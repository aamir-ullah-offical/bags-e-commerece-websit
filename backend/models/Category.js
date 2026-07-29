import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Category name is required"], unique: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    image: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("count", {
  ref: "Product",
  localField: "name",
  foreignField: "category",
  count: true,
});

categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

// name index is created automatically via unique:true
categorySchema.index({ sortOrder: 1 });

export default mongoose.model("Category", categorySchema);
