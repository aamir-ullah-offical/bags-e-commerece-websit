import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, ChevronLeft, ChevronRight, Sparkles,
  Heart, Eye, ShoppingBag, Award, Truck, ShieldCheck,
  RotateCcw, Quote, TrendingUp, Users, Package, Star, Zap,
} from "lucide-react";

import { productService } from "../services/productService";
import { ProductCardSkeleton } from "../components/ProductCard";
import Newsletter from "../components/Newsletter";
import QuickViewModal from "../components/QuickViewModal";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { formatPKR, calcSalePrice } from "../utils/currency";
import { SkeletonHero, SkeletonCategoryCard } from "../components/ui/Skeletons";

function ProductSkeletonRow({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

function SectionHeader({ eyebrow, title, centered = true, dark = false }) {
  return (
    <div className={`flex flex-col ${centered ? "items-center text-center" : "items-start"} mb-8 gap-2`}>
      <span className={`section-eyebrow ${dark ? "!bg-amber-500/12 !text-amber-400 !border-amber-500/25 !shadow-[0_0_12px_rgba(217,119,6,0.12)]" : ""}`}>
        <Sparkles className="w-3 h-3" /> {eyebrow}
      </span>
      <h2 className={`section-title text-2xl sm:text-3xl ${dark ? "!text-white" : "!text-stone-950"}`}>{title}</h2>
      <div className={`section-divider ${!centered ? "!ml-0" : ""}`} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TOP PICK CARD — dark, square, integrated CTA
   ═══════════════════════════════════════════════ */
function TopPickCard({ product, onQuickView, rank }) {
  const { addToCart }                    = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast }                    = useToast();

  const id       = product._id || product.id;
  const price    = product.price    ?? 0;
  const discount = product.discount ?? 0;
  const sale     = calcSalePrice(price, discount);
  const isSaved  = isInWishlist(id);
  const isOOS    = (product.stock ?? 1) <= 0;
  const img      = product.images?.[0] ?? "";

  const doCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isOOS) return;
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart.`, "bag");
  };
  const doWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    const was = isInWishlist(id);
    toggleWishlist(product);
    showToast(was ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`, was ? "info" : "heart");
  };

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-[#1e1c1a] border border-stone-700/30 hover:border-amber-500/30 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.32)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.50)] hover:-translate-y-1 ring-1 ring-inset ring-white/[0.04]">

      {/* Square image */}
      <Link to={`/product/${id}`} tabIndex={-1}
        className="relative block flex-shrink-0 overflow-hidden bg-stone-800"
        style={{ aspectRatio: "1/1" }}>
        {img ? (
          <img src={img} alt={product.name ?? ""} referrerPolicy="no-referrer" loading="lazy" decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-550" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-stone-600" />
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-stone-950/75 to-transparent" />

        {isOOS && (
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-[8.5px] font-black uppercase tracking-widest py-0.5 px-2.5 bg-stone-950 text-white rounded-full">Sold Out</span>
          </div>
        )}

        {/* Rank badge top-left */}
        {rank && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[8.5px] font-black font-mono text-stone-400 bg-stone-950/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-stone-700/50">
              {String(rank).padStart(2, "0")}
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            <span className="badge badge-discount">−{discount}%</span>
          </div>
        )}

        {/* Wishlist + quick view on hover */}
        <div className="absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-220">
          <button onClick={doWish}
            className={`p-1.5 rounded-lg shadow transition-all ${isSaved ? "bg-rose-500 text-white" : "bg-stone-950/70 backdrop-blur-sm text-stone-400 hover:text-rose-400 border border-stone-700/50"}`}>
            <Heart className={`w-3 h-3 ${isSaved ? "fill-white" : ""}`} />
          </button>
          {onQuickView && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
              className="p-1.5 rounded-lg bg-stone-950/70 backdrop-blur-sm text-stone-400 hover:text-white border border-stone-700/50 shadow">
              <Eye className="w-3 h-3" />
            </button>
          )}
        </div>
      </Link>

      {/* Compact info */}
      <div className="px-3 pt-2 pb-2.5">
        {/* Title */}
        <Link to={`/product/${id}`}>
          <h3 className="text-[12.5px] font-semibold text-stone-200 leading-snug line-clamp-1 hover:text-amber-400 transition-colors mb-1">
            {product.name ?? ""}
          </h3>
        </Link>

        {/* Brand + rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-500 font-mono truncate mr-1">{product.brand ?? ""}</span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span className="text-[9px] font-bold font-mono text-stone-500">{Number(product.rating ?? 0).toFixed(1)}</span>
          </div>
        </div>

        {/* Price + CTA row */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-700/50">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[12.5px] font-black text-amber-400 font-mono leading-none">{formatPKR(sale)}</span>
            {discount > 0 && <span className="text-[9px] text-stone-600 line-through font-mono leading-none">{formatPKR(price)}</span>}
          </div>
          <button onClick={doCart} disabled={isOOS}
            className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
              isOOS ? "bg-stone-700 text-stone-500 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-[0_2px_8px_rgba(217,119,6,0.28)]"
            }`}>
            <ShoppingBag className="w-2.5 h-2.5" />
            {isOOS ? "Out" : "Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FEATURED CARD — white, square, dual-image swap
   ═══════════════════════════════════════════════ */
function FeaturedCard({ product, onQuickView }) {
  const { addToCart }                    = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast }                    = useToast();

  const [img1Loaded, setImg1Loaded] = useState(false);

  const id        = product._id || product.id;
  const price     = product.price    ?? 0;
  const discount  = product.discount ?? 0;
  const sale      = calcSalePrice(price, discount);
  const isSaved   = isInWishlist(id);
  const isOOS     = (product.stock ?? 1) <= 0;
  const img0      = product.images?.[0] ?? "";
  const img1      = product.images?.[1] ?? "";
  const hasDual   = img1 && img1 !== img0;
  const swapActive = hasDual && img1Loaded;
  const reviews   = product.reviews?.length ?? product.reviewCount ?? 0;

  const doCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isOOS) return;
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart.`, "bag");
  };
  const doWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    const was = isInWishlist(id);
    toggleWishlist(product);
    showToast(was ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`, was ? "info" : "heart");
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-stone-100 hover:border-amber-200/50 hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] transition-all duration-300 shadow-[0_1px_6px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 ring-1 ring-inset ring-stone-900/[0.03]">

      {/* Square image */}
      <Link to={`/product/${id}`} tabIndex={-1}
        className="relative block flex-shrink-0 overflow-hidden bg-stone-50"
        style={{ aspectRatio: "1/1" }}>
        {img0 ? (
          <>
            <img src={img0} alt={product.name ?? ""} referrerPolicy="no-referrer" loading="lazy" decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-650 ${swapActive ? "group-hover:opacity-0 group-hover:scale-[1.03]" : "group-hover:scale-[1.06]"}`} />
            {hasDual && (
              <img src={img1} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" aria-hidden
                onLoad={() => setImg1Loaded(true)}
                onError={() => setImg1Loaded(false)}
                className={`absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.03] transition-all duration-650 ${swapActive ? "group-hover:opacity-100 group-hover:scale-100" : ""}`} />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <ShoppingBag className="w-8 h-8 text-stone-300" />
          </div>
        )}

        {isOOS && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-[8.5px] font-black uppercase tracking-widest py-0.5 px-2.5 bg-stone-950 text-white rounded-full">Sold Out</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap">
          {product.category && (
            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-stone-500 rounded-md font-mono border border-stone-100/80">{product.category}</span>
          )}
          {discount > 0 && <span className="badge badge-discount">−{discount}%</span>}
        </div>

        {/* Wishlist */}
        <button onClick={doWish}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow-sm transition-all duration-200 ${
            isSaved ? "bg-rose-500 text-white" : "bg-white/85 text-stone-300 hover:text-rose-500 hover:bg-white border border-stone-100/60"
          }`}>
          <Heart className={`w-3 h-3 ${isSaved ? "fill-white" : ""}`} />
        </button>

        {/* Glass action bar */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex gap-1.5 p-2
          translate-y-full group-hover:translate-y-0 transition-transform duration-260 glass-dark">
          {onQuickView && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
              className="flex-1 flex items-center justify-center gap-1 bg-white/10 hover:bg-white/18 text-white text-[9px] font-bold py-1.5 rounded-lg uppercase tracking-[0.1em] border border-white/8 transition-colors">
              <Eye className="w-2.5 h-2.5" /> View
            </button>
          )}
          <button onClick={doCart} disabled={isOOS}
            className={`flex-1 flex items-center justify-center gap-1 text-[9px] font-bold py-1.5 rounded-lg uppercase tracking-[0.1em] transition-all ${
              isOOS ? "bg-stone-700/60 text-stone-500 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-400 text-stone-950 font-black"
            }`}>
            <ShoppingBag className="w-2.5 h-2.5" /> Add to Bag
          </button>
        </div>
      </Link>

      {/* Compact info */}
      <div className="flex flex-col px-3 pt-2 pb-2.5">
        <Link to={`/product/${id}`} className="hover:text-amber-700 transition-colors block mb-1">
          <h3 className="text-[12.5px] font-semibold text-stone-900 leading-snug line-clamp-1">{product.name ?? ""}</h3>
        </Link>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 font-mono truncate mr-1">{product.brand ?? ""}</span>
          <div className="flex items-center gap-[1.5px] flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-2 h-2 ${i < Math.round(product.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"}`} />
            ))}
            {reviews > 0 && <span className="text-[8.5px] text-stone-400 font-mono ml-0.5">({reviews})</span>}
          </div>
        </div>
        <div className="border-t border-stone-100 pt-1.5 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[13px] font-black text-stone-950 font-mono leading-none">{formatPKR(sale)}</span>
            {discount > 0 && <span className="text-[9px] text-stone-400 line-through font-mono leading-none">{formatPKR(price)}</span>}
          </div>
          {discount > 0 && (
            <span className="text-[8.5px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full font-mono whitespace-nowrap flex-shrink-0">
              {discount}% off
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TOP SELLER CARD — stone-50 bg, rank, white reveal
   ═══════════════════════════════════════════════ */
function TopSellerCard({ product, rank, onQuickView }) {
  const { addToCart }                    = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast }                    = useToast();

  const id       = product._id || product.id;
  const price    = product.price    ?? 0;
  const discount = product.discount ?? 0;
  const sale     = calcSalePrice(price, discount);
  const isSaved  = isInWishlist(id);
  const isOOS    = (product.stock ?? 1) <= 0;
  const img      = product.images?.[0] ?? "";

  const doCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isOOS) return;
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart.`, "bag");
  };
  const doWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    const was = isInWishlist(id);
    toggleWishlist(product);
    showToast(was ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`, was ? "info" : "heart");
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-stone-200/80 hover:border-amber-200/60 hover:shadow-[0_6px_22px_rgba(0,0,0,0.08)] transition-all duration-300 shadow-[0_1px_5px_rgba(0,0,0,0.05)]">

      {/* Faded rank — corner accent */}
      <div className="absolute top-0 right-1.5 z-0 pointer-events-none select-none">
        <span className="font-black text-stone-100 leading-none" style={{ fontSize: "3rem" }}>
          {String(rank).padStart(2, "0")}
        </span>
      </div>

      {/* Square image */}
      <Link to={`/product/${id}`} tabIndex={-1}
        className="relative block flex-shrink-0 overflow-hidden bg-stone-50"
        style={{ aspectRatio: "1/1" }}>
        {img ? (
          <img src={img} alt={product.name ?? ""} referrerPolicy="no-referrer" loading="lazy" decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
            <ShoppingBag className="w-8 h-8 text-stone-300" />
          </div>
        )}

        {isOOS && (
          <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-[8.5px] font-black uppercase tracking-widest py-0.5 px-2.5 bg-stone-950 text-white rounded-full">Sold Out</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-500 text-stone-950 rounded-full font-mono shadow-sm">Bestseller</span>
          {discount > 0 && <span className="badge badge-discount">−{discount}%</span>}
        </div>

        {/* Wishlist */}
        <button onClick={doWish}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow-sm transition-all duration-200 ${
            isSaved ? "bg-rose-500 text-white" : "bg-white/85 text-stone-300 hover:text-rose-500 border border-stone-100/60"
          }`}>
          <Heart className={`w-3 h-3 ${isSaved ? "fill-white" : ""}`} />
        </button>

        {/* White reveal bar */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex gap-1.5 p-2
          translate-y-full group-hover:translate-y-0 transition-transform duration-260
          bg-white/97 backdrop-blur-sm border-t border-stone-100">
          {onQuickView && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors">
              <Eye className="w-3 h-3" />
            </button>
          )}
          <button onClick={doCart} disabled={isOOS}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              isOOS ? "bg-stone-100 text-stone-400 cursor-not-allowed" : "bg-stone-950 hover:bg-stone-800 text-white"
            }`}>
            <ShoppingBag className="w-2.5 h-2.5" /> {isOOS ? "Sold Out" : "Add to Bag"}
          </button>
        </div>
      </Link>

      {/* Compact info */}
      <div className="relative z-10 flex flex-col px-3 pt-2 pb-2.5">
        <Link to={`/product/${id}`} className="hover:text-amber-700 transition-colors block mb-1">
          <h3 className="text-[12.5px] font-semibold text-stone-900 leading-snug line-clamp-1">{product.name ?? ""}</h3>
        </Link>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 font-mono truncate mr-1">{product.brand ?? ""}</span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-2 h-2 text-amber-400 fill-amber-400" />
            <span className="text-[9px] font-bold font-mono text-stone-500">{Number(product.rating ?? 0).toFixed(1)}</span>
          </div>
        </div>
        <div className="border-t border-stone-100 pt-1.5 flex items-baseline gap-1.5">
          <span className="text-[13px] font-black text-stone-950 font-mono leading-none">{formatPKR(sale)}</span>
          {discount > 0 && <span className="text-[9px] text-stone-400 line-through font-mono leading-none">{formatPKR(price)}</span>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NEW ARRIVAL CARD — slight portrait, ◆NEW, lift
   ═══════════════════════════════════════════════ */
function NewArrivalCard({ product }) {
  const { addToCart }                    = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast }                    = useToast();

  const id       = product._id || product.id;
  const price    = product.price    ?? 0;
  const discount = product.discount ?? 0;
  const sale     = calcSalePrice(price, discount);
  const isSaved  = isInWishlist(id);
  const isOOS    = (product.stock ?? 1) <= 0;
  const img      = product.images?.[0] ?? "";

  const doCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isOOS) return;
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart.`, "bag");
  };
  const doWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    const was = isInWishlist(id);
    toggleWishlist(product);
    showToast(was ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`, was ? "info" : "heart");
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-stone-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] transition-all duration-400 shadow-[0_1px_5px_rgba(0,0,0,0.04)] hover:-translate-y-1">

      {/* Slightly portrait image 5/6 */}
      <Link to={`/product/${id}`} tabIndex={-1}
        className="relative block flex-shrink-0 overflow-hidden bg-stone-50"
        style={{ aspectRatio: "5/6" }}>
        {img ? (
          <img src={img} alt={product.name ?? ""} referrerPolicy="no-referrer" loading="lazy" decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-600" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-stone-300" />
          </div>
        )}

        {isOOS && (
          <div className="absolute inset-0 bg-stone-950/28 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-[8.5px] font-black uppercase tracking-widest py-0.5 px-2.5 bg-stone-950 text-white rounded-full">Sold Out</span>
          </div>
        )}

        {/* Stamps */}
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-0.5 text-[8.5px] font-black uppercase tracking-[0.14em] px-1.5 py-0.5 bg-stone-950 text-amber-400 rounded-full font-mono">◆ NEW</span>
        </div>
        {discount > 0 && <span className="absolute top-2 right-2 z-10 badge badge-discount">−{discount}%</span>}

        {/* Wishlist - always visible softly */}
        <button onClick={doWish}
          className={`absolute bottom-2 right-2 z-10 p-1.5 rounded-full shadow transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 ${
            isSaved ? "bg-rose-500 text-white" : "bg-white text-stone-400 hover:text-rose-500"
          }`}>
          <Heart className={`w-3 h-3 ${isSaved ? "fill-white" : ""}`} />
        </button>
      </Link>

      {/* Minimal info */}
      <div className="flex flex-col px-3 pt-2 pb-2.5">
        <Link to={`/product/${id}`} className="hover:text-amber-700 transition-colors block mb-1">
          <h3 className="text-[12.5px] font-semibold text-stone-900 leading-snug line-clamp-1">{product.name ?? ""}</h3>
        </Link>
        <span className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 font-mono mb-1.5">{product.brand ?? ""}</span>
        <div className="border-t border-stone-100 pt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[13px] font-black text-stone-950 font-mono leading-none">{formatPKR(sale)}</span>
            {discount > 0 && <span className="text-[9px] text-stone-400 line-through font-mono leading-none">{formatPKR(price)}</span>}
          </div>
          <button onClick={doCart} disabled={isOOS}
            className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
              isOOS ? "bg-stone-100 text-stone-400 cursor-not-allowed"
              : "bg-stone-950 hover:bg-amber-500 hover:text-stone-950 text-white"
            }`}>
            <ShoppingBag className="w-2.5 h-2.5" />
            {isOOS ? "Out" : "Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}

const STATS = [
  { icon: Users,      label: "Happy Clients",   value: "12,400+" },
  { icon: Package,    label: "Crafted Pieces",   value: "3,200+"  },
  { icon: Star,       label: "Avg Rating",       value: "4.9 / 5" },
  { icon: TrendingUp, label: "Orders Delivered", value: "28,000+" },
];

/* ═══════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════ */
export default function Home() {
  const { settings } = useSettings();

  const [banners,      setBanners]      = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [topPicks,     setTopPicks]     = useState([]);
  const [featured,     setFeatured]     = useState([]);
  const [topSelling,   setTopSelling]   = useState([]);
  const [newArrivals,  setNewArrivals]  = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const [loading,         setLoading]         = useState(true);
  const [slideIdx,        setSlideIdx]        = useState(0);
  const [testIdx,         setTestIdx]         = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [b, c, tp, ft, ts, na, te] = await Promise.all([
          productService.getBanners(),
          productService.getCategories(),
          productService.getTopPicks(),
          productService.getFeaturedProducts(),
          productService.getTopSelling(),
          productService.getNewArrivals(),
          productService.getTestimonials(),
        ]);
        setBanners(b); setCategories(c); setTopPicks(tp);
        setFeatured(ft); setTopSelling(ts); setNewArrivals(na);
        setTestimonials(te);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(() => setSlideIdx(p => (p + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    if (!testimonials.length) return;
    const t = setInterval(() => setTestIdx(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <SkeletonHero />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col gap-2 mb-7">
            <div className="skeleton h-4 w-28 rounded-full" />
            <div className="skeleton h-7 w-44 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCategoryCard key={i} />)}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-14">
          <div className="flex flex-col gap-2 mb-7">
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton h-7 w-36 rounded-lg" />
          </div>
          <ProductSkeletonRow count={4} />
        </div>
      </div>
    );
  }

  return (
    <div id="home-page" className="bg-stone-50 text-stone-900 overflow-hidden">

      {/* ══ HERO SLIDER ══ */}
      <section className="relative h-[78vh] sm:h-[84vh] bg-stone-900 overflow-hidden border-b border-stone-800">
        {banners.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 px-4 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-[9.5px] font-extrabold font-mono tracking-[0.14em] uppercase shadow-lg">
              <Sparkles className="w-2.5 h-2.5 fill-stone-950" /> NEW COLLECTION
            </span>
            <h1 className="font-black text-4xl sm:text-5xl text-white tracking-tight">Luxury. Refined.</h1>
            <p className="text-stone-300 text-sm max-w-sm leading-relaxed">Explore our curated collection of premium leather bags and accessories.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-white hover:bg-amber-500 text-stone-950 px-5 py-3 rounded-xl font-bold text-[11px] uppercase tracking-[0.12em] transition-all shadow-xl">
              Shop Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
        <AnimatePresence mode="wait">
          {banners.length > 0 && (
            <motion.div key={slideIdx}
              initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.65, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/45 to-stone-950/10 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent z-10" />
              <img src={banners[slideIdx]?.image} alt="" referrerPolicy="no-referrer"
                fetchPriority="high" loading="eager" decoding="sync"
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative max-w-7xl mx-auto px-6 sm:px-8 w-full z-20 flex flex-col items-start gap-3.5">
                <motion.span initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-[9.5px] font-extrabold font-mono tracking-[0.14em] uppercase shadow-lg">
                  <Sparkles className="w-2.5 h-2.5 fill-stone-950" /> {banners[slideIdx]?.badge || "SEASONAL RELEASE"}
                </motion.span>
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                  className="max-w-xl font-black text-4xl sm:text-5xl lg:text-[3.25rem] text-white tracking-tight leading-[1.06]">
                  {banners[slideIdx]?.title}
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.45 }}
                  className="max-w-sm text-stone-300 text-sm leading-relaxed font-light">
                  {banners[slideIdx]?.subtitle}
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.45 }}
                  className="flex items-center gap-3 mt-0.5">
                  <Link to={banners[slideIdx]?.ctaLink || "/shop"}
                    className="inline-flex items-center gap-2 bg-white hover:bg-amber-500 text-stone-950 px-5 py-3 rounded-xl font-bold text-[11px] uppercase tracking-[0.12em] transition-all duration-300 shadow-xl hover:shadow-[0_8px_28px_rgba(217,119,6,0.38)] group/btn">
                    {banners[slideIdx]?.ctaText || "Shop Collection"}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  {banners[slideIdx]?.discountText && (
                    <div className="hidden sm:flex flex-col">
                      <span className="text-[9px] font-bold text-stone-500 font-mono tracking-wider uppercase">Limited Offer</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">{banners[slideIdx].discountText}</span>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button onClick={() => setSlideIdx(p => p === 0 ? banners.length - 1 : p - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center gap-1 w-9 sm:w-11 h-[54px] sm:h-[68px] bg-white/7 hover:bg-amber-500 rounded-r-2xl border border-l-0 border-white/8 hover:border-amber-400 backdrop-blur-sm transition-all duration-300 group shadow-[4px_0_18px_rgba(0,0,0,0.2)]"
              aria-label="Previous slide">
              <ChevronLeft className="w-4 h-4 text-white group-hover:text-stone-950 group-hover:-translate-x-0.5 transition-all" />
              <span className="text-[6.5px] font-black tracking-[0.18em] text-white/30 group-hover:text-stone-800 uppercase font-mono transition-colors leading-none">PREV</span>
            </button>
            <button onClick={() => setSlideIdx(p => (p + 1) % banners.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center gap-1 w-9 sm:w-11 h-[54px] sm:h-[68px] bg-white/7 hover:bg-amber-500 rounded-l-2xl border border-r-0 border-white/8 hover:border-amber-400 backdrop-blur-sm transition-all duration-300 group shadow-[-4px_0_18px_rgba(0,0,0,0.2)]"
              aria-label="Next slide">
              <ChevronRight className="w-4 h-4 text-white group-hover:text-stone-950 group-hover:translate-x-0.5 transition-all" />
              <span className="text-[6.5px] font-black tracking-[0.18em] text-white/30 group-hover:text-stone-800 uppercase font-mono transition-colors leading-none">NEXT</span>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5">
              <div className="flex gap-1.5">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setSlideIdx(i)}
                    className={`h-[2.5px] rounded-full transition-all duration-300 ${i === slideIdx ? "w-6 bg-amber-400" : "w-1.5 bg-white/25 hover:bg-white/45"}`} />
                ))}
              </div>
              <span className="text-[8.5px] font-mono font-bold text-white/25 tracking-[0.2em] select-none">
                {String(slideIdx + 1).padStart(2, "0")} · {String(banners.length).padStart(2, "0")}
              </span>
            </div>
          </>
        )}
      </section>

      {/* ══ STATS STRIP ══ */}
      <div className="stats-strip border-y border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 grid grid-cols-2 md:grid-cols-4 gap-0">
          {STATS.map(({ icon: Icon, label, value }, i) => (
            <div key={label} className={`flex items-center gap-2.5 px-4 py-1.5 border-stone-800/60 ${
              i > 0 ? "border-l" : ""
            } ${i >= 2 ? "border-t md:border-t-0" : ""}`}>
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/10 text-amber-400 flex-shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[13.5px] font-black text-white font-mono leading-tight">{value}</div>
                <div className="text-[8px] font-bold text-stone-500 uppercase tracking-wider leading-none mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Browse Collection" title="Shop By Category" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.slice(0, 8).map((cat, i) => (
            <motion.div key={cat._id || cat.id || i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.38 }}>
              <Link to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative h-36 sm:h-44 rounded-xl overflow-hidden bg-stone-900 flex flex-col justify-end border border-stone-700/30 hover:border-amber-500/40 transition-all duration-350 shadow-[0_2px_10px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.22)] hover:-translate-y-1 block">
                <img src={cat.image} alt={cat.name} referrerPolicy="no-referrer" loading="lazy" decoding="async"
                  className="absolute inset-0 w-full h-full object-cover grayscale-[55%] group-hover:grayscale-0 group-hover:scale-[1.08] transition-all duration-550" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
                {/* Amber accent border on hover bottom edge */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-amber-600 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <span className="absolute top-2 left-2.5 text-[8.5px] font-black font-mono text-white/20 group-hover:text-amber-400/60 transition-colors select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10 px-3 pb-2.5 flex items-end justify-between gap-1.5">
                  <div className="min-w-0">
                    <h3 className="font-black text-[13px] text-white leading-tight truncate group-hover:text-amber-100 transition-colors">{cat.name}</h3>
                    <span className="text-[8px] font-mono text-stone-500 group-hover:text-stone-300 transition-colors">{cat.count} pieces</span>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-0.5 bg-amber-500 text-stone-950 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-240 shadow-md">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ TOP PICKS ══ */}
      <section className="bg-[#171614] py-12 border-y border-stone-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header row: eyebrow + title left, link right */}
          <div className="flex items-center justify-between mb-7 pb-5 border-b border-stone-800/60">
            <div className="flex flex-col gap-1.5">
              <span className="section-eyebrow !bg-amber-500/10 !text-amber-400 !border-amber-500/20 self-start">
                <Sparkles className="w-3 h-3" /> Curator Choice
              </span>
              <h2 className="section-title text-2xl sm:text-3xl !text-white">The Heritage Top Picks</h2>
              <div className="section-divider" />
            </div>
            <Link to="/shop?sort=Top Picks"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-amber-400/70 hover:text-amber-300 border border-stone-700/60 hover:border-amber-500/40 px-3 py-1.5 rounded-lg transition-all group/link">
              View All <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {topPicks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {topPicks.slice(0, 4).map((prod, i) => (
                <motion.div key={prod._id || prod.id}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <TopPickCard product={prod} onQuickView={setSelectedProduct} rank={i + 1} />
                </motion.div>
              ))}
            </div>
          ) : <ProductSkeletonRow />}
        </div>
      </section>

      {/* ══ FEATURED ══ */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Selected Craft" title="Featured Capsule Products" />
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featured.slice(0, 8).map((prod, i) => (
              <motion.div key={prod._id || prod.id}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: (i % 4) * 0.05, duration: 0.38 }}>
                <FeaturedCard product={prod} onQuickView={setSelectedProduct} />
              </motion.div>
            ))}
          </div>
        ) : <ProductSkeletonRow count={8} />}
      </section>

      {/* ══ PROMO BANNER ══ */}
      <section className="relative overflow-hidden bg-stone-950 py-16 mx-4 sm:mx-6 lg:mx-8 mb-4 rounded-2xl border border-stone-800 max-w-7xl xl:mx-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-xl mx-auto text-center px-6 flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 tracking-[0.14em] uppercase font-mono">
            <Sparkles className="w-2.5 h-2.5" /> Limited Mid-Season Promo
          </span>
          <h2 className="font-black text-2xl sm:text-3xl tracking-tight leading-tight text-white">
            Exclusive Flat 15% Welcome Discount
          </h2>
          <p className="text-sm text-stone-400 leading-relaxed">
            Use code{" "}
            <span className="font-mono text-amber-400 font-bold bg-stone-900 border border-stone-700 px-2 py-0.5 rounded text-[11px] uppercase">MAISONSAC15</span>
            {" "}at checkout.
          </p>
          <div className="flex items-center gap-3">
            <Link to="/shop"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-[11px] uppercase tracking-[0.12em] transition-all shadow-[0_4px_16px_rgba(217,119,6,0.4)] group/btn">
              Shop Now <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about"
              className="border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 font-bold px-6 py-2.5 rounded-xl text-[11px] uppercase tracking-[0.12em] transition-all">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TOP SELLING ══ */}
      <section className="py-12 bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-stone-200">
            <div className="flex flex-col gap-1.5">
              <span className="section-eyebrow self-start">Market Favorites</span>
              <h2 className="section-title text-2xl sm:text-3xl !text-stone-950">Top Selling Collections</h2>
              <div className="section-divider" />
            </div>
            <Link to="/shop?sort=Best Selling"
              className="flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-stone-500 hover:text-stone-950 border border-stone-200 hover:border-stone-400 px-3 py-1.5 rounded-lg transition-all group">
              View All <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {topSelling.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {topSelling.slice(0, 4).map((prod, i) => (
                <motion.div key={prod._id || prod.id}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.38 }}>
                  <TopSellerCard product={prod} rank={i + 1} onQuickView={setSelectedProduct} />
                </motion.div>
              ))}
            </div>
          ) : <ProductSkeletonRow />}
        </div>
      </section>

      {/* ══ NEW ARRIVALS ══ */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Fresh Releases" title="New Arrival Showcase" />
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {newArrivals.slice(0, 4).map((prod, i) => (
              <motion.div key={prod._id || prod.id}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.38 }}>
                <NewArrivalCard product={prod} />
              </motion.div>
            ))}
          </div>
        ) : <ProductSkeletonRow />}
      </section>

      {/* ══ WHY CHOOSE US ══ */}
      <section className="py-12 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Atelier Philosophy" title="Why Buyers Choose Us" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Award,       title: "Premium Sourcing",         desc: "Full-grain leather, custom alloy hardware, and organic canvas from certified ethical suppliers worldwide.", num: "01" },
              { icon: Truck,       title: "Tracked Express Delivery", desc: "Orders packed in luxury boxes, dispatched via registered courier with real-time GPS tracking.", num: "02" },
              { icon: ShieldCheck, title: "Encrypted Payments",       desc: "International safety standards with certified multi-channel security and fraud protection.", num: "03" },
              { icon: RotateCcw,   title: "30-Day Easy Returns",      desc: "Return within 30 days for a full, hassle-free refund — no questions asked.", num: "04" },
            ].map(({ icon: Icon, title, desc, num }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group relative flex flex-col gap-3 p-5 rounded-xl bg-white border border-stone-100 hover:border-amber-200/50 hover:shadow-[0_6px_22px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <span className="absolute top-0 right-2 font-black text-stone-100/80 group-hover:text-amber-500/8 transition-colors select-none pointer-events-none leading-none" style={{ fontSize: "2.8rem" }}>
                  {num}
                </span>
                <div className="absolute left-0 inset-y-0 w-[2.5px] rounded-r-full bg-stone-100 group-hover:bg-gradient-to-b group-hover:from-amber-400 group-hover:via-amber-500 group-hover:to-amber-300 transition-all duration-400" />
                <div className="p-2.5 rounded-xl bg-stone-950 text-amber-400 w-fit group-hover:bg-amber-500 group-hover:text-stone-950 transition-all duration-300 relative z-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-[13.5px] text-stone-900 mb-1.5 leading-tight">{title}</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BRAND QUOTE ══ */}
      <section className="relative overflow-hidden bg-stone-950 py-14 border-y border-stone-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-0 w-48 h-48 bg-amber-600/4 rounded-full blur-3xl" />
          <div className="absolute right-1/4 bottom-0 w-48 h-48 bg-amber-500/4 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <Quote className="w-7 h-7 text-amber-500/30 mx-auto mb-4" />
          <blockquote className="font-serif text-lg sm:text-xl text-white leading-relaxed font-light italic mb-5">
            "Every stitch is a promise — that luxury isn't what you carry,
            but the story the bag tells about who you are."
          </blockquote>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[13px] font-bold text-white">{settings.storeName} Atelier</span>
            <span className="text-[8.5px] text-stone-500 font-mono uppercase tracking-widest">Est. 2018 · Handcrafted Excellence</span>
          </div>
          <Link to="/about"
            className="inline-flex items-center gap-2 mt-5 text-[11px] font-bold tracking-[0.12em] uppercase text-amber-400 hover:text-white transition-colors group/link">
            Discover Our Heritage <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-12 bg-white border-y border-stone-100 overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <SectionHeader eyebrow="Verified Reviews" title="What Customers Say" />
          <div className="relative bg-stone-50 border border-stone-100 rounded-2xl px-6 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] min-h-[10rem] flex flex-col justify-center items-center">
            {/* Decorative left quote */}
            <Quote className="absolute top-4 left-4 w-5 h-5 text-amber-200 rotate-180" />
            <AnimatePresence mode="wait">
              {testimonials.length > 0 && (
                <motion.div key={testIdx}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}
                  className="flex flex-col items-center gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < (testimonials[testIdx]?.rating ?? 5) ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-stone-700 font-serif font-light max-w-lg leading-relaxed italic">
                    "{testimonials[testIdx]?.comment}"
                  </p>
                  <div className="flex items-center gap-2.5 mt-1">
                    {testimonials[testIdx]?.photo && (
                      <img src={testimonials[testIdx].photo} alt={testimonials[testIdx].name}
                        referrerPolicy="no-referrer" loading="lazy" decoding="async"
                        className="w-9 h-9 rounded-full object-cover border-2 border-amber-300/60 shadow-sm ring-2 ring-white" />
                    )}
                    <div className="text-left">
                      <h4 className="text-[12.5px] font-bold text-stone-900">{testimonials[testIdx]?.name}</h4>
                      <span className="text-[8.5px] text-stone-400 uppercase tracking-widest font-bold font-mono">{testimonials[testIdx]?.role}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-1.5 mt-4">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setTestIdx(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === testIdx ? "w-7 bg-amber-500" : "w-2 bg-stone-200 hover:bg-stone-300"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ NEWSLETTER ══ */}
      <Newsletter />

      <QuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
