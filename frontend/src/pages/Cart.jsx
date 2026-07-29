import { useNavigate, Link } from "react-router-dom";
import { Trash2, ArrowRight, Percent, Sparkles, Truck, AlertCircle } from "lucide-react";
import { useState } from "react";

import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Breadcrumb from "../components/Breadcrumb";
import api from "../services/api";
import { formatPKR, calcSalePrice, SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } from "../utils/currency";
import EmptyState from "../components/ui/EmptyState";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponFeedback, setCouponFeedback] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getCartTotal();
  const shippingCost = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const discountAmount = Math.round(appliedDiscount);
  const taxableBasis = subtotal - discountAmount;
  const taxCost = Math.round(taxableBasis * TAX_RATE);
  const grandTotal = taxableBasis + shippingCost + taxCost;
  const hasOosItems = cartItems.some((item) => (item.product.stock ?? 1) <= 0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setCouponLoading(true);
    setCouponFeedback("");
    try {
      const { data } = await api.post("/coupons/validate", { code: cleanCode, subtotal });
      const discountValue = data.discount || 0;
      setAppliedDiscount(discountValue);
      setAppliedCouponCode(cleanCode);
      setCouponFeedback(`Coupon ${cleanCode} applied! You save ${formatPKR(discountValue)}.`);
      showToast(`Coupon applied — ${formatPKR(discountValue)} off!`, "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid coupon code.";
      setCouponFeedback(msg);
      setAppliedDiscount(0);
      setAppliedCouponCode("");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setAppliedCouponCode("");
    setCouponCode("");
    setCouponFeedback("");
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    navigate("/checkout", { state: { appliedCouponCode: appliedCouponCode || null } });
  };

  return (
    <div id="cart-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900 transition-colors">
      <Breadcrumb items={[{ label: "Shopping Bag" }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h1 className="font-sans font-black text-3xl text-stone-900 tracking-tight mb-8 flex items-center gap-3">
          Your Shopping Bag
          <span className="text-sm font-semibold tracking-widest font-mono text-stone-400 uppercase">
            ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
          </span>
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: ITEMS (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cartItems.map((item) => {
                const pid = item.product._id || item.product.id;
                const finalProductPrice = calcSalePrice(item.product.price, item.product.discount);
                const itemTotal = finalProductPrice * item.quantity;
                const isOos   = (item.product.stock ?? 1) <= 0;
                const isAtMax = !isOos && item.quantity >= (item.product.stock ?? 999);
                return (
                  <div
                    key={pid}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-150 shadow-xxs flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between animate-fade-in"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Link
                        to={`/product/${pid}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-100"
                      >
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                      </Link>

                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase">
                          {item.product.brand}
                        </span>
                        <Link to={`/product/${pid}`} className="hover:text-amber-600 transition-colors">
                          <h3 className="font-sans font-bold text-sm text-stone-900 leading-snug">
                            {item.product.name}
                          </h3>
                        </Link>
                        <div className="flex gap-4 text-xxs text-stone-400 mt-1.5 font-mono">
                          <span>
                            COLOR:{" "}
                            <strong className="text-stone-900">{item.selectedColor || item.product.color}</strong>
                          </span>
                          {item.product.material && (
                            <span>
                              MATERIAL: <strong className="text-stone-900">{item.product.material}</strong>
                            </span>
                          )}
                        </div>
                        {isOos && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            <AlertCircle className="w-2.5 h-2.5" /> Out of Stock — Remove to proceed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 w-full sm:w-auto">
                      <div className="flex items-center border border-stone-200 rounded-lg px-2 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(pid, item.quantity - 1)}
                          className="p-1 px-2 text-stone-500 hover:text-stone-900 font-bold"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono text-stone-855">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(pid, item.quantity + 1)}
                          disabled={isAtMax || isOos}
                          className="p-1 px-2 text-stone-500 hover:text-stone-900 font-bold disabled:opacity-25 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-stone-900 font-mono block">
                          {formatPKR(itemTotal)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            {formatPKR(finalProductPrice)} each
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(pid);
                          showToast(`Removed "${item.product.name}" from cart.`, "info");
                        }}
                        className="p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-50 rounded-lg transition-all"
                        title="Remove item"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: SUMMARY + COUPON (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white border border-stone-150 rounded-2xl p-6 shadow-xs">
                <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 mb-4 pb-2 border-b border-stone-100">
                  Order Summary
                </h3>

                <div className="space-y-3.5 text-xs text-stone-605 font-sans">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-stone-900">{formatPKR(subtotal)}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-amber-600 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Coupon ({appliedCouponCode})
                      </span>
                      <span className="font-mono text-right">−{formatPKR(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-stone-400" /> Shipping
                    </span>
                    <span className="font-mono text-stone-900">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase text-[10px] border border-emerald-100/30">
                          Free
                        </span>
                      ) : (
                        formatPKR(shippingCost)
                      )}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <p className="text-[10px] text-stone-400 leading-normal font-serif">
                      Add{" "}
                      <span className="font-mono font-bold text-stone-650">
                        {formatPKR(SHIPPING_THRESHOLD - subtotal)}
                      </span>{" "}
                      more for free shipping.
                    </p>
                  )}

                  <div className="flex justify-between">
                    <span>Tax (17% GST)</span>
                    <span className="font-mono text-stone-900">{formatPKR(taxCost)}</span>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-stone-100 text-sm font-black text-stone-900">
                    <span className="uppercase tracking-wider">Total</span>
                    <span className="font-mono text-base text-stone-950">{formatPKR(grandTotal)}</span>
                  </div>
                </div>

                {hasOosItems && (
                  <div className="flex items-start gap-2 mt-4 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-rose-600 font-semibold leading-relaxed">
                      One or more items are out of stock. Remove them to continue to checkout.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.length === 0 || hasOosItems}
                  className={`w-full font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 shadow-lg ${
                    hasOosItems
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                      : "bg-stone-950 hover:bg-stone-800 text-white"
                  }`}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* Coupon Code */}
              <div className="bg-white border border-stone-150 rounded-2xl p-5 shadow-xs">
                <h4 className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mb-3 flex items-center gap-1">
                  <Percent className="w-4.5 h-4.5 text-amber-500" /> Promo Code
                </h4>

                {appliedCouponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-mono font-bold text-emerald-700">{appliedCouponCode}</span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-[10px] font-bold text-stone-400 hover:text-rose-500 transition-colors uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleApplyCoupon}
                    className="flex gap-2 p-1.5 bg-stone-50 border border-stone-200 rounded-xl focus-within:ring-1 focus-within:ring-amber-500"
                  >
                    <input
                      type="text"
                      placeholder="e.g. WELCOME15"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-400 border-none outline-none font-mono px-2"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-stone-900 hover:bg-stone-800 text-white text-[9px] font-bold px-3.5 py-2.5 rounded-lg uppercase tracking-wider shrink-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </form>
                )}

                {couponFeedback && !appliedCouponCode && (
                  <p className="text-[10px] font-mono mt-2.5 text-rose-500">{couponFeedback}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-100 max-w-xl mx-auto my-8 shadow-sm overflow-hidden">
            <EmptyState
              variant="cart"
              title="Your shopping bag is empty"
              description="Browse our collections and add your favourite pieces before checking out."
              action={{ label: "Browse Collection", to: "/shop" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
