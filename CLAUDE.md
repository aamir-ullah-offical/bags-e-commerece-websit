# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project: MAISON SAC — Luxury Bags E-Commerce

Full-stack MERN monorepo. Two independent apps under separate directories:

| Directory | Stack | Port |
|-----------|-------|------|
| `frontend/` | React 19 + Vite 6 + Tailwind CSS 4 | 5173 |
| `backend/` | Express 4 + Mongoose 8 + MongoDB | 5000 |

Both use ES Modules (`"type": "module"`). No TypeScript — the project was converted to plain `.jsx`/`.js`.

---

## Commands

### Backend
```bash
cd backend
npm run dev        # node --watch server.js (hot-reload, development)
npm start          # node server.js (production)
npm run seed       # wipe DB and insert demo data (see Seed Credentials below)
```

### Frontend
```bash
cd frontend
npm run dev        # Vite dev server on :5173 (proxies /api → :5000)
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
```

There are no test scripts or linters configured.

### Seed Credentials
After `npm run seed` in `backend/`:
- Admin: `admin@maisonsac.com` / `Admin@123`
- Customer: `jane@example.com` / `Customer@123`

---

## Environment Setup

**`backend/.env`** — already pre-configured in the repo (gitignored locally, set as env vars on hosting platforms):
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/bags_ecommerce_db?retryWrites=true&w=majority
JWT_SECRET=<64-char random hex — generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173          # production: your Vercel frontend URL
# ADDITIONAL_ORIGINS=https://your-site.vercel.app
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

**`frontend/.env`**:
```
VITE_API_URL=http://localhost:5000/api/v1   # production: your deployed backend URL
```

The Vite dev server already proxies `/api` → `http://localhost:5000`, so `VITE_API_URL` is only needed when the frontend is served separately (e.g., after `vite build`). On Vercel set it in the dashboard — it gets baked into the build bundle.

---

## Architecture

### Backend (`backend/`)

`server.js` is the entry point. Startup order:
1. Helmet + CORS + body-parser + compression
2. Morgan logging (`combined` in prod, `dev` otherwise)
3. Rate limiters (general 300 req/15 min; auth endpoints 20 req/15 min; upload 50 req/15 min)
4. Route mount at `/api/v1/*` — all uploads go directly to Cloudinary (no local static `/uploads`)
5. 404 → global error handler

**Layered structure — always follow this for new features:**
```
routes/       → Express Router, wires middleware + controller
middleware/   → auth.js (protect, requireAdmin, optionalAuth)
              → validate.js (express-validator rule sets)
              → errorHandler.js (notFound + global handler)
              → upload.js (Multer config)
controllers/  → Business logic, calls models, uses R.* helpers
models/       → Mongoose schemas with hooks and indexes
utils/        → apiResponse.js (R.success / R.created / R.paginated / R.error)
              → generateToken.js
              → seed.js
constants/    → ORDER_STATUSES, ROLES, PAYMENT_METHODS, SETTING_GROUPS
config/       → db.js (MongoDB connection with reconnect listeners)
```

**API response format** — always use `utils/apiResponse.js`:
```js
R.success(res, { key: value }, "Message")          // 200
R.created(res, { key: value }, "Message")          // 201
R.paginated(res, data, total, page, limit)         // 200 + pagination object
R.error(res, "Message", statusCode)                // 4xx/5xx
```

**Auth middleware chain**: `protect` → `requireAdmin` (for admin-only). Use `optionalAuth` on public routes that behave differently when a user is logged in (e.g., `GET /products` shows all products to admin, active-only to guests).

**Validation**: All auth routes use `middleware/validate.js` rule sets. New routes that accept user input must import and apply the appropriate validator before the controller.

**Pricing invariant**: Cart items store the *discounted* price (`price * (1 - discount/100)`) at add-time. `orderController.placeOrder` re-fetches current product prices and validates stock before creating an order — never trust the stored cart price for order totals.

**Order numbers**: `MDS-XXXXXX` generated in an `Order` pre-save hook with a 10-retry collision loop + timestamp fallback.

---

### Frontend (`frontend/src/`)

**Entry**: `main.jsx` → `App.jsx` → `AppRoutes.jsx`

**Provider nesting order in `App.jsx`** (outermost first):
```
ToastProvider → AuthProvider → SettingsProvider → CartProvider → WishlistProvider → ThemeProvider → AppRoutes
```
Contexts that depend on auth (`Cart`, `Wishlist`) must sit *inside* `AuthProvider`.

**Routing** (`routes/AppRoutes.jsx`): React Router v7, all pages lazy-loaded. Route groups:
- Public: `/`, `/shop`, `/product/:id`, `/about`, `/contact`
- Auth pages (no layout): `/login`, `/register`
- Protected (customer + admin): `/cart`, `/checkout`, `/wishlist`, `/orders`, `/orders/:id`, `/account`
- Admin only: `/admin/*` → `AdminDashboard`

`ProtectedRoute` checks `isAuthenticated` + `allowedRoles`. While `isLoading` it shows a spinner.

**HTTP client** (`services/api.js`): Axios instance with base URL `VITE_API_URL`. Request interceptor attaches `Bearer` token from `localStorage`. Response interceptor on 401: clears auth keys, redirects to `/login?returnTo=<current-path>` (skipped if already on `/login` or `/register`).

**Service layer** (`services/`): All API calls go through typed service modules:
- `authService` — login/register/profile/password; also manages `msac_token` + `msac_user` in localStorage
- `productService` — wraps all product endpoints; has `tryApi(apiFn, fallback)` so local JSON files under `src/data/` are used when the backend is offline
- `cartService`, `wishlistService`, `orderService`, `reviewService`, `newsletterService`, `adminService`

**Contexts and their storage keys**:
| Context | localStorage key pattern | Auth-gated |
|---------|--------------------------|------------|
| Auth | `msac_token`, `msac_user` | — |
| Cart | `msac_cart_<userId>` | Yes |
| Wishlist | `msac_wishlist_<userId>` | Yes |
| Theme | `msac_theme` | No |

Cart and Wishlist use per-user scoped keys to prevent data leakage between accounts. On logout, `authService.logout()` removes both scoped keys.

**Admin dashboard** (`pages/AdminDashboard.jsx` + `dashboard/components/`): Single-page admin panel with tab-based navigation. All admin API calls go through `services/adminService.js`.

**Toast system**: `useToast()` from `ToastContext` — call `showToast(message, type)` where type is `"success" | "bag" | "heart" | "info"`. Auto-dismisses after 3.5 s.

**ThemeContext**: Functional toggle — applies/removes `dark` class on `<html>`, persists to `msac_theme`, respects `prefers-color-scheme` on first load. Exposes `theme`, `isDark`, `toggleTheme`, `setTheme`.

**Offline resilience**: `productService` wraps every public read in `tryApi(apiFn, fallback)` which catches errors and returns local JSON from `src/data/`. Only public product/category/banner/testimonial reads have fallbacks.

---

## Key Patterns

**Adding a new backend resource** (e.g., `Coupon`):
1. `models/Coupon.js` — Mongoose schema
2. `controllers/couponController.js` — use `R.*` helpers, `express-async-errors` makes async throws auto-handled
3. `routes/couponRoutes.js` — apply `protect` + `requireAdmin` + validators as needed
4. Register in `server.js`: `app.use("/api/v1/coupons", couponRoutes)`

**Adding a new frontend page**:
1. Create `src/pages/MyPage.jsx`
2. Add `lazy(() => import("../pages/MyPage"))` in `AppRoutes.jsx`
3. Add `<Route>` inside the appropriate group (public/protected/admin)
4. Add a service method in the relevant `services/*.js` file if it makes API calls

**`@` path alias**: `import Foo from "@/components/Foo"` resolves to `src/components/Foo` (configured in `vite.config.js`).
