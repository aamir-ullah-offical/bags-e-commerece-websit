import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "customer")[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-stone-200 dark:border-stone-800 border-t-amber-500 animate-spin" />
          <span className="absolute text-[10px] uppercase tracking-widest font-mono font-bold text-stone-500 dark:text-stone-400 mt-24">
            MAISON SAC
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to unified main portal login
    return <Navigate to="/login" replace />;
  }

  // Enforce role-based access condition
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
