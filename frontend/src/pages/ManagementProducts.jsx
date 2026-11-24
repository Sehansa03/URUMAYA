import { useCallback, useEffect, useState } from "react";

import {
  Package,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Archive,
  ArchiveRestore,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  getManagedProducts,
  archiveProduct,
  restoreProduct,
} from "../api/products";

import { getCategories } from "../api/categories";
import { useAuth } from "../context/AuthContext";

import AddProductForm from "./AddProductForm";
import ManagementProductDetails from "../components/ManagementProductDetails";

// ==========================================
// STATUS OPTIONS
// ==========================================

const statuses = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

const statusStyles = {
  draft: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-600",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price ?? 0);

const isProductArchived = (product) =>
  product.approvalStatus === "published" &&
  !product.isActive;

// ==========================================
// MANAGEMENT PRODUCTS
// ==========================================

export default function ManagementProducts() {
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user?.role === "admin";

  // Product state.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form and details state.
  const [showAddForm, setShowAddForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  // Archive and restore state.
  const [actionTarget, setActionTarget] =
    useState(null);

  const [actionType, setActionType] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [message, setMessage] = useState("");

  // Category state.
  const [categories, setCategories] = useState([
    { value: "", label: "All Categories" },
  ]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [categoriesError, setCategoriesError] =
    useState("");

  // Filters and pagination.
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [refreshKey, setRefreshKey] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const isRestoreAction = actionType === "restore";

  const ActionIcon = isRestoreAction
    ? ArchiveRestore
    : Archive;

  // ========================================
  // LOAD CATEGORIES
  // ========================================

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const response = await getCategories();

        if (!active) return;

        const dynamicCategories = (
          response.data || []
        ).map((item) => ({
          value: item.slug,
          label: item.name,
        }));

        setCategories([
          { value: "", label: "All Categories" },
          ...dynamicCategories,
        ]);
      } catch (err) {
        if (!active) return;

        console.error(
          "Failed to load categories:",
          err
        );

        setCategoriesError(
          "Unable to load categories."
        );
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  // ========================================
  // LOAD PRODUCTS
  // ========================================

  const loadProducts = useCallback(
    async (isActive = () => true) => {
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

        if (!isActive()) return;

        const nextPagination =
          response.pagination || {
            page: 1,
            total: 0,
            totalPages: 0,
          };

        if (
          page > 1 &&
          page > Math.max(
            1,
            nextPagination.totalPages
          )
        ) {
          setPage(
            Math.max(1, nextPagination.totalPages)
          );

          return;
        }

        setProducts(response.data || []);
        setPagination(nextPagination);
      } catch (err) {
        if (!isActive()) return;

        console.error(
          "Failed to load products:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      } finally {
        if (isActive()) {
          setLoading(false);
        }
      }
    },
    [category, status, search, page]
  );

  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;

    loadProducts(() => active);

    return () => {
      active = false;
    };
  }, [
    authLoading,
    user,
    loadProducts,
    refreshKey,
  ]);

  // ========================================
  // REFRESH PRODUCTS
  // ========================================

  const refreshProducts = () => {
    setRefreshKey((previous) => previous + 1);
  };

  // ========================================
  // SEARCH AND FILTERS
  // ========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
    setMessage("");
  };

  const clearFilters = () => {
    setCategory("");
    setStatus("");
    setSearch("");
    setSearchInput("");
    setPage(1);
    setMessage("");
  };

  const hasFilters = Boolean(
    category || status || search
  );

  // ========================================
  // ADD PRODUCT
  // ========================================

  const openAddForm = () => {
    setEditingProduct(null);
    setSelectedProduct(null);
    setMessage("");
    setActionError("");
    setShowAddForm(true);
  };

  // ========================================
  // EDIT PRODUCT
  // ========================================

  const openEdit = (product) => {
    if (isProductArchived(product)) return;

    setSelectedProduct(null);
    setEditingProduct(product);
    setMessage("");
    setActionError("");
    setShowAddForm(true);
  };

  const closeProductForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleProductCreated = (successMessage) => {
    setShowAddForm(false);
    setEditingProduct(null);

    setMessage(
      successMessage || "Product saved successfully."
    );

    setCategory("");
    setStatus("");
    setSearch("");
    setSearchInput("");
    setPage(1);

    refreshProducts();
  };

  // ========================================
  // OPEN ARCHIVE CONFIRMATION
  // ========================================

  const openArchive = (product) => {
    if (!isAdmin) return;

    if (
      product.approvalStatus !== "published" ||
      !product.isActive
    ) {
      return;
    }

    setSelectedProduct(null);
    setActionError("");
    setMessage("");
    setActionType("archive");
    setActionTarget(product);
  };

  // ========================================
  // OPEN RESTORE CONFIRMATION
  // ========================================

  const openRestore = (product) => {
    if (!isAdmin || !isProductArchived(product)) {
      return;
    }

    setSelectedProduct(null);
    setActionError("");
    setMessage("");
    setActionType("restore");
    setActionTarget(product);
  };

  // ========================================
  // CLOSE CONFIRMATION MODAL
  // ========================================

  const closeAction = () => {
    if (actionLoading) return;

    setActionTarget(null);
    setActionType("");
    setActionError("");
  };

  // ========================================
  // CONFIRM ARCHIVE OR RESTORE
  // ========================================

  const confirmAction = async () => {
    if (
      !isAdmin ||
      !actionTarget ||
      actionLoading ||
      !["archive", "restore"].includes(actionType)
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setMessage("");

      if (actionType === "restore") {
        await restoreProduct(actionTarget._id);

        setMessage(
          `"${actionTarget.name}" was restored successfully.`
        );
      } else {
        await archiveProduct(actionTarget._id);

        setMessage(
          `"${actionTarget.name}" was archived successfully.`
        );
      }

      setActionTarget(null);
      setActionType("");

      refreshProducts();
    } catch (err) {
      console.error(
        `Product ${actionType} failed:`,
        err
      );

      setActionError(
        err.response?.data?.message ||
          `Unable to ${actionType} product. Please try again.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // CATEGORY DISPLAY NAME
  // ========================================

  const getCategoryName = (categorySlug) => {
    const matchedCategory = categories.find(
      (item) => item.value === categorySlug
    );

    return (
      matchedCategory?.label ||
      categorySlug?.replace(/-/g, " ") ||
      "Uncategorized"
    );
  };

  // ========================================
  // ADD / EDIT PRODUCT FORM
  // ========================================

  if (showAddForm) {
    return (
      <AddProductForm
        key={editingProduct?._id || "new-product"}
        product={editingProduct}
        onCancel={closeProductForm}
        onSuccess={handleProductCreated}
      />
    );
  }

  // ========================================
  // MAIN PAGE
  // ========================================

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
              : "Manage the URUMAYA product collection and track product approval status."}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 rounded-full bg-[#103D46] px-6 py-3 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#B95035] hover:shadow-md"
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2
            size={19}
            className="shrink-0"
          />

          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
            className="ml-auto shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* FILTERS */}

      <div className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">

          {/* SEARCH */}

          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center gap-3 rounded-xl border border-[#103D46]/15 bg-white px-4"
          >
            <Search
              size={18}
              className="shrink-0 text-[#103D46]/50"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search products..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#29251F]/40"
            />

            <button
              type="submit"
              className="text-xs font-semibold text-[#B95035]"
            >
              Search
            </button>
          </form>

          {/* CATEGORY FILTER */}

          <div className="flex flex-col gap-1">
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
                setMessage("");
              }}
              disabled={
                categoriesLoading ||
                Boolean(categoriesError)
              }
              aria-label="Filter products by category"
              className="rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none disabled:opacity-60"
            >
              {categoriesLoading ? (
                <option value="">
                  Loading categories...
                </option>
              ) : categoriesError ? (
                <option value="">
                  Categories unavailable
                </option>
              ) : (
                categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))
              )}
            </select>

            {categoriesError && (
              <p
                role="alert"
                className="text-xs text-red-600"
              >
                {categoriesError}
              </p>
            )}
          </div>

          {/* STATUS FILTER */}

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
              setMessage("");
            }}
            aria-label="Filter products by status"
            className="rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none"
          >
            {statuses.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>

          {/* REFRESH */}

          <button
            type="button"
            onClick={refreshProducts}
            disabled={loading}
            aria-label="Refresh products"
            title="Refresh products"
            className="flex items-center justify-center rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-[#103D46] transition hover:bg-[#103D46]/5 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {hasFilters && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-[#29251F]/50">
              Showing filtered products
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B95035] hover:underline"
            >
              <X size={14} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* PRODUCTS TABLE */}

      <div className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white/85 shadow-sm">

        <div className="flex items-center justify-between border-b border-[#103D46]/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Package
              size={20}
              className="text-[#B95035]"
            />

            <h3 className="font-display text-2xl text-[#103D46]">
              Products
            </h3>
          </div>

          <span className="text-xs text-[#29251F]/50">
            {pagination.total} total
          </span>
        </div>

        {/* LOADING */}

        {loading || authLoading ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Loader2
              size={28}
              className="animate-spin text-[#B95035]"
            />

            <p className="text-sm text-[#29251F]/55">
              Loading products...
            </p>
          </div>

        ) : error ? (

          /* ERROR */

          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <AlertCircle
              size={30}
              className="text-[#B95035]"
            />

            <p className="text-sm text-[#29251F]/70">
              {error}
            </p>

            <button
              type="button"
              onClick={refreshProducts}
              className="rounded-full bg-[#103D46] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#B95035]"
            >
              Try Again
            </button>
          </div>

        ) : products.length === 0 ? (

          /* EMPTY STATE */

          <div className="flex flex-col items-center px-6 py-20 text-center">
            <Package
              size={36}
              className="text-[#B95035]/60"
            />

            <h4 className="mt-5 font-display text-3xl text-[#103D46]">
              No products found
            </h4>

            <p className="mt-2 max-w-sm text-sm leading-7 text-[#29251F]/55">
              {hasFilters
                ? "There are no products matching your current filters."
                : "There are no products in the collection yet."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full border border-[#103D46]/20 px-6 py-3 text-xs font-semibold text-[#103D46] transition hover:bg-[#103D46]/5"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#103D46] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#B95035]"
              >
                <Plus size={16} />
                Add Product
              </button>
            )}
          </div>

        ) : (

          /* PRODUCT TABLE */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">

              <thead className="bg-[#103D46]/5">
                <tr className="text-[10px] uppercase tracking-[0.12em] text-[#29251F]/55">

                  <th className="px-6 py-4 font-semibold">
                    Product
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Category
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Price
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Stock
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#103D46]/10">
                {products.map((product) => {
                  const image = product.images?.[0];

                  const isArchived =
                    isProductArchived(product);

                  const approvalStatus = isArchived
                    ? "archived"
                    : product.approvalStatus || "pending";

                  const stock =
                    product.stockQuantity ?? 0;

                  const lowStockThreshold =
                    product.lowStockThreshold ?? 5;

                  const isOutOfStock = stock === 0;

                  const isLowStock =
                    stock > 0 &&
                    stock <= lowStockThreshold;

                  return (
                    <tr
                      key={product._id}
                      className="transition-colors hover:bg-[#F6EEDF]/40"
                    >

                      {/* PRODUCT INFORMATION */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">

                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6EEDF]">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package
                                size={24}
                                className="text-[#103D46]/35"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProduct(product)
                              }
                              className="max-w-[230px] text-left text-sm font-semibold leading-5 text-[#103D46] transition hover:text-[#B95035]"
                            >
                              {product.name}
                            </button>

                            <p className="mt-1 text-xs text-[#29251F]/45">
                              {product.sku || "No SKU"}
                            </p>

                            {product.isFeatured && (
                              <span className="mt-2 inline-block rounded-full bg-[#E6AD51]/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#987035]">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4">
                        <span className="text-sm capitalize text-[#29251F]/70">
                          {getCategoryName(
                            product.category
                          )}
                        </span>
                      </td>

                      {/* PRICE */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="text-sm font-semibold text-[#103D46]">
                          {formatPrice(product.price)}
                        </span>
                      </td>

                      {/* STOCK */}

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="text-sm font-semibold text-[#103D46]">
                            {stock} units
                          </span>

                          {isArchived ? (
                            <span className="text-[10px] font-medium text-slate-500">
                              Inactive
                            </span>
                          ) : isOutOfStock ? (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-medium text-red-700">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-medium text-amber-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-700">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold capitalize ${
                            statusStyles[approvalStatus] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {approvalStatus}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProduct(product)
                            }
                            title="View product"
                            aria-label={`View ${product.name}`}
                            className="rounded-lg border border-[#103D46]/15 p-2.5 text-[#103D46] transition hover:border-[#103D46]/30 hover:bg-[#103D46]/5"
                          >
                            <Eye size={16} />
                          </button>

                          {/* EDIT */}

                          {!isArchived && (
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(product)
                              }
                              title="Edit product"
                              aria-label={`Edit ${product.name}`}
                              className="rounded-lg border border-[#103D46]/15 p-2.5 text-[#103D46] transition hover:border-[#103D46]/30 hover:bg-[#103D46]/5"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          {/* ARCHIVE - ADMIN ONLY */}

                          {isAdmin &&
                            product.approvalStatus ===
                              "published" &&
                            product.isActive && (
                              <button
                                type="button"
                                onClick={() =>
                                  openArchive(product)
                                }
                                title="Archive product"
                                aria-label={`Archive ${product.name}`}
                                className="rounded-lg border border-[#B95035]/20 p-2.5 text-[#B95035] transition hover:border-[#B95035]/40 hover:bg-[#B95035]/10"
                              >
                                <Archive size={16} />
                              </button>
                            )}

                          {/* RESTORE - ADMIN ONLY */}

                          {isAdmin && isArchived && (
                            <button
                              type="button"
                              onClick={() =>
                                openRestore(product)
                              }
                              title="Restore product"
                              aria-label={`Restore ${product.name}`}
                              className="rounded-lg border border-emerald-600/20 p-2.5 text-emerald-700 transition hover:border-emerald-600/40 hover:bg-emerald-50"
                            >
                              <ArchiveRestore size={16} />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}

        {!loading &&
          !error &&
          pagination.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#103D46]/10 px-6 py-5">

              <p className="text-xs text-[#29251F]/55">
                Showing{" "}
                <span className="font-semibold text-[#103D46]">
                  {(page - 1) * 10 + 1}
                </span>
                {" - "}
                <span className="font-semibold text-[#103D46]">
                  {Math.min(
                    page * 10,
                    pagination.total
                  )}
                </span>
                {" of "}
                <span className="font-semibold text-[#103D46]">
                  {pagination.total}
                </span>
                {" products"}
              </p>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((previous) =>
                      Math.max(1, previous - 1)
                    )
                  }
                  aria-label="Previous page"
                  title="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#103D46]/15 text-[#103D46] transition hover:bg-[#103D46]/5 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="whitespace-nowrap text-xs font-medium text-[#103D46]">
                  Page {page} of{" "}
                  {Math.max(
                    1,
                    pagination.totalPages
                  )}
                </span>

                <button
                  type="button"
                  disabled={
                    page >= pagination.totalPages
                  }
                  onClick={() =>
                    setPage((previous) =>
                      Math.min(
                        pagination.totalPages,
                        previous + 1
                      )
                    )
                  }
                  aria-label="Next page"
                  title="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#103D46]/15 text-[#103D46] transition hover:bg-[#103D46]/5 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronRight size={18} />
                </button>

              </div>
            </div>
          )}
      </div>

      {/* PRODUCT DETAILS MODAL */}

      {selectedProduct && (
        <ManagementProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={openEdit}
          onArchive={openArchive}
          onRestore={openRestore}
          isAdmin={isAdmin}
        />
      )}

      {/* ARCHIVE / RESTORE CONFIRMATION MODAL */}

      {actionTarget && isAdmin && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071F22]/75 p-4 backdrop-blur-sm"
          onClick={closeAction}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="action-title"
            aria-describedby="action-description"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#E6AD51]/20 bg-[#F6EEDF] p-7 text-center shadow-2xl sm:p-9"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ICON */}

            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                isRestoreAction
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#B95035]/10 text-[#B95035]"
              }`}
            >
              <ActionIcon
                size={30}
                strokeWidth={1.5}
              />
            </div>

            {/* HEADING */}

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
              URUMAYA / Collection Management
            </p>

            <h3
              id="action-title"
              className="mt-3 font-display text-3xl text-[#103D46]"
            >
              {isRestoreAction
                ? "Restore This Product?"
                : "Archive This Product?"}
            </h3>

            {/* PRODUCT PREVIEW */}

            <div className="mt-5 flex items-center gap-4 rounded-xl border border-[#103D46]/10 bg-white/65 p-3 text-left">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F6EEDF]">
                {actionTarget.images?.[0] ? (
                  <img
                    src={actionTarget.images[0]}
                    alt={actionTarget.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package
                    size={23}
                    className="text-[#103D46]/40"
                  />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-[#103D46]">
                  {actionTarget.name}
                </p>

                <p className="mt-1 text-xs text-[#29251F]/50">
                  {actionTarget.sku}
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}

            <p
              id="action-description"
              className="mt-5 text-sm leading-7 text-[#29251F]/65"
            >
              {isRestoreAction
                ? "This product will become visible in the public storefront and active inventory again. Its existing information, stock quantity and order history will be preserved."
                : "This product will be removed from the public storefront and active inventory. Existing order history and product records will be preserved."}
            </p>

            {/* ERROR */}

            {actionError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-left text-xs text-red-700"
              >
                <AlertCircle
                  size={16}
                  className="shrink-0"
                />

                <span>{actionError}</span>
              </div>
            )}

            {/* ACTION BUTTONS */}

            <div className="mt-7 flex flex-wrap justify-center gap-3">

              <button
                type="button"
                disabled={actionLoading}
                onClick={closeAction}
                className="rounded-full border border-[#103D46]/20 px-6 py-3 text-xs font-semibold text-[#103D46] transition hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmAction}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isRestoreAction
                    ? "bg-[#103D46] hover:bg-[#082D34]"
                    : "bg-[#B95035] hover:bg-[#9C402A]"
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    {isRestoreAction
                      ? "Restoring..."
                      : "Archiving..."}
                  </>
                ) : (
                  <>
                    <ActionIcon size={16} />

                    {isRestoreAction
                      ? "Restore Product"
                      : "Archive Product"}
                  </>
                )}
              </button>

            </div>
          </section>
        </div>
      )}
    </div>
  );
}