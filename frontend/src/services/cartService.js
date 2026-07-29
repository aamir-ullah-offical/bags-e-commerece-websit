import api from "./api";

export const cartService = {
  getCart: async () => {
    const { data } = await api.get("/cart");
    return data.cart || data;
  },

  addToCart: async (productId, quantity = 1, selectedColor) => {
    const { data } = await api.post("/cart", { productId, quantity, selectedColor });
    return data.cart || data;
  },

  updateQuantity: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    return data.cart || data;
  },

  removeFromCart: async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    return data.cart || data;
  },

  clearCart: async () => {
    const { data } = await api.delete("/cart/clear");
    return data;
  },
};
