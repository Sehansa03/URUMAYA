
import api from "./client";

// Get products with optional filters
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
};

// Get one product by its slug
export const getProductBySlug = async (slug) => {
  const response = await api.get(
    `/products/${encodeURIComponent(slug)}`
  );

  return response.data;
};


/**
 * Get products for staff/admin management
 * Staff: own products
 * Admin: all products
 */
export const getManagedProducts = async (params = {}) => {
  const response = await api.get("/products/manage", {
    params,
  });

  return response.data;
};


/**
 * Upload product images to Cloudinary.
 * Only authenticated staff and admins can upload.
 *
 * @param {File[]} files - Selected image files
 * @returns {Promise<Object>} Uploaded image details
 */
export const uploadProductImages = async (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post(
    "/products/uploads",
    formData
  );

  return response.data;
};

/**
 * Create a new product.
 * The backend automatically assigns pending approval.
 *
 * @param {Object} productData - Product details
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async (productData) => {
  const response = await api.post(
    "/products",
    productData
  );

  return response.data;
};


export const approveProduct = async (productId) => {
  const response = await api.patch(
    `/products/${productId}/approve`
  );

  return response.data;
};

export const rejectProduct = async (productId) => {
  const response = await api.patch(
    `/products/${productId}/reject`
  );

  return response.data;
};

