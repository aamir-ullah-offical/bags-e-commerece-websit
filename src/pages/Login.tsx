import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Compass, Heart, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
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
    } else if (!isSimpleAdmin && password.length < 5) {
      setPasswordError("Password must be at least 5 characters long");
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
        // Fetch fresh state to redirect accordingly
        // Wait, because state might update asynchronously, we can parse user role from local storage or check context.
        const storedUserStr = localStorage.getItem("at_user");
        let role = "customer";
        let fullName = "Guest";
        if (storedUserStr) {
          try {
            const parsed = JSON.parse(storedUserStr);
            role = parsed.role;
            fullName = parsed.fullName;
          } catch (_) {}
        } else {
          // Fallback if local storage didn't write but login was successful (e.g. static admin login check)
          if (email.toLowerCase().includes("admin") || password === "admin") {
            role = "admin";
            fullName = "Atelier Chef";
          }
        }

        if (role === "admin") {
          showToast(`Access Authorized. Welcome back, ${fullName}.`, "success");
          navigate("/admin/dashboard");
        } else {
          showToast(`Welcome back, ${fullName}! Successfully logged in.`, "success");
          navigate("/");
        }
      } else {
        showToast("Invalid credentials. Please verify and try again.", "error");
        setPasswordError("Incorrect email or password.");
      }
    } catch (err) {
      console.error(err);
      showToast("Authentication server unavailable. Try again shortly.", "error");
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
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="flex items-baseline gap-1 group mb-4">
            <span className="font-sans font-extrabold text-2xl tracking-tight text-stone-950 dark:text-stone-50 group-hover:text-amber-600 transition-colors">
              MAISON
            </span>
            <span className="text-amber-500 font-mono text-xs font-bold tracking-widest uppercase">
              SAC
            </span>
          </Link>
          <h2 className="font-serif font-black text-stone-900 dark:text-stone-50 text-xl tracking-wide">
            WELCOME BACK
          </h2>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#a37e4c] dark:text-amber-500 uppercase mt-1">
            Secure Member Login Portal
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-stone-550 dark:text-stone-400 uppercase tracking-widest font-mono">
              Email Address / Admin User
            </label>
            <div className={`relative flex items-center rounded-xl border transition-all ${
              emailError 
                ? "border-rose-500 bg-rose-50/10" 
                : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 focus-within:border-amber-500"
            }`}>
              <Mail className="absolute left-3.5 w-4 h-4 text-stone-450" />
              <input
                type="text"
                placeholder="email@example.com or admin"
                className="w-full pl-10 pr-4 py-3 text-xs bg-transparent text-stone-850 dark:text-stone-100 font-medium focus:outline-none placeholder-stone-400 dark:placeholder-stone-600"
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
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-stone-550 dark:text-stone-400 uppercase tracking-widest font-mono">
                Secret Phrase / Password
              </label>
            </div>
            
            <div className={`relative flex items-center rounded-xl border transition-all ${
              passwordError 
                ? "border-rose-500 bg-rose-50/10" 
                : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 focus-within:border-amber-500"
            }`}>
              <Lock className="absolute left-3.5 w-4 h-4 text-stone-450" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 text-xs bg-transparent text-stone-850 dark:text-stone-100 font-mono focus:outline-none placeholder-stone-400 dark:placeholder-stone-700"
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
                SIGN IN
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Register page & info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            New to Maison de Sac?{" "}
            <Link
              to="/register"
              className="text-amber-600 hover:text-amber-700 dark:text-amber-500 font-bold underline transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Demo parameters tooltip */}
        <div className="mt-8 pt-4 border-t border-stone-150 dark:border-stone-800 text-center">
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
            Demo credentials: <code className="text-amber-655 dark:text-amber-500 font-bold font-mono">admin</code> / <code className="text-amber-655 dark:text-amber-500 font-bold font-mono">admin</code> (Staff Admin)
          </p>
        </div>
      </div>
    </div>
  );
}
