import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxies (Railway, Render, Vercel) so req.ip is the real client IP
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Gzip compression — reduces payload size ~70%
app.use(compression({ level: 6, threshold: 1024 }));

// CORS — allow localhost in dev plus any configured production URLs
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.ADDITIONAL_ORIGINS
    ? process.env.ADDITIONAL_ORIGINS.split(",").map((o) => o.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      // Allow any *.vercel.app subdomain (Vercel preview deployments)
      if (/^https:\/\/[\w-]+(\.[\w-]+)?\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Rate Limiting ──────────────────────────────────────────────────────────────
const isLocalDev = (req) => {
  if (process.env.NODE_ENV === "test") return true;
  if (process.env.NODE_ENV !== "development") return false;
  const ip = req.ip || req.socket?.remoteAddress || "";
  return ip === "127.0.0.1" || ip === "::1" || ip.startsWith("::ffff:127.");
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests — please try again in 15 minutes." },
  skip: isLocalDev,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts — please try again in 15 minutes." },
  skip: isLocalDev,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many uploads — please wait 15 minutes." },
  skip: isLocalDev,
});

app.use("/api/", generalLimiter);
app.use("/api/v1/upload", uploadLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/forgot-password", authLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/settings", settingRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/contact", contactRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Skip listen() on Vercel serverless — Vercel handles the port binding
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🗄️  Database: ${process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bags_ecommerce_db"}\n`);
  });
}

export default app;
