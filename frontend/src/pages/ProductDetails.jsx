import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag, Heart, ShieldCheck, CheckCircle, AlertTriangle,
  RotateCcw, Compass, FileSpreadsheet, MessageSquareCode,
  Star, Minus, Plus, ArrowLeft, Truck, Package, Share2, ZoomIn,
} from "lucide-react";

import { productService } from "../services/productService";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import Breadcrumb from "../components/Breadcrumb";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";
import { formatPKR, calcSalePrice } from "../utils/currency";

/* ── Skeleton ── */
function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-100 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-sm">
          {/* Image area */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="skeleton aspect-square rounded-2xl skeleton-img" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton w-18 h-18 rounded-xl flex-shrink-0" />)}
            </div>
          </div>
          {/* Info area */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="skeleton skeleton-text w-24 rounded" />
            <div className="skeleton h-8 w-3/4 rounded-lg" />
            <div className="skeleton h-6 w-1/2 rounded-lg" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton w-4 h-4 rounded-sm" />)}
            </div>
            <div className="skeleton h-10 w-1/3 rounded-xl" />
            <div className="skeleton h-24 w-full rounded-xl" />
            <div className="flex gap-3 mt-4">
              <div className="skeleton h-14 w-28 rounded-xl" />
              <div className="skeleton flex-1 h-14 rounded-xl" />
              <div className="skeleton h-14 w-14 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Star row ── */
function StarRow({ value, size = 14, count }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < Math.round(value) ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"}
        />
      ))}
      {count !== undefined && (
        <span className="text-xs text-stone-400 font-mono ml-1.5">({count})</span>
      )}
    </div>
  );
}

export default function ProductDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addToCart }              = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast }              = useToast();
  const { settings }               = useSettings();

  const [product,         setProduct]         = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading,         setLoading]         = useState(true);

  const [activeImgIdx,  setActiveImgIdx]  = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity,      setQuantity]      = useState(1);
  const [activeTab,     setActiveTab]     = useState("desc");

  const [isZooming,  setIsZooming]  = useState(false);
  const [zoomStyle,  setZoomStyle]  = useState({});
  const [addedPop,   setAddedPop]   = useState(false);
  const [heartPop,   setHeartPop]   = useState(false);

  const imageRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const prod = await productService.getProductById(id);
      setProduct(prod);
      if (prod) {
        const related = await productService.getRelatedProducts(prod, 4);
        setRelatedProducts(related);
        setActiveImgIdx(0);
        setSelectedColor(prod.color);
        setQuantity(1);
        setActiveTab("desc");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <DetailsSkeleton />;

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center flex flex-col items-center gap-5">
        <div className="p-5 bg-rose-50 rounded-full">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="font-black text-2xl text-stone-950">Luxury Piece Not Found</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          This handcrafted accessory could not be located in our registry. Return to the catalog.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Boutique
        </Link>
      </div>
    );
  }

  const salePrice    = calcSalePrice(product.price, product.discount || 0);
  const savings      = Math.round(product.price - salePrice);
  const isSaved      = isInWishlist(product._id || product.id);
  const isOOS        = product.stock <= 0;
  const isLowStock   = !isOOS && product.stock <= 3;
  const images       = product.images ?? [];

  /* ── Image zoom on desktop ── */
  const handleMouseMove = e => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2)" });
  };

  /* ── Cart + wishlist ── */
  const handleAddToCart = () => {
    if (isOOS) return;
    addToCart(product, quantity, selectedColor);
    showToast(`Added ${quantity}× "${product.name}" to cart.`, "bag");
    setAddedPop(true);
    setTimeout(() => setAddedPop(false), 1200);
  };

  const handleBuyNow = () => {
    if (isOOS) return;
    addToCart(product, quantity, selectedColor);
    navigate("/checkout");
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 600);
    showToast(
      isSaved ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`,
      isSaved ? "info" : "heart"
    );
  };

  const TABS = [
    { id: "desc",    icon: Compass,           label: "Description" },
    { id: "spec",    icon: FileSpreadsheet,   label: "Specifications" },
    { id: "reviews", icon: MessageSquareCode, label: `Reviews (${product.reviews?.length ?? 0})` },
  ];

  return (
    <div id="product-details-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900">
      <Breadcrumb
        items={[
          { label: "Shop",           url: "/shop" },
          { label: product.category, url: `/shop?category=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* ── MAIN PRODUCT CARD ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* LEFT: Gallery */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Main image */}
            <div
              ref={imageRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => { setIsZooming(false); setZoomStyle({}); }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 cursor-zoom-in select-none"
            >
              {images[activeImgIdx] ? (
                <img
                  src={images[activeImgIdx]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  style={isZooming ? zoomStyle : {}}
                  className="w-full h-full object-cover object-center transition-transform duration-75 ease-out"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-100">
                  <ShoppingBag className="w-16 h-16 text-stone-300" />
                </div>
              )}

              {/* Discount badge */}
              {(product.discount ?? 0) > 0 && (
                <span className="absolute top-4 left-4 badge badge-discount shadow-md">
                  −{product.discount}% OFF
                </span>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 hidden md:flex items-center gap-1 px-2 py-1 rounded-lg glass text-stone-500 text-[10px] font-mono opacity-0 group-hover:opacity-100 pointer-events-none">
                <ZoomIn className="w-3 h-3" /> Hover to zoom
              </div>

              {/* Image nav arrows (mobile) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImgIdx(p => (p === 0 ? images.length - 1 : p - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 sm:hidden p-1.5 rounded-full bg-white/80 text-stone-700 shadow border border-stone-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImgIdx(p => (p + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 sm:hidden p-1.5 rounded-full bg-white/80 text-stone-700 shadow border border-stone-100"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      activeImgIdx === idx
                        ? "border-amber-500 shadow-[0_0_0_3px_rgba(217,119,6,0.15)] scale-105"
                        : "border-stone-100 grayscale hover:grayscale-0 hover:border-stone-300"
                    }`}
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

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { icon: ShieldCheck, label: "Secure Payment" },
                { icon: Truck,       label: "Express Delivery" },
                { icon: RotateCcw,   label: "30-Day Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <Icon className="w-4 h-4 text-amber-500" />
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wide leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Brand + badges row */}
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="text-[10px] font-extrabold tracking-[0.14em] text-stone-400 uppercase">
                {product.brand}
              </span>
              {product.isTopSelling && (
                <span className="badge badge-bestseller">Bestseller</span>
              )}
              {product.isNew && (
                <span className="badge badge-new">New Arrival</span>
              )}
              {isLowStock && (
                <span className="badge badge-lowstock">Only {product.stock} left</span>
              )}
            </div>

            {/* Product name */}
            <h1 className="font-sans font-black text-2xl sm:text-3xl text-stone-950 tracking-tight leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-5">
              <StarRow value={product.rating ?? 0} size={15} count={product.reviews?.length ?? 0} />
              <button
                onClick={() => setActiveTab("reviews")}
                className="text-xs text-stone-400 underline underline-offset-2 hover:text-amber-600 transition-colors font-mono"
              >
                View reviews
              </button>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-stone-100">
              <span className="text-3xl font-black text-stone-950 font-mono">{formatPKR(salePrice)}</span>
              {(product.discount ?? 0) > 0 && (
                <>
                  <span className="text-base text-stone-400 line-through font-mono">{formatPKR(product.price)}</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-mono">
                    Save {formatPKR(savings)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-stone-600 leading-relaxed mb-6 font-serif">
              {product.description}
            </p>

            {/* Trust checklist */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                "Certified Ethical Leather",
                "30-Day Replacement Promise",
                "Eco-Certified Hardware",
                "Artisan Hand-Stitched",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Color selector */}
            {product.color && (
              <div className="mb-5">
                <span className="text-[10px] font-extrabold tracking-[0.12em] text-stone-400 uppercase block mb-2">
                  Colorway:{" "}
                  <span className="text-stone-800 font-bold">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {[product.color]
                    .filter(Boolean)
                    .map(clr => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`px-4 py-2 border font-semibold rounded-xl text-xs tracking-wide transition-all duration-200 ${
                          selectedColor === clr
                            ? "border-stone-950 bg-stone-950 text-white shadow-md"
                            : "border-stone-200 text-stone-600 hover:border-amber-400 hover:text-stone-950"
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="mb-6 flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-[0.12em] text-stone-400 uppercase">
                Vault Stock:
              </span>
              {isOOS ? (
                <span className="text-xs text-rose-600 bg-rose-50 font-semibold px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Out of Stock — Backorder Available
                </span>
              ) : (
                <span className="text-xs text-emerald-700 bg-emerald-50 font-semibold px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {isLowStock ? `Only ${product.stock} units left!` : `${product.stock} units in reserve`}
                </span>
              )}
            </div>

            {/* ADD TO CART PANEL */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-5 border-t border-stone-100">
              {/* Quantity stepper */}
              {!isOOS && (
                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-3.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold font-mono text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3.5 py-3.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOOS}
                className={`flex-1 py-4 px-5 rounded-xl font-bold text-xs uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all duration-250 ${
                  isOOS
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                    : addedPop
                    ? "bg-emerald-600 text-white shadow-md scale-[0.99]"
                    : "bg-stone-950 hover:bg-stone-800 text-white shadow-md hover:shadow-lg"
                }`}
              >
                <ShoppingBag className={`w-4 h-4 ${addedPop ? "" : "text-amber-400"}`} />
                {isOOS ? "Sold Out" : addedPop ? "Added to Bag!" : "Add to Shopping Bag"}
              </button>

              {/* Buy now */}
              {!isOOS && (
                <button
                  onClick={handleBuyNow}
                  className="py-4 px-5 rounded-xl font-bold text-xs uppercase tracking-[0.12em] transition-all bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-md flex-shrink-0"
                >
                  Buy Now
                </button>
              )}

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className={`p-4 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${
                  isSaved
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "bg-stone-50 border-stone-200 text-stone-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"
                } ${heartPop ? "animate-heartbeat" : ""}`}
                title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isSaved ? "fill-white" : ""}`} />
              </button>

              {/* Share */}
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast("Link copied!", "success"); }}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition-all flex-shrink-0"
                title="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── TABS PANEL ── */}
        <section className="mt-8 bg-white rounded-3xl border border-stone-100 p-6 sm:p-10 shadow-sm">
          {/* Tab bar */}
          <div className="flex border-b border-stone-200 gap-1 mb-8 overflow-x-auto custom-scrollbar pb-0">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`pb-3.5 px-4 font-semibold text-xs tracking-[0.1em] uppercase border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === id
                    ? "border-amber-500 text-stone-950"
                    : "border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-[12rem]">
            <AnimatePresence mode="wait">

              {activeTab === "desc" && (
                <motion.div
                  key="desc"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-5 max-w-3xl"
                >
                  <h3 className="font-bold text-stone-900 text-base">Handcrafted Leather Artistry</h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-serif">
                    {settings.storeName} items represent decades of dedication to sustainable style. Every cut is measured specifically to highlight the leather's unique hide wrinkles and grains. High-stress joints are triple lock-stitched using custom heavy-duty nylon threads.
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed font-serif">
                    Inside, you'll find fully-sewn protective pockets and custom velvet bindings designed to shelter devices from scratches, coupled with organizational slots for keys, wallets, pens, and travel notes.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {["Full-grain Leather", "Triple Lock-Stitch", "Brass Hardware", "Vegetable Tanned", "Water Resistant", "Lifetime Repair"].map(feat => (
                      <div key={feat} className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "spec" && (
                <motion.div
                  key="spec"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="max-w-2xl"
                >
                  <div className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-stone-100">
                        {product.specifications &&
                          (Array.isArray(product.specifications)
                            ? product.specifications.map((spec) => (
                                <tr key={spec.key} className="hover:bg-stone-100/50 transition-colors">
                                  <td className="py-3 px-5 font-bold text-stone-500 uppercase tracking-wide w-2/5">{spec.key}</td>
                                  <td className="py-3 px-5 text-stone-900 font-semibold">{spec.value}</td>
                                </tr>
                              ))
                            : Object.entries(product.specifications).map(([key, val]) => (
                                <tr key={key} className="hover:bg-stone-100/50 transition-colors">
                                  <td className="py-3 px-5 font-bold text-stone-500 uppercase tracking-wide w-2/5">{key}</td>
                                  <td className="py-3 px-5 text-stone-900 font-semibold">{String(val)}</td>
                                </tr>
                              ))
                          )}
                        <tr className="hover:bg-stone-100/50 transition-colors">
                          <td className="py-3 px-5 font-bold text-stone-500 uppercase tracking-wide">Primary Colorway</td>
                          <td className="py-3 px-5 text-stone-900 font-semibold">{product.color}</td>
                        </tr>
                        <tr className="hover:bg-stone-100/50 transition-colors">
                          <td className="py-3 px-5 font-bold text-stone-500 uppercase tracking-wide">Shell Material</td>
                          <td className="py-3 px-5 text-stone-900 font-semibold">{product.material}</td>
                        </tr>
                        <tr className="hover:bg-stone-100/50 transition-colors">
                          <td className="py-3 px-5 font-bold text-stone-500 uppercase tracking-wide">Category</td>
                          <td className="py-3 px-5 text-stone-900 font-semibold">{product.category}</td>
                        </tr>
                        <tr className="hover:bg-stone-100/50 transition-colors">
                          <td className="py-3 px-5 font-bold text-stone-500 uppercase tracking-wide">Brand</td>
                          <td className="py-3 px-5 text-stone-900 font-semibold">{product.brand}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Rating summary */}
                  <div className="flex items-center gap-6 pb-6 border-b border-stone-100 flex-col sm:flex-row">
                    <div className="text-center p-6 bg-stone-50 rounded-2xl border border-stone-100 shrink-0 min-w-[7rem]">
                      <span className="text-4xl font-black text-stone-950 block font-mono">
                        {(product.rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">/ 5.0</span>
                      <div className="mt-2">
                        <StarRow value={product.rating ?? 0} size={13} />
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1 font-mono">
                        {product.reviews?.length ?? 0} reviews
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 mb-1">Authentic Buyer Reviews Only</h4>
                      <p className="text-xs text-stone-500 leading-relaxed max-w-md">
                        Every review represents an audited transaction. Customers who successfully checkout are invited to rate stitch alignment, leather weight, and carrier speed.
                      </p>
                    </div>
                  </div>

                  {product.reviews?.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                      {product.reviews.map((rev, idx) => (
                        <div key={idx} className="py-5 first:pt-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-xs text-stone-900">{rev.name}</h4>
                              <StarRow value={rev.rating} size={11} />
                            </div>
                            <span className="text-[10px] font-mono text-stone-400 whitespace-nowrap">{rev.date}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed font-serif italic mt-2">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-stone-400 text-sm">
                      No reviews yet. Purchase this item to share your feedback!
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </section>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-stone-200">
              <div>
                <span className="section-eyebrow">Coordinate Sets</span>
                <h2 className="section-title text-2xl mt-3">Related Collections</h2>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-bold tracking-[0.1em] uppercase text-stone-400 hover:text-stone-950 transition-colors hidden sm:block"
              >
                Browse category
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <motion.div
                  key={p._id || p.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
