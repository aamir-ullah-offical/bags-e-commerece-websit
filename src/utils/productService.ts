import { Product, Category, Banner, Testimonial } from "../types";
import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";
import bannersData from "../data/banners.json";
import testimonialsData from "../data/testimonials.json";

// Dynamic storage getters/setters helper
const loadLocalOrCreate = <T>(key: string, backup: T): T => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return backup;
    }
  }
  // Initialize on first access
  localStorage.setItem(key, JSON.stringify(backup));
  return backup;
};

let productsList = loadLocalOrCreate("mds_products", productsData as Product[]);
let categoriesList = loadLocalOrCreate("mds_categories", categoriesData as Category[]);
let bannersList = loadLocalOrCreate("mds_banners", bannersData as Banner[]);
let testimonialsList = loadLocalOrCreate("mds_testimonials", testimonialsData as Testimonial[]);

export const productService = {
  getProducts: (): Product[] => {
    // Always refresh memory state with storage
    productsList = loadLocalOrCreate("mds_products", productsData as Product[]);
    return productsList;
  },

  getProductById: (id: number): Product | undefined => {
    productsList = productService.getProducts();
    return productsList.find((p) => p.id === id);
  },

  getCategories: (): Category[] => {
    categoriesList = loadLocalOrCreate("mds_categories", categoriesData as Category[]);
    productsList = productService.getProducts();
    return categoriesList.map((cat) => ({
      ...cat,
      count: productsList.filter((p) => p.category === cat.name).length,
    }));
  },

  getBanners: (): Banner[] => {
    bannersList = loadLocalOrCreate("mds_banners", bannersData as Banner[]);
    return bannersList;
  },

  getTestimonials: (): Testimonial[] => {
    testimonialsList = loadLocalOrCreate("mds_testimonials", testimonialsData as Testimonial[]);
    return testimonialsList;
  },

  getRelatedProducts: (product: Product, limit = 4): Product[] => {
    productsList = productService.getProducts();
    return productsList
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit);
  },

  getTopSelling: (): Product[] => {
    productsList = productService.getProducts();
    return productsList.filter((p) => p.isTopSelling);
  },

  getNewArrivals: (): Product[] => {
    productsList = productService.getProducts();
    return [...productsList]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getFeaturedProducts: (): Product[] => {
    productsList = productService.getProducts();
    return productsList.filter((p) => p.isFeatured);
  },

  getTopPicks: (): Product[] => {
    productsList = productService.getProducts();
    return productsList.filter((p) => p.isTopPick);
  },

  // Save triggers from Admin Dashboard
  saveProducts: (list: Product[]) => {
    productsList = list;
    localStorage.setItem("mds_products", JSON.stringify(list));
  },

  saveCategories: (list: Category[]) => {
    categoriesList = list;
    localStorage.setItem("mds_categories", JSON.stringify(list));
  },

  saveBanners: (list: Banner[]) => {
    bannersList = list;
    localStorage.setItem("mds_banners", JSON.stringify(list));
  },

  saveTestimonials: (list: Testimonial[]) => {
    testimonialsList = list;
    localStorage.setItem("mds_testimonials", JSON.stringify(list));
  },

  // Advanced query search & filter
  queryProducts: (params: {
    search?: string;
    category?: string;
    brand?: string;
    colors?: string[];
    materials?: string[];
    minPrice?: number;
    maxPrice?: number;
    ratings?: number[];
    discountsOnly?: boolean;
    inStockOnly?: boolean;
    sort?: string;
  }): Product[] => {
    productsList = productService.getProducts();
    let result = [...productsList];

    // Real-time search
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q)
      );
    }

    // Category
    if (params.category && params.category !== "All") {
      result = result.filter((p) => p.category === params.category);
    }

    // Brand
    if (params.brand) {
      result = result.filter((p) => p.brand === params.brand);
    }

    // Colors
    if (params.colors && params.colors.length > 0) {
      result = result.filter((p) => params.colors!.includes(p.color));
    }

    // Materials
    if (params.materials && params.materials.length > 0) {
      result = result.filter((p) => params.materials!.includes(p.material));
    }

    // Prices (checking discount price as true evaluation price)
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      result = result.filter((p) => {
        const finalPrice = p.price * (1 - p.discount / 100);
        const minOk = params.minPrice === undefined || finalPrice >= params.minPrice;
        const maxOk = params.maxPrice === undefined || finalPrice <= params.maxPrice;
        return minOk && maxOk;
      });
    }

    // Minimum Ratings
    if (params.ratings && params.ratings.length > 0) {
      result = result.filter((p) => params.ratings!.some((r) => p.rating >= r));
    }

    // Discounts Only
    if (params.discountsOnly) {
      result = result.filter((p) => p.discount > 0);
    }

    // In Stock Only
    if (params.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting Options
    if (params.sort) {
      switch (params.sort) {
        case "Latest":
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "Price Low to High":
          result.sort((a, b) => {
            const pA = a.price * (1 - a.discount / 100);
            const pB = b.price * (1 - b.discount / 100);
            return pA - pB;
          });
          break;
        case "Price High to Low":
          result.sort((a, b) => {
            const pA = a.price * (1 - a.discount / 100);
            const pB = b.price * (1 - b.discount / 100);
            return pB - pA;
          });
          break;
        case "Best Selling":
          result.sort((a, b) => b.soldCount - a.soldCount);
          break;
        case "Top Picks":
          result = result.filter((p) => p.isTopPick);
          break;
        case "Featured":
          result = result.filter((p) => p.isFeatured);
          break;
        case "Highest Rated":
          result.sort((a, b) => b.rating - a.rating);
          break;
        default:
          break;
      }
    }

    return result;
  },
};
