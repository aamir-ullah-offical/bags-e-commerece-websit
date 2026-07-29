import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import * as R from "../utils/apiResponse.js";

const populateWishlist = (wl) =>
  wl.populate({ path: "items.product", select: "name images price discount category brand stock" });

export const getWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  await populateWishlist(wishlist);
  R.success(res, { wishlist });
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) return R.error(res, "Product not found", 404);

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, items: [] });

  const alreadyAdded = wishlist.items.some((item) => item.product.toString() === productId);
  if (alreadyAdded) return R.error(res, "Product already in wishlist", 400);

  wishlist.items.push({ product: productId });
  await wishlist.save();
  await populateWishlist(wishlist);
  R.success(res, { wishlist }, "Added to wishlist");
};

export const removeFromWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return R.error(res, "Wishlist not found", 404);

  wishlist.items = wishlist.items.filter((item) => item.product.toString() !== req.params.productId);
  await wishlist.save();
  await populateWishlist(wishlist);
  R.success(res, { wishlist }, "Removed from wishlist");
};

export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) return R.error(res, "Product not found", 404);

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, items: [] });

  const idx = wishlist.items.findIndex((item) => item.product.toString() === productId);
  let action;
  if (idx >= 0) {
    wishlist.items.splice(idx, 1);
    action = "removed";
  } else {
    wishlist.items.push({ product: productId });
    action = "added";
  }

  await wishlist.save();
  await populateWishlist(wishlist);
  R.success(res, { wishlist, action }, `Product ${action} ${action === "added" ? "to" : "from"} wishlist`);
};
