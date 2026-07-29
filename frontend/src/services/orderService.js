import api from "./api";

export const orderService = {
  // Customer
  placeOrder: async (payload) => {
    const { data } = await api.post("/orders", payload);
    return data;
  },

  getMyOrders: async (params) => {
    const { data } = await api.get("/orders/my", { params });
    return data;
  },

  getOrderById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  cancelOrder: async (id, note) => {
    const { data } = await api.put(`/orders/${id}/cancel`, { note });
    return data;
  },

  // Public — no auth required
  trackOrder: async (trackingNumber) => {
    const { data } = await api.get(`/orders/track/${encodeURIComponent(trackingNumber)}`);
    return data;
  },

  // Admin
  getAllOrders: async (params) => {
    const { data } = await api.get("/orders", { params });
    return data;
  },

  updateOrderStatus: async (id, payload) => {
    const { data } = await api.put(`/orders/${id}/status`, payload);
    return data;
  },

  addTrackingUpdate: async (id, payload) => {
    const { data } = await api.post(`/orders/${id}/tracking`, payload);
    return data;
  },
};
