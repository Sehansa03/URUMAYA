import { useEffect, useRef, useState } from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  UserRound,
  ShoppingBag,
  ChevronDown,
  LogOut,
  Package,
  LayoutDashboard,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import UrumayaLogo from "./UrumayaLogo";
import SignOutModal from "./SignOutModal";

const navigation = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Our Stories", path: "/stories" },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cartCount } = useCart();

  const location = useLocation();
  const navigate = useNavigate();

  const accountRef = useRef(null);
  const accountButtonRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const isManagementUser = ["admin", "staff"].includes(
    user?.role
  );

  const accountPath = isManagementUser
    ? "/management"
    : "/account";

  const hasHero = ["/", "/shop", "/stories"].includes(
    location.pathname
  );

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 35);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close menus when navigating
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    setLogoutError("");
  }, [location.pathname, location.search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);

        if (accountOpen) {
          setAccountOpen(false);
          accountButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [accountOpen]);

  // Sign out
  const handleLogout = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setLogoutError("");

    try {
      await logout();

      setAccountOpen(false);
      setMenuOpen(false);

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);

      setLogoutError(
        "Unable to sign out. Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  };

  // Desktop navigation
  const navClass = ({ isActive }) =>
    `relative inline-flex items-center whitespace-nowrap
     py-3 text-[14px] font-medium
     tracking-[0.01em]
     transition-colors duration-300
     !rounded-none !border-0 !bg-transparent !shadow-none
     after:absolute after:bottom-1 after:left-1/2
     after:h-[2px] after:-translate-x-1/2
     after:rounded-full after:bg-[#A47A28]
     after:transition-all after:duration-300
     ${
       isActive
         ? "text-[#79551E] after:w-full"
         : "text-[#29251F] after:w-0 hover:text-[#A47A28] hover:after:w-full"
     }`;

  // Outer champagne glass background
  const glassStyle =
    hasHero && !scrolled
      ? "border-white/80 bg-[#FFF5E3]/65 backdrop-blur-xl shadow-[0_8px_30px_rgba(94,69,35,0.10)]"
      : "border-white/90 bg-[#F9EFDD]/95 backdrop-blur-2xl shadow-[0_8px_30px_rgba(94,69,35,0.12)]";

  const iconButton =
    "relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#29251F] transition-all duration-300 hover:bg-[#A47A28]/10 hover:text-[#A47A28]";

  const dropdownLink =
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#29251F] transition-colors hover:bg-[#21483D]/5";

  const signupStyle =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#B65330] px-5 py-3 text-xs font-semibold text-[#FFF9EF] shadow-[0_4px_12px_rgba(182,83,48,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A44327]";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-10">

      {/* MAIN GLASS NAVBAR */}

      <div
        className={`relative mx-auto max-w-[1440px] rounded-full border transition-all duration-500 ${glassStyle}`}
      >
        <div className="relative flex h-[64px] items-center justify-between gap-3 px-3 sm:h-[68px] sm:px-7 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-9">

          {/* BRAND LOGO */}

          <div className="min-w-0 shrink justify-self-start">
            <UrumayaLogo light />
          </div>

          {/* DESKTOP NAVIGATION */}
          {/* No inner glass container */}

          <div
            role="navigation"
            aria-label="Main navigation"
            className="hidden items-center justify-center gap-9 !rounded-none !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none lg:flex xl:gap-12"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={navClass}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* RIGHT SIDE ACTIONS */}

          <div className="flex shrink-0 items-center justify-self-end gap-1 sm:gap-4">

            {/* AUTHENTICATION LOADING */}

            {loading ? (
              <div
                aria-label="Loading account"
                className="hidden h-9 w-20 animate-pulse rounded-full bg-[#A47A28]/15 lg:block"
              />
            ) : user ? (

              /* SIGNED-IN ACCOUNT */

              <div
                ref={accountRef}
                className="relative hidden lg:block"
              >
                <button
                  ref={accountButtonRef}
                  type="button"
                  aria-label="My account"
                  aria-expanded={accountOpen}
                  aria-controls="account-dropdown"
                  onClick={() =>
                    setAccountOpen((previous) => !previous)
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-[#A47A28]/30 bg-white/20 px-3 py-2.5 text-[#21483D] transition-all hover:border-[#A47A28] hover:bg-white/50"
                >
                  <UserRound
                    size={19}
                    strokeWidth={1.7}
                  />

                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* ACCOUNT DROPDOWN */}

                {accountOpen && (
                  <div
                    id="account-dropdown"
                    className="absolute right-0 top-[calc(100%+18px)] w-[280px] overflow-hidden rounded-[24px] border border-white/90 bg-[#FCF5E9]/95 p-2 shadow-[0_15px_45px_rgba(77,57,29,0.18)] backdrop-blur-2xl"
                  >

                    {/* USER INFORMATION */}

                    <div className="mb-2 flex items-center gap-3 border-b border-[#A47A28]/20 px-3 py-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#21483D] text-[#E6C77E]">
                        <UserRound size={21} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#21483D]">
                          {user.fullName || "My Account"}
                        </p>

                        <p className="mt-1 truncate text-xs text-[#625A4D]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* ACCOUNT LINK */}

                    <Link
                      to={accountPath}
                      onClick={() => setAccountOpen(false)}
                      className={dropdownLink}
                    >
                      {isManagementUser ? (
                        <LayoutDashboard size={17} />
                      ) : (
                        <UserRound size={17} />
                      )}

                      {isManagementUser
                        ? "Management Dashboard"
                        : "My Account"}
                    </Link>

                    {/* CUSTOMER ORDERS */}

                    {!isManagementUser && (
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountOpen(false)}
                        className={dropdownLink}
                      >
                        <Package size={17} />
                        My Orders
                      </Link>
                    )}

                    <div className="my-2 border-t border-[#A47A28]/20" />

                    {/* SIGN OUT */}

                    <button
                      type="button"
                      disabled={signingOut}
                      onClick={() => setShowSignOutModal(true)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#B65330] transition-colors hover:bg-[#B65330]/10 disabled:opacity-50"
                    >
                      <LogOut size={17} />

                      {signingOut
                        ? "Signing out..."
                        : "Sign Out"}
                    </button>

                    {logoutError && (
                      <p
                        role="alert"
                        className="px-4 py-2 text-xs text-red-700"
                      >
                        {logoutError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (

              /* GUEST ACTIONS */

              <div className="hidden items-center gap-3 lg:flex lg:gap-5">

                <Link
                  to="/login"
                  state={{ from: location }}
                  className="whitespace-nowrap px-2 py-2.5 text-xs font-semibold text-[#29251F] transition-colors hover:text-[#A47A28]"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className={signupStyle}
                >
                  Sign Up

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.8}
                  />
                </Link>
              </div>
            )}

            {/* ROLE-BASED SHOPPING / MANAGEMENT ACTION */}

            {!loading && (
              isManagementUser ? (
                <Link
                  to="/management"
                  aria-label="Management Dashboard"
                  title="Management Dashboard"
                  className={iconButton}
                >
                  <LayoutDashboard size={21} strokeWidth={1.6} />
                </Link>
              ) : (
                <Link
                  to={user ? "/cart" : "/register"}
                  state={!user ? { from: location } : undefined}
                  aria-label={
                    user
                      ? `Shopping bag, ${cartCount} items`
                      : "Shopping bag"
                  }
                  title="Shopping Bag"
                  className={iconButton}
                >
                  <ShoppingBag size={21} strokeWidth={1.6} />

                  {user?.role === "customer" && cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#B65330] px-1 text-[10px] font-semibold text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              )
            )}

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              aria-label={
                menuOpen ? "Close menu" : "Open menu"
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() =>
                setMenuOpen((previous) => !previous)
              }
              className={`${iconButton} lg:hidden`}
            >
              {menuOpen ? (
                <X size={23} />
              ) : (
                <Menu size={23} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}

      {menuOpen && (
        <div
          role="navigation"
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mx-auto mt-3 max-h-[calc(100dvh-110px)] max-w-[1440px] overflow-y-auto rounded-[28px] border border-white/90 bg-[#FCF3E3]/95 p-5 text-[#29251F] shadow-[0_15px_45px_rgba(77,57,29,0.18)] backdrop-blur-2xl lg:hidden"
        >
          <div className="flex flex-col gap-2">

            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#A47A28]/15 text-[#79551E]"
                      : "text-[#29251F] hover:bg-[#A47A28]/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {!loading && (
            <div className="mt-4 border-t border-[#A47A28]/25 pt-4">

              {user ? (
                <>
                  {/* MOBILE USER INFORMATION */}

                  <div className="mb-3 flex items-center gap-3 px-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#21483D] text-[#E6C77E]">
                      <UserRound size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#21483D]">
                        {user.fullName || "My Account"}
                      </p>

                      <p className="truncate text-xs text-[#625A4D]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={accountPath}
                    onClick={() => setMenuOpen(false)}
                    className={dropdownLink}
                  >
                    {isManagementUser ? (
                      <LayoutDashboard size={18} />
                    ) : (
                      <UserRound size={18} />
                    )}

                    {isManagementUser
                      ? "Management Dashboard"
                      : "My Account"}
                  </Link>

                  {!isManagementUser && (
                    <Link
                      to="/account/orders"
                      onClick={() => setMenuOpen(false)}
                      className={dropdownLink}
                    >
                      <Package size={18} />
                      My Orders
                    </Link>
                  )}

                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={() => setShowSignOutModal(true)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#B65330] transition-colors hover:bg-[#B65330]/10 disabled:opacity-50"
                  >
                    <LogOut size={18} />

                    {signingOut
                      ? "Signing out..."
                      : "Sign Out"}
                  </button>

                  {logoutError && (
                    <p
                      role="alert"
                      className="px-4 py-2 text-xs text-red-700"
                    >
                      {logoutError}
                    </p>
                  )}
                </>
              ) : (

                /* MOBILE GUEST ACTIONS */

                <div className="grid grid-cols-2 gap-3">

                  <Link
                    to="/login"
                    state={{ from: location }}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-[#21483D]/30 px-4 py-3 text-center text-sm font-semibold text-[#21483D] transition-colors hover:bg-[#21483D]/5"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#B65330] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#A44327]"
                  >
                    Sign Up
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
          <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={async () => {
          await handleLogout();
          setShowSignOutModal(false);
        }}
        signingOut={signingOut}
      />
    </header>
  );
}
