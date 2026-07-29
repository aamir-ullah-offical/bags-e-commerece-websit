import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import * as R from "../utils/apiResponse.js";
import { ORDER_STATUSES } from "../constants/index.js";

export const placeOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.street || !shippingAddress?.city) {
    return R.error(res, "Complete shipping address is required", 400);
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images price discount stock isActive"
  );
  if (!cart || cart.items.length === 0) return R.error(res, "Your cart is empty", 400);

  // Validate all products are still available with sufficient stock
  const stockErrors = [];
  for (const item of cart.items) {
    const p = item.product;
    if (!p || !p.isActive) {
      stockErrors.push(`"${p?.name || "A product"}" is no longer available`);
    } else if (item.quantity > p.stock) {
      stockErrors.push(`"${p.name}" only has ${p.stock} unit(s) in stock (you requested ${item.quantity})`);
    }
  }
  if (stockErrors.length > 0) {
    return R.error(res, stockErrors.join("; "), 400);
  }

  // Build order items using CURRENT product prices (not stale cart prices)
  const items = cart.items.map((item) => {
    const p = item.product;
    const currentPrice = Math.round(p.price * (1 - (p.discount || 0) / 100));
    return {
      product: p._id,
      name: p.name,
      image: p.images?.[0] || "",
      price: currentPrice,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      discount: p.discount || 0,
    };
  });

  const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const shippingFee = subtotal >= 20000 ? 0 : 450;

  let couponDiscount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validation = coupon.isValid(subtotal, req.user._id);
      if (validation.valid) {
        couponDiscount = Math.round(coupon.discountType === "percentage"
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue
          );
        couponDiscount = Math.min(couponDiscount, subtotal);
        appliedCoupon = coupon;
      }
    }
  }

  const tax = Math.round((subtotal - couponDiscount) * 0.17);
  const total = Math.round(subtotal + shippingFee + tax - couponDiscount);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 6);

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || "Cash On Delivery",
    couponCode: couponCode?.toUpperCase(),
    couponDiscount,
    subtotal,
    shippingFee,
    tax,
    total,
    estimatedDelivery,
    statusHistory: [{ status: ORDER_STATUSES.PENDING, note: "Order placed successfully" }],
    trackingSteps: [
      {
        status: ORDER_STATUSES.PENDING,
        title: "Order Placed",
        description: "Your order has been received and is awaiting confirmation.",
        timestamp: new Date(),
        isCompleted: true,
      },
    ],
  });

  // Record coupon usage only after order is created successfully
  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    appliedCoupon.usedBy.push(req.user._id);
    await appliedCoupon.save();
  }

  // Decrement stock and increment soldCount atomically
  await Promise.all(
    cart.items.map((item) =>
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      })
    )
  );

  // Clear cart
  cart.items = [];
  cart.couponCode = undefined;
  cart.couponDiscount = 0;
  await cart.save();

  R.created(res, { order }, "Order placed successfully");
};

export const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort("-createdAt").skip(skip).limit(Number(limit)).lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);

  R.paginated(res, orders, total, page, limit);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "fullName email").lean();

  if (!order) return R.error(res, "Order not found", 404);

  const isOwner = order.user?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return R.error(res, "Not authorized", 403);

  R.success(res, { order });
};

export const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (search) filter.orderNumber = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "fullName email avatar")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(filter),
  ]);

  R.paginated(res, orders, total, page, limit);
};

export const updateOrderStatus = async (req, res) => {
  const { status, note, trackingNumber, estimatedDelivery, trackingStep } = req.body;

  const allStatuses = Object.values(ORDER_STATUSES);
  if (!allStatuses.includes(status)) {
    return R.error(res, `Invalid status. Must be one of: ${allStatuses.join(", ")}`, 400);
  }

  // Fetch first so we can check existing trackingNumber for auto-generation
  const existingOrder = await Order.findById(req.params.id);
  if (!existingOrder) return R.error(res, "Order not found", 404);

  const updateFields = {
    orderStatus: status,
    $push: { statusHistory: { status, note: note || "" } },
  };

  if (status === ORDER_STATUSES.DELIVERED) {
    updateFields.paymentStatus = "Paid";
    updateFields.deliveredAt = new Date();
  }
  if (status === ORDER_STATUSES.CANCELLED) {
    updateFields.cancelledAt = new Date();
  }
  if (status === ORDER_STATUSES.RETURNED) {
    updateFields.returnedAt = new Date();
  }

  // Auto-generate tracking number when shipping if none already assigned
  if (status === ORDER_STATUSES.SHIPPED && !existingOrder.trackingNumber && !trackingNumber) {
    updateFields.trackingNumber = `MSAC-${Math.floor(100000 + Math.random() * 900000)}`;
  } else if (trackingNumber) {
    updateFields.trackingNumber = trackingNumber;
  }

  if (estimatedDelivery) updateFields.estimatedDelivery = new Date(estimatedDelivery);

  if (trackingStep) {
    updateFields.$push.trackingSteps = {
      status,
      title: trackingStep.title || status,
      description: trackingStep.description || note || "",
      location: trackingStep.location || "",
      timestamp: new Date(),
      isCompleted: true,
    };
  }

  const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true }).populate(
    "user",
    "fullName email"
  );

  if (!order) return R.error(res, "Order not found", 404);
  R.success(res, { order }, "Order status updated");
};

export const trackOrder = async (req, res) => {
  const { trackingNumber } = req.params;

  const order = await Order.findOne({
    $or: [
      { trackingNumber: trackingNumber.toUpperCase() },
      { orderNumber: { $regex: `^${trackingNumber}$`, $options: "i" } },
    ],
  }).select(
    "orderNumber orderStatus trackingNumber trackingSteps estimatedDelivery deliveredAt shippingAddress items createdAt updatedAt"
  );

  if (!order) {
    return R.error(res, "No order found with this tracking number. Please check and try again.", 404);
  }

  const publicOrder = {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    trackingNumber: order.trackingNumber,
    trackingSteps: order.trackingSteps,
    estimatedDelivery: order.estimatedDelivery,
    deliveredAt: order.deliveredAt,
    shippingAddress: {
      city: order.shippingAddress?.city,
      province: order.shippingAddress?.province,
      country: order.shippingAddress?.country,
    },
    itemCount: order.items?.length || 0,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };

  R.success(res, { order: publicOrder });
};

export const addTrackingUpdate = async (req, res) => {
  const { title, description, location, status } = req.body;
  if (!title) return R.error(res, "Tracking title is required", 400);

  const order = await Order.findById(req.params.id);
  if (!order) return R.error(res, "Order not found", 404);

  const step = {
    status: status || order.orderStatus,
    title,
    description: description || "",
    location: location || "",
    timestamp: new Date(),
    isCompleted: true,
  };

  order.trackingSteps.push(step);
  await order.save();

  R.success(res, { order }, "Tracking update added");
};

export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return R.error(res, "Order not found", 404);

  const isOwner = order.user?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") return R.error(res, "Not authorized", 403);

  if ([ORDER_STATUSES.SHIPPED, ORDER_STATUSES.OUT_FOR_DELIVERY, ORDER_STATUSES.DELIVERED].includes(order.orderStatus)) {
    return R.error(res, "Cannot cancel an order that has been shipped or delivered", 400);
  }

  order.orderStatus = ORDER_STATUSES.CANCELLED;
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: ORDER_STATUSES.CANCELLED, note: req.body.note || "Cancelled by user" });
  order.trackingSteps.push({
    status: ORDER_STATUSES.CANCELLED,
    title: "Order Cancelled",
    description: req.body.note || "The order has been cancelled.",
    timestamp: new Date(),
    isCompleted: true,
  });

  // Restore stock atomically — single bulkWrite instead of N×2 queries
  if (order.items.length > 0) {
    await Product.bulkWrite(
      order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: [
            {
              $set: {
                stock: { $add: ["$stock", item.quantity] },
                soldCount: { $max: [0, { $subtract: ["$soldCount", item.quantity] }] },
              },
            },
          ],
        },
      }))
    );
  }

  await order.save();
  R.success(res, { order }, "Order cancelled");
};
