import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Breadcrumb from "../components/Breadcrumb";
import Rating from "../components/Rating";
import { formatPKR, calcSalePrice } from "../utils/currency";
import EmptyState from "../components/ui/EmptyState";

export default function Wishlist() {
 const { wishlistItems, removeFromWishlist } = useWishlist();
 const { addToCart } = useCart();
 const { showToast } = useToast();

 const handleMoveToCart = (e, item) => {
 e.preventDefault();
 e.stopPropagation();
 const id = item._id || item.id;
 addToCart(item, 1);
 removeFromWishlist(id);
 showToast(`Moved "${item.name}" to your cart.`, "bag");
 };

 return (
 <div
 id="wishlist-page"
 className="min-h-screen bg-stone-50 pb-20 text-stone-900 transition-colors duration-300"
 >
 <Breadcrumb items={[{ label: "Your Wishlist" }]} />

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
 <h1 className="font-sans font-black text-3xl text-stone-900 tracking-tight mb-8 flex items-center gap-3">
 Saved Favorites
 <span className="text-sm font-semibold tracking-widest font-mono text-stone-400 uppercase">
 ({wishlistItems.length} {wishlistItems.length === 1 ? "Model" : "Models"})
 </span>
 </h1>

 {wishlistItems.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 <AnimatePresence>
 {wishlistItems.map((prod) => {
 const id = prod._id || prod.id;
 const price = prod.price ?? 0;
 const discount = prod.discount ?? 0;
 const discountPrice = calcSalePrice(price, discount);
 const isOutOfStock = (prod.stock ?? 1) <= 0;
 const image = prod.images?.[0] ?? "";

 return (
 <motion.div
 key={id}
 layout
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.2 }}
 className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-stone-200 relative flex flex-col"
 >
 {/* Remove button */}
 <button
 onClick={() => {
 removeFromWishlist(id);
 showToast(`Removed "${prod.name}" from wishlist.`, "info");
 }}
 className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white/90 text-stone-500 hover:text-rose-500 hover:bg-white shadow-sm transition-all"
 title="Remove from wishlist"
 >
 <Trash2 className="w-4 h-4" />
 </button>

 {/* Image */}
 <Link
 to={`/product/${id}`}
 className="block relative aspect-square bg-stone-100 overflow-hidden flex-shrink-0"
 >
 {image ? (
 <img
 src={image}
 alt={prod.name ?? ""}
 referrerPolicy="no-referrer"
 className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-stone-100">
 <ShoppingBag className="w-8 h-8 text-stone-300" />
 </div>
 )}
 {isOutOfStock && (
 <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-[2px] flex items-center justify-center">
 <span className="text-[10px] font-bold py-1 px-2.5 bg-stone-900 text-white rounded-full uppercase tracking-wider">
 Sold Out
 </span>
 </div>
 )}
 </Link>

 {/* Content */}
 <div className="flex-1 flex flex-col p-4">
 <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
 {prod.brand ?? ""}
 </span>
 <Link
 to={`/product/${id}`}
 className="hover:text-amber-600 transition-colors"
 >
 <h3 className="font-sans font-bold text-sm text-stone-900 leading-snug line-clamp-2 min-h-[2.5rem]">
 {prod.name ?? ""}
 </h3>
 </Link>

 <div className="flex items-center gap-2 mt-2">
 <Rating value={prod.rating ?? 0} size={11} showText={true} />
 </div>

 <div className="flex items-baseline gap-2 mt-3">
 <span className="text-sm font-bold text-stone-900 font-mono">
 {formatPKR(discountPrice)}
 </span>
 {discount > 0 && (
 <span className="text-xs text-stone-400 line-through font-mono">
 {formatPKR(price)}
 </span>
 )}
 </div>

 {/* Move to cart button — always at bottom */}
 <div className="mt-auto pt-4">
 <button
 onClick={(e) => handleMoveToCart(e, prod)}
 disabled={isOutOfStock}
 className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${
 isOutOfStock
 ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
 : "bg-stone-950 text-white hover:bg-stone-800 cursor-pointer"
 }`}
 >
 <ShoppingBag className="w-3.5 h-3.5" />
 Move to Bag
 </button>
 </div>
 </div>
 </motion.div>
 );
 })}
 </AnimatePresence>
 </div>
 ) : (
 <div className="bg-white rounded-3xl border border-stone-100 max-w-xl mx-auto my-8 shadow-sm overflow-hidden">
   <EmptyState
     variant="wishlist"
     title="Your wishlist is empty"
     description="Tap the heart icon on any piece in the boutique to save it here for later."
     action={{ label: "Discover Boutique Items", to: "/shop" }}
   />
 </div>
 )}
 </div>
 </div>
 );
}
