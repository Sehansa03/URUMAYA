
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
