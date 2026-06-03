import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSuccess(true);
    setEmail("");
    setTimeout(() => setSuccess(false), 5000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 font-sans border-t border-stone-800" id="footer">
      {/* BRAND VALUES / WHY CHOOSE US FOOTER STRIP */}
      <div className="border-b border-stone-800 bg-stone-950/40">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-stone-805 rounded-full text-amber-500">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-widest uppercase">
              Express Courier Delivery
            </h4>
            <p className="text-xs text-stone-400 max-w-xs">
              Complimentary trackable priority shipping on all international items over $150.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-stone-805 rounded-full text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-widest uppercase">
              Secure Checkout Seal
            </h4>
            <p className="text-xs text-stone-400 max-w-xs">
              Fully encrypted payment processing. Guaranteeing complete transaction privacy.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-stone-805 rounded-full text-amber-500">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-widest uppercase">
              30-Day Easy Returns
            </h4>
            <p className="text-xs text-stone-400 max-w-xs">
              Receive a full refund or exchange if you are not 100% satisfied with the quality.
            </p>
          </div>
        </div>
      </div>

      {/* CORE FOOTER NAVIGATION LINKS */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* COL 1: LUXURY BRAND INTRO */}
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-1">
            <span className="font-sans font-extrabold text-xl tracking-tight text-white">
              MAISON
            </span>
            <span className="text-amber-500 font-mono text-xxs font-bold tracking-widest uppercase">
              SAC
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Crafting premium luxury leather bags, timeless weekenders, compact card cases, and Commuter accessories for creative professionals with unparalleled attention to structural detail.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-amber-600 transition-all"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-amber-600 transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-amber-600 transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* COL 2: LIST OF CATEGORIES */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-1 border-b border-stone-800">
            Collections
          </h3>
          <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
            <li>
              <Link to="/shop?category=Handbags" className="hover:text-amber-500 transition-colors">
                Luxury Handbags
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Travel%20Bags" className="hover:text-amber-500 transition-colors">
                Voyager Travel Bags
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Wallets" className="hover:text-amber-500 transition-colors">
                Premium Slim Wallets
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Backpacks" className="hover:text-amber-500 transition-colors">
                Commuter Backpacks
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Laptop%20Bags" className="hover:text-amber-500 transition-colors">
                Laptop Messengers
              </Link>
            </li>
          </ul>
        </div>

        {/* COL 3: COMPANY LINKS */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-1 border-b border-stone-800">
            The Company
          </h3>
          <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
            <li>
              <Link to="/about" className="hover:text-amber-500 transition-colors">
                Our Story & Heritage
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-500 transition-colors">
                Contact Customer Care
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-amber-500 transition-colors">
                Mission & Sustainability
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-500 transition-colors">
                Our Showrooms & Maps
              </Link>
            </li>
          </ul>
        </div>

        {/* COL 4: NEWSLETTER SIGN UP FORM */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-1 border-b border-stone-800">
            Newsletter
          </h3>
          <p className="text-xs text-stone-400 mb-4 leading-relaxed">
            Subscribe to our seasonal capsule collections releases and enjoy immediate priority discounts.
          </p>
          <form onSubmit={handleSub} className="flex flex-col gap-2">
            <div className="flex bg-stone-800 rounded-lg p-1.5 focus-within:ring-1 focus-within:ring-amber-500 transition-all border border-stone-700">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-stone-100 placeholder-stone-500 border-none outline-none px-2 font-sans"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider transition-colors shrink-0"
              >
                Join
              </button>
            </div>
            {success && (
              <p className="text-xxs text-emerald-400 font-mono mt-1 flex items-center gap-1.5 animate-fade-in animate-duration-150">
                <Sparkles className="w-3.5 h-3.5" /> Succesfully subscribed! Check inbox.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* FOOTER BOTTOM METADATA & PAYMENT CARDS BAR */}
      <div className="bg-stone-950 text-stone-500 text-xs py-6 border-t border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
            <span>© {currentYear} Maison de Sac Ltd. All rights reserved.</span>
            <div className="flex gap-4 text-stone-600 text-[11px]">
              <a href="#privacy" className="hover:text-stone-400 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-stone-400 transition-colors">Terms of Service</a>
              <a href="#cookies" className="hover:text-stone-400 transition-colors">Cookie settings</a>
            </div>
          </div>

          {/* Secure Card Visual Accents */}
          <div className="flex items-center gap-2 text-[10px] font-semibold text-stone-600 font-mono tracking-widest pb-1">
            <span className="border border-stone-800 px-2 py-0.5 rounded uppercase">VISA</span>
            <span className="border border-stone-800 px-2 py-0.5 rounded uppercase bg-stone-900 text-stone-400">AMEX</span>
            <span className="border border-stone-800 px-2 py-0.5 rounded uppercase">MC</span>
            <span className="border border-stone-800 px-2 py-0.5 rounded uppercase bg-stone-900 text-stone-400">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
