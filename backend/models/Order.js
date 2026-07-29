import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: String,
    discount: { type: Number, default: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "Pakistan" },
  },
  { _id: false }
);

const trackingStepSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestEmail: String,
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: { type: String, default: "Cash On Delivery" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
        "Refunded",
      ],
      default: "Pending",
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: String,
    trackingNumber: { type: String, default: "" },
    estimatedDelivery: { type: Date },
    trackingSteps: [trackingStepSchema],
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    deliveredAt: Date,
    cancelledAt: Date,
    returnedAt: Date,
  },
  { timestamps: true }
);

// Auto-generate collision-safe order number with retry
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    let attempts = 0;
    while (attempts < 10) {
      const rand = Math.floor(100000 + Math.random() * 900000);
      const candidate = `MDS-${rand}`;
      const existing = await mongoose.model("Order").findOne({ orderNumber: candidate }).lean();
      if (!existing) {
        this.orderNumber = candidate;
        break;
      }
      attempts++;
    }
    if (!this.orderNumber) {
      // Fallback: timestamp-based to guarantee uniqueness
      this.orderNumber = `MDS-${Date.now()}`;
    }
  }
  next();
});

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });
// Compound indexes for customer order history and admin dashboard
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ user: 1, orderStatus: 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
