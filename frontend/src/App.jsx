
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import ManagementDashboard from "./pages/ManagementDashboard";

// ==========================================
// STOREFRONT LAYOUT
// ==========================================

function StorefrontLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-urumaya-forest">
      <Navbar />

      {/*
        Homepage:
        No extra padding because Home.jsx handles
        the hero image position below the Navbar.

        Other pages:
        Add top padding so the fixed Navbar
        doesn't overlap page content.
      */}
      <div className={isHome ? "" : "pt-[96px]"}>
        <Outlet />
      </div>
    </div>
  );
}

// ==========================================
// PROTECTED ROUTES
// ==========================================

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}

// ==========================================
// STAFF & ADMIN PROTECTED ROUTES
// ==========================================

function StaffAdminRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect visitors who are not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Only staff and admin can access management
  if (!["staff", "admin"].includes(user?.role)) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}

// ==========================================
// LOADING SCREEN
// ==========================================

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-urumaya-forest">
      <div className="text-center">
        <p className="font-display text-4xl tracking-[0.15em] text-urumaya-ivory">
          URUMAYA
        </p>

        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-urumaya-gold">
          Rooted in Heritage
        </p>
      </div>
    </div>
  );
}

// ==========================================
// TEMPORARY PLACEHOLDER PAGES
// ==========================================

function Placeholder({ title }) {
  return (
    <main className="flex min-h-[75vh] flex-col items-center justify-center bg-urumaya-ivory px-6 py-20 text-center text-urumaya-ink">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-urumaya-terracotta">
        The URUMAYA Experience
      </p>

      <h1 className="mt-5 font-display text-5xl sm:text-6xl">
        {title}
      </h1>

      <p className="mt-5 max-w-md text-sm leading-7 text-urumaya-ink/65">
        Something meaningful is taking shape.
        Our curated collection will be available soon.
      </p>

      <NavigateHome />
    </main>
  );
}

// ==========================================
// RETURN HOME LINK
// ==========================================

function NavigateHome() {
  return (
    <a
      href="/"
      className="mt-9 inline-flex items-center gap-3 rounded-full bg-urumaya-terracotta px-7 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#CC7050]"
    >
      Back to Home
      <span aria-hidden="true">→</span>
    </a>
  );
}

// ==========================================
// APPLICATION ROUTES
// ==========================================

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>

          {/* ==================================
              CUSTOMER STOREFRONT
          ================================== */}

          <Route element={<StorefrontLayout />}>

            {/* Homepage */}
            <Route
              path="/"
              element={<Home />}
            />

            {/* Shop */}
            <Route
              path="/shop"
              element={<Shop />}
            />

            {/* Product Details */}
            <Route
              path="/shop/:slug"
              element={<ProductDetails />}
            />

            {/* Shopping Cart */}
            <Route
              path="/cart"
              element={<Cart />}
            />

            {/* Login */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Register */}
            <Route
              path="/register"
              element={<Register />}
            />

            {/* Protected Customer Account */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/account"
                element={<Account />}
              />
            </Route>

          </Route>

          {/* ==================================
              STAFF & ADMIN MANAGEMENT
          ================================== */}

          <Route element={<StaffAdminRoute />}>
            <Route
              path="/management"
              element={<ManagementDashboard />}
            />
          </Route>

          {/* ==================================
              UNKNOWN ROUTES
          ================================== */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
