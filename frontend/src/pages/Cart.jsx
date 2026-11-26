
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Truck,
  Leaf,
} from "lucide-react";

import "../styles/Cart.css";
import { useCart } from "../context/CartContext";

// ==========================================
// FORMAT PRICE
// ==========================================

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

// ==========================================
// LOTUS DECORATION
// ==========================================

function Lotus({ className = "" }) {
  return (
    <svg
      viewBox="0 0 80 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M40 49C25 37 27 18 40 5C53 18 55 37 40 49Z" />
      <path d="M40 49C20 48 10 32 12 17C29 18 40 31 40 49Z" />
      <path d="M40 49C60 48 70 32 68 17C51 18 40 31 40 49Z" />
      <path d="M40 49C22 58 8 47 3 32C21 28 33 37 40 49Z" />
      <path d="M40 49C58 58 72 47 77 32C59 28 47 37 40 49Z" />
      <path d="M40 49V57" />
    </svg>
  );
}

function LotusDivider() {
  return (
    <div className="cb-lotus-divider" aria-hidden="true">
      <span />
      <Lotus />
      <span />
    </div>
  );
}

// ==========================================
// BOTANICAL DECORATION
// ==========================================

function Botanical({ className = "" }) {
  return (
    <svg
      viewBox="0 0 200 310"
      className={`cb-botanical ${className}`}
      aria-hidden="true"
    >
      <g fill="currentColor">
        <path
          d="M15 302C32 210 76 103 168 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />

        <path d="M29 252C2 234 -4 196 8 174C32 198 43 222 29 252Z" />
        <path d="M30 251C69 221 103 231 133 251C92 270 58 268 30 251Z" />

        <path d="M48 201C14 175 15 139 25 114C51 139 64 171 48 201Z" />
        <path d="M50 198C86 165 126 174 159 194C118 217 83 217 50 198Z" />

        <path d="M75 149C43 122 47 84 62 61C88 89 91 119 75 149Z" />
        <path d="M77 147C113 115 150 120 183 137C145 161 109 165 77 147Z" />

        <path d="M108 97C88 64 97 33 119 13C134 46 129 76 108 97Z" />
        <path d="M111 94C143 65 173 68 197 78C172 103 141 112 111 94Z" />

        <path d="M150 30C139 12 153 2 174 0C176 15 166 25 150 30Z" />
      </g>
    </svg>
  );
}

// ==========================================
// SHOPPING BAG PAGE
// ==========================================

export default function Cart() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    loading,
    updating,
    error,
    refreshCart,
  } = useCart();

  const hasUnavailableItems = cartItems.some(
    (item) => !item.isAvailable
  );

  const checkoutBlocked =
    loading ||
    updating ||
    Boolean(error) ||
    hasUnavailableItems;

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const handleQuantityChange = async (item, quantity) => {
    if (
      loading ||
      updating ||
      quantity < 1 ||
      quantity > item.stockQuantity
    ) {
      return;
    }

    await updateQuantity(item.productId, quantity);
  };

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  const handleRemove = async (productId) => {
    if (loading || updating) return;

    await removeFromCart(productId);
  };

  return (
    <main className="urumaya-cart">
      <Botanical className="cb-left" />
      <Botanical className="cb-right" />

      <div className="cb-container">
        {/* BREADCRUMB */}

        <nav
          className="cb-breadcrumb"
          aria-label="Breadcrumb"
        >
          <Link to="/">Home</Link>

          <ChevronRight size={13} />

          <span aria-current="page">
            Shopping Bag
          </span>
        </nav>

        {/* PAGE HEADING */}

        <div className="cb-heading">
          <p className="cb-eyebrow">
            Your curated collection
          </p>

          <h1>Your Shopping Bag</h1>

          <p>
            Handcrafted treasures, thoughtfully chosen.
          </p>

          <LotusDivider />
        </div>

        {/* API ERROR */}

        {error && !loading && (
          <div className="cb-alert" role="alert">
            <AlertCircle size={18} />

            <span>{error}</span>

            <button
              type="button"
              disabled={updating}
              onClick={refreshCart}
            >
              Refresh shopping bag
            </button>
          </div>
        )}

        {/* LOADING STATE */}

        {loading ? (
          <div className="cb-state" role="status">
            <Loader2
              className="cb-spin"
              size={26}
            />

            Loading your shopping bag...
          </div>
        ) : error && !cartItems.length ? (
          <div className="cb-state">
            Your shopping bag could not be loaded.
            Please refresh it above.
          </div>
        ) : !cartItems.length ? (
          /* EMPTY SHOPPING BAG */

          <div className="cb-state">
            <ShoppingBag
              size={48}
              strokeWidth={1.2}
            />

            <h2>Your bag awaits a story.</h2>

            <p>
              Discover handcrafted treasures that
              carry the spirit of Sri Lankan heritage.
            </p>

            <Link
              className="cb-button"
              to="/shop"
            >
              Explore the Collection

              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            {/* UPDATING STATE */}

            {updating && (
              <p className="cb-status" role="status">
                <Loader2
                  className="cb-spin"
                  size={16}
                />

                Updating your shopping bag...
              </p>
            )}

            {/* UNAVAILABLE PRODUCT WARNING */}

            {hasUnavailableItems && (
              <div
                className="cb-alert"
                role="alert"
              >
                <AlertCircle size={18} />

                Some items are unavailable in the
                requested quantity. Reduce their
                quantity where possible or remove
                them before checkout.
              </div>
            )}

            <div className="cb-grid">
              {/* PRODUCT LIST */}

              <section
                aria-label="Shopping bag items"
                className="cb-items"
              >
                {cartItems.map((item) => {
                  const ProductImage = item.slug
                    ? Link
                    : "div";

                  return (
                    <article
                      className="cb-item"
                      key={item.productId}
                    >
                      {/* PRODUCT IMAGE */}

                      <ProductImage
                        className="cb-image"
                        {...(item.slug
                          ? {
                              to: `/shop/${item.slug}`,
                            }
                          : {})}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </ProductImage>

                      {/* PRODUCT INFORMATION */}

                      <div className="cb-info">
                        <p className="cb-eyebrow">
                          {typeof item.category ===
                          "string"
                            ? item.category.replace(
                                /-/g,
                                " "
                              )
                            : item.category?.name ||
                              ""}
                        </p>

                        <h2>
                          {item.slug ? (
                            <Link
                              to={`/shop/${item.slug}`}
                            >
                              {item.name}
                            </Link>
                          ) : (
                            item.name
                          )}
                        </h2>

                        <p className="cb-unit">
                          {formatPrice(item.price)} each
                        </p>

                        <strong className="cb-price">
                          {formatPrice(item.totalPrice)}
                        </strong>
                      </div>

                      {/* QUANTITY CONTROLS */}

                      <div className="cb-controls">
                        <div className="cb-quantity">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            disabled={
                              updating ||
                              item.quantity <= 1 ||
                              item.quantity - 1 >
                                item.stockQuantity
                            }
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus size={17} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            disabled={
                              updating ||
                              !item.isAvailable ||
                              item.quantity >=
                                item.stockQuantity
                            }
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus size={17} />
                          </button>
                        </div>

                        {/* STOCK INFORMATION */}

                        <p
                          className={
                            item.isAvailable
                              ? "cb-stock"
                              : "cb-unavailable"
                          }
                        >
                          {item.isAvailable
                            ? item.quantity ===
                              item.stockQuantity
                              ? `Maximum stock reached (${item.stockQuantity})`
                              : `● In stock · ${item.stockQuantity} available`
                            : "Unavailable in requested quantity"}
                        </p>

                        {/* REDUCE TO AVAILABLE STOCK */}

                        {!item.isAvailable &&
                          item.stockQuantity > 0 &&
                          item.quantity >
                            item.stockQuantity && (
                            <button
                              type="button"
                              className="cb-reduce"
                              disabled={updating}
                              onClick={() =>
                                handleQuantityChange(
                                  item,
                                  item.stockQuantity
                                )
                              }
                            >
                              Reduce to{" "}
                              {item.stockQuantity}{" "}
                              available
                            </button>
                          )}
                      </div>

                      {/* REMOVE BUTTON */}

                      <button
                        className="cb-remove"
                        type="button"
                        title="Remove"
                        aria-label={`Remove ${item.name}`}
                        disabled={updating}
                        onClick={() =>
                          handleRemove(item.productId)
                        }
                      >
                        <Trash2 size={20} />
                      </button>
                    </article>
                  );
                })}

                {/* CONTINUE SHOPPING */}

                <Link
                  className="cb-continue"
                  to="/shop"
                >
                  <ArrowLeft size={19} />

                  Continue Shopping
                </Link>
              </section>

              {/* ORDER SUMMARY */}

              <aside className="cb-summary">
                <Botanical className="cb-summary-leaf" />

                <p className="cb-eyebrow">
                  Order summary
                </p>

                <h2>Your Order</h2>

                <div className="cb-summary-lines">
                  <div>
                    <span>
                      Subtotal ({cartCount}{" "}
                      {cartCount === 1
                        ? "item"
                        : "items"}
                      )
                    </span>

                    <strong>
                      {formatPrice(cartSubtotal)}
                    </strong>
                  </div>

                  <div>
                    <span>Shipping</span>

                    <small>
                      Calculated at checkout
                    </small>
                  </div>
                </div>

                <div className="cb-total">
                  <span>Subtotal</span>

                  <strong>
                    {formatPrice(cartSubtotal)}
                  </strong>
                </div>

                {/* CHECKOUT BUTTON */}

                {checkoutBlocked ? (
                  <button
                    className="cb-checkout"
                    type="button"
                    disabled
                  >
                    <ShoppingBag size={19} />

                    Proceed to Checkout

                    <ArrowRight size={19} />
                  </button>
                ) : (
                  <Link
                    className="cb-checkout"
                    to="/checkout"
                  >
                    <ShoppingBag size={19} />

                    Proceed to Checkout

                    <ArrowRight size={19} />
                  </Link>
                )}

                <p className="cb-note">
                  Your order will be reviewed before
                  payment.
                </p>
              </aside>
            </div>

            {/* SHOPPING BENEFITS */}

            <div className="cb-benefits">
              <div>
                <ShieldCheck />

                <span>
                  <strong>Order Review</strong>

                  <small>
                    Review your order before payment
                  </small>
                </span>
              </div>

              <div>
                <Truck />

                <span>
                  <strong>Islandwide Delivery</strong>

                  <small>
                    Shipping details at checkout
                  </small>
                </span>
              </div>

              <div>
                <Leaf />

                <span>
                  <strong>Authentic Crafts</strong>

                  <small>
                    Celebrating local craftsmanship
                  </small>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
