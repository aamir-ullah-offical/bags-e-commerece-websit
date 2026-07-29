import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    selectedColor: String,
    price: Number,
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Computed total virtual
cartSchema.virtual("total").get(function () {
  return this.items.reduce((sum, item) => {
    const price = item.price || 0;
    return sum + price * item.quantity;
  }, 0);
});

// user index is created automatically via unique:true

export default mongoose.model("Cart", cartSchema);
