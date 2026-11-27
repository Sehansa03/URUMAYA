import axios from "axios";
import { waitForBackend, invalidateBackendReadiness } from "./backendReady";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 60000,
});


// Public API client - independent of authentication
export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 20000,
});

publicApi.interceptors.request.use(async (config) => {
  await waitForBackend();
  return config;
});

// Retry temporary failures on public GET requests only
const MAX_PUBLIC_RETRIES = 2;

publicApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    const isTemporaryError =
      !error.response ||
      [408, 502, 503, 504].includes(status);

    const isGet =
      config.method?.toLowerCase() === "get";

    config._retryCount = config._retryCount || 0;

    if (
      isGet &&
      isTemporaryError &&
      config._retryCount < MAX_PUBLIC_RETRIES
    ) {
      config._retryCount++;
      invalidateBackendReadiness();

      const delay = 2000 * config._retryCount;

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );

      return publicApi(config);
    }

    return Promise.reject(error);
  }
);

// Access token stored in memory
let accessToken = null;

// Identifies the current authentication session
let sessionVersion = 0;

let refreshPromise = null;
export const waitForPendingRefresh = async () => {
  if (refreshPromise) {
    try {
      await refreshPromise;
    } catch {
      // Continue even if the previous refresh failed
    }
  }
};

const sessionChangedError = () =>
  new Error("Authentication session has changed.");

// Start a new authenticated session
export const setAccessToken = (token) => {
  sessionVersion++;
  accessToken = token;
  refreshPromise = null;
};

// Invalidate the current session
export const clearAccessToken = () => {
  sessionVersion++;
  accessToken = null;
  refreshPromise = null;
};

// Attach access token to requests
api.interceptors.request.use(async (config) => {
  if (config._sessionVersion === undefined) {
    config._sessionVersion = sessionVersion;
  }

  await waitForBackend();

  if (config._sessionVersion !== sessionVersion) {
    throw sessionChangedError();
  }

  if (accessToken) {
    config.headers.Authorization =
      `Bearer ${accessToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// Refresh the access token
const refreshAccessToken = async () => {
  const currentVersion = sessionVersion;

  if (!refreshPromise) {
    const pendingRefresh = waitForBackend().then(() => {
      if (currentVersion !== sessionVersion) {
        throw sessionChangedError();
      }

      return axios.post(`${API_URL}/auth/refresh`, null, {
        withCredentials: true,
        timeout: 10000,
      });
    })
      .then((response) => {
        if (currentVersion !== sessionVersion) {
          throw sessionChangedError();
        }

        const token = response.data.data.accessToken;

        // Refreshing does not create a new session
        accessToken = token;

        return token;
      })
      .catch((error) => {
        if (currentVersion === sessionVersion) {
          clearAccessToken();
        }

        throw error;
      })
      .finally(() => {
        if (refreshPromise === pendingRefresh) {
          refreshPromise = null;
        }
      });

    refreshPromise = pendingRefresh;
  }

  return refreshPromise;
};

export { refreshAccessToken };

// Handle responses and expired tokens
api.interceptors.response.use(
  (response) => {
    if (
      response.config._sessionVersion !==
      sessionVersion
    ) {
      return Promise.reject(sessionChangedError());
    }

    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Never retry a request from a previous session
    if (
      originalRequest._sessionVersion !==
      sessionVersion
    ) {
      return Promise.reject(sessionChangedError());
    }

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/demo") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();

        if (
          originalRequest._sessionVersion !==
          sessionVersion
        ) {
          throw sessionChangedError();
        }

        originalRequest.headers.Authorization =
          `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
