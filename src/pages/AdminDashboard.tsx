import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Check
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

// Inner tab sub-components
import AnalyticsCharts from "../dashboard/components/AnalyticsCharts";
import ProductsTab from "../dashboard/components/ProductsTab";
import BannersTab from "../dashboard/components/BannersTab";
import GeneralTabs from "../dashboard/components/GeneralTabs";
import SettingsTabs from "../dashboard/components/SettingsTabs";

export default function AdminDashboard() {
  // Sidebar toggler
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, products, categories, homepage, banners, reviews, newsletter, contact, pages, media, appearance, web, profile

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

  // Live Toast state helper
  interface ToastEvent {
    id: number;
    msg: string;
    type: "success" | "error" | "info" | "warning";
  }
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  const triggerToast = (msg: string, type: "success" | "error" | "info" | "warning" = "success") => {
    const freshId = Date.now();
    setToasts((prev) => [...prev, { id: freshId, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== freshId));
    }, 4500);
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

    triggerToast("Concierge security clearance granted. Welcome, Charles.", "success");
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

  // Quick statistics widgets helpers
  const countFeatured = products.filter((p) => p.isFeatured).length;
  const countTopPicks = products.filter((p) => p.isTopPick).length;
  const countTopSelling = products.filter((p) => p.isTopSelling).length;
  const countNewArrivals = products.filter((p) => {
    const isNewDate = new Date(p.createdAt).getTime() > new Date("2026-05-01").getTime();
    return isNewDate;
  }).length;

  const sidebarMenu = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "homepage", label: "Homepage Selection", icon: Sliders },
    { id: "banners", label: "Hero & Promo Banners", icon: Image },
    { id: "reviews", label: "Public Reviews", icon: Star },
    { id: "newsletter", label: "Newsletter Base", icon: Mail },
    { id: "contact", label: "Contact Coordinates", icon: MapPin },
    { id: "pages", label: "Static Pages Policy", icon: FileText },
    { id: "media", label: "Media Library Gallery", icon: Image },
    { id: "appearance", label: "Branding Appearance", icon: Palette },
    { id: "web", label: "Website Settings", icon: Settings },
    { id: "profile", label: "My Profile Admin", icon: User },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans antialiased" id="admin-dashboard-container">
      {/* ================= RE-USE COLLAPSIBLE SIDEBAR ================= */}
      <aside
        className={`bg-stone-900 text-stone-300 border-r border-stone-850 flex flex-col justify-between transition-all duration-300 z-30 flex-shrink-0 ${
          sidebarCollapsed ? "w-18" : "w-64"
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 border-b border-stone-850 px-5 flex items-center justify-between">
            {!sidebarCollapsed ? (
              <div className="flex items-baseline gap-1 animate-fadeIn">
                <span className="font-sans font-extrabold text-white text-lg tracking-tight select-none">
                  ATELIER
                </span>
                <span className="text-amber-500 font-mono text-[9px] font-bold tracking-widest uppercase select-none">
                  ADMIN
                </span>
              </div>
            ) : (
              <span className="text-amber-500 font-mono text-xs font-black mx-auto">A</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
              title="Collapse Panel"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Connected Admin profile badge */}
          {!sidebarCollapsed && (
            <div className="px-5 py-4 border-b border-stone-850 flex items-center gap-3 bg-stone-950/20">
              <img
                src={adminProfile.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80"}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-stone-700 shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-100 font-sans tracking-wide truncate max-w-40">{adminProfile.fullName}</span>
                <span className="text-[10px] text-stone-500 font-medium font-mono">Brand Concierge ID</span>
              </div>
            </div>
          )}

          {/* Navigation Links list */}
          <nav className="p-3 space-y-1">
            {sidebarMenu.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-amber-600 text-stone-900 font-bold shadow-md shadow-amber-600/10"
                      : "hover:bg-stone-800/60 hover:text-stone-100"
                  }`}
                  title={item.label}
                >
                  <IconComp className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-stone-950" : "text-stone-400"}`} />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Exit link back to shop front */}
        <div className="p-3 border-t border-stone-850">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-950/20 text-stone-400 hover:text-rose-400 text-xs font-bold transition-all"
            title="Exit Admin Panel"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            {!sidebarCollapsed && <span>Exit to Storefront</span>}
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT VIEWPORT DECK ================= */}
      <div className="flex-1 flex flex-col min-w-0" id="main-admin-viewport">
        {/* Sticky top brand Header */}
        <header className="sticky top-0 h-20 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-20 shadow-sm shadow-stone-100/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-50 border border-stone-150 px-2.5 py-1 rounded-lg">
              SYSTEM LEVEL: SECURE READ/WRITE
            </span>
            <div className="h-4 w-px bg-stone-200 hidden md:block" />
            <h1 className="font-sans font-black text-stone-950 text-base hidden md:block">
              {sidebarMenu.find((m) => m.id === activeTab)?.label} Module
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            {/* Quick action buttons */}
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 hover:bg-stone-100 text-stone-700 bg-stone-50 border border-stone-200 rounded-xl transition-all font-sans"
            >
              <Eye className="w-4 h-4 text-stone-400" />
              Storefront Preview
            </Link>

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-stone-400 font-mono font-bold tracking-widest uppercase">Atelier Online</span>
            </div>
          </div>
        </header>

        {/* Outer scrolling content wrapper */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ================= 1. SUMMARY STATISTICS CARDS (RENDERED ON DASHBOARD HOME ONLY) ================= */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="numeric-stats-widgets">
              {/* Product Inventory */}
              <div className="bg-white p-5 rounded-2xl border border-stone-150/70 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[10px] font-bold tracking-widest uppercase font-mono block">Products Registry</span>
                  <strong className="text-2xl font-serif text-stone-900 block mt-1">{products.length}</strong>
                  <span className="text-[10px] text-stone-400 mt-1 block">In Stock: {products.filter((p) => p.stock > 0).length} items</span>
                </div>
                <div className="w-12 h-12 bg-amber-600/10 rounded-xl flex items-center justify-center text-amber-700 flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-amber-600" />
                </div>
              </div>

              {/* Category Volume */}
              <div className="bg-white p-5 rounded-2xl border border-stone-150/70 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[10px] font-bold tracking-widest uppercase font-mono block">Luxury Categories</span>
                  <strong className="text-2xl font-serif text-stone-900 block mt-1">{categories.length}</strong>
                  <span className="text-[10px] text-stone-400 mt-1 block">Distinct Collections</span>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <FolderOpen className="w-6 h-6 text-indigo-600" />
                </div>
              </div>

              {/* Featured items */}
              <div className="bg-white p-5 rounded-2xl border border-stone-150/70 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[10px] font-bold tracking-widest uppercase font-mono block">Featured / Top Picks</span>
                  <strong className="text-2xl font-serif text-stone-900 block mt-1">{countFeatured + countTopPicks}</strong>
                  <span className="text-[10px] text-stone-400 mt-1 block">Selling: {countTopSelling} Best Sellers</span>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                </div>
              </div>

              {/* Newsletter subs */}
              <div className="bg-white p-5 rounded-2xl border border-stone-150/70 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[10px] font-bold tracking-widest uppercase font-mono block">Subscribers base</span>
                  <strong className="text-2xl font-serif text-stone-900 block mt-1">{subscribers.length}</strong>
                  <span className="text-[10px] text-stone-400 mt-1 block">Review count: {testimonials.length} reviews</span>
                </div>
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 flex-shrink-0">
                  <Mail className="w-6 h-6 text-rose-600" />
                </div>
              </div>
            </div>
          )}

          {/* =================== 2. RENDERING ACTIVE COMPONENT TABS =================== */}
          <div className="transition-all duration-300">
            {/* Dashboard Visualizer */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Visual Chart decks */}
                <AnalyticsCharts products={products} categories={categories} />

                {/* Database Quick Summary Row */}
                <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-850 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-amber-500 font-mono text-[9px] font-bold tracking-widest uppercase">System Synchronization Service</span>
                    <h3 className="font-sans font-bold text-white text-base">All content fields currently synchronized to storefront.</h3>
                    <p className="text-xs text-stone-300">Edit, inject, or remove product cards, hero sliders, FAQs, or typography profiles right in the settings sub-panels below.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="self-start md:self-auto px-5 py-2 bg-white text-stone-950 rounded-xl text-xs font-bold transition-all hover:bg-stone-100 tracking-wide font-sans shadow-md"
                  >
                    Launch Products Catalog CRUDS
                  </button>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <ProductsTab
                products={products}
                categories={categories}
                onSaveProducts={handleSaveProductsList}
                triggerToast={triggerToast}
              />
            )}

            {/* Layout Categorization list */}
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
              />
            )}

            {/* Homepage selections toggler */}
            {activeTab === "homepage" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xs">
                  <div>
                    <h3 className="font-sans font-bold text-stone-900 text-sm mb-1">Interactive Homepage Selection Panels</h3>
                    <p className="text-xs text-stone-400 font-medium max-w-xl">
                      Configure exactly which luxury leather goods items emerge dynamically inside the **Top Picks**, **Featured Products**, and **Top Selling** carousels on the storefront page.
                    </p>
                  </div>

                  {/* Top Picks List with quick toggle button */}
                  <div className="mt-6 space-y-4">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono block">Top Picks Section allocation</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            p.isTopPick
                              ? "bg-amber-600/5 border-amber-600/30 shadow-xs"
                              : "border-stone-200 bg-stone-50 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-40">
                            <img src={p.images[0]} className="w-8 h-8 rounded-lg object-cover" alt="" />
                            <span className="text-xs font-bold truncate block">{p.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = products.map((x) => (x.id === p.id ? { ...x, isTopPick: !x.isTopPick } : x));
                              handleSaveProductsList(updated);
                              triggerToast(`${p.name} ${!p.isTopPick ? "pinned to Top Picks" : "unpinned from Top Picks"}`, "info");
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.isTopPick
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "bg-stone-200 hover:bg-stone-300 text-stone-800"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Featured list selector with quick toggle */}
                  <div className="mt-8 space-y-4 pt-6 border-t border-stone-100">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono block">Homepage Featured list allocation</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            p.isFeatured
                              ? "bg-amber-600/5 border-amber-600/30 shadow-xs"
                              : "border-stone-200 bg-stone-50 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-40">
                            <img src={p.images[0]} className="w-8 h-8 rounded-lg object-cover" alt="" />
                            <span className="text-xs font-bold truncate block">{p.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = products.map((x) => (x.id === p.id ? { ...x, isFeatured: !x.isFeatured } : x));
                              handleSaveProductsList(updated);
                              triggerToast(`${p.name} ${!p.isFeatured ? "allocated to Featured rows" : "unlisted from Featured"}`, "info");
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.isFeatured
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "bg-stone-200 hover:bg-stone-300 text-stone-800"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Selling list selector with quick toggle */}
                  <div className="mt-8 space-y-4 pt-6 border-t border-stone-100">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono block">Top Selling list allocation</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            p.isTopSelling
                              ? "bg-amber-600/5 border-amber-600/30 shadow-xs"
                              : "border-stone-200 bg-stone-50 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-40">
                            <img src={p.images[0]} className="w-8 h-8 rounded-lg object-cover" alt="" />
                            <span className="text-xs font-bold truncate block">{p.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = products.map((x) => (x.id === p.id ? { ...x, isTopSelling: !x.isTopSelling } : x));
                              handleSaveProductsList(updated);
                              triggerToast(`${p.name} ${!p.isTopSelling ? "promoted to Best Seller" : "unpinned from Best Sellers"}`, "info");
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.isTopSelling
                                ? "bg-amber-600 text-white hover:bg-amber-700"
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

            {/* Banner sliders Tab */}
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
              />
            )}

            {/* Newsletter sub Tab */}
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

            {/* Contact coordinates config */}
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

            {/* Policy static pages */}
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

            {/* Photos galleries library */}
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

            {/* Coloring appearance stylesheet */}
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

            {/* Website core variables */}
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

            {/* Supervisory profile admin */}
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

      {/* ==================== FLOATING TOASTS PANEL ==================== */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" id="toasts-dock">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl flex items-center gap-3 shadow-lg pointer-events-auto max-w-sm animate-slideIn ${
              t.type === "success"
                ? "bg-stone-900 border border-stone-800 text-stone-100"
                : t.type === "error"
                ? "bg-rose-950/90 text-rose-100 border border-rose-900"
                : t.type === "warning"
                ? "bg-amber-950/90 text-amber-100 border border-amber-900"
                : "bg-stone-800 text-white"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-amber-500" />
            ) : t.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-500" />
            ) : t.type === "warning" ? (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            ) : (
              <Clock className="w-5 h-5 text-stone-200" />
            )}
            <span className="text-xs font-bold leading-normal font-sans">{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
