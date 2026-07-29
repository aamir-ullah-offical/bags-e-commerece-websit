import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(undefined);

/* ─── Per-user localStorage helpers ─── */
const getUserKey = (userId) => (userId ? `msac_cart_${userId}` : null);

const readUserLocal = (userId) => {
 const key = getUserKey(userId);
 if (!key) return [];
 try {
 const s = localStorage.getItem(key);
 const parsed = JSON.parse(s);
 return Array.isArray(parsed) ? parsed : [];
 } catch {
 return [];
 }
};

const normalizeServerItems = (raw) =>
  (raw.items || raw || []).map((item) => ({
    product: item.product || item,
    quantity: item.quantity ?? 1,
    selectedColor: item.selectedColor || (item.product || item).color,
    // Server stores discounted price in item.price; fall back to computing it
    unitPrice: item.price ?? null,
  }));

export function CartProvider({ children }) {
 const { user, isAuthenticated, isLoading } = useAuth();
 const userId = user?._id || user?.id;

 const [cartItems, setCartItems] = useState([]);

 /* ─── Server sync ─── */
 const syncFromServer = useCallback(async () => {
 try {
 const serverCart = await cartService.getCart();
 setCartItems(normalizeServerItems(serverCart));
 } catch {
 // Keep current in-memory state — server might be offline
 }
 }, []);

 /* ─── React to auth state changes ─── SECURITY: isolate per user */
 useEffect(() => {
 if (isLoading) return;

 if (isAuthenticated && userId) {
 // Load this user's cached cart from localStorage
 const cached = readUserLocal(userId);
 setCartItems(cached);
 // Then override with authoritative server data
 syncFromServer();
 } else {
 // Logged out — clear all cart state (prevents data leakage)
 setCartItems([]);
 }
 }, [isAuthenticated, userId, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

 /* ─── Persist to user-scoped localStorage ─── */
 useEffect(() => {
 const key = getUserKey(userId);
 if (key) {
 localStorage.setItem(key, JSON.stringify(cartItems));
 }
 }, [cartItems, userId]);

 /* ─── Actions ─── */
 const addToCart = async (product, quantity = 1, selectedColor) => {
    const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));
    setCartItems((prev) => {
      const pid = product._id || product.id;
      const idx = prev.findIndex(
        (i) => (i.product._id || i.product.id) === pid
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(product.stock || 99, updated[idx].quantity + quantity),
          unitPrice: discountedPrice,
        };
        return updated;
      }
      return [
        ...prev,
        { product, quantity, selectedColor: selectedColor || product.color, unitPrice: discountedPrice },
      ];
    });

 if (isAuthenticated) {
 try {
 await cartService.addToCart(product._id || product.id, quantity, selectedColor);
 } catch {
 // Silent fail — optimistic update already applied
 }
 }
 };

 const removeFromCart = async (productId) => {
 setCartItems((prev) =>
 prev.filter(
 (i) => (i.product._id || i.product.id) !== productId
 )
 );

 if (isAuthenticated) {
 try {
 await cartService.removeFromCart(productId);
 } catch {
 // Silent fail
 }
 }
 };

 const updateQuantity = async (productId, quantity) => {
 if (quantity <= 0) {
 removeFromCart(productId);
 return;
 }
 setCartItems((prev) =>
 prev.map((i) =>
 (i.product._id || i.product.id) === productId
 ? { ...i, quantity: Math.min(i.product.stock || 99, quantity) }
 : i
 )
 );

 if (isAuthenticated) {
 try {
 await cartService.updateQuantity(productId, quantity);
 } catch {
 // Silent fail
 }
 }
 };

 const clearCart = async () => {
 setCartItems([]);
 if (isAuthenticated) {
 try {
 await cartService.clearCart();
 } catch {
 // Silent fail
 }
 }
 };

 const getCartTotal = () =>
    cartItems.reduce((acc, item) => {
      // Prefer server-confirmed unit price; fall back to computing from product
      const unitPrice = item.unitPrice
        ?? Math.round(item.product.price * (1 - (item.product.discount || 0) / 100));
      return acc + unitPrice * item.quantity;
    }, 0);

 const getCartCount = () =>
 cartItems.reduce((acc, item) => acc + item.quantity, 0);

 return (
 <CartContext.Provider
 value={{
 cartItems,
 addToCart,
 removeFromCart,
 updateQuantity,
 clearCart,
 getCartTotal,
 getCartCount,
 syncFromServer,
 }}
 >
 {children}
 </CartContext.Provider>
 );
}

export function useCart() {
 const ctx = useContext(CartContext);
 if (!ctx) throw new Error("useCart must be used within a CartProvider");
 return ctx;
}
