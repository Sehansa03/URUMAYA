
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, ArrowUpRight, RefreshCw } from "lucide-react";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";


const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group block min-w-0"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#E9E1D5]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-urumaya-ink/40">
            Image coming soon
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute left-4 top-4 rounded-full bg-urumaya-ivory/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-urumaya-forest">
            Artisan Pick
          </span>
        )}

        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-urumaya-forest">
              Sold Out
            </span>
          </div>
        )}

        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-urumaya-ivory text-urumaya-forest shadow-lg transition-all group-hover:-translate-y-1 group-hover:bg-urumaya-terracotta group-hover:text-white">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="px-1 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-urumaya-terracotta">
          {product.category}
        </p>

        <h3 className="mt-2 font-display text-[25px] leading-tight text-urumaya-ink transition-colors group-hover:text-urumaya-terracotta">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-urumaya-forest">
            {formatPrice(product.price)}
          </p>

          {product.originDistrict && (
            <span className="text-[11px] text-urumaya-ink/50">
              {product.originDistrict}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";
  const page = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10) || 1
  );

  const [searchInput, setSearchInput] = useState(search);
  const [categories, setCategories] = useState([
  { label: "All Collections", value: "" },
]);

useEffect(() => {
  let active = true;

  async function loadCategories() {
    try {
      const result = await getCategories();

      if (!active) return;

      const dynamicCategories = (result.data || []).map((item) => ({
        label: item.name,
        value: item.slug,
      }));

      setCategories([
        { label: "All Collections", value: "" },
        ...dynamicCategories,
      ]);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  loadCategories();

  return () => {
    active = false;
  };
}, []);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

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

        console.error("Failed to load products:", err);
        setError("We couldn't load the collection. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [category, search, sort, page]);

  const updateFilters = (changes) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value === null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (!("page" in changes)) {
      next.delete("page");
    }

    setSearchParams(next);
  };

  return (
    <main className="min-h-screen bg-urumaya-ivory text-urumaya-ink">
      {/* COLLECTION INTRO */}
      <section className="relative overflow-hidden bg-urumaya-forest px-6 pb-20 pt-20 text-urumaya-ivory sm:px-10 lg:pb-24">
        <div className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-[#1D6257]/35 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-urumaya-gold">
            Handcrafted with Heritage
          </p>

          <h1 className="max-w-3xl font-display text-[clamp(56px,8vw,112px)] leading-[0.9] tracking-tight">
            The Collection<span className="text-urumaya-gold">.</span>
          </h1>

          <p className="mt-7 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
            Thoughtfully curated treasures, shaped by tradition
            and brought to life by the artistry of Sri Lanka.
          </p>

          <div className="mt-10 h-px w-full bg-white/15" />

          <div className="mt-5 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-white/55">
            <span>URUMAYA / Shop</span>
            <span>Rooted in Heritage</span>
          </div>
        </div>
      </section>

      {/* SHOP CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:py-20">
        <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="font-display text-2xl text-urumaya-terracotta">
              Discover the Art of Living
            </p>
            <h2 className="mt-1 font-display text-5xl leading-none sm:text-6xl">
              Curated Treasures
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-urumaya-ink/60">
            Each piece carries a story of skill, culture,
            and craftsmanship worth preserving.
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="border-y border-urumaya-ink/15 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => {
                const active = category === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      updateFilters({ category: item.value })
                    }
                    className={`rounded-full border px-4 py-2.5 text-xs font-medium transition-all ${
                      active
                        ? "border-urumaya-forest bg-urumaya-forest text-white"
                        : "border-urumaya-ink/20 text-urumaya-ink/70 hover:border-urumaya-forest hover:text-urumaya-forest"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateFilters({ search: searchInput.trim() });
                }}
                className="flex items-center gap-2 rounded-full border border-urumaya-ink/20 bg-white/50 px-4 py-2.5"
              >
                <Search size={16} className="text-urumaya-ink/50" />

                <input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Search treasures..."
                  aria-label="Search products"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-urumaya-ink/40 sm:w-40"
                />

                <button
                  type="submit"
                  className="text-xs font-semibold text-urumaya-terracotta"
                >
                  Go
                </button>
              </form>

              <div className="flex items-center gap-2 rounded-full border border-urumaya-ink/20 px-4 py-2.5">
                <SlidersHorizontal
                  size={15}
                  className="text-urumaya-ink/50"
                />

                <select
                  value={sort}
                  onChange={(event) =>
                    updateFilters({ sort: event.target.value })
                  }
                  aria-label="Sort products"
                  className="bg-transparent text-xs outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-xs text-urumaya-ink/60">
            {loading
              ? "Finding your treasures..."
              : `${pagination?.total ?? products.length} treasures found`}
          </p>

          <span className="text-[10px] uppercase tracking-[0.2em] text-urumaya-terracotta">
            Made with Meaning
          </span>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] rounded-[22px] bg-[#E6DED1]" />
                <div className="mt-4 h-4 w-2/3 rounded bg-[#E6DED1]" />
                <div className="mt-3 h-3 w-1/3 rounded bg-[#E6DED1]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <h3 className="font-display text-4xl">
              A little interruption.
            </h3>
            <p className="mt-3 text-sm text-urumaya-ink/60">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-urumaya-forest px-6 py-3 text-xs font-semibold text-white"
            >
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="font-display text-4xl">
              No treasures found.
            </h3>
            <p className="mt-3 text-sm text-urumaya-ink/60">
              Try another category or search term.
            </p>
            <button
              onClick={() =>
                setSearchParams(new URLSearchParams())
              }
              className="mt-6 rounded-full bg-urumaya-forest px-6 py-3 text-xs font-semibold text-white"
            >
              View All Collections
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>

            {pagination?.totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() =>
                    updateFilters({ page: page - 1 })
                  }
                  className="rounded-full border border-urumaya-ink/20 px-5 py-3 text-xs disabled:opacity-30"
                >
                  Previous
                </button>

                <span className="text-xs text-urumaya-ink/60">
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() =>
                    updateFilters({ page: page + 1 })
                  }
                  className="rounded-full bg-urumaya-forest px-5 py-3 text-xs text-white disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CLOSING MESSAGE */}
      <section className="bg-urumaya-forest px-6 py-16 text-center text-urumaya-ivory sm:px-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-urumaya-gold">
          A Legacy Worth Keeping
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          Crafted by Hands. Carried Through Generations.
        </h2>

        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-3 border-b border-urumaya-gold pb-2 text-xs text-urumaya-gold"
        >
          Discover Our Story <ArrowUpRight size={15} />
        </Link>
      </section>
    </main>
  );
}
