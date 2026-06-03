import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Sparkles,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Breadcrumb from "../components/Breadcrumb";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const { showToast } = useToast();

  const [fname, setFname] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fname.trim() || !email.trim() || !message.trim()) {
      showToast("Please compile all contact form fields.", "info");
      return;
    }

    setSuccess(true);
    setFname("");
    setEmail("");
    setMessage("");
    showToast("Message dispatched successfully!", "success");
    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  };

  return (
    <div id="contact-page" className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 text-stone-900 dark:text-stone-100 transition-colors">
      <Breadcrumb items={[{ label: "Contact Customer Care" }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* TOP INTRO CARD */}
        <section className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-150 dark:border-stone-800 shadow-xxs max-w-3xl mx-auto text-center flex flex-col items-center mb-12 animate-fadeIn">
          <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono block mb-2.5">
            Maison Concierge
          </span>
          <h1 className="font-sans font-black text-2.5xl sm:text-4xl text-stone-900 dark:text-white tracking-tight leading-none mb-4">
            How Can We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-serif max-w-md">
            Whether you have questions regarding stitch adjustments, custom hardware replacement, corporate capsule orders, or returns, our client care advisors are standing by.
          </p>
        </section>

        {/* WORKSPACE MIDDLE BODY (FORM AND LINES) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* LEFT: INFORMATION BLOCK CARD (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800">
                Concierge Coordinates
              </h3>

              <div className="space-y-4">
                {/* Line: Tel */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-stone-100 dark:bg-stone-950 text-stone-700 dark:text-stone-300 rounded-xl border border-stone-200 dark:border-stone-800">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Hotline Calls</h4>
                    <p className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">+33 (0) 1 42 77 96 00</p>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-serif">Mondays to Fridays, 9:00 AM - 6:00 PM CET</span>
                  </div>
                </div>

                {/* Line: Mail */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-stone-100 dark:bg-stone-950 text-stone-700 dark:text-stone-300 rounded-xl border border-stone-200 dark:border-stone-800">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Electronic Mail</h4>
                    <p className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">concierge@maisonsac-luxury.com</p>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-serif">Averages response times: under 4 business hours</span>
                  </div>
                </div>

                {/* Line: Address */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-stone-100 dark:bg-stone-950 text-stone-700 dark:text-stone-300 rounded-xl border border-stone-200 dark:border-stone-800">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Boutique Headquarter</h4>
                    <p className="text-xs font-semibold text-stone-850 dark:text-stone-200 mt-0.5">8 Rue des Francs-Bourgeois, 75003 Paris, France</p>
                  </div>
                </div>

                {/* Line: Clock */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-stone-100 dark:bg-stone-950 text-stone-700 dark:text-stone-300 rounded-xl border border-stone-200 dark:border-stone-800">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Response Standards</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal font-serif">
                      We check messages consistently throughout weekend hours to coordinate urgent airport transit cargo questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MAP STYLIZED PLACEHOLDER SECTIONS */}
            <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800">
                Atelier Location Map
              </h3>
              
              {/* STYLIZED VECTOR MAP FRAME */}
              <div className="relative aspect-video rounded-2xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                {/* Draw some abstract street design coordinates boxes */}
                <div className="absolute inset-0 opacity-15 pointer-events-none text-stone-900 dark:text-white font-mono text-[9px] select-none p-4">
                  <div className="grid grid-cols-4 gap-4 h-full">
                    <div className="border-r border-b border-dotted border-stone-300 dark:border-stone-700" />
                    <div className="border-l border-b border-dotted border-stone-300 dark:border-stone-700" />
                    <div className="border-r border-t border-dotted border-stone-300 dark:border-stone-700 animate-pulse" />
                    <div className="border-l border-t border-dotted border-stone-300 dark:border-stone-700" />
                  </div>
                </div>

                {/* Abstract decorative park overlay box */}
                <div className="absolute top-6 left-1/3 w-28 h-12 bg-emerald-100/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40 pointer-events-none flex items-center justify-center">
                  <span className="text-[8px] font-mono font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">MARAIS PARK</span>
                </div>

                {/* Address pointer overlay in dead-center */}
                <div className="relative mx-auto my-auto flex flex-col items-center gap-1">
                  <div className="p-2 bg-amber-500 rounded-xl text-stone-950 border border-amber-600 shadow-lg animate-bounce leading-none">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="bg-stone-900 dark:bg-stone-800 text-white font-mono text-[8px] font-extrabold px-2 py-0.5 rounded shadow-md tracking-wider">
                    MAISON SAC Boutique
                  </span>
                </div>

                {/* Map Details bar */}
                <div className="relative z-10 w-full flex justify-between items-center text-[10px] font-mono text-stone-400 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-stone-200/50 dark:border-stone-850 shadow-sm leading-none">
                  <span>LAT: 48.8584° N</span>
                  <span>LNG: 2.2945° E</span>
                  <span className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 animate-spin animate-duration-5000" /> Ground Pin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ELECTRONIC CONTACT DISPATCH FORM (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 dark:text-white pb-2 border-b border-stone-105 dark:border-stone-800 mb-6">
              Write An Electronic Courier Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-stone-400 dark:text-stone-500 uppercase mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Alexander Mercer"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-855 dark:text-stone-100 placeholder-stone-405 dark:placeholder-stone-550"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-stone-400 dark:text-stone-500 uppercase mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@mercer-consult.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-855 dark:text-stone-100 placeholder-stone-405 dark:placeholder-stone-550"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-400 dark:text-stone-500 uppercase mb-1.5">
                  Subject Matter
                </label>
                <select className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500 px-3.5 py-3.5 rounded-xl text-xs text-stone-850 dark:text-stone-200 font-semibold outline-none transition-all cursor-pointer">
                  <option className="bg-white dark:bg-stone-900">Hardware Warranties & Edge Stitching Queries</option>
                  <option className="bg-white dark:bg-stone-900">Track Shipment Vault Dispatches</option>
                  <option className="bg-white dark:bg-stone-900">Corporate Gifts and Capsule custom batch requests</option>
                  <option className="bg-white dark:bg-stone-900">30-Day Easy Returns Exchanges Protocol</option>
                  <option className="bg-white dark:bg-stone-900">Other boutique coordinates</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-400 dark:text-stone-500 uppercase mb-1.5">
                  Your Message
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us about your requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-855 dark:text-stone-100 placeholder-stone-405 dark:placeholder-stone-550"
                />
              </div>

              {/* Success Overlay bulletin */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3 text-emerald-800 text-xs font-sans font-medium"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 shrink-0" />
                    <div>
                      <span>Message successfully dispatched! We will check logs and resolve soon.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-950 hover:bg-stone-850 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md cursor-pointer"
              >
                Dispatch Message
                <Send className="w-4 h-4 text-amber-500" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
