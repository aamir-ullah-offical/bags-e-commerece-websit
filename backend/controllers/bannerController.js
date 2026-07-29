import Banner from "../models/Banner.js";
import * as R from "../utils/apiResponse.js";

export const getBanners = async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const banners = await Banner.find(filter).sort("sortOrder").lean();
  R.success(res, { banners });
};

export const createBanner = async (req, res) => {
  const banner = await Banner.create(req.body);
  R.created(res, { banner }, "Banner created");
};

export const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!banner) return R.error(res, "Banner not found", 404);
  R.success(res, { banner }, "Banner updated");
};

export const deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return R.error(res, "Banner not found", 404);
  R.success(res, {}, "Banner deleted");
};

export const bulkUpdateBanners = async (req, res) => {
  const { updates } = req.body;
  const ops = updates.map(({ id, ...fields }) => ({
    updateOne: { filter: { _id: id }, update: fields },
  }));
  await Banner.bulkWrite(ops);
  R.success(res, {}, "Banners updated");
};
