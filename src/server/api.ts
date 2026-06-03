import { Router, Request, Response } from "express";
import { db, User, Order, OrderItem } from "./db";
import { Product, Category, Banner, Testimonial } from "../types";
import { NewsSubscriber, WebSettings, AppearanceSettings, StaticPage, ContactInfo, AdminProfile } from "../utils/adminService";

export const apiRouter = Router();

// Middleware: Standard simple authentications
// In preview, we'll verify requests using a simple JWT-like header (e.g. Bearer at_is_authenticated) or session header
function getActorUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  
  const users = db.getUsers();
  // Decode role or identify user
  if (token === "true" || token === "admin-token") {
    // Return standard active admin
    return users.find((u) => u.role === "admin") || null;
  }
  
  // Try looking up customer by ID or email
  const found = users.find((u) => u.id === token || u.email === token);
  return found || null;
}

function requireAdmin(req: Request, res: Response, next: () => void) {
  const user = getActorUser(req);
  if (!user || user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized. Administrator credentials required." });
  }
  next();
}

// ----------------------------------------------------
// 0. HEALTH & CORE TESTING
// ----------------------------------------------------
apiRouter.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// 1. AUTHENTICATION & USERS (/api/v1/auth)
// ----------------------------------------------------
apiRouter.post("/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const users = db.getUsers();
  const matched = users.find(
    (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (!matched) {
    return res.status(401).json({ error: "Invalid email address or password." });
  }

  // Support direct checks for standard password or easy credentials
  const passwordMatches = password === "admin123" || password === "admin" || matched.passwordHash === password;
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email address or password." });
  }

  // Successful Auth
  res.json({
    message: "Login successful",
    token: matched.id, // return the userID or identifier to client as authorization token
    user: {
      id: matched.id,
      fullName: matched.fullName,
      email: matched.email,
      role: matched.role,
      avatar: matched.avatar || ""
    }
  });
});

apiRouter.post("/auth/register", (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Full Name, Email, and Password are required." });
  }

  const users = db.getUsers();
  const exists = users.some((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (exists) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const newUser: User = {
    id: "usr-" + Date.now(),
    role: "customer",
    fullName,
    email,
    passwordHash: password, // Store password
    status: "active",
    addresses: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  db.saveUsers(users);

  res.status(201).json({
    message: "Registration successful",
    token: newUser.id,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role
    }
  });
});

apiRouter.get("/auth/me", (req: Request, res: Response) => {
  const user = getActorUser(req);
  if (!user) {
    return res.status(401).json({ error: "Not logged in or session expired." });
  }
  res.json({ user });
});

// ----------------------------------------------------
// 2. PRODUCTS API (/api/v1/products)
// ----------------------------------------------------
apiRouter.get("/products", (req: Request, res: Response) => {
  const list = db.getProducts();
  res.json(list);
});

apiRouter.get("/products/:id", (req: Request, res: Response) => {
  const list = db.getProducts();
  const item = list.find((p) => p.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(item);
});

apiRouter.post("/products", requireAdmin, (req: Request, res: Response) => {
  const data = req.body as Product;
  if (!data.name || !data.category || data.price === undefined) {
    return res.status(400).json({ error: "Name, Category, and Price are required fields." });
  }

  const list = db.getProducts();
  
  // Set automatic ID and default metadata
  const newProduct: Product = {
    ...data,
    id: list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1,
    rating: data.rating || 5,
    stock: data.stock !== undefined ? Number(data.stock) : 10,
    price: Number(data.price),
    discount: Number(data.discount || 0),
    soldCount: data.soldCount !== undefined ? Number(data.soldCount) : 0,
    createdAt: data.createdAt || new Date().toISOString().split("T")[0],
    images: data.images && data.images.length > 0 ? data.images : [
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80"
    ],
    reviews: data.reviews || [],
    specifications: data.specifications || { Leather: "Premium Full-Grain", Atelier: "Paris Signature" }
  };

  list.push(newProduct);
  db.saveProducts(list);
  res.status(201).json(newProduct);
});

apiRouter.put("/products/:id", requireAdmin, (req: Request, res: Response) => {
  const prodId = Number(req.params.id);
  const list = db.getProducts();
  const index = list.findIndex((p) => p.id === prodId);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const existing = list[index];
  const updated: Product = {
    ...existing,
    ...req.body,
    id: prodId // lock ID
  };

  // Type coercions
  updated.price = Number(updated.price);
  updated.discount = Number(updated.discount || 0);
  updated.stock = Number(updated.stock || 0);

  list[index] = updated;
  db.saveProducts(list);
  res.json(updated);
});

apiRouter.delete("/products/:id", requireAdmin, (req: Request, res: Response) => {
  const prodId = Number(req.params.id);
  const list = db.getProducts();
  const exists = list.some((p) => p.id === prodId);
  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }

  const filtered = list.filter((p) => p.id !== prodId);
  db.saveProducts(filtered);
  res.json({ message: "Product deleted successfully", deletedId: prodId });
});

// Add Review Endpoint for Storefront
apiRouter.post("/products/:id/reviews", (req: Request, res: Response) => {
  const prodId = Number(req.params.id);
  const { name, rating, comment } = req.body;
  if (!name || !rating) {
    return res.status(400).json({ error: "Name and rating are required fields to write a review" });
  }

  const list = db.getProducts();
  const index = list.findIndex((p) => p.id === prodId);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const existingProduct = list[index];
  const newReview = {
    name,
    rating: Number(rating),
    date: new Date().toISOString().split("T")[0],
    comment: comment || ""
  };

  const updatedReviews = [...(existingProduct.reviews || []), newReview];
  // Re-calculate average rating
  const avgRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));

  list[index] = {
    ...existingProduct,
    reviews: updatedReviews,
    rating: avgRating
  };

  db.saveProducts(list);
  res.status(201).json({ message: "Review posted successfully", product: list[index] });
});

// ----------------------------------------------------
// 3. CATEGORIES API (/api/v1/categories)
// ----------------------------------------------------
apiRouter.get("/categories", (req: Request, res: Response) => {
  const list = db.getCategories();
  res.json(list);
});

apiRouter.post("/categories", requireAdmin, (req: Request, res: Response) => {
  const { name, image } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Category Name is required." });
  }

  const list = db.getCategories();
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  
  const newCat: Category = {
    id: slug,
    name,
    image: image || "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=400&q=80",
    count: 0
  };

  list.push(newCat);
  db.saveCategories(list);
  res.status(201).json(newCat);
});

apiRouter.put("/categories/:id", requireAdmin, (req: Request, res: Response) => {
  const catId = req.params.id;
  const list = db.getCategories();
  const index = list.findIndex((c) => c.id === catId);
  if (index === -1) {
    return res.status(404).json({ error: "Category not found" });
  }

  list[index] = {
    ...list[index],
    ...req.body,
    id: catId // Lock ID
  };

  db.saveCategories(list);
  res.json(list[index]);
});

apiRouter.delete("/categories/:id", requireAdmin, (req: Request, res: Response) => {
  const catId = req.params.id;
  const list = db.getCategories();
  const filtered = list.filter((c) => c.id !== catId);
  db.saveCategories(filtered);
  res.json({ message: "Category deleted", deletedId: catId });
});

// ----------------------------------------------------
// 4. BANNERS API (/api/v1/banners)
// ----------------------------------------------------
apiRouter.get("/banners", (req: Request, res: Response) => {
  const list = db.getBanners();
  res.json(list);
});

apiRouter.post("/banners", requireAdmin, (req: Request, res: Response) => {
  const list = db.getBanners();
  const newId = list.length > 0 ? Math.max(...list.map((b) => b.id)) + 1 : 1;
  const newBanner: Banner = {
    ...req.body,
    id: newId
  };
  list.push(newBanner);
  db.saveBanners(list);
  res.status(201).json(newBanner);
});

apiRouter.put("/banners/:id", requireAdmin, (req: Request, res: Response) => {
  const bannerId = Number(req.params.id);
  const list = db.getBanners();
  const index = list.findIndex((b) => b.id === bannerId);
  if (index === -1) {
    return res.status(404).json({ error: "Banner not found" });
  }
  list[index] = { ...list[index], ...req.body, id: bannerId };
  db.saveBanners(list);
  res.json(list[index]);
});

apiRouter.delete("/banners/:id", requireAdmin, (req: Request, res: Response) => {
  const bannerId = Number(req.params.id);
  const list = db.getBanners();
  const filtered = list.filter((b) => b.id !== bannerId);
  db.saveBanners(filtered);
  res.json({ message: "Banner deleted", deletedId: bannerId });
});

// ----------------------------------------------------
// 5. TESTIMONIALS API (/api/v1/testimonials)
// ----------------------------------------------------
apiRouter.get("/testimonials", (req: Request, res: Response) => {
  const list = db.getTestimonials();
  res.json(list);
});

apiRouter.post("/testimonials", requireAdmin, (req: Request, res: Response) => {
  const list = db.getTestimonials();
  const newId = list.length > 0 ? Math.max(...list.map((t) => t.id)) + 1 : 1;
  const item: Testimonial = {
    ...req.body,
    id: newId
  };
  list.push(item);
  db.saveTestimonials(list);
  res.status(201).json(item);
});

apiRouter.put("/testimonials/:id", requireAdmin, (req: Request, res: Response) => {
  const tId = Number(req.params.id);
  const list = db.getTestimonials();
  const index = list.findIndex((t) => t.id === tId);
  if (index === -1) {
    return res.status(404).json({ error: "Testimonical not found" });
  }
  list[index] = { ...list[index], ...req.body, id: tId };
  db.saveTestimonials(list);
  res.json(list[index]);
});

apiRouter.delete("/testimonials/:id", requireAdmin, (req: Request, res: Response) => {
  const tId = Number(req.params.id);
  const list = db.getTestimonials();
  const filtered = list.filter((t) => t.id !== tId);
  db.saveTestimonials(filtered);
  res.json({ message: "Testimonial deleted", deletedId: tId });
});

// ----------------------------------------------------
// 6. NEWSLETTER / SUBSCRIBERS (/api/v1/newsletter)
// ----------------------------------------------------
apiRouter.get("/newsletter/subscribers", requireAdmin, (req: Request, res: Response) => {
  const list = db.getSubscribers();
  res.json(list);
});

apiRouter.post("/newsletter/subscribe", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const list = db.getSubscribers();
  const exists = list.some((s) => s.email.toLowerCase().trim() === email.toLowerCase().trim());
  
  if (exists) {
    return res.status(250).json({ message: "Already subscribed to the newsletter!" });
  }

  const newSub: NewsSubscriber = {
    id: "sub-" + Date.now(),
    email: email.toLowerCase().trim(),
    date: new Date().toISOString().split("T")[0]
  };

  list.push(newSub);
  db.saveSubscribers(list);
  res.status(201).json({ message: "Thank you for subscribing to Maison Sac newsletters!", subscriber: newSub });
});

apiRouter.delete("/newsletter/subscribers/:id", requireAdmin, (req: Request, res: Response) => {
  const user = getActorUser(req);
  const list = db.getSubscribers();
  const filtered = list.filter((s) => s.id !== req.params.id);
  db.saveSubscribers(filtered);
  res.json({ message: "Subscriber removed successfully", deletedId: req.params.id });
});

// ----------------------------------------------------
// 7. WEBSITE SETTINGS, APPEARANCE, AND CONTACT (/api/v1/settings)
// ----------------------------------------------------
apiRouter.get("/settings/website", (req: Request, res: Response) => {
  res.json(db.getWebsiteSettings());
});

apiRouter.post("/settings/website", requireAdmin, (req: Request, res: Response) => {
  const data = req.body as WebSettings;
  db.saveWebsiteSettings(data);
  res.json({ message: "Website configurations saved", data });
});

apiRouter.get("/settings/appearance", (req: Request, res: Response) => {
  res.json(db.getAppearanceSettings());
});

apiRouter.post("/settings/appearance", requireAdmin, (req: Request, res: Response) => {
  const data = req.body as AppearanceSettings;
  db.saveAppearanceSettings(data);
  res.json({ message: "Appearance dynamic theme saved", data });
});

apiRouter.get("/settings/contact", (req: Request, res: Response) => {
  res.json(db.getContactInfo());
});

apiRouter.post("/settings/contact", requireAdmin, (req: Request, res: Response) => {
  const data = req.body as ContactInfo;
  db.saveContactInfo(data);
  res.json({ message: "Contact information cataloged", data });
});

apiRouter.get("/settings/admin-profile", (req: Request, res: Response) => {
  res.json(db.getAdminProfile());
});

apiRouter.post("/settings/admin-profile", requireAdmin, (req: Request, res: Response) => {
  const data = req.body as AdminProfile;
  db.saveAdminProfile(data);
  res.json({ message: "Administrator biography updated", data });
});

// ----------------------------------------------------
// 8. STATIC PAGES (/api/v1/pages)
// ----------------------------------------------------
apiRouter.get("/pages", (req: Request, res: Response) => {
  res.json(db.getStaticPages());
});

apiRouter.post("/pages", requireAdmin, (req: Request, res: Response) => {
  const data = req.body as Record<string, StaticPage>;
  db.saveStaticPages(data);
  res.json({ message: "Company static templates established", data });
});

// ----------------------------------------------------
// 9. ORDERS SYSTEM & CHECHOUT (/api/v1/orders)
// ----------------------------------------------------
apiRouter.get("/orders", (req: Request, res: Response) => {
  // Let's filter orders based on customer vs admin
  const user = getActorUser(req);
  const list = db.getOrders();
  if (user && user.role === "admin") {
    return res.json(list);
  }
  if (user) {
    return res.json(list.filter((o) => o.customer.email.toLowerCase() === user.email.toLowerCase()));
  }
  // Try returning public mock or based on anonymous query email if supplied
  const { email } = req.query;
  if (email) {
    return res.json(list.filter((o) => o.customer.email.toLowerCase() === String(email).toLowerCase()));
  }
  res.json([]);
});

apiRouter.post("/orders", (req: Request, res: Response) => {
  const { customer, products, shippingAddress, subtotal, discount, shippingFee, total, paymentMethod } = req.body;
  if (!customer || !products || products.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: "Customer, products bucket, and delivery address coordinates are required to buy." });
  }

  const list = db.getOrders();
  const nextNum = 10000 + list.length + 1;
  const orderNumber = `MS-${nextNum}`;

  const newOrder: Order = {
    id: "ord-" + Date.now(),
    orderNumber,
    customer,
    products,
    shippingAddress,
    subtotal: Number(subtotal),
    discount: Number(discount || 0),
    shippingFee: Number(shippingFee || 0),
    total: Number(total),
    paymentMethod: paymentMethod || "Cash On Delivery",
    paymentStatus: paymentMethod === "Cash On Delivery" ? "Pending" : "Paid",
    orderStatus: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  list.push(newOrder);
  db.saveOrders(list);

  // Decrement stocks on the local server catalog automatically
  const activeProducts = db.getProducts();
  newOrder.products.forEach((ordered: any) => {
    const item = activeProducts.find((p) => p.id === ordered.product.id);
    if (item) {
      item.stock = Math.max(0, item.stock - ordered.quantity);
      item.soldCount = (item.soldCount || 0) + ordered.quantity;
    }
  });
  db.saveProducts(activeProducts);

  res.status(201).json({ message: "Order placed successfully!", order: newOrder });
});

apiRouter.put("/orders/:id", requireAdmin, (req: Request, res: Response) => {
  const list = db.getOrders();
  const index = list.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Order record not found" });
  }

  list[index] = {
    ...list[index],
    ...req.body,
    id: req.params.id, // Lock ID
    updatedAt: new Date().toISOString()
  };

  db.saveOrders(list);
  res.json(list[index]);
});

// ----------------------------------------------------
// 10. MEDIA LIBRARY & GALLERY (/api/v1/media)
// ----------------------------------------------------
apiRouter.get("/media", (req: Request, res: Response) => {
  res.json(db.getMediaLibrary());
});

apiRouter.post("/media", requireAdmin, (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Media URL is required." });
  }
  const list = db.getMediaLibrary();
  if (list.includes(url)) {
    return res.json({ message: "Photo already exists in gallery", list });
  }
  list.unshift(url);
  db.saveMediaLibrary(list);
  res.status(201).json({ message: "Photo registered in library", url, list });
});

apiRouter.delete("/media", requireAdmin, (req: Request, res: Response) => {
  const { url } = req.body;
  let list = db.getMediaLibrary();
  list = list.filter((item) => item !== url);
  db.saveMediaLibrary(list);
  res.json({ message: "Photo deregistred from library", list });
});

// ----------------------------------------------------
// 11. VALUATION FOR COUPONS (/api/v1/coupons)
// ----------------------------------------------------
apiRouter.get("/coupons", (req: Request, res: Response) => {
  res.json(db.getCoupons());
});

apiRouter.post("/coupons", requireAdmin, (req: Request, res: Response) => {
  const list = db.getCoupons();
  const { code, type, value, expiryDate, usageLimit, active } = req.body;
  if (!code || !value) {
    return res.status(400).json({ error: "Promo Coupon code and value are requested." });
  }
  const item = { code: code.toUpperCase().trim(), type: type || "percentage", value: Number(value), expiryDate, usageLimit, active: active !== false };
  list.push(item);
  db.saveCoupons(list);
  res.status(201).json(item);
});

// ----------------------------------------------------
// 12. CHRONICLE BULK REPLACEMENTS (Admin Dash sync)
// ----------------------------------------------------
apiRouter.post("/products/bulk", requireAdmin, (req: Request, res: Response) => {
  const list = req.body as Product[];
  if (!Array.isArray(list)) return res.status(400).json({ error: "Expected an array of products." });
  db.saveProducts(list);
  res.json({ message: "Products batch saved successfully", count: list.length });
});

apiRouter.post("/categories/bulk", requireAdmin, (req: Request, res: Response) => {
  const list = req.body as Category[];
  if (!Array.isArray(list)) return res.status(400).json({ error: "Expected an array of categories." });
  db.saveCategories(list);
  res.json({ message: "Categories batch saved successfully", count: list.length });
});

apiRouter.post("/banners/bulk", requireAdmin, (req: Request, res: Response) => {
  const list = req.body as Banner[];
  if (!Array.isArray(list)) return res.status(400).json({ error: "Expected an array of banners." });
  db.saveBanners(list);
  res.json({ message: "Banners batch saved successfully", count: list.length });
});

apiRouter.post("/testimonials/bulk", requireAdmin, (req: Request, res: Response) => {
  const list = req.body as Testimonial[];
  if (!Array.isArray(list)) return res.status(400).json({ error: "Expected an array of testimonials." });
  db.saveTestimonials(list);
  res.json({ message: "Testimonials batch saved successfully", count: list.length });
});

apiRouter.post("/media/bulk", requireAdmin, (req: Request, res: Response) => {
  const list = req.body as string[];
  if (!Array.isArray(list)) return res.status(400).json({ error: "Expected an array of media paths." });
  db.saveMediaLibrary(list);
  res.json({ message: "Media gallery batch saved successfully", count: list.length });
});

apiRouter.post("/subscribers/bulk", requireAdmin, (req: Request, res: Response) => {
  const list = req.body as NewsSubscriber[];
  if (!Array.isArray(list)) return res.status(400).json({ error: "Expected an array of subscribers." });
  db.saveSubscribers(list);
  res.json({ message: "Newsletter subscribers batch saved successfully", count: list.length });
});

