/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}

