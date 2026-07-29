# MAISON SAC — Luxury Bags E-Commerce Platform

A full-stack MERN e-commerce platform for premium leather bags and accessories, built for the Pakistani market. Features a React 19 storefront, Express REST API, MongoDB persistence, and full admin dashboard — all deployable to Vercel + MongoDB Atlas.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS 4, Motion (Framer) |
| Backend | Node.js 20, Express 4, Mongoose 8 |
| Database | MongoDB (local dev) / MongoDB Atlas (production) |
| Auth | JWT (HTTP header `Bearer` token) |
| Images | Cloudinary (upload + CDN) |
| Deployment | Vercel (frontend SPA + backend serverless) |

Both apps use ES Modules (`"type": "module"`). No TypeScript — plain `.jsx` / `.js` throughout.

---

## Project Structure

```
bags-e-commerece-websit/
├── frontend/          # React 19 + Vite SPA
│   ├── src/
│   │   ├── pages/         # Route-level page components
│   │   ├── components/    # Shared UI components
│   │   ├── context/       # React contexts (Auth, Cart, Wishlist, Theme, Settings, Toast)
│   │   ├── services/      # API service modules (axios)
│   │   ├── utils/         # currency.js, helpers
│   │   ├── routes/        # AppRoutes.jsx (React Router v7)
│   │   ├── hooks/         # useDebounce, etc.
│   │   └── data/          # Fallback JSON (products, categories, banners, testimonials)
│   ├── vercel.json        # Vercel SPA rewrite config
│   └── vite.config.js     # @ alias, /api proxy → :5000
│
└── backend/           # Express REST API
    ├── config/            # db.js (MongoDB connection)
    ├── controllers/       # Business logic per resource
    ├── middleware/        # auth.js, validate.js, errorHandler.js, upload.js
    ├── models/            # Mongoose schemas
    ├── routes/            # Express routers
    ├── utils/             # apiResponse.js (R.*), generateToken.js, seed.js
    ├── constants/         # ORDER_STATUSES, ROLES, PAYMENT_METHODS
    ├── server.js          # Entry point
    └── vercel.json        # Vercel serverless config
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB running locally (`mongod`)

### 1. Backend

```bash
cd backend
# Create backend/.env — see Environment Variables section below for all keys
npm install
npm run seed                 # populate demo data (wipes Atlas DB first)
npm run dev                  # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                  # starts on http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas (production) or local MongoDB (dev)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/bags_ecommerce_db?retryWrites=true&w=majority&appName=Cluster0

# Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=<96-char hex secret>
JWT_EXPIRE=7d

# CORS — add your production frontend URL here
FRONTEND_URL=http://localhost:5173
# ADDITIONAL_ORIGINS=https://your-frontend.vercel.app

# Cloudinary — image CDN
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `frontend/.env`

```env
# Only needed for standalone builds (vite preview / production):
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Seed Credentials

After `npm run seed` in `backend/`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@maisonsac.com` | `Admin@123` |
| Customer | `jane@example.com` | `Customer@123` |

> **Warning:** The seed script wipes the entire database before inserting demo data. It is blocked in `NODE_ENV=production`.

---

## Key Features

### Storefront
- Product catalogue with advanced client-side filtering (category, price range, color, material, rating, discount/stock toggles)
- Product detail pages with image gallery, color selection, quantity picker, and related products
- Persistent per-user Shopping Cart and Wishlist (localStorage-backed + server-synced)
- Coupon/promo code validation at Cart and Checkout
- Multi-step Checkout: address → payment → review, with saved address book support
- Order history, per-order detail view, and order tracking timeline
- Contact form and Newsletter subscription

### Auth
- Register / Login / Logout with JWT
- Forgot Password → email link → Reset Password flow
- Per-user localStorage keys (`msac_cart_<userId>`, `msac_wishlist_<userId>`) prevent data leakage between accounts
- `ProtectedRoute` with `returnTo` query param so users land back on their intended page after login

### Admin Dashboard (`/admin`)
- Products: create, edit, delete, image upload (Cloudinary)
- Categories and Brands management
- Orders: list, status updates, tracking entries
- Coupons: create/edit with type (flat / percent), expiry, usage limits
- Banners and Testimonials
- Settings: store name, announcement bar, appearance (colors, border radius), contact details
- Analytics charts (revenue, orders, top products)
- Newsletter subscribers list

### Localisation
- All prices in Pakistani Rupees (Rs.)
- 17% GST tax calculation
- Free shipping above Rs. 20,000
- Payment methods: Cash On Delivery, JazzCash, EasyPaisa, Card, Bank Transfer
- Pakistani phone number format hints and validation

---

## API Reference

All endpoints are under `/api/v1/`. Authentication via `Authorization: Bearer <token>` header.

| Resource | Base path | Auth |
|---|---|---|
| Auth | `/auth` | public / protected |
| Products | `/products` | public (read), admin (write) |
| Categories | `/categories` | public (read), admin (write) |
| Brands | `/brands` | public (read), admin (write) |
| Cart | `/cart` | protected |
| Wishlist | `/wishlist` | protected |
| Orders | `/orders` | protected (own), admin (all) |
| Reviews | `/reviews` | protected (write), public (read) |
| Coupons | `/coupons` | protected (validate), admin (CRUD) |
| Banners | `/banners` | public (read), admin (write) |
| Testimonials | `/testimonials` | public (read), admin (write) |
| Settings | `/settings` | public (read), admin (write) |
| Newsletter | `/newsletter` | public |
| Contact | `/contact` | public |
| Upload | `/upload` | admin |
| Admin stats | `/admin` | admin |

### Standard response shape

```json
{ "success": true, "message": "…", "data": { … } }
{ "success": false, "message": "Error description" }
```

Paginated responses include:
```json
{ "success": true, "data": […], "pagination": { "total": 120, "page": 2, "limit": 12, "pages": 10 } }
```

---

## Architecture Notes

### Context provider order (`App.jsx`)

```
ToastProvider
  AuthProvider
    SettingsProvider
      CartProvider        ← depends on auth (per-user key)
        WishlistProvider  ← depends on auth (per-user key)
          ThemeProvider
            AppRoutes
```

Contexts that read `user.id` for scoped localStorage keys must sit **inside** `AuthProvider`.

### Offline resilience

`productService` wraps every public read in `tryApi(apiFn, fallback)`. If the backend is unreachable, it falls back to local JSON files under `src/data/`. Only public product, category, banner, and testimonial reads have fallbacks — protected routes always require the API.

### Pricing invariant

Cart items store the **discounted price** at add-time. `orderController.placeOrder` re-fetches current product prices and validates stock before creating an order — the stored cart price is never trusted for order totals.

### Order numbers

Format `MDS-XXXXXX` — generated in an `Order` pre-save hook with a 10-retry collision loop and a timestamp fallback.

---

## Deployment

### Frontend → Vercel

1. Connect the `frontend/` directory to a Vercel project.
2. Framework preset: **Vite**.
3. Set environment variable: `VITE_API_URL=https://your-backend.vercel.app/api/v1`
4. `frontend/vercel.json` handles SPA rewrites automatically.

### Backend → Vercel (serverless)

1. Connect the `backend/` directory to a separate Vercel project.
2. Set all environment variables (MongoDB Atlas URI, JWT secret, Cloudinary, `FRONTEND_URL`).
3. `backend/vercel.json` routes all traffic to `server.js` via `@vercel/node`.
4. MongoDB Atlas: whitelist `0.0.0.0/0` (Vercel serverless IPs are dynamic).

### Alternative backend hosts (Railway / Render)

Both work without the `vercel.json`. The `app.set("trust proxy", 1)` in `server.js` is already in place for reverse-proxy environments.

---

## Development Commands

```bash
# Backend
cd backend
npm run dev       # node --watch server.js (hot reload)
npm start         # node server.js (production)
npm run seed      # wipe DB and insert demo data

# Frontend
cd frontend
npm run dev       # Vite dev server :5173
npm run build     # production build → dist/
npm run preview   # serve dist/ locally
```

No test runner or linter is configured. The build step (`npm run build`) in CI acts as the primary correctness gate.
