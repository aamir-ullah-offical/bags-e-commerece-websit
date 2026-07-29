import Category from "../models/Category.js";
import Product from "../models/Product.js";
import * as R from "../utils/apiResponse.js";

export const getCategories = async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const categories = await Category.find(filter).sort("sortOrder name").lean();

  const withCounts = await Promise.all(
    categories.map(async (cat) => ({
      ...cat,
      count: await Product.countDocuments({ category: cat.name }),
    }))
  );

  R.success(res, { categories: withCounts });
};

export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return R.error(res, "Category not found", 404);
  R.success(res, { category });
};

export const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  R.created(res, { category }, "Category created");
};

export const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return R.error(res, "Category not found", 404);
  R.success(res, { category }, "Category updated");
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return R.error(res, "Category not found", 404);
  R.success(res, {}, "Category deleted");
};

export const bulkUpdateCategories = async (req, res) => {
  const { updates } = req.body; // Array of { id, ...fields }
  const ops = updates.map(({ id, ...fields }) => ({
    updateOne: { filter: { _id: id }, update: fields },
  }));
  await Category.bulkWrite(ops);
  R.success(res, {}, "Categories updated");
};
