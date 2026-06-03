import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  Check,
  Search as SearchIcon,
  Sun,
  Moon,
  Plus,
  Compass,
  Briefcase
} from "lucide-react";

import { productService } from "../utils/productService";
import {
  adminService,
  ContactInfo,
  WebSettings,
  AppearanceSettings,
  StaticPage,
  AdminProfile,
  NewsSubscriber
} from "../utils/adminService";

import { Product, Category, Banner, Testimonial } from "../types";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

// Inner tab sub-components
import AnalyticsCharts from "../dashboard/components/AnalyticsCharts";
import ProductsTab from "../dashboard/components/ProductsTab";
import BannersTab from "../dashboard/components/BannersTab";
import GeneralTabs from "../dashboard/components/GeneralTabs";
import SettingsTabs from "../dashboard/components/SettingsTabs";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Sidebar toggler
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local React copies of e-commerce data assets to allow real-time reactivity
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Local React copies of general admin attributes
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ phone: "", email: "", address: "", mapUrl: "", workingHours: "" });
  const [webSettings, setWebSettings] = useState<WebSettings>({ storeName: "", storeTagline: "", contactEmail: "", contactPhone: "", storeAddress: "" });
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    primaryColor: "", secondaryColor: "", accentColor: "", buttonStyle: "", borderRadius: "", headingFont: "", bodyFont: "", logoMain: "", logoFooter: "", favicon: ""
  });
  const [staticPages, setStaticPages] = useState<Record<string, StaticPage>>({});
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({ profileImage: "", fullName: "", email: "" });
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);
  const [subscribers, setSubscribers] = useState<NewsSubscriber[]>([]);

  // Header Dropdown menus
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Quick action activation flags passed to child tabs
  const [autoOpenAddProduct, setAutoOpenAddProduct] = useState(false);
  const [autoOpenAddCategory, setAutoOpenAddCategory] = useState(false);
  const [autoOpenAddReview, setAutoOpenAddReview] = useState(false);

  // Global Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Mock notifications sequence
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New priority subscriber: takashi.sato@ginza-carry.jp", time: "3 mins ago", read: false },
    { id: 2, text: "Product out of stock alert: Red Leather Purse SKU-001", time: "1 hour ago", read: false },
    { id: 3, text: "Gabrielle Royer posted a new 5-star product review", time: "4 hours ago", read: true },
    { id: 4, text: "System security backup verified successfully", time: "22 hours ago", read: true }
  ]);

  // Click outside search container helper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerToast = (msg: string, type: "success" | "error" | "info" | "warning" = "success") => {
    showToast(msg, type === "success" ? "success" : "info");
  };

  // Load all initial variables from persistent productService and adminService gateways
  useEffect(() => {
    setProducts(productService.getProducts());
    setCategories(productService.getCategories());
    setBanners(productService.getBanners());
    setTestimonials(productService.getTestimonials());

    setContactInfo(adminService.getContactInfo());
    setWebSettings(adminService.getWebsiteSettings());
    setAppearance(adminService.getAppearanceSettings());
    setStaticPages(adminService.getStaticPages());
    setAdminProfile(adminService.getAdminProfile());
    setMediaLibrary(adminService.getMediaLibrary());
    setSubscribers(adminService.getSubscribers());

    triggerToast("Concierge security clearance granted. Welcome, Charles Laurent.", "success");
  }, []);

  // Save changes hook callbacks that write directly to LocalStorage + update React components states
  const handleSaveProductsList = (list: Product[]) => {
    productService.saveProducts(list);
    setProducts(list);
  };

  const handleSaveCategoriesList = (list: Category[]) => {
    productService.saveCategories(list);
    setCategories(list);
  };

  const handleSaveBannersList = (list: Banner[]) => {
    productService.saveBanners(list);
    setBanners(list);
  };

  const handleSaveTestimonialsList = (list: Testimonial[]) => {
    productService.saveTestimonials(list);
    setTestimonials(list);
  };

  const handleSaveContactInfo = (data: ContactInfo) => {
    adminService.saveContactInfo(data);
    setContactInfo(data);
  };

  const handleSaveWebSettings = (data: WebSettings) => {
    adminService.saveWebsiteSettings(data);
    setWebSettings(data);
  };

  const handleSaveAppearanceSettings = (data: AppearanceSettings) => {
    adminService.saveAppearanceSettings(data);
    setAppearance(data);
  };

  const handleSaveStaticPages = (data: Record<string, StaticPage>) => {
    adminService.saveStaticPages(data);
    setStaticPages(data);
  };

  const handleSaveAdminProfile = (data: AdminProfile) => {
    adminService.saveAdminProfile(data);
    setAdminProfile(data);
  };

  const handleSaveMediaLibrary = (list: string[]) => {
    adminService.saveMediaLibrary(list);
    setMediaLibrary(list);
  };

  const handleSaveSubscribers = (list: NewsSubscriber[]) => {
    adminService.saveSubscribers(list);
    setSubscribers(list);
  };

  // Logout routine
  const handleLogout = () => {
    logout();
    triggerToast("Supervised session terminated. Returning to storefront.", "info");
    navigate("/");
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast("All notifications marked as read.", "success");
  };

  // Quick statistics widgets helpers
  const countFeatured = products.filter((p) => p.isFeatured).length;
  const countTopPicks = products.filter((p) => p.isTopPick).length;
  const countTopSelling = products.filter((p) => p.isTopSelling).length;

  const sidebarMenu = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "products", label: "Product Catalog", icon: ShoppingBag },
    { id: "categories", label: "Category Hierarchy", icon: FolderOpen },
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

  // Dynamic Search Engine calculation
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: { type: "Product" | "Category" | "Review" | "Page"; title: string; subtitle?: string; tab: string }[] = [];

    // Search Products
    products.forEach((p) => {
      if (p.name.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query)) {
        results.push({ type: "Product", title: p.name, subtitle: `Price: $${p.price} | SKU: ${p.sku || ""}`, tab: "products" });
      }
    });

    // Search Categories
    categories.forEach((c) => {
      if (c.name.toLowerCase().includes(query)) {
        results.push({ type: "Category", title: c.name, subtitle: `Category: ${c.count || 0} products linked`, tab: "categories" });
      }
    });

    // Search Reviews
    testimonials.forEach((t) => {
      if (t.comment.toLowerCase().includes(query) || t.name.toLowerCase().includes(query)) {
        results.push({ type: "Review", title: `Review by ${t.name}`, subtitle: t.comment, tab: "reviews" });
      }
    });

    // Search Static Pages
    Object.entries(staticPages).forEach(([key, page]) => {
      const p = page as any;
      if (p.seoTitle?.toLowerCase().includes(query) || p.content?.toLowerCase().includes(query)) {
        results.push({ type: "Page", title: p.seoTitle, subtitle: `Page Module: /about, /policy`, tab: "pages" });
      }
    });

    return results.slice(0, 7);
  };

  const results = getSearchResults();

  return (
    <div className="h-screen overflow-hidden flex bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-150 font-sans antialiased transition-colors duration-300" id="admin-dashboard-container">
      
      {/* ================= BACKGROUND BLUR DECORATIONS ================= */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-stone-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* ================= MOBILE SIDEBAR BACKDROP OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ================= 1. RE-USE COLLAPSIBLE SIDEBAR ================= */}
      <aside
        className={`h-full bg-stone-900 border-r border-stone-850 flex flex-col justify-between transition-all duration-300 z-50 flex-shrink-0 fixed lg:static inset-y-0 left-0 ${
          mobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Brand Header */}
          <div className="h-20 border-b border-stone-850 px-5 flex items-center justify-between flex-shrink-0">
            {(!sidebarCollapsed || mobileSidebarOpen) ? (
              <div className="flex items-baseline gap-1.5 animate-fadeIn">
                <span className="font-sans font-black text-white text-lg tracking-wider">
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
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors hidden lg:block"
              title="Collapse Panel"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Connected Admin profile badge */}
          {(!sidebarCollapsed || mobileSidebarOpen) && (
            <div className="px-5 py-4 border-b border-stone-850/60 flex items-center gap-3 bg-stone-950/20 flex-shrink-0">
              <img
                src={adminProfile.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80"}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-stone-700 shadow-sm flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-stone-100 font-sans tracking-wide truncate">{adminProfile.fullName}</span>
                <span className="text-[10px] text-stone-500 font-medium font-mono uppercase tracking-widest mt-0.5">Brand Supervisor</span>
              </div>
            </div>
          )}

          {/* Navigation Links list */}
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
                      : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-100"
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

          {/* Exit link back to shop front */}
          <div className="p-3 border-t border-stone-850 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-rose-950/20 text-stone-450 hover:text-rose-400 text-xs font-bold transition-all"
              title="Sign Out Supervisor"
            >
              <LogOut className="w-4 h-4 text-rose-500 flex-shrink-0" />
              {(!sidebarCollapsed || mobileSidebarOpen) && <span>Log out secure session</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT VIEWPORT DECK ================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative" id="main-admin-viewport">
        
        {/* Sticky top brand Header */}
        <header className="h-20 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 flex items-center justify-between z-30 shadow-sm relative transition-colors duration-300">
          
          {/* Mobile Menu & Section ID */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-600 dark:text-stone-300 lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="font-mono text-[9px] font-extrabold text-stone-500 dark:text-amber-500 uppercase tracking-widest bg-stone-100 dark:bg-amber-600/10 border border-stone-250 dark:border-amber-600/20 px-2.5 py-1.5 rounded-lg hidden sm:inline-block">
              SYSTEM PORT: 3000
            </span>
            <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 hidden md:block" />
            <h1 className="font-sans font-black text-stone-950 dark:text-stone-50 text-sm tracking-wide hidden md:block uppercase">
              {sidebarMenu.find((m) => m.id === activeTab)?.label}
            </h1>
          </div>

          {/* Interactive Utilities Area */}
          <div className="flex items-center gap-3">
            
            {/* 1. Global Search Box with custom matches lists */}
            <div className="relative" ref={searchContainerRef}>
              <div className="relative flex items-center max-w-xs md:w-60 lg:w-72 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800/80 rounded-xl focus-within:border-amber-500 dark:focus-within:border-amber-600 transition-all pr-2">
                <SearchIcon className="absolute left-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Universal system query..."
                  className="w-full pl-8 pr-2 py-2 text-xs bg-transparent focus:outline-none placeholder-stone-400 text-stone-800 dark:text-stone-100 font-medium"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />
              </div>

              {/* Real-time search dropdown drawer */}
              <AnimatePresence>
                {showSearchResults && searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-32px)] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-xl z-50 p-2 overflow-hidden text-xs text-stone-800 dark:text-stone-200"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono border-b border-stone-100 dark:border-stone-800 flex justify-between">
                      <span>Matches ({results.length})</span>
                      <span>Press enter</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-1 space-y-0.5 mt-1 scrollbar-thin">
                      {results.length === 0 ? (
                        <div className="p-4 text-center text-stone-400 dark:text-stone-500">
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
                            className="w-full text-left p-2 hover:bg-stone-50 dark:hover:bg-stone-850 rounded-xl transition-colors flex items-start gap-2.5"
                          >
                            <span className="text-[9px] uppercase tracking-wider font-extrabold font-mono text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md mt-0.5 shrink-0">
                              {r.type}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-stone-850 dark:text-stone-50 block truncate">{r.title}</span>
                              {r.subtitle && <span className="text-[10px] text-stone-400 dark:text-stone-500 block truncate font-medium mt-0.5">{r.subtitle}</span>}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Light & Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-stone-200 dark:border-stone-800/80 hover:bg-stone-150 dark:hover:bg-stone-850 rounded-xl text-stone-500 dark:text-stone-400 transition-all active:scale-95"
              title="Toggle Theme Mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-800" />}
            </button>

            {/* 3. Notifications Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="p-2 border border-stone-200 dark:border-stone-800/80 hover:bg-stone-150 dark:hover:bg-stone-850 rounded-xl text-stone-500 dark:text-stone-400 transition-all select-none relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-stone-900 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-xl z-50 overflow-hidden text-stone-850 dark:text-stone-100"
                  >
                    <div className="bg-stone-50 dark:bg-stone-950 px-4 py-3 border-b border-stone-150 dark:border-stone-850 flex items-center justify-between">
                      <span className="font-bold text-xs">System Notifications</span>
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold tracking-wide uppercase transition-colors"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="divide-y divide-stone-100 dark:divide-stone-850 max-h-72 overflow-y-auto scrollbar-thin">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-3.5 flex items-start gap-3 transition-colors ${!n.read ? "bg-amber-600/5" : ""}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${!n.read ? "bg-amber-500" : "bg-stone-350 dark:bg-stone-700"}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold leading-relaxed text-stone-800 dark:text-stone-200">{n.text}</p>
                            <span className="text-[9px] text-stone-400 font-medium block mt-1 font-mono">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Connected Admin Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 border border-stone-200 dark:border-stone-800/80 hover:bg-stone-150 dark:hover:bg-stone-850 rounded-xl transition-all"
              >
                <img
                  src={adminProfile.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80"}
                  alt=""
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 pr-1 hidden sm:inline-block max-w-28 truncate">{adminProfile.fullName.split(" ")[0]}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-xl z-50 p-2 overflow-hidden text-xs"
                  >
                    <div className="px-3.5 py-3 border-b border-stone-100 dark:border-stone-850 bg-stone-50 dark:bg-stone-950/40 rounded-xl mb-1.5">
                      <span className="font-extrabold text-stone-850 dark:text-white block">{adminProfile.fullName}</span>
                      <span className="text-[10px] text-stone-400 font-mono block mt-0.5 truncate">{adminProfile.email}</span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-stone-50 dark:hover:bg-stone-850 rounded-xl font-bold text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      Manage Profile Admin
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("web");
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-stone-50 dark:hover:bg-stone-850 rounded-xl font-bold text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-stone-400" />
                      Website Settings
                    </button>

                    <div className="h-px bg-stone-100 dark:bg-stone-800 my-1.5" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-bold text-rose-600 transition-colors flex items-center gap-2"
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

        {/* Outer and ONLY scrolling content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 scrollbar-thin">
          
          {/* ================= 1. OVERVIEW STATISTICS CARDS (RENDERED ON DASHBOARD HOME ONLY) ================= */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="numeric-stats-widgets">
              
              {/* Product Inventory */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-xs flex items-center justify-between transition-colors duration-300">
                <div>
                  <span className="text-stone-450 dark:text-stone-505 text-[9px] font-extrabold tracking-widest uppercase font-mono block">Product Inventory</span>
                  <strong className="text-2xl font-serif text-stone-900 dark:text-stone-50 block mt-1">{products.length}</strong>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">In Stock: {products.filter((p) => p.stock > 0).length} items</span>
                </div>
                <div className="w-12 h-12 bg-amber-600/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-600/10">
                  <ShoppingBag className="w-6 h-6 text-amber-500" />
                </div>
              </div>

              {/* Category Volume */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-xs flex items-center justify-between transition-colors duration-300">
                <div>
                  <span className="text-stone-450 dark:text-stone-505 text-[9px] font-extrabold tracking-widest uppercase font-mono block">Luxury Categories</span>
                  <strong className="text-2xl font-serif text-stone-900 dark:text-stone-50 block mt-1">{categories.length}</strong>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Distinct Collections</span>
                </div>
                <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-sky-500/15">
                  <FolderOpen className="w-6 h-6 text-sky-500" />
                </div>
              </div>

              {/* Featured items */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-xs flex items-center justify-between transition-colors duration-300">
                <div>
                  <span className="text-stone-450 dark:text-stone-505 text-[9px] font-extrabold tracking-widest uppercase font-mono block">Featured & Picks</span>
                  <strong className="text-2xl font-serif text-stone-900 dark:text-stone-50 block mt-1">{countFeatured + countTopPicks}</strong>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Selling: {countTopSelling} Best Sellers</span>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/15">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              {/* Newsletter subs */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-xs flex items-center justify-between transition-colors duration-300">
                <div>
                  <span className="text-stone-450 dark:text-stone-505 text-[9px] font-extrabold tracking-widest uppercase font-mono block">Subscribers</span>
                  <strong className="text-2xl font-serif text-stone-900 dark:text-stone-50 block mt-1">{subscribers.length}</strong>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Reviews: {testimonials.length} reviews</span>
                </div>
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-rose-500/15">
                  <Mail className="w-6 h-6 text-rose-500" />
                </div>
              </div>
            </div>
          )}

          {/* =================== 2. RENDERING ACTIVE COMPONENT TABS =================== */}
          <div className="transition-all duration-300">
            
            {/* Dashboard Home tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                
                {/* Visual Chart decks */}
                <AnalyticsCharts products={products} categories={categories} />

                {/* Reusable Enterprise-Level Quick Actions Panel */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-2xl shadow-xs transition-colors duration-300">
                  <div>
                    <h3 className="font-sans font-bold text-stone-950 dark:text-stone-50 text-sm mb-1 uppercase tracking-wider">Quick supervisor Actions</h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                      Admin command actions. Select a key parameters module to initiate new database records instantly.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    
                    <button
                      onClick={() => {
                        setActiveTab("products");
                        setAutoOpenAddProduct(true);
                      }}
                      className="p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-950/60 dark:hover:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl transition-all flex flex-col items-center justify-center gap-2.5 text-center group active:scale-98"
                    >
                      <Plus className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-300">Add New Product</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("categories");
                        setAutoOpenAddCategory(true);
                      }}
                      className="p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-950/60 dark:hover:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl transition-all flex flex-col items-center justify-center gap-2.5 text-center group active:scale-98"
                    >
                      <Plus className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-300">Add Category</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("banners");
                      }}
                      className="p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-950/60 dark:hover:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl transition-all flex flex-col items-center justify-center gap-2.5 text-center group active:scale-98"
                    >
                      <Plus className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-300">Manage Banners</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("reviews");
                        setAutoOpenAddReview(true);
                      }}
                      className="p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-950/60 dark:hover:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl transition-all flex flex-col items-center justify-center gap-2.5 text-center group active:scale-98"
                    >
                      <Plus className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-300">Add Testimonial</span>
                    </button>

                  </div>
                </div>

                {/* Database Sync Banner */}
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

            {/* Products Catalog Tab */}
            {activeTab === "products" && (
              <ProductsTab
                products={products}
                categories={categories}
                onSaveProducts={handleSaveProductsList}
                triggerToast={triggerToast}
                autoOpenAdd={autoOpenAddProduct}
                onClearAutoOpen={() => setAutoOpenAddProduct(false)}
              />
            )}

            {/* Categories hierarchical Tab */}
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

            {/* Homepage selection toggler */}
            {activeTab === "homepage" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors duration-300">
                  <div>
                    <h3 className="font-sans font-bold text-stone-900 dark:text-white text-sm mb-1 uppercase tracking-wider">Homepage Carousel Selection Panel</h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium max-w-xl">
                      Toggle luxury leather articles into specific promo sequences on the public landing page.
                    </p>
                  </div>

                  {/* Top Picks */}
                  <div className="mt-6 space-y-4">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono block">Top Picks Selection Row</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            p.isTopPick
                              ? "bg-amber-655/5 border-amber-600/30 dark:border-amber-600/40"
                              : "border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-40 min-w-0">
                            <img src={p.images[0]} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
                            <span className="text-xs font-bold truncate block">{p.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = products.map((x) => (x.id === p.id ? { ...x, isTopPick: !x.isTopPick } : x));
                              handleSaveProductsList(updated);
                              triggerToast(`${p.name} ${!p.isTopPick ? "pinned to Top Picks" : "unpinned from Top Picks"}`, "info");
                            }}
                            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                              p.isTopPick
                                ? "bg-amber-600 text-stone-950 hover:bg-amber-700"
                                : "bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Featured list */}
                  <div className="mt-8 space-y-4 pt-6 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest font-mono block">Homepage Featured Rows</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            p.isFeatured
                              ? "bg-sky-500/5 border-sky-500/30 dark:border-sky-500/40"
                              : "border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-40 min-w-0">
                            <img src={p.images[0]} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
                            <span className="text-xs font-bold truncate block">{p.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = products.map((x) => (x.id === p.id ? { ...x, isFeatured: !x.isFeatured } : x));
                              handleSaveProductsList(updated);
                              triggerToast(`${p.name} ${!p.isFeatured ? "allocated to Featured products" : "unlisted from Featured Rows"}`, "info");
                            }}
                            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                              p.isFeatured
                                ? "bg-sky-500 text-white hover:bg-sky-600"
                                : "bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Selling */}
                  <div className="mt-8 space-y-4 pt-6 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono block">Homepage Best Sellers Selection</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            p.isTopSelling
                              ? "bg-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/40"
                              : "border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-40 min-w-0">
                            <img src={p.images[0]} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
                            <span className="text-xs font-bold truncate block">{p.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = products.map((x) => (x.id === p.id ? { ...x, isTopSelling: !x.isTopSelling } : x));
                              handleSaveProductsList(updated);
                              triggerToast(`${p.name} ${!p.isTopSelling ? "promoted to Best Seller" : "unpinned from Best Sellers"}`, "info");
                            }}
                            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                              p.isTopSelling
                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                : "bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200"
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

            {/* Banner Sliders Tab */}
            {activeTab === "banners" && (
              <BannersTab banners={banners} onSaveBanners={handleSaveBannersList} triggerToast={triggerToast} />
            )}

            {/* Reviews Tab */}
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

            {/* Newsletter Subscriber Tab */}
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

            {/* Coordinates Contact Tab */}
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

            {/* Pages policies Tab */}
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

            {/* Media Gallery Tab */}
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

            {/* Appearance Styles settings Tab */}
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

            {/* Web core settings Tab */}
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

            {/* Admin supervisor Profile Tab */}
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
