import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation States
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const validate = () => {
    let isValid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmError("");

    if (!fullName.trim()) {
      setNameError("Full name is required");
      isValid = false;
    } else if (fullName.trim().length < 3) {
      setNameError("Please enter your formal full name (min 3 chars)");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email address is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Secret word must be at least 6 characters long");
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Post registration request to unified Backend Core MERN APIs
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Welcome to Atelier Maison de Sac! Your luxury membership is ready.", "success");
        
        // Auto-login after registration is highly satisfying
        // Save the registered user customer details
        localStorage.setItem("at_is_authenticated", "true");
        localStorage.setItem("at_user", JSON.stringify(data.user));
        
        // Refresh page or trigger redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        const errJson = await res.json();
        showToast(errJson.error || "Maison registry failure.", "error");
        setEmailError(errJson.error || "Email already linked.");
      }
    } catch (err) {
      // Local fallback state write
      console.warn("Express MERN registration deferred to client state storage:", err);
      // Fallback
      const fallbackUser = {
        id: "usr-" + Date.now(),
        fullName,
        email,
        role: "customer"
      };
      localStorage.setItem("at_is_authenticated", "true");
      localStorage.setItem("at_user", JSON.stringify(fallbackUser));
      showToast("Membership catalog registered (Temporary State)!", "success");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative select-none">
      {/* Decorative Blur Spots */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-stone-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* TOP NAVIGATION LINK: BACK TO HOME */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#8c6d3f] hover:text-[#5e492b] dark:text-[#c4a475] dark:hover:text-[#e4c495] uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-xl p-8 relative z-10 transition-colors">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="flex items-baseline gap-1 group mb-4">
            <span className="font-sans font-extrabold text-2xl tracking-tight text-stone-950 dark:text-stone-50 group-hover:text-amber-600 transition-colors">
              MAISON
            </span>
            <span className="text-amber-500 font-mono text-xs font-bold tracking-widest uppercase">
              SAC
            </span>
          </Link>
          <h2 className="font-serif font-black text-stone-900 dark:text-stone-50 text-xl tracking-wide">
            CREATE MEMBERSHIP
          </h2>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#a37e4c] dark:text-amber-500 uppercase mt-1">
            Maison Atelier Registry
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name input field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-stone-550 dark:text-stone-400 uppercase tracking-widest font-mono">
              Full Name
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              nameError 
                ? "border-rose-500 bg-rose-50/10" 
                : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 focus-within:border-amber-500"
            }`}>
              <User className="absolute left-3.5 w-4 h-4 text-stone-450" />
              <input
                type="text"
                placeholder="Lord Alexander Carter"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-transparent text-stone-850 dark:text-stone-100 font-medium focus:outline-none placeholder-stone-400 dark:placeholder-stone-600"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>
            {nameError && (
              <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">
                {nameError}
              </span>
            )}
          </div>

          {/* Email input field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-stone-550 dark:text-stone-400 uppercase tracking-widest font-mono">
              Email Address
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              emailError 
                ? "border-rose-500 bg-rose-50/10" 
                : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 focus-within:border-amber-500"
            }`}>
              <Mail className="absolute left-3.5 w-4 h-4 text-stone-450" />
              <input
                type="email"
                placeholder="alex@luxury-club.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-transparent text-stone-850 dark:text-stone-100 font-medium focus:outline-none placeholder-stone-400 dark:placeholder-stone-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            {emailError && (
              <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">
                {emailError}
              </span>
            )}
          </div>

          {/* Password input field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-stone-550 dark:text-stone-400 uppercase tracking-widest font-mono">
              Choose Secret Phrase
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              passwordError 
                ? "border-rose-500 bg-rose-50/10" 
                : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 focus-within:border-amber-500"
            }`}>
              <Lock className="absolute left-3.5 w-4 h-4 text-stone-450" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-transparent text-stone-850 dark:text-stone-100 font-mono focus:outline-none placeholder-stone-400 dark:placeholder-stone-700"
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

          {/* Confirm Password input field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-stone-550 dark:text-stone-400 uppercase tracking-widest font-mono">
              Confirm Secret Phrase
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              confirmError 
                ? "border-rose-500 bg-rose-50/10" 
                : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 focus-within:border-amber-500"
            }`}>
              <Lock className="absolute left-3.5 w-4 h-4 text-stone-450" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-transparent text-stone-850 dark:text-stone-100 font-mono focus:outline-none placeholder-stone-400 dark:placeholder-stone-700"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmError && (
              <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">
                {confirmError}
              </span>
            )}
          </div>

          {/* Action trigger button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-stone-950 hover:bg-stone-900 dark:bg-amber-600 dark:hover:bg-amber-700 text-white dark:text-stone-950 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-stone-500 border-t-white dark:border-stone-900 dark:border-t-stone-200 animate-spin rounded-full" />
            ) : (
              <>
                REGISTER MEMBER
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link back to login page */}
        <div className="mt-6 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-600 hover:text-amber-700 dark:text-amber-500 font-bold underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
