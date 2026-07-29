import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ErrorBoundary";
import PageLoader from "../components/ui/PageLoader";
import RouteProgressBar from "../components/ui/RouteProgressBar";
import { useAuth } from "../context/AuthContext";

const Home = lazy(() => import("../pages/Home"));
const Shop = lazy(() => import("../pages/Shop"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Orders = lazy(() => import("../pages/Orders"));
const OrderDetails = lazy(() => import("../pages/OrderDetails"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const TrackOrder = lazy(() => import("../pages/TrackOrder"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Redirects authenticated users away from login/register pages
function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/"} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <RouteProgressBar />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="track-order" element={<TrackOrder />} />

              <Route
                path="cart"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="checkout"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="wishlist"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account"
                element={
                  <ProtectedRoute allowedRoles={["customer", "admin"]}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>

            <Route
              path="login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />

            <Route path="admin/login" element={<Navigate to="/login" replace />} />

            <Route
              path="admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ErrorBoundary context="dashboard">
                    <AdminDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
