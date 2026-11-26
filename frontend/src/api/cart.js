
import api from "./client";

// ==========================================
// URUMAYA CUSTOMER CART API
// ==========================================

export const cartAPI = {
  // Retrieve the authenticated customer's cart
  getCart: () => {
    return api.get("/cart");
  },

  // Add a product to the customer's cart
  addToCart: (productId, quantity = 1) => {
    return api.post("/cart/items", {
      productId,
      quantity,
    });
  },

  // Update an existing cart item's quantity
  updateCartItem: (productId, quantity) => {
    return api.patch(`/cart/items/${productId}`, {
      quantity,
    });
  },

  // Remove a specific product from the cart
  removeCartItem: (productId) => {
    return api.delete(`/cart/items/${productId}`);
  },

  // Remove all items from the customer's cart
  clearCart: () => {
    return api.delete("/cart");
  },
};
