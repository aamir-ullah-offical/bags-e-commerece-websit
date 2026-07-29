import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authService } from "../services/authService";
import { useToast } from "../context/ToastContext";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email address is required.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch {
      // Always show the same message to prevent user enumeration
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6 relative select-none">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-stone-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/login"
          className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#8c6d3f] hover:text-[#5e492b] uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl shadow-xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="flex items-baseline gap-1 group mb-4">
            <span className="font-sans font-extrabold text-2xl tracking-tight text-stone-950 group-hover:text-amber-600 transition-colors">
              MAISON
            </span>
            <span className="text-amber-500 font-mono text-xs font-bold tracking-widest uppercase">SAC</span>
          </Link>
          <h2 className="font-serif font-black text-stone-900 text-xl tracking-wide">FORGOT PASSWORD</h2>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#a37e4c] uppercase mt-1">
            Account Recovery
          </span>
        </div>

        {submitted ? (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-sans font-bold text-stone-900 text-sm">Check Your Email</h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
            </p>
            <p className="text-[10px] text-stone-400 mt-2">The link expires in 15 minutes.</p>
            <Link
              to="/login"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-stone-500 text-center mb-6 leading-relaxed">
              Enter your account email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-stone-550 uppercase tracking-widest font-mono">
                  Email Address
                </label>
                <div
                  className={`relative flex items-center rounded-xl border transition-all ${
                    emailError
                      ? "border-rose-500 bg-rose-50/10"
                      : "border-stone-200 bg-stone-50/50 focus-within:border-amber-500"
                  }`}
                >
                  <Mail className="absolute left-3.5 w-4 h-4 text-stone-450" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 text-xs bg-transparent text-stone-850 font-medium focus:outline-none placeholder-stone-400"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
                {emailError && (
                  <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">{emailError}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-stone-950 hover:bg-stone-900 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-stone-500 border-t-white animate-spin rounded-full" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-stone-500">
                Remember your password?{" "}
                <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold underline transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
