import api from "./client";

export const staffAPI = {
  // Retrieve staff list, statistics and pagination
  getStaff: ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
  } = {}) => {
    return api.get("/staff", {
      params: {
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
      },
    });
  },

  // Create a new staff account
  createStaff: (staffDetails) => {
    return api.post("/staff", staffDetails);
  },

  // Update staff personal details
  updateStaff: (staffId, staffDetails) => {
    return api.patch(
      `/staff/${staffId}`,
      staffDetails
    );
  },

  // Activate or deactivate staff account
  updateStaffStatus: (staffId, isActive) => {
    return api.patch(
      `/staff/${staffId}/status`,
      { isActive }
    );
  },

  // Reset staff password
  resetStaffPassword: (staffId, password) => {
    return api.patch(
      `/staff/${staffId}/password`,
      { password }
    );
  },
};