import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { authService } from "../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e = {};
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(password)) e.password = "Must contain at least one uppercase letter.";
    else if (!/[0-9]/.test(password)) e.password = "Must contain at least one number.";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
        "Reset link is invalid or has expired. Please request a new one."
      );
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
          <h2 className="font-serif font-black text-stone-900 text-xl tracking-wide">RESET PASSWORD</h2>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#a37e4c] uppercase mt-1">
            Create a new secure password
          </span>
        </div>

        {success ? (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-sans font-bold text-stone-900 text-sm">Password Updated!</h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              Your password has been changed successfully. Redirecting you to login…
            </p>
            <Link
              to="/login"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <>
            {serverError && (
              <div className="mb-5 flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span>{serverError}</span>
                  {serverError.includes("expired") && (
                    <Link to="/forgot-password" className="block mt-1 font-bold underline hover:text-rose-800 transition-colors">
                      Request a new link →
                    </Link>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-stone-550 uppercase tracking-widest font-mono">
                  New Password
                </label>
                <div className={`relative flex items-center rounded-xl border transition-all ${errors.password ? "border-rose-500 bg-rose-50/10" : "border-stone-200 bg-stone-50/50 focus-within:border-amber-500"}`}>
                  <Lock className="absolute left-3.5 w-4 h-4 text-stone-450" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-transparent text-stone-850 font-medium focus:outline-none placeholder-stone-400"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3.5 text-stone-400 hover:text-stone-700 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-stone-550 uppercase tracking-widest font-mono">
                  Confirm Password
                </label>
                <div className={`relative flex items-center rounded-xl border transition-all ${errors.confirmPassword ? "border-rose-500 bg-rose-50/10" : "border-stone-200 bg-stone-50/50 focus-within:border-amber-500"}`}>
                  <Lock className="absolute left-3.5 w-4 h-4 text-stone-450" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-transparent text-stone-850 font-medium focus:outline-none placeholder-stone-400"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 text-stone-400 hover:text-stone-700 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-stone-950 hover:bg-stone-900 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-stone-500 border-t-white animate-spin rounded-full" />
                ) : (
                  "Set New Password"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
