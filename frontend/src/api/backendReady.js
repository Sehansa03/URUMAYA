import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const MAX_WAIT = 180000;
const CHECK_TIMEOUT = 15000;
const RETRY_DELAY = 3000;
const READY_CACHE_TIME = 60000;

let readinessPromise = null;
let lastReadyAt = 0;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const invalidateBackendReadiness = () => {
  lastReadyAt = 0;
};

export const waitForBackend = async () => {
  // No additional checks during local development
  if (import.meta.env.DEV) {
    return;
  }

  if (Date.now() - lastReadyAt < READY_CACHE_TIME) {
    return;
  }

  // Share one readiness check across concurrent requests
  if (readinessPromise) {
    return readinessPromise;
  }

  readinessPromise = (async () => {
    const deadline = Date.now() + MAX_WAIT;

    while (Date.now() < deadline) {
      try {
        const response = await axios.get(
          `${API_URL}/health`,
          {
            timeout: Math.min(
              CHECK_TIMEOUT,
              deadline - Date.now()
            ),
            withCredentials: false,
            params: { _t: Date.now() },
          }
        );

        if (
          response.data?.success === true &&
          response.data?.data?.status === "ok"
        ) {
          lastReadyAt = Date.now();
          return;
        }
      } catch {
        // Backend may still be starting
      }

      const remaining = deadline - Date.now();

      if (remaining > 0) {
        await sleep(Math.min(RETRY_DELAY, remaining));
      }
    }

    const error = new Error(
      "The server is temporarily unavailable. Please try again."
    );

    error.code = "BACKEND_NOT_READY";

    throw error;
  })().finally(() => {
    readinessPromise = null;
  });

  return readinessPromise;
};
