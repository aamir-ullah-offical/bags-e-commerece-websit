import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ShoppingBag, Eye, Star, Info } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import Rating from "./Rating";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  key?: any;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [hovered, setHovered] = useState(false);

  const discountPrice = product.price * (1 - product.discount / 100);
  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart.`, "bag");
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isSaved) {
      showToast(`Saved "${product.name}" to wishlist.`, "heart");
    } else {
      showToast(`Removed "${product.name}" from wishlist.`, "info");
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div
      id={`prod-card-${product.id}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* BADGES ROW */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5">
        {product.discount > 0 && (
          <span className="bg-amber-500/90 backdrop-blur-sm text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Save {product.discount}%
          </span>
        )}
        {product.isTopSelling && (
          <span className="bg-stone-900/95 backdrop-blur-sm text-lime-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Bestseller
          </span>
        )}
        {product.stock <= 3 && product.stock > 0 && (
          <span className="bg-rose-500 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Only {product.stock} Left
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-stone-500 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
            Sold Out
          </span>
        )}
      </div>

      {/* QUICK SAVE BUTTON */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3.5 right-3.5 z-10 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 ${
          isSaved
            ? "bg-rose-500 text-white"
            : "bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900"
        }`}
        title="Add to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
      </button>

      {/* IMAGE CONTAINER */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={hovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* OVERLAY FOOTER ACTIONS FOR DESKTOP */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-stone-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex gap-2 justify-center z-20">
          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="bg-white/95 hover:bg-white text-stone-900 font-medium px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ${
              isOutOfStock
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </Link>

      {/* TEXT INFO */}
      <div className="flex-1 flex flex-col p-4 bg-white">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.brand}</span>
          <span className="text-[10px] font-medium text-stone-500 font-mono">Sold: {product.soldCount}</span>
        </div>

        <Link to={`/product/${product.id}`} className="group-hover:text-amber-600 transition-colors">
          <h3 className="font-sans font-medium text-sm text-stone-900 leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* STARS AND CATEGORY */}
        <div className="flex items-center justify-between mt-2 mb-3">
          <Rating value={product.rating} size={12} showText={true} />
          <span className="text-[11px] text-stone-500 underline decoration-stone-200 underline-offset-2">
            {product.category}
          </span>
        </div>

        {/* PRICE BAR */}
        <div className="mt-auto pt-3 border-t border-stone-50 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-900 font-mono">
              ${discountPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-stone-400 line-through font-mono">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-400 font-mono">
            {product.color} / {product.material}
          </span>
        </div>

        {/* MOBILE CALL-TO-ACTION BUTTONS (ALWAYS VISIBLE ON TACTILE) */}
        <div className="mt-3 flex gap-1.5 md:hidden">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider ${
              isOutOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add To Bag
          </button>
          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="px-2.5 rounded-lg border border-stone-200 text-stone-600 flex items-center justify-center bg-stone-50"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
