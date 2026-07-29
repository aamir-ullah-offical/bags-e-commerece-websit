import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
 Users, Search, RefreshCw, X, Shield, UserCheck,
 UserX, Trash2, Eye, KeyRound, ChevronDown, Package,
} from "lucide-react";
import api from "../../services/api";
import { formatPKR } from "../../utils/currency";

function StatusDot({ isActive }) {
 return (
 <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-emerald-600" : "text-rose-500"}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
 {isActive ? "Active" : "Suspended"}
 </span>
 );
}

const ROLE_BADGE = {
 admin: "text-amber-600 bg-amber-50 border-amber-200",
 customer: "text-stone-600 bg-stone-100 border-stone-200",
};

export default function UsersTab({ triggerToast }) {
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [roleFilter, setRoleFilter] = useState("");
 const [selectedUser, setSelectedUser] = useState(null);
 const [userOrders, setUserOrders] = useState([]);
 const [actionLoading, setActionLoading] = useState(false);
 const [resetPwModal, setResetPwModal] = useState(null);
 const [newPassword, setNewPassword] = useState("");
 const [detailTab, setDetailTab] = useState("info");

 useEffect(() => {
 fetchUsers();
 }, [roleFilter]);

 const fetchUsers = async () => {
 setLoading(true);
 try {
 const params = { limit: 100 };
 if (roleFilter) params.role = roleFilter;
 if (search) params.search = search;
 const { data } = await api.get("/admin/users", { params });
 setUsers(data.data || data.users || data);
 } catch {
 triggerToast("Failed to load users.", "error");
 } finally {
 setLoading(false);
 }
 };

 const openUser = async (user) => {
 setSelectedUser(user);
 setDetailTab("info");
 setUserOrders([]);
 try {
 const { data } = await api.get(`/admin/users/${user._id}`);
 setSelectedUser(data.user || user);
 setUserOrders(data.orders || []);
 } catch { /* use existing data */ }
 };

 const handleToggleStatus = async (u) => {
 setActionLoading(true);
 try {
 const { data } = await api.put(`/admin/users/${u._id}/status`, { isActive: !u.isActive });
 const updated = data.user || data;
 setUsers((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
 if (selectedUser?._id === updated._id) setSelectedUser(updated);
 triggerToast(`User ${updated.isActive ? "activated" : "suspended"}.`, "success");
 } catch (err) {
 triggerToast(err.response?.data?.message || "Failed to update user status.", "error");
 } finally {
 setActionLoading(false);
 }
 };

 const handleDeleteUser = async (u) => {
 if (!window.confirm(`Delete user "${u.fullName}"? This cannot be undone.`)) return;
 setActionLoading(true);
 try {
 await api.delete(`/admin/users/${u._id}`);
 setUsers((prev) => prev.filter((x) => x._id !== u._id));
 if (selectedUser?._id === u._id) setSelectedUser(null);
 triggerToast("User deleted.", "success");
 } catch (err) {
 triggerToast(err.response?.data?.message || "Failed to delete user.", "error");
 } finally {
 setActionLoading(false);
 }
 };

 const handleResetPassword = async (e) => {
 e.preventDefault();
 if (!newPassword || newPassword.length < 6) {
 triggerToast("Password must be at least 6 characters.", "error");
 return;
 }
 setActionLoading(true);
 try {
 await api.put(`/admin/users/${resetPwModal._id}/reset-password`, { newPassword });
 triggerToast(`Password reset for ${resetPwModal.fullName}.`, "success");
 setResetPwModal(null);
 setNewPassword("");
 } catch (err) {
 triggerToast(err.response?.data?.message || "Failed to reset password.", "error");
 } finally {
 setActionLoading(false);
 }
 };

 const filteredUsers = users.filter((u) => {
 if (!search) return true;
 const q = search.toLowerCase();
 return u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
 });

 return (
 <div className="space-y-5">
 <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
 <div>
 <h2 className="font-sans font-bold text-stone-900 text-sm uppercase tracking-wider">User Management</h2>
 <p className="text-[10px] text-stone-400 mt-0.5 font-medium">{users.length} total users</p>
 </div>
 <button onClick={fetchUsers} className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors">
 <RefreshCw className="w-3.5 h-3.5" /> Refresh
 </button>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 mb-5">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
 <input
 type="text"
 placeholder="Search by name or email..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
 className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none text-stone-800 placeholder-stone-400"
 />
 </div>
 <div className="relative">
 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 outline-none appearance-none cursor-pointer"
 >
 <option value="">All Roles</option>
 <option value="customer">Customers</option>
 <option value="admin">Admins</option>
 </select>
 <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
 </div>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-16">
 <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
 </div>
 ) : filteredUsers.length === 0 ? (
 <div className="text-center py-12 text-stone-400">
 <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
 <p className="text-xs font-medium">No users found.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-xl border border-stone-100">
 <table className="w-full text-xs">
 <thead className="bg-stone-50">
 <tr>
 {["User", "Role", "Joined", "Status", "Actions"].map((h) => (
 <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-widest text-stone-500 font-mono">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-stone-50">
 {filteredUsers.map((u) => (
 <tr key={u._id} className="hover:bg-stone-50 transition-colors">
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 <img
 src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=8c6d3f&color=fff&size=32`}
 referrerPolicy="no-referrer"
 alt=""
 className="w-8 h-8 rounded-lg object-cover border border-stone-100 shrink-0"
 />
 <div className="min-w-0">
 <p className="font-bold text-stone-800 truncate max-w-36">{u.fullName}</p>
 <p className="text-[10px] text-stone-400 truncate max-w-36">{u.email}</p>
 </div>
 </div>
 </td>
 <td className="px-4 py-3">
 <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border ${ROLE_BADGE[u.role] || ROLE_BADGE.customer}`}>
 {u.role}
 </span>
 </td>
 <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
 {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
 </td>
 <td className="px-4 py-3"><StatusDot isActive={u.isActive !== false} /></td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-1.5">
 <button onClick={() => openUser(u)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors" title="View Details">
 <Eye className="w-3.5 h-3.5" />
 </button>
 <button onClick={() => handleToggleStatus(u)} disabled={actionLoading} className={`p-1.5 rounded-lg transition-colors ${u.isActive !== false ? "hover:bg-amber-50 text-amber-500 hover:text-amber-600" : "hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600"}`} title={u.isActive !== false ? "Suspend" : "Activate"}>
 {u.isActive !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
 </button>
 <button onClick={() => { setResetPwModal(u); setNewPassword(""); }} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-500 hover:text-sky-600 transition-colors" title="Reset Password">
 <KeyRound className="w-3.5 h-3.5" />
 </button>
 {u.role !== "admin" && (
 <button onClick={() => handleDeleteUser(u)} disabled={actionLoading} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors" title="Delete User">
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* User Detail Panel */}
 <AnimatePresence>
 {selectedUser && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 20 }}
 className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
 >
 <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <img
 src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullName)}&background=8c6d3f&color=fff&size=48`}
 referrerPolicy="no-referrer"
 alt=""
 className="w-10 h-10 rounded-xl object-cover border border-stone-200"
 />
 <div>
 <h3 className="font-sans font-bold text-sm text-stone-900">{selectedUser.fullName}</h3>
 <p className="text-[10px] text-stone-400">{selectedUser.email}</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <StatusDot isActive={selectedUser.isActive !== false} />
 <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="flex border-b border-stone-100 px-6 pt-4">
 {[["info", "Profile"], ["orders", `Orders (${userOrders.length})`]].map(([id, label]) => (
 <button
 key={id}
 onClick={() => setDetailTab(id)}
 className={`px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest border-b-2 -mb-px transition-colors ${
 detailTab === id ? "border-amber-500 text-amber-600" : "border-transparent text-stone-400 hover:text-stone-700"
 }`}
 >
 {label}
 </button>
 ))}
 </div>

 <div className="p-6">
 {detailTab === "info" && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 {[
 ["Full Name", selectedUser.fullName],
 ["Email", selectedUser.email],
 ["Phone", selectedUser.phone || "—"],
 ["Role", selectedUser.role],
 ["Joined", new Date(selectedUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
 ["Last Login", selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : "—"],
 ["Email Verified", selectedUser.isEmailVerified ? "Yes" : "No"],
 ["Saved Addresses", selectedUser.addresses?.length || 0],
 ].map(([label, value]) => (
 <div key={label} className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
 <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 font-mono mb-1">{label}</p>
 <p className="font-semibold text-stone-800">{String(value)}</p>
 </div>
 ))}
 </div>
 )}

 {detailTab === "orders" && (
 <div>
 {userOrders.length === 0 ? (
 <div className="text-center py-8 text-stone-400">
 <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
 <p className="text-xs font-medium">No orders found for this user.</p>
 </div>
 ) : (
 <div className="space-y-2">
 {userOrders.map((order) => (
 <div key={order._id} className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
 <div className="flex-1 min-w-0">
 <p className="font-mono font-bold text-stone-900">{order.orderNumber}</p>
 <p className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</p>
 </div>
 <span className="font-mono font-bold text-stone-900">{formatPKR(Number(order.total))}</span>
 <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
 {order.orderStatus}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Reset Password Modal */}
 <AnimatePresence>
 {resetPwModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setResetPwModal(null)}
 className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs"
 />
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 className="relative bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-sm w-full p-6 z-10"
 >
 <h3 className="font-sans font-bold text-sm text-stone-900 mb-1 uppercase tracking-wider">Reset Password</h3>
 <p className="text-[10px] text-stone-400 mb-5">Set a new password for <strong className="text-stone-700">{resetPwModal.fullName}</strong>.</p>
 <form onSubmit={handleResetPassword} className="space-y-4">
 <div>
 <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase mb-1.5">New Password</label>
 <input
 type="password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 required
 minLength={6}
 placeholder="Min. 6 characters"
 className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 px-3.5 py-3 rounded-xl text-xs outline-none font-medium text-stone-800 placeholder-stone-400"
 />
 </div>
 <div className="flex gap-3">
 <button type="button" onClick={() => setResetPwModal(null)} className="flex-1 py-2.5 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-bold transition-colors">
 Cancel
 </button>
 <button type="submit" disabled={actionLoading} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
 {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />} Reset
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
}

