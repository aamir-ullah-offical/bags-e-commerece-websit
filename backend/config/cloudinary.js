import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// dotenv.config() is idempotent — safe to call here so env vars are available
// even when this module is evaluated before server.js's dotenv.config() runs
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
