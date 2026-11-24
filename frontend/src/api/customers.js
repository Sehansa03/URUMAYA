import api from "./client";

export const customerAPI = {
  getStatistics: () => {
    return api.get("/customers/statistics");
  },

  getCustomers: ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
  } = {}) => {
    return api.get("/customers", {
      params: {
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
      },
    });
  },

  getCustomerById: (
    customerId,
    page = 1,
    limit = 5
  ) => {
    return api.get(`/customers/${customerId}`, {
      params: {
        page,
        limit,
      },
    });
  },
};