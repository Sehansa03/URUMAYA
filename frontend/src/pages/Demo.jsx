import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  ShieldCheck,
  Users,
  ArrowRight,
  ArrowLeft,
  LoaderCircle,
  AlertCircle,
  Check,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

// ==========================================
// DEMO ROLE CONFIGURATION
// ==========================================

const roles = [
  {
    role: "customer",
    title: "Customer",
    description:
      "Explore the storefront and shopping experience.",
    icon: ShoppingBag,
    destination: "/shop",
    button: "Enter as Customer",
    features: [
      "Browse product collections",
      "Explore product details",
      "Discover heritage stories",
      "Explore the customer storefront",
    ],
  },
  {
    role: "admin",
    title: "Administrator",
    description:
      "Explore the complete business management workspace.",
    icon: ShieldCheck,
    destination: "/management",
    button: "Enter as Admin",
    features: [
      "Dashboard & analytics",
      "Product & order management",
      "Customer & staff management",
      "Reports & approvals",
    ],
  },
  {
    role: "staff",
    title: "Staff",
    description:
      "Explore daily store operations and responsibilities.",
    icon: Users,
    destination: "/management",
    button: "Enter as Staff",
    features: [
      "Inventory management",
      "Order management",
      "Product & story management",
      "Customer management",
    ],
  },
];

// ==========================================
// DEMO SELECTION PAGE
// ==========================================

export default function Demo() {
  const {
    demoLogin,
    logout,
    user,
    loading,
  } = useAuth();

  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] =
    useState(null);

  const [error, setError] = useState("");

  const busyRef = useRef(false);

  // ==========================================
  // HANDLE DEMO LOGIN
  // ==========================================

  const handleDemoLogin = async (item) => {
    if (busyRef.current || loading) return;

    busyRef.current = true;

    setSelectedRole(item.role);
    setError("");

    try {
      // End the existing session before switching roles
      if (user) {
        await logout();
      }

      await demoLogin(item.role);

      navigate(item.destination, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to start the demo. Please try again."
      );
    } finally {
      busyRef.current = false;
      setSelectedRole(null);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-[#092D2C] px-5 py-5 text-[#F6EEDF] sm:px-8">

      {/* ==================================
          TOP NAVIGATION
      ================================== */}

      <header className="mx-auto flex w-full max-w-[1000px] items-center justify-between gap-4">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-[#D4B77C] transition-colors hover:text-white sm:text-sm"
        >
          <ArrowLeft size={15} />
          Back to Store
        </Link>

        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#D4B77C] sm:text-[10px]">
          Portfolio Demo
        </span>

      </header>

      {/* ==================================
          CENTERED PAGE CONTENT
      ================================== */}

      <div className="flex flex-1 items-center justify-center py-6">

        <div className="w-full max-w-[1000px]">

          {/* BRAND AND PAGE HEADING */}

          <div className="mb-7 text-center">

            <p className="font-display text-[28px] leading-none tracking-[0.18em] text-[#D4B77C]">
              URUMAYA
            </p>

            <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-[#D4B77C]">
              Rooted in Heritage
            </p>

            <div className="mx-auto my-4 h-px w-12 bg-[#D4B77C]/50" />

            <h1 className="font-display text-[32px] leading-tight sm:text-[38px]">
              Choose Your Experience
            </h1>

            <p className="mt-2 text-[13px] leading-6 text-[#D7D1C4]">
              One platform. Three perspectives.
              Explore URUMAYA through your preferred role.
            </p>

          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div
              role="alert"
              className="mx-auto mb-4 flex max-w-xl items-center gap-2 rounded-lg border border-red-300/30 bg-red-900/30 px-4 py-3 text-xs text-red-100"
            >
              <AlertCircle
                size={17}
                className="shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* ==================================
              ROLE SELECTION CARDS
          ================================== */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {roles.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.role}
                  className="flex flex-col rounded-[20px] border border-[#D4B77C]/40 bg-[#FFFAEF] p-5 text-[#29251F] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* ROLE ICON AND TITLE */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE5D3] text-[#103D46]">

                      <Icon
                        size={21}
                        strokeWidth={1.6}
                      />

                    </div>

                    <h2 className="font-display text-[25px] leading-tight text-[#103D46]">
                      {item.title}
                    </h2>

                  </div>

                  {/* ROLE DESCRIPTION */}

                  <p className="mt-3 text-[12px] leading-[1.6] text-[#756B5C] md:min-h-[40px]">
                    {item.description}
                  </p>

                  {/* DIVIDER */}

                  <div className="my-4 h-px bg-[#D4B77C]/35" />

                  {/* ROLE FEATURES */}

                  <ul className="mb-5 space-y-2.5">

                    {item.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[12px] leading-5 text-[#625A4D]"
                      >

                        <Check
                          size={14}
                          strokeWidth={2}
                          className="mt-[3px] shrink-0 text-[#A47A28]"
                        />

                        <span>{feature}</span>

                      </li>
                    ))}

                  </ul>

                  {/* ENTER DEMO BUTTON */}

                  <button
                    type="button"
                    disabled={
                      loading || selectedRole !== null
                    }
                    onClick={() =>
                      handleDemoLogin(item)
                    }
                    className="mt-auto flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#103D46] px-3 py-2.5 text-[12px] font-semibold text-[#FFFAEF] transition-colors hover:bg-[#071F22] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {selectedRole === item.role ? (
                      <>
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />

                        Starting demo...
                      </>
                    ) : (
                      <>
                        {item.button}

                        <ArrowRight size={14} />
                      </>
                    )}

                  </button>

                </article>
              );
            })}

          </div>

          {/* ==================================
              DEMO INFORMATION
          ================================== */}

          <div className="mt-6 text-center">

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#D7D1C4]">

              <ShieldCheck
                size={14}
                className="text-[#D4B77C]"
              />

              <span>No registration required</span>

              <span className="text-[#D4B77C]">
                ·
              </span>

              <span>Read-only management access</span>

            </div>



            <p className="mt-3 text-xs text-[#D7D1C4]">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-[#D4B77C] underline underline-offset-4 transition-colors hover:text-white"
              >
                Sign In
              </Link>

            </p>

          </div>

        </div>

      </div>

      {/* ==================================
          MINIMAL FOOTER
      ================================== */}

      <footer className="text-center">

        <p className="text-[9px] uppercase tracking-[0.18em] text-[#D4B77C]/70">
          URUMAYA — Rooted in Heritage
        </p>

      </footer>

    </main>
  );
}