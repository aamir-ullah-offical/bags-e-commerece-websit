/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import { productService } from "./utils/productService";
import { adminService } from "./utils/adminService";

export default function App() {
  useEffect(() => {
    const triggerSync = async () => {
      try {
        await Promise.all([
          productService.initializeSync(),
          adminService.initializeSync()
        ]);
        console.log("[SYSTEM] Full-stack REST API assets cached successfully.");
      } catch (err) {
        console.warn("[SYSTEM] API boot sync deferred.", err);
      }
    };
    
    // Smooth parallel execution after 500ms interface stabilize
    const delay = setTimeout(triggerSync, 500);
    return () => clearTimeout(delay);
  }, []);

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <AuthProvider>
            <ThemeProvider>
              <AppRoutes />
            </ThemeProvider>
          </AuthProvider>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}

