import Review from "../models/Review.js";
import Order from "../models/Order.js";
import * as R from "../utils/apiResponse.js";

export const getProductReviews = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { product: req.params.productId, isApproved: true };
  const [reviews, total] = await Promise.all([
    Review.find(filter).populate("user", "fullName avatar").sort("-createdAt").skip(skip).limit(Number(limit)),
    Review.countDocuments(filter),
  ]);

  R.paginated(res, reviews, total, page, limit);
};

export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
  if (alreadyReviewed) return R.error(res, "You have already reviewed this product", 400);

  // Optionally verify purchase
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    "items.product": productId,
    orderStatus: "Delivered",
  });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.fullName,
    rating,
    comment,
    isApproved: !!hasPurchased, // auto-approve if purchased
  });

  R.created(res, { review }, hasPurchased ? "Review published" : "Review submitted for moderation");
};

export const updateReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return R.error(res, "Review not found or not authorized", 404);

  const { rating, comment } = req.body;
  if (rating) review.rating = rating;
  if (comment) review.comment = comment;
  await review.save();

  R.success(res, { review }, "Review updated");
};

export const deleteReview = async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== "admin") filter.user = req.user._id;

  const review = await Review.findOneAndDelete(filter);
  if (!review) return R.error(res, "Review not found or not authorized", 404);
  R.success(res, {}, "Review deleted");
};

export const getAllReviews = async (req, res) => {
  const { page = 1, limit = 20, approved } = req.query;
  const filter = {};
  if (approved !== undefined) filter.isApproved = approved === "true";

  const skip = (Number(page) - 1) * Number(limit);
  const [reviews, total] = await Promise.all([
    Review.find(filter).populate("user", "fullName").populate("product", "name").sort("-createdAt").skip(skip).limit(Number(limit)),
    Review.countDocuments(filter),
  ]);

  R.paginated(res, reviews, total, page, limit);
};

export const approveReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!review) return R.error(res, "Review not found", 404);
  R.success(res, { review }, "Review approved");
};
