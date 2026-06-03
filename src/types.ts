export interface Review {
  name: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: number;
  name: string;
  sku?: string;
  category: string;
  brand: string;
  price: number;
  discount: number; // Percentage discount, e.g., 15 for 15%
  rating: number;
  stock: number;
  material: string;
  color: string;
  isFeatured: boolean;
  isTopPick: boolean;
  isTopSelling: boolean;
  soldCount: number;
  createdAt: string; // ISO format "YYYY-MM-DD"
  images: string[];
  description: string;
  specifications: Record<string, string>;
  reviews: Review[];
}

export interface Category {
  id: string; // matches product.category (or lowercase slug)
  name: string;
  image: string;
  count: number;
}

export interface Testimonial {
  id: number;
  name: string;
  photo: string;
  rating: number;
  comment: string;
  role: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  discountText: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}
