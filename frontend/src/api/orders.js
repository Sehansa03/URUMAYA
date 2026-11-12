
import api from "./client";

// ==========================================
// URUMAYA ORDER API
// ==========================================

export const orderAPI = {
  // Create an order and reserve product stock
  createOrder: (orderDetails) => {
    return api.post("/orders", orderDetails);
  },

  // Retrieve an existing order belonging to the customer
  getOrderById: (orderId) => {
    return api.get(`/orders/${orderId}`);
  },

  // Simulate successful or failed payment
  processMockPayment: (orderId, result) => {
    return api.post(`/orders/${orderId}/mock-payment`, {
      result,
    });
  },
};
