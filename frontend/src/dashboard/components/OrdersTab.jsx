import { formatPKR } from "../../utils/currency";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
 Package, Search, ChevronDown, X, MapPin, Truck,
 CreditCard, RefreshCw, CheckCircle, Clock, RotateCcw,
 Plus, Send,
} from "lucide-react";
import { orderService } from "../../services/orderService";

const ALL_STATUSES = [
 "Pending", "Confirmed", "Processing", "Packed",
 "Shipped", "Out For Delivery", "Delivered",
 "Cancelled", "Returned", "Refunded",
];

const STATUS_COLOR = {
 Pending: "text-amber-600 bg-amber-50 border-amber-200",
 Confirmed: "text-sky-600 bg-sky-50 border-sky-200",
 Processing: "text-violet-600 bg-violet-50 border-violet-200",
 Packed: "text-orange-600 bg-orange-50 border-orange-200",
 Shipped: "text-blue-600 bg-blue-50 border-blue-200",
 "Out For Delivery": "text-indigo-600 bg-indigo-50 border-indigo-200",
 Delivered: "text-emerald-600 bg-emerald-50 border-emerald-200",
 Cancelled: "text-rose-600 bg-rose-50 border-rose-200",
 Returned: "text-stone-600 bg-stone-100 border-stone-300",
 Refunded: "text-teal-600 bg-teal-50 border-teal-200",
};

function StatusBadge({ status }) {
 return (
 <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLOR[status] || STATUS_COLOR.Pending}`}>
 {status}
 </span>
 );
}

export default function OrdersTab({ triggerToast }) {
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [statusFilter, setStatusFilter] = useState("");
 const [selectedOrder, setSelectedOrder] = useState(null);
 const [updatingStatus, setUpdatingStatus] = useState(false);

 const [statusForm, setStatusForm] = useState({ status: "", note: "", trackingNumber: "", estimatedDelivery: "" });
 const [trackingForm, setTrackingForm] = useState({ title: "", description: "", location: "" });
 const [trackingTab, setTrackingTab] = useState("status");

 useEffect(() => {
 fetchOrders();
 }, [statusFilter, search]);

 const fetchOrders = async () => {
 setLoading(true);
 try {
 const params = {};
 if (statusFilter) params.status = statusFilter;
 if (search) params.search = search;
 const data = await orderService.getAllOrders(params);
 setOrders(data.data || data.orders || data);
 } catch {
 triggerToast("Failed to load orders.", "error");
 } finally {
 setLoading(false);
 }
 };

 const openOrder = async (id) => {
 try {
 const data = await orderService.getOrderById(id);
 const o = data.order || data;
 setSelectedOrder(o);
 setStatusForm({ status: o.orderStatus, note: "", trackingNumber: o.trackingNumber || "", estimatedDelivery: o.estimatedDelivery ? o.estimatedDelivery.slice(0, 10) : "" });
 setTrackingForm({ title: "", description: "", location: "" });
 setTrackingTab("status");
 } catch {
 triggerToast("Failed to load order details.", "error");
 }
 };

 const handleUpdateStatus = async (e) => {
 e.preventDefault();
 if (!statusForm.status) return;
 setUpdatingStatus(true);
 try {
 const payload = {
 status: statusForm.status,
 note: statusForm.note,
 trackingNumber: statusForm.trackingNumber,
 estimatedDelivery: statusForm.estimatedDelivery,
 trackingStep: statusForm.note
 ? { title: statusForm.status, description: statusForm.note }
 : null,
 };
 const data = await orderService.updateOrderStatus(selectedOrder._id, payload);
 const updated = data.order || data;
 setSelectedOrder(updated);
 setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
 triggerToast(`Order updated to ${statusForm.status}.`, "success");
 } catch (err) {
 triggerToast(err.response?.data?.message || "Failed to update order.", "error");
 } finally {
 setUpdatingStatus(false);
 }
 };

 const handleAddTracking = async (e) => {
 e.preventDefault();
 if (!trackingForm.title) return;
 setUpdatingStatus(true);
 try {
 const data = await orderService.addTrackingUpdate(selectedOrder._id, trackingForm);
 const updated = data.order || data;
 setSelectedOrder(updated);
 setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
 setTrackingForm({ title: "", description: "", location: "" });
 triggerToast("Tracking update added.", "success");
 } catch (err) {
 triggerToast(err.response?.data?.message || "Failed to add tracking update.", "error");
 } finally {
 setUpdatingStatus(false);
 }
 };

 const filteredOrders = orders.filter((o) => {
 if (search && !o.orderNumber?.toLowerCase().includes(search.toLowerCase()) &&
 !o.user?.email?.toLowerCase().includes(search.toLowerCase()) &&
 !o.user?.fullName?.toLowerCase().includes(search.toLowerCase())) return false;
 return true;
 });

 return (
 <div className="space-y-5">
 <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
 <div>
 <h2 className="font-sans font-bold text-stone-900 text-sm uppercase tracking-wider">Orders Management</h2>
 <p className="text-[10px] text-stone-400 mt-0.5 font-medium">{orders.length} total orders</p>
 </div>
 <button onClick={fetchOrders} className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors">
 <RefreshCw className="w-3.5 h-3.5" /> Refresh
 </button>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row gap-3 mb-5">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
 <input
 type="text"
 placeholder="Search by order# or customer..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none text-stone-800 placeholder-stone-400"
 />
 </div>
 <div className="relative">
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 outline-none appearance-none cursor-pointer"
 >
 <option value="">All Statuses</option>
 {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
 </select>
 <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
 </div>
 </div>

 {/* Orders Table */}
 {loading ? (
 <div className="flex items-center justify-center py-16">
 <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
 </div>
 ) : filteredOrders.length === 0 ? (
 <div className="text-center py-12 text-stone-400">
 <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
 <p className="text-xs font-medium">No orders found.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-xl border border-stone-100">
 <table className="w-full text-xs">
 <thead className="bg-stone-50">
 <tr>
 {["Order #", "Customer", "Date", "Items", "Total", "Status", "Action"].map((h) => (
 <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-widest text-stone-500 font-mono">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-stone-50">
 {filteredOrders.map((order) => (
 <tr key={order._id} className="hover:bg-stone-50 transition-colors">
 <td className="px-4 py-3 font-mono font-bold text-stone-900">{order.orderNumber}</td>
 <td className="px-4 py-3">
 <p className="font-semibold text-stone-800 truncate max-w-32">{order.user?.fullName || "Guest"}</p>
 <p className="text-[10px] text-stone-400 truncate max-w-32">{order.user?.email || order.guestEmail}</p>
 </td>
 <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
 {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
 </td>
 <td className="px-4 py-3 text-stone-600">{order.items?.length || 0}</td>
 <td className="px-4 py-3 font-mono font-bold text-stone-900">{formatPKR(Number(order.total))}</td>
 <td className="px-4 py-3"><StatusBadge status={order.orderStatus} /></td>
 <td className="px-4 py-3">
 <button
 onClick={() => openOrder(order._id)}
 className="text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider"
 >
 Manage
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Order Detail Panel */}
 <AnimatePresence>
 {selectedOrder && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 20 }}
 className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
 >
 <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
 <div>
 <h3 className="font-sans font-bold text-sm text-stone-900 uppercase tracking-wider">
 {selectedOrder.orderNumber}
 </h3>
 <p className="text-[10px] text-stone-400 mt-0.5">
 {selectedOrder.user?.fullName} • {selectedOrder.user?.email}
 </p>
 </div>
 <div className="flex items-center gap-3">
 <StatusBadge status={selectedOrder.orderStatus} />
 <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

 {/* Left: Items + Shipping */}
 <div className="space-y-4">
 <div>
 <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 font-mono mb-2">Items</p>
 <div className="space-y-2">
 {selectedOrder.items?.map((item, i) => (
 <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50">
 {item.image && <img src={item.image} referrerPolicy="no-referrer" alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-stone-100 shrink-0" />}
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold text-stone-800 truncate">{item.name}</p>
 <p className="text-[10px] text-stone-400 font-mono">×{item.quantity} • {formatPKR(item.price)} each</p>
 </div>
 <span className="font-mono font-bold text-xs text-stone-900 shrink-0">{formatPKR(item.price * item.quantity)}</span>
 </div>
 ))}
 </div>
 </div>

 {selectedOrder.shippingAddress && (
 <div>
 <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 font-mono mb-2 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Shipping Address</p>
 <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-600 space-y-0.5">
 <p className="font-bold text-stone-800">{selectedOrder.shippingAddress.fullName}</p>
 {selectedOrder.shippingAddress.phone && <p>{selectedOrder.shippingAddress.phone}</p>}
 <p>{selectedOrder.shippingAddress.street}</p>
 <p>{[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state, selectedOrder.shippingAddress.postalCode].filter(Boolean).join(", ")}</p>
 <p>{selectedOrder.shippingAddress.country}</p>
 </div>
 </div>
 )}

 {/* Financial Summary */}
 <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1.5">
 {[
 ["Subtotal", formatPKR(Number(selectedOrder.subtotal))],
 ["Coupon Discount", Number(selectedOrder.couponDiscount) > 0 ? ("-" + formatPKR(Number(selectedOrder.couponDiscount))) : null],
 ["Shipping", Number(selectedOrder.shippingFee) === 0 ? "Free" : formatPKR(Number(selectedOrder.shippingFee))],
 ["Tax", formatPKR(Number(selectedOrder.tax))],
 ].filter(([, v]) => v !== null).map(([k, v]) => (
 <div key={k} className="flex justify-between text-stone-500">
 <span>{k}</span><span className="font-mono font-bold">{v}</span>
 </div>
 ))}
 <div className="flex justify-between pt-2 border-t border-stone-200 font-black text-stone-900 text-sm">
 <span>Total</span><span className="font-mono text-amber-600">{formatPKR(Number(selectedOrder.total))}</span>
 </div>
 </div>
 </div>

 {/* Right: Update Status / Add Tracking */}
 <div>
 <div className="flex border-b border-stone-100 mb-4">
 {[["status", "Update Status"], ["tracking", "Add Tracking Update"]].map(([id, label]) => (
 <button
 key={id}
 onClick={() => setTrackingTab(id)}
 className={`px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
 trackingTab === id
 ? "border-amber-500 text-amber-600"
 : "border-transparent text-stone-400 hover:text-stone-700"
 }`}
 >
 {label}
 </button>
 ))}
 </div>

 {trackingTab === "status" && (
 <form onSubmit={handleUpdateStatus} className="space-y-3">
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">New Status</label>
 <select
 value={statusForm.status}
 onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800"
 >
 {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Tracking Number</label>
 <input
 type="text"
 placeholder="MDS-TRK-XXXXXXX"
 value={statusForm.trackingNumber}
 onChange={(e) => setStatusForm((f) => ({ ...f, trackingNumber: e.target.value }))}
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400"
 />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Estimated Delivery</label>
 <input
 type="date"
 value={statusForm.estimatedDelivery}
 onChange={(e) => setStatusForm((f) => ({ ...f, estimatedDelivery: e.target.value }))}
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800"
 />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Note (optional)</label>
 <textarea
 rows={2}
 placeholder="Add an internal note about this status change..."
 value={statusForm.note}
 onChange={(e) => setStatusForm((f) => ({ ...f, note: e.target.value }))}
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400 resize-none"
 />
 </div>
 <button
 type="submit"
 disabled={updatingStatus}
 className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors disabled:opacity-60 shadow-sm"
 >
 {updatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
 Update Status
 </button>
 </form>
 )}

 {trackingTab === "tracking" && (
 <form onSubmit={handleAddTracking} className="space-y-3">
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Title *</label>
 <input
 type="text"
 placeholder="e.g. Package arrived at sorting facility"
 value={trackingForm.title}
 onChange={(e) => setTrackingForm((f) => ({ ...f, title: e.target.value }))}
 required
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400"
 />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Description</label>
 <textarea
 rows={2}
 placeholder="Additional details..."
 value={trackingForm.description}
 onChange={(e) => setTrackingForm((f) => ({ ...f, description: e.target.value }))}
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400 resize-none"
 />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Location</label>
 <input
 type="text"
 placeholder="e.g. London Heathrow Hub"
 value={trackingForm.location}
 onChange={(e) => setTrackingForm((f) => ({ ...f, location: e.target.value }))}
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400"
 />
 </div>
 <button
 type="submit"
 disabled={updatingStatus}
 className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors disabled:opacity-60 shadow-sm"
 >
 {updatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
 Add Tracking Update
 </button>
 </form>
 )}

 {/* Tracking History */}
 {selectedOrder.trackingSteps?.length > 0 && (
 <div className="mt-5 pt-5 border-t border-stone-100">
 <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 font-mono mb-3">History</p>
 <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
 {[...selectedOrder.trackingSteps].reverse().map((step, i) => (
 <div key={i} className="flex items-start gap-2.5 text-xs">
 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
 <div className="min-w-0 flex-1">
 <div className="flex justify-between gap-2">
 <p className="font-bold text-stone-800">{step.title}</p>
 <span className="text-[9px] text-stone-400 font-mono shrink-0">{new Date(step.timestamp).toLocaleDateString()}</span>
 </div>
 {step.description && <p className="text-[10px] text-stone-400">{step.description}</p>}
 {step.location && <p className="text-[10px] text-stone-400 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{step.location}</p>}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
