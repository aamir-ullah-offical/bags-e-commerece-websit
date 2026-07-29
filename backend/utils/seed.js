import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Banner from "../models/Banner.js";
import Testimonial from "../models/Testimonial.js";
import Brand from "../models/Brand.js";
import Setting from "../models/Setting.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import Newsletter from "../models/Newsletter.js";

const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bags_ecommerce_db";

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);

// ─── Image Pools ──────────────────────────────────────────────────────────────
// Curated Unsplash photo IDs per category — each ID maps to a genuine bag photo.
// pickImages(pool, count) shuffles the pool and returns `count` unique full URLs.

const IMG_BASE = "https://images.unsplash.com/photo-";
const IMG_OPTS = "?auto=format&fit=crop&w=800&q=80";

const imagePools = {
  "Tote Bags": [
    "1548036328-c9fa89d128fa", // beige structured tote on marble
    "1584917865442-de89df76afd3", // caramel leather tote
    "1590736969955-71cc94901144", // tan tote close-up
    "1566150905458-1bf1fc113f0d", // brown leather tote lifestyle
    "1591561954555-607968733893", // olive canvas tote
    "1553062407-98eeb64c6a62", // classic tan structured tote
    "1543087903-1ac9cc0b0ef3", // cream leather tote flat lay
    "1618354691373-d851c5c3a990", // camel tote overhead
  ],
  "Shoulder Bags": [
    "1575032617751-6ddec2089882", // black shoulder bag city
    "1584917865442-de89df76afd3", // cognac shoulder bag
    "1590736969955-71cc94901144", // shoulder bag close texture
    "1548036328-c9fa89d128fa", // structured shoulder bag
    "1566150905458-1bf1fc113f0d", // everyday shoulder bag brown
    "1618354691373-d851c5c3a990", // camel shoulder lifestyle
    "1584917865442-de89df76afd3", // chestnut pebbled
    "1543087903-1ac9cc0b0ef3", // ivory white shoulder
  ],
  "Crossbody Bags": [
    "1590736969955-71cc94901144", // blush crossbody on stone
    "1548036328-c9fa89d128fa", // mini crossbody light
    "1583623025817-d180a2221d0a", // cognac cross-body detail
    "1566150905458-1bf1fc113f0d", // brown crossbody flat lay
    "1553062407-98eeb64c6a62", // structured crossbody
    "1618354691373-d851c5c3a990", // tan mini crossbody
    "1543087903-1ac9cc0b0ef3", // cream crossbody overhead
    "1575032617751-6ddec2089882", // black mini crossbody
  ],
  "Clutch Bags": [
    "1627723552786-cebfb8b1c3e4", // champagne evening clutch
    "1566150905458-1bf1fc113f0d", // velvet envelope clutch
    "1553062407-98eeb64c6a62", // gold frame clutch
    "1590736969955-71cc94901144", // satin clutch party
    "1543087903-1ac9cc0b0ef3", // ivory beaded clutch
    "1618354691373-d851c5c3a990", // midnight envelope on silk
    "1575032617751-6ddec2089882", // black leather clutch
    "1583623025817-d180a2221d0a", // cognac frame clutch
  ],
  Backpacks: [
    "1553062407-98eeb64c6a62", // olive canvas backpack
    "1618354691373-d851c5c3a990", // camel leather backpack
    "1566150905458-1bf1fc113f0d", // brown leather slim backpack
    "1543087903-1ac9cc0b0ef3", // cream structured backpack
    "1584917865442-de89df76afd3", // cognac backpack lifestyle
    "1590736969955-71cc94901144", // grey canvas backpack detail
    "1575032617751-6ddec2089882", // black commuter backpack
    "1548036328-c9fa89d128fa", // tan laptop backpack
  ],
  "Satchel Bags": [
    "1553062407-98eeb64c6a62", // cognac veg-tanned satchel
    "1566150905458-1bf1fc113f0d", // dark leather satchel
    "1618354691373-d851c5c3a990", // camel heritage satchel
    "1584917865442-de89df76afd3", // tan satchel flat lay
    "1548036328-c9fa89d128fa", // structured satchel on desk
    "1590736969955-71cc94901144", // chestnut double-buckle satchel
    "1543087903-1ac9cc0b0ef3", // ivory doctor satchel
    "1583623025817-d180a2221d0a", // cognac patina satchel
  ],
  "Bucket Bags": [
    "1566150905458-1bf1fc113f0d", // lavender suede bucket
    "1583623025817-d180a2221d0a", // camel napa bucket
    "1575032617751-6ddec2089882", // black bucket drawstring
    "1553062407-98eeb64c6a62", // tan drawstring bucket
    "1618354691373-d851c5c3a990", // camel leather bucket overhead
    "1590736969955-71cc94901144", // suede bucket close-up
    "1548036328-c9fa89d128fa", // structured bucket natural
    "1584917865442-de89df76afd3", // cognac bucket lifestyle
  ],
  Wallets: [
    "1627123424574-724758594e93", // ivory card wallet
    "1578898886250-862a7f38ad27", // dark brown bifold
    "1553062407-98eeb64c6a62", // cognac slim wallet
    "1566150905458-1bf1fc113f0d", // tan long wallet
    "1618354691373-d851c5c3a990", // camel zip wallet
    "1590736969955-71cc94901144", // pebbled leather wallet
    "1543087903-1ac9cc0b0ef3", // white lambskin wallet
    "1584917865442-de89df76afd3", // full-grain bifold
  ],
};

/**
 * Return `count` unique image URLs randomly sampled from the named category pool.
 * Falls back to the tote pool if the category isn't mapped.
 */
function pickImages(category, count = 2) {
  const pool = imagePools[category] ?? imagePools["Tote Bags"];
  // Fisher-Yates shuffle on a copy
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count).map((id) => `${IMG_BASE}${id}${IMG_OPTS}`);
}

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = [
  { name: "Tote Bags",      slug: "tote-bags",      isActive: true, sortOrder: 1 },
  { name: "Shoulder Bags",  slug: "shoulder-bags",  isActive: true, sortOrder: 2 },
  { name: "Crossbody Bags", slug: "crossbody-bags", isActive: true, sortOrder: 3 },
  { name: "Clutch Bags",    slug: "clutch-bags",    isActive: true, sortOrder: 4 },
  { name: "Backpacks",      slug: "backpacks",      isActive: true, sortOrder: 5 },
  { name: "Satchel Bags",   slug: "satchel-bags",   isActive: true, sortOrder: 6 },
  { name: "Bucket Bags",    slug: "bucket-bags",    isActive: true, sortOrder: 7 },
  { name: "Wallets",        slug: "wallets",        isActive: true, sortOrder: 8 },
];

// ─── Brands ───────────────────────────────────────────────────────────────────
const brands = [
  { name: "Maison Sac",  slug: "maison-sac",  isActive: true },
  { name: "LuxeCarry",   slug: "luxecarry",   isActive: true },
  { name: "UrbanEdge",   slug: "urbanedge",   isActive: true },
  { name: "ClassicHold", slug: "classichold", isActive: true },
];

// ─── Products (prices in PKR) ─────────────────────────────────────────────────
const productData = [
  // ── TOTE BAGS ────────────────────────────────────────────────────────────────
  {
    name: "Parisian Tote Luxe",
    category: "Tote Bags",
    brand: "Maison Sac",
    price: 45000,
    discount: 10,
    stock: 25,
    soldCount: 45,
    material: "Full-Grain Leather",
    color: "Caramel",
    isFeatured: true,
    isTopPick: true,
    isTopSelling: false,
    description: "A Parisian icon reimagined in buttery full-grain caramel leather. Spacious enough for a full day in the city, with a magnetic snap closure and gold-toned hardware that only gets better with age.",
    images: pickImages("Tote Bags"),
    tags: ["tote", "leather", "luxury", "paris"],
    specifications: [
      { key: "Material",   value: "Full-Grain Italian Leather" },
      { key: "Closure",    value: "Magnetic Snap + Zip Pocket" },
      { key: "Lining",     value: "Suede-feel Microfibre" },
      { key: "Dimensions", value: '15" W × 12" H × 5" D' },
    ],
  },
  {
    name: "Canvas Market Tote",
    category: "Tote Bags",
    brand: "UrbanEdge",
    price: 12500,
    discount: 0,
    stock: 40,
    soldCount: 63,
    material: "Waxed Canvas",
    color: "Tan",
    isFeatured: false,
    isTopPick: false,
    isTopSelling: true,
    description: "The everyday workhorse. Heavy-duty waxed canvas with vegetable-tanned leather handles — develops a gorgeous patina over years of use. Internal laptop sleeve fits up to 15 inches.",
    images: pickImages("Tote Bags"),
    tags: ["tote", "canvas", "everyday", "casual"],
    specifications: [
      { key: "Material",   value: "12 oz Waxed Canvas + Vegetable-Tanned Leather" },
      { key: "Closure",    value: "Open-top + Interior Zip Pocket" },
      { key: "Laptop",     value: "Padded sleeve fits up to 15\"" },
      { key: "Dimensions", value: '16" W × 14" H × 4" D' },
    ],
  },

  // ── SHOULDER BAGS ────────────────────────────────────────────────────────────
  {
    name: "Milano Shoulder Bag",
    category: "Shoulder Bags",
    brand: "LuxeCarry",
    price: 32000,
    discount: 0,
    stock: 18,
    soldCount: 82,
    material: "Italian Leather",
    color: "Black",
    isFeatured: true,
    isTopPick: false,
    isTopSelling: true,
    description: "Sleek and sophisticated, the Milano is crafted from smooth Italian calfskin with a single structured compartment and a hidden back zip. Timeless in black — works from boardroom to dinner.",
    images: pickImages("Shoulder Bags"),
    tags: ["shoulder", "leather", "black", "office"],
    specifications: [
      { key: "Material",   value: "Smooth Italian Calfskin" },
      { key: "Closure",    value: "Zip-top" },
      { key: "Strap",      value: "Adjustable 22\"–44\"" },
      { key: "Dimensions", value: '12" W × 9" H × 3" D' },
    ],
  },
  {
    name: "Sedona Hobo Shoulder",
    category: "Shoulder Bags",
    brand: "ClassicHold",
    price: 24500,
    discount: 12,
    stock: 22,
    soldCount: 37,
    material: "Pebbled Leather",
    color: "Chestnut",
    isFeatured: false,
    isTopPick: true,
    isTopSelling: false,
    description: "A relaxed crescent silhouette in rich pebbled chestnut leather. The hobo drapes naturally over the shoulder with a single zip compartment and two slip pockets inside.",
    images: pickImages("Shoulder Bags"),
    tags: ["shoulder", "hobo", "pebbled", "chestnut"],
    specifications: [
      { key: "Material",   value: "Pebbled Cowhide Leather" },
      { key: "Closure",    value: "Zip-top" },
      { key: "Pockets",    value: "1 zip + 2 slip (interior)" },
      { key: "Strap Drop", value: '10"' },
    ],
  },

  // ── CROSSBODY BAGS ───────────────────────────────────────────────────────────
  {
    name: "Riviera Crossbody",
    category: "Crossbody Bags",
    brand: "UrbanEdge",
    price: 21500,
    discount: 15,
    stock: 30,
    soldCount: 54,
    material: "Pebbled Leather",
    color: "Blush Pink",
    isFeatured: false,
    isTopPick: true,
    isTopSelling: false,
    description: "Light, compact, and endlessly versatile. The Riviera's dusty blush pebbled leather and gold chain strap make it perfect from morning coffee to evening cocktails.",
    images: pickImages("Crossbody Bags"),
    tags: ["crossbody", "blush", "chain", "mini"],
    specifications: [
      { key: "Material",   value: "Pebbled Leather" },
      { key: "Strap",      value: "Gold-tone Chain + Leather (detachable)" },
      { key: "Closure",    value: "Flap with Magnetic Snap" },
      { key: "Dimensions", value: '9" W × 6" H × 2.5" D' },
    ],
  },
  {
    name: "Nomad Mini Crossbody",
    category: "Crossbody Bags",
    brand: "Maison Sac",
    price: 16800,
    discount: 0,
    stock: 35,
    soldCount: 41,
    material: "Smooth Leather",
    color: "Cognac",
    isFeatured: true,
    isTopPick: false,
    isTopSelling: true,
    description: "The Nomad packs phone, cards, and keys into a sleek smooth-leather silhouette with a satisfying turn-lock closure. Available with a long adjustable strap for crossbody or shoulder carry.",
    images: pickImages("Crossbody Bags"),
    tags: ["crossbody", "mini", "cognac", "turnlock"],
    specifications: [
      { key: "Material",   value: "Smooth Nappa Leather" },
      { key: "Closure",    value: "Turn-Lock Flap" },
      { key: "Strap",      value: "Adjustable leather strap" },
      { key: "Dimensions", value: '8" W × 5.5" H × 2" D' },
    ],
  },

  // ── CLUTCH BAGS ──────────────────────────────────────────────────────────────
  {
    name: "Soirée Clutch",
    category: "Clutch Bags",
    brand: "Maison Sac",
    price: 18000,
    discount: 5,
    stock: 20,
    soldCount: 66,
    material: "Satin",
    color: "Champagne",
    isFeatured: true,
    isTopPick: false,
    isTopSelling: true,
    description: "Made for evenings that deserve to be remembered. The Soirée's champagne satin body catches candlelight beautifully, finished with a gold frame clasp and detachable wrist chain.",
    images: pickImages("Clutch Bags"),
    tags: ["clutch", "satin", "evening", "wedding"],
    specifications: [
      { key: "Material",   value: "Duchess Satin + Gold-plate Frame" },
      { key: "Closure",    value: "Hinged Frame Clasp" },
      { key: "Strap",      value: "Detachable wrist chain" },
      { key: "Dimensions", value: '10" W × 5" H' },
    ],
  },
  {
    name: "Velvet Evening Envelope",
    category: "Clutch Bags",
    brand: "LuxeCarry",
    price: 11500,
    discount: 0,
    stock: 28,
    soldCount: 29,
    material: "Velvet",
    color: "Midnight Blue",
    isFeatured: false,
    isTopPick: true,
    isTopSelling: false,
    description: "Envelope clutch in sumptuous midnight blue velvet. The magnetic fold-over closure opens to a satin-lined interior with a built-in card slot. Perfect for black-tie evenings.",
    images: pickImages("Clutch Bags"),
    tags: ["clutch", "velvet", "envelope", "evening"],
    specifications: [
      { key: "Material",   value: "Crushed Velvet + Satin Lining" },
      { key: "Closure",    value: "Magnetic Fold-over" },
      { key: "Card Slots", value: "2 interior" },
      { key: "Dimensions", value: '11" W × 6" H' },
    ],
  },

  // ── BACKPACKS ────────────────────────────────────────────────────────────────
  {
    name: "Urban Explorer Backpack",
    category: "Backpacks",
    brand: "UrbanEdge",
    price: 38000,
    discount: 20,
    stock: 14,
    soldCount: 51,
    material: "Canvas + Leather",
    color: "Olive Green",
    isFeatured: false,
    isTopPick: false,
    isTopSelling: true,
    description: "Built for the city explorer. Water-resistant waxed canvas body with full-grain leather trim — features a padded 16\" laptop compartment, a front organiser pocket, and a hidden back-panel pocket.",
    images: pickImages("Backpacks"),
    tags: ["backpack", "canvas", "travel", "laptop"],
    specifications: [
      { key: "Material",   value: "Waxed Canvas + Full-Grain Leather trim" },
      { key: "Laptop",     value: 'Fits up to 16"' },
      { key: "Pockets",    value: "Main + front organiser + hidden back" },
      { key: "Dimensions", value: '13" W × 18" H × 6" D' },
    ],
  },
  {
    name: "Commuter Slim Backpack",
    category: "Backpacks",
    brand: "Maison Sac",
    price: 27500,
    discount: 0,
    stock: 19,
    soldCount: 38,
    material: "Full-Grain Leather",
    color: "Black",
    isFeatured: true,
    isTopPick: true,
    isTopSelling: false,
    description: "The professional's daily carry. Slim-profile full-grain leather with a padded 15\" laptop sleeve, a trolley pass-through, and a top grab handle. It looks as sharp in a boardroom as it does on a commuter train.",
    images: pickImages("Backpacks"),
    tags: ["backpack", "leather", "commuter", "office"],
    specifications: [
      { key: "Material",    value: "Full-Grain Cowhide Leather" },
      { key: "Laptop",      value: 'Padded sleeve fits up to 15"' },
      { key: "Trolley",     value: "Luggage pass-through on back panel" },
      { key: "Dimensions",  value: '12" W × 16" H × 4" D' },
    ],
  },

  // ── SATCHEL BAGS ─────────────────────────────────────────────────────────────
  {
    name: "Heritage Satchel",
    category: "Satchel Bags",
    brand: "ClassicHold",
    price: 52000,
    discount: 0,
    stock: 8,
    soldCount: 19,
    material: "Veg-Tanned Leather",
    color: "Cognac",
    isFeatured: true,
    isTopPick: true,
    isTopSelling: false,
    description: "Our flagship piece. Hand-stitched in vegetable-tanned leather at a heritage Italian workshop, this satchel deepens in colour and character with every year of use. A true lifetime bag.",
    images: pickImages("Satchel Bags"),
    tags: ["satchel", "heritage", "veg-tanned", "handmade"],
    specifications: [
      { key: "Material",    value: "Vegetable-Tanned Full-Grain Leather" },
      { key: "Construction", value: "Hand-stitched saddle construction" },
      { key: "Laptop",      value: 'Fits 13" laptop' },
      { key: "Dimensions",  value: '14" W × 10" H × 4" D' },
    ],
  },

  // ── BUCKET BAGS ──────────────────────────────────────────────────────────────
  {
    name: "Provence Bucket Bag",
    category: "Bucket Bags",
    brand: "LuxeCarry",
    price: 28500,
    discount: 10,
    stock: 21,
    soldCount: 33,
    material: "Suede",
    color: "Lavender",
    isFeatured: false,
    isTopPick: false,
    isTopSelling: true,
    description: "Soft suede bucket bag in a dreamy lavender hue. The drawstring closure cinches into a satisfying slouch, and the detachable interior pouch keeps essentials organised.",
    images: pickImages("Bucket Bags"),
    tags: ["bucket", "suede", "summer", "lavender"],
    specifications: [
      { key: "Material", value: "Italian Suede" },
      { key: "Closure",  value: "Drawstring + Interior Zip Pouch" },
      { key: "Strap",    value: "Removable Shoulder Strap" },
    ],
  },
  {
    name: "Napa Leather Bucket",
    category: "Bucket Bags",
    brand: "Maison Sac",
    price: 34000,
    discount: 8,
    stock: 16,
    soldCount: 24,
    material: "Napa Leather",
    color: "Camel",
    isFeatured: true,
    isTopPick: false,
    isTopSelling: false,
    description: "Understated luxury in buttery napa leather. The drawstring bucket silhouette is effortlessly cool with a long shoulder strap for hands-free carry.",
    images: pickImages("Bucket Bags"),
    tags: ["bucket", "napa", "luxury", "camel"],
    specifications: [
      { key: "Material",   value: "Napa Calf Leather" },
      { key: "Closure",    value: "Drawstring" },
      { key: "Strap",      value: "Long Shoulder + Short Handle (both included)" },
      { key: "Dimensions", value: '10" W × 12" H' },
    ],
  },

  // ── WALLETS ──────────────────────────────────────────────────────────────────
  {
    name: "Monaco Card Wallet",
    category: "Wallets",
    brand: "Maison Sac",
    price: 8500,
    discount: 0,
    stock: 60,
    soldCount: 71,
    material: "Lambskin",
    color: "Ivory",
    isFeatured: false,
    isTopPick: true,
    isTopSelling: false,
    description: "Slim and sophisticated. This compact card wallet in buttery lambskin holds up to 6 cards with a central cash slip — everything you need, nothing you don't.",
    images: pickImages("Wallets"),
    tags: ["wallet", "slim", "card", "lambskin"],
    specifications: [
      { key: "Material",   value: "Lambskin Leather" },
      { key: "Card Slots", value: "6" },
      { key: "Cash Slip",  value: "1 central compartment" },
    ],
  },
  {
    name: "Classic Bifold Wallet",
    category: "Wallets",
    brand: "ClassicHold",
    price: 6500,
    discount: 0,
    stock: 50,
    soldCount: 93,
    material: "Full-Grain Leather",
    color: "Dark Brown",
    isFeatured: false,
    isTopPick: false,
    isTopSelling: true,
    description: "The wallet that never goes out of style. Full-grain cowhide in rich dark brown with 8 card slots, 2 cash compartments, and an ID window.",
    images: pickImages("Wallets"),
    tags: ["wallet", "bifold", "classic", "mens"],
    specifications: [
      { key: "Material",   value: "Full-Grain Cowhide" },
      { key: "Card Slots", value: "8" },
      { key: "Cash Slots", value: "2 billfold compartments" },
      { key: "ID Window",  value: "Yes" },
    ],
  },
];

// ─── Banners ──────────────────────────────────────────────────────────────────
const banners = [
  {
    title: "New Arrivals",
    subtitle: "Spring/Summer 2025 Collection",
    discountText: "Up to 30% Off",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
    ctaText: "Shop Now",
    ctaLink: "/shop",
    badge: "New",
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Luxury Totes",
    subtitle: "Crafted for the Modern Woman",
    discountText: "Free Shipping on Orders Over Rs. 20,000",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1920&q=80",
    ctaText: "Explore",
    ctaLink: "/shop?category=Tote+Bags",
    isActive: true,
    sortOrder: 2,
  },
  {
    title: "Heritage Collection",
    subtitle: "Pieces Built to Last a Lifetime",
    discountText: "Complimentary Gift Wrap",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1920&q=80",
    ctaText: "Discover",
    ctaLink: "/shop?category=Satchel+Bags",
    badge: "Exclusive",
    isActive: true,
    sortOrder: 3,
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Ayesha Siddiqui",
    role: "Fashion Blogger, Lahore",
    comment: "The quality is absolutely stunning. My Milano Shoulder Bag gets compliments everywhere I go. Worth every rupee!",
    rating: 5,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Sana Mirza",
    role: "Interior Designer, Karachi",
    comment: "I've bought three bags from Maison de Sac now and each one is more beautiful than the last. The leather quality is exceptional.",
    rating: 5,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Hira Baig",
    role: "Marketing Executive, Islamabad",
    comment: "Fast delivery, beautiful packaging, and the bag looked even better in person. The Soirée Clutch was perfect for my friend's wedding!",
    rating: 5,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Zara Khan",
    role: "Architect, Lahore",
    comment: "Finally found a bag brand that combines style with functionality. The Heritage Satchel fits my laptop and still looks elegant at client meetings.",
    rating: 4,
    isActive: true,
    sortOrder: 4,
  },
];

// ─── Settings ─────────────────────────────────────────────────────────────────
const settingsData = [
  // website
  { key: "storeName",           value: "Maison de Sac",                                                                                                         group: "website" },
  { key: "storeTagline",        value: "Luxury Bags & Accessories",                                                                                             group: "website" },
  { key: "footerText",          value: "Crafting premium luxury leather bags, timeless weekenders, compact card cases, and commuter accessories for creative professionals with unparalleled attention to structural detail.", group: "website" },
  { key: "contactEmail",        value: "hello@maisonsac.com",                                                                                                   group: "website" },
  { key: "contactPhone",        value: "+92 300 624 7862",                                                                                                      group: "website" },
  { key: "socialFacebook",      value: "https://facebook.com/maisonsac",                                                                                        group: "website" },
  { key: "socialInstagram",     value: "https://instagram.com/maisonsac",                                                                                       group: "website" },
  { key: "socialLinkedin",      value: "",                                                                                                                       group: "website" },
  { key: "announcementBar",     value: "Free Priority Shipping On Orders Over Rs. 20,000 • Use Code WELCOME15 for 15% Off Your First Order",                    group: "website" },
  { key: "announcementEnabled", value: true,                                                                                                                     group: "website" },
  { key: "currency",            value: "PKR",                                                                                                                    group: "website" },
  { key: "currencySymbol",      value: "Rs.",                                                                                                                    group: "website" },

  // contact
  { key: "email",        value: "hello@maisonsac.com",                                    group: "contact" },
  { key: "phone",        value: "+92 300 624 7862",                                       group: "contact" },
  { key: "address",      value: "24-B Main Boulevard, Gulberg III, Lahore, Punjab 54660", group: "contact" },
  { key: "workingHours", value: "Mon–Sat: 10 AM – 7 PM (PKT)",                           group: "contact" },
  { key: "mapUrl",       value: "",                                                        group: "contact" },

  // appearance
  { key: "primaryColor",    value: "#d97706", group: "appearance" },
  { key: "secondaryColor",  value: "#1c1917", group: "appearance" },
  { key: "accentColor",     value: "#b45309", group: "appearance" },
  { key: "borderRadius",    value: "medium",  group: "appearance" },
  { key: "shadowIntensity", value: "medium",  group: "appearance" },
  { key: "headingFont",     value: "Inter",   group: "appearance" },
  { key: "bodyFont",        value: "Inter",   group: "appearance" },
  { key: "logoMain",        value: "",        group: "appearance" },
  { key: "logoFooter",      value: "",        group: "appearance" },
  { key: "favicon",         value: "",        group: "appearance" },

  // static pages
  {
    key: "about",
    group: "pages",
    value: {
      seoTitle: "About Maison de Sac — Our Story",
      metaDescription: "Learn about Maison de Sac, our commitment to luxury craftsmanship, and the story behind every bag we create.",
      content: "<h2>Our Story</h2><p>Maison de Sac was founded with a singular vision: to create luxury bags that stand the test of time. Each piece is handcrafted by master artisans using only the finest leathers and materials sourced from heritage tanneries across Europe.</p><h2>Our Mission</h2><p>We believe that a truly great bag is more than an accessory — it is a companion for life's most important moments. Our commitment to quality means that every stitch, every clasp, every thread is chosen with intention and care.</p>",
    },
  },
  {
    key: "privacy",
    group: "pages",
    value: {
      seoTitle: "Privacy Policy — Maison de Sac",
      metaDescription: "Understand how Maison de Sac collects, uses, and protects your personal information.",
      content: "<h2>Privacy Policy</h2><p>Last updated: January 2025</p><p>At Maison de Sac, we are committed to protecting your privacy. This policy outlines the information we collect, how we use it, and the choices you have.</p><h3>Information We Collect</h3><p>We collect information you provide directly to us, such as your name, email, and shipping address when you place an order or create an account.</p><h3>How We Use Your Information</h3><p>Your information is used exclusively to process orders, send shipping confirmations, and improve your shopping experience. We never sell your data to third parties.</p>",
    },
  },
  {
    key: "terms",
    group: "pages",
    value: {
      seoTitle: "Terms & Conditions — Maison de Sac",
      metaDescription: "Read the terms and conditions governing your use of Maison de Sac.",
      content: "<h2>Terms & Conditions</h2><p>Last updated: January 2025</p><p>By accessing or using the Maison de Sac website, you agree to be bound by these Terms and Conditions.</p><h3>Orders & Payment</h3><p>All orders are subject to product availability. We accept Cash on Delivery, Card, JazzCash, and EasyPaisa payments.</p><h3>Shipping</h3><p>We offer complimentary shipping on orders over Rs. 20,000. Standard delivery takes 3–5 business days across Pakistan.</p>",
    },
  },
  {
    key: "faqs",
    group: "pages",
    value: {
      seoTitle: "FAQs — Maison de Sac",
      metaDescription: "Frequently asked questions about orders, shipping, returns, and product care at Maison de Sac.",
      content: "<h2>Frequently Asked Questions</h2><h3>What is your return policy?</h3><p>We accept returns within 30 days of delivery. Items must be unused and in original packaging. Please contact our concierge team to initiate a return.</p><h3>How do I care for my leather bag?</h3><p>Use a leather conditioner every 3–6 months. Store in the dust bag provided and avoid prolonged direct sunlight. For suede, use a suede brush to restore texture.</p><h3>Do you deliver across Pakistan?</h3><p>Yes, we deliver nationwide. Standard delivery takes 3–5 business days. Express delivery is available in major cities including Lahore, Karachi, and Islamabad.</p><h3>What payment methods do you accept?</h3><p>We accept Cash on Delivery, Debit/Credit Cards, JazzCash, and EasyPaisa.</p>",
    },
  },
];

// ─── Coupons ──────────────────────────────────────────────────────────────────
const coupons = [
  {
    code: "WELCOME15",
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: 0,
    maxUses: 0,
    isActive: true,
    description: "15% off your first order — no minimum purchase required.",
  },
  {
    code: "SAVE2000",
    discountType: "fixed",
    discountValue: 2000,
    minOrderAmount: 15000,
    maxUses: 200,
    isActive: true,
    description: "Rs. 2,000 off on orders over Rs. 15,000.",
  },
  {
    code: "LUXURY5000",
    discountType: "fixed",
    discountValue: 5000,
    minOrderAmount: 50000,
    maxUses: 50,
    isActive: true,
    description: "Exclusive Rs. 5,000 off on luxury orders over Rs. 50,000.",
  },
  {
    code: "EID20",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 10000,
    maxUses: 100,
    isActive: true,
    description: "Eid special — 20% off on orders over Rs. 10,000.",
  },
];

// ─── Newsletter subscribers ───────────────────────────────────────────────────
const subscribers = [
  { email: "ayesha.khan@example.com",   source: "website",  subscribedAt: daysAgo(90) },
  { email: "sana.mirza@example.com",    source: "website",  subscribedAt: daysAgo(75) },
  { email: "hira.baig@example.com",     source: "checkout", subscribedAt: daysAgo(60) },
  { email: "zara.ahmed@example.com",    source: "website",  subscribedAt: daysAgo(40) },
  { email: "nadia.hussain@example.com", source: "checkout", subscribedAt: daysAgo(20) },
  { email: "faiza.malik@example.com",   source: "website",  subscribedAt: daysAgo(10) },
];

// ─── Seed function ────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      console.error("❌  Seed refused in production environment.");
      process.exit(1);
    }

    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
    });
    console.log("✅  Connected to MongoDB");

    await mongoose.connection.dropDatabase();
    console.log("🗑️   Database dropped — starting fresh\n");

    // ── Users ──────────────────────────────────────────────────────────────────
    const admin = await User.create({
      fullName: "Maison Admin",
      email: "admin@maisonsac.com",
      password: "Admin@123",
      role: "admin",
    });

    const [jane, sarah, nina, alex] = await Promise.all([
      User.create({ fullName: "Ayesha Khan", email: "jane@example.com",  password: "Customer@123", role: "customer" }),
      User.create({ fullName: "Sana Mirza",  email: "sarah@example.com", password: "Customer@123", role: "customer" }),
      User.create({ fullName: "Hira Baig",   email: "nina@example.com",  password: "Customer@123", role: "customer" }),
      User.create({ fullName: "Zara Ahmed",  email: "alex@example.com",  password: "Customer@123", role: "customer" }),
    ]);
    console.log(`👤  Admin:     ${admin.email}  /  Admin@123`);
    console.log(`👤  Customers: jane · sarah · nina · alex  /  Customer@123`);

    // ── Static data ────────────────────────────────────────────────────────────
    await Category.insertMany(categories);
    console.log(`📁  ${categories.length} categories`);

    await Brand.insertMany(brands);
    console.log(`🏷️   ${brands.length} brands`);

    await Banner.insertMany(banners);
    console.log(`🖼️   ${banners.length} banners`);

    await Testimonial.insertMany(testimonials);
    console.log(`💬  ${testimonials.length} testimonials`);

    // ── Products ───────────────────────────────────────────────────────────────
    const insertedProducts = await Product.insertMany(productData);
    const pm = Object.fromEntries(insertedProducts.map((p) => [p.name, p]));
    console.log(`🛍️   ${insertedProducts.length} products (images randomly sampled per category)`);

    // ── Settings ───────────────────────────────────────────────────────────────
    await Setting.insertMany(settingsData);
    console.log(`⚙️   ${settingsData.length} settings`);

    // ── Coupons ────────────────────────────────────────────────────────────────
    await Coupon.insertMany(coupons);
    console.log(`🎟️   ${coupons.length} coupons  (WELCOME15 · SAVE2000 · LUXURY5000 · EID20)`);

    // ── Orders ─────────────────────────────────────────────────────────────────
    const addr = {
      lahore:    (name, email) => ({ fullName: name, email, phone: "+92 300 111 2233", street: "24-B Model Town Link Road", city: "Lahore",    state: "Punjab", postalCode: "54000", country: "Pakistan" }),
      karachi:   (name, email) => ({ fullName: name, email, phone: "+92 321 444 5566", street: "Plot 15, Clifton Block 5",   city: "Karachi",   state: "Sindh",  postalCode: "75600", country: "Pakistan" }),
      islamabad: (name, email) => ({ fullName: name, email, phone: "+92 335 777 8899", street: "House 12, F-7/1",           city: "Islamabad",  state: "ICT",    postalCode: "44000", country: "Pakistan" }),
      rawalpindi:(name, email) => ({ fullName: name, email, phone: "+92 300 111 2233", street: "5-A Satellite Town",        city: "Rawalpindi", state: "Punjab", postalCode: "46000", country: "Pakistan" }),
    };

    const mkItem = (p, qty = 1) => {
      const discountedPrice = Math.round(p.price * (1 - (p.discount || 0) / 100));
      return { product: p._id, name: p.name, image: p.images?.[0] || "", price: discountedPrice, quantity: qty, discount: p.discount || 0 };
    };

    const mkTotals = (items, couponDiscount = 0) => {
      const subtotal    = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0));
      const shippingFee = subtotal >= 20000 ? 0 : 450;
      const tax         = Math.round((subtotal - couponDiscount) * 0.17);
      const total       = Math.round(subtotal + shippingFee + tax - couponDiscount);
      return { subtotal, shippingFee, tax, couponDiscount, total };
    };

    const mkTracking = (statuses) =>
      statuses.map((s) => ({ status: s, title: s, description: "", timestamp: new Date(), isCompleted: true }));

    const o1  = [mkItem(pm["Parisian Tote Luxe"])];
    const o2  = [mkItem(pm["Milano Shoulder Bag"])];
    const o3  = [mkItem(pm["Heritage Satchel"])];
    const o4  = [mkItem(pm["Urban Explorer Backpack"])];
    const o5  = [mkItem(pm["Riviera Crossbody"])];
    const o6  = [mkItem(pm["Soirée Clutch"]), mkItem(pm["Monaco Card Wallet"])];
    const o7  = [mkItem(pm["Provence Bucket Bag"])];
    const o8  = [mkItem(pm["Milano Shoulder Bag"])];
    const o9  = [mkItem(pm["Parisian Tote Luxe"])];
    const o10 = [mkItem(pm["Monaco Card Wallet"]), mkItem(pm["Riviera Crossbody"])];
    const o11 = [mkItem(pm["Commuter Slim Backpack"])];
    const o12 = [mkItem(pm["Nomad Mini Crossbody"]), mkItem(pm["Classic Bifold Wallet"])];

    const orders = [
      { orderNumber: "MDS-000001", user: jane._id,  orderStatus: "Delivered",        paymentStatus: "Paid",     paymentMethod: "Cash On Delivery", items: o1,  shippingAddress: addr.lahore("Ayesha Khan",  "jane@example.com"),  ...mkTotals(o1),  trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped","Delivered"]),    statusHistory: [{ status: "Delivered",        changedAt: daysAgo(148) }], deliveredAt: daysAgo(148), createdAt: daysAgo(155), updatedAt: daysAgo(148) },
      { orderNumber: "MDS-000002", user: sarah._id, orderStatus: "Delivered",        paymentStatus: "Paid",     paymentMethod: "Card",              items: o2,  shippingAddress: addr.karachi("Sana Mirza",   "sarah@example.com"), ...mkTotals(o2),  trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped","Delivered"]),    statusHistory: [{ status: "Delivered",        changedAt: daysAgo(138) }], deliveredAt: daysAgo(138), createdAt: daysAgo(147), updatedAt: daysAgo(138) },
      { orderNumber: "MDS-000003", user: jane._id,  orderStatus: "Delivered",        paymentStatus: "Paid",     paymentMethod: "JazzCash",          items: o3,  shippingAddress: addr.islamabad("Ayesha Khan", "jane@example.com"),  ...mkTotals(o3),  trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped","Delivered"]),    statusHistory: [{ status: "Delivered",        changedAt: daysAgo(105) }], deliveredAt: daysAgo(105), createdAt: daysAgo(112), updatedAt: daysAgo(105) },
      { orderNumber: "MDS-000004", user: nina._id,  orderStatus: "Delivered",        paymentStatus: "Paid",     paymentMethod: "EasyPaisa",         items: o4,  shippingAddress: addr.rawalpindi("Hira Baig",  "nina@example.com"),  ...mkTotals(o4),  trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped","Delivered"]),    statusHistory: [{ status: "Delivered",        changedAt: daysAgo(93)  }], deliveredAt: daysAgo(93),  createdAt: daysAgo(101), updatedAt: daysAgo(93)  },
      { orderNumber: "MDS-000005", user: alex._id,  orderStatus: "Cancelled",        paymentStatus: "Refunded", paymentMethod: "Card",              items: o5,  shippingAddress: addr.lahore("Zara Ahmed",    "alex@example.com"),  ...mkTotals(o5),  trackingSteps: [],                                                                                 statusHistory: [{ status: "Cancelled",        changedAt: daysAgo(82)  }], cancelledAt:  daysAgo(82),  createdAt: daysAgo(85),  updatedAt: daysAgo(82)  },
      { orderNumber: "MDS-000006", user: sarah._id, orderStatus: "Delivered",        paymentStatus: "Paid",     paymentMethod: "Cash On Delivery", items: o6,  shippingAddress: addr.karachi("Sana Mirza",   "sarah@example.com"), ...mkTotals(o6),  trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped","Delivered"]),    statusHistory: [{ status: "Delivered",        changedAt: daysAgo(60)  }], deliveredAt: daysAgo(60),  createdAt: daysAgo(68),  updatedAt: daysAgo(60)  },
      { orderNumber: "MDS-000007", user: jane._id,  orderStatus: "Delivered",        paymentStatus: "Paid",     paymentMethod: "JazzCash",          items: o7,  shippingAddress: addr.lahore("Ayesha Khan",  "jane@example.com"),  ...mkTotals(o7),  trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped","Delivered"]),    statusHistory: [{ status: "Delivered",        changedAt: daysAgo(45)  }], deliveredAt: daysAgo(45),  createdAt: daysAgo(54),  updatedAt: daysAgo(45)  },
      { orderNumber: "MDS-000008", user: nina._id,  orderStatus: "Shipped",          paymentStatus: "Paid",     paymentMethod: "Card",              items: o8,  shippingAddress: addr.rawalpindi("Hira Baig",  "nina@example.com"),  ...mkTotals(o8),  trackingNumber: "MSAC-847291", trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped"]),             statusHistory: [{ status: "Shipped",          changedAt: daysAgo(25)  }], estimatedDelivery: new Date(Date.now() + 2*86400000), createdAt: daysAgo(29), updatedAt: daysAgo(25) },
      { orderNumber: "MDS-000009", user: alex._id,  orderStatus: "Processing",       paymentStatus: "Paid",     paymentMethod: "EasyPaisa",         items: o9,  shippingAddress: addr.islamabad("Zara Ahmed",  "alex@example.com"),  ...mkTotals(o9),  trackingSteps: mkTracking(["Pending","Confirmed","Processing"]),                                   statusHistory: [{ status: "Processing",       changedAt: daysAgo(13)  }], estimatedDelivery: new Date(Date.now() + 4*86400000), createdAt: daysAgo(15), updatedAt: daysAgo(13) },
      { orderNumber: "MDS-000010", user: jane._id,  orderStatus: "Pending",          paymentStatus: "Pending",  paymentMethod: "Cash On Delivery", items: o10, shippingAddress: addr.lahore("Ayesha Khan",  "jane@example.com"),  ...mkTotals(o10), trackingSteps: mkTracking(["Pending"]),                                                            statusHistory: [{ status: "Pending",          changedAt: daysAgo(3)   }], createdAt: daysAgo(3),  updatedAt: daysAgo(3)  },
      { orderNumber: "MDS-000011", user: sarah._id, orderStatus: "Delivered",        paymentStatus: "Paid",     paymentMethod: "Card",              items: o11, shippingAddress: addr.karachi("Sana Mirza",   "sarah@example.com"), ...mkTotals(o11), trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped","Delivered"]),    statusHistory: [{ status: "Delivered",        changedAt: daysAgo(20)  }], deliveredAt: daysAgo(20),  createdAt: daysAgo(28), updatedAt: daysAgo(20)  },
      { orderNumber: "MDS-000012", user: nina._id,  orderStatus: "Out For Delivery", paymentStatus: "Paid",     paymentMethod: "JazzCash",          items: o12, shippingAddress: addr.rawalpindi("Hira Baig",  "nina@example.com"),  ...mkTotals(o12), trackingNumber: "MSAC-629183", trackingSteps: mkTracking(["Pending","Confirmed","Processing","Packed","Shipped","Out For Delivery"]), statusHistory: [{ status: "Out For Delivery", changedAt: daysAgo(1)   }], estimatedDelivery: new Date(Date.now() + 1*86400000), createdAt: daysAgo(7),  updatedAt: daysAgo(1)  },
    ];

    await Order.collection.insertMany(orders);
    console.log(`📦  ${orders.length} orders  (5 months of analytics data)`);

    // ── Reviews ────────────────────────────────────────────────────────────────
    const reviews = [
      { product: pm["Parisian Tote Luxe"]._id,       user: jane._id,  name: "Ayesha Khan", rating: 5, comment: "Absolutely stunning bag! The leather quality is exceptional and it holds everything I need for a full day of work and errands.", isApproved: true },
      { product: pm["Parisian Tote Luxe"]._id,       user: sarah._id, name: "Sana Mirza",  rating: 4, comment: "Beautiful craftsmanship and the caramel color is exactly as shown. Slightly heavier than expected but the look is worth it.", isApproved: true },
      { product: pm["Canvas Market Tote"]._id,       user: alex._id,  name: "Zara Ahmed",  rating: 5, comment: "Perfect everyday tote! The waxed canvas is incredibly durable and the leather handles have aged beautifully.", isApproved: true },
      { product: pm["Canvas Market Tote"]._id,       user: nina._id,  name: "Hira Baig",   rating: 4, comment: "Great quality for the price. Very roomy and the tan color goes with everything. Highly recommend.", isApproved: true },
      { product: pm["Milano Shoulder Bag"]._id,      user: nina._id,  name: "Hira Baig",   rating: 5, comment: "My go-to everyday bag. The black leather is incredibly rich and the adjustable strap is a thoughtful touch.", isApproved: true },
      { product: pm["Milano Shoulder Bag"]._id,      user: alex._id,  name: "Zara Ahmed",  rating: 5, comment: "Gifted this to my sister and she hasn't put it down since. The silver zip is smooth and the interior pockets are perfectly placed.", isApproved: true },
      { product: pm["Riviera Crossbody"]._id,        user: jane._id,  name: "Ayesha Khan", rating: 4, comment: "Such a fun and versatile bag! The blush pink is softer in person — almost a dusty rose — which I love even more.", isApproved: true },
      { product: pm["Riviera Crossbody"]._id,        user: nina._id,  name: "Hira Baig",   rating: 3, comment: "Decent quality for the price. The chain feels a little lightweight compared to the rest of the bag but the style is spot on.", isApproved: true },
      { product: pm["Nomad Mini Crossbody"]._id,     user: sarah._id, name: "Sana Mirza",  rating: 5, comment: "Perfect size for evenings out. Fits phone, cards, and keys without any bulk. The cognac leather is gorgeous.", isApproved: true },
      { product: pm["Nomad Mini Crossbody"]._id,     user: alex._id,  name: "Zara Ahmed",  rating: 5, comment: "Love this tiny bag! The turn-lock closure is so satisfying and the leather quality is premium.", isApproved: true },
      { product: pm["Soirée Clutch"]._id,            user: sarah._id, name: "Sana Mirza",  rating: 5, comment: "Used this at a wedding and received so many compliments. The champagne satin catches the light beautifully. Perfection.", isApproved: true },
      { product: pm["Soirée Clutch"]._id,            user: jane._id,  name: "Ayesha Khan", rating: 5, comment: "The frame clasp is so satisfying and the detachable chain is a brilliant design choice. Absolute luxury.", isApproved: true },
      { product: pm["Urban Explorer Backpack"]._id,  user: alex._id,  name: "Zara Ahmed",  rating: 5, comment: "Best travel backpack I've ever owned. Flew three times this month with it. Holds 15-inch laptop, cables, and gym clothes easily.", isApproved: true },
      { product: pm["Urban Explorer Backpack"]._id,  user: sarah._id, name: "Sana Mirza",  rating: 4, comment: "Love the canvas and leather combination. Mine got caught in the rain and the water-resistant claim held up.", isApproved: true },
      { product: pm["Commuter Slim Backpack"]._id,   user: jane._id,  name: "Ayesha Khan", rating: 5, comment: "Perfect office backpack. Sleek, professional, and fits everything. The leather quality is exceptional.", isApproved: true },
      { product: pm["Commuter Slim Backpack"]._id,   user: nina._id,  name: "Hira Baig",   rating: 4, comment: "Very well made. A bit pricey but worth every rupee. Looks fantastic at client meetings.", isApproved: true },
      { product: pm["Heritage Satchel"]._id,         user: jane._id,  name: "Ayesha Khan", rating: 4, comment: "This bag is a masterpiece. Already developing a beautiful patina after three months of daily use. An heirloom in the making.", isApproved: true },
      { product: pm["Heritage Satchel"]._id,         user: nina._id,  name: "Hira Baig",   rating: 5, comment: "The vegetable-tanned leather is unlike anything I've owned. The cognac color deepens week after week. Genuinely irreplaceable.", isApproved: true },
      { product: pm["Provence Bucket Bag"]._id,      user: sarah._id, name: "Sana Mirza",  rating: 4, comment: "The lavender suede is dreamy. Perfect for summer outfits. The detachable interior pouch is very practical.", isApproved: true },
      { product: pm["Provence Bucket Bag"]._id,      user: alex._id,  name: "Zara Ahmed",  rating: 4, comment: "Bought for a gift and it was a hit. Suede quality is impressive and the drawstring has a satisfying weight.", isApproved: true },
      { product: pm["Monaco Card Wallet"]._id,       user: nina._id,  name: "Hira Baig",   rating: 5, comment: "Switched from a bulky wallet and never looked back. Six cards, some cash, fits in every pocket. The ivory lambskin is divine.", isApproved: true },
      { product: pm["Monaco Card Wallet"]._id,       user: jane._id,  name: "Ayesha Khan", rating: 5, comment: "Slim, elegant, and built to last. Already gifted two of these to friends. Exceptional quality.", isApproved: true },
      { product: pm["Classic Bifold Wallet"]._id,    user: alex._id,  name: "Zara Ahmed",  rating: 5, comment: "Bought this for my husband and he absolutely loves it. The leather quality is top-notch and it looks great.", isApproved: true },
      { product: pm["Classic Bifold Wallet"]._id,    user: sarah._id, name: "Sana Mirza",  rating: 4, comment: "Classic design, great quality leather. The 8 card slots are very practical. Highly recommend.", isApproved: true },
    ];

    await Review.insertMany(reviews);

    // Recalculate product ratings from seeded reviews
    const ratingStats = await Review.aggregate([
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, numReviews: { $sum: 1 } } },
    ]);
    await Promise.all(
      ratingStats.map((r) =>
        Product.findByIdAndUpdate(r._id, {
          rating:     Math.round(r.avgRating * 10) / 10,
          numReviews: r.numReviews,
        })
      )
    );
    console.log(`⭐  ${reviews.length} reviews  (ratings recalculated)`);

    // ── Newsletter ─────────────────────────────────────────────────────────────
    await Newsletter.insertMany(subscribers);
    console.log(`📧  ${subscribers.length} newsletter subscribers`);

    // ── Summary ────────────────────────────────────────────────────────────────
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅  Database seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Admin:     admin@maisonsac.com   /  Admin@123");
    console.log("  Customer:  jane@example.com      /  Customer@123  (Ayesha Khan)");
    console.log("  Customer:  sarah@example.com     /  Customer@123  (Sana Mirza)");
    console.log("  Customer:  nina@example.com      /  Customer@123  (Hira Baig)");
    console.log("  Customer:  alex@example.com      /  Customer@123  (Zara Ahmed)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Coupons:   WELCOME15 · SAVE2000 · LUXURY5000 · EID20");
    console.log("  Currency:  PKR (Rs.)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (err) {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
