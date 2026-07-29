import api from "./api";

export const reviewService = {
  getProductReviews: async (productId) => {
    const { data } = await api.get(`/reviews/product/${productId}`);
    return data.data || data.reviews || data;
  },

  addReview: async (productId, payload) => {
    const { data } = await api.post(`/reviews/product/${productId}`, payload);
    return data;
  },

  updateReview: async (reviewId, payload) => {
    const { data } = await api.put(`/reviews/${reviewId}`, payload);
    return data;
  },

  deleteReview: async (reviewId) => {
    const { data } = await api.delete(`/reviews/${reviewId}`);
    return data;
  },
};
