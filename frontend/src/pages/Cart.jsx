
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

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
// SHOPPING BAG PAGE
// ==========================================

export default function Cart() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  return (
    <main className="min-h-screen bg-urumaya-ivory text-urumaya-ink">

      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <section className="bg-urumaya-forest px-6 py-16 text-urumaya-ivory sm:px-10 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-urumaya-gold">
            Your Curated Selection
          </p>

          <h1 className="mt-5 font-display text-6xl leading-none sm:text-7xl">
            Your Shopping Bag
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-urumaya-ivory/65">
            A collection of meaningful pieces, thoughtfully
            crafted and chosen by you.
          </p>
        </div>
      </section>

      {/* ====================================
          EMPTY SHOPPING BAG
      ==================================== */}

      {cartItems.length === 0 ? (
        <section className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-urumaya-forest/5">
            <ShoppingBag
              size={38}
              strokeWidth={1.3}
              className="text-urumaya-terracotta"
            />
          </div>

          <h2 className="mt-8 font-display text-4xl text-urumaya-forest sm:text-5xl">
            Your bag awaits a story.
          </h2>

          <p className="mt-5 max-w-md text-sm leading-7 text-urumaya-ink/60">
            Your shopping bag is currently empty.
            Discover handcrafted treasures that carry
            the spirit of Sri Lankan heritage.
          </p>

          <Link
            to="/shop"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-urumaya-terracotta px-8 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#CC7050]"
          >
            Explore the Collection
            <ArrowRight size={16} />
          </Link>
        </section>
      ) : (

        /* ====================================
            SHOPPING BAG CONTENT
        ==================================== */

        <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:py-20">

          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-urumaya-ink/65">
              <span className="font-semibold text-urumaya-forest">
                {cartCount}
              </span>{" "}
              {cartCount === 1 ? "item" : "items"} in your bag
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-urumaya-terracotta transition hover:opacity-70"
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </Link>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">

            {/* ==================================
                CART ITEMS
            ================================== */}

            <div className="min-w-0">

              <div className="hidden border-b border-urumaya-ink/15 pb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-urumaya-ink/50 sm:flex">
                <span className="flex-1">Product</span>
                <span>Subtotal</span>
              </div>

              {cartItems.map((item) => (
                <article
                  key={item.productId}
                  className="flex flex-col gap-5 border-b border-urumaya-ink/15 py-8 sm:flex-row sm:gap-7"
                >

                  {/* PRODUCT IMAGE */}

                  <Link
                    to={`/shop/${item.slug}`}
                    className="block w-full shrink-0 overflow-hidden rounded-2xl bg-[#E9E1D5] sm:w-36"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-44"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center text-xs text-urumaya-ink/40 sm:h-44">
                        No image
                      </div>
                    )}
                  </Link>

                  {/* PRODUCT INFORMATION */}

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-urumaya-terracotta">
                        {item.category}
                      </p>

                      <Link
                        to={`/shop/${item.slug}`}
                        className="mt-2 block font-display text-3xl leading-tight text-urumaya-forest transition hover:text-urumaya-terracotta"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-3 text-sm text-urumaya-ink/65">
                        {formatPrice(item.price)} each
                      </p>
                    </div>

                    {/* QUANTITY AND REMOVE */}

                    <div className="flex flex-wrap items-center gap-5">

                      <div className="flex items-center rounded-full border border-urumaya-ink/20">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-10 w-10 items-center justify-center transition hover:text-urumaya-terracotta disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="w-9 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            item.quantity >= item.stockQuantity
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-10 w-10 items-center justify-center transition hover:text-urumaya-terracotta disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Plus size={15} />
                        </button>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.productId)
                        }
                        className="inline-flex items-center gap-2 text-xs text-urumaya-ink/50 transition hover:text-urumaya-terracotta"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>

                    </div>

                  </div>

                  {/* ITEM SUBTOTAL */}

                  <div className="flex shrink-0 items-start justify-between gap-3 sm:justify-end">
                    <span className="text-xs text-urumaya-ink/50 sm:hidden">
                      Subtotal
                    </span>

                    <p className="text-base font-semibold text-urumaya-forest">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                </article>
              ))}

            </div>

            {/* ==================================
                ORDER SUMMARY
            ================================== */}

            <aside className="rounded-[26px] bg-urumaya-forest p-7 text-urumaya-ivory sm:p-9 lg:sticky lg:top-32">

              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-urumaya-gold">
                Your Order
              </p>

              <h2 className="mt-4 font-display text-4xl">
                Order Summary
              </h2>

              <div className="mt-9 space-y-5">

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-urumaya-ivory/65">
                    Subtotal ({cartCount} items)
                  </span>

                  <span className="font-medium">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-urumaya-ivory/65">
                    Shipping
                  </span>

                  <span className="text-xs text-urumaya-ivory/55">
                    Calculated at checkout
                  </span>
                </div>

              </div>

              <div className="my-8 h-px bg-urumaya-ivory/20" />

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-urumaya-ivory/75">
                  Subtotal
                </span>

                <span className="font-display text-3xl text-urumaya-gold">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>

              
              {/* PROCEED TO CHECKOUT */}

              <Link
               to="/checkout"
               className="mt-9 flex w-full items-center justify-center gap-3 rounded-full bg-urumaya-terracotta px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#CC7050]"
              >
                Proceed to Checkout
               <ArrowRight size={16} />
              </Link>

              <p className="mt-4 text-center text-xs leading-6 text-urumaya-ivory/50">
               Your order will be reviewed before payment.
               </p>


              <div className="mt-8 border-t border-urumaya-ivory/15 pt-6">
                <p className="text-center font-display text-xl italic text-urumaya-gold/85">
                  Rooted in Heritage
                </p>
              </div>

            </aside>

          </div>
        </section>
      )}
    </main>
  );
}
