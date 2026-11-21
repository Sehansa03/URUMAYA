
import api from "./client";

// ==========================================
// PUBLIC CATEGORIES
// ==========================================

// Get all active craft categories
// Used by Shop and Heritage Stories
export const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};

// ==========================================
// ADMIN CATEGORY MANAGEMENT
// ==========================================

// Get all categories, including inactive ones
export const getManagedCategories = async () => {
  const response = await api.get("/categories/manage");

  return response.data;
};

// Create a new craft category
export const createCategory = async (categoryData) => {
  const response = await api.post(
    "/categories",
    categoryData
  );

  return response.data;
};

// Update a category's details or active status
// Category slug cannot be changed
export const updateCategory = async (
  categoryId,
  categoryData
) => {
  const response = await api.patch(
    `/categories/${encodeURIComponent(categoryId)}`,
    categoryData
  );

  return response.data;
};

// Upload one category cover image to Cloudinary
// Admin only
export const uploadCategoryImage = async (file) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post(
    "/categories/uploads",
    formData
  );

  return response.data;
};
