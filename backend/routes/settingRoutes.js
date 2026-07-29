import { Router } from "express";
import {
  getContactInfo, saveContactInfo,
  getWebsiteSettings, saveWebsiteSettings,
  getAppearanceSettings, saveAppearanceSettings,
  getStaticPages, saveStaticPages,
  getMedia, saveMedia,
  getAllSettings,
  getPublicSettings,
} from "../controllers/settingController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public — no auth required (used by frontend SettingsContext on app load)
router.get("/public", getPublicSettings);

router.use(protect, requireAdmin);

router.get("/", getAllSettings);
router.get("/contact", getContactInfo);
router.post("/contact", saveContactInfo);
router.get("/website", getWebsiteSettings);
router.post("/website", saveWebsiteSettings);
router.get("/appearance", getAppearanceSettings);
router.post("/appearance", saveAppearanceSettings);
router.get("/pages", getStaticPages);
router.post("/pages", saveStaticPages);
router.get("/media", getMedia);
router.post("/media", saveMedia);

export default router;
