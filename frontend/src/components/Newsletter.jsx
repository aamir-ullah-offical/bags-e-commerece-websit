import { useState } from "react";
import { Mail, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { newsletterService } from "../services/newsletterService";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      await newsletterService.subscribe(email.trim());
      setStatus("success");
      setEmail("");
    } catch (err) {
      const msg = err?.response?.status === 409 ? "already" : "error";
      setStatus(msg === "already" ? "already" : "error");
      setTimeout(() => setStatus("idle"), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-stone-950 py-20 px-6 sm:py-24 sm:px-12 rounded-3xl max-w-7xl mx-auto my-16 shadow-2xl border border-stone-800"
      id="newsletter"
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-stone-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex p-3 bg-stone-900 rounded-full text-amber-500 border border-stone-800 mb-6 shadow-xl leading-none">
          <Mail className="w-6 h-6 animate-pulse" />
        </div>

        <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-none mb-4">
          Join the Avant-Garde Circle
        </h2>

        <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
          Subscribe to receive exclusive early releases of our limited series, bespoke material stories, and priority sizing notifications before public launches.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-2" noValidate>
          <div className="relative flex-1">
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              disabled={isSubmitting}
              className="w-full bg-stone-900/90 hover:bg-stone-900 text-white placeholder-stone-500 border border-stone-800 focus:border-amber-500 rounded-xl px-4 py-4 text-sm outline-none transition-all focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white hover:bg-amber-500 text-stone-950 py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shrink-0 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-stone-400 border-t-stone-900 animate-spin rounded-full" />
            ) : (
              <>Subscribe <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="h-6 mt-4">
          <AnimatePresence mode="wait">
            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-emerald-400 text-xs font-mono flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 fill-emerald-400" />
                You&apos;re in! Check your inbox for a welcome note.
              </motion.div>
            )}
            {status === "already" && (
              <motion.div
                key="already"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-amber-400 text-xs font-mono flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                This email is already subscribed!
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-rose-400 text-xs font-mono flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" />
                Please enter a valid email address.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-[11px] text-stone-500 font-medium tracking-wide mt-4">
          Unsubscribe easily at any time. We respect your complete privacy.
        </p>
      </div>
    </section>
  );
}
