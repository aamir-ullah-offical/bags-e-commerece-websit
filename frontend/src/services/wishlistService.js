import api from "./api";

export const wishlistService = {
  getWishlist: async () => {
    const { data } = await api.get("/wishlist");
    return data.wishlist || data;
  },

  addToWishlist: async (productId) => {
    const { data } = await api.post("/wishlist", { productId });
    return data.wishlist || data;
  },

  removeFromWishlist: async (productId) => {
    const { data } = await api.delete(`/wishlist/${productId}`);
    return data.wishlist || data;
  },

  toggleWishlist: async (productId) => {
    const { data } = await api.post(`/wishlist/toggle`, { productId });
    return data;
  },
};
