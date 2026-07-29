import Brand from "../models/Brand.js";
import * as R from "../utils/apiResponse.js";

export const getBrands = async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const brands = await Brand.find(filter).sort("name").lean();
  R.success(res, { brands });
};

export const createBrand = async (req, res) => {
  const brand = await Brand.create(req.body);
  R.created(res, { brand }, "Brand created");
};

export const updateBrand = async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!brand) return R.error(res, "Brand not found", 404);
  R.success(res, { brand }, "Brand updated");
};

export const deleteBrand = async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) return R.error(res, "Brand not found", 404);
  R.success(res, {}, "Brand deleted");
};
