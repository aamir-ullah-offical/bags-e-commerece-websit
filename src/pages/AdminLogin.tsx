import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, Mail, Lock, ArrowRight, Compass } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminLogin() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    const isSimpleAdmin = email.trim().toLowerCase() === "admin";

    if (!email.trim()) {
      setEmailError("Email address is required");
      isValid = false;
    } else if (!isSimpleAdmin && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (!isSimpleAdmin && password.length < 6 && password !== "admin") {
      setPasswordError("Password must be at least 6 characters long");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        showToast("Access Authorized. Welcome, Administrator.", "success");
        navigate("/admin");
      } else {
        showToast("Invalid credentials. Please verify and try again.", "info");
        setPasswordError("Invalid administrative email or secret passphrase.");
      }
    } catch {
      showToast("Authentication server unavailable. Try again shortly.", "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast("Concierge security: Master key reset link dispatched to authorized Charles Laurent mail inbox.", "info");
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      {/* Decorative Blur Spots */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-stone-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-xl p-8 relative z-10">
        
        {/* Brand/Security Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-stone-950 dark:bg-amber-600/10 rounded-2xl flex items-center justify-center mb-4 border border-stone-800 dark:border-amber-600/25">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="font-serif font-black text-stone-900 dark:text-stone-50 text-2xl tracking-wide">
            ATELIER MAISON
          </h2>
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 dark:text-amber-500 uppercase mt-1">
            Secure Concierge supervisor panel
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-widest font-mono">
              Administrative Email
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              emailError 
                ? "border-rose-500 bg-rose-50/10" 
                : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 focus-within:border-amber-500"
            }`}>
              <Mail className="absolute left-3.5 w-4 h-4 text-stone-400" />
              <input
                type="email"
                placeholder="admin@maisonsac-luxury.com"
                className="w-full pl-10 pr-4 py-3 text-xs bg-transparent text-stone-850 dark:text-stone-100 font-medium focus:outline-none placeholder-stone-400 dark:placeholder-stone-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {emailError && (
              <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">
                {emailError}
              </span>
            )}
          </div>

          {/* Password input field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-widest font-mono">
                Atelier Secret Phrase
              </label>
              <a
                href="#"
                onClick={handleForgotPassword}
                className="text-[10px] text-amber-600 hover:text-amber-700 dark:text-amber-500 font-bold tracking-wide transition-colors"
                tabIndex={-1}
              >
                Forgot passphrase?
              </a>
            </div>
            
            <div className={`relative flex items-center rounded-xl border transition-all ${
              passwordError 
                ? "border-rose-500 bg-rose-50/10" 
                : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 focus-within:border-amber-500"
            }`}>
              <Lock className="absolute left-3.5 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 text-xs bg-transparent text-stone-850 dark:text-stone-100 font-mono focus:outline-none placeholder-stone-450 dark:placeholder-stone-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">
                {passwordError}
              </span>
            )}
          </div>

          {/* Utilities checkbox row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <input
                type="checkbox"
                className="rounded text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-stone-700 w-4 h-4"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 tracking-wide group-hover:text-stone-700 dark:group-hover:text-stone-300">
                Keep active on this viewport
              </span>
            </label>
          </div>

          {/* Action trigger button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-stone-950 hover:bg-stone-900 dark:bg-amber-600 dark:hover:bg-amber-700 text-white dark:text-stone-950 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-stone-500 border-t-white dark:border-stone-900 dark:border-t-stone-200 animate-spin rounded-full" />
            ) : (
              <>
                AUTHORIZE LOGIN
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to storefront info helper */}
        <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
            Demo parameters: <code className="text-amber-600 dark:text-amber-500 font-bold font-mono">admin</code> / <code className="text-amber-600 dark:text-amber-500 font-bold font-mono">admin</code> (or <code className="text-amber-600 dark:text-amber-500 font-bold font-mono">admin@admin.com</code> with <code className="text-amber-600 dark:text-amber-500 font-bold font-mono">admin123</code>)
          </p>
        </div>
      </div>
    </div>
  );
}
