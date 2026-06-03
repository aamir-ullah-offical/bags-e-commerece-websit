import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Heart,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Compass,
  Star,
  Layers,
  FileSpreadsheet,
  MessageSquareCode,
} from "lucide-react";

import { productService } from "../utils/productService";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Breadcrumb from "../components/Breadcrumb";
import Rating from "../components/Rating";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const product = productService.getProductById(Number(id));
  const relatedProducts = product ? productService.getRelatedProducts(product, 4) : [];

  // Configuration States
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "spec" | "reviews">("desc");

  // Hover image zoom magnifier state coordinates
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZooming, setIsZooming] = useState(false);

  // Sync state variables once product loads
  useEffect(() => {
    if (product) {
      setActiveImgIdx(0);
      setSelectedColor(product.color);
      setQuantity(1);
      setActiveTab("desc");
      window.scrollTo(0, 0); // Scroll page to top
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h1 className="font-sans font-black text-2xl text-stone-950">Luxury Piece Not Located</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          The requested handbag or accessory ID could not be identified inside our current registry vaults. Return to catalog.
        </p>
        <Link
          to="/shop"
          className="bg-stone-900 hover:bg-stone-850 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md"
        >
          Return to Boutique Catalog
        </Link>
      </div>
    );
  }

  const discountPrice = product.price * (1 - product.discount / 100);
  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  // Hover zoom lens coordinates tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.85)",
    });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({ transform: "scale(1)", transformOrigin: "center" });
  };

  // Cart operations
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor);
    showToast(`Added ${quantity}x "${product.name}" in ${selectedColor} to cart.`, "bag");
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor);
    navigate("/cart");
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    if (!isSaved) {
      showToast(`Saved "${product.name}" to wishlist.`, "heart");
    } else {
      showToast(`Removed "${product.name}" from wishlist.`, "info");
    }
  };

  return (
    <div id="product-details-page" className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 text-stone-900 dark:text-stone-100 transition-colors">
      <Breadcrumb
        items={[
          { label: "Shop", url: "/shop" },
          { label: product.category, url: `/shop?category=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-150 dark:border-stone-800 shadow-xs">
          
          {/* LEFT CONTAINER: GALLERIES AND THUMBNAILS (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Main Stage Frame with Magnifier Zoom */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={product.images[activeImgIdx]}
                alt={product.name}
                referrerPolicy="no-referrer"
                style={zoomStyle}
                className="w-full h-full object-cover object-center transition-transform duration-100 ease-out"
              />

              {/* Status Badge floating inside zoom container */}
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-amber-500 text-stone-950 font-bold font-mono text-[10px] px-3 py-1 rounded-full uppercase shadow-md leading-none">
                  Promo {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Alternates thumbnail row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 bg-stone-50 ${
                      activeImgIdx === idx ? "border-amber-500 shadow-sm" : "border-stone-100 grayscale hover:grayscale-0"
                    } transition-all`}
                  >
                    <img
                      src={img}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT CONTAINER: CORE SPECIFICATIONS DETAILS (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* BRAND ROW */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase">
                  {product.brand} Collection
                </span>
                {product.isTopSelling && (
                  <span className="bg-lime-150 bg-lime-100 text-lime-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Bestseller
                  </span>
                )}
              </div>

              {/* TITLE */}
              <h1 className="font-sans font-black text-2xl sm:text-3.5xl text-stone-900 tracking-tight leading-tight mb-2">
                {product.name}
              </h1>

              {/* STARS / COMMENTS ROW */}
              <div className="flex items-center gap-4 mb-5">
                <Rating value={product.rating} max={5} showText={true} size={15} />
                <span className="text-stone-300">|</span>
                <span className="text-xs text-stone-500 underline underline-offset-2 font-mono">
                  {product.reviews.length} Verified Buyer Reviews
                </span>
              </div>

              {/* PRICE */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-black text-stone-900 font-mono">
                  ${discountPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="text-base text-stone-400 line-through font-mono">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* GENERAL BLURB SUMMARY */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6 font-serif">
                {product.description}
              </p>

              {/* HIGHLIGHT VALUES STRIP */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-stone-100 mb-6 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-amber-500" />
                  <span>Certified Ethical Leather</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-amber-500" />
                  <span>30-Day Replacement Promise</span>
                </div>
              </div>

              {/* CONFIG LEVEL: COLOR SELECT */}
              {product.color && (
                <div className="mb-4">
                  <span className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase block mb-2">
                    Maison Colorway: <span className="text-stone-900 font-bold text-xs">{selectedColor}</span>
                  </span>
                  <div className="flex gap-2">
                    {[product.color, "Tan", "Black", "Burgundy"].map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`px-3 py-1.5 border font-semibold rounded-lg text-xs tracking-wide cursor-pointer transition-all ${
                          selectedColor === clr
                            ? "border-stone-950 bg-stone-950 text-white shadow-sm"
                            : "border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-950"
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CONFIG LEVEL: STOCK INDICATOR */}
              <div className="mb-6 flex items-center gap-2 text-xs">
                <span className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase">
                  Vault Stock:
                </span>
                {isOutOfStock ? (
                  <span className="text-rose-500 bg-rose-50 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    Out of Stock - Backorder Avail
                  </span>
                ) : (
                  <span className="text-emerald-600 bg-emerald-50 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    Available - {product.stock} Units in Reserve
                  </span>
                )}
              </div>
            </div>

            {/* ACTION TRIGGERS AREA */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
              {/* Counter controller */}
              {!isOutOfStock && (
                <div className="flex items-center border border-stone-200 rounded-xl px-2 bg-stone-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-stone-500 hover:text-stone-900 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 text-stone-500 hover:text-stone-900 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Action: Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs transition-all ${
                  isOutOfStock
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                    : "bg-stone-950 hover:bg-stone-850 text-white"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400 animate-pulse" />
                Add to Shopping Bag
              </button>

              {/* Action: Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  isOutOfStock
                    ? "hidden"
                    : "bg-amber-500 text-stone-950 hover:bg-amber-600 shadow-md"
                }`}
              >
                Buy Now
              </button>

              {/* Action: Saved */}
              <button
                onClick={handleWishlistToggle}
                className={`p-4 rounded-xl border flex items-center justify-center transition-all ${
                  isSaved
                    ? "bg-rose-500 border-rose-50 text-white"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-100"
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isSaved ? "fill-white" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS DESCRIPTION TABS SPECIFICATIONS PANEL */}
        <section className="mt-12 bg-white dark:bg-stone-900 rounded-3xl border border-stone-150 dark:border-stone-800 p-6 sm:p-10 shadow-xs" id="product-panels">
          {/* Tabs row selectors */}
          <div className="flex border-b border-stone-200 gap-4 mb-8">
            <button
              onClick={() => setActiveTab("desc")}
              className={`pb-3 font-semibold text-xs tracking-widest uppercase border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === "desc"
                  ? "border-amber-500 text-stone-900 dark:text-white"
                  : "border-transparent text-stone-400 dark:text-stone-550 hover:text-stone-700 dark:hover:text-stone-300"
              }`}
            >
              <Compass className="w-4 h-4" /> Description
            </button>
            <button
              onClick={() => setActiveTab("spec")}
              className={`pb-3 font-semibold text-xs tracking-widest uppercase border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === "spec"
                  ? "border-amber-500 text-stone-900 dark:text-white"
                  : "border-transparent text-stone-400 dark:text-stone-550 hover:text-stone-700 dark:hover:text-stone-300"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 font-semibold text-xs tracking-widest uppercase border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === "reviews"
                  ? "border-amber-500 text-stone-900 dark:text-white"
                  : "border-transparent text-stone-400 dark:text-stone-550 hover:text-stone-700 dark:hover:text-stone-300"
              }`}
            >
              <MessageSquareCode className="w-4 h-4" /> Reviews ({product.reviews.length})
            </button>
          </div>

          {/* Dynamic Tab Body rendering panel */}
          <div className="min-h-[12rem]">
            <AnimatePresence mode="wait">
              {activeTab === "desc" && (
                <motion.div
                  key="desc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 max-w-3xl"
                >
                  <h3 className="font-sans font-bold text-stone-900 text-base">Handcrafted Leather Artistry</h3>
                  <p className="text-xs sm:text-sm text-stone-605 text-stone-600 leading-relaxed font-serif">
                    Maison de Sac items represent decades of dedication to sustainable style. Every cut is measured specifically to highlight the leather's unique hide wrinkles and grains. High stress joints are triple lock-stitched using custom heavy-duty nylon threads.
                  </p>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-serif">
                    Inside, you will find fully-sewn protective pockets and custom velvet bindings designed to shelter devices from scratches, coupled with convenient organizational slots for keys, wallets, pens, and travel notes.
                  </p>
                </motion.div>
              )}

              {activeTab === "spec" && (
                <motion.div
                  key="spec"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl bg-stone-50 dark:bg-stone-955 rounded-2xl border border-stone-105 dark:border-stone-850 p-6"
                >
                  <table className="w-full text-xs text-stone-650 dark:text-stone-300">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <tr key={key} className="border-b border-stone-200/50 dark:border-stone-800/60 last:border-none">
                          <td className="py-2.5 font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{key}</td>
                          <td className="py-2.5 text-stone-900 dark:text-stone-100 font-semibold text-right">{val}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-stone-200/50 dark:border-stone-800/60">
                        <td className="py-2.5 font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Primary Colorway</td>
                        <td className="py-2.5 text-stone-900 dark:text-stone-100 font-semibold text-right">{product.color}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Main Shell Fiber</td>
                        <td className="py-2.5 text-stone-900 dark:text-stone-100 font-semibold text-right">{product.material}</td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-6 pb-6 border-b border-stone-100 dark:border-stone-850 flex-col sm:flex-row">
                    <div className="text-center p-6 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-850 shrink-0">
                      <span className="text-4xl font-extrabold text-stone-900 dark:text-white block font-mono">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-stone-300 dark:text-stone-700 font-bold">/</span> <span className="text-sm text-stone-400 dark:text-stone-500 font-semibold font-mono">5.0</span>
                      <div className="mt-2 text-center">
                        <Rating value={product.rating} max={5} size={14} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-105 mb-1">Authentic Buyer Reviews Only</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-md">
                        Every single review displayed below represents an audited transaction. Customers who successfully checkout on Maison de Sac are invited to rate stitch alignment, leather weight, and carrier speed.
                      </p>
                    </div>
                  </div>

                  {product.reviews.length > 0 ? (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {product.reviews.map((rev, idx) => (
                        <div key={idx} className="py-5 first:pt-0 last:pb-0">
                          <div className="flex justify-between items-baseline mb-2">
                            <h4 className="font-sans font-bold text-xs text-stone-900 dark:text-stone-200">{rev.name}</h4>
                            <span className="text-xxs font-mono text-stone-400 dark:text-stone-500">{rev.date}</span>
                          </div>
                          <div className="mb-2">
                            <Rating value={rev.rating} size={11} />
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif max-w-2xl italic">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-stone-400 dark:text-stone-500 text-xs font-medium">
                      No ratings recorded for this new arrival capsule release yet. Purchase items to share feedback!
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <section className="mt-20" id="related-products">
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">
                  Coordinate Sets
                </span>
                <h2 className="font-sans font-extrabold text-2xl text-stone-900 tracking-tight mt-1">
                  Related Collections
                </h2>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-bold tracking-widest uppercase text-stone-500 hover:text-stone-950 transition-colors"
              >
                Browse category
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
