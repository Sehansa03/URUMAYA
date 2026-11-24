
import api from "./client";

export const reportAPI = {
  getReports: ({ startDate, endDate, signal }) => {
    return api.get("/reports", {
      params: {
        startDate,
        endDate,
      },
      signal,
    });
  },
};
