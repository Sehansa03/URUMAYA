
import api from "./client";

export const authAPI = {
  register: (data) => api.post("/auth/register", data),

  login: (data) => api.post("/auth/login", data),

  refresh: () => api.post("/auth/refresh"),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/me"),
};
