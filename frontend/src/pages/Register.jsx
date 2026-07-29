import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";

export default function Register() {
 const { authenticate } = useAuth();
 const { showToast } = useToast();
 const { settings } = useSettings();
 const navigate = useNavigate();

 const [fullName, setFullName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const [nameError, setNameError] = useState("");
 const [emailError, setEmailError] = useState("");
 const [passwordError, setPasswordError] = useState("");
 const [confirmError, setConfirmError] = useState("");

 const validate = () => {
 let isValid = true;
 setNameError(""); setEmailError(""); setPasswordError(""); setConfirmError("");

 if (!fullName.trim()) { setNameError("Full name is required"); isValid = false; }
 else if (fullName.trim().length < 3) { setNameError("Full name must be at least 3 characters"); isValid = false; }

 if (!email.trim()) { setEmailError("Email address is required"); isValid = false; }
 else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) { setEmailError("Please enter a valid email address"); isValid = false; }

 if (!password) { setPasswordError("Password is required"); isValid = false; }
 else if (password.length < 6) { setPasswordError("Password must be at least 6 characters long"); isValid = false; }

 if (password !== confirmPassword) { setConfirmError("Passwords do not match"); isValid = false; }

 return isValid;
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!validate()) return;

 setIsSubmitting(true);
 try {
 const data = await authService.register({ fullName, email, password });
 if (data?.user) authenticate(data.user);
 showToast(`Welcome to ${settings.storeName}! Your luxury membership is ready.`, "success");
 setTimeout(() => navigate("/"), 500);
 } catch (err) {
 const msg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.";
 showToast(msg, "error");
 if (msg.toLowerCase().includes("email")) {
 setEmailError(msg);
 }
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative select-none">
 <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
 <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-stone-500/5 blur-3xl rounded-full pointer-events-none" />

 <div className="absolute top-6 left-6 z-20">
 <Link to="/" className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#8c6d3f] hover:text-[#5e492b] uppercase transition-colors">
 <ArrowLeft className="w-4 h-4" />
 Back to Home
 </Link>
 </div>

 <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl shadow-xl p-8 relative z-10 transition-colors">
 <div className="flex flex-col items-center text-center mb-6">
 <Link to="/" className="flex items-baseline gap-1 group mb-4">
 <span className="font-sans font-extrabold text-2xl tracking-tight text-stone-950 group-hover:text-amber-600 transition-colors">MAISON</span>
 <span className="text-amber-500 font-mono text-xs font-bold tracking-widest uppercase">SAC</span>
 </Link>
 <h2 className="font-serif font-black text-stone-900 text-xl tracking-wide">CREATE MEMBERSHIP</h2>
 <span className="text-[10px] font-mono font-bold tracking-widest text-[#a37e4c] uppercase mt-1">Maison Atelier Registry</span>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 {[
 { label: "Full Name", icon: User, type: "text", placeholder: "Lord Alexander Carter", value: fullName, onChange: setFullName, error: nameError, autoComplete: "name" },
 { label: "Email Address", icon: Mail, type: "email", placeholder: "alex@luxury-club.com", value: email, onChange: setEmail, error: emailError, autoComplete: "email" },
 ].map(({ label, icon: Icon, type, placeholder, value, onChange, error, autoComplete }) => (
 <div key={label} className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-550 uppercase tracking-widest font-mono">{label}</label>
 <div className={`relative flex items-center rounded-xl border transition-all ${error ? "border-rose-500 bg-rose-50/10" : "border-stone-200 bg-stone-50/50 focus-within:border-amber-500"}`}>
 <Icon className="absolute left-3.5 w-4 h-4 text-stone-450" />
 <input
 type={type}
 placeholder={placeholder}
 className="w-full pl-10 pr-4 py-2.5 text-xs bg-transparent text-stone-850 font-medium focus:outline-none placeholder-stone-400"
 value={value}
 onChange={(e) => onChange(e.target.value)}
 disabled={isSubmitting}
 autoComplete={autoComplete}
 />
 </div>
 {error && <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">{error}</span>}
 </div>
 ))}

 {[
 { label: "Choose Password", value: password, onChange: setPassword, show: showPassword, toggle: () => setShowPassword(!showPassword), error: passwordError },
 { label: "Confirm Password", value: confirmPassword, onChange: setConfirmPassword, show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword), error: confirmError },
 ].map(({ label, value, onChange, show, toggle, error }) => (
 <div key={label} className="flex flex-col gap-1">
 <label className="text-[10px] font-extrabold text-stone-550 uppercase tracking-widest font-mono">{label}</label>
 <div className={`relative flex items-center rounded-xl border transition-all ${error ? "border-rose-500 bg-rose-50/10" : "border-stone-200 bg-stone-50/50 focus-within:border-amber-500"}`}>
 <Lock className="absolute left-3.5 w-4 h-4 text-stone-450" />
 <input
 type={show ? "text" : "password"}
 placeholder="••••••••"
 className="w-full pl-10 pr-10 py-2.5 text-xs bg-transparent text-stone-850 font-mono focus:outline-none placeholder-stone-400"
 value={value}
 onChange={(e) => onChange(e.target.value)}
 disabled={isSubmitting}
 autoComplete="new-password"
 />
 <button type="button" onClick={toggle} className="absolute right-3.5 p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors" tabIndex={-1}>
 {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {error && <span className="text-[10px] text-rose-500 font-bold font-mono tracking-wide">{error}</span>}
 </div>
 ))}

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full flex items-center justify-center gap-2 py-3 bg-stone-950 hover:bg-stone-900 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 disabled:opacity-50 mt-2"
 >
 {isSubmitting ? (
 <span className="w-4 h-4 border-2 border-stone-500 border-t-white animate-spin rounded-full" />
 ) : (
 <>REGISTER MEMBER <ArrowRight className="w-4 h-4" /></>
 )}
 </button>
 </form>

 <div className="mt-6 text-center">
 <p className="text-xs text-stone-500">
 Already have an account?{" "}
 <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold underline transition-colors">Sign In</Link>
 </p>
 </div>
 </div>
 </div>
 );
}
