import api from "./client";

// Get public products.
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
};

// Get one public product by slug.
export const getProductBySlug = async (slug) => {
  const response = await api.get(
    `/products/${encodeURIComponent(slug)}`
  );

  return response.data;
};

// Get all managed products for staff and admin.
export const getManagedProducts = async (
  params = {}
) => {
  const response = await api.get(
    "/products/manage",
    { params }
  );

  return response.data;
};

// Upload product images to Cloudinary.
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

// Create a new product.
export const createProduct = async (productData) => {
  const response = await api.post(
    "/products",
    productData
  );

  return response.data;
};

// Update an existing product.
export const updateProduct = async (
  productId,
  productData
) => {
  const response = await api.patch(
    `/products/${productId}`,
    productData
  );

  return response.data;
};

// Approve a pending product.
export const approveProduct = async (productId) => {
  const response = await api.patch(
    `/products/${productId}/approve`
  );

  return response.data;
};

// Reject a pending product.
export const rejectProduct = async (productId) => {
  const response = await api.patch(
    `/products/${productId}/reject`
  );

  return response.data;
};

// Archive a product.
export const archiveProduct = async (productId) => {
  const response = await api.delete(
    `/products/${productId}`
  );

  return response.data;
};

// Restore an archived product.
export const restoreProduct = async (productId) => {
  const response = await api.patch(
    `/products/${productId}/restore`
  );

  return response.data;
};