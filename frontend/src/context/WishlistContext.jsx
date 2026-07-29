import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { wishlistService } from "../services/wishlistService";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(undefined);

/* ─── Per-user localStorage helpers ─── */
const getUserKey = (userId) => (userId ? `msac_wishlist_${userId}` : null);

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

export function WishlistProvider({ children }) {
 const { user, isAuthenticated, isLoading } = useAuth();
 const userId = user?._id || user?.id;

 const [wishlistItems, setWishlistItems] = useState([]);

 /* ─── Server sync ─── */
 const syncFromServer = useCallback(async () => {
 try {
 const serverWishlist = await wishlistService.getWishlist();
 const items = (serverWishlist.items || serverWishlist || []).map(
 (item) => item.product || item
 );
 setWishlistItems(Array.isArray(items) ? items : []);
 } catch {
 // Keep current in-memory state — server might be offline
 }
 }, []);

 /* ─── React to auth state changes ─── SECURITY: isolate per user */
 useEffect(() => {
 // Wait for auth to fully resolve before acting
 if (isLoading) return;

 if (isAuthenticated && userId) {
 // Load this user's cached wishlist from localStorage
 const cached = readUserLocal(userId);
 setWishlistItems(cached);
 // Then override with authoritative server data
 syncFromServer();
 } else {
 // Logged out or no user — clear ALL wishlist state (prevents data leakage)
 setWishlistItems([]);
 }
 }, [isAuthenticated, userId, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

 /* ─── Persist to user-scoped localStorage key ─── */
 useEffect(() => {
 const key = getUserKey(userId);
 if (key) {
 localStorage.setItem(key, JSON.stringify(wishlistItems));
 }
 // Do NOT persist if no userId — guest state lives in memory only
 }, [wishlistItems, userId]);

 /* ─── Actions ─── */
 const addToWishlist = async (product) => {
 const id = product._id || product.id;
 setWishlistItems((prev) => {
 if (prev.some((p) => (p._id || p.id) === id)) return prev;
 return [...prev, product];
 });

 if (isAuthenticated) {
 try {
 await wishlistService.addToWishlist(id);
 } catch {
 // Silent fail — optimistic update already applied
 }
 }
 };

 const removeFromWishlist = async (productId) => {
 setWishlistItems((prev) =>
 prev.filter((p) => (p._id || p.id) !== productId)
 );

 if (isAuthenticated) {
 try {
 await wishlistService.removeFromWishlist(productId);
 } catch {
 // Silent fail
 }
 }
 };

 // O(1) lookup via Set — avoids O(n) scan on every ProductCard render
 const wishlistIdSet = useMemo(
  () => new Set(wishlistItems.map((p) => p._id || p.id)),
  [wishlistItems]
 );
 const isInWishlist = useCallback((productId) => wishlistIdSet.has(productId), [wishlistIdSet]);

 const toggleWishlist = async (product) => {
 const id = product._id || product.id;
 if (isInWishlist(id)) {
 await removeFromWishlist(id);
 } else {
 await addToWishlist(product);
 }
 };

 return (
 <WishlistContext.Provider
 value={{
 wishlistItems,
 addToWishlist,
 removeFromWishlist,
 isInWishlist,
 toggleWishlist,
 syncFromServer,
 }}
 >
 {children}
 </WishlistContext.Provider>
 );
}

export function useWishlist() {
 const ctx = useContext(WishlistContext);
 if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
 return ctx;
}
