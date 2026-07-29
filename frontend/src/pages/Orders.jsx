import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
 Package,
 ArrowRight,
 Clock,
 CheckCircle,
 Truck,
 XCircle,
 AlertCircle,
 RotateCcw,
 RefreshCw,
 ShoppingBag,
 ChevronRight,
} from "lucide-react";
import { orderService } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import Breadcrumb from "../components/Breadcrumb";
import EmptyState from "../components/ui/EmptyState";
import { formatPKR } from "../utils/currency";

const STATUS_CONFIG = {
 Pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
 Confirmed: { color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", icon: CheckCircle },
 Processing: { color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", icon: RefreshCw },
 Packed: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Package },
 Shipped: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Truck },
 "Out For Delivery": { color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: Truck },
 Delivered: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
 Cancelled: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: XCircle },
 Returned: { color: "text-stone-600", bg: "bg-stone-100", border: "border-stone-200", icon: RotateCcw },
 Refunded: { color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", icon: AlertCircle },
};

function StatusBadge({ status }) {
 const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
 const Icon = cfg.icon;
 return (
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
 <Icon className="w-3 h-3" />
 {status}
 </span>
 );
}

export default function Orders() {
 const { user } = useAuth();
 const navigate = useNavigate();
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
 const fetchOrders = async () => {
 try {
 const data = await orderService.getMyOrders();
 setOrders(Array.isArray(data) ? data : data.orders || data.data || []);
 } catch {
 setError("Unable to load orders. Please try again.");
 } finally {
 setLoading(false);
 }
 };
 fetchOrders();
 }, []);

 if (loading) {
 return (
 <div className="min-h-screen bg-stone-50 flex items-center justify-center">
 <div className="w-10 h-10 rounded-full border-4 border-stone-200 border-t-amber-500 animate-spin" />
 </div>
 );
 }

 return (
 <div id="orders-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900 transition-colors">
 <Breadcrumb items={[{ label: "My Orders" }]} />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
 <div>
 <h1 className="font-sans font-black text-3xl text-stone-900 tracking-tight">
 My Orders
 </h1>
 <p className="text-xs text-stone-400 mt-1 font-medium">
 {user?.fullName ? `Welcome, ${user.fullName.split(" ")[0]}` : "Your order history"}
 </p>
 </div>
 <Link
 to="/shop"
 className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-widest transition-colors shadow-sm"
 >
 <ShoppingBag className="w-4 h-4" />
 Continue Shopping
 </Link>
 </div>

 {error && (
 <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-xs font-medium mb-6">
 {error}
 </div>
 )}

 {orders.length === 0 && !error ? (
 <div className="bg-white rounded-3xl border border-stone-100 max-w-xl mx-auto shadow-sm overflow-hidden">
   <EmptyState
     variant="orders"
     title="No orders yet"
     description="You haven't placed any orders yet. Explore our luxury collections and find something you love."
     action={{ label: "Browse Collection", to: "/shop" }}
   />
 </div>
 ) : (
 <div className="space-y-4">
 {orders.map((order, i) => (
 <motion.div
 key={order._id}
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.04 }}
 className="bg-white rounded-2xl border border-stone-150 shadow-xs overflow-hidden hover:border-amber-300 transition-colors"
 >
 <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100">
 <div className="flex items-center gap-4">
 <div className="p-2 bg-stone-100 rounded-xl">
 <Package className="w-4 h-4 text-amber-500" />
 </div>
 <div>
 <span className="font-mono text-xs font-bold text-stone-900 tracking-widest">
 {order.orderNumber}
 </span>
 <p className="text-[10px] text-stone-400 font-medium mt-0.5">
 {new Date(order.createdAt).toLocaleDateString("en-US", {
 year: "numeric", month: "long", day: "numeric",
 })}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <StatusBadge status={order.orderStatus} />
 <span className="font-mono font-bold text-sm text-stone-900">
 {formatPKR(Number(order.total))}
 </span>
 </div>
 </div>

 <div className="px-5 py-4">
 <div className="flex items-center gap-3 flex-wrap">
 {order.items?.slice(0, 3).map((item, idx) => (
 <div key={idx} className="flex items-center gap-2">
 {item.image && (
 <img
 src={item.image}
 alt={item.name}
 referrerPolicy="no-referrer"
 className="w-10 h-10 rounded-lg object-cover border border-stone-100"
 />
 )}
 <div className="min-w-0">
 <p className="text-xs font-semibold text-stone-800 truncate max-w-32">{item.name}</p>
 <p className="text-[10px] text-stone-400 font-mono">×{item.quantity}</p>
 </div>
 </div>
 ))}
 {order.items?.length > 3 && (
 <span className="text-[10px] text-stone-400 font-medium">+{order.items.length - 3} more</span>
 )}
 </div>

 <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="text-[10px] text-stone-400 font-medium space-y-0.5">
 <span className="block">
 {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} •{" "}
 {order.paymentMethod}
 </span>
 {order.estimatedDelivery && order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
 <span className="block text-amber-600">
 Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
 </span>
 )}
 </div>
 <Link
 to={`/orders/${order._id}`}
 className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
 >
 Track Order
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
