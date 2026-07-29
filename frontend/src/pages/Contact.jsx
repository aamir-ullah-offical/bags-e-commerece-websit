import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Breadcrumb from "../components/Breadcrumb";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";
import api from "../services/api";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const SUBJECTS = [
  "Hardware Warranties & Edge Stitching Queries",
  "Track Shipment Vault Dispatches",
  "Corporate Gifts and Capsule Custom Batch Requests",
  "30-Day Easy Returns & Exchanges Protocol",
  "Other Boutique Coordinates",
];

export default function Contact() {
  const { showToast } = useToast();
  const { settings } = useSettings();

  const [fname, setFname] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!fname.trim()) e.fname = "Full name is required.";
    if (!email.trim()) {
      e.email = "Email address is required.";
    } else if (!EMAIL_RE.test(email.trim())) {
      e.email = "Please enter a valid email address.";
    }
    if (!message.trim()) {
      e.message = "Message is required.";
    } else if (message.trim().length < 10) {
      e.message = "Message must be at least 10 characters.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post("/contact", {
        name: fname.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
      });
      setSuccess(true);
      setFname("");
      setEmail("");
      setSubject(SUBJECTS[0]);
      setMessage("");
      setErrors({});
      showToast("Message dispatched successfully!", "success");
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send message. Please try again.";
      showToast(msg, "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900 transition-colors">
      <Breadcrumb items={[{ label: "Contact Customer Care" }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* TOP INTRO CARD */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-150 shadow-xxs max-w-3xl mx-auto text-center flex flex-col items-center mb-12 animate-fadeIn">
          <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono block mb-2.5">
            Maison Concierge
          </span>
          <h1 className="font-sans font-black text-2.5xl sm:text-4xl text-stone-900 tracking-tight leading-none mb-4">
            How Can We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-serif max-w-md">
            Whether you have questions regarding stitch adjustments, custom hardware replacement, corporate capsule orders, or returns, our client care advisors are standing by.
          </p>
        </section>

        {/* WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          {/* LEFT: INFORMATION BLOCK (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-stone-150 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 pb-2 border-b border-stone-100">
                Concierge Coordinates
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-stone-100 text-stone-700 rounded-xl border border-stone-200">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-stone-400">Hotline</h4>
                    <p className="text-xs font-bold font-mono text-stone-900 mt-0.5">{settings.contactPhone || "+92 300 624 7862"}</p>
                    <span className="text-[10px] text-stone-400 font-serif">{settings.workingHours || "Mon–Sat: 10 AM – 7 PM (PKT)"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-stone-100 text-stone-700 rounded-xl border border-stone-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-stone-400">Email</h4>
                    <p className="text-xs font-bold font-mono text-stone-900 mt-0.5">{settings.contactEmail || "hello@maisonsac.com"}</p>
                    <span className="text-[10px] text-stone-400 font-serif">Response time: under 4 business hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-stone-100 text-stone-700 rounded-xl border border-stone-200">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-stone-400">Address</h4>
                    <p className="text-xs font-semibold text-stone-850 mt-0.5">{settings.address || "24-B Main Boulevard, Gulberg III, Lahore"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-stone-100 text-stone-700 rounded-xl border border-stone-200">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-stone-400">Working Hours</h4>
                    <p className="text-xs text-stone-500 leading-normal font-serif">
                      {settings.workingHours || "Mon–Sat: 10 AM – 7 PM (PKT)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MAP STYLIZED PLACEHOLDER */}
            <div className="bg-white border border-stone-150 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 pb-2 border-b border-stone-100">
                Atelier Location
              </h3>

              <div className="relative aspect-video rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                <div className="absolute inset-0 opacity-15 pointer-events-none p-4">
                  <div className="grid grid-cols-4 gap-4 h-full">
                    <div className="border-r border-b border-dotted border-stone-300" />
                    <div className="border-l border-b border-dotted border-stone-300" />
                    <div className="border-r border-t border-dotted border-stone-300 animate-pulse" />
                    <div className="border-l border-t border-dotted border-stone-300" />
                  </div>
                </div>

                <div className="absolute top-6 left-1/3 w-24 h-10 bg-emerald-100/50 rounded-xl border border-emerald-200 pointer-events-none flex items-center justify-center">
                  <span className="text-[8px] font-mono font-bold text-emerald-800 tracking-wider">GULBERG</span>
                </div>

                <div className="relative mx-auto my-auto flex flex-col items-center gap-1">
                  <div className="p-2 bg-amber-500 rounded-xl text-stone-950 border border-amber-600 shadow-lg animate-bounce leading-none">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="bg-stone-900 text-white font-mono text-[8px] font-extrabold px-2 py-0.5 rounded shadow-md tracking-wider">
                    {settings.storeName} Boutique
                  </span>
                </div>

                <div className="relative z-10 w-full flex justify-between items-center text-[10px] font-mono text-stone-400 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-stone-200/50 shadow-sm leading-none">
                  <span>31.5204° N</span>
                  <span>74.3587° E</span>
                  <span className="text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 animate-spin animate-duration-5000" /> Lahore, PK
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-stone-150 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h3 className="text-xs font-black tracking-widest uppercase text-stone-900 pb-2 border-b border-stone-105 mb-6">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Ayesha Khan"
                    value={fname}
                    onChange={(e) => { setFname(e.target.value); setErrors((p) => ({ ...p, fname: "" })); }}
                    className={`w-full bg-stone-50 border focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-855 placeholder-stone-405 transition-colors ${errors.fname ? "border-rose-400" : "border-stone-200"}`}
                  />
                  {errors.fname && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.fname}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="ayesha@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                    className={`w-full bg-stone-50 border focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-855 placeholder-stone-405 transition-colors ${errors.email ? "border-rose-400" : "border-stone-200"}`}
                  />
                  {errors.email && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mb-1.5">
                  Subject Matter
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3.5 py-3.5 rounded-xl text-xs text-stone-850 font-semibold outline-none transition-all cursor-pointer"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} className="bg-white">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mb-1.5">
                  Your Message * <span className="text-stone-300 font-normal normal-case">(min. 10 characters)</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us about your requirements..."
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: "" })); }}
                  className={`w-full bg-stone-50 border focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-855 placeholder-stone-405 transition-colors ${errors.message ? "border-rose-400" : "border-stone-200"}`}
                />
                {errors.message && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.message}</p>}
              </div>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3 text-emerald-800 text-xs font-sans font-medium"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 shrink-0" />
                    <span>Message successfully dispatched! We will get back to you within 4 business hours.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-950 hover:bg-stone-850 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-stone-500 border-t-white animate-spin rounded-full" />
                ) : (
                  <>
                    Dispatch Message
                    <Send className="w-4 h-4 text-amber-500" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
