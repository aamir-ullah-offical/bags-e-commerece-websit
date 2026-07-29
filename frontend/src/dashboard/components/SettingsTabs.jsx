import { useState } from "react";
import { Save, Shield, MapPin, Palette, Settings, User, Search, Trash2, Copy, ImageIcon, Eye } from "lucide-react";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";
import ImageUpload from "../../components/ImageUpload";

export default function SettingsTabs({
 subTab,
 contactInfo,
 webSettings,
 appearance,
 staticPages,
 adminProfile,
 mediaLibrary,
 onSaveContact,
 onSaveWebSettings,
 onSaveAppearance,
 onSaveStaticPages,
 onSaveAdminProfile,
 onSaveMediaLibrary,
 triggerToast,
}) {
 const [localContact, setLocalContact] = useState({ ...contactInfo });
 const handleSaveContact = (e) => {
 e.preventDefault();
 onSaveContact(localContact);
 triggerToast("Atelier coordinates synchronized successfully", "success");
 };

 const [localWeb, setLocalWeb] = useState({ ...webSettings });
 const handleSaveWeb = (e) => {
 e.preventDefault();
 onSaveWebSettings(localWeb);
 triggerToast("Global e-commerce attributes registered", "success");
 };

 const [localApp, setLocalApp] = useState({
 primaryColor: "#d97706",
 secondaryColor: "#1c1917",
 accentColor: "#b45309",
 borderRadius: "medium",
 shadowIntensity: "medium",
 headingFont: "Inter",
 bodyFont: "Inter",
 logoMain: "",
 logoFooter: "",
 favicon: "",
 ...appearance,
 });
 const handleSaveAppearance = (e) => {
 e.preventDefault();
 onSaveAppearance(localApp);
 triggerToast("Branding scheme updated. Refresh customer viewports to appreciate colors.", "success");
 };

 const [selectedPageKey, setSelectedPageKey] = useState("about");
 const [pageContent, setPageContent] = useState(staticPages[selectedPageKey]?.content || "");
 const [pageSeoTitle, setPageSeoTitle] = useState(staticPages[selectedPageKey]?.seoTitle || "");
 const [pageMetaDesc, setPageMetaDesc] = useState(staticPages[selectedPageKey]?.metaDescription || "");

 const handlePageSwitch = (key) => {
 setSelectedPageKey(key);
 setPageContent(staticPages[key]?.content || "");
 setPageSeoTitle(staticPages[key]?.seoTitle || "");
 setPageMetaDesc(staticPages[key]?.metaDescription || "");
 };

 const handleSavePage = (e) => {
 e.preventDefault();
 const updatedPages = {
 ...staticPages,
 [selectedPageKey]: {
 content: pageContent,
 seoTitle: pageSeoTitle,
 metaDescription: pageMetaDesc,
 },
 };
 onSaveStaticPages(updatedPages);
 triggerToast(`Static page "${selectedPageKey.toUpperCase()}" published and indexed`, "success");
 };

 const [localProfile, setLocalProfile] = useState({ ...adminProfile });
 const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
 const handleSaveProfile = (e) => {
 e.preventDefault();
 onSaveAdminProfile(localProfile);
 triggerToast("Concierge supervisor profile updated", "success");
 };

 const [changingPw, setChangingPw] = useState(false);
 const handleChangePassword = async (e) => {
 e.preventDefault();
 if (!passwords.old || !passwords.new) {
 triggerToast("All password fields are required", "info");
 return;
 }
 if (passwords.new !== passwords.confirm) {
 triggerToast("New passwords do not match", "info");
 return;
 }
 if (passwords.new.length < 6) {
 triggerToast("New password must be at least 6 characters", "info");
 return;
 }
 setChangingPw(true);
 try {
 await authService.changePassword({ currentPassword: passwords.old, newPassword: passwords.new });
 setPasswords({ old: "", new: "", confirm: "" });
 triggerToast("Password updated successfully", "success");
 } catch (err) {
 triggerToast(err?.response?.data?.message || "Password change failed", "info");
 } finally {
 setChangingPw(false);
 }
 };

 const [mediaSearch, setMediaSearch] = useState("");
 const [newMediaUrl, setNewMediaUrl] = useState("");

 const handleAddMedia = (e) => {
 e.preventDefault();
 if (!newMediaUrl.trim()) return;
 const newList = [newMediaUrl.trim(), ...mediaLibrary];
 onSaveMediaLibrary(newList);
 setNewMediaUrl("");
 triggerToast("New campaign asset cached in gallery library", "success");
 };

 const handleDeleteMedia = (url) => {
 const confirmation = window.confirm("Evict this photo image asset from the media catalog?");
 if (confirmation) {
 onSaveMediaLibrary(mediaLibrary.filter((m) => m !== url));
 triggerToast("Asset removed", "info");
 }
 };

 const handleCopyUrl = (url) => {
 navigator.clipboard.writeText(url);
 triggerToast("Image public URL copied to clipboard!", "success");
 };

 return (
 <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-6" id="settings-tabs-master">

 {/* ================= CONTACT INFO TAB ================= */}
 {subTab === "contact" && (
 <form onSubmit={handleSaveContact} className="space-y-5 max-w-xl">
 <div className="border-b border-stone-100 pb-3">
 <h2 className="font-sans font-bold text-stone-900 text-sm flex items-center gap-2">
 <MapPin className="w-4 h-4 text-amber-600" />
 Contact Coordinates & Working Hours
 </h2>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Concierge Hotline Phone</label>
 <input
 type="text"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold text-stone-850"
 value={localContact.phone}
 onChange={(e) => setLocalContact({ ...localContact, phone: e.target.value })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Concierge Email Inbox</label>
 <input
 type="email"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
 value={localContact.email}
 onChange={(e) => setLocalContact({ ...localContact, email: e.target.value })}
 />
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Atelier Studio address</label>
 <input
 type="text"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={localContact.address}
 onChange={(e) => setLocalContact({ ...localContact, address: e.target.value })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Google Maps Embed URL / Embed Link</label>
 <input
 type="text"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
 value={localContact.mapUrl}
 onChange={(e) => setLocalContact({ ...localContact, mapUrl: e.target.value })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Working / Hours of operation</label>
 <input
 type="text"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={localContact.workingHours}
 onChange={(e) => setLocalContact({ ...localContact, workingHours: e.target.value })}
 />
 </div>

 <button
 type="submit"
 className="flex items-center gap-1.5 px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold font-mono shadow-md"
 >
 <Save className="w-4 h-4 text-amber-400" />
 SYNCHRONIZE CONTACT FILES
 </button>
 </form>
 )}

 {/* ================= STATIC PAGES TAB ================= */}
 {subTab === "pages" && (
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="static-pages-p">
 <div className="space-y-1.5 lg:border-r lg:border-stone-100 lg:pr-4">
 <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono block mb-2">Static Page Selection</span>
 {["about", "privacy", "terms", "faqs"].map((k) => (
 <button
 key={k}
 onClick={() => handlePageSwitch(k)}
 className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all ${
 selectedPageKey === k
 ? "bg-amber-600/10 text-amber-700 border border-amber-600/20"
 : "text-stone-700 hover:bg-stone-50"
 }`}
 >
 {k === "faqs" ? "FAQs Product Guide" : `${k} Us Policy`}
 </button>
 ))}
 </div>

 <form onSubmit={handleSavePage} className="lg:col-span-3 space-y-4">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">SEO Page Title Header</label>
 <input
 type="text"
 required
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-bold"
 value={pageSeoTitle}
 onChange={(e) => setPageSeoTitle(e.target.value)}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">SEO Meta Description snippet</label>
 <textarea
 rows={2}
 required
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-stone-500"
 value={pageMetaDesc}
 onChange={(e) => setPageMetaDesc(e.target.value)}
 />
 </div>

 <div className="flex flex-col gap-2">
 <div className="flex justify-between items-center text-stone-400">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Atelier Rich Text Editor (HTML Code)</label>
 <span className="text-[9px] font-mono">Supports HTML paragraph layouts</span>
 </div>
 <textarea
 rows={6}
 required
 className="w-full px-3.5 py-3 border border-stone-200 rounded-xl font-mono text-xs focus:outline-none focus:border-amber-500 bg-stone-50/50 leading-relaxed"
 value={pageContent}
 onChange={(e) => setPageContent(e.target.value)}
 />
 </div>

 <button
 type="submit"
 className="flex items-center gap-1.5 px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold font-mono shadow-md"
 >
 <Save className="w-4 h-4 text-amber-400" />
 PUBLISH PAGE DOCK
 </button>
 </form>
 </div>
 )}

 {/* ================= MEDIA LIBRARY TAB ================= */}
 {subTab === "media" && (
 <div className="space-y-6" id="media-library-grid-panel">
 <div>
 <h3 className="font-sans font-bold text-stone-900 text-sm mb-1">Centralized Brand Assets</h3>
 <p className="text-xs text-stone-400 font-medium">Upload, search, and copy beautiful campaign photoshoot imagery links to product forms.</p>
 </div>

 <form onSubmit={handleAddMedia} className="flex gap-2 max-w-xl">
 <input
 type="url"
 required
 placeholder="Inject new photography Unsplash or asset address..."
 className="flex-1 px-4 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
 value={newMediaUrl}
 onChange={(e) => setNewMediaUrl(e.target.value)}
 />
 <button
 type="submit"
 className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold tracking-wide flex items-center gap-1 flex-shrink-0"
 >
 Add Asset Link
 </button>
 </form>

 <div className="relative max-w-xs">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
 <input
 type="text"
 placeholder="Filter image source links..."
 className="w-full pl-9 pr-4 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-stone-50/30"
 value={mediaSearch}
 onChange={(e) => setMediaSearch(e.target.value)}
 />
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pt-2">
 {mediaLibrary
 .filter((url) => url.toLowerCase().includes(mediaSearch.toLowerCase()))
 .map((url, index) => (
 <div key={index} className="aspect-square relative rounded-xl border border-stone-200 overflow-hidden group bg-stone-50 shadow-xs flex flex-col justify-end">
 <img src={url} alt="" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform" />
 <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
 <button
 type="button"
 onClick={() => handleCopyUrl(url)}
 className="p-1.5 bg-white text-stone-900 hover:bg-amber-500 hover:text-stone-950 rounded-lg shadow-xs transition-colors"
 title="Copy URL link"
 >
 <Copy className="w-3.5 h-3.5" />
 </button>
 <button
 type="button"
 onClick={() => handleDeleteMedia(url)}
 className="p-1.5 bg-white text-rose-600 hover:bg-rose-550 hover:text-white rounded-lg shadow-xs transition-colors"
 title="Evict Asset"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ================= APPEARANCE SETTINGS TAB ================= */}
 {subTab === "appearance" && (
 <form onSubmit={handleSaveAppearance} className="space-y-6 max-w-2xl" id="appearance-form-deck">
 <div className="border-b border-stone-100 pb-3">
 <h2 className="font-sans font-bold text-stone-900 text-sm flex items-center gap-1.5">
 <Palette className="w-4 h-4 text-amber-600" />
 Theme & Style configurations (Interactive CSS preset)
 </h2>
 </div>

 {/* ── Brand Identity: Logo Section ── */}
 <div className="rounded-2xl border border-stone-150 bg-stone-50/60 p-5 space-y-4">
 <div className="flex items-center gap-2 mb-1">
 <ImageIcon className="w-4 h-4 text-amber-600" />
 <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-widest font-mono">Brand Identity & Logo</h3>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div className="space-y-3">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Main Logo (Navbar / Light Bg)</label>
 <p className="text-[10px] text-stone-400">Recommended ratio 3:1 — PNG with transparent background</p>
 <ImageUpload
 folder="general"
 aspectRatio="3/1"
 label="Upload Main Logo"
 value={localApp.logoMain}
 onChange={({ url }) => setLocalApp({ ...localApp, logoMain: url })}
 onRemove={() => setLocalApp({ ...localApp, logoMain: "" })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Footer Logo (Dark Bg, auto-inverted)</label>
 <p className="text-[10px] text-stone-400">Leave empty to reuse main logo with brightness invert filter</p>
 <ImageUpload
 folder="general"
 aspectRatio="3/1"
 label="Upload Footer Logo (optional)"
 value={localApp.logoFooter}
 onChange={({ url }) => setLocalApp({ ...localApp, logoFooter: url })}
 onRemove={() => setLocalApp({ ...localApp, logoFooter: "" })}
 />
 </div>
 </div>

 {/* Live preview */}
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-1.5">
 <Eye className="w-3.5 h-3.5 text-stone-400" />
 <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">Live Preview</span>
 </div>

 {/* Navbar preview (light) */}
 <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-xs">
 <p className="text-[9px] text-stone-400 font-mono uppercase tracking-widest mb-2.5">Navbar · Light</p>
 <div className="flex items-center gap-3">
 <div className="w-2 h-2 rounded-full bg-stone-200 shrink-0" />
 {localApp.logoMain ? (
 <img src={localApp.logoMain} alt="Logo preview" className="h-7 object-contain max-w-[120px]" referrerPolicy="no-referrer" />
 ) : (
 <span className="font-extrabold text-stone-800 text-sm tracking-tight">MAISON <span className="text-amber-500 font-mono text-[10px]">SAC</span></span>
 )}
 <div className="flex gap-2 ml-auto">
 <div className="w-8 h-1.5 rounded-full bg-stone-100" />
 <div className="w-8 h-1.5 rounded-full bg-stone-100" />
 <div className="w-8 h-1.5 rounded-full bg-stone-100" />
 </div>
 </div>
 </div>

 {/* Footer preview (dark) */}
 <div className="rounded-xl border border-stone-700 bg-stone-900 px-4 py-3">
 <p className="text-[9px] text-stone-500 font-mono uppercase tracking-widest mb-2.5">Footer · Dark</p>
 <div className="flex items-center gap-3">
 <div className="w-2 h-2 rounded-full bg-stone-600 shrink-0" />
 {localApp.logoFooter ? (
 <img src={localApp.logoFooter} alt="Footer logo preview" className="h-7 object-contain max-w-[120px]" referrerPolicy="no-referrer" />
 ) : localApp.logoMain ? (
 <img src={localApp.logoMain} alt="Logo preview" className="h-7 object-contain max-w-[120px] brightness-0 invert" referrerPolicy="no-referrer" />
 ) : (
 <span className="font-extrabold text-white text-sm tracking-tight">MAISON <span className="text-amber-400 font-mono text-[10px]">SAC</span></span>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Primary Palette</label>
 <div className="flex items-center gap-2">
 <input
 type="color"
 className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
 value={localApp.primaryColor}
 onChange={(e) => setLocalApp({ ...localApp, primaryColor: e.target.value })}
 />
 <span className="text-[11px] font-mono font-bold">{localApp.primaryColor}</span>
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Secondary Palette</label>
 <div className="flex items-center gap-2">
 <input
 type="color"
 className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
 value={localApp.secondaryColor}
 onChange={(e) => setLocalApp({ ...localApp, secondaryColor: e.target.value })}
 />
 <span className="text-[11px] font-mono font-bold">{localApp.secondaryColor}</span>
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Accent highlight</label>
 <div className="flex items-center gap-2">
 <input
 type="color"
 className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
 value={localApp.accentColor}
 onChange={(e) => setLocalApp({ ...localApp, accentColor: e.target.value })}
 />
 <span className="text-[11px] font-mono font-bold">{localApp.accentColor}</span>
 </div>
 </div>
 </div>

 <div className="flex flex-col gap-1 max-w-xs">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Universal Border Radius</label>
 <select
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-white"
 value={localApp.borderRadius}
 onChange={(e) => setLocalApp({ ...localApp, borderRadius: e.target.value })}
 >
 <option value="small">Squared Crisp (4px)</option>
 <option value="medium">Classic Rounded (12px)</option>
 <option value="large">Soft Rounded (16px)</option>
 <option value="pill">Full Circular (Pill)</option>
 </select>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Typography Font Heading</label>
 <select
 className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
 value={localApp.headingFont}
 onChange={(e) => setLocalApp({ ...localApp, headingFont: e.target.value })}
 >
 <option value="Inter">Classic Inter Sans</option>
 <option value="Playfair Display">Editorial Serif (Playfair)</option>
 <option value="JetBrains Mono">Terminal Tech Mono (JetBrains)</option>
 </select>
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Typography Font Body</label>
 <select
 className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
 value={localApp.bodyFont}
 onChange={(e) => setLocalApp({ ...localApp, bodyFont: e.target.value })}
 >
 <option value="Inter">Classic Inter Sans</option>
 <option value="Helvetica">Aptos/Helvetica Modern</option>
 </select>
 </div>
 </div>

 <button
 type="submit"
 className="flex items-center gap-1.5 px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold font-mono shadow-md"
 >
 <Palette className="w-4 h-4 text-amber-400" />
 SYNCHRONIZE DESIGN SCHEME
 </button>
 </form>
 )}

 {/* ================= WEBSITE GLOBAL SETTINGS TAB ================= */}
 {subTab === "web" && (
 <form onSubmit={handleSaveWeb} className="space-y-5 max-w-xl" id="global-web-settings">
 <div className="border-b border-stone-100 pb-3">
 <h2 className="font-sans font-bold text-stone-900 text-sm flex items-center gap-1.5">
 <Settings className="w-4 h-4 text-amber-600" />
 Global Brand & Corporate Settings
 </h2>
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Brand Store Name</label>
 <input
 type="text"
 required
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-extrabold"
 value={localWeb.storeName}
 onChange={(e) => setLocalWeb({ ...localWeb, storeName: e.target.value })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Company Display Tagline</label>
 <input
 type="text"
 required
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
 value={localWeb.storeTagline}
 onChange={(e) => setLocalWeb({ ...localWeb, storeTagline: e.target.value })}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Concierge Hub Hotline</label>
 <input
 type="text"
 required
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={localWeb.contactPhone || ""}
 onChange={(e) => setLocalWeb({ ...localWeb, contactPhone: e.target.value })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-550 uppercase tracking-widest font-mono">Main Contact Mailbox</label>
 <input
 type="email"
 required
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={localWeb.contactEmail || ""}
 onChange={(e) => setLocalWeb({ ...localWeb, contactEmail: e.target.value })}
 />
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Footer Brand Description</label>
 <textarea
 rows={3}
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-stone-600 leading-relaxed"
 placeholder="Short brand description shown in the site footer..."
 value={localWeb.footerText || ""}
 onChange={(e) => setLocalWeb({ ...localWeb, footerText: e.target.value })}
 />
 </div>

 <div className="border-t border-stone-100 pt-4">
 <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono block mb-3">Social Network Links</span>
 <div className="space-y-3">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">Facebook Profile URL</label>
 <input
 type="url"
 placeholder="https://facebook.com/yourbrand"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
 value={localWeb.socialFacebook || ""}
 onChange={(e) => setLocalWeb({ ...localWeb, socialFacebook: e.target.value })}
 />
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">Instagram Profile URL</label>
 <input
 type="url"
 placeholder="https://instagram.com/yourbrand"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
 value={localWeb.socialInstagram || ""}
 onChange={(e) => setLocalWeb({ ...localWeb, socialInstagram: e.target.value })}
 />
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">LinkedIn Company URL</label>
 <input
 type="url"
 placeholder="https://linkedin.com/company/yourbrand"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
 value={localWeb.socialLinkedin || ""}
 onChange={(e) => setLocalWeb({ ...localWeb, socialLinkedin: e.target.value })}
 />
 </div>
 </div>
 </div>

 <div className="border-t border-stone-100 pt-4">
 <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono block mb-3">Announcement Banner</span>
 <div className="flex flex-col gap-1 mb-3">
 <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">Banner Message Text</label>
 <input
 type="text"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 placeholder="Free Priority Shipping On Orders Over $150..."
 value={localWeb.announcementBar || ""}
 onChange={(e) => setLocalWeb({ ...localWeb, announcementBar: e.target.value })}
 />
 </div>
 <label className="flex items-center gap-2 cursor-pointer select-none">
 <input
 type="checkbox"
 className="w-4 h-4 accent-amber-600 rounded"
 checked={!!localWeb.announcementEnabled}
 onChange={(e) => setLocalWeb({ ...localWeb, announcementEnabled: e.target.checked })}
 />
 <span className="text-xs font-semibold text-stone-700">Show announcement bar to all visitors</span>
 </label>
 </div>

 <button
 type="submit"
 className="flex items-center gap-1.5 px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold font-mono shadow-md"
 >
 <Save className="w-4 h-4 text-amber-400" />
 SYNCHRONIZE GLOBAL CONFIGS
 </button>
 </form>
 )}

 {/* ================= ADMIN PROFILE TAB ================= */}
 {subTab === "profile" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="admin-profile-and-passwords">
 <form onSubmit={handleSaveProfile} className="space-y-4">
 <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono block">Attendant profile attributes</span>

 <div className="flex items-center gap-4 py-2">
 <img
 src={localProfile.profileImage}
 alt=""
 className="w-16 h-16 rounded-full border border-stone-300 object-cover"
 />
 <div className="flex flex-col gap-1">
 <label className="text-[9px] font-bold text-stone-400 uppercase font-mono">Supervisor Portrait (URL)</label>
 <input
 type="url"
 className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs w-64 focus:outline-none"
 value={localProfile.profileImage}
 onChange={(e) => setLocalProfile({ ...localProfile, profileImage: e.target.value })}
 />
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Supervisor Full Name</label>
 <input
 type="text"
 required
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none font-semibold"
 value={localProfile.fullName}
 onChange={(e) => setLocalProfile({ ...localProfile, fullName: e.target.value })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Authorized Admin Email</label>
 <input
 type="email"
 required
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none"
 value={localProfile.email}
 onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
 />
 </div>

 <button
 type="submit"
 className="flex items-center gap-1.5 px-6 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold"
 >
 <User className="w-4 h-4 text-amber-400" />
 Update Supervisor Registry
 </button>
 </form>

 <form onSubmit={handleChangePassword} className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-150">
 <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono block">Modify Access Credentials</span>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Current Secret Phrase</label>
 <input
 type="password"
 required
 placeholder="••••••••"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none bg-white font-mono"
 value={passwords.old}
 onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">New Secret Phrase</label>
 <input
 type="password"
 required
 placeholder="Min 8 secure symbols"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none bg-white font-mono"
 value={passwords.new}
 onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Confirm Secret Phrase</label>
 <input
 type="password"
 required
 placeholder="Align new password input"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none bg-white font-mono"
 value={passwords.confirm}
 onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
 />
 </div>

 <button
 type="submit"
 className="flex items-center gap-1.5 px-6 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold w-full justify-center"
 >
 <Shield className="w-4 h-4 text-amber-500" />
 CONFIRM PASSWORDS RESET
 </button>
 </form>
 </div>
 )}
 </div>
 );
}
