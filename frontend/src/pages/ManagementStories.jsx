import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import imageCompression from "browser-image-compression";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Eye,
  Send,
  Check,
  X,
  ImagePlus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getCategories } from "../api/categories";
import { getProducts } from "../api/products";
import {
  getManagedStories,
  createStory,
  updateStory,
  submitStory,
  approveStory,
  rejectStory,
  uploadStoryImage,
} from "../api/stories";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  artisanName: "",
  originDistrict: "",
  coverImage: "",
  images: [],
  relatedProducts: [],
  isFeatured: false,
};

const statusColors = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

const fieldClass =
  "w-full rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none transition focus:border-[#B95035]";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#103D46] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#15525C] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#103D46]/20 bg-white px-5 py-3 text-xs font-semibold text-[#103D46] transition hover:bg-[#103D46]/5 disabled:opacity-50";

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (data?.errors?.length) {
    return data.errors
      .map((item) => `${item.field}: ${item.message}`)
      .join(" | ");
  }

  return data?.message || error.message || "Something went wrong.";
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
        statusColors[status] || statusColors.draft
      }`}
    >
      {status || "draft"}
    </span>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold text-[#103D46]">
        {label}
        {required && <span className="ml-1 text-[#B95035]">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function ManagementStories() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shopProducts, setShopProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  // ==========================================
  // LOAD STORIES
  // ==========================================

  const loadStories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getManagedStories({
        page,
        limit: 10,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      });

      setStories(response.data || []);
      setPagination(
        response.pagination || {
          page: 1,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    if (user) {
      loadStories();
    }
  }, [user, loadStories]);

  // ==========================================
  // LOAD ACTIVE CATEGORIES
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await getCategories();

        if (active) {
          setCategories(response.data || []);
        }
      } catch (err) {
        console.error("Unable to load story categories:", err);

        if (active) {
          setError("Unable to load craft categories.");
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  // Load published shop products when the story editor opens.
  useEffect(() => {
    if (view !== "editor") return;

    let active = true;
    async function loadShopProducts() {
      setProductsLoading(true);
      setProductsError("");
      try {
        const all = [];
        let pageNumber = 1;
        let totalPages = 1;
        do {
          const response = await getProducts({ page: pageNumber, limit: 50 });
          all.push(...(response.data || []));
          totalPages = Math.max(1, Number(response.pagination?.totalPages) || 1);
          pageNumber += 1;
        } while (pageNumber <= totalPages && pageNumber <= 20);
        if (active) setShopProducts(all);
      } catch (err) {
        if (active) setProductsError(getErrorMessage(err));
      } finally {
        if (active) setProductsLoading(false);
      }
    }
    loadShopProducts();
    return () => { active = false; };
  }, [view]);

  const toggleRelatedProduct = (productId) => {
    setForm((previous) => ({
      ...previous,
      relatedProducts: previous.relatedProducts.includes(productId)
        ? previous.relatedProducts.filter((id) => id !== productId)
        : [...previous.relatedProducts, productId],
    }));
  };

  // ==========================================
  // EDITOR HELPERS
  // ==========================================

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, images: [], relatedProducts: [] });
    setProductSearch("");
    setError("");
    setMessage("");
    setView("editor");
  };

  const openEdit = (story) => {
    setEditingId(story._id);

    setForm({
      title: story.title || "",
      slug: story.slug || "",
      excerpt: story.excerpt || "",
      content: story.content || "",
      category: story.category || "",
      artisanName: story.artisanName || "",
      originDistrict: story.originDistrict || "",
      coverImage: story.coverImage || "",
      images: [...(story.images || [])],
      relatedProducts: (story.relatedProducts || [])
        .map((product) => typeof product === "object" && product !== null ? product._id : product)
        .filter(Boolean),
      isFeatured: Boolean(story.isFeatured),
    });

    setError("");
    setMessage("");
    setProductSearch("");
    setView("editor");
  };

  const backToList = () => {
    setView("list");
    setEditingId(null);
    setError("");
    loadStories();
  };

  const handleTitleChange = (value) => {
    setForm((previous) => ({
      ...previous,
      title: value,
      ...(editingId ? {} : { slug: slugify(value) }),
    }));
  };

  // ==========================================
  // CLOUDINARY IMAGE UPLOAD
  // ==========================================

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    if (type === "gallery" && form.images.length >= 10) {
      setError("A story can have a maximum of 10 gallery images.");
      return;
    }

    try {
      setUploading(type);
      setError("");

      // Compress large photos in the browser before sending them to Cloudinary.
      // Small files are uploaded unchanged to avoid unnecessary processing.
      const uploadFile = file.size > 500 * 1024
        ? await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp",
            initialQuality: 0.85,
          })
        : file;

      const response = await uploadStoryImage(uploadFile);
      const url = response.data?.url;

      if (!url) {
        throw new Error("Image URL was not returned.");
      }

      setForm((previous) => ({
        ...previous,
        ...(type === "cover"
          ? { coverImage: url }
          : { images: [...previous.images, url] }),
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading("");
    }
  };

  // ==========================================
  // SAVE DRAFT / EDIT STORY
  // ==========================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving || uploading) return;

    if (
      !form.title.trim() ||
      !form.slug.trim() ||
      !form.excerpt.trim() ||
      !form.content.trim() ||
      !form.category
    ) {
      setError("Please complete all required story fields.");
      return;
    }

    if (form.title.trim().length < 3) {
      setError("Story title must contain at least 3 characters.");
      return;
    }

    if (form.excerpt.trim().length < 10) {
      setError("Story excerpt must contain at least 10 characters.");
      return;
    }

    if (form.content.trim().length < 20) {
      setError("Story content must contain at least 20 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
      };

      if (editingId) {
        await updateStory(editingId, payload);
        setMessage("Story updated successfully.");
      } else {
        await createStory(payload);
        setMessage("Story draft created successfully.");
      }

      setView("list");
      setEditingId(null);
      setPage(1);
      setStatus("");
      setSearch("");
      setSearchInput("");
      await loadStories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // SUBMIT / APPROVE / REJECT
  // ==========================================

  const handleAction = (story, action) => {
    setConfirmation({ story, action });
  };

  const confirmAction = async () => {
    if (!confirmation || processingId) return;

    const { story, action } = confirmation;

    try {
      setProcessingId(story._id);
      setError("");
      setMessage("");

      if (action === "submit") {
        await submitStory(story._id);
      } else if (action === "approve") {
        await approveStory(story._id);
      } else if (action === "reject") {
        await rejectStory(story._id);
      }

      const actionMessage = {
        submit: "submitted for approval",
        approve: "published",
        reject: "rejected",
      };

      setMessage(
        `"${story.title}" was ${actionMessage[action]} successfully.`
      );

      setConfirmation(null);
      setSelectedStory(null);

      if (stories.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadStories();
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setConfirmation(null);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  // ==========================================
  // STORY EDITOR
  // ==========================================

  if (view === "editor") {
    return (
      <div className="space-y-7">
        <button
          type="button"
          onClick={backToList}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#103D46]"
        >
          <ArrowLeft size={17} />
          Back to Stories
        </button>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Heritage Editorial
          </p>

          <h2 className="mt-2 font-display text-4xl text-[#103D46]">
            {editingId ? "Edit Heritage Story" : "Create a Heritage Story"}
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#29251F]/60">
            Share the traditions, people and craftsmanship behind
            Sri Lanka's cultural heritage.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <section className="space-y-6 rounded-2xl border border-[#103D46]/10 bg-white/85 p-6 shadow-sm sm:p-8">
            <h3 className="font-display text-2xl text-[#103D46]">
              Story Information
            </h3>

            <Field label="Story Title" required>
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  handleTitleChange(event.target.value)
                }
                maxLength={180}
                required
                className={fieldClass}
                placeholder="The Timeless Art of Sri Lankan Wood Carving"
              />
            </Field>

            <Field label="Story Slug" required>
              <input
                type="text"
                value={form.slug}
                onChange={(event) =>
                  updateField("slug", slugify(event.target.value))
                }
                minLength={2}
                maxLength={180}
                required
                className={fieldClass}
                placeholder="sri-lankan-wood-carving"
              />
            </Field>

            <Field label="Short Excerpt" required>
              <textarea
                value={form.excerpt}
                onChange={(event) =>
                  updateField("excerpt", event.target.value)
                }
                minLength={10}
                maxLength={350}
                rows={3}
                required
                className={fieldClass}
                placeholder="Introduce the heritage and cultural significance of this craft..."
              />
              <span className="block text-right text-xs text-[#29251F]/45">
                {form.excerpt.length}/350
              </span>
            </Field>

            <Field label="Full Heritage Story" required>
              <textarea
                value={form.content}
                onChange={(event) =>
                  updateField("content", event.target.value)
                }
                minLength={20}
                maxLength={15000}
                rows={12}
                required
                className={fieldClass}
                placeholder="Tell the story of this craft, its history, techniques, artisans and cultural meaning..."
              />
              <span className="block text-right text-xs text-[#29251F]/45">
                {form.content.length}/15000
              </span>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Craft Category" required>
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  required
                  className={fieldClass}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category.slug}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Artisan Name">
                <input
                  type="text"
                  value={form.artisanName}
                  onChange={(event) =>
                    updateField("artisanName", event.target.value)
                  }
                  maxLength={150}
                  className={fieldClass}
                  placeholder="Artisan or craft community"
                />
              </Field>

              <Field label="Origin District">
                <input
                  type="text"
                  value={form.originDistrict}
                  onChange={(event) =>
                    updateField("originDistrict", event.target.value)
                  }
                  maxLength={100}
                  className={fieldClass}
                  placeholder="e.g. Kandy"
                />
              </Field>

              {isAdmin && (
                <label className="flex items-center gap-3 text-sm text-[#103D46]">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) =>
                      updateField("isFeatured", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#103D46]"
                  />
                  Feature this story
                </label>
              )}
            </div>
          </section>

          {/* RELATED PRODUCTS */}
          <section className="space-y-5 rounded-2xl border border-[#103D46]/10 bg-white/85 p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-3 font-display text-2xl text-[#103D46]">
                  <ShoppingBag size={22} className="text-[#B95035]" />
                  Related Crafts & Products
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#29251F]/60">
                  Choose products to display under Shop the Story. Only published, active products appear publicly.
                </p>
              </div>
              <span className="rounded-full bg-[#103D46]/10 px-3 py-1.5 text-xs font-semibold text-[#103D46]">
                {form.relatedProducts.length} selected
              </span>
            </div>

            <div className="relative">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#103D46]/45" />
              <input
                type="search"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search by product name or SKU..."
                className={`${fieldClass} pl-11`}
              />
            </div>

            {productsLoading ? (
              <p className="flex items-center gap-2 text-sm text-[#103D46]/65"><Loader2 size={16} className="animate-spin" /> Loading shop products...</p>
            ) : productsError ? (
              <p role="alert" className="text-sm text-red-700">Unable to load products: {productsError}</p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-[#103D46]/10 p-2">
                {shopProducts
                  .filter((product) => `${product.name || ""} ${product.sku || ""}`.toLowerCase().includes(productSearch.toLowerCase().trim()))
                  .map((product) => {
                    const selected = form.relatedProducts.includes(product._id);
                    const image = product.images?.[0];
                    const src = typeof image === "string" ? image : image?.url || image?.secure_url || "";
                    return (
                      <label key={product._id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selected ? "border-[#B95035]/40 bg-[#F6EEDF]/60" : "border-transparent hover:bg-[#F6EEDF]/40"}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleRelatedProduct(product._id)} className="h-4 w-4 shrink-0 accent-[#103D46]" />
                        {src ? <img src={src} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#103D46]/10"><ShoppingBag size={18} /></span>}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#103D46]">{product.name}</span>
                          <span className="block text-xs text-[#29251F]/55">{product.sku || "No SKU"} · {product.currency || "LKR"} {Number(product.price || 0).toLocaleString("en-LK")}</span>
                        </span>
                      </label>
                    );
                  })}
                {shopProducts.filter((product) => `${product.name || ""} ${product.sku || ""}`.toLowerCase().includes(productSearch.toLowerCase().trim())).length === 0 && (
                  <p className="px-3 py-7 text-center text-sm text-[#29251F]/60">No matching published products found.</p>
                )}
              </div>
            )}
            <p className="text-xs leading-5 text-[#29251F]/55">Existing links are preserved when editing. Only products returned by the public shop API are available for new selection.</p>
          </section>

          {/* IMAGES */}
          <section className="space-y-6 rounded-2xl border border-[#103D46]/10 bg-white/85 p-6 shadow-sm sm:p-8">
            <div>
              <h3 className="font-display text-2xl text-[#103D46]">
                Story Photography
              </h3>
              <p className="mt-2 text-sm text-[#29251F]/60">
                JPG, PNG or WebP. Maximum 5 MB per image.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold text-[#103D46]">
                Cover Image
              </p>

              {form.coverImage ? (
                <div className="relative max-w-lg overflow-hidden rounded-2xl">
                  <img
                    src={form.coverImage}
                    alt="Story cover preview"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => updateField("coverImage", "")}
                    className="absolute right-3 top-3 rounded-full bg-white p-2 text-[#103D46]"
                    aria-label="Remove cover image"
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <div className="flex h-44 max-w-lg items-center justify-center rounded-2xl border-2 border-dashed border-[#103D46]/20 bg-[#F6EEDF]/50">
                  <ImagePlus size={32} className="text-[#103D46]/40" />
                </div>
              )}

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#103D46]/20 bg-white px-5 py-3 text-xs font-semibold text-[#103D46]">
                {uploading === "cover" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ImagePlus size={16} />
                )}
                {uploading === "cover"
                  ? "Uploading..."
                  : "Upload Cover Image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={Boolean(uploading) || saving}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    await handleImageUpload(file, "cover");
                    event.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="border-t border-[#103D46]/10 pt-6">
              <p className="mb-3 text-xs font-semibold text-[#103D46]">
                Gallery Images ({form.images.length}/10)
              </p>

              {form.images.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {form.images.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="relative overflow-hidden rounded-xl"
                    >
                      <img
                        src={url}
                        alt={`Gallery image ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            images: previous.images.filter(
                              (_, imageIndex) => imageIndex !== index
                            ),
                          }))
                        }
                        className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-[#103D46]"
                        aria-label={`Remove gallery image ${index + 1}`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#103D46]/20 bg-white px-5 py-3 text-xs font-semibold text-[#103D46]">
                {uploading === "gallery" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {uploading === "gallery"
                  ? "Uploading..."
                  : "Add Gallery Image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={
                    Boolean(uploading) ||
                    saving ||
                    form.images.length >= 10
                  }
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    await handleImageUpload(file, "gallery");
                    event.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={backToList}
              disabled={saving || Boolean(uploading)}
              className={secondaryButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || Boolean(uploading)}
              className={primaryButton}
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Check size={17} />
              )}
              {saving
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Save Draft"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // STORY MANAGEMENT LIST
  // ==========================================

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Heritage Editorial
          </p>

          <h2 className="mt-2 font-display text-3xl text-[#103D46]">
            Heritage Stories
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-7 text-[#29251F]/60">
            {isAdmin
              ? "Manage heritage stories, review submissions and publish cultural narratives."
              : "Create meaningful heritage stories and submit them for review."}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className={primaryButton}
        >
          <Plus size={17} />
          Create Story
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
        >
          <Check size={18} />
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center gap-3 rounded-xl border border-[#103D46]/15 bg-white px-4"
          >
            <Search size={18} className="text-[#103D46]/50" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search heritage stories..."
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
            />

            <button
              type="submit"
              className="text-xs font-semibold text-[#B95035]"
            >
              Search
            </button>
          </form>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className={fieldClass + " lg:w-48"}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            type="button"
            onClick={loadStories}
            disabled={loading}
            className={secondaryButton}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* STORY LIST */}
      <div className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white/85 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#103D46]/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-[#B95035]" />
            <h3 className="font-display text-2xl text-[#103D46]">
              Story Library
            </h3>
          </div>

          <span className="text-xs text-[#29251F]/50">
            {pagination.total} total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-sm text-[#29251F]/60">
            <Loader2 size={20} className="animate-spin" />
            Loading stories...
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <BookOpen
              size={38}
              className="text-[#B95035]/60"
            />
            <h4 className="mt-5 font-display text-3xl text-[#103D46]">
              No Stories Found
            </h4>
            <p className="mt-2 text-sm text-[#29251F]/60">
              Create a heritage story to begin your collection.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#103D46]/10">
            {stories.map((story) => {
              const canEdit =
                story.approvalStatus !== "pending";

              const canSubmit = ["draft", "rejected"].includes(
                story.approvalStatus
              );

              const canReview =
                isAdmin &&
                story.approvalStatus === "pending";

              return (
                <div
                  key={story._id}
                  className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6"
                >
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#E8D1B7]/40">
                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen
                          size={28}
                          className="text-[#103D46]/35"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-display text-xl text-[#103D46]">
                      {story.title}
                    </h4>

                    <p className="mt-1 text-xs capitalize text-[#29251F]/50">
                      {story.category?.replace(/-/g, " ")}
                      {story.originDistrict
                        ? ` · ${story.originDistrict}`
                        : ""}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#29251F]/65">
                      {story.excerpt}
                    </p>

                    <div className="mt-3">
                      <StatusBadge status={story.approvalStatus} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:max-w-[240px]">
                    <button
                      type="button"
                      onClick={() => setSelectedStory(story)}
                      className={secondaryButton}
                    >
                      <Eye size={15} />
                      Review
                    </button>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => openEdit(story)}
                        className={secondaryButton}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                    )}

                    {canSubmit && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(story, "submit")
                        }
                        disabled={Boolean(processingId)}
                        className={primaryButton}
                      >
                        <Send size={15} />
                        Submit
                      </button>
                    )}

                    {canReview && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleAction(story, "approve")
                          }
                          disabled={Boolean(processingId)}
                          className={primaryButton}
                        >
                          <Check size={15} />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAction(story, "reject")
                          }
                          disabled={Boolean(processingId)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#B95035]/30 px-5 py-3 text-xs font-semibold text-[#B95035] hover:bg-red-50"
                        >
                          <X size={15} />
                          Reject
                        </button>
                      </>
                    )}

                    {story.approvalStatus === "published" && (
                      <Link
                        to={`/stories/${story.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={secondaryButton}
                      >
                        View Live
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#103D46]/10 px-6 py-4">
            <span className="text-xs text-[#29251F]/55">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((previous) => previous - 1)
                }
                className={secondaryButton}
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
                className={secondaryButton}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      {selectedStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Story review"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#F6EEDF] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B95035]">
                  Heritage Story Review
                </p>
                <h3 className="mt-2 font-display text-3xl text-[#103D46]">
                  {selectedStory.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="rounded-full p-2 hover:bg-white"
                aria-label="Close review"
              >
                <X size={20} />
              </button>
            </div>

            {selectedStory.coverImage && (
              <img
                src={selectedStory.coverImage}
                alt={selectedStory.title}
                className="mt-6 aspect-[16/9] w-full rounded-xl object-cover"
              />
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <StatusBadge status={selectedStory.approvalStatus} />
              <span className="text-xs capitalize text-[#29251F]/60">
                {selectedStory.category?.replace(/-/g, " ")}
              </span>
            </div>

            <p className="mt-5 text-sm font-medium leading-7 text-[#103D46]">
              {selectedStory.excerpt}
            </p>

            <div className="mt-5 whitespace-pre-wrap text-sm leading-8 text-[#29251F]/75">
              {selectedStory.content}
            </div>

            {selectedStory.artisanName && (
              <p className="mt-5 text-sm text-[#29251F]/70">
                Artisan: {selectedStory.artisanName}
              </p>
            )}

            {selectedStory.originDistrict && (
              <p className="mt-2 text-sm text-[#29251F]/70">
                Origin: {selectedStory.originDistrict}
              </p>
            )}

            {selectedStory.images?.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedStory.images.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`Story gallery ${index + 1}`}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            )}

            {isAdmin &&
              selectedStory.approvalStatus === "pending" && (
                <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#103D46]/10 pt-6">
                  <button
                    type="button"
                    onClick={() =>
                      handleAction(selectedStory, "reject")
                    }
                    className={secondaryButton}
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleAction(selectedStory, "approve")
                    }
                    className={primaryButton}
                  >
                    Approve & Publish
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION */}
      {confirmation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071F22]/75 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="story-confirm-title"
            className="w-full max-w-md rounded-3xl bg-[#F6EEDF] p-8 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#103D46]/10 text-[#103D46]">
              <BookOpen size={30} />
            </div>

            <h3
              id="story-confirm-title"
              className="mt-6 font-display text-3xl text-[#103D46]"
            >
              {confirmation.action === "approve"
                ? "Publish This Story?"
                : confirmation.action === "reject"
                ? "Reject This Story?"
                : "Submit for Approval?"}
            </h3>

            <p className="mt-4 text-sm leading-7 text-[#29251F]/65">
              Are you sure you want to{" "}
              {confirmation.action === "approve"
                ? "publish"
                : confirmation.action}{" "}
              "{confirmation.story.title}"?
            </p>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={Boolean(processingId)}
                className={secondaryButton + " flex-1"}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmAction}
                disabled={Boolean(processingId)}
                className={primaryButton + " flex-1"}
              >
                {processingId ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
