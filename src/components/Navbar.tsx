import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Admin Portal", to: "/admin" },
  ];

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-stone-950 text-white py-2 px-4 text-center text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Free Priority Shipping On Orders Over $150 • Enjoy 15% Welcome Discount</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* LEFT: LOGO & MOBILE TOGGLE */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-baseline gap-1 group">
              <span className="font-sans font-extrabold text-lg sm:text-2xl tracking-tight text-stone-950 group-hover:text-amber-600 transition-colors">
                MAISON
              </span>
              <span className="text-amber-500 font-mono text-xs font-semibold tracking-widest uppercase">
                SAC
              </span>
            </Link>
          </div>

          {/* CENTER: DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-xs lg:text-sm font-semibold tracking-widest uppercase transition-all duration-300 border-b-2 py-1.5 ${
                    isActive
                      ? "border-amber-500 text-stone-950"
                      : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-200"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: ACTIONS (SEARCH, WISHLIST, CART) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-all duration-300"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-all duration-300 relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-stone-950 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="p-2 sm:px-3 sm:py-2 bg-stone-950 hover:bg-stone-850 text-stone-100 hover:text-white rounded-full sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 relative border border-stone-900 shadow-md"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-xs font-bold tracking-widest uppercase text-white">
                Bag
              </span>
              <span className="bg-white text-stone-950 font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-stone-800">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* SEARCH BAR PANEL DROPDOWN */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-stone-50 border-b border-stone-200"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3"
              >
                <Search className="w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search bags, leather wallets, materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-stone-800 placeholder-stone-400 font-sans font-medium outline-none text-sm py-1.5"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded-full hover:bg-stone-200 text-stone-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-lg font-mono tracking-wider uppercase transition-colors"
                >
                  Go
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE NAV MENU SCREEN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs"
            />

            {/* Menu container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full z-50 bg-white shadow-2xl p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header close block */}
                <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans font-extrabold text-xl tracking-tight text-stone-950">
                      MAISON
                    </span>
                    <span className="text-amber-500 font-mono text-xxs font-bold tracking-widest uppercase">
                      SAC
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-6 pt-8">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `text-sm font-bold tracking-widest uppercase py-1 transition-colors ${
                          isActive
                            ? "text-amber-600"
                            : "text-stone-700 hover:text-stone-950"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Bottom announcement/wishlist shortcut inside mobile drawer */}
              <div className="pt-6 border-t border-stone-100 flex flex-col gap-4">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    My Wishlist
                  </span>
                  <span className="bg-stone-200 text-stone-800 text-xxs font-bold px-2 py-0.5 rounded-full font-mono">
                    {wishlistCount}
                  </span>
                </Link>

                <p className="text-xxs text-stone-400 font-medium">
                  © {new Date().getFullYear()} Maison de Sac Luxury Products. All
                  rights reserved. Premium custom design.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
