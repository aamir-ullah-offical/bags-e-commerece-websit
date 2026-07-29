import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
 return (
 <div className="min-h-[75vh] flex flex-col justify-center items-center bg-stone-50 px-4 py-20 text-center select-none font-sans">
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.4 }}
 className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-150 shadow-xs max-w-md w-full flex flex-col items-center gap-5"
 >
 <div className="p-4 bg-amber-50 text-amber-500 rounded-full border border-amber-100">
 <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: "5s" }} />
 </div>
 <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight font-mono">404 ERROR</h1>
 <h2 className="font-sans font-black text-lg text-stone-900 leading-none">Route Vault Not Identified</h2>
 <p className="text-xs text-stone-500 leading-relaxed font-serif">
 The accessory compartment index or route you tried to access doesn't exist inside our current storefront configurations.
 </p>
 <div className="w-full flex flex-col gap-2.5 pt-4 border-t border-stone-100 mt-2">
 <Link to="/" className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest transition-colors shadow-xs">
 Maison Storefront Land
 </Link>
 <Link to="/shop" className="w-full border border-stone-200 hover:border-stone-400 text-stone-600 font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest transition-colors hover:bg-stone-50">
 Browse Collections Catalog
 </Link>
 </div>
 </motion.div>
 </div>
 );
}
