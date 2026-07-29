import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
 Percent, Plus, Trash2, Search, RefreshCw, X,
 CheckCircle, AlertCircle,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { formatPKR } from "../../utils/currency";

const EMPTY_FORM = {
 code: "",
 discountType: "percentage",
 discountValue: "",
 minOrderAmount: "",
 maxUses: "",
 expiresAt: "",
 description: "",
 isActive: true,
};

function CouponStatusBadge({ coupon }) {
 const now = new Date();
 const expired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
 const maxed = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses;

 if (!coupon.isActive || expired || maxed) {
 return (
 <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-600">
 <AlertCircle className="w-3 h-3" />
 {!coupon.isActive ? "Inactive" : expired ? "Expired" : "Maxed"}
 </span>
 );
 }
 return (
 <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
 <CheckCircle className="w-3 h-3" />
 Active
 </span>
 );
}

export default function CouponsTab({ triggerToast }) {
 const [coupons, setCoupons] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState(EMPTY_FORM);
 const [saving, setSaving] = useState(false);
 const [deletingId, setDeletingId] = useState(null);

 useEffect(() => {
 fetchCoupons();
 }, []);

 const fetchCoupons = async () => {
 setLoading(true);
 try {
 const data = await adminService.getCoupons();
 setCoupons(Array.isArray(data) ? data : data.coupons || data.data || []);
 } catch {
 triggerToast("Failed to load coupons.", "error");
 } finally {
 setLoading(false);
 }
 };

 const set = (key) => (e) => setForm((f) => ({
 ...f,
 [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
 }));

 const handleCreate = async (e) => {
 e.preventDefault();
 if (!form.code.trim() || !form.discountValue) {
 triggerToast("Code and discount value are required.", "error");
 return;
 }
 setSaving(true);
 try {
 const payload = {
 code: form.code.trim().toUpperCase(),
 discountType: form.discountType,
 discountValue: Number(form.discountValue),
 minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
 maxUses: form.maxUses ? Number(form.maxUses) : 0,
 expiresAt: form.expiresAt || undefined,
 description: form.description,
 isActive: form.isActive,
 };
 await adminService.createCoupon(payload);
 await fetchCoupons();
 setForm(EMPTY_FORM);
 setShowForm(false);
 triggerToast(`Coupon ${payload.code} created.`, "success");
 } catch (err) {
 triggerToast(err.response?.data?.message || "Failed to create coupon.", "error");
 } finally {
 setSaving(false);
 }
 };

 const handleDelete = async (id, code) => {
 if (!window.confirm(`Delete coupon "${code}"?`)) return;
 setDeletingId(id);
 try {
 await adminService.deleteCoupon(id);
 setCoupons((prev) => prev.filter((c) => c._id !== id));
 triggerToast(`Coupon ${code} deleted.`, "success");
 } catch (err) {
 triggerToast(err.response?.data?.message || "Failed to delete coupon.", "error");
 } finally {
 setDeletingId(null);
 }
 };

 const filtered = coupons.filter((c) =>
 c.code?.toLowerCase().includes(search.toLowerCase()) ||
 c.description?.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="space-y-5">
 <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
 <div>
 <h2 className="font-sans font-bold text-stone-900 text-sm uppercase tracking-wider">Coupons Management</h2>
 <p className="text-[10px] text-stone-400 mt-0.5 font-medium">{coupons.length} coupons total</p>
 </div>
 <div className="flex items-center gap-2">
 <button onClick={fetchCoupons} className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors">
 <RefreshCw className="w-3.5 h-3.5" /> Refresh
 </button>
 <button
 onClick={() => setShowForm(!showForm)}
 className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
 >
 {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
 {showForm ? "Cancel" : "New Coupon"}
 </button>
 </div>
 </div>

 {/* Create Form */}
 <AnimatePresence>
 {showForm && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden mb-5"
 >
 <form onSubmit={handleCreate} className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
 <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 font-mono">Create New Coupon</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Code *</label>
 <input
 type="text"
 placeholder="e.g. SAVE20"
 value={form.code}
 onChange={set("code")}
 required
 className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-mono font-bold text-stone-800 placeholder-stone-400 uppercase tracking-widest"
 />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Type *</label>
 <select value={form.discountType} onChange={set("discountType")} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800">
 <option value="percentage">Percentage (%)</option>
 <option value="fixed">Fixed Amount ($)</option>
 </select>
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Value *</label>
 <input
 type="number"
 min="0"
 max={form.discountType === "percentage" ? "100" : undefined}
 placeholder={form.discountType === "percentage" ? "e.g. 15" : "e.g. 20"}
 value={form.discountValue}
 onChange={set("discountValue")}
 required
 className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400"
 />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Min Order ($)</label>
 <input type="number" min="0" placeholder="0 = no minimum" value={form.minOrderAmount} onChange={set("minOrderAmount")} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400" />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Max Uses</label>
 <input type="number" min="0" placeholder="0 = unlimited" value={form.maxUses} onChange={set("maxUses")} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400" />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Expires At</label>
 <input type="date" value={form.expiresAt} onChange={set("expiresAt")} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800" />
 </div>
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Description</label>
 <input type="text" placeholder="e.g. New customer welcome discount" value={form.description} onChange={set("description")} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400" />
 </div>
 <div className="flex items-center justify-between pt-1">
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="accent-amber-500 w-3.5 h-3.5" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Active</span>
 </label>
 <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors disabled:opacity-60 shadow-sm">
 {saving ? <RefreshCwSpin /> : <CheckCircle className="w-4 h-4" />}
 {saving ? "Creating..." : "Create Coupon"}
 </button>
 </div>
 </form>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Search */}
 <div className="relative mb-5">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
 <input
 type="text"
 placeholder="Search by code or description..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none text-stone-800 placeholder-stone-400"
 />
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-12">
 <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
 </div>
 ) : filtered.length === 0 ? (
 <div className="text-center py-12 text-stone-400">
 <Percent className="w-10 h-10 mx-auto mb-2 opacity-40" />
 <p className="text-xs font-medium">No coupons yet. Create one above.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-xl border border-stone-100">
 <table className="w-full text-xs">
 <thead className="bg-stone-50">
 <tr>
 {["Code", "Discount", "Min Order", "Uses", "Expires", "Status", ""].map((h) => (
 <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-widest text-stone-500 font-mono">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-stone-50">
 {filtered.map((c) => (
 <tr key={c._id} className="hover:bg-stone-50 transition-colors">
 <td className="px-4 py-3">
 <p className="font-mono font-bold text-stone-900 tracking-widest">{c.code}</p>
 {c.description && <p className="text-[10px] text-stone-400 mt-0.5 truncate max-w-32">{c.description}</p>}
 </td>
 <td className="px-4 py-3 font-bold text-amber-600 font-mono">
 {c.discountType === "percentage" ? `${c.discountValue}%` : formatPKR(c.discountValue)}
 </td>
 <td className="px-4 py-3 text-stone-500 font-mono">
 {c.minOrderAmount > 0 ? formatPKR(c.minOrderAmount) : "—"}
 </td>
 <td className="px-4 py-3 text-stone-600 font-mono">
 {c.usedCount}/{c.maxUses > 0 ? c.maxUses : "∞"}
 </td>
 <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
 {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No expiry"}
 </td>
 <td className="px-4 py-3"><CouponStatusBadge coupon={c} /></td>
 <td className="px-4 py-3">
 <button
 onClick={() => handleDelete(c._id, c.code)}
 disabled={deletingId === c._id}
 className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-50"
 title="Delete coupon"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
}

function RefreshCwSpin() {
 return (
 <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
 <path d="M21 3v5h-5" />
 <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
 <path d="M8 16H3v5" />
 </svg>
 );
}

