import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import * as R from "../utils/apiResponse.js";

const populateCart = (cart) =>
  cart.populate({ path: "items.product", select: "name images price discount category brand stock" });

export const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  await populateCart(cart);
  R.success(res, { cart });
};

export const addToCart = async (req, res) => {
  const { productId, quantity = 1, selectedColor } = req.body;

  if (!productId) return R.error(res, "Product ID is required", 400);
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) return R.error(res, "Quantity must be a positive integer", 400);

  const product = await Product.findById(productId);
  if (!product) return R.error(res, "Product not found", 404);
  if (!product.isActive) return R.error(res, "Product is not available", 400);
  if (product.stock < 1) return R.error(res, "Product is out of stock", 400);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingIdx = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.selectedColor === selectedColor
  );

  // Always store current discounted price so order calculations match what user sees
  const discountedPrice = parseFloat(
    Math.round(product.price * (1 - (product.discount || 0) / 100))
  );

  if (existingIdx >= 0) {
    const newQty = cart.items[existingIdx].quantity + qty;
    if (newQty > product.stock) {
      return R.error(res, `Only ${product.stock} units available in stock`, 400);
    }
    cart.items[existingIdx].quantity = newQty;
    cart.items[existingIdx].price = discountedPrice;
  } else {
    if (qty > product.stock) {
      return R.error(res, `Only ${product.stock} units available in stock`, 400);
    }
    cart.items.push({ product: productId, quantity: qty, selectedColor, price: discountedPrice });
  }

  await cart.save();
  await populateCart(cart);
  R.success(res, { cart }, "Added to cart");
};

export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params; // itemId = product._id sent from frontend

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) return R.error(res, "Quantity must be a non-negative integer", 400);

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return R.error(res, "Cart not found", 404);

  // Frontend sends product._id; find the matching cart item by product reference
  const item = cart.items.find((i) => i.product.toString() === itemId);
  if (!item) return R.error(res, "Cart item not found", 404);

  if (qty <= 0) {
    item.deleteOne();
  } else {
    // Validate against current stock
    const product = await Product.findById(item.product).select("stock isActive price discount");
    if (!product || !product.isActive) {
      item.deleteOne();
      await cart.save();
      return R.error(res, "Product is no longer available and was removed from your cart", 400);
    }
    if (qty > product.stock) {
      return R.error(res, `Only ${product.stock} units available in stock`, 400);
    }
    item.quantity = qty;
    // Refresh price to current discounted price
    item.price = parseFloat(Math.round(product.price * (1 - (product.discount || 0) / 100)));
  }

  await cart.save();
  await populateCart(cart);
  R.success(res, { cart }, "Cart updated");
};

export const removeCartItem = async (req, res) => {
  const { itemId } = req.params; // itemId = product._id sent from frontend
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return R.error(res, "Cart not found", 404);

  // Frontend sends product._id; find the matching cart item by product reference
  const item = cart.items.find((i) => i.product.toString() === itemId);
  if (!item) return R.error(res, "Cart item not found", 404);

  item.deleteOne();
  await cart.save();
  await populateCart(cart);
  R.success(res, { cart }, "Item removed");
};

export const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = undefined;
    cart.couponDiscount = 0;
    await cart.save();
  }
  R.success(res, { cart: cart || { items: [] } }, "Cart cleared");
};

export const applyCoupon = async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return R.error(res, "Cart not found", 404);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return R.error(res, "Invalid coupon code", 400);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const validation = coupon.isValid(subtotal, req.user._id);
  if (!validation.valid) return R.error(res, validation.message, 400);

  const discount =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  cart.couponCode = coupon.code;
  cart.couponDiscount = Math.min(discount, subtotal);
  await cart.save();

  R.success(res, { cart, discount: cart.couponDiscount }, "Coupon applied");
};
