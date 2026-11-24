import {
  X,
  Package,
  Pencil,
  Archive,
  ArchiveRestore,
} from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(price ?? 0);

export default function ManagementProductDetails({
  product,
  onClose,
  onEdit,
  onArchive,
  onRestore,
  isAdmin = false,
}) {
  if (!product) return null;

  const isArchived =
    product.approvalStatus === "published" &&
    !product.isActive;

  const canArchive =
    isAdmin &&
    product.approvalStatus === "published" &&
    product.isActive;

  const canRestore = isAdmin && isArchived;

  const details = [
    ["SKU", product.sku],
    [
      "Category",
      product.category?.replace(/-/g, " "),
    ],
    ["Price", formatPrice(product.price)],
    ["Available Stock", product.stockQuantity],
    ["Low Stock Threshold", product.lowStockThreshold],
    [
      "Status",
      isArchived
        ? "Archived"
        : product.approvalStatus,
    ],
    [
      "Artisan",
      product.artisanName || "Not provided",
    ],
    [
      "Origin District",
      product.originDistrict || "Not provided",
    ],
    [
      "Created By",
      product.createdBy?.fullName || "Not recorded",
    ],
    [
      "Reviewed By",
      product.reviewedBy?.fullName || "Not reviewed",
    ],
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071F22]/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Product details"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-[#F6EEDF] p-6 shadow-2xl sm:p-8"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
              URUMAYA / Artisan Collection
            </p>

            <h2 className="mt-3 font-display text-4xl text-[#103D46]">
              {product.name}
            </h2>

            {isArchived && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Archive size={13} />
                Archived
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="rounded-full p-2 text-[#103D46] hover:bg-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* PRODUCT IMAGES */}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {product.images?.length ? (
            product.images.map((url, index) => (
              <img
                key={`${url}-${index}`}
                src={url}
                alt={`${product.name} ${index + 1}`}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-white/60">
              <Package
                size={35}
                className="text-[#103D46]/40"
              />
            </div>
          )}
        </div>

        {/* PRODUCT INFORMATION */}

        <div className="mt-7 grid grid-cols-2 gap-5 rounded-2xl border border-[#103D46]/10 bg-white/70 p-5 sm:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-[#29251F]/50">
                {label}
              </p>

              <p className="mt-2 break-words text-sm font-medium capitalize text-[#103D46]">
                {value ?? "—"}
              </p>
            </div>
          ))}
        </div>

        {/* DESCRIPTION */}

        <div className="mt-7">
          <h3 className="font-display text-2xl text-[#103D46]">
            Product Description
          </h3>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#29251F]/70">
            {product.description}
          </p>
        </div>

        {/* HERITAGE STORY */}

        {product.heritageStory && (
          <div className="mt-7">
            <h3 className="font-display text-2xl text-[#103D46]">
              Behind the Craft
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#29251F]/70">
              {product.heritageStory}
            </p>
          </div>
        )}

        {/* ARCHIVED INFORMATION */}

        {isArchived && (
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#103D46]/10 bg-white/60 p-4">
            <Archive
              size={18}
              className="shrink-0 text-[#103D46]/60"
            />

            <p className="text-xs leading-6 text-[#29251F]/65">
              This product is currently archived and
              is not visible in the public storefront
              or active inventory.
              {isAdmin
                ? " Restore it to make it available again."
                : " An administrator can restore this product."}
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#103D46]/10 pt-6">

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#103D46]/20 px-6 py-3 text-xs font-semibold text-[#103D46] transition hover:bg-white"
          >
            Close
          </button>

          {/* EDIT */}

          {!isArchived && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="inline-flex items-center gap-2 rounded-full bg-[#103D46] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#B95035]"
            >
              <Pencil size={16} />
              Edit Product
            </button>
          )}

          {/* ARCHIVE - ADMIN ONLY */}

          {canArchive && onArchive && (
            <button
              type="button"
              onClick={() => onArchive(product)}
              className="inline-flex items-center gap-2 rounded-full border border-[#B95035]/25 px-6 py-3 text-xs font-semibold text-[#B95035] transition hover:bg-[#B95035]/10"
            >
              <Archive size={16} />
              Archive Product
            </button>
          )}

          {/* RESTORE - ADMIN ONLY */}

          {canRestore && onRestore && (
            <button
              type="button"
              onClick={() => onRestore(product)}
              className="inline-flex items-center gap-2 rounded-full bg-[#103D46] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#082D34]"
            >
              <ArchiveRestore size={16} />
              Restore Product
            </button>
          )}

        </div>
      </section>
    </div>
  );
}