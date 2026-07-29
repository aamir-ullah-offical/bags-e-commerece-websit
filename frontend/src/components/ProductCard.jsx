import { useState, useCallback, useRef, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye, Star, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { formatPKR, calcSalePrice } from "../utils/currency";

/* ─── Skeleton ─── */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="skeleton skeleton-img" style={{ aspectRatio: "1/1" }} />
      <div className="px-3 pt-2 pb-2.5 flex flex-col gap-1.5">
        <div className="skeleton skeleton-title w-4/5" />
        <div className="flex items-center justify-between">
          <div className="skeleton skeleton-text w-10" />
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton w-2 h-2 rounded-sm" />)}
          </div>
        </div>
        <div className="border-t border-stone-100 pt-2 flex items-center justify-between">
          <div className="skeleton skeleton-title w-14" />
          <div className="skeleton h-3.5 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Star rating ─── */
const MiniStars = memo(function MiniStars({ value = 0, count = 0 }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-2 h-2 ${i < full ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"}`} />
      ))}
      {count > 0 && (
        <span className="text-[8.5px] text-stone-400 font-mono ml-0.5 leading-none">({count})</span>
      )}
    </div>
  );
});

/* ─── Main product card ─── */
const ProductCard = memo(function ProductCard({ product, onQuickView }) {
  const { addToCart }                    = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast }                    = useToast();

  const [imgLoaded,  setImgLoaded]  = useState(false);
  const [img1Loaded, setImg1Loaded] = useState(false);
  const [heartPop,   setHeartPop]   = useState(false);
  const [addedPop,   setAddedPop]   = useState(false);
  const heartTimer = useRef(null);
  const addedTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(heartTimer.current);
    clearTimeout(addedTimer.current);
  }, []);

  const id       = product._id || product.id;
  const price    = product.price    ?? 0;
  const discount = product.discount ?? 0;
  const sale     = calcSalePrice(price, discount);
  const savings  = Math.round(price - sale);
  const isSaved  = isInWishlist(id);
  const isOOS    = (product.stock ?? 1) <= 0;
  const isLow    = !isOOS && (product.stock ?? 99) <= 3;
  const img0      = product.images?.[0] ?? "";
  const img1      = product.images?.[1] ?? "";
  const hasDual   = img1 && img1 !== img0;
  const swapActive = hasDual && img1Loaded;
  const reviews  = product.reviews?.length ?? product.reviewCount ?? 0;

  const handleImgLoad = useCallback(() => setImgLoaded(true), []);

  const handleCart = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (isOOS) return;
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart.`, "bag");
    setAddedPop(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAddedPop(false), 700);
  }, [isOOS, addToCart, product, showToast]);

  const handleWishlist = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    const was = isInWishlist(id);
    toggleWishlist(product);
    setHeartPop(true);
    clearTimeout(heartTimer.current);
    heartTimer.current = setTimeout(() => setHeartPop(false), 600);
    showToast(was ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`, was ? "info" : "heart");
  }, [isInWishlist, id, toggleWishlist, product, showToast]);

  const handleQV = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (onQuickView) onQuickView(product);
  }, [onQuickView, product]);

  return (
    <div
      id={`pc-${id}`}
      className="luxury-card group relative flex flex-col bg-white rounded-xl overflow-hidden border border-stone-100/80 hover:border-amber-300/40 ring-1 ring-inset ring-stone-900/[0.03]"
    >
      {/* ── IMAGE (square — compact) ── */}
      <Link
        to={`/product/${id}`}
        tabIndex={-1}
        className="relative block flex-shrink-0 overflow-hidden bg-stone-50"
        style={{ aspectRatio: "1 / 1" }}
      >
        {img0 ? (
          <>
            <img
              src={img0} alt={product.name ?? "Product"}
              referrerPolicy="no-referrer" loading="lazy" decoding="async"
              onLoad={handleImgLoad}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-600
                ${swapActive ? "group-hover:opacity-0 group-hover:scale-[1.04]" : "group-hover:scale-[1.06]"}
                ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {!imgLoaded && <div className="absolute inset-0 skeleton skeleton-img" />}
            {hasDual && (
              <img
                src={img1} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" aria-hidden
                onLoad={() => setImg1Loaded(true)}
                onError={() => setImg1Loaded(false)}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-600 opacity-0 scale-[1.04] ${swapActive ? "group-hover:opacity-100 group-hover:scale-100" : ""}`}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <ShoppingBag className="w-8 h-8 text-stone-300" />
          </div>
        )}

        {/* Sold-out veil */}
        {isOOS && (
          <div className="absolute inset-0 bg-stone-950/22 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="text-[8.5px] font-black uppercase tracking-[0.15em] py-0.5 px-2.5 bg-stone-950 text-white rounded-full">Sold Out</span>
          </div>
        )}

        {/* Subtle bottom gradient — always visible */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/12 to-transparent pointer-events-none" />

        {/* Hover action bar (glass-dark) */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex gap-1.5 p-2
          translate-y-full group-hover:translate-y-0 transition-transform duration-260 ease-out glass-dark">
          {onQuickView && (
            <button onClick={handleQV}
              className="flex-1 flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold py-1.5 rounded-lg uppercase tracking-[0.1em] transition-colors border border-white/8">
              <Eye className="w-2.5 h-2.5" /> View
            </button>
          )}
          <button onClick={handleCart} disabled={isOOS}
            className={`flex-1 flex items-center justify-center gap-1 text-[9px] font-bold py-1.5 rounded-lg uppercase tracking-[0.1em] transition-all ${
              isOOS ? "bg-stone-700/60 text-stone-500 cursor-not-allowed"
              : addedPop ? "bg-emerald-500 text-white"
              : "bg-amber-500 hover:bg-amber-400 text-stone-950 font-black"
            }`}>
            {addedPop
              ? <><Zap className="w-2.5 h-2.5" /> Added!</>
              : <><ShoppingBag className="w-2.5 h-2.5" /> Add</>}
          </button>
        </div>

        {/* Wishlist — always visible, fills on save */}
        <button onClick={handleWishlist}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 shadow-sm
            ${isSaved
              ? "bg-rose-500 text-white"
              : "bg-white/82 backdrop-blur-sm text-stone-300 hover:text-rose-500 hover:bg-white border border-stone-100/60"}
            ${heartPop ? "animate-heartbeat" : "hover:scale-110"}`}>
          <Heart className={`w-3 h-3 ${isSaved ? "fill-white" : ""}`} />
        </button>
      </Link>

      {/* ── BADGES (top-left) ── */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {discount > 0 && (
          <span className="badge badge-discount shadow-sm">−{discount}%</span>
        )}
        {product.isNew && (
          <span className="badge badge-new shadow-sm">New</span>
        )}
        {product.isTopSelling && !product.isNew && (
          <span className="badge badge-bestseller shadow-sm">Hot</span>
        )}
        {isLow && (
          <span className="badge badge-lowstock shadow-sm">{product.stock} left</span>
        )}
      </div>

      {/* ── INFO PANEL (ultra compact) ── */}
      <div className="flex flex-col px-3 pt-2 pb-2.5">

        {/* Title — first, most prominent */}
        <Link to={`/product/${id}`} className="hover:text-amber-700 transition-colors duration-150 block mb-1">
          <h3 className="font-semibold text-[12.5px] text-stone-900 leading-snug line-clamp-1">
            {product.name ?? ""}
          </h3>
        </Link>

        {/* Brand + rating — same row */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 font-mono truncate mr-1">
            {product.brand ?? ""}
          </span>
          <MiniStars value={product.rating ?? 0} count={reviews} />
        </div>

        {/* Price row — bordered top */}
        <div className="border-t border-stone-100 pt-1.5 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[13px] font-black text-stone-950 font-mono leading-none">{formatPKR(sale)}</span>
            {discount > 0 && (
              <span className="text-[9px] text-stone-400 line-through font-mono leading-none">{formatPKR(price)}</span>
            )}
          </div>
          {discount > 0 && savings >= 500 && (
            <span className="text-[8.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full font-mono whitespace-nowrap flex-shrink-0">
              −{formatPKR(savings)}
            </span>
          )}
        </div>

        {/* Mobile CTA — compact */}
        <button onClick={handleCart} disabled={isOOS}
          className={`md:hidden mt-1.5 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${
            isOOS ? "bg-stone-100 text-stone-400 cursor-not-allowed" : "bg-stone-950 hover:bg-stone-800 text-white"
          }`}>
          <ShoppingBag className="w-3 h-3" />
          {isOOS ? "Sold Out" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
});

export default ProductCard;
