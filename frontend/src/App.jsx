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

// Components
import Navbar from "./components/Navbar";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";

// Heritage Stories
import OurStories from "./pages/OurStories";
import StoryDetails from "./pages/StoryDetails";

// Protected Customer Pages
import Account from "./pages/Account";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";

// Staff & Admin Pages
import ManagementDashboard from "./pages/ManagementDashboard";

// ==========================================
// STOREFRONT LAYOUT
// ==========================================

function StorefrontLayout({ children }) {
  const location = useLocation();

  const isHome = ["/", "/login", "/register"].includes(
    location.pathname
  );

  return (
    <div className="min-h-screen bg-urumaya-forest">
      <Navbar />

      <div
        className={
          isHome || location.pathname === "/stories"
            ? ""
            : "pt-[96px]"
        }
      >
        {children || <Outlet />}
      </div>
    </div>
  );
}

// ==========================================
// AUTHENTICATION BACKGROUND LAYOUT
// ==========================================

function AuthBackgroundLayout() {
  return (
    <>
      {/* Actual homepage behind authentication popup */}
      <div inert aria-hidden="true">
        <StorefrontLayout>
          <Home />
        </StorefrontLayout>
      </div>

      {/* Login or Registration popup */}
      <Outlet />
    </>
  );
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
// PROTECTED CUSTOMER ROUTES
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

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (!["staff", "admin"].includes(user?.role)) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
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
              AUTHENTICATION POPUPS
          ================================== */}

          <Route element={<AuthBackgroundLayout />}>

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

          </Route>

          {/* ==================================
              PUBLIC STOREFRONT
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

            {/* Heritage Stories */}
            <Route
              path="/stories"
              element={<OurStories />}
            />

            {/* Individual Heritage Story */}
            <Route
              path="/stories/:slug"
              element={<StoryDetails />}
            />

            {/* ==================================
                PROTECTED CUSTOMER PAGES
            ================================== */}

            <Route element={<ProtectedRoute />}>

              {/* Customer Account */}
              <Route
                path="/account"
                element={<Account />}
              />

              {/* Order History */}
              <Route
                path="/account/orders"
                element={<MyOrders />}
              />

              {/* Order Details */}
              <Route
                path="/account/orders/:id"
                element={<OrderDetails />}
              />

              {/* Checkout */}
              <Route
                path="/checkout"
                element={<Checkout />}
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