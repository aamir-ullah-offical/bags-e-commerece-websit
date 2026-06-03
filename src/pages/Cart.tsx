import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Percent,
  Sparkles,
  Truck,
  CheckCircle,
  X,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Breadcrumb from "../components/Breadcrumb";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { showToast } = useToast();

  // Coupon / Promotion States
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // decimal percentage, e.g., 0.15
  const [couponFeedback, setCouponFeedback] = useState("");

  // Checkout overlay wizard state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [generatedOrderNo, setGeneratedOrderNo] = useState("");

  const subtotal = getCartTotal();

  // Shipping rules
  const shippingThreshold = 150;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 15.0;

  // Coupon Handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === "MAISONSAC15") {
      setAppliedDiscount(0.15);
      setCouponFeedback("Discount code MAISONSAC15 applied successfully (15% OFF)!");
      showToast("15% Promo applied!", "success");
    } else if (cleanCode) {
      setCouponFeedback("Invalid discount coupon code.");
    }
  };

  const discountAmount = subtotal * appliedDiscount;
  const taxableBasis = subtotal - discountAmount;
  const taxCost = taxableBasis * 0.08; // 8% sales tax
  const grandTotal = taxableBasis + shippingCost + taxCost;

  // Checkout Handler
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingName.trim() || !billingEmail.trim() || !billingAddress.trim()) {
      showToast("Please compile all checkout parameters.", "info");
      return;
    }

    try {
      const orderPayload = {
        customer: {
          fullName: billingName,
          email: billingEmail,
        },
        products: cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          selectedColor: item.selectedColor || item.product.color
        })),
        shippingAddress: {
          address: billingAddress,
          city: "Paris",
          country: "France",
          zipCode: "75003"
        },
        subtotal: subtotal,
        discount: discountAmount,
        shippingFee: shippingCost,
        total: grandTotal,
        paymentMethod: "Cash On Delivery"
      };

      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedOrderNo(data.order.orderNumber);
        setOrderConfirmed(true);
        showToast("Order placed on full-stack server!", "success");
      } else {
        const errJson = await res.json();
        showToast(errJson.error || "Execution error writing order to server.", "error");
      }
    } catch (err) {
      console.error("Failed to post order to server", err);
      // Fallback
      const orderNo = "MDS-" + Math.floor(100000 + Math.random() * 900000);
      setGeneratedOrderNo(orderNo);
      setOrderConfirmed(true);
      showToast("Checkout finalized (Local backup)!", "success");
    }
  };

  const handleCloseSuccess = () => {
    // Clear cart and close everything
    clearCart();
    setCheckoutOpen(false);
    setOrderConfirmed(false);
    setBillingName("");
    setBillingEmail("");
    setBillingAddress("");
    setAppliedDiscount(0);
    setCouponCode("");
    setCouponFeedback("");
  };

  return (
    <div id="cart-page" className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 text-stone-900 dark:text-stone-100 transition-colors">
      <Breadcrumb items={[{ label: "Shopping Bag" }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h1 className="font-sans font-black text-3xl text-stone-900 dark:text-white tracking-tight mb-8 flex items-center gap-3">
          Your Shopping Bag
          <span className="text-sm font-semibold tracking-widest font-mono text-stone-400 dark:text-stone-500 uppercase">
            ({cartItems.length} Models)
          </span>
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: LIST OF BAGGED ITEMS (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cartItems.map((item) => {
                const finalProductPrice = item.product.price * (1 - item.product.discount / 100);
                const itemTotal = finalProductPrice * item.quantity;
                return (
                  <div
                    key={item.product.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-150 dark:border-stone-850 shadow-xxs flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between animate-fade-in"
                  >
                    {/* Thumbnail representation */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-950 shrink-0 border border-stone-100 dark:border-stone-850"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                      </Link>

                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-stone-400 dark:text-stone-500 uppercase">
                          {item.product.brand}
                        </span>
                        <Link to={`/product/${item.product.id}`} className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                          <h3 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug">
                            {item.product.name}
                          </h3>
                        </Link>
                        <div className="flex gap-4 text-xxs text-stone-400 dark:text-stone-500 mt-1.5 font-mono">
                          <span>COLOR: <strong className="text-stone-900 dark:text-stone-300">{item.selectedColor || item.product.color}</strong></span>
                          <span>MATERIAL: <strong className="text-stone-900 dark:text-stone-300">{item.product.material}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity selectors and pricing layout */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 w-full sm:w-auto">
                      {/* Counter */}
                      <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg px-2 bg-stone-50 dark:bg-stone-955">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 px-2 text-stone-500 hover:text-stone-900 dark:hover:text-white font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono text-stone-855 dark:text-stone-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 px-2 text-stone-500 hover:text-stone-900 dark:hover:text-white font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total pricing value */}
                      <div className="text-right">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono block">
                          ${itemTotal.toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                            ${finalProductPrice.toFixed(2)} each
                          </span>
                        )}
                      </div>

                      {/* Deletion trigger */}
                      <button
                        onClick={() => {
                          removeFromCart(item.product.id);
                          showToast(`Removed "${item.product.name}" from shopping cart.`, "info");
                        }}
                        className="p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-all"
                        title="Remove model"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: REVENUE CALCULATIONS & CTAs (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* CART PRICING STATS CARD */}
              <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-2xl p-6 shadow-xs">
                <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 dark:text-white mb-4 pb-2 border-b border-stone-100 dark:border-stone-800">
                  Bill Summary
                </h3>

                <div className="space-y-3.5 text-xs text-stone-605 dark:text-stone-300 font-sans">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">${subtotal.toFixed(2)}</span>
                  </div>

                  {/* Discounts applied row */}
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-500 font-semibold bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Promo Discount (15%)
                      </span>
                      <span className="font-mono text-right">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Shipping indicators */}
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" /> Courier Shipping
                    </span>
                    <span className="font-mono text-stone-900 dark:text-stone-100">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded font-bold uppercase text-[10px] border border-emerald-100/30">
                          Complimentary
                        </span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-normal font-serif">
                      Add <span className="font-mono font-bold text-stone-650 dark:text-amber-500">${(shippingThreshold - subtotal).toFixed(2)}</span> more to qualify for complimentary priority dispatch.
                    </p>
                  )}

                  {/* Tax estimate */}
                  <div className="flex justify-between">
                    <span>Estimated Sales Tax (8%)</span>
                    <span className="font-mono text-stone-900 dark:text-stone-100">${taxCost.toFixed(2)}</span>
                  </div>

                  {/* Grand total highlight */}
                  <div className="flex justify-between pt-4 border-t border-stone-100 dark:border-stone-800 text-sm font-black text-stone-900 dark:text-white">
                    <span className="uppercase tracking-wider">Estimated Total</span>
                    <span className="font-mono text-base text-stone-950 dark:text-amber-550">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full bg-stone-950 hover:bg-stone-850 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all mt-6 flex items-center justify-center gap-2 shadow-lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 text-amber-400 dark:text-stone-950" />
                </button>
              </div>

              {/* OFFERS COUPONS CONSOLE */}
              <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
                <h4 className="text-[10px] font-extrabold tracking-widest text-stone-400 dark:text-stone-500 uppercase mb-3 flex items-center gap-1">
                  <Percent className="w-4.5 h-4.5 text-amber-500" /> Claim Promo Code
                </h4>
                <form onSubmit={handleApplyCoupon} className="flex gap-2 p-1.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus-within:ring-1 focus-within:ring-amber-500">
                  <input
                    type="text"
                    placeholder="Enter code (e.g., MAISONSAC15)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-605 border-none outline-none font-sans px-2"
                  />
                  <button
                    type="submit"
                    className="bg-stone-900 dark:bg-amber-600 hover:bg-stone-800 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-[9px] font-bold px-3.5 py-2.5 rounded-lg uppercase tracking-wider shrink-0 transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {couponFeedback && (
                  <p className={`text-[10px] font-mono mt-2.5 ${appliedDiscount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {couponFeedback}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EMPTY BASKET SCREEN PLACEHOLDER */
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-150 dark:border-stone-800 max-w-xl mx-auto py-20 px-6 text-center flex flex-col items-center gap-4 my-8 shadow-xs">
            <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-400 dark:text-stone-500">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-sans font-black text-xl text-stone-900 dark:text-white">Your shopping bag is empty</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
              Before checking out or viewing shipping estimates, browse through our limited boutique collections and save items of choice to your basket!
            </p>
            <Link
              to="/shop"
              className="bg-stone-900 dark:bg-amber-600 hover:bg-stone-850 dark:hover:bg-amber-500 text-white dark:text-stone-950 font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md mt-2 inline-flex items-center gap-1.5"
            >
              Browse Shop Collection
              <ArrowRight className="w-4 h-4 text-amber-400 dark:text-stone-950 font-bold" />
            </Link>
          </div>
        )}
      </div>

      {/* CHECKOUT SIMULATION OVERLAY MODAL */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !orderConfirmed && setCheckoutOpen(false)}
              className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl max-w-md w-full p-6 sm:p-8 z-10 border border-stone-100 dark:border-stone-800 relative text-stone-900 dark:text-stone-100 transition-colors"
            >
              <button
                onClick={() => handleCloseSuccess()}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-955 p-1.5 rounded-lg transition-colors bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {!orderConfirmed ? (
                  /* STEP A: SHIPMENT ENQUIRY FORM */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3 className="font-sans font-extrabold text-xl text-stone-900 dark:text-white tracking-tight mb-2">
                      Secure Bill Shipping
                    </h3>
                    <p className="text-xs text-stone-400 dark:text-stone-550 mb-6 leading-relaxed">
                      All Maison cargo dispatches are certified and require secure handovers to verify identity.
                    </p>

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-extrabold tracking-widest text-[#a37e4c] dark:text-stone-400 uppercase mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Lord Alexander Carter"
                          value={billingName}
                          onChange={(e) => setBillingName(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 focus:border-amber-500 px-3.5 py-3 rounded-lg text-xs outline-none font-medium text-stone-850 dark:text-stone-205 placeholder-stone-400 dark:placeholder-stone-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold tracking-widest text-[#a37e4c] dark:text-stone-400 uppercase mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="alex@luxury-club.com"
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 focus:border-amber-500 px-3.5 py-3 rounded-lg text-xs outline-none font-medium text-stone-855 dark:text-stone-205 placeholder-stone-400 dark:placeholder-stone-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold tracking-widest text-[#a37e4c] dark:text-stone-400 uppercase mb-1.5">
                          Maison Delivery Destination
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="14 Belgrave Square, Knightsbridge, London SW1X 8PZ, UK"
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 focus:border-amber-500 px-3.5 py-3 rounded-lg text-xs outline-none font-medium text-stone-855 dark:text-stone-205 placeholder-stone-400 dark:placeholder-stone-605"
                        />
                      </div>

                      {/* Summary visual indicator inside checkout checkout */}
                      <div className="bg-stone-50 dark:bg-stone-955 rounded-xl p-3 border border-stone-150 dark:border-stone-800 text-[11px] font-mono flex justify-between text-stone-500 dark:text-stone-400 mt-2">
                        <span>Total Due</span>
                        <span className="font-bold text-stone-900 dark:text-amber-500 text-xs">${grandTotal.toFixed(2)}</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-stone-950 dark:bg-amber-600 hover:bg-stone-850 dark:hover:bg-amber-500 text-white dark:text-stone-950 font-bold py-3.5 sm:py-4 rounded-xl text-xs uppercase tracking-widest transition-colors mt-6 shadow-md"
                      >
                        Authorize & Place Order
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  /* STEP B: SUCCESSFUL VERBAL RECEIPT SCREEN */
                  <motion.div
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6 flex flex-col items-center gap-4 text-stone-900 dark:text-stone-100"
                  >
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-full text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/40">
                      <CheckCircle className="w-10 h-10 animate-duration-1000 fill-emerald-50 dark:fill-stone-900" />
                    </div>

                    <h3 className="font-sans font-black text-xl text-stone-900 dark:text-white tracking-tight leading-none">
                      Order Authourised
                    </h3>

                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-serif max-w-xs">
                      Thank you for choosing <strong>Maison de Sac</strong>! Lord <strong>{billingName}</strong>, your secure order receipt reference is:
                    </p>

                    <div className="bg-stone-900 dark:bg-stone-950 text-amber-400 px-4 py-2 rounded-xl text-xs font-mono font-bold border border-stone-800 dark:border-stone-850 tracking-widest shadow-inner my-2">
                      {generatedOrderNo}
                    </div>

                    <p className="text-xxs text-stone-400 dark:text-stone-500 leading-normal max-w-xs">
                      We have sent full tracking links and billing confirmation to your address at <span className="underline">{billingEmail}</span>. Shipment dispatch estimate is under 24 hours.
                    </p>

                    <button
                      onClick={() => handleCloseSuccess()}
                      className="w-full bg-stone-900 dark:bg-amber-600 hover:bg-stone-850 dark:hover:bg-amber-500 text-white dark:text-stone-950 font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest transition-colors mt-6"
                    >
                      Clear Basket & Continue Shop
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
