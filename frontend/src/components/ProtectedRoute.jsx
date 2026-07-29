import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

export default function ProtectedRoute({ children, allowedRoles }) {
 const { isAuthenticated, user, isLoading } = useAuth();
 const { settings } = useSettings();
 const location = useLocation();

 if (isLoading) {
 return (
 <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
 <div className="relative flex items-center justify-center">
 <div className="w-16 h-16 rounded-full border-4 border-stone-200 border-t-amber-500 animate-spin" />
 <span className="absolute text-[10px] uppercase tracking-widest font-mono font-bold text-stone-500 top-full mt-2">
 {settings.storeName}
 </span>
 </div>
 </div>
 );
 }

 if (!isAuthenticated) {
 return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
 }

 if (allowedRoles && user && !allowedRoles.includes(user.role)) {
 return <Navigate to="/" replace />;
 }

 return <>{children}</>;
}
