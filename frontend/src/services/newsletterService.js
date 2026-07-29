import api from "./api";

export const newsletterService = {
  subscribe: async (email) => {
    const { data } = await api.post("/newsletter/subscribe", { email });
    return data;
  },

  unsubscribe: async (email) => {
    const { data } = await api.post("/newsletter/unsubscribe", { email });
    return data;
  },

  getSubscribers: async () => {
    const { data } = await api.get("/newsletter");
    const subs = data.data || data.subscribers || data;
    return Array.isArray(subs) ? subs : [];
  },
};
