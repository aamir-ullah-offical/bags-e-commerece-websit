import fs from "fs";
import path from "path";
import { Product, Category, Banner, Testimonial } from "../types";
import { ContactInfo, WebSettings, AppearanceSettings, StaticPage, AdminProfile, NewsSubscriber } from "../utils/adminService";

// Collection Types
export interface OrderItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone?: string;
  };
  products: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: "Stripe" | "PayPal" | "Cash On Delivery";
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Confirmed" | "Processing" | "Packed" | "Shipped" | "Out For Delivery" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  role: "customer" | "admin";
  fullName: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  phoneNumber?: string;
  status: "active" | "suspended";
  lastLogin?: string;
  addresses: Array<{
    id: string;
    title: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  createdAt: string;
}

export interface CartDatabase {
  userId: string;
  items: Array<{
    productId: number;
    quantity: number;
    selectedColor?: string;
  }>;
}

export interface WishlistDatabase {
  userId: string;
  productIds: number[];
}

const DATA_DIR = path.join(process.cwd(), "src", "data");

// Helper to ensure database files exist and load data
export class Database {
  private getFilePath(filename: string): string {
    return path.join(DATA_DIR, filename);
  }

  private readJSON<T>(filename: string, fallback: T): T {
    const file = this.getFilePath(filename);
    try {
      if (!fs.existsSync(file)) {
        // Try reading backup from root src/data if it exists (e.g. products.json)
        this.writeJSON(filename, fallback);
        return fallback;
      }
      const raw = fs.readFileSync(file, "utf-8");
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`Database read error for ${filename}:`, err);
      return fallback;
    }
  }

  private writeJSON<T>(filename: string, data: T): void {
    const file = this.getFilePath(filename);
    try {
      // Ensure directory exists
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error(`Database write error for ${filename}:`, err);
    }
  }

  // --- Core Table Handlers ---

  public getProducts(): Product[] {
    return this.readJSON<Product[]>("products.json", []);
  }

  public saveProducts(list: Product[]): void {
    this.writeJSON("products.json", list);
  }

  public getCategories(): Category[] {
    return this.readJSON<Category[]>("categories.json", []);
  }

  public saveCategories(list: Category[]): void {
    this.writeJSON("categories.json", list);
  }

  public getBanners(): Banner[] {
    return this.readJSON<Banner[]>("banners.json", []);
  }

  public saveBanners(list: Banner[]): void {
    this.writeJSON("banners.json", list);
  }

  public getTestimonials(): Testimonial[] {
    return this.readJSON<Testimonial[]>("testimonials.json", []);
  }

  public saveTestimonials(list: Testimonial[]): void {
    this.writeJSON("testimonials.json", list);
  }

  public getSubscribers(): NewsSubscriber[] {
    return this.readJSON<NewsSubscriber[]>("subscribers_db.json", [
      { id: "sub-1", email: "gabrielle.royer@parisian.fr", date: "2026-05-12" },
      { id: "sub-2", email: "julien.marceau@vogue.fr", date: "2026-05-20" },
      { id: "sub-3", email: "elena.petrova@styling.co.uk", date: "2026-06-01" },
      { id: "sub-4", email: "takashi.sato@ginza-carry.jp", date: "2026-06-02" }
    ]);
  }

  public saveSubscribers(list: NewsSubscriber[]): void {
    this.writeJSON("subscribers_db.json", list);
  }

  public getContactInfo(): ContactInfo {
    return this.readJSON<ContactInfo>("contact_db.json", {
      phone: "+33 (0) 1 42 77 96 00",
      email: "concierge@maisonsac-luxury.com",
      address: "8 Rue des Francs-Bourgeois, 75003 Paris, France",
      mapUrl: "https://maps.google.com/maps?q=Paris+France&t=&z=13&ie=UTF8&iwloc=&output=embed",
      workingHours: "Mon - Sat: 10:00 AM - 7:00 PM | Sun: Closed"
    });
  }

  public saveContactInfo(data: ContactInfo): void {
    this.writeJSON("contact_db.json", data);
  }

  public getWebsiteSettings(): WebSettings {
    return this.readJSON<WebSettings>("settings_db.json", {
      storeName: "MAISON SAC",
      storeTagline: "Exquisite Purses, Bags, Wallets, & Luxury Carryalls",
      contactEmail: "concierge@maisonsac-luxury.com",
      contactPhone: "+33 (0) 1 42 77 96 00",
      storeAddress: "8 Rue des Francs-Bourgeois, 75003 Paris, France"
    });
  }

  public saveWebsiteSettings(data: WebSettings): void {
    this.writeJSON("settings_db.json", data);
  }

  public getAppearanceSettings(): AppearanceSettings {
    return this.readJSON<AppearanceSettings>("appearance_db.json", {
      primaryColor: "#0c0a09",
      secondaryColor: "#d97706",
      accentColor: "#f59e0b",
      buttonStyle: "rounded-xl",
      borderRadius: "12px",
      headingFont: "Inter",
      bodyFont: "Inter",
      logoMain: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=400&q=80",
      logoFooter: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=400&q=80",
      favicon: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=100&q=80"
    });
  }

  public saveAppearanceSettings(data: AppearanceSettings): void {
    this.writeJSON("appearance_db.json", data);
  }

  public getStaticPages(): Record<string, StaticPage> {
    return this.readJSON<Record<string, StaticPage>>("pages_db.json", {
      about: {
        content: `<h3>Crafted for the Global Connoisseur</h3><p>Maison Sac was established in the heart of Paris with a singular, unyielding vision – to craft leather bag masterpieces that unify modern utility with structural elegance. Every briefcase, rucksack, clutch, and travel valise is designed from premium full-grain calfskins, hand-selected buckles, and heavy-duty double stitching. Experience the meticulous craftsmanship of Parisian bags.</p>`,
        seoTitle: "About Our Parisian Luxury Leather Bag House | Maison Sac",
        metaDescription: "Read the history, heritage, and uncompromising craftsmanship values behind Maison Sac, makers of high-end wallets, travel bags, and rucksacks."
      },
      privacy: {
        content: `<h3>Your Sacred Confidentiality</h3><p>At Maison Sac, your confidentiality remains a core pillar. We gather basic contact information to process purchases and send updates with customer consent. All transaction channels are fortified via secure network encryption. We do not sell or lease customer records under any circumstances.</p>`,
        seoTitle: "Privacy Policy & Encrypted Purchase Protection | Maison Sac",
        metaDescription: "Your details are fully protected. Review our modern client data protocols and payment encryption safety policies."
      },
      terms: {
        content: `<h3>Luxury Acquisition Standards</h3><p>Purchases placed through Maison Sac represent custom binding acquisitions. Orders are processed within 24 hours. Returns are accepted within 30 days for unblemished goods accompanied by validation receipts of origin. Customer support resides in our Paris atelier.</p>`,
        seoTitle: "Terms of Acquirement & Returns Regulations | Maison Sac",
        metaDescription: "Review the shipping terms, purchase contract specifications, and priority return rules governing Maison Sac orders."
      },
      faqs: {
        content: `<h3>Frequently Answered Questions</h3><p><strong>Q: Where are Maison Sac products designed?</strong><br>A: All conceptual architectures, design prototypes, and selection processes are executed at our signature studio in Paris, France.<br><br><strong>Q: What leather grades do you employ?</strong><br>A: We work exclusively with certified full-grain skins and water-resistant premium hardware.<br><br><strong>Q: What is the delivery timeframe for global shipping?</strong><br>A: Priority express shipping takes 3-5 business days across Europe, Asia-Pacific, and the Americas.</p>`,
        seoTitle: "Frequently Answered Inquiries & Product Guides | Maison Sac",
        metaDescription: "Find immediate answers on leather sourcing details, lifetime warranties, and free express international shipping times."
      }
    });
  }

  public saveStaticPages(data: Record<string, StaticPage>): void {
    this.writeJSON("pages_db.json", data);
  }

  public getAdminProfile(): AdminProfile {
    return this.readJSON<AdminProfile>("admin_profile_db.json", {
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      fullName: "Charles Laurent",
      email: "admin@maisonsac-luxury.com"
    });
  }

  public saveAdminProfile(data: AdminProfile): void {
    this.writeJSON("admin_profile_db.json", data);
  }

  public getMediaLibrary(): string[] {
    return this.readJSON<string[]>("media_library_db.json", [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1622560480654-d9c48c66a2b2?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1575032614061-39c87849201a?auto=format&fit=crop&w=600&q=80"
    ]);
  }

  public saveMediaLibrary(list: string[]): void {
    this.writeJSON("media_library_db.json", list);
  }

  // --- Dynamic New Business Tables (Users, Orders, Carts, Wishlists, Coupons) ---

  public getUsers(): User[] {
    return this.readJSON<User[]>("users_table.json", [
      {
        id: "usr-admin",
        role: "admin",
        fullName: "Charles Laurent",
        email: "admin@maisonsac-luxury.com",
        passwordHash: "admin123", // or hashed, we'll implement standard check
        status: "active",
        addresses: [],
        createdAt: "2026-05-10T12:00:00Z"
      },
      {
        id: "usr-admin-easy",
        role: "admin",
        fullName: "Charles Laurent (Quick)",
        email: "admin@bagzone.com",
        passwordHash: "admin123",
        status: "active",
        addresses: [],
        createdAt: "2026-05-10T12:00:00Z"
      },
      {
        id: "usr-admin-quick",
        role: "admin",
        fullName: "Administrator",
        email: "admin@admin.com",
        passwordHash: "admin123",
        status: "active",
        addresses: [],
        createdAt: "2026-05-10T12:00:00Z"
      },
      {
        id: "usr-customer-1",
        role: "customer",
        fullName: "Jean Dupont",
        email: "jean.dupont@vogue.fr",
        passwordHash: "pass123",
        status: "active",
        phoneNumber: "+33 6 12 34 56 78",
        createdAt: "2026-05-15T15:30:00Z",
        addresses: [
          {
            id: "addr-1",
            title: "Paris Flat",
            address: "15 Rue de Rivoli",
            city: "Paris",
            country: "France",
            zipCode: "75001",
            isDefault: true
          }
        ]
      }
    ]);
  }

  public saveUsers(list: User[]): void {
    this.writeJSON("users_table.json", list);
  }

  public getOrders(): Order[] {
    return this.readJSON<Order[]>("orders_table.json", [
      {
        id: "ord-10023",
        orderNumber: "MS-10023",
        customer: {
          fullName: "Jean Dupont",
          email: "jean.dupont@vogue.fr",
          phone: "+33 6 12 34 56 78"
        },
        products: [
          {
            product: {
              id: 1,
              name: "Red Leather Purse",
              sku: "RED-PURSE-001",
              category: "Purses",
              brand: "Atelier Laurent",
              price: 1200,
              discount: 15,
              rating: 4.8,
              stock: 12,
              material: "Full-grain calfskin",
              color: "Bourbon Red",
              isFeatured: true,
              isTopPick: true,
              isTopSelling: true,
              soldCount: 45,
              createdAt: "2026-05-01",
              images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"],
              description: "Artisanal red bag with solid double brass hooks",
              specifications: { Leather: "Full-Grain", Width: "32cm" },
              reviews: []
            },
            quantity: 1,
            selectedColor: "Bourbon Red"
          }
        ],
        shippingAddress: {
          address: "15 Rue de Rivoli",
          city: "Paris",
          country: "France",
          zipCode: "75001"
        },
        subtotal: 1200,
        discount: 180, // 15% discount
        shippingFee: 25,
        total: 1045,
        paymentMethod: "Stripe",
        paymentStatus: "Paid",
        orderStatus: "Delivered",
        trackingNumber: "FR-STR-847291",
        createdAt: "2026-05-18T14:22:00Z",
        updatedAt: "2026-05-20T11:45:00Z"
      },
      {
        id: "ord-10024",
        orderNumber: "MS-10024",
        customer: {
          fullName: "Gabrielle Royer",
          email: "gabrielle.royer@parisian.fr"
        },
        products: [
          {
            product: {
              id: 2,
              name: "Brown Luxury Tote",
              sku: "BRN-TOTE-002",
              category: "Bags",
              brand: "Atelier Laurent",
              price: 1500,
              discount: 0,
              rating: 4.9,
              stock: 8,
              material: "Vachetta Leather",
              color: "Chestnut Brown",
              isFeatured: true,
              isTopPick: false,
              isTopSelling: true,
              soldCount: 32,
              createdAt: "2026-05-03",
              images: ["https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80"],
              description: "Roomy luxury carryall with internal organizers",
              specifications: { Handle: "Double Vachetta", Height: "42cm" },
              reviews: []
            },
            quantity: 1,
            selectedColor: "Chestnut Brown"
          }
        ],
        shippingAddress: {
          address: "22 Boulevard Malesherbes",
          city: "Paris",
          country: "France",
          zipCode: "75008"
        },
        subtotal: 1500,
        discount: 0,
        shippingFee: 0,
        total: 1500,
        paymentMethod: "Cash On Delivery",
        paymentStatus: "Pending",
        orderStatus: "Processing",
        createdAt: "2026-06-01T09:12:00Z",
        updatedAt: "2026-06-01T10:30:00Z"
      }
    ]);
  }

  public saveOrders(list: Order[]): void {
    this.writeJSON("orders_table.json", list);
  }

  public getCarts(): CartDatabase[] {
    return this.readJSON<CartDatabase[]>("carts_table.json", []);
  }

  public saveCarts(list: CartDatabase[]): void {
    this.writeJSON("carts_table.json", list);
  }

  public getWishlists(): WishlistDatabase[] {
    return this.readJSON<WishlistDatabase[]>("wishlists_table.json", []);
  }

  public saveWishlists(list: WishlistDatabase[]): void {
    this.writeJSON("wishlists_table.json", list);
  }

  public getCoupons(): any[] {
    return this.readJSON<any[]>("coupons_table.json", [
      { code: "MAISONSAC15", type: "percentage", value: 15, usageLimit: 100, active: true, expiryDate: "2026-12-31" }
    ]);
  }

  public saveCoupons(list: any[]): void {
    this.writeJSON("coupons_table.json", list);
  }
}

export const db = new Database();
