import { useState } from "react";
import { Plus, Edit2, Trash2, X, ArrowUp, ArrowDown, Save } from "lucide-react";

export default function BannersTab({ banners, onSaveBanners, triggerToast }) {
 const [modalBanner, setModalBanner] = useState(null);
 const [isAddMode, setIsAddMode] = useState(false);

 const [formData, setFormData] = useState({
 title: "",
 subtitle: "",
 discountText: "",
 image: "",
 ctaText: "",
 ctaLink: "",
 badge: "",
 });

 const handleOpenAdd = () => {
 setFormData({
 title: "Couture Autumn Release",
 subtitle: "Experience Hand-crafted Calfskin Wallets & Hobo Bags",
 discountText: "15% Welcome Rebate",
 image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80",
 ctaText: "Discover Masterpieces",
 ctaLink: "/shop",
 badge: "SEASONAL EXCLUSIVE",
 });
 setIsAddMode(true);
 };

 const handleOpenEdit = (b) => {
 setModalBanner(b);
 setFormData({
 title: b.title,
 subtitle: b.subtitle,
 discountText: b.discountText,
 image: b.image,
 ctaText: b.ctaText,
 ctaLink: b.ctaLink,
 badge: b.badge || "LIMITED STOCK",
 });
 };

 const handleSave = (e) => {
 e.preventDefault();

 if (!formData.title.trim()) {
 triggerToast("Banner Title is required", "warning");
 return;
 }

 if (isAddMode) {
 const nextId = banners.length > 0 ? Math.max(...banners.map((b) => b.id)) + 1 : 1;
 const newBanner = {
 id: nextId,
 title: formData.title,
 subtitle: formData.subtitle,
 discountText: formData.discountText,
 image: formData.image || "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80",
 ctaText: formData.ctaText,
 ctaLink: formData.ctaLink,
 badge: formData.badge,
 };

 onSaveBanners([...banners, newBanner]);
 setIsAddMode(false);
 triggerToast("New luxury hero slide introduced", "success");
 } else if (modalBanner) {
 const updated = banners.map((b) => {
 if (b.id === modalBanner.id) {
 return {
 ...b,
 title: formData.title,
 subtitle: formData.subtitle,
 discountText: formData.discountText,
 image: formData.image,
 ctaText: formData.ctaText,
 ctaLink: formData.ctaLink,
 badge: formData.badge,
 };
 }
 return b;
 });

 onSaveBanners(updated);
 setModalBanner(null);
 triggerToast("Luxury banner modified", "success");
 }
 };

 const handleDelete = (id) => {
 if (banners.length <= 1) {
 triggerToast("At least one hero banner slide is required to prevent blank spaces on homepage.", "warning");
 return;
 }
 const confirm = window.confirm("Remove this premium slider segment?");
 if (confirm) {
 onSaveBanners(banners.filter((b) => b.id !== id));
 triggerToast("Banner slide ejected successfully", "success");
 }
 };

 const handleMove = (index, direction) => {
 const nextIdx = direction === "up" ? index - 1 : index + 1;
 if (nextIdx < 0 || nextIdx >= banners.length) return;

 const list = [...banners];
 const temp = list[index];
 list[index] = list[nextIdx];
 list[nextIdx] = temp;

 onSaveBanners(list);
 triggerToast("Home sliders re-ordered successfully", "info");
 };

 return (
 <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-6" id="banners-tab-panel">
 <div className="flex items-center justify-between gap-4 mb-6">
 <div>
 <h2 className="font-sans font-bold text-stone-900 text-base">Hero Slider & Promotion Banners</h2>
 <p className="text-xs text-stone-400 font-medium">Reorder and edit beautiful banners running interactively in client viewports.</p>
 </div>
 <button
 onClick={handleOpenAdd}
 className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5"
 >
 <Plus className="w-4 h-4 text-amber-400" />
 Add Slider Slide
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {banners.map((b, idx) => (
 <div
 key={b.id}
 className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group bg-stone-50/50"
 >
 <div className="relative h-48 bg-stone-900 flex-shrink-0">
 <img
 src={b.image}
 alt=""
 className="w-full h-full object-cover brightness-[0.7] group-hover:scale-101 transition-transform"
 />
 <div className="absolute inset-0 bg-stone-950/40 z-10" />
 <div className="absolute top-4 left-4 z-20">
 <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-stone-950 uppercase tracking-widest font-mono">
 {b.badge || "LIMITED EDITION"}
 </span>
 </div>

 <div className="absolute bottom-4 left-4 right-4 z-20 text-white space-y-1">
 <h4 className="font-sans font-extrabold text-white text-base tracking-tight leading-3 drop-shadow-sm">{b.title}</h4>
 <p className="text-[10px] text-stone-100 line-clamp-2 leading-relaxed opacity-95">{b.subtitle}</p>
 {b.discountText && (
 <span className="font-mono text-[9px] font-bold text-amber-400 block">{b.discountText}</span>
 )}
 </div>
 </div>

 <div className="p-4 flex items-center justify-between border-t border-stone-150 bg-white z-10">
 <div className="flex items-center gap-1">
 <button
 type="button"
 onClick={() => handleMove(idx, "up")}
 disabled={idx === 0}
 className="p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:text-stone-900 disabled:opacity-40 transition-colors"
 title="Move Slide Up"
 >
 <ArrowUp className="w-3.5 h-3.5" />
 </button>
 <button
 type="button"
 onClick={() => handleMove(idx, "down")}
 disabled={idx === banners.length - 1}
 className="p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:text-stone-900 disabled:opacity-40 transition-colors"
 title="Move Slide Down"
 >
 <ArrowDown className="w-3.5 h-3.5" />
 </button>
 <span className="text-[10px] text-stone-400 font-mono font-medium ml-1">Rank: {idx + 1}</span>
 </div>

 <div className="flex items-center gap-1.5 font-semibold text-xs">
 <button
 onClick={() => handleOpenEdit(b)}
 className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-xl text-stone-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
 >
 <Edit2 className="w-3 h-3" />
 Edit details
 </button>
 <button
 onClick={() => handleDelete(b.id)}
 className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 rounded-xl text-rose-500 hover:text-white hover:bg-rose-600 transition-colors"
 >
 <Trash2 className="w-3 h-3" />
 Delete
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* ================= MODAL: BANNER ADD / EDIT ================= */}
 {(isAddMode || modalBanner) && (
 <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
 <div className="bg-white rounded-2xl border border-stone-100 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
 <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white">
 <h3 className="font-sans font-bold text-stone-900 text-sm">
 {isAddMode ? "Introduce Hero Campaign Slide" : "Modify Hero Banner Campaign Details"}
 </h3>
 <button
 onClick={() => {
 setIsAddMode(false);
 setModalBanner(null);
 }}
 className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSave} className="p-6 space-y-4">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Campaign Display Title</label>
 <input
 type="text"
 required
 placeholder="e.g. Signature Leather Hobo Release"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
 value={formData.title}
 onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Display Subtext / Details</label>
 <textarea
 rows={2}
 required
 placeholder="e.g. Elegant calfskin bags crafted in Paris with custom dual-toned buckles..."
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={formData.subtitle}
 onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Promo Rebate Offer Ribbon</label>
 <input
 type="text"
 placeholder="e.g. 15% Welcome Offer apply"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={formData.discountText}
 onChange={(e) => setFormData((prev) => ({ ...prev, discountText: e.target.value }))}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Atelier Stamp Badge</label>
 <input
 type="text"
 placeholder="e.g. SEASONAL EXCLUSIVE"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={formData.badge}
 onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Button CTA Text</label>
 <input
 type="text"
 required
 placeholder="e.g. View Collection"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={formData.ctaText}
 onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
 />
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Button Router Path Link</label>
 <input
 type="text"
 required
 placeholder="/shop"
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
 value={formData.ctaLink}
 onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
 />
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">Slider Campaign Photography Image (URL)</label>
 <input
 type="url"
 required
 placeholder="https://images.unsplash.com/photo-..."
 className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
 value={formData.image}
 onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
 />
 </div>

 <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 font-semibold text-xs">
 <button
 type="button"
 onClick={() => {
 setIsAddMode(false);
 setModalBanner(null);
 }}
 className="px-4 py-2 border border-stone-200 rounded-xl text-stone-650 hover:bg-stone-50 transition-colors"
 >
 Discard
 </button>
 <button
 type="submit"
 className="flex items-center gap-1.5 px-6 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl shadow-md transition-all active:scale-98"
 >
 <Save className="w-4 h-4 text-amber-400" />
 Save Slider settings
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
