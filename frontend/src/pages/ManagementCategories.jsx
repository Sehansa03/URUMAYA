import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Tags,
  X,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

import {
  getManagedCategories,
  createCategory,
  updateCategory,
  uploadCategoryImage,
} from "../api/categories";

import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  coverImage: "",
  isActive: true,
};

const makeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getErrorMessage = (error) => {
  const response = error?.response?.data;

  if (response?.errors?.length) {
    return response.errors
      .map((item) => `${item.field}: ${item.message}`)
      .join(". ");
  }

  return response?.message || error?.message || "Something went wrong. Please try again.";
};

export default function ManagementCategories() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [changingId, setChangingId] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response = await getManagedCategories();

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid categories response");
      }

      setCategories(response.data);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const openCreateForm = () => {
    setSelectedImage(null);
    setEditingCategory(null);
    setForm({ ...emptyForm });
    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const openEditForm = (category) => {
    setSelectedImage(null);
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      coverImage: category.coverImage || "",
      isActive: category.isActive,
    });

    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingCategory(null);
    setSelectedImage(null);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "name" && !editingCategory) {
        updated.slug = makeSlug(value);
      }

      return updated;
    });
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be 5 MB or smaller.");
      return;
    }
    setError("");
    setSelectedImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setError("");
    setMessage("");

    const name = form.name.trim();
    const slug = form.slug.trim();

    if (name.length < 2) {
      setError("Category name must contain at least 2 characters.");
      return;
    }

    if (!editingCategory && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError("Enter a valid lowercase category slug.");
      return;
    }

    const payload = {
      name,
      description: form.description.trim(),
      coverImage: form.coverImage.trim(),
      isActive: form.isActive,
    };

    try {
      setSaving(true);

      if (selectedImage) {
        const uploaded = await uploadCategoryImage(selectedImage);
        const imageUrl = uploaded?.data?.url;
        if (!imageUrl) throw new Error("Image upload did not return a URL.");
        payload.coverImage = imageUrl;
      }

      if (editingCategory) {
        await updateCategory(editingCategory._id, payload);
        setMessage("Category updated successfully.");
      } else {
        await createCategory({ ...payload, slug });
        setMessage("Category created successfully.");
      }

      setFormOpen(false);
      setEditingCategory(null);
      setSelectedImage(null);

      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (category) => {
    if (changingId) return;

    const nextStatus = !category.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Activate "${category.name}"?`
        : `Deactivate "${category.name}"? It will disappear from public category lists.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      setChangingId(category._id);

      await updateCategory(category._id, {
        isActive: nextStatus,
      });

      setMessage(
        nextStatus
          ? "Category activated successfully."
          : "Category deactivated successfully."
      );

      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setChangingId(null);
    }
  };

  const activeCount = categories.filter(
    (category) => category.isActive
  ).length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Collection Management
          </p>

          <h2 className="mt-2 font-display text-3xl text-[#103D46]">
            Craft Categories
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#29251F]/60">
            Organize the collections featured across URUMAYA.
          </p>
        </div>

        {isAdmin && (
           <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-[#103D46] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#185765]"
           >
              <Plus size={18} />
              Add Category
           </button>
     )}
      </div>

      {/* FEEDBACK */}
      {message && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800"
        >
          {message}
        </div>
      )}

      {error && !formOpen && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Categories", categories.length],
          ["Active Categories", activeCount],
          ["Inactive Categories", categories.length - activeCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-6 shadow-sm"
          >
            <p className="text-xs text-[#29251F]/60">{label}</p>
            <p className="mt-3 font-display text-4xl text-[#103D46]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* CATEGORY LIST */}
      <section className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl text-[#103D46]">
            All Categories
          </h3>

          <button
            type="button"
            onClick={loadCategories}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#103D46]/15 px-4 py-2 text-xs font-medium text-[#103D46] hover:bg-[#103D46]/5 disabled:opacity-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#29251F]/60">
            <Loader2 className="animate-spin" size={20} />
            Loading categories...
          </div>
        ) : loadError ? (
          <p role="alert" className="py-10 text-center text-sm text-red-700">
            {loadError}
          </p>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tags size={34} className="mx-auto text-[#B95035]" />
            <p className="mt-4 text-sm text-[#29251F]/60">
              No categories yet. Create your first craft category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category._id}
                className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-[#F6EEDF]/40"
              >
                <div className="relative h-44 bg-[#103D46]/10">
                  {category.coverImage ? (
                    <img
                      src={category.coverImage}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#103D46]/40">
                      <ImageIcon size={36} />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-medium ${
                      category.isActive
                        ? "bg-green-50 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-5">
                  <h4 className="font-display text-2xl text-[#103D46]">
                    {category.name}
                  </h4>

                  <p className="mt-1 text-xs text-[#B95035]">
                    {category.slug}
                  </p>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#29251F]/60">
                    {category.description || "No description provided."}
                  </p>

                  {isAdmin && (
  <div className="mt-5 flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() => openEditForm(category)}
      className="inline-flex items-center gap-2 rounded-lg border border-[#103D46]/20 px-3 py-2 text-xs font-medium text-[#103D46] hover:bg-white"
    >
      <Pencil size={14} />
      Edit
    </button>

    <button
      type="button"
      onClick={() => handleToggleStatus(category)}
      disabled={changingId !== null}
      className="rounded-lg border border-[#103D46]/20 px-3 py-2 text-xs font-medium text-[#103D46] hover:bg-white disabled:opacity-50"
    >
      {changingId === category._id
        ? "Updating..."
        : category.isActive
          ? "Deactivate"
          : "Activate"}
    </button>
  </div>
)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CREATE / EDIT FORM */}
      {isAdmin && formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#F6EEDF] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B95035]">
                  URUMAYA Management
                </p>

                <h3
                  id="category-form-title"
                  className="mt-2 font-display text-3xl text-[#103D46]"
                >
                  {editingCategory ? "Edit Category" : "New Category"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-[#103D46] hover:bg-[#103D46]/10"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium text-[#103D46]"
                >
                  Category Name *
                </label>

                <input
                  id="category-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full rounded-xl border border-[#103D46]/20 bg-white px-4 py-3 text-sm outline-none focus:border-[#B95035]"
                  placeholder="e.g. Handcrafted Jewelry"
                />
              </div>

              <div>
                <label
                  htmlFor="category-slug"
                  className="mb-2 block text-sm font-medium text-[#103D46]"
                >
                  Category Slug *
                </label>

                <input
                  id="category-slug"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  disabled={Boolean(editingCategory)}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full rounded-xl border border-[#103D46]/20 bg-white px-4 py-3 text-sm outline-none focus:border-[#B95035] disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="handcrafted-jewelry"
                />

                <p className="mt-2 text-xs leading-5 text-[#29251F]/50">
                  {editingCategory
                    ? "The slug cannot be changed because products and stories may reference it."
                    : "Generated automatically from the name. You can edit it before saving."}
                </p>
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-medium text-[#103D46]"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-[#103D46]/20 bg-white px-4 py-3 text-sm outline-none focus:border-[#B95035]"
                  placeholder="Describe the craft collection..."
                />
              </div>

              <div>
                <label
                  htmlFor="category-cover-file"
                  className="mb-2 block text-sm font-medium text-[#103D46]"
                >
                  Category Cover Image
                </label>

                {(imagePreview || form.coverImage) ? (
                  <div className="mb-3 overflow-hidden rounded-xl border border-[#103D46]/15 bg-white">
                    <img
                      src={imagePreview || form.coverImage}
                      alt="Category cover preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-[#103D46]/25 bg-white/60">
                    <ImageIcon size={36} className="text-[#103D46]/40" />
                  </div>
                )}

                <input
                  id="category-cover-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  disabled={saving}
                  className="block w-full rounded-xl border border-[#103D46]/20 bg-white p-3 text-sm text-[#103D46] file:mr-4 file:rounded-lg file:border-0 file:bg-[#103D46] file:px-4 file:py-2 file:text-white disabled:opacity-50"
                />
                <p className="mt-2 text-xs text-[#29251F]/55">
                  Choose JPG, PNG, or WebP (maximum 5 MB). The image uploads when you save.
                </p>
                {selectedImage && (
                  <p className="mt-2 text-xs text-[#B95035]">
                    Selected: {selectedImage.name}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm text-[#103D46]">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#103D46]"
                />
                Active category
              </label>

              <div className="flex flex-wrap justify-end gap-3 border-t border-[#103D46]/10 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-[#103D46]/20 px-5 py-3 text-sm text-[#103D46]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#103D46] px-5 py-3 text-sm font-medium text-white hover:bg-[#185765] disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingCategory
                      ? "Save Changes"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
