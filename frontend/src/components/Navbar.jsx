import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
 ShoppingBag, Heart, Search, Menu, X, Sparkles, LogOut,
 Settings, ClipboardList, Shield, LogIn, UserPlus, ChevronRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";

export default function Navbar() {
 const navigate = useNavigate();
 const { getCartCount } = useCart();
 const { wishlistItems } = useWishlist();
 const { isAuthenticated, user, logout } = useAuth();
 const { showToast } = useToast();
 const { settings } = useSettings();

 const brandParts = (name = "") => {
  const words = (name || "MAISON SAC").trim().split(/\s+/);
  return words.length > 1
   ? { main: words.slice(0, -1).join(" "), accent: words[words.length - 1] }
   : { main: words[0], accent: "" };
 };
 const { main: brandMain, accent: brandAccent } = brandParts(settings.storeName);

 const [searchOpen, setSearchOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
 const dropdownRef = useRef(null);

 const cartCount = getCartCount();
 const wishlistCount = wishlistItems.length;

 useEffect(() => {
  function handleClickOutside(event) {
   if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    setAccountDropdownOpen(false);
   }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleSearchSubmit = (e) => {
  e.preventDefault();
  if (!searchQuery.trim()) return;
  navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
  setSearchQuery("");
  setSearchOpen(false);
 };

 const handleLogoutClick = async () => {
  await logout();
  setAccountDropdownOpen(false);
  showToast("Successfully signed out. Have a nice day!", "success");
  navigate("/");
 };

 const standardLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
 ];

 const getUserInitials = () => {
  if (!user?.fullName) return "M";
  return user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
 };

 return (
  <>
   {/* ── Announcement Bar ─────────────────────────────────────────────────────── */}
   {settings.announcementEnabled !== false && (
    <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 py-2.5 px-4 flex items-center justify-center gap-2.5">
     <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0 animate-pulse" />
     <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-stone-300">
      {settings.announcementBar || "Free Priority Shipping On Orders Over PKR 15,000 · 15% Welcome Discount"}
     </span>
     <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0 animate-pulse" />
    </div>
   )}

   {/* ── Main Header ──────────────────────────────────────────────────────────── */}
   <header className="sticky top-0 z-40 bg-white/96 backdrop-blur-xl border-b border-stone-100 shadow-[0_2px_28px_rgba(0,0,0,0.08)] transition-all duration-300">

    {/* Amber top accent line */}
    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/65 to-transparent pointer-events-none" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] sm:h-[76px] flex items-center justify-between gap-6">

     {/* ── Left: Hamburger + Brand ── */}
     <div className="flex items-center gap-3 flex-shrink-0">
      <button
       onClick={() => setMobileMenuOpen(true)}
       className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200 md:hidden"
       aria-label="Open menu"
      >
       <Menu className="w-5 h-5" />
      </button>

      <Link to="/" className="flex items-baseline gap-2 group select-none">
       {settings.logoMain ? (
        <img src={settings.logoMain} alt={settings.storeName} className="h-8 object-contain" />
       ) : (
        <>
         <span className="font-sans font-black text-xl sm:text-[1.5rem] tracking-tight text-stone-950 group-hover:text-amber-600 transition-colors duration-200 leading-none">
          {brandMain}
         </span>
         {brandAccent && (
          <>
           <span className="text-amber-400/50 font-mono text-[0.5rem] font-black leading-none select-none">◆</span>
           <span className="text-amber-500 font-mono text-[0.62rem] font-black tracking-[0.24em] uppercase leading-none pb-0.5">
            {brandAccent}
           </span>
          </>
         )}
        </>
       )}
      </Link>
     </div>

     {/* ── Center: Nav Links with diamond separators ── */}
     <nav className="hidden md:flex items-center">
      {standardLinks.map((link, index) => (
       <div key={link.to} className="flex items-center">
        {index > 0 && (
         <span className="text-amber-400/35 font-mono text-[9px] font-black px-1 select-none leading-none">◆</span>
        )}
        <NavLink
         to={link.to}
         className="group relative px-3.5 py-2.5 rounded-xl transition-colors duration-200 hover:bg-stone-50/80"
        >
         {({ isActive }) => (
          <>
           <span className={`block text-[11px] font-black tracking-[0.14em] uppercase transition-colors duration-200 ${
            isActive ? "text-amber-600" : "text-stone-500 group-hover:text-stone-800"
           }`}>
            {link.label}
           </span>
           <span className={`absolute bottom-[5px] left-3.5 right-3.5 h-[2.5px] rounded-full transition-all duration-300 ${
            isActive
             ? "bg-amber-500 opacity-100"
             : "bg-stone-200 opacity-0 group-hover:opacity-100"
           }`} />
          </>
         )}
        </NavLink>
       </div>
      ))}
     </nav>

     {/* ── Right: Action cluster ── */}
     <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">

      {/* Search */}
      <button
       onClick={() => setSearchOpen(!searchOpen)}
       className={`p-2.5 rounded-xl transition-all duration-200 ${
        searchOpen
         ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200/80"
         : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
       }`}
       aria-label="Toggle search"
      >
       <Search className="w-[18px] h-[18px]" />
      </button>

      {/* Wishlist */}
      <Link
       to="/wishlist"
       className="group relative p-2.5 rounded-xl text-stone-500 hover:text-rose-500 hover:bg-rose-50/80 transition-all duration-200"
       aria-label="Wishlist"
      >
       <Heart className="w-[18px] h-[18px] group-hover:fill-rose-100 transition-all duration-200" />
       {wishlistCount > 0 && (
        <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white font-mono text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
         {wishlistCount > 9 ? "9+" : wishlistCount}
        </span>
       )}
      </Link>

      {/* Thin vertical divider */}
      <div className="hidden sm:block h-6 w-px bg-stone-200 mx-0.5 flex-shrink-0" />

      {/* Cart */}
      <Link
       to="/cart"
       className="group relative flex items-center gap-2 px-3.5 py-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl transition-all duration-300 border border-stone-800 hover:border-amber-600/40 shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
       aria-label="Cart"
      >
       <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
       <span className="hidden sm:inline text-[10px] font-black tracking-widest uppercase">Bag</span>
       <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full font-mono text-[9px] font-extrabold px-1.5 transition-colors ${
        cartCount > 0 ? "bg-amber-500 text-stone-950" : "bg-stone-800 text-stone-500"
       }`}>
        {cartCount}
       </span>
      </Link>

      {/* Auth — Avatar or Sign In / Register */}
      <div className="relative" ref={dropdownRef}>
       {isAuthenticated ? (
        <button
         onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
         className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-xs uppercase shadow-sm transition-all duration-200 ring-2 ${
          accountDropdownOpen ? "ring-amber-400/60 bg-amber-500" : "ring-transparent hover:ring-amber-400/40"
         }`}
        >
         {getUserInitials()}
        </button>
       ) : (
        <div className="hidden sm:flex items-center gap-2">
         <Link
          to="/login"
          className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-stone-600 hover:text-stone-900 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all duration-200"
         >
          <LogIn className="w-3.5 h-3.5" />
          Sign In
         </Link>
         <Link
          to="/register"
          className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-[0_4px_16px_rgba(217,119,6,0.3)] transition-all duration-200"
         >
          <UserPlus className="w-3.5 h-3.5" />
          Register
         </Link>
        </div>
       )}

       {/* Mobile sign-in icon */}
       {!isAuthenticated && (
        <Link
         to="/login"
         className="sm:hidden p-2.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
         aria-label="Sign In"
        >
         <LogIn className="w-[18px] h-[18px]" />
        </Link>
       )}

       {/* Account Dropdown */}
       <AnimatePresence>
        {accountDropdownOpen && isAuthenticated && user && (
         <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 mt-2.5 w-64 bg-white border border-stone-100 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.13)] z-50 overflow-hidden"
         >
          {/* Profile header */}
          <div className="px-4 py-3.5 bg-gradient-to-br from-stone-50 to-white border-b border-stone-100">
           <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm">
             {getUserInitials()}
            </div>
            <div className="min-w-0 flex-1">
             <div className="font-bold text-xs text-stone-900 truncate leading-snug">{user.fullName}</div>
             <div className="text-[10px] text-stone-400 truncate mt-0.5">{user.email}</div>
            </div>
           </div>
           <div className="mt-2.5">
            <span className={`inline-flex items-center gap-1 font-mono text-[8px] font-black tracking-[0.15em] uppercase px-2 py-0.5 rounded-full ${
             user.role === "admin"
              ? "bg-amber-500/15 text-amber-700 border border-amber-500/30"
              : "bg-stone-100 text-stone-500 border border-stone-200"
            }`}>
             {user.role === "admin" ? "◆ Admin" : "◆ Member"}
            </span>
           </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5 space-y-0.5">
           {user.role === "admin" && (
            <Link
             to="/admin/dashboard"
             onClick={() => setAccountDropdownOpen(false)}
             className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-amber-700 hover:bg-amber-50 font-bold text-xs transition-all duration-150"
            >
             <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
             <span className="flex-1">Admin Dashboard</span>
             <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
            </Link>
           )}
           <Link
            to="/orders"
            onClick={() => setAccountDropdownOpen(false)}
            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-all duration-150"
           >
            <ClipboardList className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span className="flex-1">My Orders</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-stone-300" />
           </Link>
           <Link
            to="/account"
            onClick={() => setAccountDropdownOpen(false)}
            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-all duration-150"
           >
            <Settings className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span className="flex-1">Profile Settings</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-stone-300" />
           </Link>
          </div>

          {/* Sign out */}
          <div className="p-1.5 border-t border-stone-100">
           <button
            onClick={handleLogoutClick}
            className="group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all duration-150 text-left"
           >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1">Sign Out</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-rose-300" />
           </button>
          </div>
         </motion.div>
        )}
       </AnimatePresence>
      </div>
     </div>
    </div>

    {/* ── Search Panel ───────────────────────────────────────────────────────── */}
    <AnimatePresence>
     {searchOpen && (
      <motion.div
       initial={{ height: 0, opacity: 0 }}
       animate={{ height: "auto", opacity: 1 }}
       exit={{ height: 0, opacity: 0 }}
       transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
       className="overflow-hidden border-t border-stone-100 bg-stone-50/60"
      >
       <form
        onSubmit={handleSearchSubmit}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3"
       >
        <Search className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <input
         type="text"
         placeholder="Search bags, wallets, leather goods, collections…"
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
         className="w-full bg-transparent border-none text-stone-800 placeholder-stone-300 font-medium outline-none text-sm py-1"
         autoFocus
        />
        {searchQuery && (
         <button
          type="button"
          onClick={() => setSearchQuery("")}
          className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-600 flex-shrink-0 transition-colors"
         >
          <X className="w-3.5 h-3.5" />
         </button>
        )}
        <button
         type="submit"
         className="flex-shrink-0 bg-stone-950 hover:bg-amber-600 text-white text-[10px] font-black px-4 py-2 rounded-xl tracking-widest uppercase transition-all duration-200 shadow-sm hover:shadow-[0_4px_16px_rgba(217,119,6,0.3)]"
        >
         Search
        </button>
       </form>
      </motion.div>
     )}
    </AnimatePresence>
   </header>

   {/* ── Mobile Drawer ────────────────────────────────────────────────────────── */}
   <AnimatePresence>
    {mobileMenuOpen && (
     <>
      <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       onClick={() => setMobileMenuOpen(false)}
       className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm"
      />
      <motion.div
       initial={{ x: "-100%" }}
       animate={{ x: 0 }}
       exit={{ x: "-100%" }}
       transition={{ type: "spring", damping: 28, stiffness: 240 }}
       className="fixed inset-y-0 left-0 max-w-[300px] w-full z-50 bg-white shadow-2xl flex flex-col"
      >
       {/* Top amber accent on mobile drawer */}
       <div className="h-[2px] bg-gradient-to-r from-amber-500/80 via-amber-400 to-amber-500/80 flex-shrink-0" />

       {/* Drawer header */}
       <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 flex-shrink-0">
        <div className="flex items-baseline gap-2">
         {settings.logoMain ? (
          <img src={settings.logoMain} alt={settings.storeName} className="h-7 object-contain" />
         ) : (
          <>
           <span className="font-sans font-black text-xl tracking-tight text-stone-950">{brandMain}</span>
           {brandAccent && (
            <>
             <span className="text-amber-400/50 font-mono text-[0.45rem] font-black leading-none">◆</span>
             <span className="text-amber-500 font-mono text-[0.55rem] font-black tracking-[0.24em] uppercase">{brandAccent}</span>
            </>
           )}
          </>
         )}
        </div>
        <button
         onClick={() => setMobileMenuOpen(false)}
         className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
        >
         <X className="w-5 h-5" />
        </button>
       </div>

       {/* Drawer nav links */}
       <nav className="flex flex-col px-3 pt-4 pb-2 gap-0.5 flex-shrink-0">
        {standardLinks.map((link) => (
         <NavLink
          key={link.to}
          to={link.to}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
           `relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-[11px] font-black tracking-[0.1em] uppercase transition-all duration-200 ${
            isActive
             ? "bg-amber-50 text-amber-700 border border-amber-200/60"
             : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
           }`
          }
         >
          {({ isActive }) => (
           <>
            <span className={`w-1 h-3.5 rounded-full flex-shrink-0 transition-all duration-200 ${
             isActive ? "bg-amber-500" : "bg-stone-200"
            }`} />
            {link.label}
           </>
          )}
         </NavLink>
        ))}
        {isAuthenticated && user?.role === "admin" && (
         <NavLink
          to="/admin/dashboard"
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
           `flex items-center gap-3 px-3.5 py-3 rounded-xl text-[11px] font-black tracking-[0.1em] uppercase transition-all duration-200 mt-1 border-t border-stone-100 pt-3 ${
            isActive ? "text-amber-700" : "text-amber-600 hover:bg-amber-50"
           }`
          }
         >
          <Shield className="w-4 h-4 flex-shrink-0" />
          Admin Panel
         </NavLink>
        )}
       </nav>

       {/* Wishlist quick link */}
       <div className="px-3 pb-3 flex-shrink-0">
        <Link
         to="/wishlist"
         onClick={() => setMobileMenuOpen(false)}
         className="group flex items-center justify-between px-3.5 py-3 rounded-xl bg-stone-50 hover:bg-rose-50 border border-stone-100 hover:border-rose-100 transition-all duration-200"
        >
         <span className="flex items-center gap-2.5 text-[11px] font-bold tracking-wide text-stone-500 group-hover:text-rose-600 uppercase transition-colors">
          <Heart className="w-4 h-4 text-rose-400 group-hover:fill-rose-100 transition-all duration-200" />
          My Wishlist
         </span>
         {wishlistCount > 0 ? (
          <span className="bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">
           {wishlistCount}
          </span>
         ) : (
          <span className="text-[9px] font-bold text-stone-300 font-mono">0</span>
         )}
        </Link>
       </div>

       {/* Bottom auth section */}
       <div className="mt-auto px-3 py-4 border-t border-stone-100 flex flex-col gap-2 flex-shrink-0">
        {!isAuthenticated ? (
         <>
          <Link
           to="/register"
           onClick={() => setMobileMenuOpen(false)}
           className="flex items-center justify-center gap-2 text-[11px] font-black tracking-widest uppercase text-stone-950 bg-amber-500 hover:bg-amber-400 py-3.5 rounded-xl shadow-sm hover:shadow-[0_4px_16px_rgba(217,119,6,0.3)] transition-all duration-200"
          >
           <UserPlus className="w-4 h-4" />
           Create Account
          </Link>
          <Link
           to="/login"
           onClick={() => setMobileMenuOpen(false)}
           className="flex items-center justify-center gap-2 text-[11px] font-black tracking-widest uppercase text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400 py-3.5 rounded-xl transition-all duration-200"
          >
           <LogIn className="w-4 h-4" />
           Sign In
          </Link>
         </>
        ) : (
         <>
          <div className="flex items-center gap-3 px-3.5 py-3 bg-stone-50 rounded-xl border border-stone-100 mb-0.5">
           <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
            {getUserInitials()}
           </div>
           <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-stone-900 truncate leading-snug">{user.fullName}</p>
            <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
           </div>
          </div>
          <Link
           to="/orders"
           onClick={() => setMobileMenuOpen(false)}
           className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-100 text-xs font-bold text-stone-700 transition-colors group"
          >
           <ClipboardList className="w-4 h-4 text-stone-400" />
           <span className="flex-1">My Orders</span>
           <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 transition-colors" />
          </Link>
          <Link
           to="/account"
           onClick={() => setMobileMenuOpen(false)}
           className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-100 text-xs font-bold text-stone-700 transition-colors group"
          >
           <Settings className="w-4 h-4 text-stone-400" />
           <span className="flex-1">Profile Settings</span>
           <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 transition-colors" />
          </Link>
          <button
           onClick={handleLogoutClick}
           className="flex items-center justify-center gap-2 text-[11px] font-black tracking-widest uppercase text-white bg-rose-500 hover:bg-rose-600 py-3.5 rounded-xl transition-colors mt-1 shadow-sm"
          >
           <LogOut className="w-4 h-4" />
           Sign Out
          </button>
         </>
        )}
        <p className="text-[9px] text-stone-300 font-medium text-center tracking-wider mt-1">
         © {new Date().getFullYear()} {settings.storeName}
        </p>
       </div>
      </motion.div>
     </>
    )}
   </AnimatePresence>
  </>
 );
}
