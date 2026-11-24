
import { useEffect, useState } from "react";
import {
  Boxes,
  Package,
  AlertTriangle,
  PackageX,
  Search,
  Plus,
  Minus,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import api from "../api/client";

const PAGE_SIZE = 10;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-LK");

const getStockStatus = (product) => {
  if (product.stockQuantity === 0) {
    return {
      label: "Out of Stock",
      classes: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (
    product.stockQuantity <= product.lowStockThreshold
  ) {
    return {
      label: "Low Stock",
      classes:
        "bg-amber-50 text-amber-800 border-amber-200",
    };
  }

  return {
    label: "In Stock",
    classes:
      "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
};

const filterOptions = [
  { value: "all", label: "All Products" },
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#29251F]/60">
          {title}
        </p>

        <Icon
          size={20}
          strokeWidth={1.8}
          className="text-[#B95035]"
        />
      </div>

      <p className="mt-5 text-3xl font-semibold text-[#103D46]">
        {formatNumber(value)}
      </p>
    </div>
  );
}

export default function ManagementInventory() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedProduct, setSelectedProduct] =
    useState(null);
  const [adjustmentType, setAdjustmentType] =
    useState("add");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // ==========================================
  // LOAD INVENTORY
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadInventory = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          "/products/manage/inventory",
          {
            params: {
              page,
              limit: PAGE_SIZE,
              status,
              ...(search ? { search } : {}),
            },
          }
        );

        if (!cancelled) {
          const data = response.data.data;

          setProducts(data.products || []);
          setSummary(data.summary);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Inventory load error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load inventory."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, [page, search, status, refreshKey]);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
    setSuccess("");
  };

  const handleFilter = (value) => {
    setStatus(value);
    setPage(1);
    setSuccess("");
  };

  const refreshInventory = () => {
    setRefreshKey((previous) => previous + 1);
  };

  // ==========================================
  // OPEN ADJUSTMENT MODAL
  // ==========================================

  const openAdjustment = (product) => {
    setSelectedProduct(product);
    setAdjustmentType("add");
    setQuantity("");
    setModalError("");
    setSuccess("");
  };

  const closeAdjustment = () => {
    if (saving) return;

    setSelectedProduct(null);
    setQuantity("");
    setModalError("");
  };

  // ==========================================
  // SAVE STOCK ADJUSTMENT
  // ==========================================

  const handleSaveAdjustment = async (event) => {
    event.preventDefault();

    if (!selectedProduct || saving) return;

    const parsedQuantity = Number(quantity);

    if (
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 100000
    ) {
      setModalError(
        "Enter a whole number between 1 and 100000."
      );
      return;
    }

    if (
      adjustmentType === "remove" &&
      parsedQuantity > selectedProduct.stockQuantity
    ) {
      setModalError(
        "You cannot remove more than the available stock."
      );
      return;
    }

    const adjustment =
      adjustmentType === "add"
        ? parsedQuantity
        : -parsedQuantity;

    try {
      setSaving(true);
      setModalError("");

      await api.patch(
        `/products/manage/inventory/${selectedProduct._id}/adjust`,
        { adjustment }
      );

      setSelectedProduct(null);
      setQuantity("");

      setSuccess(
        `Stock updated successfully for ${selectedProduct.name}.`
      );

      refreshInventory();
    } catch (err) {
      console.error("Stock adjustment error:", err);

      setModalError(
        err.response?.data?.message ||
          "Unable to update stock."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ======================================
          INTRODUCTION
      ====================================== */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Stock Management
          </p>

          <h2 className="mt-2 font-display text-3xl text-[#103D46]">
            Inventory Overview
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#29251F]/60">
            Monitor product availability and manage stock
            quantities.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshInventory}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm font-medium text-[#103D46] transition hover:bg-[#103D46]/5 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Products"
          value={summary.totalProducts}
          icon={Package}
        />

        <SummaryCard
          title="Total Stock Units"
          value={summary.totalUnits}
          icon={Boxes}
        />

        <SummaryCard
          title="Low Stock"
          value={summary.lowStock}
          icon={AlertTriangle}
        />

        <SummaryCard
          title="Out of Stock"
          value={summary.outOfStock}
          icon={PackageX}
        />
      </div>

      {/* ======================================
          FEEDBACK
      ====================================== */}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* ======================================
          INVENTORY TABLE
      ====================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white/80 shadow-sm">
        <div className="border-b border-[#103D46]/10 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-3xl text-[#103D46]">
                Product Inventory
              </h3>

              <p className="mt-1 text-xs text-[#29251F]/50">
                Published products and their stock levels
              </p>
            </div>

            <span className="text-xs text-[#29251F]/50">
              {formatNumber(pagination.total)} products
            </span>
          </div>

          {/* SEARCH */}

          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#29251F]/40"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search by product name or SKU..."
                maxLength={100}
                className="w-full rounded-xl border border-[#103D46]/15 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#103D46]"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#103D46] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#16515B]"
            >
              Search
            </button>
          </form>

          {/* FILTERS */}

          <div className="mt-5 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFilter(option.value)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                  status === option.value
                    ? "border-[#103D46] bg-[#103D46] text-white"
                    : "border-[#103D46]/15 bg-white text-[#103D46] hover:bg-[#103D46]/5"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[#103D46]/5">
              <tr className="text-[11px] uppercase tracking-wider text-[#29251F]/55">
                <th className="px-6 py-4 font-medium">
                  Product
                </th>

                <th className="px-6 py-4 font-medium">
                  SKU
                </th>

                <th className="px-6 py-4 font-medium">
                  Stock
                </th>

                <th className="px-6 py-4 font-medium">
                  Status
                </th>

                <th className="px-6 py-4 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#103D46]/10">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center text-sm text-[#29251F]/50"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center text-sm text-[#29251F]/50"
                  >
                    No products match your search or filter.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockStatus =
                    getStockStatus(product);

                  return (
                    <tr
                      key={product._id}
                      className="transition hover:bg-[#F6EEDF]/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F6EEDF]">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package
                                size={20}
                                className="text-[#103D46]/40"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[210px] truncate text-sm font-medium text-[#103D46]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-[#29251F]/45">
                              Threshold:{" "}
                              {formatNumber(
                                product.lowStockThreshold
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-[#29251F]/65">
                        {product.sku}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-[#103D46]">
                        {formatNumber(
                          product.stockQuantity
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${stockStatus.classes}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openAdjustment(product)
                          }
                          className="rounded-lg border border-[#103D46]/15 px-4 py-2 text-xs font-medium text-[#103D46] transition hover:bg-[#103D46] hover:text-white"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#103D46]/10 px-6 py-5">
          <p className="text-xs text-[#29251F]/55">
            Page {pagination.page} of{" "}
            {Math.max(1, pagination.totalPages)}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={loading || page <= 1}
              aria-label="Previous page"
              className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) => current + 1)
              }
              disabled={
                loading ||
                page >= pagination.totalPages
              }
              aria-label="Next page"
              className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================
          STOCK ADJUSTMENT MODAL
      ====================================== */}

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="adjust-stock-title"
            className="w-full max-w-md rounded-2xl bg-[#F6EEDF] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B95035]">
                  Inventory Adjustment
                </p>

                <h3
                  id="adjust-stock-title"
                  className="mt-2 font-display text-3xl text-[#103D46]"
                >
                  Adjust Stock
                </h3>
              </div>

              <button
                type="button"
                onClick={closeAdjustment}
                disabled={saving}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-[#103D46] hover:bg-[#103D46]/10"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-4 text-sm font-medium text-[#29251F]">
              {selectedProduct.name}
            </p>

            <p className="mt-1 text-xs text-[#29251F]/55">
              Current stock:{" "}
              {formatNumber(
                selectedProduct.stockQuantity
              )}{" "}
              units
            </p>

            <form
              onSubmit={handleSaveAdjustment}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-2 block text-xs font-medium text-[#29251F]/70">
                  Adjustment Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType("add");
                      setModalError("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                      adjustmentType === "add"
                        ? "border-[#103D46] bg-[#103D46] text-white"
                        : "border-[#103D46]/15 bg-white text-[#103D46]"
                    }`}
                  >
                    <Plus size={16} />
                    Add Stock
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType("remove");
                      setModalError("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                      adjustmentType === "remove"
                        ? "border-[#B95035] bg-[#B95035] text-white"
                        : "border-[#103D46]/15 bg-white text-[#103D46]"
                    }`}
                  >
                    <Minus size={16} />
                    Remove Stock
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="stock-adjustment-quantity"
                  className="mb-2 block text-xs font-medium text-[#29251F]/70"
                >
                  Quantity
                </label>

                <input
                  id="stock-adjustment-quantity"
                  type="number"
                  min="1"
                  max="100000"
                  step="1"
                  required
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#103D46]"
                />
              </div>

              {quantity &&
                Number.isSafeInteger(Number(quantity)) &&
                Number(quantity) > 0 && (
                  <div className="rounded-xl bg-white/70 p-4">
                    <p className="text-xs text-[#29251F]/55">
                      Expected new stock
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-[#103D46]">
                      {formatNumber(
                        selectedProduct.stockQuantity +
                          (adjustmentType === "add"
                            ? Number(quantity)
                            : -Number(quantity))
                      )}
                    </p>
                  </div>
                )}

              {modalError && (
                <p
                  role="alert"
                  className="text-sm text-red-700"
                >
                  {modalError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAdjustment}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-[#103D46]/20 bg-white px-4 py-3 text-sm font-medium text-[#103D46]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#103D46] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#16515B] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
