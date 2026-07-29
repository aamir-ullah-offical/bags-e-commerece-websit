import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
 LayoutDashboard,
 ShoppingBag,
 FolderOpen,
 Sliders,
 Image,
 Star,
 Mail,
 MapPin,
 FileText,
 Palette,
 Settings,
 User,
 Users,
 ShoppingCart,
 Tag,
 LogOut,
 Menu,
 ChevronLeft,
 ChevronRight,
 Sparkles,
 Bell,
 Check,
 Search as SearchIcon,
 Plus,
} from "lucide-react";

import { productService } from "../services/productService";
import { adminService } from "../services/adminService";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

import AnalyticsCharts from "../dashboard/components/AnalyticsCharts";
import ProductsTab from "../dashboard/components/ProductsTab";
import BannersTab from "../dashboard/components/BannersTab";
import GeneralTabs from "../dashboard/components/GeneralTabs";
import SettingsTabs from "../dashboard/components/SettingsTabs";
import OrdersTab from "../dashboard/components/OrdersTab";
import UsersTab from "../dashboard/components/UsersTab";
import CouponsTab from "../dashboard/components/CouponsTab";

export default function AdminDashboard() {
 const { logout } = useAuth();
 const { showToast } = useToast();
 const navigate = useNavigate();

 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
 const [activeTab, setActiveTab] = useState("dashboard");

 const [products, setProducts] = useState([]);
 const [categories, setCategories] = useState([]);
 const [banners, setBanners] = useState([]);
 const [testimonials, setTestimonials] = useState([]);

 const [contactInfo, setContactInfo] = useState({ phone: "", email: "", address: "", mapUrl: "", workingHours: "" });
 const [webSettings, setWebSettings] = useState({
  storeName: "", storeTagline: "", contactEmail: "", contactPhone: "", storeAddress: "",
  footerText: "", socialFacebook: "", socialInstagram: "", socialLinkedin: "",
  announcementBar: "", announcementEnabled: true,
 });
 const [appearance, setAppearance] = useState({
 primaryColor: "", secondaryColor: "", accentColor: "", buttonStyle: "", borderRadius: "", headingFont: "", bodyFont: "", logoMain: "", logoFooter: "", favicon: ""
 });
 const [staticPages, setStaticPages] = useState({});
 const [adminProfile, setAdminProfile] = useState({ profileImage: "", fullName: "", email: "" });
 const [mediaLibrary, setMediaLibrary] = useState([]);
 const [subscribers, setSubscribers] = useState([]);
 const [dashboardStats, setDashboardStats] = useState(null);

 const [showNotifications, setShowNotifications] = useState(false);
 const [showProfileMenu, setShowProfileMenu] = useState(false);

 const [autoOpenAddProduct, setAutoOpenAddProduct] = useState(false);
 const [autoOpenAddCategory, setAutoOpenAddCategory] = useState(false);
 const [autoOpenAddReview, setAutoOpenAddReview] = useState(false);

 const [searchQuery, setSearchQuery] = useState("");
 const [showSearchResults, setShowSearchResults] = useState(false);
 const searchContainerRef = useRef(null);

 const [notifications, setNotifications] = useState([
 { id: 1, text: "New priority subscriber: takashi.sato@ginza-carry.jp", time: "3 mins ago", read: false },
 { id: 2, text: "Product out of stock alert: Red Leather Purse SKU-001", time: "1 hour ago", read: false },
 { id: 3, text: "Gabrielle Royer posted a new 5-star product review", time: "4 hours ago", read: true },
 { id: 4, text: "System security backup verified successfully", time: "22 hours ago", read: true }
 ]);

 useEffect(() => {
 function handleClickOutside(event) {
 if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
 setShowSearchResults(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const triggerToast = (msg, type = "success") => {
 showToast(msg, type === "success" ? "success" : "info");
 };

 useEffect(() => {
 const fetchData = async () => {
 try {
 const [
 productsData,
 categoriesData,
 bannersData,
 testimonialsData,
 contactInfoData,
 webSettingsData,
 appearanceData,
 staticPagesData,
 adminProfileData,
 mediaLibraryData,
 subscribersData,
 dashboardStatsData,
 ] = await Promise.all([
 productService.getProducts(),
 productService.getCategories(),
 productService.getBanners(),
 productService.getTestimonials(),
 adminService.getContactInfo(),
 adminService.getWebsiteSettings(),
 adminService.getAppearanceSettings(),
 adminService.getStaticPages(),
 adminService.getAdminProfile(),
 adminService.getMediaLibrary(),
 adminService.getSubscribers(),
 adminService.getDashboardStats().catch(() => null),
 ]);

 setProducts(productsData);
 setCategories(categoriesData);
 setBanners(bannersData);
 setTestimonials(testimonialsData);
 setContactInfo(contactInfoData);
 setWebSettings(webSettingsData);
 setAppearance(appearanceData);
 setStaticPages(staticPagesData);
 setAdminProfile(adminProfileData);
 setMediaLibrary(mediaLibraryData);
 setSubscribers(subscribersData);
 if (dashboardStatsData) setDashboardStats(dashboardStatsData);

 triggerToast(`Concierge security clearance granted. Welcome, ${adminProfileData?.fullName || "Administrator"}.`, "success");
 } catch (err) {
 console.error("Failed to load dashboard data", err);
 triggerToast("Error loading dashboard data.", "error");
 }
 };
 fetchData();
 }, []);

 const handleSaveProductsList = async (newList) => {
 setProducts(newList);
 try {
 const newItems = newList.filter((p) => !p._id);
 const keptIds = new Set(newList.filter((p) => p._id).map((p) => String(p._id)));
 const deletedItems = products.filter((p) => p._id && !keptIds.has(String(p._id)));
 const updatedItems = newList.filter((p) => p._id);
 await Promise.all([
 ...newItems.map((p) => adminService.createProduct(p)),
 ...deletedItems.map((p) => adminService.deleteProduct(p._id)),
 ...updatedItems.map((p) => adminService.updateProduct(p._id, p)),
 ]);
 const fresh = await productService.queryProducts({ limit: 100 });
 setProducts(Array.isArray(fresh) ? fresh : fresh.products || fresh);
 } catch (err) {
 console.error("Product sync error", err);
 }
 };

 const handleSaveCategoriesList = async (newList) => {
 setCategories(newList);
 try {
 const newItems = newList.filter((c) => !c._id);
 const keptIds = new Set(newList.filter((c) => c._id).map((c) => String(c._id)));
 const deletedItems = categories.filter((c) => c._id && !keptIds.has(String(c._id)));
 const updatedItems = newList.filter((c) => c._id);
 await Promise.all([
 ...newItems.map((c) => adminService.createCategory(c)),
 ...deletedItems.map((c) => adminService.deleteCategory(c._id)),
 ...updatedItems.map((c) => adminService.updateCategory(c._id, c)),
 ]);
 const fresh = await productService.getCategories();
 setCategories(Array.isArray(fresh) ? fresh : fresh.categories || fresh);
 } catch (err) {
 console.error("Category sync error", err);
 }
 };

 const handleSaveBannersList = async (newList) => {
 setBanners(newList);
 try {
 const newItems = newList.filter((b) => !b._id);
 const keptIds = new Set(newList.filter((b) => b._id).map((b) => String(b._id)));
 const deletedItems = banners.filter((b) => b._id && !keptIds.has(String(b._id)));
 const updatedItems = newList.filter((b) => b._id);
 await Promise.all([
 ...newItems.map((b) => adminService.createBanner(b)),
 ...deletedItems.map((b) => adminService.deleteBanner(b._id)),
 ...updatedItems.map((b) => adminService.updateBanner(b._id, b)),
 ]);
 const fresh = await productService.getBanners();
 setBanners(Array.isArray(fresh) ? fresh : fresh.banners || fresh);
 } catch (err) {
 console.error("Banner sync error", err);
 }
 };

 const handleSaveTestimonialsList = async (newList) => {
 setTestimonials(newList);
 try {
 const newItems = newList.filter((t) => !t._id);
 const keptIds = new Set(newList.filter((t) => t._id).map((t) => String(t._id)));
 const deletedItems = testimonials.filter((t) => t._id && !keptIds.has(String(t._id)));
 const updatedItems = newList.filter((t) => t._id);
 await Promise.all([
 ...newItems.map((t) => adminService.createTestimonial(t)),
 ...deletedItems.map((t) => adminService.deleteTestimonial(t._id)),
 ...updatedItems.map((t) => adminService.updateTestimonial(t._id, t)),
 ]);
 const fresh = await productService.getTestimonials();
 setTestimonials(Array.isArray(fresh) ? fresh : fresh.testimonials || fresh);
 } catch (err) {
 console.error("Testimonial sync error", err);
 }
 };

 const handleSaveContactInfo = async (data) => {
 await adminService.saveContactInfo(data);
 setContactInfo(data);
 };

 const handleSaveWebSettings = async (data) => {
 await adminService.saveWebsiteSettings(data);
 setWebSettings(data);
 };

 const handleSaveAppearanceSettings = async (data) => {
 await adminService.saveAppearanceSettings(data);
 setAppearance(data);
 };

 const handleSaveStaticPages = async (data) => {
 await adminService.saveStaticPages(data);
 setStaticPages(data);
 };

 const handleSaveAdminProfile = async (data) => {
 await adminService.saveAdminProfile(data);
 setAdminProfile(data);
 };

 const handleSaveMediaLibrary = async (list) => {
 await adminService.saveMediaLibrary(list);
 setMediaLibrary(list);
 };

 const handleSaveSubscribers = async (newList) => {
 setSubscribers(newList);
 try {
 const removedIds = new Set(newList.map((s) => String(s._id || s.id)));
 const removed = subscribers.filter((s) => !removedIds.has(String(s._id || s.id)));
 await Promise.all(removed.map((s) => adminService.unsubscribeEmail(s.email)));
 } catch (err) {
 console.error("Subscriber sync error", err);
 }
 };

 const refreshProducts = async () => {
 try {
 const fresh = await productService.queryProducts({ limit: 100 });
 setProducts(Array.isArray(fresh) ? fresh : fresh.products || fresh);
 } catch (err) {
 console.error("Failed to refresh products", err);
 }
};

 const handleLogout = () => {
 logout();
 triggerToast("Supervised session terminated. Returning to storefront.", "info");
 navigate("/");
 };

 const handleMarkAllNotificationsRead = () => {
 setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
 triggerToast("All notifications marked as read.", "success");
 };

 const countFeatured = products.filter((p) => p.isFeatured).length;
 const countTopPicks = products.filter((p) => p.isTopPick).length;
 const countTopSelling = products.filter((p) => p.isTopSelling).length;

 const sidebarMenu = [
 { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
 { id: "orders", label: "Orders Management", icon: ShoppingCart },
 { id: "users", label: "Customers & Users", icon: Users },
 { id: "products", label: "Product Catalog", icon: ShoppingBag },
 { id: "categories", label: "Category Hierarchy", icon: FolderOpen },
 { id: "coupons", label: "Coupons & Discounts", icon: Tag },
 { id: "homepage", label: "Homepage Selections", icon: Sliders },
 { id: "banners", label: "Hero & Promo Banners", icon: Image },
 { id: "reviews", label: "Public Reviews", icon: Star },
 { id: "newsletter", label: "Newsletter Base", icon: Mail },
 { id: "contact", label: "Atelier Coordinates", icon: MapPin },
 { id: "pages", label: "Static Pages Policy", icon: FileText },
 { id: "media", label: "Media Library Gallery", icon: Image },
 { id: "appearance", label: "Appearance Styles", icon: Palette },
 { id: "web", label: "Website Settings", icon: Settings },
 { id: "profile", label: "My Profile Admin", icon: User },
 ];

 const getSearchResults = () => {
 if (!searchQuery.trim()) return [];

 const query = searchQuery.toLowerCase().trim();
 const results = [];

 products.forEach((p) => {
 if (p.name.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query)) {
 results.push({ type: "Product", title: p.name, subtitle: `Price: Rs. ${(p.price || 0).toLocaleString("en-PK")} | SKU: ${p.sku || ""}`, tab: "products" });
 }
 });

 categories.forEach((c) => {
 if (c.name.toLowerCase().includes(query)) {
 results.push({ type: "Category", title: c.name, subtitle: `Category: ${c.count || 0} products linked`, tab: "categories" });
 }
 });

 testimonials.forEach((t) => {
 if (t.comment.toLowerCase().includes(query) || t.name.toLowerCase().includes(query)) {
 results.push({ type: "Review", title: `Review by ${t.name}`, subtitle: t.comment, tab: "reviews" });
 }
 });

 Object.entries(staticPages).forEach(([key, page]) => {
 const p = page;
 if (p.seoTitle?.toLowerCase().includes(query) || p.content?.toLowerCase().includes(query)) {
 results.push({ type: "Page", title: p.seoTitle, subtitle: `Page Module: /about, /policy`, tab: "pages" });
 }
 });

 return results.slice(0, 7);
 };

 const results = getSearchResults();

 return (
 <div className="h-screen overflow-hidden flex bg-stone-50 text-stone-850 font-sans antialiased transition-colors duration-300" id="admin-dashboard-container">

 <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
 <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-stone-500/5 blur-3xl rounded-full pointer-events-none" />

 {mobileSidebarOpen && (
 <div
 onClick={() => setMobileSidebarOpen(false)}
 className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-40 lg:hidden"
 />
 )}

 {/* ================= SIDEBAR ================= */}
 <aside
 className={`h-full bg-white border-r border-stone-200 flex flex-col justify-between transition-all duration-300 z-50 flex-shrink-0 fixed lg:static inset-y-0 left-0 ${
 mobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
 } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}
 >
 <div className="flex flex-col h-full overflow-hidden">
 <div className="h-20 border-b border-stone-200 px-5 flex items-center justify-between flex-shrink-0">
 {(!sidebarCollapsed || mobileSidebarOpen) ? (
 <div className="flex items-baseline gap-1.5 animate-fadeIn">
 <span className="font-sans font-black text-stone-900 text-lg tracking-wider">
 MDS ATELIER
 </span>
 <span className="text-amber-500 font-mono text-[8px] font-extrabold tracking-widest uppercase">
 ADMIN
 </span>
 </div>
 ) : (
 <span className="text-amber-500 font-serif text-lg font-black mx-auto">M</span>
 )}
 <button
 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
 className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors hidden lg:block"
 title="Collapse Panel"
 >
 {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
 </button>
 </div>

 {(!sidebarCollapsed || mobileSidebarOpen) && (
 <div className="px-5 py-4 border-b border-stone-200 flex items-center gap-3 bg-stone-50/50 flex-shrink-0">
 <img
 src={adminProfile.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80"}
 alt=""
 className="w-10 h-10 rounded-full object-cover border border-stone-250 shadow-sm flex-shrink-0"
 />
 <div className="flex flex-col min-w-0">
 <span className="text-xs font-bold text-stone-800 font-sans tracking-wide truncate">{adminProfile.fullName}</span>
 <span className="text-[10px] text-stone-550 font-medium font-mono uppercase tracking-widest mt-0.5">Brand Supervisor</span>
 </div>
 </div>
 )}

 <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
 {sidebarMenu.map((item) => {
 const IconComp = item.icon;
 const isActive = activeTab === item.id;
 return (
 <button
 key={item.id}
 onClick={() => {
 setActiveTab(item.id);
 setMobileSidebarOpen(false);
 }}
 className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
 isActive
 ? "bg-amber-600 text-stone-950 font-extrabold shadow-md shadow-amber-600/10"
 : "text-stone-650 hover:bg-stone-100 hover:text-stone-900"
 }`}
 title={item.label}
 >
 <IconComp className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-stone-950" : "text-stone-400"}`} />
 {(!sidebarCollapsed || mobileSidebarOpen) && (
 <span className="truncate">{item.label}</span>
 )}
 </button>
 );
 })}
 </nav>

 <div className="p-3 border-t border-stone-200 flex-shrink-0">
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-rose-50 text-stone-600 hover:text-rose-600 text-xs font-bold transition-all"
 title="Sign Out Supervisor"
 >
 <LogOut className="w-4 h-4 text-rose-500 flex-shrink-0" />
 {(!sidebarCollapsed || mobileSidebarOpen) && <span>Log out secure session</span>}
 </button>
 </div>
 </div>
 </aside>

 {/* ================= MAIN CONTENT ================= */}
 <div className="flex-1 flex flex-col min-w-0 h-full relative" id="main-admin-viewport">

 <header className="h-20 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-30 shadow-sm relative transition-colors duration-300">

 <div className="flex items-center gap-3">
 <button
 onClick={() => setMobileSidebarOpen(true)}
 className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 lg:hidden transition-colors"
 >
 <Menu className="w-5 h-5" />
 </button>

 <span className="font-mono text-[9px] font-extrabold text-stone-500 uppercase tracking-widest bg-stone-100 border border-stone-250 px-2.5 py-1.5 rounded-lg hidden sm:inline-block">
 ADMIN PANEL
 </span>
 <div className="h-4 w-px bg-stone-200 hidden md:block" />
 <h1 className="font-sans font-black text-stone-950 text-sm tracking-wide hidden md:block uppercase">
 {sidebarMenu.find((m) => m.id === activeTab)?.label}
 </h1>
 </div>

 <div className="flex items-center gap-3">

 {/* Global Search */}
 <div className="relative" ref={searchContainerRef}>
 <div className="relative flex items-center max-w-xs md:w-60 lg:w-72 bg-stone-100 border border-stone-200 rounded-xl focus-within:border-amber-500 transition-all pr-2">
 <SearchIcon className="absolute left-3 w-4 h-4 text-stone-400" />
 <input
 type="text"
 placeholder="Universal system query..."
 className="w-full pl-8 pr-2 py-2 text-xs bg-transparent focus:outline-none placeholder-stone-400 text-stone-800 font-medium"
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setShowSearchResults(true);
 }}
 onFocus={() => setShowSearchResults(true)}
 />
 </div>

 <AnimatePresence>
 {showSearchResults && searchQuery.trim().length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 8 }}
 className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-32px)] bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-2 overflow-hidden text-xs text-stone-800"
 >
 <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono border-b border-stone-100 flex justify-between">
 <span>Matches ({results.length})</span>
 <span>Press enter</span>
 </div>

 <div className="max-h-64 overflow-y-auto p-1 space-y-0.5 mt-1 scrollbar-thin">
 {results.length === 0 ? (
 <div className="p-4 text-center text-stone-400">
 No matching records discovered.
 </div>
 ) : (
 results.map((r, i) => (
 <button
 key={i}
 onClick={() => {
 setActiveTab(r.tab);
 setSearchQuery("");
 setShowSearchResults(false);
 }}
 className="w-full text-left p-2 hover:bg-stone-50 rounded-xl transition-colors flex items-start gap-2.5"
 >
 <span className="text-[9px] uppercase tracking-wider font-extrabold font-mono text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md mt-0.5 shrink-0">
 {r.type}
 </span>
 <div className="min-w-0">
 <span className="font-bold text-stone-850 block truncate">{r.title}</span>
 {r.subtitle && <span className="text-[10px] text-stone-400 block truncate font-medium mt-0.5">{r.subtitle}</span>}
 </div>
 </button>
 ))
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Notifications */}
 <div className="relative">
 <button
 onClick={() => {
 setShowNotifications(!showNotifications);
 setShowProfileMenu(false);
 }}
 className="p-2 border border-stone-200 hover:bg-stone-150 rounded-xl text-stone-500 transition-all select-none relative"
 title="System Notifications"
 >
 <Bell className="w-4 h-4 text-stone-700" />
 {notifications.some(n => !n.read) && (
 <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
 )}
 </button>

 <AnimatePresence>
 {showNotifications && (
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 8 }}
 className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden text-stone-850"
 >
 <div className="bg-stone-50 px-4 py-3 border-b border-stone-150 flex items-center justify-between">
 <span className="font-bold text-xs">System Notifications</span>
 <button
 onClick={handleMarkAllNotificationsRead}
 className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold tracking-wide uppercase transition-colors"
 >
 Mark all read
 </button>
 </div>

 <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto scrollbar-thin">
 {notifications.map((n) => (
 <div key={n.id} className={`p-3.5 flex items-start gap-3 transition-colors ${!n.read ? "bg-amber-600/5" : ""}`}>
 <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${!n.read ? "bg-amber-500" : "bg-stone-350"}`} />
 <div className="min-w-0">
 <p className="text-xs font-semibold leading-relaxed text-stone-800">{n.text}</p>
 <span className="text-[9px] text-stone-400 font-medium block mt-1 font-mono">{n.time}</span>
 </div>
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Profile Menu */}
 <div className="relative">
 <button
 onClick={() => {
 setShowProfileMenu(!showProfileMenu);
 setShowNotifications(false);
 }}
 className="flex items-center gap-2 p-1 border border-stone-200 hover:bg-stone-150 rounded-xl transition-all"
 >
 <img
 src={adminProfile.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80"}
 alt=""
 className="w-7 h-7 rounded-lg object-cover"
 />
 <span className="text-xs font-bold text-stone-700 pr-1 hidden sm:inline-block max-w-28 truncate">{(adminProfile.fullName || "Admin").split(" ")[0]}</span>
 </button>

 <AnimatePresence>
 {showProfileMenu && (
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 8 }}
 className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-2 overflow-hidden text-xs"
 >
 <div className="px-3.5 py-3 border-b border-stone-100 bg-stone-50 rounded-xl mb-1.5">
 <span className="font-extrabold text-stone-850 block">{adminProfile.fullName}</span>
 <span className="text-[10px] text-stone-400 font-mono block mt-0.5 truncate">{adminProfile.email}</span>
 </div>

 <button
 onClick={() => {
 setActiveTab("profile");
 setShowProfileMenu(false);
 }}
 className="w-full text-left p-2.5 hover:bg-stone-50 rounded-xl font-bold text-stone-700 transition-colors flex items-center gap-2"
 >
 <User className="w-4 h-4 text-stone-400" />
 Manage Profile Admin
 </button>

 <button
 onClick={() => {
 setActiveTab("web");
 setShowProfileMenu(false);
 }}
 className="w-full text-left p-2.5 hover:bg-stone-50 rounded-xl font-bold text-stone-700 transition-colors flex items-center gap-2"
 >
 <Settings className="w-4 h-4 text-stone-400" />
 Website Settings
 </button>

 <div className="h-px bg-stone-100 my-1.5" />

 <button
 onClick={handleLogout}
 className="w-full text-left p-2.5 hover:bg-rose-50 rounded-xl font-bold text-rose-600 transition-colors flex items-center gap-2"
 >
 <LogOut className="w-4 h-4 text-rose-500" />
 Terminate Session
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </header>

 <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 scrollbar-thin">

 {/* Stats Widgets */}
 {activeTab === "dashboard" && (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="numeric-stats-widgets">
 <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between transition-colors duration-300">
 <div>
 <span className="text-stone-450 text-[9px] font-extrabold tracking-widest uppercase font-mono block">Product Inventory</span>
 <strong className="text-2xl font-serif text-stone-900 block mt-1">{dashboardStats?.stats?.totalProducts ?? products.length}</strong>
 <span className="text-[10px] text-stone-400 mt-1 block">In Stock: {products.filter((p) => p.stock > 0).length} items</span>
 </div>
 <div className="w-12 h-12 bg-amber-600/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-600/10">
 <ShoppingBag className="w-6 h-6 text-amber-500" />
 </div>
 </div>

 <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between transition-colors duration-300">
 <div>
 <span className="text-stone-450 text-[9px] font-extrabold tracking-widest uppercase font-mono block">Luxury Categories</span>
 <strong className="text-2xl font-serif text-stone-900 block mt-1">{categories.length}</strong>
 <span className="text-[10px] text-stone-400 mt-1 block">Distinct Collections</span>
 </div>
 <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-sky-500/15">
 <FolderOpen className="w-6 h-6 text-sky-500" />
 </div>
 </div>

 <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between transition-colors duration-300">
 <div>
 <span className="text-stone-450 text-[9px] font-extrabold tracking-widest uppercase font-mono block">Featured & Picks</span>
 <strong className="text-2xl font-serif text-stone-900 block mt-1">{countFeatured + countTopPicks}</strong>
 <span className="text-[10px] text-stone-400 mt-1 block">Selling: {countTopSelling} Best Sellers</span>
 </div>
 <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/15">
 <Sparkles className="w-6 h-6 text-emerald-500" />
 </div>
 </div>

 <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between transition-colors duration-300">
 <div>
 <span className="text-stone-450 text-[9px] font-extrabold tracking-widest uppercase font-mono block">Subscribers</span>
 <strong className="text-2xl font-serif text-stone-900 block mt-1">{dashboardStats?.stats?.totalOrders ?? subscribers.length}</strong>
 <span className="text-[10px] text-stone-400 mt-1 block">Revenue: ${(dashboardStats?.stats?.totalRevenue || 0).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
 </div>
 <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-rose-500/15">
 <Mail className="w-6 h-6 text-rose-500" />
 </div>
 </div>
 </div>
 )}

 {/* Active Tab Content */}
 <div className="transition-all duration-300">

 {activeTab === "dashboard" && (
 <div className="space-y-6">
 <AnalyticsCharts products={products} categories={categories} dashboardStats={dashboardStats} />

 <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-xs transition-colors duration-300">
 <div>
 <h3 className="font-sans font-bold text-stone-950 text-sm mb-1 uppercase tracking-wider">Quick supervisor Actions</h3>
 <p className="text-xs text-stone-400 font-medium">
 Admin command actions. Select a key parameters module to initiate new database records instantly.
 </p>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
 <button
 onClick={() => { setActiveTab("products"); setAutoOpenAddProduct(true); }}
 className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all flex flex-col items-center justify-center gap-2.5 text-center group active:scale-98"
 >
 <Plus className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
 <span className="text-xs font-bold text-stone-800">Add New Product</span>
 </button>

 <button
 onClick={() => { setActiveTab("categories"); setAutoOpenAddCategory(true); }}
 className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all flex flex-col items-center justify-center gap-2.5 text-center group active:scale-98"
 >
 <Plus className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
 <span className="text-xs font-bold text-stone-800">Add Category</span>
 </button>

 <button
 onClick={() => setActiveTab("banners")}
 className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all flex flex-col items-center justify-center gap-2.5 text-center group active:scale-98"
 >
 <Plus className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
 <span className="text-xs font-bold text-stone-800">Manage Banners</span>
 </button>

 <button
 onClick={() => { setActiveTab("reviews"); setAutoOpenAddReview(true); }}
 className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all flex flex-col items-center justify-center gap-2.5 text-center group active:scale-98"
 >
 <Plus className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
 <span className="text-xs font-bold text-stone-800">Add Testimonial</span>
 </button>
 </div>
 </div>

 <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-850 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 blur-2xl rounded-full" />
 <div className="space-y-1 relative z-10">
 <span className="text-amber-500 font-mono text-[9px] font-extrabold tracking-widest uppercase">System Integration Center</span>
 <h3 className="font-sans font-bold text-white text-base">Atelier changes are live on the client-facing shop.</h3>
 <p className="text-xs text-stone-300">JSON structures remain prepared for direct API hookups and Express-ready routers.</p>
 </div>
 <button
 onClick={() => setActiveTab("products")}
 className="self-start md:self-auto px-5 py-2.5 bg-amber-600 text-stone-950 rounded-xl text-xs font-black transition-all hover:bg-amber-500 tracking-wide font-sans shadow-md"
 >
 Manage Products Catalog
 </button>
 </div>
 </div>
 )}

 {activeTab === "orders" && (
 <OrdersTab triggerToast={triggerToast} />
 )}

 {activeTab === "users" && (
 <UsersTab triggerToast={triggerToast} />
 )}

 {activeTab === "coupons" && (
 <CouponsTab triggerToast={triggerToast} />
 )}

 {activeTab === "products" && (
 <ProductsTab
 products={products}
 categories={categories}
 onRefreshProducts={refreshProducts}
 triggerToast={triggerToast}
 autoOpenAdd={autoOpenAddProduct}
 onClearAutoOpen={() => setAutoOpenAddProduct(false)}
 />
 )}

 {activeTab === "categories" && (
 <GeneralTabs
 subTab="categories"
 categories={categories}
 testimonials={testimonials}
 subscribers={subscribers}
 onSaveCategories={handleSaveCategoriesList}
 onSaveTestimonials={handleSaveTestimonialsList}
 onSaveSubscribers={handleSaveSubscribers}
 triggerToast={triggerToast}
 autoOpenAdd={autoOpenAddCategory}
 onClearAutoOpen={() => setAutoOpenAddCategory(false)}
 />
 )}

 {activeTab === "homepage" && (
 <div className="space-y-6">
 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs transition-colors duration-300">
 <div>
 <h3 className="font-sans font-bold text-stone-900 text-sm mb-1 uppercase tracking-wider">Homepage Carousel Selection Panel</h3>
 <p className="text-xs text-stone-400 font-medium max-w-xl">
 Toggle luxury leather articles into specific promo sequences on the public landing page.
 </p>
 </div>

 <div className="mt-6 space-y-4">
 <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono block">Top Picks Selection Row</span>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {products.map((p) => (
 <div
 key={p._id || p.name}
 className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
 p.isTopPick
 ? "bg-amber-655/5 border-amber-600/30"
 : "border-stone-200 bg-stone-50 text-stone-700"
 }`}
 >
 <div className="flex items-center gap-2 max-w-40 min-w-0">
 <img src={p.images?.[0] || ""} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
 <span className="text-xs font-bold truncate block">{p.name}</span>
 </div>
 <button
 type="button"
 onClick={async () => {
 triggerToast(`${p.name} ${!p.isTopPick ? "pinned to Top Picks" : "unpinned from Top Picks"}`, "info");
 setProducts((prev) => prev.map((x) => (x._id === p._id ? { ...x, isTopPick: !x.isTopPick } : x)));
 try { await adminService.updateProduct(p._id, { isTopPick: !p.isTopPick }); } catch { await refreshProducts(); }
 }}
 className={`p-1.5 rounded-lg transition-colors shrink-0 ${
 p.isTopPick
 ? "bg-amber-600 text-stone-950 hover:bg-amber-700"
 : "bg-stone-200 hover:bg-stone-300 text-stone-800"
 }`}
 >
 <Check className="w-3.5 h-3.5" />
 </button>
 </div>
 ))}
 </div>
 </div>

 <div className="mt-8 space-y-4 pt-6 border-t border-stone-100">
 <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest font-mono block">Homepage Featured Rows</span>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {products.map((p) => (
 <div
 key={p._id || p.name}
 className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
 p.isFeatured
 ? "bg-sky-500/5 border-sky-500/30"
 : "border-stone-200 bg-stone-50 text-stone-700"
 }`}
 >
 <div className="flex items-center gap-2 max-w-40 min-w-0">
 <img src={p.images?.[0] || ""} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
 <span className="text-xs font-bold truncate block">{p.name}</span>
 </div>
 <button
 type="button"
 onClick={async () => {
 triggerToast(`${p.name} ${!p.isFeatured ? "allocated to Featured products" : "unlisted from Featured Rows"}`, "info");
 setProducts((prev) => prev.map((x) => (x._id === p._id ? { ...x, isFeatured: !x.isFeatured } : x)));
 try { await adminService.updateProduct(p._id, { isFeatured: !p.isFeatured }); } catch { await refreshProducts(); }
 }}
 className={`p-1.5 rounded-lg transition-colors shrink-0 ${
 p.isFeatured
 ? "bg-sky-500 text-white hover:bg-sky-600"
 : "bg-stone-200 hover:bg-stone-300 text-stone-800"
 }`}
 >
 <Check className="w-3.5 h-3.5" />
 </button>
 </div>
 ))}
 </div>
 </div>

 <div className="mt-8 space-y-4 pt-6 border-t border-stone-100">
 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono block">Homepage Best Sellers Selection</span>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {products.map((p) => (
 <div
 key={p._id || p.name}
 className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
 p.isTopSelling
 ? "bg-emerald-500/5 border-emerald-500/30"
 : "border-stone-200 bg-stone-50 text-stone-700"
 }`}
 >
 <div className="flex items-center gap-2 max-w-40 min-w-0">
 <img src={p.images?.[0] || ""} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
 <span className="text-xs font-bold truncate block">{p.name}</span>
 </div>
 <button
 type="button"
 onClick={async () => {
 triggerToast(`${p.name} ${!p.isTopSelling ? "promoted to Best Seller" : "unpinned from Best Sellers"}`, "info");
 setProducts((prev) => prev.map((x) => (x._id === p._id ? { ...x, isTopSelling: !x.isTopSelling } : x)));
 try { await adminService.updateProduct(p._id, { isTopSelling: !p.isTopSelling }); } catch { await refreshProducts(); }
 }}
 className={`p-1.5 rounded-lg transition-colors shrink-0 ${
 p.isTopSelling
 ? "bg-emerald-500 text-white hover:bg-emerald-600"
 : "bg-stone-200 hover:bg-stone-300 text-stone-800"
 }`}
 >
 <Check className="w-3.5 h-3.5" />
 </button>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === "banners" && (
 <BannersTab banners={banners} onSaveBanners={handleSaveBannersList} triggerToast={triggerToast} />
 )}

 {activeTab === "reviews" && (
 <GeneralTabs
 subTab="reviews"
 categories={categories}
 testimonials={testimonials}
 subscribers={subscribers}
 onSaveCategories={handleSaveCategoriesList}
 onSaveTestimonials={handleSaveTestimonialsList}
 onSaveSubscribers={handleSaveSubscribers}
 triggerToast={triggerToast}
 autoOpenAdd={autoOpenAddReview}
 onClearAutoOpen={() => setAutoOpenAddReview(false)}
 />
 )}

 {activeTab === "newsletter" && (
 <GeneralTabs
 subTab="newsletter"
 categories={categories}
 testimonials={testimonials}
 subscribers={subscribers}
 onSaveCategories={handleSaveCategoriesList}
 onSaveTestimonials={handleSaveTestimonialsList}
 onSaveSubscribers={handleSaveSubscribers}
 triggerToast={triggerToast}
 />
 )}

 {activeTab === "contact" && (
 <SettingsTabs
 subTab="contact"
 contactInfo={contactInfo}
 webSettings={webSettings}
 appearance={appearance}
 staticPages={staticPages}
 adminProfile={adminProfile}
 mediaLibrary={mediaLibrary}
 onSaveContact={handleSaveContactInfo}
 onSaveWebSettings={handleSaveWebSettings}
 onSaveAppearance={handleSaveAppearanceSettings}
 onSaveStaticPages={handleSaveStaticPages}
 onSaveAdminProfile={handleSaveAdminProfile}
 onSaveMediaLibrary={handleSaveMediaLibrary}
 triggerToast={triggerToast}
 />
 )}

 {activeTab === "pages" && (
 <SettingsTabs
 subTab="pages"
 contactInfo={contactInfo}
 webSettings={webSettings}
 appearance={appearance}
 staticPages={staticPages}
 adminProfile={adminProfile}
 mediaLibrary={mediaLibrary}
 onSaveContact={handleSaveContactInfo}
 onSaveWebSettings={handleSaveWebSettings}
 onSaveAppearance={handleSaveAppearanceSettings}
 onSaveStaticPages={handleSaveStaticPages}
 onSaveAdminProfile={handleSaveAdminProfile}
 onSaveMediaLibrary={handleSaveMediaLibrary}
 triggerToast={triggerToast}
 />
 )}

 {activeTab === "media" && (
 <SettingsTabs
 subTab="media"
 contactInfo={contactInfo}
 webSettings={webSettings}
 appearance={appearance}
 staticPages={staticPages}
 adminProfile={adminProfile}
 mediaLibrary={mediaLibrary}
 onSaveContact={handleSaveContactInfo}
 onSaveWebSettings={handleSaveWebSettings}
 onSaveAppearance={handleSaveAppearanceSettings}
 onSaveStaticPages={handleSaveStaticPages}
 onSaveAdminProfile={handleSaveAdminProfile}
 onSaveMediaLibrary={handleSaveMediaLibrary}
 triggerToast={triggerToast}
 />
 )}

 {activeTab === "appearance" && (
 <SettingsTabs
 subTab="appearance"
 contactInfo={contactInfo}
 webSettings={webSettings}
 appearance={appearance}
 staticPages={staticPages}
 adminProfile={adminProfile}
 mediaLibrary={mediaLibrary}
 onSaveContact={handleSaveContactInfo}
 onSaveWebSettings={handleSaveWebSettings}
 onSaveAppearance={handleSaveAppearanceSettings}
 onSaveStaticPages={handleSaveStaticPages}
 onSaveAdminProfile={handleSaveAdminProfile}
 onSaveMediaLibrary={handleSaveMediaLibrary}
 triggerToast={triggerToast}
 />
 )}

 {activeTab === "web" && (
 <SettingsTabs
 subTab="web"
 contactInfo={contactInfo}
 webSettings={webSettings}
 appearance={appearance}
 staticPages={staticPages}
 adminProfile={adminProfile}
 mediaLibrary={mediaLibrary}
 onSaveContact={handleSaveContactInfo}
 onSaveWebSettings={handleSaveWebSettings}
 onSaveAppearance={handleSaveAppearanceSettings}
 onSaveStaticPages={handleSaveStaticPages}
 onSaveAdminProfile={handleSaveAdminProfile}
 onSaveMediaLibrary={handleSaveMediaLibrary}
 triggerToast={triggerToast}
 />
 )}

 {activeTab === "profile" && (
 <SettingsTabs
 subTab="profile"
 contactInfo={contactInfo}
 webSettings={webSettings}
 appearance={appearance}
 staticPages={staticPages}
 adminProfile={adminProfile}
 mediaLibrary={mediaLibrary}
 onSaveContact={handleSaveContactInfo}
 onSaveWebSettings={handleSaveWebSettings}
 onSaveAppearance={handleSaveAppearanceSettings}
 onSaveStaticPages={handleSaveStaticPages}
 onSaveAdminProfile={handleSaveAdminProfile}
 onSaveMediaLibrary={handleSaveMediaLibrary}
 triggerToast={triggerToast}
 />
 )}

 </div>

 </main>
 </div>

 </div>
 );
}
