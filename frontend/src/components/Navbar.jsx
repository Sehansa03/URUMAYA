
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UrumayaLogo from "./UrumayaLogo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 35);

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const navClass = ({ isActive }) =>
    `text-[11px] font-medium uppercase tracking-[0.16em]
     transition-colors duration-300 hover:text-urumaya-gold
     ${isActive ? "text-urumaya-gold" : "text-urumaya-ivory"}`;

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  
const glassStyle =
  isHome && !scrolled
    ? "bg-white/10 border-white/25 backdrop-blur-xl shadow-lg shadow-black/10"
    : "bg-[#071F22]/55 border-white/20 backdrop-blur-2xl shadow-lg shadow-black/15";

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-10">
      <div
        className={`mx-auto max-w-7xl rounded-full border
          transition-all duration-500 ${glassStyle}`}
      >
        <div className="flex h-[68px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-9">

          {/* URUMAYA brand */}
          {/* URUMAYA custom logo */}
          <UrumayaLogo />
          {/* Desktop links */}
          <nav className="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Main navigation">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>

            <NavLink to="/shop" className={navClass}>
              Shop
            </NavLink>

            <Link
              to="/#explore"
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-urumaya-ivory transition-colors hover:text-urumaya-gold"
            >
              Explore
            </Link>

            <Link
              to="/#stories"
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-urumaya-ivory transition-colors hover:text-urumaya-gold"
            >
              Our Stories
            </Link>
          </nav>

          {/* Account, cart and CTA */}
          <div className="flex items-center gap-3 sm:gap-5">

            <Link
              to={user ? "/account" : "/login"}
              aria-label={user ? "My account" : "Sign in"}
              className="hidden items-center gap-2 text-urumaya-ivory transition-colors hover:text-urumaya-gold sm:flex"
            >
              <svg width="19" height="19" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </Link>

            <Link
              to="/cart"
              aria-label="Shopping bag"
              className="flex items-center gap-1 text-urumaya-ivory transition-colors hover:text-urumaya-gold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M5 8h14l1 12H4L5 8Z" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
              <span className="text-[10px]">(0)</span>
            </Link>

            <Link
              to="/shop"
              className="hidden rounded-full bg-urumaya-terracotta px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition-all duration-300 hover:bg-[#CC7353] hover:shadow-lg xl:inline-flex"
            >
              Discover
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="urumaya-mobile-menu"
              className="flex h-10 w-10 cursor-pointer items-center justify-center text-urumaya-ivory transition-colors hover:text-urumaya-gold lg:hidden"
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" aria-hidden="true">
                  <path d="M5 5L19 19M19 5L5 19" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" aria-hidden="true">
                  <path d="M3 7H21M3 12H21M3 17H21" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          id="urumaya-mobile-menu"
          aria-label="Mobile navigation"
          className="mx-auto mt-2 max-w-7xl rounded-[24px] border border-white/10 bg-urumaya-teal/98 px-7 py-7 text-urumaya-ivory shadow-2xl backdrop-blur-2xl lg:hidden"
        >
          <div className="flex flex-col gap-6">
            <Link to="/" onClick={() => setMenuOpen(false)}
              className="text-xs uppercase tracking-[0.2em] hover:text-urumaya-gold">
              Home
            </Link>

            <Link to="/shop" onClick={() => setMenuOpen(false)}
              className="text-xs uppercase tracking-[0.2em] hover:text-urumaya-gold">
              Shop All
            </Link>

            <Link to="/#explore" onClick={() => setMenuOpen(false)}
              className="text-xs uppercase tracking-[0.2em] hover:text-urumaya-gold">
              Explore
            </Link>

            <Link to="/#stories" onClick={() => setMenuOpen(false)}
              className="text-xs uppercase tracking-[0.2em] hover:text-urumaya-gold">
              Our Stories
            </Link>

            <div className="border-t border-white/15 pt-6">
              {user ? (
                <div className="flex flex-col gap-5">
                  <Link to="/account" onClick={() => setMenuOpen(false)}
                    className="text-xs uppercase tracking-[0.2em] hover:text-urumaya-gold">
                    My Account
                  </Link>

                  <button type="button" onClick={handleLogout}
                    className="cursor-pointer text-left text-xs uppercase tracking-[0.2em] hover:text-urumaya-gold">
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="text-xs uppercase tracking-[0.2em] hover:text-urumaya-gold">
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
