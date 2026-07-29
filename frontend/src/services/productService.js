import api from "./api";

// Local JSON fallbacks — used when backend is unavailable
import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";
import bannersData from "../data/banners.json";
import testimonialsData from "../data/testimonials.json";

const tryApi = async (apiFn, fallback) => {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
};

// ── In-memory request cache (5 min TTL) ──────────────────────────────────────
const _cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}
export function invalidateCache() {
  _cache.clear();
}

// Normalize backend documents: ensure `id` is always set (from _id for MongoDB docs)
const norm = (arr) =>
  Array.isArray(arr) ? arr.map((p) => (p._id ? { ...p, id: p.id || p._id } : p)) : arr;

export const productService = {
  getProducts: async () => {
    const key = "products:all";
    const cached = getCached(key);
    if (cached) return cached;
    const result = await tryApi(async () => {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      return norm(data.data || data.products || data);
    }, productsData);
    setCache(key, result);
    return result;
  },

  getProductById: async (id) => {
    return tryApi(async () => {
      const { data } = await api.get(`/products/${id}`);
      const p = data.product || data;
      return p._id ? { ...p, id: p.id || p._id } : p;
    }, productsData.find((p) => p.id === Number(id)));
  },

  queryProducts: async (params) => {
    return tryApi(async () => {
      const { data } = await api.get("/products", { params });
      return norm(data.data || data.products || data);
    }, _localQuery(productsData, params));
  },

  getCategories: async () => {
    const key = "categories";
    const cached = getCached(key);
    if (cached) return cached;
    const result = await tryApi(async () => {
      const { data } = await api.get("/categories");
      return norm(data.categories || data);
    }, categoriesData);
    setCache(key, result);
    return result;
  },

  getBanners: async () => {
    const key = "banners";
    const cached = getCached(key);
    if (cached) return cached;
    const result = await tryApi(async () => {
      const { data } = await api.get("/banners");
      return norm(data.banners || data);
    }, bannersData);
    setCache(key, result);
    return result;
  },

  getTestimonials: async () => {
    const key = "testimonials";
    const cached = getCached(key);
    if (cached) return cached;
    const result = await tryApi(async () => {
      const { data } = await api.get("/testimonials");
      return norm(data.testimonials || data);
    }, testimonialsData);
    setCache(key, result);
    return result;
  },

  getRelatedProducts: async (product, limit = 4) => {
    return tryApi(async () => {
      const { data } = await api.get(`/products/${product.id || product._id}/related`, {
        params: { limit },
      });
      return norm(data.products || data);
    }, productsData.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit));
  },

  getTopSelling: async () => {
    const key = "products:topSelling";
    const cached = getCached(key);
    if (cached) return cached;
    const result = await tryApi(async () => {
      const { data } = await api.get("/products", { params: { isTopSelling: true } });
      return norm(data.data || data.products || data);
    }, productsData.filter((p) => p.isTopSelling));
    setCache(key, result);
    return result;
  },

  getNewArrivals: async () => {
    const key = "products:newArrivals";
    const cached = getCached(key);
    if (cached) return cached;
    const result = await tryApi(async () => {
      const { data } = await api.get("/products", { params: { sort: "-createdAt", limit: 8 } });
      return norm(data.data || data.products || data);
    }, [...productsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setCache(key, result);
    return result;
  },

  getFeaturedProducts: async () => {
    const key = "products:featured";
    const cached = getCached(key);
    if (cached) return cached;
    const result = await tryApi(async () => {
      const { data } = await api.get("/products", { params: { isFeatured: true } });
      return norm(data.data || data.products || data);
    }, productsData.filter((p) => p.isFeatured));
    setCache(key, result);
    return result;
  },

  getTopPicks: async () => {
    const key = "products:topPicks";
    const cached = getCached(key);
    if (cached) return cached;
    const result = await tryApi(async () => {
      const { data } = await api.get("/products", { params: { isTopPick: true } });
      return norm(data.data || data.products || data);
    }, productsData.filter((p) => p.isTopPick));
    setCache(key, result);
    return result;
  },

  // Admin operations
  createProduct: async (payload) => {
    const { data } = await api.post("/products", payload);
    return data;
  },

  updateProduct: async (id, payload) => {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  },

  deleteProduct: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  bulkUpdateProducts: async (payload) => {
    const { data } = await api.put("/products/bulk", payload);
    return data;
  },
};

export function filterProducts(products, params = {}) {
  return _localQuery(products, params);
}

// Local query fallback — mirrors backend filter logic
function _localQuery(products, params = {}) {
  let result = [...products];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q))
    );
  }

  if (params.category && params.category !== "All") {
    result = result.filter((p) => p.category === params.category);
  }

  if (params.brand) result = result.filter((p) => p.brand === params.brand);

  if (params.colors?.length > 0) {
    result = result.filter((p) => params.colors.includes(p.color));
  }

  if (params.materials?.length > 0) {
    result = result.filter((p) => params.materials.includes(p.material));
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    result = result.filter((p) => {
      const fp = p.price * (1 - (p.discount || 0) / 100);
      return (params.minPrice === undefined || fp >= params.minPrice) &&
             (params.maxPrice === undefined || fp <= params.maxPrice);
    });
  }

  if (params.ratings?.length > 0) {
    result = result.filter((p) => params.ratings.some((r) => p.rating >= r));
  }

  if (params.discountsOnly) result = result.filter((p) => p.discount > 0);
  if (params.inStockOnly) result = result.filter((p) => p.stock > 0);
  if (params.isFeatured) result = result.filter((p) => p.isFeatured);
  if (params.isTopPick) result = result.filter((p) => p.isTopPick);
  if (params.isTopSelling) result = result.filter((p) => p.isTopSelling);

  switch (params.sort) {
    case "Latest":
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "Price Low to High":
      result.sort((a, b) => a.price * (1 - a.discount / 100) - b.price * (1 - b.discount / 100));
      break;
    case "Price High to Low":
      result.sort((a, b) => b.price * (1 - b.discount / 100) - a.price * (1 - a.discount / 100));
      break;
    case "Best Selling":
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      break;
    case "Highest Rated":
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    default:
      break;
  }

  return result;
}
