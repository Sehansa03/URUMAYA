
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

  // Customer: Retrieve their own order history
  getMyOrders: (page = 1, limit = 10) => {
    return api.get("/orders/my-orders", {
      params: { page, limit },
    });
  },

  // ========================================
  // STAFF & ADMIN ORDER MANAGEMENT
  // ========================================

  // Retrieve all customer orders
  getManagedOrders: ({
    page = 1,
    limit = 10,
    orderStatus = "",
    paymentStatus = "",
  } = {}) => {
    return api.get("/orders/management/all", {
      params: {
        page,
        limit,
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
      },
    });
  },

  // Staff/Admin: Retrieve individual order details
  getManagedOrderById: (orderId) => {
    return api.get(`/orders/management/${orderId}`);
  },


  // Staff/Admin: Update order fulfillment status
  updateManagedOrderStatus: (orderId, payload) => {
    return api.patch(
      `/orders/management/${orderId}/status`,
      payload
    );
  },


};
