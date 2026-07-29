import api from "./api";

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("msac_token", data.token);
      localStorage.setItem("msac_user", JSON.stringify(data.user));
    }
    return data;
  },

  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    if (data.token) {
      localStorage.setItem("msac_token", data.token);
      localStorage.setItem("msac_user", JSON.stringify(data.user));
    }
    return data;
  },

  logout: async () => {
    // Capture user before clearing so we can clean up their scoped keys
    const storedUser = authService.getStoredUser();

    try {
      await api.post("/auth/logout");
    } catch (_) {
      // Ignore server errors on logout — always clear local state
    } finally {
      // Remove auth credentials
      localStorage.removeItem("msac_token");
      localStorage.removeItem("msac_user");

      // Remove legacy non-scoped keys (pre-isolation)
      localStorage.removeItem("msac_wishlist");
      localStorage.removeItem("msac_cart");

      // Remove user-scoped wishlist and cart keys
      if (storedUser) {
        const uid = storedUser._id || storedUser.id;
        if (uid) {
          localStorage.removeItem(`msac_wishlist_${uid}`);
          localStorage.removeItem(`msac_cart_${uid}`);
        }
      }
    }
  },

  getProfile: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  updateProfile: async (payload) => {
    const { data } = await api.put("/auth/me", payload);
    return data;
  },

  changePassword: async (payload) => {
    const { data } = await api.put("/auth/change-password", payload);
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (token, password) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    return data;
  },

  getStoredUser: () => {
    try {
      const str = localStorage.getItem("msac_user");
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },

  getToken: () => localStorage.getItem("msac_token"),
};
