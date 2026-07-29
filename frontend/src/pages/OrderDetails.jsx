import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
 Package,
 Truck,
 CheckCircle,
 Clock,
 XCircle,
 RotateCcw,
 AlertCircle,
 MapPin,
 CreditCard,
 ArrowLeft,
 RefreshCw,
 Box,
 Home,
 Copy,
 Check,
 ExternalLink,
} from "lucide-react";
import { orderService } from "../services/orderService";
import { useToast } from "../context/ToastContext";
import Breadcrumb from "../components/Breadcrumb";
import { formatPKR } from "../utils/currency";

const ORDER_FLOW = [
 { status: "Pending", label: "Order Placed", icon: Clock, description: "Your order has been received." },
 { status: "Confirmed", label: "Confirmed", icon: CheckCircle, description: "Order confirmed by our team." },
 { status: "Processing", label: "Processing", icon: RefreshCw, description: "Your items are being prepared." },
 { status: "Packed", label: "Packed", icon: Box, description: "Order securely packed." },
 { status: "Shipped", label: "Shipped", icon: Truck, description: "On its way to the delivery hub." },
 { status: "Out For Delivery", label: "Out For Delivery", icon: MapPin, description: "Courier is out for delivery." },
 { status: "Delivered", label: "Delivered", icon: Home, description: "Package delivered successfully." },
];

const STATUS_COLOR = {
 Pending: "text-amber-500",
 Confirmed: "text-sky-500",
 Processing: "text-violet-500",
 Packed: "text-orange-500",
 Shipped: "text-blue-500",
 "Out For Delivery": "text-indigo-500",
 Delivered: "text-emerald-500",
 Cancelled: "text-rose-500",
 Returned: "text-stone-500",
 Refunded: "text-teal-500",
};

const STATUS_BG = {
 Pending: "bg-amber-500",
 Confirmed: "bg-sky-500",
 Processing: "bg-violet-500",
 Packed: "bg-orange-500",
 Shipped: "bg-blue-500",
 "Out For Delivery": "bg-indigo-500",
 Delivered: "bg-emerald-500",
 Cancelled: "bg-rose-500",
 Returned: "bg-stone-500",
 Refunded: "bg-teal-500",
};

function getFlowIndex(status) {
 return ORDER_FLOW.findIndex((s) => s.status === status);
}

export default function OrderDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { showToast } = useToast();
 const [order, setOrder] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [cancelling, setCancelling] = useState(false);
 const [confirmCancel, setConfirmCancel] = useState(false);
 const [copied, setCopied] = useState(false);

 const handleCopyTracking = () => {
 if (order?.trackingNumber) {
 navigator.clipboard.writeText(order.trackingNumber);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }
 };

 useEffect(() => {
 const fetchOrder = async () => {
 try {
 const data = await orderService.getOrderById(id);
 setOrder(data.order || data);
 } catch {
 setError("Order not found or you are not authorized to view it.");
 } finally {
 setLoading(false);
 }
 };
 fetchOrder();
 }, [id]);

 const handleCancelOrder = async () => {
 setCancelling(true);
 try {
 const data = await orderService.cancelOrder(id);
 setOrder(data.order || data);
 setConfirmCancel(false);
 showToast("Order cancelled successfully.", "success");
 } catch (err) {
 showToast(err.response?.data?.message || "Could not cancel this order.", "error");
 } finally {
 setCancelling(false);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-stone-50 flex items-center justify-center">
 <div className="w-10 h-10 rounded-full border-4 border-stone-200 border-t-amber-500 animate-spin" />
 </div>
 );
 }

 if (error || !order) {
 return (
 <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4 px-4">
 <div className="p-5 bg-rose-50 rounded-2xl text-rose-500 border border-rose-100">
 <XCircle className="w-12 h-12" />
 </div>
 <h2 className="font-sans font-black text-xl text-stone-900">{error || "Order not found"}</h2>
 <Link to="/orders" className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
 <ArrowLeft className="w-4 h-4" /> Back to Orders
 </Link>
 </div>
 );
 }

 const isCancelled = ["Cancelled", "Returned", "Refunded"].includes(order.orderStatus);
 const currentFlowIdx = getFlowIndex(order.orderStatus);
 const canCancel = !["Shipped", "Out For Delivery", "Delivered", "Cancelled", "Returned", "Refunded"].includes(order.orderStatus);

 return (
 <div id="order-details-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900 transition-colors">
 <Breadcrumb items={[{ label: "Orders", to: "/orders" }, { label: order.orderNumber }]} />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div>
 <button
 onClick={() => navigate("/orders")}
 className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-3 transition-colors"
 >
 <ArrowLeft className="w-4 h-4" /> Back to orders
 </button>
 <h1 className="font-sans font-black text-2xl text-stone-900 tracking-tight">
 {order.orderNumber}
 </h1>
 <p className="text-xs text-stone-400 mt-1 font-medium">
 Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
 </p>
 </div>
 <div className="flex items-center gap-3">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${STATUS_COLOR[order.orderStatus]} bg-stone-50 border-stone-200`}>
 {order.orderStatus}
 </span>
 {canCancel && (
 confirmCancel ? (
 <div className="flex items-center gap-2">
 <span className="text-xs text-stone-500 font-medium">Cancel this order?</span>
 <button onClick={handleCancelOrder} disabled={cancelling} className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60">
 {cancelling ? "Cancelling..." : "Yes, Cancel"}
 </button>
 <button onClick={() => setConfirmCancel(false)} disabled={cancelling} className="text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
 Keep
 </button>
 </div>
 ) : (
 <button onClick={() => setConfirmCancel(true)} className="text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors">
 Cancel Order
 </button>
 )
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

 {/* LEFT: Tracking + Items */}
 <div className="lg:col-span-2 space-y-6">

 {/* Tracking Timeline */}
 {!isCancelled ? (
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-stone-900">
 Order Tracking
 </h2>
 {order.trackingNumber && (
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg font-bold tracking-widest border border-stone-200">
 {order.trackingNumber}
 </span>
 <button
 onClick={handleCopyTracking}
 className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
 title="Copy tracking number"
 >
 {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
 </button>
 <Link
 to={`/track-order?q=${order.trackingNumber}`}
 className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-700 font-bold transition-colors"
 title="Open public tracking page"
 >
 <ExternalLink className="w-3 h-3" />
 Track
 </Link>
 </div>
 )}
 </div>

 {order.estimatedDelivery && order.orderStatus !== "Delivered" && (
 <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
 <Truck className="w-4 h-4 text-amber-500 shrink-0" />
 <div>
 <p className="text-xs font-bold text-amber-700">Estimated Delivery</p>
 <p className="text-[10px] text-amber-600 font-medium mt-0.5">
 {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
 </p>
 </div>
 </div>
 )}

 {/* Progress Steps */}
 <div className="relative">
 <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-stone-100" />

 <div className="space-y-6">
 {ORDER_FLOW.map((step, idx) => {
 const isCompleted = currentFlowIdx >= idx;
 const isCurrent = currentFlowIdx === idx;
 const Icon = step.icon;
 const dotBg = isCompleted
 ? STATUS_BG[order.orderStatus] || "bg-amber-500"
 : "bg-stone-200";

 return (
 <motion.div
 key={step.status}
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: idx * 0.06 }}
 className="relative flex items-start gap-4 pl-2"
 >
 <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${dotBg} ${isCurrent ? "ring-2 ring-offset-2 ring-offset-white ring-amber-400" : ""}`}>
 <Icon className={`w-3 h-3 ${isCompleted ? "text-white" : "text-stone-400"}`} />
 </div>
 <div className={`min-w-0 transition-opacity ${isCompleted ? "opacity-100" : "opacity-40"}`}>
 <p className={`text-xs font-bold ${isCurrent ? "text-stone-900" : "text-stone-600"}`}>
 {step.label}
 </p>
 <p className="text-[10px] text-stone-400 leading-relaxed mt-0.5">
 {step.description}
 </p>
 </div>
 {isCurrent && (
 <span className="ml-auto shrink-0 text-[9px] font-extrabold uppercase tracking-widest text-amber-600 font-mono bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
 Current
 </span>
 )}
 </motion.div>
 );
 })}
 </div>
 </div>

 {/* Detailed Tracking Updates */}
 {order.trackingSteps?.length > 0 && (
 <div className="mt-8 pt-6 border-t border-stone-100">
 <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 font-mono mb-4">
 Tracking Updates
 </h3>
 <div className="space-y-3">
 {[...order.trackingSteps].reverse().map((step, idx) => (
 <div key={idx} className="flex items-start gap-3 text-xs">
 <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_BG[step.status] || "bg-stone-400"}`} />
 <div className="min-w-0 flex-1">
 <div className="flex items-start justify-between gap-2">
 <p className="font-bold text-stone-800">{step.title}</p>
 <span className="text-[10px] text-stone-400 font-mono shrink-0">
 {new Date(step.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
 {" "}{new Date(step.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
 </span>
 </div>
 {step.description && <p className="text-[10px] text-stone-400 mt-0.5">{step.description}</p>}
 {step.location && <p className="text-[10px] text-stone-400 font-mono mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{step.location}</p>}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ) : (
 <div className="bg-white rounded-2xl border border-rose-100 shadow-xs p-6 flex items-center gap-4">
 <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
 <XCircle className="w-6 h-6" />
 </div>
 <div>
 <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
 Order {order.orderStatus}
 </h2>
 <p className="text-xs text-stone-400 mt-1">
 {order.orderStatus === "Cancelled" && order.cancelledAt && `Cancelled on ${new Date(order.cancelledAt).toLocaleDateString()}`}
 {order.orderStatus === "Returned" && order.returnedAt && `Returned on ${new Date(order.returnedAt).toLocaleDateString()}`}
 {order.orderStatus === "Refunded" && "Refund has been processed."}
 </p>
 </div>
 </div>
 )}

 {/* Order Items */}
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs overflow-hidden">
 <div className="px-6 py-4 border-b border-stone-100">
 <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-stone-900">
 Items Ordered ({order.items?.length})
 </h2>
 </div>
 <div className="divide-y divide-stone-50">
 {order.items?.map((item, idx) => (
 <div key={idx} className="px-6 py-4 flex items-center gap-4">
 {item.image && (
 <img
 src={item.image}
 alt={item.name}
 referrerPolicy="no-referrer"
 className="w-14 h-14 rounded-xl object-cover border border-stone-100 shrink-0"
 />
 )}
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
 {item.selectedColor && (
 <p className="text-[10px] text-stone-400 font-mono mt-0.5">Color: {item.selectedColor}</p>
 )}
 <p className="text-[10px] text-stone-400 font-mono">Qty: {item.quantity}</p>
 </div>
 <div className="text-right shrink-0">
 <p className="font-mono font-bold text-sm text-stone-900">
 {formatPKR(item.price * item.quantity)}
 </p>
 <p className="text-[10px] text-stone-400 font-mono">{formatPKR(item.price)} each</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* RIGHT: Summary + Shipping */}
 <div className="space-y-5">

 {/* Order Summary */}
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-5">
 <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-900 mb-4 pb-3 border-b border-stone-100">
 Order Summary
 </h2>
 <div className="space-y-2.5 text-xs text-stone-600">
 <div className="flex justify-between">
 <span>Subtotal</span>
 <span className="font-mono font-bold text-stone-900">{formatPKR(Number(order.subtotal))}</span>
 </div>
 {Number(order.couponDiscount) > 0 && (
 <div className="flex justify-between text-emerald-600">
 <span>Coupon Discount</span>
 <span className="font-mono font-bold">{formatPKR(Number(order.couponDiscount))}</span>
 </div>
 )}
 <div className="flex justify-between">
 <span>Shipping</span>
 <span className="font-mono font-bold text-stone-900">
 {Number(order.shippingFee) === 0 ? (
 <span className="text-emerald-600 text-[10px] uppercase font-bold tracking-wide">Free</span>
 ) : formatPKR(Number(order.shippingFee))}
 </span>
 </div>
 <div className="flex justify-between">
 <span>Tax</span>
 <span className="font-mono font-bold text-stone-900">{formatPKR(Number(order.tax))}</span>
 </div>
 <div className="flex justify-between pt-3 border-t border-stone-100 text-sm font-black text-stone-900">
 <span>Total</span>
 <span className="font-mono text-amber-600">{formatPKR(Number(order.total))}</span>
 </div>
 </div>
 </div>

 {/* Payment Info */}
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-5">
 <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-900 mb-3 pb-2 border-b border-stone-100">
 Payment
 </h2>
 <div className="flex items-center gap-2.5">
 <div className="p-2 bg-stone-100 rounded-lg">
 <CreditCard className="w-4 h-4 text-stone-500" />
 </div>
 <div>
 <p className="text-xs font-bold text-stone-800">{order.paymentMethod}</p>
 <p className={`text-[10px] font-bold mt-0.5 ${
 order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"
 }`}>{order.paymentStatus}</p>
 </div>
 </div>
 </div>

 {/* Shipping Address */}
 {order.shippingAddress && (
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-5">
 <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-900 mb-3 pb-2 border-b border-stone-100">
 Shipping To
 </h2>
 <div className="flex items-start gap-2.5">
 <div className="p-2 bg-stone-100 rounded-lg mt-0.5">
 <MapPin className="w-4 h-4 text-stone-500" />
 </div>
 <div className="text-xs text-stone-600 leading-relaxed">
 <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
 {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
 {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
 <p>
 {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
 .filter(Boolean).join(", ")}
 </p>
 {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
 </div>
 </div>
 </div>
 )}

 {/* Actions */}
 <Link
 to="/shop"
 className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors"
 >
 <Package className="w-4 h-4" />
 Continue Shopping
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
