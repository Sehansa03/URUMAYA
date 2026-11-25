import { Link, useLocation } from "react-router-dom";
import {
  ArrowUp,
  ArrowUpRight,
  ShoppingBag,
  UserRound,
  MapPin,
} from "lucide-react";

import UrumayaLogo from "./UrumayaLogo";
import { useAuth } from "../context/AuthContext";
import "./Footer.css";

function BotanicalDecoration({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 260 340"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 330 C90 260 120 170 180 25" />

        <path d="M65 276 C5 260 0 210 15 180 C62 192 89 231 65 276Z" />

        <path d="M91 235 C130 170 190 184 225 192 C195 240 145 255 91 235Z" />

        <path d="M116 185 C50 173 39 121 55 85 C105 102 131 142 116 185Z" />

        <path d="M140 139 C170 78 221 79 250 91 C226 138 186 159 140 139Z" />

        <path d="M160 94 C112 76 106 30 128 5 C169 30 183 63 160 94Z" />

        <path d="M180 25 C190 5 220 0 240 10 C230 42 205 56 171 48" />

        <path d="M65 276 L15 180" />
        <path d="M91 235 L225 192" />
        <path d="M116 185 L55 85" />
        <path d="M140 139 L250 91" />
        <path d="M160 94 L128 5" />
      </g>
    </svg>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="urumaya-footer-link">
      <span>{children}</span>
      <ArrowUpRight size={13} aria-hidden="true" />
    </Link>
  );
}

export default function Footer() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  const year = new Date().getFullYear();

  const isManagementUser = ["admin", "staff"].includes(
    user?.role
  );

  const accountPath = !user
    ? "/login"
    : isManagementUser
      ? "/management"
      : "/account";

  const cartPath = user ? "/cart" : "/register";

  const ordersPath = user
    ? "/account/orders"
   : "/register";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "instant"
        : "smooth",
    });
  };

  // Minimal checkout footer
  if (pathname === "/checkout") {
    return (
      <footer className="urumaya-footer urumaya-footer--minimal">
        <div className="urumaya-footer-container">
          <div className="urumaya-footer-checkout">
            <p>
              © {year} URUMAYA. All rights reserved.
            </p>

            <FooterLink to={cartPath}>
                Shopping Bag
            </FooterLink>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="urumaya-footer">
      {/* Decorative botanical elements */}
      <div
        className="urumaya-footer-decoration"
        aria-hidden="true"
      >
        <BotanicalDecoration className="urumaya-footer-leaves urumaya-footer-leaves--left" />

        <BotanicalDecoration className="urumaya-footer-leaves urumaya-footer-leaves--right" />

        <div className="urumaya-footer-glow" />
      </div>

      <div className="urumaya-footer-container">
        <div className="urumaya-footer-main">
          {/* Brand information */}
          <div className="urumaya-footer-brand">
            <UrumayaLogo />

            <p className="urumaya-footer-description">
              Celebrating Sri Lankan craftsmanship
              and living traditions.
            </p>

            <div className="urumaya-footer-signature">
              <span />
              <span>Crafted with heritage. Shared with love.</span>
            </div>
          </div>

          {/* Shopping navigation */}
          <div className="urumaya-footer-column">
            <h3 className="urumaya-footer-heading">
              <ShoppingBag size={19} strokeWidth={1.5} />
              Shop
            </h3>

            <nav
              aria-label="Footer shopping navigation"
              className="urumaya-footer-nav"
            >
              <FooterLink to="/shop">
                All Collections
              </FooterLink>

              <FooterLink to={cartPath}>
                Shopping Bag
              </FooterLink>

              <FooterLink to="/stories">
                Our Stories
              </FooterLink>
            </nav>
          </div>

          {/* Account navigation */}
          <div className="urumaya-footer-column">
            <h3 className="urumaya-footer-heading">
              <UserRound size={19} strokeWidth={1.5} />
              Account
            </h3>

            <nav
              aria-label="Footer account navigation"
              className="urumaya-footer-nav"
            >
              {!loading && (
                <>
                  <FooterLink to={accountPath}>
                    {!user
                      ? "Sign In"
                      : isManagementUser
                        ? "Management Dashboard"
                        : "My Account"}
                  </FooterLink>

                  {!user && (
                    <FooterLink to="/register">
                      Create Account
                    </FooterLink>
                  )}
                </>
              )}

              {!isManagementUser && (
                <FooterLink to={ordersPath}>
                  My Orders
                </FooterLink>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="urumaya-footer-bottom">
          <p className="urumaya-footer-copyright">
            © {year} URUMAYA. All rights reserved.
          </p>

          <div className="urumaya-footer-bottom-actions">
            <div className="urumaya-footer-location">
              <MapPin size={15} strokeWidth={1.6} />
              <span>Sri Lanka · LKR</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              title="Back to top"
              className="urumaya-footer-top-button"
            >
              <ArrowUp size={17} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>

      {/* Traditional geometric border */}
      <div
        className="urumaya-footer-pattern"
        aria-hidden="true"
      />
    </footer>
  );
}