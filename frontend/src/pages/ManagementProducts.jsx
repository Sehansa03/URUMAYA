
import { useCallback, useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { getManagedProducts } from "../api/products";
import { useAuth } from "../context/AuthContext";

const categories = [
  { value: "", label: "All Categories" },
  { value: "pottery", label: "Pottery" },
  { value: "textiles", label: "Textiles" },
  { value: "masks", label: "Masks" },
  { value: "brassware", label: "Brassware" },
];

const statuses = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

const statusStyles = {
  draft: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price ?? 0);

export default function ManagementProducts() {
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const isAdmin = user?.role === "admin";

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getManagedProducts({
        page,
        limit: 10,
        ...(category && { category }),
        ...(status && { status }),
        ...(search && { search }),
      });

      setProducts(response.data || []);
      setPagination(
        response.pagination || {
          page: 1,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      console.error("Failed to load products:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [category, status, search, page]);

useEffect(() => {
  if (authLoading || !user) return;

  loadProducts();
}, [authLoading, user, loadProducts]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-7">

      {/* PAGE INTRODUCTION */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Artisan Collection
          </p>

          

          <p className="mt-2 max-w-xl text-sm leading-7 text-[#29251F]/60">
            {isAdmin
              ? "Manage the complete URUMAYA collection and review product submissions."
              : "Manage your artisan product submissions and track their approval status."}
          </p>
        </div>

        <button
          type="button"
          disabled
          title="Product submission form coming next"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-[#103D46] px-6 py-3 text-xs font-semibold text-white opacity-60"
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center gap-3 rounded-xl border border-[#103D46]/15 bg-white px-4"
          >
            <Search size={18} className="shrink-0 text-[#103D46]/50" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search products..."
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#29251F]/40"
            />

            <button
              type="submit"
              className="text-xs font-semibold text-[#B95035]"
            >
              Search
            </button>
          </form>

          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none"
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none"
          >
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadProducts}
            aria-label="Refresh products"
            title="Refresh products"
            className="flex items-center justify-center rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-[#103D46] transition hover:bg-[#103D46]/5"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white/85 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#103D46]/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-[#B95035]" />
            <h3 className="font-display text-2xl text-[#103D46]">
              Products
            </h3>
          </div>

          <span className="text-xs text-[#29251F]/50">
            {pagination.total} total
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#29251F]/55">
            Loading products...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <AlertCircle size={30} className="text-[#B95035]" />
            <p className="text-sm text-[#29251F]/70">
              {error}
            </p>
            <button
              type="button"
              onClick={loadProducts}
              className="rounded-full bg-[#103D46] px-6 py-2.5 text-xs font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <Package size={36} className="text-[#B95035]/60" />

            <h4 className="mt-5 font-display text-3xl text-[#103D46]">
              No products found
            </h4>

            <p className="mt-2 max-w-sm text-sm leading-7 text-[#29251F]/55">
              There are no products matching your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-[#103D46]/5">
                <tr className="text-[10px] uppercase tracking-[0.12em] text-[#29251F]/55">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Stock</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const approvalStatus =
                    product.approvalStatus || "pending";

                  return (
                    <tr
                      key={product._id}
                      className="border-t border-[#103D46]/10 transition hover:bg-[#F6EEDF]/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#E8D1B7]/50">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package
                                  size={22}
                                  className="text-[#103D46]/40"
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="max-w-[230px] font-medium text-[#103D46]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-[#29251F]/45">
                              {product.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm capitalize text-[#29251F]/70">
                        {product.category}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#103D46]">
                        {formatPrice(product.price)}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        <span
                          className={
                            product.stockQuantity <=
                            (product.lowStockThreshold ?? 5)
                              ? "font-semibold text-[#B95035]"
                              : "text-[#29251F]/70"
                          }
                        >
                          {product.stockQuantity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                            statusStyles[approvalStatus] ||
                            statusStyles.draft
                          }`}
                        >
                          {approvalStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#103D46]/10 px-6 py-4">
            <span className="text-xs text-[#29251F]/55">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
