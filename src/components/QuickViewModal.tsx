import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Heart, Star, Sparkles, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import Rating from "./Rating";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Sync state with selected product
  useEffect(() => {
    if (product) {
      setActiveImgIdx(0);
      setSelectedColor(product.color);
      setQuantity(1);
    }
  }, [product]);

  // Back-out scroll lock
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  const discountPrice = product.price * (1 - product.discount / 100);
  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddClick = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor);
    showToast(`Added ${quantity}x "${product.name}" in ${selectedColor} to cart.`, "bag");
    onClose();
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Dynamic backdrop shade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 z-10 border border-stone-100 max-h-[90vh] md:max-h-none overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-all shadow-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LEFT COLUMN: IMAGE EXPLORER */}
          <div className="p-6 sm:p-8 bg-stone-50 flex flex-col justify-center border-r border-stone-100">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-100 mb-4 max-h-[350px]">
              <img
                src={product.images[activeImgIdx]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Slider switch chevrons if multiple images */}
              {product.images.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button
                    onClick={() => setActiveImgIdx((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="p-1.5 rounded-full bg-white/90 text-stone-700 hover:bg-white shadow pointer-events-auto transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImgIdx((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="p-1.5 rounded-full bg-white/90 text-stone-700 hover:bg-white shadow pointer-events-auto transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails row */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 bg-white ${
                      activeImgIdx === idx ? "border-amber-500 shadow-sm" : "border-transparent"
                    } transition-all`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: INFORMATION */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Badges / Brand */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase">{product.brand}</span>
                {product.discount > 0 && (
                  <span className="bg-amber-500 text-stone-900 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {product.discount}% OFF
                  </span>
                )}
                {product.isTopSelling && (
                  <span className="bg-lime-100 text-lime-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-sans font-extrabold text-2xl text-stone-900 tracking-tight leading-tight mb-2">
                {product.name}
              </h1>

              {/* Ratings and Category */}
              <div className="flex items-center gap-4 mb-4">
                <Rating value={product.rating} max={5} showText={true} />
                <span className="text-stone-300">|</span>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{product.category}</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3.5 mb-6">
                <span className="text-2xl font-black text-stone-900 font-mono">
                  ${discountPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="text-base text-stone-400 line-through font-mono">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Colors selection */}
              <div className="mb-4">
                <h4 className="text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-2">
                  Select color: <span className="font-sans text-stone-500 font-normal">{selectedColor || "None"}</span>
                </h4>
                <div className="flex gap-2">
                  {[product.color, "Tan", "Black", "Burgundy"].map((clr) => {
                    // Match visual color circles roughly
                    let clrHex = "bg-stone-500";
                    if (clr === "Tan Brown" || clr === "Tan" || clr === "Saddle Tan") clrHex = "bg-amber-750";
                    else if (clr === "Forest Green" || clr === "Emerald Green") clrHex = "bg-emerald-800";
                    else if (clr === "Mineral Black" || clr === "Black" || clr === "Dark Charcoal") clrHex = "bg-stone-900";
                    else if (clr === "Navy Blue" || clr === "Cobalt Blue") clrHex = "bg-blue-900";
                    else if (clr === "Natural Cream" || clr === "Natural Straw") clrHex = "bg-stone-200";
                    else if (clr === "Blush Pink") clrHex = "bg-rose-200";
                    else if (clr === "Burgundy" || clr === "Maroon") clrHex = "bg-rose-950";

                    return (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`w-6 h-6 rounded-full ${clrHex} relative flex items-center justify-center cursor-pointer border border-stone-200 hover:ring-2 hover:ring-stone-400 transition-all duration-150 ${
                          selectedColor === clr ? "ring-2 ring-amber-500 ring-offset-2 scale-110" : ""
                        }`}
                        title={clr}
                      >
                        {selectedColor === clr && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Parameters list summary */}
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 p-3 bg-stone-50 rounded-xl mb-6 text-[11px]">
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span className="text-stone-400">Material:</span>
                  <span className="font-semibold text-stone-850">{product.material}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span className="text-stone-400">Avaliability:</span>
                  <span className={`font-semibold ${isOutOfStock ? "text-rose-500" : "text-emerald-500"}`}>
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION SECTION CONTAINER */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="flex items-center border border-stone-200 rounded-xl px-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-stone-500 hover:text-stone-900 transition-all font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 text-stone-500 hover:text-stone-900 transition-all font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Action: Add */}
              <button
                onClick={handleAddClick}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl font-bold font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                  isOutOfStock
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-stone-950 text-white hover:bg-stone-850"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Add To Shopping Bag
              </button>

              {/* Action: Favorite */}
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-xl border border-stone-200 flex items-center justify-center transition-all ${
                  isSaved
                    ? "bg-rose-500 border-rose-50 text-white"
                    : "bg-stone-50 hover:bg-stone-150 text-stone-600 hover:text-stone-900"
                }`}
                title="Save product"
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
              </button>
            </div>

            {/* Go to full product page link */}
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="mt-4 block text-center text-xxs tracking-widest uppercase font-bold text-amber-600 hover:text-stone-950 hover:underline transition-all"
            >
              View Full Details and Specifications
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
