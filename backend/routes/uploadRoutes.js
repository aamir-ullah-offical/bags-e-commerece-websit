import { Router } from "express";
import {
  uploadImage,
  uploadImages,
  deleteImage,
  getSignedUploadUrl,
} from "../controllers/uploadController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import {
  uploadProductMiddleware,
  uploadAvatarMiddleware,
  uploadBannerMiddleware,
  uploadGeneralMiddleware,
} from "../middleware/upload.js";

const router = Router();

// All upload routes require admin authentication
router.use(protect, requireAdmin);

// POST /api/v1/upload/image          — single product image
router.post("/image", uploadProductMiddleware.single("image"), uploadImage);

// POST /api/v1/upload/images         — up to 10 product images
router.post("/images", uploadProductMiddleware.array("images", 10), uploadImages);

// POST /api/v1/upload/avatar         — user avatar (face-crop, 400×400)
router.post("/avatar", uploadAvatarMiddleware.single("image"), uploadImage);

// POST /api/v1/upload/banner         — banner image (1920×800 fill)
router.post("/banner", uploadBannerMiddleware.single("image"), uploadImage);

// POST /api/v1/upload/general        — logo, misc assets (2000px limit)
router.post("/general", uploadGeneralMiddleware.single("image"), uploadImage);

// DELETE /api/v1/upload              — delete by publicId
router.delete("/", deleteImage);

// GET /api/v1/upload/sign            — signed URL for direct browser upload
router.get("/sign", getSignedUploadUrl);

export default router;
