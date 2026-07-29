import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Package, Truck, CheckCircle, Clock, MapPin, Box,
  Home, RefreshCw, XCircle, Copy, Check, AlertCircle,
} from "lucide-react";
import { orderService } from "../services/orderService";
import Breadcrumb from "../components/Breadcrumb";

const ORDER_FLOW = [
  { status: "Pending",          label: "Order Placed",     icon: Clock },
  { status: "Confirmed",        label: "Confirmed",        icon: CheckCircle },
  { status: "Processing",       label: "Processing",       icon: RefreshCw },
  { status: "Packed",           label: "Packed",           icon: Box },
  { status: "Shipped",          label: "Shipped",          icon: Truck },
  { status: "Out For Delivery", label: "Out For Delivery", icon: MapPin },
  { status: "Delivered",        label: "Delivered",        icon: Home },
];

const STATUS_BG = {
  Pending: "bg-amber-500", Confirmed: "bg-sky-500", Processing: "bg-violet-500",
  Packed: "bg-orange-500", Shipped: "bg-blue-500", "Out For Delivery": "bg-indigo-500",
  Delivered: "bg-emerald-500", Cancelled: "bg-rose-500", Returned: "bg-stone-400",
  Refunded: "bg-teal-500",
};

const STATUS_TEXT = {
  Pending: "text-amber-600", Confirmed: "text-sky-600", Processing: "text-violet-600",
  Packed: "text-orange-600", Shipped: "text-blue-600", "Out For Delivery": "text-indigo-600",
  Delivered: "text-emerald-600", Cancelled: "text-rose-600", Returned: "text-stone-500",
  Refunded: "text-teal-600",
};

const STATUS_BORDER = {
  Pending: "border-amber-200 bg-amber-50", Confirmed: "border-sky-200 bg-sky-50",
  Processing: "border-violet-200 bg-violet-50", Packed: "border-orange-200 bg-orange-50",
  Shipped: "border-blue-200 bg-blue-50", "Out For Delivery": "border-indigo-200 bg-indigo-50",
  Delivered: "border-emerald-200 bg-emerald-50", Cancelled: "border-rose-200 bg-rose-50",
  Returned: "border-stone-200 bg-stone-100", Refunded: "border-teal-200 bg-teal-50",
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-search when arriving from a link with ?q=
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setError("");
      setOrder(null);
      (async () => {
        setLoading(true);
        try {
          const data = await orderService.trackOrder(q);
          setOrder(data.order || data.data?.order || data);
        } catch (err) {
          setError(err?.response?.data?.message || "No order found. Please check the number and try again.");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [searchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const data = await orderService.trackOrder(query.trim());
      setOrder(data.order || data.data?.order || data);
    } catch (err) {
      setError(err?.response?.data?.message || "No order found. Please check the number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const val = order?.trackingNumber || order?.orderNumber;
    if (val) {
      navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCancelled = order && ["Cancelled", "Returned", "Refunded"].includes(order.orderStatus);
  const currentFlowIdx = order ? ORDER_FLOW.findIndex((s) => s.status === order.orderStatus) : -1;

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <Breadcrumb items={[{ label: "Track Order" }]} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* Hero header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5">
            <Truck className="w-3.5 h-3.5" />
            Live Shipment Tracking
          </div>
          <h1 className="font-sans font-black text-3xl sm:text-4xl text-stone-900 tracking-tight mb-3">
            Track Your Order
          </h1>
          <p className="text-sm text-stone-500 font-medium max-w-sm mx-auto leading-relaxed">
            Enter your order number or tracking ID to get real-time delivery updates.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 bg-white border border-stone-200 rounded-2xl p-2 shadow-sm focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
            <div className="flex items-center pl-2.5">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
            </div>
            <input
              type="text"
              placeholder="Order # (MDS-123456) or Tracking ID (MSAC-…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-stone-800 placeholder-stone-400 outline-none px-2 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-[11px] font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-all shrink-0"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              Track
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {/* Error state */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-4 text-sm font-medium flex items-start gap-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              {error}
            </motion.div>
          )}

          {/* Result */}
          {order && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Summary card */}
              <div className="bg-white rounded-2xl border border-stone-150 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1 font-mono">Order Number</p>
                    <p className="font-mono font-black text-lg text-stone-900 tracking-widest">{order.orderNumber}</p>
                    <p className="text-[10px] text-stone-400 font-medium mt-1">
                      Placed {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${STATUS_BORDER[order.orderStatus] || "border-stone-200 bg-stone-50"} ${STATUS_TEXT[order.orderStatus] || "text-stone-600"}`}>
                      {order.orderStatus}
                    </span>
                    {order.itemCount > 0 && (
                      <p className="text-[10px] text-stone-400 font-mono font-medium">{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {/* Tracking ID */}
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between bg-stone-50 border border-stone-150 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-0.5 font-mono">Tracking ID</p>
                        <p className="font-mono font-bold text-sm text-stone-800 tracking-widest">{order.trackingNumber}</p>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-3 py-1.5 rounded-lg transition-all"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  )}

                  {/* Estimated delivery */}
                  {order.estimatedDelivery && order.orderStatus !== "Delivered" && !isCancelled && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-700">Estimated Delivery</p>
                        <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                          {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delivered confirmation */}
                  {order.deliveredAt && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-700">Delivered Successfully</p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                          {new Date(order.deliveredAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cancelled */}
                  {isCancelled && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-700">Order {order.orderStatus}</p>
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                          This order has been {order.orderStatus.toLowerCase()}. For assistance please contact customer care.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shipping destination */}
                  {order.shippingAddress?.city && (
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-medium pt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      Shipping to{" "}
                      <span className="font-bold text-stone-700">
                        {order.shippingAddress.city}
                        {(order.shippingAddress.state || order.shippingAddress.province) ? `, ${order.shippingAddress.state || order.shippingAddress.province}` : ""}
                        {order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress timeline */}
              {!isCancelled && (
                <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-6">
                  <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-900 mb-6">
                    Shipment Progress
                  </h2>
                  <div className="relative">
                    <div className="absolute left-[18px] top-6 bottom-3 w-0.5 bg-stone-100" />
                    <div className="space-y-5">
                      {ORDER_FLOW.map((step, idx) => {
                        const isCompleted = currentFlowIdx >= idx;
                        const isCurrent = currentFlowIdx === idx;
                        const Icon = step.icon;
                        const dotBg = isCompleted
                          ? STATUS_BG[order.orderStatus] || "bg-amber-500"
                          : "bg-stone-100";

                        return (
                          <motion.div
                            key={step.status}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative flex items-start gap-4 pl-1"
                          >
                            <div
                              className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${dotBg} ${
                                isCurrent ? "ring-2 ring-offset-2 ring-offset-white ring-amber-400 shadow-sm" : ""
                              }`}
                            >
                              <Icon className={`w-[11px] h-[11px] ${isCompleted ? "text-white" : "text-stone-300"}`} />
                            </div>
                            <div className={`min-w-0 transition-opacity ${isCompleted ? "opacity-100" : "opacity-30"}`}>
                              <p className={`text-xs font-bold ${isCurrent ? "text-stone-900" : isCompleted ? "text-stone-700" : "text-stone-400"}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-[10px] text-amber-600 font-medium mt-0.5">Current status</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed update log */}
              {order.trackingSteps && order.trackingSteps.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-6">
                  <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-900 mb-5">
                    Detailed Updates
                  </h2>
                  <div className="space-y-4">
                    {[...order.trackingSteps].reverse().map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-start gap-3"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${STATUS_BG[step.status] || "bg-stone-300"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold text-stone-900">{step.title}</p>
                              {step.description && (
                                <p className="text-[10px] text-stone-500 mt-0.5 font-medium">{step.description}</p>
                              )}
                              {step.location && (
                                <p className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {step.location}
                                </p>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 font-mono shrink-0 mt-0.5 whitespace-nowrap">
                              {new Date(step.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                              {new Date(step.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Idle empty state */}
          {!order && !error && !loading && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-5 border border-stone-150">
                <Package className="w-9 h-9 text-stone-300" />
              </div>
              <p className="text-sm text-stone-400 font-medium">Your tracking details will appear here</p>
              <p className="text-xs text-stone-300 mt-1.5">Find your order number in your confirmation email</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
