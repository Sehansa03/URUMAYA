
import { useCallback, useEffect, useState } from "react";
import {
  ClipboardCheck,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";

import {
  getManagedProducts,
  approveProduct,
  rejectProduct,
} from "../api/products";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price ?? 0);

export default function ManagementApprovals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [processingId, setProcessingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Custom confirmation message box
  const [confirmation, setConfirmation] = useState(null);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  // ==========================================
  // LOAD PENDING PRODUCTS
  // ==========================================

  const loadPendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getManagedProducts({
        status: "pending",
        page,
        limit: 10,
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
      console.error("Failed to load approvals:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load pending products."
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPendingProducts();
  }, [loadPendingProducts]);

  // ==========================================
  // OPEN CONFIRMATION MODAL
  // ==========================================

  const handleDecision = (product, decision) => {
    if (processingId) return;

    setConfirmation({
      product,
      decision,
    });
  };

  // ==========================================
  // CONFIRM APPROVE / REJECT
  // ==========================================

  const confirmDecision = async () => {
    if (!confirmation || processingId) return;

    const { product, decision } = confirmation;

    try {
      setProcessingId(product._id);
      setError("");
      setMessage("");

      if (decision === "approve") {
        await approveProduct(product._id);
      } else {
        await rejectProduct(product._id);
      }

      setMessage(
        `"${product.name}" was ${
          decision === "approve" ? "approved" : "rejected"
        } successfully.`
      );

      setConfirmation(null);
      setSelectedProduct(null);

      // Reload pending products after approval/rejection
      if (products.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadPendingProducts();
      }
    } catch (err) {
      console.error("Approval action failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update product approval status."
      );

      setConfirmation(null);
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // CLOSE CONFIRMATION
  // ==========================================

  const closeConfirmation = () => {
    if (processingId) return;

    setConfirmation(null);
  };

  return (
    <div className="space-y-7">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Collection Review
          </p>

          <h2 className="mt-2 font-display text-3xl text-[#103D46]">
            Product Approvals
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#29251F]/60">
            Review artisan submissions before they become
            available in the URUMAYA storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPendingProducts}
          disabled={loading || Boolean(processingId)}
          className="inline-flex items-center gap-2 rounded-full border border-[#103D46]/15 bg-white px-5 py-3 text-xs font-semibold text-[#103D46] transition hover:bg-[#103D46]/5 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {message && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
        >
          <Check size={18} />
          {message}
        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* ======================================
          PENDING PRODUCTS LIST
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white/85 shadow-sm">

        {/* LIST HEADER */}

        <div className="flex items-center justify-between border-b border-[#103D46]/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <ClipboardCheck
              size={20}
              className="text-[#B95035]"
            />

            <h3 className="font-display text-2xl text-[#103D46]">
              Pending Submissions
            </h3>
          </div>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {pagination.total} Pending
          </span>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-sm text-[#29251F]/60">
            <Loader2
              size={20}
              className="animate-spin"
            />
            Loading submissions...
          </div>
        ) : error && products.length === 0 ? (
          <div className="px-6 py-20 text-center text-sm text-[#29251F]/60">
            Unable to load submissions. Please try refreshing.
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <ClipboardCheck
              size={38}
              className="text-[#B95035]/60"
            />

            <h4 className="mt-5 font-display text-3xl text-[#103D46]">
              All Caught Up
            </h4>

            <p className="mt-2 text-sm text-[#29251F]/60">
              There are no pending products to review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#103D46]/10">

            {products.map((product) => (
              <div
                key={product._id}
                className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6"
              >

                {/* PRODUCT IMAGE */}

                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#E8D1B7]/40">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ClipboardCheck
                        size={25}
                        className="text-[#103D46]/40"
                      />
                    </div>
                  )}
                </div>

                {/* PRODUCT INFORMATION */}

                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-[#103D46]">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs capitalize text-[#29251F]/50">
                    {product.sku} · {product.category}
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#103D46]">
                    {formatPrice(product.price)}
                  </p>

                  <p className="mt-1 text-xs text-[#29251F]/50">
                    Stock: {product.stockQuantity}
                  </p>
                </div>

                {/* ACTION BUTTONS */}

                <div className="flex flex-wrap items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProduct(product)
                    }
                    disabled={Boolean(processingId)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#103D46]/20 px-4 py-2.5 text-xs font-semibold text-[#103D46] transition hover:bg-[#103D46]/5 disabled:opacity-50"
                  >
                    <Eye size={15} />
                    Review
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDecision(product, "approve")
                    }
                    disabled={Boolean(processingId)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#103D46] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#15525C] disabled:opacity-50"
                  >
                    <Check size={15} />
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDecision(product, "reject")
                    }
                    disabled={Boolean(processingId)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#B95035]/30 px-4 py-2.5 text-xs font-semibold text-[#B95035] transition hover:bg-[#B95035]/10 disabled:opacity-50"
                  >
                    <X size={15} />
                    Reject
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====================================
            PAGINATION
        ==================================== */}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#103D46]/10 px-6 py-4">

            <span className="text-xs text-[#29251F]/55">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <div className="flex gap-2">

              <button
                type="button"
                disabled={
                  page <= 1 || Boolean(processingId)
                }
                onClick={() =>
                  setPage((previous) => previous - 1)
                }
                className="rounded-lg border border-[#103D46]/15 px-4 py-2 text-sm disabled:opacity-30"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= pagination.totalPages ||
                  Boolean(processingId)
                }
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
                className="rounded-lg border border-[#103D46]/15 px-4 py-2 text-sm disabled:opacity-30"
              >
                Next
              </button>

            </div>
          </div>
        )}
      </div>

      {/* ======================================
          PRODUCT REVIEW MODAL
      ====================================== */}

      {selectedProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (!processingId && !confirmation) {
              setSelectedProduct(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Review product"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#F6EEDF] p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >

            {/* REVIEW HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B95035]">
                  Product Review
                </p>

                <h3 className="mt-2 font-display text-3xl text-[#103D46]">
                  {selectedProduct.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                disabled={Boolean(processingId)}
                aria-label="Close review"
                className="rounded-full p-2 text-[#103D46] hover:bg-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* PRODUCT IMAGES */}

            {selectedProduct.images?.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedProduct.images.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`${selectedProduct.name} ${index + 1}`}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            )}

            {/* PRODUCT DETAILS */}

            <div className="mt-6 space-y-5 text-sm">

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs text-[#29251F]/50">
                    Category
                  </p>

                  <p className="mt-1 capitalize text-[#103D46]">
                    {selectedProduct.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#29251F]/50">
                    Price
                  </p>

                  <p className="mt-1 text-[#103D46]">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#29251F]/50">
                    SKU
                  </p>

                  <p className="mt-1 text-[#103D46]">
                    {selectedProduct.sku}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#29251F]/50">
                    Available Stock
                  </p>

                  <p className="mt-1 text-[#103D46]">
                    {selectedProduct.stockQuantity}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#29251F]/50">
                    Artisan
                  </p>

                  <p className="mt-1 text-[#103D46]">
                    {selectedProduct.artisanName ||
                      "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#29251F]/50">
                    Origin District
                  </p>

                  <p className="mt-1 text-[#103D46]">
                    {selectedProduct.originDistrict ||
                      "Not provided"}
                  </p>
                </div>

              </div>

              {/* DESCRIPTION */}

              <div>
                <p className="text-xs font-semibold text-[#103D46]">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap leading-7 text-[#29251F]/70">
                  {selectedProduct.description}
                </p>
              </div>

              {/* HERITAGE STORY */}

              {selectedProduct.heritageStory && (
                <div>
                  <p className="text-xs font-semibold text-[#103D46]">
                    Heritage Story
                  </p>

                  <p className="mt-2 whitespace-pre-wrap leading-7 text-[#29251F]/70">
                    {selectedProduct.heritageStory}
                  </p>
                </div>
              )}

            </div>

            {/* REVIEW ACTIONS */}

            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#103D46]/10 pt-6">

              <button
                type="button"
                onClick={() =>
                  handleDecision(selectedProduct, "reject")
                }
                disabled={Boolean(processingId)}
                className="rounded-full border border-[#B95035]/30 px-6 py-3 text-xs font-semibold text-[#B95035] transition hover:bg-[#B95035]/10 disabled:opacity-50"
              >
                Reject Product
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDecision(selectedProduct, "approve")
                }
                disabled={Boolean(processingId)}
                className="rounded-full bg-[#103D46] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#15525C] disabled:opacity-50"
              >
                Approve Product
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ======================================
          CUSTOM CONFIRMATION MESSAGE BOX
      ====================================== */}

      {confirmation && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071F22]/75 p-4 backdrop-blur-sm"
          onClick={closeConfirmation}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="approval-confirm-title"
            aria-describedby="approval-confirm-description"
            className="w-full max-w-md rounded-3xl border border-[#E6AD51]/20 bg-[#F6EEDF] p-7 text-center shadow-2xl sm:p-9"
            onClick={(event) => event.stopPropagation()}
          >

            {/* ICON */}

            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                confirmation.decision === "approve"
                  ? "bg-[#103D46]/10 text-[#103D46]"
                  : "bg-[#B95035]/10 text-[#B95035]"
              }`}
            >
              {confirmation.decision === "approve" ? (
                <ClipboardCheck
                  size={30}
                  strokeWidth={1.5}
                />
              ) : (
                <AlertCircle
                  size={30}
                  strokeWidth={1.5}
                />
              )}
            </div>

            {/* HEADING */}

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
              URUMAYA / Product Review
            </p>

            <h3
              id="approval-confirm-title"
              className="mt-3 font-display text-3xl text-[#103D46]"
            >
              {confirmation.decision === "approve"
                ? "Approve This Product?"
                : "Reject This Product?"}
            </h3>

            {/* MESSAGE */}

            <p
              id="approval-confirm-description"
              className="mt-4 text-sm leading-7 text-[#29251F]/65"
            >
              Are you sure you want to{" "}
              {confirmation.decision === "approve"
                ? "approve"
                : "reject"}{" "}
              <span className="font-semibold text-[#103D46]">
                "{confirmation.product.name}"
              </span>
              ?
            </p>

            <p className="mt-3 text-xs leading-6 text-[#29251F]/50">
              {confirmation.decision === "approve"
                ? "Once approved, this product will be published and visible to customers in the URUMAYA storefront."
                : "This product will be marked as rejected and will remain hidden from the public storefront."}
            </p>

            {/* CONFIRMATION BUTTONS */}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">

              <button
                type="button"
                onClick={closeConfirmation}
                disabled={Boolean(processingId)}
                className="flex-1 rounded-full border border-[#103D46]/20 bg-white px-5 py-3 text-sm font-semibold text-[#103D46] transition hover:bg-[#103D46]/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDecision}
                disabled={Boolean(processingId)}
                className={`flex-1 rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  confirmation.decision === "approve"
                    ? "bg-[#103D46] hover:bg-[#15525C]"
                    : "bg-[#B95035] hover:bg-[#9E402C]"
                }`}
              >
                {processingId ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Processing...
                  </span>
                ) : confirmation.decision === "approve" ? (
                  "Yes, Approve"
                ) : (
                  "Yes, Reject"
                )}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
