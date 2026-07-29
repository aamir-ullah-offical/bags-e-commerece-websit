import cloudinary from "../config/cloudinary.js";
import * as R from "../utils/apiResponse.js";

// ── Single image upload ────────────────────────────────────────────────────────
// multer-storage-cloudinary maps: secure_url → path, public_id → filename, bytes → size
export const uploadImage = (req, res) => {
  if (!req.file) return R.error(res, "No file uploaded", 400);

  const url = req.file.path || req.file.secure_url;
  const publicId = req.file.filename || req.file.public_id;

  if (!url) return R.error(res, "Upload to Cloudinary failed — no URL returned", 500);

  R.created(res, { url, publicId, size: req.file.size }, "Image uploaded");
};

// ── Multiple images upload ─────────────────────────────────────────────────────
export const uploadImages = (req, res) => {
  if (!req.files || req.files.length === 0) return R.error(res, "No files uploaded", 400);

  const images = req.files.map((f) => ({
    url: f.path || f.secure_url,
    publicId: f.filename || f.public_id,
    size: f.size,
  }));

  R.created(res, { images }, "Images uploaded");
};

// ── Delete image by public_id ──────────────────────────────────────────────────
export const deleteImage = async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) return R.error(res, "publicId is required", 400);

  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok" && result.result !== "not found") {
    return R.error(res, "Failed to delete image from Cloudinary", 500);
  }

  R.success(res, { result: result.result }, "Image deleted");
};

// ── Generate a signed upload URL (optional — for direct browser uploads) ───────
export const getSignedUploadUrl = async (req, res) => {
  const { folder = "general", tags } = req.query;
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    folder: `maison-sac/${folder}`,
    ...(tags ? { tags } : {}),
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  R.success(res, {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: `maison-sac/${folder}`,
  });
};
