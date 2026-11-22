
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardCheck,
  Boxes,
  ShoppingBag,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import ManagementProducts from "./ManagementProducts";
import ManagementApprovals from "./ManagementApprovals";
import ManagementOrders from "./ManagementOrders";
import ManagementCategories from "./ManagementCategories";
import ManagementStories from "./ManagementStories";
import { BookOpen } from "lucide-react";



// ==========================================
// SIDEBAR MENU ITEMS
// ==========================================

const menuItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    icon: Package,
  },
  {
    label: "Stories",
    icon: BookOpen,
  },
  {
    label: "Categories",
    icon: Tags,
    adminOnly: true,
  },
  {
    label: "Approvals",
    icon: ClipboardCheck,
    adminOnly: true,
  },
  {
    label: "Inventory",
    icon: Boxes,
  },
  {
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    icon: Users,
    adminOnly: true,
  },
  {
    label: "Reports",
    icon: BarChart3,
    adminOnly: true,
  },
];

// ==========================================
// OVERVIEW CARDS
// ==========================================

const summaryCards = [
  {
    label: "Total Products",
    icon: Package,
  },
  {
    label: "Pending Approvals",
    icon: ClipboardCheck,
    adminOnly: true,
  },
  {
    label: "Total Orders",
    icon: ShoppingBag,
  },
  {
    label: "Low Stock Items",
    icon: Boxes,
  },
];

// ==========================================
// MAIN DASHBOARD
// ==========================================

export default function ManagementDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const isAdmin = user?.role === "admin";

  const visibleMenu = menuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const visibleCards = summaryCards.filter(
    (card) => !card.adminOnly || isAdmin
  );

  // ==========================================
  // SIDEBAR NAVIGATION
  // ==========================================

  const handleMenuClick = (label) => {
    setActivePage(label);
    setSidebarOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);
      setLogoutError("");

      await logout();

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);

      setLogoutError(
        "Unable to sign out. Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6EEDF] font-sans text-[#29251F]">

      {/* ======================================
          MOBILE HEADER
      ====================================== */}

      <header className="flex h-[72px] items-center justify-between bg-[#103D46] px-5 text-white lg:hidden">

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <img
            src="/images/urumaya/urumaya_logo.png"
            alt="URUMAYA Logo"
            className="h-11 w-11 object-contain"
          />

          <span className="font-display text-2xl tracking-[0.1em] text-[#E6AD51]">
            URUMAYA
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={
            sidebarOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={sidebarOpen}
          className="rounded-lg p-2 transition hover:bg-white/10"
        >
          {sidebarOpen ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>

      </header>

      {/* ======================================
          MOBILE BACKDROP
      ====================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[270px] flex-col
          bg-[#103D46] text-[#F6EEDF]
          shadow-xl
          transition-transform duration-300
          lg:translate-x-0 lg:shadow-none
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* ====================================
            BRANDING / UNIQUE URUMAYA LOGO
        ==================================== */}

        <div className="shrink-0 border-b border-white/10 px-5 py-6">

          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="URUMAYA Home"
          >
            <img
              src="/images/urumaya/urumaya_logo.png"
              alt="URUMAYA Logo"
              className="h-14 w-14 shrink-0 object-contain"
            />

            <div className="min-w-0">
              <h2 className="font-display text-[26px] leading-none tracking-[0.07em] text-[#E6AD51]">
                URUMAYA
              </h2>

              <p className="mt-2 text-[8px] uppercase tracking-[0.15em] text-[#E6AD51]/80">
                Rooted in Heritage
              </p>
            </div>

          </Link>

          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
            Management Workspace
          </p>

        </div>

        {/* ====================================
            NAVIGATION
        ==================================== */}

        <nav
          aria-label="Management navigation"
          className="management-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-5"
        >

          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const selected = activePage === item.label;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  handleMenuClick(item.label)
                }
                aria-current={
                  selected ? "page" : undefined
                }
                className={`
                  flex w-full items-center gap-4
                  rounded-xl px-4 py-3
                  text-left text-sm
                  transition-all duration-200
                  ${
                    selected
                      ? "bg-[#E6AD51]/15 font-medium text-[#E6AD51]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                />

                <span>{item.label}</span>

              </button>
            );
          })}

        </nav>

        {/* ====================================
            SIDEBAR FOOTER
        ==================================== */}

        <div className="shrink-0 border-t border-white/10 px-5 py-5">

          {/* View storefront */}

          <Link
            to="/shop"
            className="mb-5 flex items-center justify-between rounded-xl border border-white/15 px-4 py-3 text-xs text-white/75 transition hover:border-[#E6AD51]/40 hover:bg-white/10 hover:text-white"
          >
            <span>View Storefront</span>

            <ArrowUpRight size={16} />
          </Link>

          {/* Logged-in user */}

          <div className="mb-4 px-1">

            <p className="truncate text-sm font-medium text-[#F6EEDF]">
              {user?.fullName ||
                user?.name ||
                "URUMAYA User"}
            </p>

            <p className="mt-1 text-[11px] capitalize text-white/50">
              {user?.role}
            </p>

          </div>

          {/* Logout error */}

          {logoutError && (
            <p
              role="alert"
              className="mb-3 text-xs leading-5 text-red-300"
            >
              {logoutError}
            </p>
          )}

          {/* Logout button */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={18} />

            <span>
              {signingOut
                ? "Signing out..."
                : "Logout"}
            </span>

          </button>

        </div>

      </aside>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="min-h-screen lg:ml-[270px]">

        {/* ====================================
            PAGE HEADER
        ==================================== */}

        <div className="border-b border-[#103D46]/10 bg-white/50 px-6 py-5 sm:px-10">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
                URUMAYA / Management
              </p>

              <h1 className="mt-2 font-display text-4xl text-[#103D46] sm:text-5xl">
                {activePage}
              </h1>
            </div>

            <span className="rounded-full border border-[#103D46]/15 bg-white/70 px-4 py-2 text-xs font-medium capitalize text-[#103D46]">
              {user?.role} Workspace
            </span>

          </div>

        </div>

        {/* ====================================
            PAGE BODY
        ==================================== */}

        <div className="mx-auto max-w-7xl px-6 py-9 sm:px-10">

         {activePage === "Products" ? (
            <ManagementProducts />
        ) : activePage === "Stories" ? (
            <ManagementStories />
        ) : activePage === "Categories" && isAdmin ? (
            <ManagementCategories />
        ) : activePage === "Approvals" && isAdmin ? (
            <ManagementApprovals />
        ) : activePage === "Orders" ? (
            <ManagementOrders />
        ) : activePage === "Overview" ? (

          

            <>
              {/* Welcome section */}

              <div className="mb-9">

                <h2 className="font-display text-3xl text-[#103D46]">
                  Welcome back
                  {user?.fullName
                    ? `, ${user.fullName.split(" ")[0]}`
                    : ""}
                </h2>

                <p className="mt-2 text-sm leading-7 text-[#29251F]/60">
                  Manage URUMAYA's artisan collections
                  and daily operations from one place.
                </p>

              </div>

              {/* Summary cards */}

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {visibleCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <p className="text-xs font-medium text-[#29251F]/60">
                          {card.label}
                        </p>

                        <Icon
                          size={20}
                          strokeWidth={1.8}
                          className="shrink-0 text-[#B95035]"
                        />

                      </div>

                      <p className="mt-6 font-display text-4xl text-[#103D46]">
                        —
                      </p>

                      <p className="mt-2 text-xs text-[#29251F]/45">
                        Live data coming soon
                      </p>

                    </div>
                  );
                })}

              </div>

              {/* Workspace introduction */}

              <section className="mt-9 rounded-2xl border border-[#103D46]/10 bg-white/80 p-7 sm:p-9">

                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
                  Workspace
                </p>

                <h3 className="mt-3 font-display text-3xl text-[#103D46]">
                  Your management tools
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#29251F]/60">
                  Use the sidebar to navigate between
                  product management, inventory, orders,
                  and other business operations.
                </p>

              </section>

            </>

          ) : (

            /* ==================================
                PLACEHOLDER SECTIONS
            ================================== */

            <section className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-8 sm:p-12">

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
                URUMAYA Management
              </p>

              <h2 className="mt-4 font-display text-4xl text-[#103D46]">
                {activePage}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#29251F]/60">
                This section is ready for development.
                We'll connect it to URUMAYA's backend
                in the next steps.
              </p>

            </section>

          )}

        </div>

      </main>

    </div>
  );
}
