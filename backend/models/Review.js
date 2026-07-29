import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 5 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A user can only review a product once
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// After saving a review, update product rating
reviewSchema.post("save", async function () {
  await updateProductRating(this.product);
});

// Mongoose 8: findOneAndDelete no longer fires "remove" — use document middleware explicitly
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await updateProductRating(doc.product);
});

reviewSchema.post("deleteOne", { document: true, query: false }, async function () {
  await updateProductRating(this.product);
});

async function updateProductRating(productId) {
  const Product = mongoose.model("Product");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
  }
}

export default mongoose.model("Review", reviewSchema);
