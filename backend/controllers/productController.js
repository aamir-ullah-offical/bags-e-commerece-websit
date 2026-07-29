import Product from "../models/Product.js";
import * as R from "../utils/apiResponse.js";

export const getProducts = async (req, res) => {
  const {
    page = 1, limit = 12, sort = "-createdAt",
    category, brand, minPrice, maxPrice, search,
    isFeatured, isTopPick, isTopSelling, color, material,
    minRating, inStock,
  } = req.query;

  const isAdmin = req.user?.role === "admin";

  // Only active products for public; admin can see all
  const filter = isAdmin ? {} : { isActive: true };

  if (category) filter.category = { $in: category.split(",").map((c) => c.trim()) };
  if (brand) filter.brand = { $in: brand.split(",").map((b) => b.trim()) };
  if (color) filter.color = { $in: color.split(",").map((c) => c.trim()) };
  if (material) filter.material = { $in: material.split(",").map((m) => m.trim()) };
  if (isFeatured === "true") filter.isFeatured = true;
  if (isTopPick === "true") filter.isTopPick = true;
  if (isTopSelling === "true") filter.isTopSelling = true;
  if (inStock === "true") filter.stock = { $gt: 0 };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const safeLimit = Math.min(Number(limit), 100);
  const skip = (Number(page) - 1) * safeLimit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(safeLimit).lean(),
    Product.countDocuments(filter),
  ]);

  R.paginated(res, products, total, page, safeLimit);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return R.error(res, "Product not found", 404);
  // Non-admin users cannot see inactive products
  if (!product.isActive && req.user?.role !== "admin") {
    return R.error(res, "Product not found", 404);
  }
  R.success(res, { product });
};

export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  R.created(res, { product }, "Product created");
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return R.error(res, "Product not found", 404);
  R.success(res, { product }, "Product updated");
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return R.error(res, "Product not found", 404);
  R.success(res, {}, "Product deleted");
};

export const getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id).select("category brand");
  if (!product) return R.error(res, "Product not found", 404);

  const related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category }, { brand: product.brand }],
  }).limit(8).lean();

  R.success(res, { products: related });
};

export const bulkUpdateProducts = async (req, res) => {
  const { ids, updates } = req.body;
  await Product.updateMany({ _id: { $in: ids } }, updates);
  R.success(res, {}, `${ids.length} products updated`);
};

export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean();
  R.success(res, { products });
};

export const getTopPicks = async (req, res) => {
  const products = await Product.find({ isTopPick: true, isActive: true }).limit(8).lean();
  R.success(res, { products });
};

export const getTopSelling = async (req, res) => {
  const products = await Product.find({ isTopSelling: true, isActive: true }).sort("-soldCount").limit(8).lean();
  R.success(res, { products });
};
