import { useEffect, useState } from "react";
import {
  ArrowLeft,
  UploadCloud,
  X,
  ImagePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

import {
  uploadProductImages,
  createProduct,
  updateProduct,
} from "../api/products";

import { getCategories } from "../api/categories";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const initialForm = {
  name: "",
  slug: "",
  description: "",
  category: "",
  price: "",
  sku: "",
  stockQuantity: "",
  lowStockThreshold: "5",
  artisanName: "",
  originDistrict: "",
  heritageStory: "",
  isFeatured: false,
};

const inputClass =
  "w-full rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none transition focus:border-[#B95035] focus:ring-2 focus:ring-[#B95035]/10 disabled:cursor-not-allowed disabled:bg-[#103D46]/5";

const labelClass =
  "mb-2 block text-xs font-semibold text-[#103D46]";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ==========================================
// REUSABLE FORM FIELD
// ==========================================

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}

        {required && (
          <span className="ml-1 text-[#B95035]">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// ==========================================
// REUSABLE FORM SECTION
// ==========================================

function Section({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#103D46]/10 bg-white/85 p-6 shadow-sm sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B95035]">
        {eyebrow}
      </p>

      <h3 className="mt-2 font-display text-3xl text-[#103D46]">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm leading-7 text-[#29251F]/55">
          {description}
        </p>
      )}

      <div className="mt-7">
        {children}
      </div>
    </section>
  );
}

// ==========================================
// ADD AND EDIT PRODUCT FORM
// ==========================================

export default function AddProductForm({
  onCancel,
  onSuccess,
  product = null,
}) {
  const isEditing = Boolean(product?._id);

  // ========================================
  // FORM STATE
  // ========================================

  const [form, setForm] = useState(() =>
    isEditing
      ? {
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          category: product.category || "",
          price: String(product.price ?? ""),
          sku: product.sku || "",
          stockQuantity: String(
            product.stockQuantity ?? 0
          ),
          lowStockThreshold: String(
            product.lowStockThreshold ?? 5
          ),
          artisanName: product.artisanName || "",
          originDistrict: product.originDistrict || "",
          heritageStory: product.heritageStory || "",
          isFeatured: Boolean(product.isFeatured),
        }
      : { ...initialForm }
  );

  // ========================================
  // CATEGORY STATE
  // ========================================

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [categoriesError, setCategoriesError] =
    useState("");

  // ========================================
  // IMAGE STATE
  // ========================================

  const [existingImages, setExistingImages] =
    useState(() => [...(product?.images || [])]);

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // ========================================
  // SUBMISSION STATE
  // ========================================

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalImages =
    existingImages.length + files.length;

  // ========================================
  // LOAD CATEGORIES
  // ========================================

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const result = await getCategories();

        if (!active) return;

        setCategories(result.data || []);
      } catch (err) {
        if (!active) return;

        console.error(
          "Failed to load categories:",
          err
        );

        setCategoriesError(
          "Unable to load categories. Please refresh and try again."
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
  // GENERATE IMAGE PREVIEWS
  // ========================================

  useEffect(() => {
    const urls = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(urls);

    return () => {
      urls.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [files]);

  // ========================================
  // HANDLE FORM INPUTS
  // ========================================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]:
          type === "checkbox" ? checked : value,
      };

      // Generate the slug automatically only
      // when creating a new product.
      if (name === "name" && !isEditing) {
        updated.slug = slugify(value);
      }

      return updated;
    });
  };

  // ========================================
  // HANDLE IMAGE SELECTION
  // ========================================

  const handleFiles = (event) => {
    const selected = Array.from(
      event.target.files || []
    );

    event.target.value = "";

    if (!selected.length) return;

    setError("");

    if (
      existingImages.length +
        files.length +
        selected.length >
      MAX_IMAGES
    ) {
      setError(
        `You can upload up to ${MAX_IMAGES} images.`
      );

      return;
    }

    const invalidFile = selected.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) ||
        file.size > MAX_FILE_SIZE
    );

    if (invalidFile) {
      setError(
        "Only JPG, PNG, and WebP images up to 5 MB are allowed."
      );

      return;
    }

    setFiles((previous) => [
      ...previous,
      ...selected,
    ]);
  };

  // ========================================
  // REMOVE NEW IMAGE
  // ========================================

  const removeImage = (index) => {
    setFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // ========================================
  // REMOVE EXISTING IMAGE
  // ========================================

  const removeExistingImage = (index) => {
    setExistingImages((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // ========================================
  // SUBMIT PRODUCT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    // Validate required text fields.
    if (
      !form.name.trim() ||
      !form.slug.trim() ||
      !form.description.trim() ||
      !form.category ||
      !form.sku.trim()
    ) {
      setError(
        "Please complete all required product fields."
      );

      return;
    }

    // Validate images.
    if (totalImages === 0) {
      setError(
        "Please select at least one product image."
      );

      return;
    }

    if (totalImages > MAX_IMAGES) {
      setError(
        `A product can contain up to ${MAX_IMAGES} images.`
      );

      return;
    }

    // Validate price.
    if (
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      setError(
        "Product price must be greater than zero."
      );

      return;
    }

    // Validate initial stock only when adding.
    if (
      !isEditing &&
      (
        form.stockQuantity === "" ||
        !Number.isInteger(
          Number(form.stockQuantity)
        ) ||
        Number(form.stockQuantity) < 0
      )
    ) {
      setError(
        "Please enter a valid stock quantity."
      );

      return;
    }

    // Validate low-stock threshold.
    if (
      form.lowStockThreshold === "" ||
      !Number.isInteger(
        Number(form.lowStockThreshold)
      ) ||
      Number(form.lowStockThreshold) < 0
    ) {
      setError(
        "Please enter a valid low stock threshold."
      );

      return;
    }

    try {
      setSubmitting(true);

      // Keep images that already exist.
      let imageUrls = [...existingImages];

      // Upload only newly selected images.
      if (files.length > 0) {
        const uploadResponse =
          await uploadProductImages(files);

        const uploadedUrls =
          uploadResponse.data?.images?.map(
            (image) => image.url
          ) || [];

        if (uploadedUrls.length !== files.length) {
          throw new Error(
            "Not all images were uploaded successfully."
          );
        }

        imageUrls = [
          ...imageUrls,
          ...uploadedUrls,
        ];

        // Retain uploaded URLs if saving fails,
        // so retrying does not upload them again.
        setExistingImages(imageUrls);
        setFiles([]);
      }

      // Common product data.
      const productData = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        currency: "LKR",
        images: imageUrls,
        sku: form.sku.trim(),
        lowStockThreshold: Number(
          form.lowStockThreshold
        ),
        artisanName: form.artisanName.trim(),
        originDistrict: form.originDistrict.trim(),
        heritageStory: form.heritageStory.trim(),
        isFeatured: form.isFeatured,
      };

      if (isEditing) {
        // Do not send stockQuantity when editing.
        // Stock is managed through Inventory.
        await updateProduct(
          product._id,
          productData
        );

        setSuccess(
          "Product updated successfully."
        );

        onSuccess?.(
          "Product updated successfully."
        );
      } else {
        // Initial stock is included only when
        // creating a new product.
        await createProduct({
          ...productData,
          stockQuantity: Number(
            form.stockQuantity
          ),
        });

        setSuccess(
          "Product submitted successfully for admin approval."
        );

        setForm({ ...initialForm });
        setExistingImages([]);
        setFiles([]);

        onSuccess?.(
          "Product submitted for approval."
        );
      }
    } catch (err) {
      console.error(
        "Product submission failed:",
        err
      );

      const validationErrors =
        err.response?.data?.errors;

      setError(
        Array.isArray(validationErrors) &&
          validationErrors.length
          ? validationErrors
              .map(
                (item) =>
                  `${item.field || "Validation"}: ${item.message}`
              )
              .join(" | ")
          : err.response?.data?.message ||
              err.message ||
              "Unable to save product. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // FORM UI
  // ========================================

  return (
    <div className="mx-auto max-w-5xl space-y-7">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Artisan Collection
          </p>

          <h2 className="mt-2 font-display text-4xl text-[#103D46]">
            {isEditing
              ? "Edit Product"
              : "Add New Product"}
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#29251F]/60">
            {isEditing
              ? "Update the details of this artisan creation."
              : "Introduce a new handcrafted creation to URUMAYA."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex items-center gap-2 rounded-full border border-[#103D46]/20 px-5 py-2.5 text-xs font-semibold text-[#103D46] transition hover:bg-white disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back to Products
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle
            size={19}
            className="shrink-0"
          />

          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="ml-auto shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2
            size={19}
            className="shrink-0"
          />

          <p>{success}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-7"
      >
        <fieldset
          disabled={submitting}
          className="min-w-0 space-y-7"
        >

          {/* ==================================
              01. PRODUCT INFORMATION
          ================================== */}

          <Section
            eyebrow="01 / Product Information"
            title="The Creation"
            description="Start with the essential details of your artisan product."
          >
            <div className="grid gap-5 md:grid-cols-2">

              {/* PRODUCT NAME */}

              <FormField
                label="Product Name"
                required
              >
                <input
                  className={inputClass}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Handcrafted Terracotta Vase"
                  required
                  maxLength={150}
                />
              </FormField>

              {/* CATEGORY */}

              <FormField
                label="Category"
                required
              >
                <select
                  className={inputClass}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={
                    categoriesLoading ||
                    Boolean(categoriesError)
                  }
                  required
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : categoriesError
                        ? "Categories unavailable"
                        : "Select category"}
                  </option>

                  {isEditing &&
                    form.category &&
                    !categories.some(
                      (category) =>
                        category.slug === form.category
                    ) && (
                      <option value={form.category}>
                        {form.category} (Current)
                      </option>
                    )}

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category.slug}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                {categoriesError && (
                  <p
                    className="mt-2 text-xs text-red-600"
                    role="alert"
                  >
                    {categoriesError}
                  </p>
                )}

                {!categoriesLoading &&
                  !categoriesError &&
                  categories.length === 0 && (
                    <p className="mt-2 text-xs text-[#B95035]">
                      No active categories are available.
                    </p>
                  )}
              </FormField>

              {/* PRODUCT SLUG */}

              <FormField
                label="Product Slug"
                required
              >
                <input
                  className={inputClass}
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="handcrafted-terracotta-vase"
                  required
                  readOnly={isEditing}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                />

                {isEditing && (
                  <p className="mt-2 text-xs leading-5 text-[#29251F]/50">
                    The existing product URL is
                    preserved during editing.
                  </p>
                )}
              </FormField>

              {/* SKU */}

              <FormField label="SKU" required>
                <input
                  className={inputClass}
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="URU-POT-002"
                  required
                />
              </FormField>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <FormField
                  label="Description"
                  required
                >
                  <textarea
                    className={`${inputClass} min-h-32 resize-y`}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product, materials, and craftsmanship..."
                    required
                  />
                </FormField>
              </div>
            </div>
          </Section>

          {/* ==================================
              02. PRODUCT GALLERY
          ================================== */}

          <Section
            eyebrow="02 / Product Gallery"
            title="Visual Story"
            description="Upload up to five clear product images. JPG, PNG, or WebP, maximum 5 MB each."
          >

            {/* EXISTING IMAGES */}

            {existingImages.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-semibold text-[#103D46]">
                  Existing Product Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {existingImages.map(
                    (url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="relative aspect-square overflow-hidden rounded-xl border border-[#103D46]/10 bg-white"
                      >
                        <img
                          src={url}
                          alt={`Existing product image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(index)
                          }
                          disabled={submitting}
                          aria-label={`Remove existing image ${index + 1}`}
                          className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-[#103D46] shadow-md transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <X size={15} />
                        </button>

                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-[#103D46] px-2.5 py-1 text-[10px] text-white">
                            Cover Image
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* IMAGE UPLOAD */}

            <label
              className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#103D46]/20 bg-[#F6EEDF]/50 p-7 text-center transition ${
                submitting ||
                totalImages >= MAX_IMAGES
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-[#B95035]/50"
              }`}
            >
              <UploadCloud
                size={32}
                className="text-[#B95035]"
              />

              <p className="mt-4 text-sm font-semibold text-[#103D46]">
                {totalImages >= MAX_IMAGES
                  ? "Maximum image limit reached"
                  : "Click to select product images"}
              </p>

              <p className="mt-2 text-xs text-[#29251F]/50">
                {totalImages} of {MAX_IMAGES} images selected
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFiles}
                disabled={
                  submitting ||
                  totalImages >= MAX_IMAGES
                }
                className="hidden"
              />
            </label>

            {/* NEW IMAGE PREVIEWS */}

            {previews.length > 0 && (
              <div className="mt-6">

                <p className="mb-3 text-xs font-semibold text-[#103D46]">
                  New Product Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {previews.map((url, index) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-xl border border-[#103D46]/10 bg-white"
                    >
                      <img
                        src={url}
                        alt={`Product preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        disabled={submitting}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-[#103D46] shadow-md transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <X size={15} />
                      </button>

                      {index === 0 &&
                        existingImages.length === 0 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-[#103D46] px-2.5 py-1 text-[10px] text-white">
                            Cover Image
                          </span>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMPTY IMAGE STATE */}

            {!previews.length &&
              !existingImages.length && (
                <div className="mt-5 flex items-center gap-2 text-xs text-[#29251F]/45">
                  <ImagePlus size={16} />

                  Your selected images will appear here.
                </div>
              )}
          </Section>

          {/* ==================================
              03. PRICING AND INVENTORY
          ================================== */}

          <Section
            eyebrow="03 / Pricing & Inventory"
            title="Stock Details"
            description={
              isEditing
                ? "Update pricing and low-stock alerts. Stock adjustments are managed through Inventory."
                : "Set the product price and available quantity."
            }
          >
            <div className="grid gap-5 md:grid-cols-3">

              {/* PRICE */}

              <FormField
                label="Price (LKR)"
                required
              >
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="4500"
                  className={inputClass}
                  required
                />
              </FormField>

              {/* STOCK QUANTITY */}

              <FormField
                label="Stock Quantity"
                required={!isEditing}
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="stockQuantity"
                  value={form.stockQuantity}
                  onChange={handleChange}
                  placeholder="15"
                  className={inputClass}
                  disabled={isEditing}
                  required={!isEditing}
                />

                {isEditing && (
                  <p className="mt-2 text-xs leading-5 text-[#29251F]/50">
                    Manage stock quantities through
                    the Inventory page.
                  </p>
                )}
              </FormField>

              {/* LOW STOCK THRESHOLD */}

              <FormField
                label="Low Stock Alert"
                required
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="lowStockThreshold"
                  value={form.lowStockThreshold}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </FormField>
            </div>
          </Section>

          {/* ==================================
              04. HERITAGE AND CRAFTSMANSHIP
          ================================== */}

          <Section
            eyebrow="04 / Heritage & Craftsmanship"
            title="The Artisan's Story"
            description="Celebrate the people, places, and traditions behind the creation."
          >
            <div className="grid gap-5 md:grid-cols-2">

              {/* ARTISAN NAME */}

              <FormField label="Artisan Name">
                <input
                  name="artisanName"
                  value={form.artisanName}
                  onChange={handleChange}
                  placeholder="Artisan or workshop name"
                  className={inputClass}
                />
              </FormField>

              {/* ORIGIN DISTRICT */}

              <FormField label="Origin District">
                <input
                  name="originDistrict"
                  value={form.originDistrict}
                  onChange={handleChange}
                  placeholder="Kandy"
                  className={inputClass}
                />
              </FormField>

              {/* HERITAGE STORY */}

              <div className="md:col-span-2">
                <FormField label="Heritage Story">
                  <textarea
                    name="heritageStory"
                    value={form.heritageStory}
                    onChange={handleChange}
                    placeholder="Share the cultural inspiration and traditional techniques behind this product..."
                    className={`${inputClass} min-h-40 resize-y`}
                  />
                </FormField>
              </div>
            </div>
          </Section>

        </fieldset>

        {/* ====================================
            SUBMISSION SECTION
        ==================================== */}

        <div className="rounded-2xl border border-[#103D46]/10 bg-white/85 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl text-[#103D46]">
                {isEditing
                  ? "Save Product Changes?"
                  : "Ready for Review?"}
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#29251F]/55">
                {isEditing
                  ? "Changes to published products require admin reapproval before appearing in the storefront again."
                  : "Your product will be submitted for admin approval and will not appear in the public storefront until approved."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              {/* CANCEL BUTTON */}

              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="rounded-full border border-[#103D46]/20 px-6 py-3.5 text-sm font-semibold text-[#103D46] transition hover:bg-[#103D46]/5 disabled:opacity-50"
              >
                Cancel
              </button>

              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  categoriesLoading ||
                  Boolean(categoriesError)
                }
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#103D46] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B95035] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    {isEditing
                      ? "Saving..."
                      : "Submitting..."}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <Save size={18} />
                    ) : (
                      <UploadCloud size={18} />
                    )}

                    {isEditing
                      ? "Save Changes"
                      : "Submit for Approval"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}