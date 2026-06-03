import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Breadcrumb from "../components/Breadcrumb";
import Rating from "../components/Rating";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item, 1);
    removeFromWishlist(item.id);
    showToast(`Moved "${item.name}" to cart list.`, "bag");
  };

  return (
    <div id="wishlist-page" className="min-h-screen bg-stone-50 pb-20">
      <Breadcrumb items={[{ label: "Your Wishlist" }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h1 className="font-sans font-black text-3xl text-stone-900 tracking-tight mb-8 flex items-center gap-3">
          Saved Favorites
          <span className="text-sm font-semibold tracking-widest font-mono text-stone-400 uppercase">
            ({wishlistItems.length} Models)
          </span>
        </h1>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlistItems.map((prod) => {
                const discountPrice = prod.price * (1 - prod.discount / 100);
                const isOutOfStock = prod.stock <= 0;
                return (
                  <motion.div
                    key={prod.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-stone-150 relative flex flex-col justify-between"
                  >
                    {/* Elimination header close */}
                    <button
                      onClick={() => {
                        removeFromWishlist(prod.id);
                        showToast(`Removed "${prod.name}" from wishlist.`, "info");
                      }}
                      className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white/90 text-stone-500 hover:text-rose-500 hover:bg-white shadow-sm transition-all"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      {/* Product display thumbnail */}
                      <Link to={`/product/${prod.id}`} className="block relative aspect-square bg-stone-50 overflow-hidden">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-xs flex items-center justify-center">
                            <span className="text-[10px] font-bold py-1 px-2.5 bg-stone-900 text-white rounded-full uppercase tracking-wider">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Info lines text */}
                      <div className="p-4 flex flex-col">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                          {prod.brand}
                        </span>
                        <Link to={`/product/${prod.id}`} className="hover:text-amber-600 transition-colors">
                          <h3 className="font-sans font-bold text-sm text-stone-900 leading-snug line-clamp-2">
                            {prod.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <Rating value={prod.rating} size={11} showText={true} />
                        </div>
                        <div className="flex items-baseline gap-2 mt-3 mb-1">
                          <span className="text-sm font-bold text-stone-900 font-mono">
                            ${discountPrice.toFixed(2)}
                          </span>
                          {prod.discount > 0 && (
                            <span className="text-xxs text-stone-400 line-through font-mono">
                              ${prod.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Move to Bag CTA button footer bottom */}
                    <div className="p-4 pt-0 border-t border-stone-50 mt-auto">
                      <button
                        onClick={(e) => handleMoveToCart(e, prod)}
                        disabled={isOutOfStock}
                        className={`w-full py-2.5 rounded-xl font-bold font-sans text-xxs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${
                          isOutOfStock
                            ? "bg-stone-50 text-stone-405 cursor-not-allowed text-stone-400 border border-stone-100"
                            : "bg-stone-950 text-white hover:bg-stone-850 cursor-pointer"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        Move to Bag
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* EMPTY SAVED LIST PLACEHOLDER */
          <div className="bg-white rounded-3xl border border-stone-150 max-w-xl mx-auto py-20 px-6 text-center flex flex-col items-center gap-4 my-8 shadow-xs">
            <div className="p-4 bg-stone-100 rounded-full text-stone-400">
              <Heart className="w-10 h-10 text-rose-500 fill-rose-50" />
            </div>
            <h2 className="font-sans font-black text-xl text-stone-900 animate-duration-1000">Your wishlist is empty</h2>
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              Whenever you encounter a handbag or accessory model you like in the boutique, click the heart symbol to store it in your favorites collection.
            </p>
            <Link
              to="/shop"
              className="bg-stone-900 hover:bg-stone-850 text-white font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md mt-2 inline-flex items-center gap-1.5"
            >
              Discover Boutique Items
              <ArrowRight className="w-4 h-4 text-amber-400 font-bold" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
