import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
 User,
 Mail,
 Phone,
 Lock,
 Camera,
 Check,
 X,
 Eye,
 EyeOff,
 MapPin,
 Plus,
 Trash2,
 Edit3,
 Save,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import Breadcrumb from "../components/Breadcrumb";

const TABS = [
 { id: "profile", label: "Profile Info", icon: User },
 { id: "password", label: "Change Password", icon: Lock },
 { id: "addresses", label: "Address Book", icon: MapPin },
];

function InputField({ label, type = "text", value, onChange, placeholder, required, disabled }) {
 return (
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">
 {label}
 </label>
 <input
 type={type}
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 required={required}
 disabled={disabled}
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400 disabled:opacity-50 transition-colors"
 />
 </div>
 );
}

export default function UserProfile() {
 const { user, updateUser } = useAuth();
 const { showToast } = useToast();
 const fileInputRef = useRef(null);

 const [activeTab, setActiveTab] = useState("profile");
 const [saving, setSaving] = useState(false);

 // Profile fields
 const [fullName, setFullName] = useState(user?.fullName || "");
 const [email, setEmail] = useState(user?.email || "");
 const [phone, setPhone] = useState(user?.phone || "");
 const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

 // Password fields
 const [currentPassword, setCurrentPassword] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [showCurrent, setShowCurrent] = useState(false);
 const [showNew, setShowNew] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);

 // Address fields
 const [addresses, setAddresses] = useState(user?.addresses || []);
 const [editingAddress, setEditingAddress] = useState(null);
 const [newAddress, setNewAddress] = useState(null);

 const handleAvatarChange = (e) => {
 const file = e.target.files[0];
 if (!file) return;
 if (file.size > 5 * 1024 * 1024) {
 showToast("Image must be under 5MB.", "error");
 return;
 }
 const reader = new FileReader();
 reader.onloadend = () => setAvatarPreview(reader.result);
 reader.readAsDataURL(file);
 };

 const handleSaveProfile = async (e) => {
 e.preventDefault();
 if (!fullName.trim()) {
 showToast("Full name is required.", "error");
 return;
 }
 if (fullName.trim().length < 3) {
 showToast("Full name must be at least 3 characters.", "error");
 return;
 }
 if (phone.trim() && !/^[+\d][\d\s\-()]{6,19}$/.test(phone.trim())) {
 showToast("Phone number format is invalid. Example: +92 300 1234567", "error");
 return;
 }
 setSaving(true);
 try {
 // Email changes are not supported via this form (requires verification)
 const payload = { fullName: fullName.trim(), phone: phone.trim() };
 if (avatarPreview && avatarPreview !== user?.avatar) {
 payload.avatar = avatarPreview;
 }
 const { user: updated } = await authService.updateProfile(payload);
 updateUser(updated);
 showToast("Profile updated successfully.", "success");
 } catch (err) {
 showToast(err.response?.data?.message || "Failed to update profile.", "error");
 } finally {
 setSaving(false);
 }
 };

 const handleChangePassword = async (e) => {
 e.preventDefault();
 if (!currentPassword || !newPassword || !confirmPassword) {
 showToast("All password fields are required.", "error");
 return;
 }
 if (newPassword !== confirmPassword) {
 showToast("New passwords do not match.", "error");
 return;
 }
 if (newPassword.length < 6) {
 showToast("Password must be at least 6 characters.", "error");
 return;
 }
 setSaving(true);
 try {
 await authService.changePassword({ currentPassword, newPassword });
 showToast("Password changed successfully.", "success");
 setCurrentPassword("");
 setNewPassword("");
 setConfirmPassword("");
 } catch (err) {
 showToast(err.response?.data?.message || "Failed to change password.", "error");
 } finally {
 setSaving(false);
 }
 };

 const emptyAddress = () => ({
 label: "Home",
 fullName: user?.fullName || "",
 phone: "",
 street: "",
 city: "",
 state: "",
 postalCode: "",
 country: "Pakistan",
 isDefault: false,
 });

 const handleSaveAddresses = async (updatedList) => {
 setSaving(true);
 try {
 const { user: updated } = await authService.updateProfile({ addresses: updatedList });
 updateUser(updated);
 setAddresses(updated.addresses || updatedList);
 showToast("Addresses saved.", "success");
 } catch (err) {
 showToast(err.response?.data?.message || "Failed to save addresses.", "error");
 } finally {
 setSaving(false);
 }
 };

 const handleDeleteAddress = (idx) => {
 const updated = addresses.filter((_, i) => i !== idx);
 setAddresses(updated);
 handleSaveAddresses(updated);
 };

 const handleSetDefault = (idx) => {
 const updated = addresses.map((a, i) => ({ ...a, isDefault: i === idx }));
 setAddresses(updated);
 handleSaveAddresses(updated);
 };

 const handleSaveAddress = (addr, idx) => {
 let updated;
 if (idx === null) {
 updated = [...addresses, addr];
 } else {
 updated = addresses.map((a, i) => (i === idx ? addr : a));
 }
 setAddresses(updated);
 handleSaveAddresses(updated);
 setEditingAddress(null);
 setNewAddress(null);
 };

 return (
 <div id="user-profile-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900 transition-colors">
 <Breadcrumb items={[{ label: "My Account" }]} />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
 <h1 className="font-sans font-black text-3xl text-stone-900 tracking-tight mb-8">
 My Account
 </h1>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

 {/* Sidebar */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-5">
 {/* Avatar */}
 <div className="flex flex-col items-center gap-3 pb-5 border-b border-stone-100 mb-5">
 <div className="relative group">
 <img
 src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=8c6d3f&color=fff`}
 alt={user?.fullName}
 referrerPolicy="no-referrer"
 className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-100 shadow-sm"
 />
 <button
 onClick={() => fileInputRef.current?.click()}
 className="absolute inset-0 rounded-2xl bg-stone-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <Camera className="w-5 h-5 text-white" />
 </button>
 </div>
 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
 <div className="text-center">
 <p className="font-bold text-sm text-stone-900 truncate max-w-32">{user?.fullName}</p>
 <p className="text-[10px] text-stone-400 truncate max-w-32">{user?.email}</p>
 <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-mono">
 Atelier Member
 </span>
 </div>
 </div>

 {/* Tab Links */}
 <nav className="space-y-1">
 {TABS.map((tab) => {
 const Icon = tab.icon;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
 activeTab === tab.id
 ? "bg-amber-600 text-stone-950"
 : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
 }`}
 >
 <Icon className="w-4 h-4 shrink-0" />
 {tab.label}
 </button>
 );
 })}
 </nav>
 </div>
 </div>

 {/* Main Content */}
 <div className="lg:col-span-3">
 <AnimatePresence mode="wait">

 {/* PROFILE TAB */}
 {activeTab === "profile" && (
 <motion.div
 key="profile"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="bg-white rounded-2xl border border-stone-150 shadow-xs p-6"
 >
 <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-stone-900 mb-6 pb-4 border-b border-stone-100">
 Personal Information
 </h2>
 <form onSubmit={handleSaveProfile} className="space-y-5">
 {/* Avatar upload row */}
 <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
 <img
 src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=8c6d3f&color=fff`}
 alt=""
 referrerPolicy="no-referrer"
 className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
 />
 <div>
 <p className="text-xs font-bold text-stone-800">Profile Photo</p>
 <p className="text-[10px] text-stone-400 mt-0.5">JPG, PNG or WebP. Max 5MB.</p>
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
 >
 <Camera className="w-3 h-3" /> Change Photo
 </button>
 {avatarPreview && avatarPreview !== user?.avatar && (
 <button
 type="button"
 onClick={() => setAvatarPreview(user?.avatar || "")}
 className="mt-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1"
 >
 <X className="w-3 h-3" /> Remove
 </button>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <InputField label="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">Email Address</label>
 <input type="email" value={email} disabled className="w-full bg-stone-100 border border-stone-200 px-3.5 py-3 rounded-xl text-xs font-medium text-stone-500 cursor-not-allowed" />
 <p className="text-[10px] text-stone-400 mt-1">To change your email, contact support.</p>
 </div>
 </div>
 <InputField label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
 <InputField label="Account Role" value={user?.role === "admin" ? "Administrator" : "Atelier Member"} disabled />

 <div className="pt-2">
 <button
 type="submit"
 disabled={saving}
 className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-colors disabled:opacity-60 shadow-md"
 >
 {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 {saving ? "Saving..." : "Save Changes"}
 </button>
 </div>
 </form>
 </motion.div>
 )}

 {/* PASSWORD TAB */}
 {activeTab === "password" && (
 <motion.div
 key="password"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="bg-white rounded-2xl border border-stone-150 shadow-xs p-6"
 >
 <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-stone-900 mb-6 pb-4 border-b border-stone-100">
 Change Password
 </h2>
 <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
 {[
 { label: "Current Password", value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: setShowCurrent },
 { label: "New Password", value: newPassword, setter: setNewPassword, show: showNew, toggle: setShowNew },
 { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: setShowConfirm },
 ].map(({ label, value, setter, show, toggle }) => (
 <div key={label}>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">{label}</label>
 <div className="relative">
 <input
 type={show ? "text" : "password"}
 value={value}
 onChange={(e) => setter(e.target.value)}
 required
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3.5 py-3 pr-10 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400 transition-colors"
 />
 <button
 type="button"
 onClick={() => toggle(!show)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
 >
 {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>
 ))}

 <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-[10px] text-stone-400 space-y-1">
 <p className="font-bold text-stone-600 uppercase tracking-wider">Requirements:</p>
 <p>• At least 6 characters long</p>
 <p>• Mix of letters and numbers recommended</p>
 </div>

 <button
 type="submit"
 disabled={saving}
 className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-colors disabled:opacity-60 shadow-md"
 >
 {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
 {saving ? "Updating..." : "Update Password"}
 </button>
 </form>
 </motion.div>
 )}

 {/* ADDRESSES TAB */}
 {activeTab === "addresses" && (
 <motion.div
 key="addresses"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="space-y-4"
 >
 <div className="bg-white rounded-2xl border border-stone-150 shadow-xs p-6">
 <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
 <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-stone-900">
 Saved Addresses
 </h2>
 {!newAddress && (
 <button
 onClick={() => setNewAddress(emptyAddress())}
 className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
 >
 <Plus className="w-4 h-4" /> Add New
 </button>
 )}
 </div>

 {addresses.length === 0 && !newAddress && (
 <div className="text-center py-8 text-stone-400">
 <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
 <p className="text-xs font-medium">No addresses saved yet.</p>
 </div>
 )}

 <div className="space-y-3">
 {addresses.map((addr, idx) => (
 editingAddress === idx ? (
 <AddressForm
 key={idx}
 initialData={addr}
 onSave={(a) => handleSaveAddress(a, idx)}
 onCancel={() => setEditingAddress(null)}
 saving={saving}
 />
 ) : (
 <div key={idx} className={`p-4 rounded-xl border transition-colors ${addr.isDefault ? "border-amber-300 bg-amber-50/50" : "border-stone-150 bg-stone-50"}`}>
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 font-mono bg-stone-100 px-2 py-0.5 rounded">
 {addr.label}
 </span>
 {addr.isDefault && (
 <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600 font-mono">
 Default
 </span>
 )}
 </div>
 <p className="text-xs font-bold text-stone-800">{addr.fullName}</p>
 {addr.phone && <p className="text-[10px] text-stone-400">{addr.phone}</p>}
 <p className="text-[10px] text-stone-400 leading-relaxed mt-0.5">
 {[addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(", ")}
 </p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 {!addr.isDefault && (
 <button onClick={() => handleSetDefault(idx)} className="text-[10px] text-stone-400 hover:text-amber-600 transition-colors font-medium">Set Default</button>
 )}
 <button onClick={() => setEditingAddress(idx)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
 <Edit3 className="w-3.5 h-3.5" />
 </button>
 <button onClick={() => handleDeleteAddress(idx)} className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition-colors">
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 )
 ))}

 {newAddress && (
 <AddressForm
 initialData={newAddress}
 onSave={(a) => handleSaveAddress(a, null)}
 onCancel={() => setNewAddress(null)}
 saving={saving}
 />
 )}
 </div>
 </div>
 </motion.div>
 )}

 </AnimatePresence>
 </div>
 </div>
 </div>
 </div>
 );
}

function RefreshCw({ className }) {
 return (
 <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
 <path d="M21 3v5h-5" />
 <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
 <path d="M8 16H3v5" />
 </svg>
 );
}

function AddressForm({ initialData, onSave, onCancel, saving }) {
 const { showToast } = useToast();
 const [form, setForm] = useState({ ...initialData });
 const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

 return (
 <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/30 space-y-3">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1">Label</label>
 <select
 value={form.label}
 onChange={set("label")}
 className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-lg text-xs outline-none font-medium text-stone-800"
 >
 {["Home", "Work", "Other"].map((l) => <option key={l} value={l}>{l}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1">Full Name</label>
 <input value={form.fullName} onChange={set("fullName")} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-lg text-xs outline-none font-medium text-stone-800" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1">Phone</label>
 <input value={form.phone} onChange={set("phone")} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-lg text-xs outline-none font-medium text-stone-800" />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1">Street</label>
 <input value={form.street} onChange={set("street")} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-lg text-xs outline-none font-medium text-stone-800" />
 </div>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[["City", "city"], ["State", "state"], ["Postal", "postalCode"], ["Country", "country"]].map(([lbl, key]) => (
 <div key={key}>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1">{lbl}</label>
 <input value={form[key]} onChange={set(key)} className="w-full bg-white border border-stone-200 focus:border-amber-500 px-3 py-2.5 rounded-lg text-xs outline-none font-medium text-stone-800" />
 </div>
 ))}
 </div>
 <div className="flex items-center justify-between pt-1">
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="accent-amber-500 w-3.5 h-3.5" />
 <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Set as default</span>
 </label>
 <div className="flex items-center gap-2">
 <button onClick={onCancel} className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg transition-colors">
 Cancel
 </button>
 <button
 onClick={() => {
 if (!form.fullName?.trim()) { showToast("Full name is required.", "error"); return; }
 if (!form.street?.trim()) { showToast("Street address is required.", "error"); return; }
 if (!form.city?.trim()) { showToast("City is required.", "error"); return; }
 onSave(form);
 }}
 disabled={saving}
 className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5"
 >
 <Check className="w-3.5 h-3.5" /> Save
 </button>
 </div>
 </div>
 </div>
 );
}
