import { useState } from "react";
import { Link } from "react-router-dom";
import {
 Facebook, Instagram, Linkedin, Truck, ShieldCheck, RotateCcw, Sparkles, AlertCircle,
} from "lucide-react";
import { newsletterService } from "../services/newsletterService";
import { useSettings } from "../context/SettingsContext";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Footer() {
 const { settings } = useSettings();
 const [email, setEmail] = useState("");
 const [subStatus, setSubStatus] = useState("idle");

 const brandParts = (name = "") => {
  const words = (name || "MAISON SAC").trim().split(/\s+/);
  return words.length > 1
   ? { main: words.slice(0, -1).join(" "), accent: words[words.length - 1] }
   : { main: words[0], accent: "" };
 };
 const { main: brandMain, accent: brandAccent } = brandParts(settings.storeName);

 const handleSub = async (e) => {
 e.preventDefault();
 if (!email.trim() || !EMAIL_RE.test(email.trim())) {
 setSubStatus("invalid");
 setTimeout(() => setSubStatus("idle"), 4000);
 return;
 }
 try {
 await newsletterService.subscribe(email.trim());
 setSubStatus("success");
 setEmail("");
 setTimeout(() => setSubStatus("idle"), 5000);
 } catch (err) {
 const status = err?.response?.status === 409 ? "already" : "error";
 setSubStatus(status);
 setTimeout(() => setSubStatus("idle"), 4000);
 }
 };

 const currentYear = new Date().getFullYear();

 return (
 <footer className="bg-stone-900 text-stone-300 font-sans border-t border-stone-800" id="footer">
 <div className="border-b border-stone-800 bg-stone-950/40">
 <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
 <div className="flex flex-col items-center gap-2">
 <div className="p-3 bg-stone-800 rounded-full text-amber-500">
 <Truck className="w-5 h-5" />
 </div>
 <h4 className="text-sm font-semibold text-white tracking-widest uppercase">Express Courier Delivery</h4>
 <p className="text-xs text-stone-400 max-w-xs">
 Complimentary trackable priority shipping on all international items over $150.
 </p>
 </div>
 <div className="flex flex-col items-center gap-2">
 <div className="p-3 bg-stone-800 rounded-full text-amber-500">
 <ShieldCheck className="w-5 h-5" />
 </div>
 <h4 className="text-sm font-semibold text-white tracking-widest uppercase">Secure Checkout Seal</h4>
 <p className="text-xs text-stone-400 max-w-xs">
 Fully encrypted payment processing. Guaranteeing complete transaction privacy.
 </p>
 </div>
 <div className="flex flex-col items-center gap-2">
 <div className="p-3 bg-stone-800 rounded-full text-amber-500">
 <RotateCcw className="w-5 h-5" />
 </div>
 <h4 className="text-sm font-semibold text-white tracking-widest uppercase">30-Day Easy Returns</h4>
 <p className="text-xs text-stone-400 max-w-xs">
 Receive a full refund or exchange if you are not 100% satisfied with the quality.
 </p>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
 <div className="flex flex-col gap-4">
 <div className="flex items-baseline gap-1">
  {settings.logoMain ? (
   <img src={settings.logoMain} alt={settings.storeName} className="h-8 object-contain brightness-0 invert" />
  ) : (
   <>
    <span className="font-sans font-extrabold text-xl tracking-tight text-white">{brandMain}</span>
    {brandAccent && <span className="text-amber-500 font-mono text-[10px] font-bold tracking-widest uppercase">{brandAccent}</span>}
   </>
  )}
 </div>
 <p className="text-xs text-stone-400 leading-relaxed">
  {settings.footerText || "Crafting premium luxury leather bags, timeless weekenders, compact card cases, and commuter accessories for creative professionals with unparalleled attention to structural detail."}
 </p>
 <div className="flex items-center gap-3 mt-2">
 {[
  { icon: Facebook, label: "Facebook", href: settings.socialFacebook },
  { icon: Instagram, label: "Instagram", href: settings.socialInstagram },
  { icon: Linkedin, label: "LinkedIn", href: settings.socialLinkedin },
 ].filter(({ href }) => href).map(({ icon: Icon, label, href }) => (
 <a
 key={label}
 href={href}
 target="_blank"
 rel="noopener noreferrer"
 className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-amber-600 transition-all"
 aria-label={label}
 >
 <Icon className="w-4 h-4" />
 </a>
 ))}
 </div>
 </div>

 <div>
 <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-1 border-b border-stone-800">Collections</h3>
 <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
 {[
 ["Luxury Handbags", "/shop?category=Handbags"],
 ["Voyager Travel Bags", "/shop?category=Travel%20Bags"],
 ["Premium Slim Wallets", "/shop?category=Wallets"],
 ["Commuter Backpacks", "/shop?category=Backpacks"],
 ["Laptop Messengers", "/shop?category=Laptop%20Bags"],
 ].map(([label, href]) => (
 <li key={label}>
 <Link to={href} className="hover:text-amber-500 transition-colors">{label}</Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-1 border-b border-stone-800">The Company</h3>
 <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
 {[
 ["Our Story & Heritage", "/about"],
 ["Contact Customer Care", "/contact"],
 ["Track Your Order", "/track-order"],
 ["Mission & Sustainability", "/about"],
 ["Our Showrooms & Maps", "/contact"],
 ].map(([label, href]) => (
 <li key={label}>
 <Link to={href} className="hover:text-amber-500 transition-colors">{label}</Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-1 border-b border-stone-800">Newsletter</h3>
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
 {subStatus === "success" && (
 <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5" /> Successfully subscribed! Check inbox.
 </p>
 )}
 {subStatus === "already" && (
 <p className="text-[10px] text-amber-400 font-mono mt-1 flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5" /> Already subscribed — thank you!
 </p>
 )}
 {(subStatus === "error" || subStatus === "invalid") && (
 <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1.5">
 <AlertCircle className="w-3.5 h-3.5" /> {subStatus === "invalid" ? "Please enter a valid email." : "Something went wrong. Try again."}
 </p>
 )}
 </form>
 </div>
 </div>

 <div className="bg-stone-950 text-stone-500 text-xs py-6 border-t border-stone-800">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
 <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
 <span>© {currentYear} {settings.storeName}. All rights reserved.</span>
 <div className="flex gap-4 text-stone-600 text-[11px]">
 <Link to="/contact" className="hover:text-stone-400 transition-colors">Privacy Policy</Link>
 <Link to="/contact" className="hover:text-stone-400 transition-colors">Terms of Service</Link>
 <Link to="/contact" className="hover:text-stone-400 transition-colors">Cookie Settings</Link>
 </div>
 </div>
 <div className="flex items-center gap-2 text-[10px] font-semibold text-stone-600 font-mono tracking-widest pb-1">
 {["VISA", "AMEX", "MC", "APPLE PAY"].map((p) => (
 <span key={p} className="border border-stone-800 px-2 py-0.5 rounded uppercase bg-stone-900 text-stone-400">{p}</span>
 ))}
 </div>
 </div>
 </div>
 </footer>
 );
}
