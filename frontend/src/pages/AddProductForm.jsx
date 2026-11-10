
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  UploadCloud,
  X,
  ImagePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  uploadProductImages,
  createProduct,
} from "../api/products";

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
  "w-full rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none transition focus:border-[#B95035] focus:ring-2 focus:ring-[#B95035]/10";

const labelClass =
  "mb-2 block text-xs font-semibold text-[#103D46]";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function FormField({ label, required = false, children }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && (
          <span className="ml-1 text-[#B95035]">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

function Section({ eyebrow, title, description, children }) {
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

      <div className="mt-7">{children}</div>
    </section>
  );
}

export default function AddProductForm({
  onCancel,
  onSuccess,
}) {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const urls = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "name") {
        updated.slug = slugify(value);
      }

      return updated;
    });
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);

    event.target.value = "";

    if (!selected.length) return;

    setError("");

    if (files.length + selected.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
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

    setFiles((previous) => [...previous, ...selected]);
  };

  const removeImage = (index) => {
    setFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    if (!files.length) {
      setError("Please select at least one product image.");
      return;
    }

    if (Number(form.price) <= 0) {
      setError("Product price must be greater than zero.");
      return;
    }

    if (
      !Number.isInteger(Number(form.stockQuantity)) ||
      Number(form.stockQuantity) < 0
    ) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    if (
      !Number.isInteger(Number(form.lowStockThreshold)) ||
      Number(form.lowStockThreshold) < 0
    ) {
      setError("Please enter a valid low stock threshold.");
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Upload images to Cloudinary
      const uploadResponse = await uploadProductImages(files);

      const imageUrls =
        uploadResponse.data?.images?.map(
          (image) => image.url
        ) || [];

      if (imageUrls.length !== files.length) {
        throw new Error(
          "Not all images were uploaded successfully."
        );
      }

      // Step 2: Save product details in MongoDB
      const productData = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        currency: "LKR",
        images: imageUrls,
        sku: form.sku.trim(),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        artisanName: form.artisanName.trim(),
        originDistrict: form.originDistrict.trim(),
        heritageStory: form.heritageStory.trim(),
        isFeatured: form.isFeatured,
      };

      await createProduct(productData);

      setSuccess(
        "Product submitted successfully! It is now pending admin approval."
      );

      setForm(initialForm);
      setFiles([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Product submission failed:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit product. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Artisan Collection
          </p>

          <h2 className="mt-2 font-display text-4xl text-[#103D46]">
            Add New Product
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#29251F]/60">
            Introduce a new handcrafted creation to URUMAYA.
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

      {/* MESSAGES */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={19} className="shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">

        {/* PRODUCT DETAILS */}
        <Section
          eyebrow="01 / Product Information"
          title="The Creation"
          description="Start with the essential details of your artisan product."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Product Name" required>
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

            <FormField label="Category" required>
              <select
                className={inputClass}
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="pottery">Pottery</option>
                <option value="textiles">Textiles</option>
                <option value="masks">Traditional Masks</option>
                <option value="brassware">Brassware</option>
              </select>
            </FormField>

            <FormField label="Product Slug" required>
              <input
                className={inputClass}
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="handcrafted-terracotta-vase"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
            </FormField>

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

            <div className="md:col-span-2">
              <FormField label="Description" required>
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

        {/* IMAGES */}
        <Section
          eyebrow="02 / Product Gallery"
          title="Visual Story"
          description="Upload up to five clear product images. JPG, PNG, or WebP, maximum 5 MB each."
        >
          <label
            className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#103D46]/20 bg-[#F6EEDF]/50 p-7 text-center transition hover:border-[#B95035]/50 ${
              submitting
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            <UploadCloud
              size={32}
              className="text-[#B95035]"
            />

            <p className="mt-4 text-sm font-semibold text-[#103D46]">
              Click to select product images
            </p>

            <p className="mt-2 text-xs text-[#29251F]/50">
              {files.length} of {MAX_IMAGES} images selected
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFiles}
              disabled={
                submitting || files.length >= MAX_IMAGES
              }
              className="hidden"
            />
          </label>

          {previews.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
                    onClick={() => removeImage(index)}
                    disabled={submitting}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-[#103D46] shadow-md disabled:opacity-50"
                  >
                    <X size={15} />
                  </button>

                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-[#103D46] px-2.5 py-1 text-[10px] text-white">
                      Cover Image
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!previews.length && (
            <div className="mt-5 flex items-center gap-2 text-xs text-[#29251F]/45">
              <ImagePlus size={16} />
              Your selected images will appear here.
            </div>
          )}
        </Section>

        {/* PRICING AND INVENTORY */}
        <Section
          eyebrow="03 / Pricing & Inventory"
          title="Stock Details"
          description="Set the product price and available quantity."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <FormField label="Price (LKR)" required>
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

            <FormField label="Stock Quantity" required>
              <input
                type="number"
                min="0"
                step="1"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={handleChange}
                placeholder="15"
                className={inputClass}
                required
              />
            </FormField>

            <FormField label="Low Stock Alert" required>
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

        {/* ARTISAN DETAILS */}
        <Section
          eyebrow="04 / Heritage & Craftsmanship"
          title="The Artisan's Story"
          description="Celebrate the people, places, and traditions behind the creation."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Artisan Name">
              <input
                name="artisanName"
                value={form.artisanName}
                onChange={handleChange}
                placeholder="Artisan or workshop name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Origin District">
              <input
                name="originDistrict"
                value={form.originDistrict}
                onChange={handleChange}
                placeholder="Kandy"
                className={inputClass}
              />
            </FormField>

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

        {/* SUBMISSION */}
        <div className="rounded-2xl border border-[#103D46]/10 bg-white/85 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl text-[#103D46]">
                Ready for Review?
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#29251F]/55">
                Your product will be submitted for admin
                approval and will not appear in the public
                storefront until approved.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#103D46] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B95035] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  Submit for Approval
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
