import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Allowed image MIME types
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|avif/;
  const mimeOk = allowed.test(file.mimetype);
  if (mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp, avif)"), false);
  }
};

// ── Storage factory ────────────────────────────────────────────────────────────
function makeStorage(folder, transformation) {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `maison-sac/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "avif"],
      transformation,
      resource_type: "image",
    }),
  });
}

// ── Preset storages ────────────────────────────────────────────────────────────
const productStorage = makeStorage("products", [
  { width: 1200, crop: "limit" },
  { quality: "auto", fetch_format: "webp" },
]);

const avatarStorage = makeStorage("avatars", [
  { width: 400, height: 400, crop: "fill", gravity: "face" },
  { quality: "auto", fetch_format: "webp" },
]);

const bannerStorage = makeStorage("banners", [
  { width: 1920, height: 800, crop: "fill" },
  { quality: "auto", fetch_format: "webp" },
]);

const generalStorage = makeStorage("general", [
  { width: 2000, crop: "limit" },
  { quality: "auto", fetch_format: "webp" },
]);

// ── Multer instances ───────────────────────────────────────────────────────────
const opts = (storage) => ({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadProductMiddleware = multer(opts(productStorage));
export const uploadAvatarMiddleware = multer(opts(avatarStorage));
export const uploadBannerMiddleware = multer(opts(bannerStorage));
export const uploadGeneralMiddleware = multer(opts(generalStorage));
