import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, Info, Heart, ShoppingBag, X } from "lucide-react";

export type ToastType = "success" | "info" | "heart" | "bag";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal/Container fixed positioned */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="pointer-events-auto bg-stone-900/95 backdrop-blur-md text-white px-4 py-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 border border-stone-800"
            >
              <div className="flex items-center gap-3">
                {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                {toast.type === "bag" && <ShoppingBag className="w-5 h-5 text-amber-400 shrink-0" />}
                {toast.type === "heart" && <Heart className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
                <p className="text-sm font-medium tracking-wide font-sans">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
