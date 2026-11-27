import SlowLoadingNotice from "../components/SlowLoadingNotice";
import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  RefreshCw,
  ChevronDown,
  X,
  Loader2,
  Check,
} from "lucide-react";

import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";

import "../styles/Shop.css";

const formatPrice = (price) =>
  `LKR ${Number(price).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  })}`;

/* =========================================
   SCROLL REVEAL
========================================= */

function Reveal({
  children,
  className = "",
  delay = 0,
}) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.08,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      style={{ "--shop-delay": `${delay}ms` }}
      className={`
        shop-reveal
        ${visible ? "shop-reveal-visible" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* =========================================
   DECORATIVE ELEMENTS
========================================= */

function Lotus({ className = "" }) {
  return (
    <svg
      viewBox="0 0 80 60"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
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

function Botanical({ className = "" }) {
  return (
    <svg
      viewBox="0 0 180 260"
      aria-hidden="true"
      className={className}
    >
      <g
        fill="#89965A"
        className="shop-botanical-motion"
      >
        <path
          d="M28 245C30 160 65 70 130 5"
          fill="none"
          stroke="#89965A"
          strokeWidth="2"
        />

        <path d="M48 166C5 146 2 109 10 83C43 101 59 128 48 166Z" />

        <path d="M53 151C78 110 119 111 156 124C126 155 90 167 53 151Z" />

        <path d="M76 102C43 77 44 38 58 14C84 38 93 70 76 102Z" />

        <path d="M85 88C106 43 143 38 177 45C156 80 125 96 85 88Z" />

        <path d="M32 215C4 193 0 165 5 143C33 160 43 186 32 215Z" />

        <path d="M34 209C65 173 103 180 128 195C94 219 65 225 34 209Z" />
      </g>
    </svg>
  );
}

function LotusDivider() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center gap-5 sm:gap-7"
    >
      <span
        className="
          shop-divider-line
          h-px w-20
          bg-gradient-to-r
          from-transparent to-[#B68A36]
          sm:w-40
        "
      />

      <Lotus
        className="
          shop-divider-lotus
          h-9 w-12 text-[#B68A36]
        "
      />

      <span
        className="
          shop-divider-line
          h-px w-20
          bg-gradient-to-l
          from-transparent to-[#B68A36]
          sm:w-40
        "
      />
    </div>
  );
}

/* =========================================
   PRODUCT CARD
========================================= */

function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="
        shop-product-card
        group flex h-full min-w-0 flex-col
        overflow-hidden rounded-[22px]
        border border-[#D9CBB5]/50
        bg-[#FAF1E2]
        shadow-[0_5px_16px_rgba(83,60,28,0.07)]
      "
    >
      {/* Product image */}

      <div
        className="
          relative aspect-[3/2]
          overflow-hidden rounded-[21px]
          bg-[#E9E1D5]
        "
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="
              shop-product-image
              h-full w-full object-cover
            "
          />
        ) : (
          <div
            className="
              flex h-full items-center
              justify-center text-sm
              text-urumaya-ink/40
            "
          >
            Image coming soon
          </div>
        )}

        {product.isFeatured && (
          <span
            className="
              absolute left-3 top-3
              rounded-full bg-urumaya-ivory/95
              px-3 py-1.5 text-[10px]
              font-semibold uppercase
              tracking-wide text-urumaya-forest
            "
          >
            Artisan Pick
          </span>
        )}

        {product.stockQuantity === 0 && (
          <div
            className="
              absolute inset-0 flex
              items-center justify-center
              bg-black/35
            "
          >
            <span
              className="
                rounded-full bg-white
                px-4 py-2 text-xs
                font-semibold text-urumaya-forest
              "
            >
              Sold Out
            </span>
          </div>
        )}

        <span
          className="
            shop-product-arrow
            absolute bottom-3 right-3
            flex h-10 w-10 items-center
            justify-center rounded-full
            bg-urumaya-ivory
            text-urumaya-forest shadow-md
          "
        >
          <ArrowUpRight size={19} />
        </span>
      </div>

      {/* Product information */}

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <p
          className="
            text-[10px] font-semibold uppercase
            tracking-[0.16em] text-urumaya-terracotta
          "
        >
          {product.category}
        </p>

        <h3
          className="
            mb-3 mt-1.5 font-display text-[23px]
            leading-[1.15] text-urumaya-ink
            transition-colors
            group-hover:text-urumaya-terracotta
          "
        >
          {product.name}
        </h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-semibold text-urumaya-forest">
            {formatPrice(product.price)}
          </p>

          {product.originDistrict && (
            <span className="text-[11px] text-urumaya-ink/55">
              {product.originDistrict}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* =========================================
   PRODUCT SKELETON
========================================= */

function ProductSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="
        overflow-hidden rounded-[22px]
        border border-[#D9CBB5]/40
        bg-[#FAF1E2]
      "
    >
      <div
        className="
          shop-skeleton aspect-[3/2]
          rounded-[21px]
        "
      />

      <div className="space-y-3 p-4">
        <div className="shop-skeleton h-2 w-1/3 rounded" />
        <div className="shop-skeleton h-5 w-4/5 rounded" />
        <div className="shop-skeleton h-4 w-2/3 rounded" />
        <div className="shop-skeleton h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}

function ShopSort({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const options = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
  ];

  const selected =
    options.find((option) => option.value === value) ||
    options[0];

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

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
  }, [open]);

  return (
    <div
      ref={dropdownRef}
      className={`shop-custom-sort ${
        open ? "shop-custom-sort-open" : ""
      }`}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Sort products: ${selected.label}`}
        aria-expanded={open}
        aria-controls="shop-sort-options"
        onClick={() => setOpen((previous) => !previous)}
        className="shop-sort-trigger"
      >
        <SlidersHorizontal
          size={17}
          className="shop-sort-icon"
        />

        <span>{selected.label}</span>

        <ChevronDown
          size={17}
          className={`shop-custom-chevron ${
            open ? "shop-chevron-open" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="shop-sort-options"
          className="shop-sort-menu"
          role="group"
          aria-label="Sorting options"
        >
          <p className="shop-sort-menu-heading">
            Sort Collection
          </p>

          {options.map((option) => {
            const active = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                className={`shop-sort-option ${
                  active ? "shop-sort-option-active" : ""
                }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span>{option.label}</span>

                {active && <Check size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================
   SHOP PAGE
========================================= */

export default function Shop() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const category =
    searchParams.get("category") || "";

  const sort =
    searchParams.get("sort") || "newest";

  const search =
    searchParams.get("search") || "";

  const page = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10) || 1
  );

  const [searchInput, setSearchInput] =
    useState(search);

  const searchInputRef = useRef(null);

  const [categories, setCategories] = useState([
    {
      label: "All Collections",
      value: "",
    },
  ]);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const isTyping = searchInput.trim() !== search;

  /* =========================================
     LOAD CATEGORIES
  ========================================= */

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const result = await getCategories();

        if (!active) return;

        const dynamicCategories = (
          result.data || []
        ).map((item) => ({
          label: item.name,
          value: item.slug,
        }));

        setCategories([
          {
            label: "All Collections",
            value: "",
          },
          ...dynamicCategories,
        ]);
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================
     SYNCHRONIZE SEARCH INPUT
  ========================================= */

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  /* =========================================
     LIVE SEARCH - DEBOUNCE
  ========================================= */

  useEffect(() => {
    const keyword = searchInput.trim();

    if (keyword === search) return;

    const timeout = window.setTimeout(() => {
      setSearchParams(
        (previousParams) => {
          const next = new URLSearchParams(
            previousParams
          );

          if (keyword) {
            next.set("search", keyword);
          } else {
            next.delete("search");
          }

          next.delete("page");

          return next;
        },
        {
          replace: true,
          preventScrollReset: true,
        }
      );
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput, search, setSearchParams]);

  /* =========================================
     LOAD PRODUCTS
  ========================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const result = await getProducts({
          ...(category ? { category } : {}),
          ...(search ? { search } : {}),
          sort,
          page,
          limit: 12,
        });

        if (controller.signal.aborted) return;

        setProducts(result.data || []);
        setPagination(result.pagination || null);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(
          "Failed to load products:",
          err
        );

        setError(
          "We couldn't load the collection. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [category, search, sort, page, retryKey]);

  /* =========================================
     UPDATE FILTERS
  ========================================= */

  const updateFilters = (
    changes,
    replace = false
  ) => {
    setSearchParams(
      (previousParams) => {
        const next = new URLSearchParams(
          previousParams
        );

        Object.entries(changes).forEach(
          ([key, value]) => {
            if (value === "" || value === null) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
        );

        if (!("page" in changes)) {
          next.delete("page");
        }

        return next;
      },
      {
        replace,
        preventScrollReset: true,
      }
    );
  };

  /* =========================================
     CLEAR SEARCH
  ========================================= */

  const clearSearch = () => {
    setSearchInput("");

    updateFilters(
      {
        search: "",
      },
      true
    );

    searchInputRef.current?.focus();
  };

  const resetFilters = () => {
    setSearchInput("");

    setSearchParams(
      new URLSearchParams(),
      {
        preventScrollReset: true,
      }
    );
  };

  /* =========================================
     PAGINATION
  ========================================= */

  const changePage = (nextPage) => {
    updateFilters({
      page: nextPage,
    });

    document
      .getElementById("collection")
      ?.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "instant"
          : "smooth",
        block: "start",
      });
  };

  const productGridClass =
    "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <main
      className="
        urumaya-shop
        min-h-screen bg-[#F8EFDF]
        text-urumaya-ink
      "
    >
      {/* =====================================
          COLLECTION HERO
      ===================================== */}

      <section
        className="
          relative isolate overflow-hidden
          bg-urumaya-forest text-urumaya-ivory
        "
      >
        {/* Hero background */}

        <img
          src="/images/shop-hero.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="
            shop-hero-image
            absolute inset-0 h-full w-full
            object-cover object-[72%_center]
            md:object-center
          "
        />

        {/* Desktop overlay */}

        <div
          aria-hidden="true"
          className="
            absolute inset-0 hidden md:block
            bg-[linear-gradient(90deg,rgba(7,31,34,0.65)_0%,rgba(7,31,34,0.25)_40%,transparent_75%)]
          "
        />

        {/* Mobile overlay */}

        <div
          aria-hidden="true"
          className="
            absolute inset-0 md:hidden
            bg-gradient-to-t
            from-[#071F22] via-[#071F22]/60
            to-[#071F22]/10
          "
        />

      

        {/* Hero content */}

        <div
          className="
            relative mx-auto flex max-w-[1440px]
            min-h-[440px] items-end
            px-6 pb-16 pt-28
            sm:px-10
            md:min-h-[380px] md:items-center
            md:pb-12 md:pt-28
            lg:min-h-[420px] lg:px-20
          "
        >
          <div className="max-w-xl">
            <div
              className="
                shop-hero-eyebrow
                flex items-center gap-4
              "
            >
              <p
                className="
                  text-[11px] font-semibold uppercase
                  tracking-[0.2em] text-urumaya-gold
                  sm:text-xs
                "
              >
                Shop the Collection
              </p>

              <span
                className="
                  shop-hero-line
                  hidden h-px w-24
                  bg-gradient-to-r
                  from-urumaya-gold to-transparent
                  sm:block
                "
              />
            </div>

            <h1
              className="
                shop-hero-title
                mt-4 font-display
                text-[clamp(52px,5.5vw,88px)]
                leading-[0.98] tracking-tight
                text-urumaya-ivory
              "
            >
              Our Treasures
            </h1>

            <p
              className="
                shop-hero-description
                mt-5 max-w-[390px]
                text-sm leading-7
                text-urumaya-ivory/90
                sm:text-base
              "
            >
              Discover handcrafted pieces that
              celebrate Sri Lankan art, skill,
              and heritage.
            </p>
          </div>
        </div>

        {/* Curved bottom edge */}

        <svg
          viewBox="0 0 1440 50"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="
            pointer-events-none absolute
            -bottom-px left-0
            h-7 w-full sm:h-10
          "
        >
          <path
            d="M0 8C260 40 490 12 760 18C1050 22 1250 62 1440 22V50H0Z"
            fill="#F8EFDF"
          />
        </svg>
      </section>

      {/* =====================================
          SHOP COLLECTION
      ===================================== */}

      <section
        id="collection"
        className="
          relative isolate overflow-hidden
          scroll-mt-28
          bg-[radial-gradient(ellipse_at_top,#FFF9ED_0%,#F8EFDF_65%,#F3E7D2_100%)]
        "
      >
        {/* Botanical decorations */}

        <Botanical
          className="
            pointer-events-none absolute
            -left-10 top-5 w-28
            rotate-12 opacity-25
            sm:w-40
          "
        />

        <Botanical
          className="
            pointer-events-none absolute
            -right-10 top-8 w-28
            -scale-x-100 opacity-25
            sm:w-40
          "
        />

        <div
          className="
            relative mx-auto max-w-[1440px]
            px-6 pb-16 pt-5
            sm:px-10 lg:px-16 lg:pb-20
          "
        >
          {/* Gold lotus divider */}

          <Reveal>
            <LotusDivider />
          </Reveal>

          {/* =================================
              CATEGORY FILTERS
          ================================= */}

          <Reveal delay={80}>
            <nav
              aria-label="Product categories"
              className="
                mt-6 flex flex-wrap
                items-center justify-center
                gap-2.5 border-b
                border-urumaya-ink/15 pb-7
              "
            >
              {categories.map((item) => {
                const active =
                  category === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      updateFilters({
                        category: item.value,
                      })
                    }
                    className={`
                      shop-category-button
                      cursor-pointer rounded-full border
                      px-5 py-3 text-xs font-medium
                      sm:text-sm
                      ${
                        active
                          ? "shop-category-active border-[#123E32] bg-[#123E32] text-white shadow-sm"
                          : "border-[#D6C9B5] bg-white/10 text-urumaya-ink/80 hover:border-[#123E32] hover:bg-[#123E32]/5"
                      }
                    `}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </Reveal>

          {/* =================================
              RESULTS, SEARCH AND SORT
          ================================= */}

          <Reveal delay={120}>
            <div
              className="
                flex flex-col gap-4 py-5
                lg:flex-row lg:items-center
                lg:justify-between
              "
            >
              {/* Results count */}

              <p
                aria-live="polite"
                className="
                  flex items-center gap-2
                  text-sm text-urumaya-ink/70
                "
              >
                {loading && (
                  <Loader2
                    size={15}
                    className="shop-search-spinner"
                    aria-hidden="true"
                  />
                )}

                {isTyping
                  ? "Searching treasures..."
                  : loading
                    ? "Finding your treasures..."
                    : error
                      ? "Collection unavailable"
                      : `${pagination?.total ?? products.length} treasures found`}
              </p>

              <div
                className="
                  flex flex-col gap-3
                  sm:flex-row sm:items-center
                "
              >
                {/* Live search */}

                <form
                  role="search"
                  onSubmit={(event) => {
                    event.preventDefault();

                    updateFilters(
                      {
                        search: searchInput.trim(),
                      },
                      true
                    );
                  }}
                  className="
                    shop-search-field
                    flex min-w-0 items-center gap-3
                    rounded-full border border-[#D6C9B5]
                    bg-white/55 px-4 py-3
                    sm:w-[280px]
                  "
                >
                  <Search
                    size={18}
                    className="
                      shop-search-icon
                      shrink-0 text-urumaya-ink/45
                    "
                    aria-hidden="true"
                  />

                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchInput}
                    onChange={(event) =>
                      setSearchInput(
                        event.target.value
                      )
                    }
                    placeholder="Search treasures..."
                    aria-label="Search products"
                    autoComplete="off"
                    className="
                      min-w-0 flex-1 bg-transparent
                      text-sm outline-none
                      placeholder:text-urumaya-ink/40
                    "
                  />

                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      title="Clear search"
                      className="
                        shop-clear-search
                        flex h-6 w-6 shrink-0
                        cursor-pointer items-center
                        justify-center rounded-full
                        text-urumaya-ink/50
                        hover:bg-[#123E32]/10
                        hover:text-urumaya-forest
                      "
                    >
                      <X size={15} />
                    </button>
                  )}
                </form>

                {/* Custom sorting dropdown */}

                <ShopSort
                    value={sort}
                    onChange={(value) =>
                      updateFilters({
                         sort: value,
                     })
                    }
                />
              </div>
            </div>
          </Reveal>

          {/* =================================
              PRODUCT RESULTS
          ================================= */}

          <SlowLoadingNotice loading={loading} />
          <div aria-busy={loading}>
            {loading ? (
              /* LOADING STATE */

              <div
                className={`mt-4 ${productGridClass}`}
              >
                {Array.from({ length: 8 }).map(
                  (_, index) => (
                    <ProductSkeleton key={index} />
                  )
                )}
              </div>
            ) : error ? (
              /* ERROR STATE */

              <Reveal>
                <div className="py-24 text-center">
                  <Lotus className="mx-auto mb-5 w-14 text-[#B68A36]" />

                  <h3 className="font-display text-4xl">
                    A little interruption.
                  </h3>

                  <p
                    role="alert"
                    className="mt-3 text-sm text-urumaya-ink/60"
                  >
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setRetryKey((key) => key + 1)
                    }
                    className="
                      shop-action-button
                      mt-6 inline-flex cursor-pointer
                      items-center gap-2 rounded-full
                      bg-[#123E32] px-6 py-3
                      text-sm font-semibold text-white
                    "
                  >
                    <RefreshCw size={15} />
                    Try Again
                  </button>
                </div>
              </Reveal>
            ) : products.length === 0 ? (
              /* EMPTY STATE */

              <Reveal>
                <div className="py-24 text-center">
                  <Lotus className="mx-auto mb-5 w-14 text-[#B68A36]" />

                  <h3 className="font-display text-4xl">
                    No treasures found.
                  </h3>

                  <p className="mt-3 text-sm text-urumaya-ink/60">
                    {search
                      ? `No products match "${search}". Try another search term.`
                      : "Try another category or search term."}
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="
                      shop-action-button
                      mt-6 cursor-pointer rounded-full
                      bg-[#123E32] px-6 py-3
                      text-sm font-semibold text-white
                    "
                  >
                    View All Collections
                  </button>
                </div>
              </Reveal>
            ) : (
              <>
                {/* PRODUCT GRID */}

                <div
                  className={`mt-4 ${productGridClass}`}
                >
                  {products.map(
                    (product, index) => (
                      <Reveal
                        key={product._id}
                        delay={(index % 4) * 80}
                        className="h-full min-w-0"
                      >
                        <ProductCard
                          product={product}
                        />
                      </Reveal>
                    )
                  )}
                </div>

                {/* PAGINATION */}

                {pagination?.totalPages > 1 && (
                  <Reveal>
                    <div
                      className="
                        mt-12 flex flex-wrap
                        items-center justify-center gap-4
                      "
                    >
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                          changePage(page - 1)
                        }
                        className="
                          shop-pagination-button
                          cursor-pointer rounded-full
                          border border-[#D6C9B5]
                          px-5 py-3 text-xs
                          hover:border-[#123E32]
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        Previous
                      </button>

                      <span className="text-xs text-urumaya-ink/60">
                        Page {page} of{" "}
                        {pagination.totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={
                          page >= pagination.totalPages
                        }
                        onClick={() =>
                          changePage(page + 1)
                        }
                        className="
                          shop-pagination-button
                          cursor-pointer rounded-full
                          bg-[#123E32] px-5 py-3
                          text-xs text-white
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        Next
                      </button>
                    </div>
                  </Reveal>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* =====================================
          HERITAGE CLOSING SECTION
      ===================================== */}

      <section
        className="
          relative isolate overflow-hidden
          border-t border-[#B68A36]/20
          bg-[#F1E4CD]
          px-6 py-12 text-center sm:px-10
        "
      >
        <Botanical
          className="
            pointer-events-none absolute
            -bottom-14 -left-6
            w-44 opacity-20
          "
        />

        <Botanical
          className="
            pointer-events-none absolute
            -bottom-14 -right-6
            w-44 -scale-x-100 opacity-20
          "
        />

        <div className="relative mx-auto max-w-3xl">
          <Reveal>
            <LotusDivider />
          </Reveal>

          <Reveal delay={80}>
            <p
              className="
                mt-5 text-[10px] font-semibold
                uppercase tracking-[0.25em]
                text-urumaya-terracotta
              "
            >
              A Legacy Worth Keeping
            </p>
          </Reveal>

          <Reveal delay={160}>
            <h2
              className="
                mx-auto mt-4 max-w-2xl
                font-display text-4xl leading-tight
                text-urumaya-forest sm:text-5xl
              "
            >
              Crafted by Hands.
              Carried Through Generations.
            </h2>
          </Reveal>

          <Reveal delay={240}>
            <Link
              to="/stories"
              className="
                shop-action-button
                group mt-6 inline-flex
                items-center gap-3 rounded-full
                bg-[#123E32] px-6 py-3.5
                text-sm font-semibold text-white
              "
            >
              Discover Our Stories

              <ArrowUpRight
                size={17}
                className="shop-action-arrow"
              />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
