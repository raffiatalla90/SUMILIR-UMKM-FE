// libs/axios.js
import axios from "axios";
import { useToast } from "vue-toastification";

const baseURL = (import.meta.env.VITE_API_BASE_URL || "").trim() || "http://localhost:8000/api";
console.log("[API] Using baseURL =", baseURL);

// CSRF token cache
let csrfFetchPromise = null;
let lastCsrfToken = null;
let csrfTokenTimestamp = null;
const CSRF_TOKEN_VALIDITY = 2 * 60 * 60 * 1000; // 2 hours

/**
 * 🍪 Read cookie value by name (menggunakan pattern dari readCookie)
 */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const pattern = `(?:^|; )${name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1")}=([^;]*)`;
  const match = document.cookie.match(new RegExp(pattern));
  return match ? decodeURIComponent(match[1]) : null;
}

// API instance untuk routes dengan prefix `/api`
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: Number(import.meta.env.VITE_HTTP_TIMEOUT_MS ?? 20000),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// API instance untuk Sanctum routes
const sanctumApi = axios.create({
  baseURL: (import.meta.env.VITE_BASE_URL || "").trim() || "http://localhost:8000",
  withCredentials: true,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/**
 * Sync XSRF token ke semua axios instances
 */
function setXsrfTokenHeader(xsrfToken) {
  if (xsrfToken) {
    sanctumApi.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
    api.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
    lastCsrfToken = xsrfToken;
    csrfTokenTimestamp = Date.now();
    console.log("[API] XSRF token synced");
  } else {
    delete sanctumApi.defaults.headers.common["X-XSRF-TOKEN"];
    delete api.defaults.headers.common["X-XSRF-TOKEN"];
    lastCsrfToken = null;
    csrfTokenTimestamp = null;
    console.log("[API] XSRF token cleared");
  }
}

/**
 * Sync XSRF dari cookie
 */
function syncXsrfFromCookie() {
  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) {
    setXsrfTokenHeader(xsrf);
  } else {
    setXsrfTokenHeader(null);
  }
}

/**
 * Validasi CSRF token
 */
function isCsrfTokenValid() {
  const cookieToken = getCookie("XSRF-TOKEN");
  if (!cookieToken) return false;

  if (lastCsrfToken && cookieToken !== lastCsrfToken) return false;

  if (csrfTokenTimestamp) {
    const age = Date.now() - csrfTokenTimestamp;
    if (age > CSRF_TOKEN_VALIDITY) return false;
  }

  return true;
}

/**
 * Ensure CSRF token valid
 */
async function ensureCsrfToken() {
  if (isCsrfTokenValid()) {
    syncXsrfFromCookie();
    return lastCsrfToken;
  }

  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }

  console.log("[API] Fetching new CSRF token...");

  csrfFetchPromise = sanctumApi
    .get("/sanctum/csrf-cookie")
    .then(() => {
      syncXsrfFromCookie();
      const token = getCookie("XSRF-TOKEN");
      csrfFetchPromise = null;
      console.log("[API] New CSRF token fetched");
      return token;
    })
    .catch((err) => {
      console.error("[API] CSRF fetch failed:", err);
      csrfFetchPromise = null;
      throw err;
    });

  return csrfFetchPromise;
}

// Initial sync
try {
  syncXsrfFromCookie();
} catch (e) {
  console.warn("[API] Initial sync failed:", e?.message || e);
}

// ⚡ REQUEST INTERCEPTOR for sanctumApi
sanctumApi.interceptors.request.use(
  async (config) => {
    const method = (config.method || "get").toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await ensureCsrfToken();
    } else if (!isCsrfTokenValid()) {
      syncXsrfFromCookie();
    }

    console.log(`[SanctumAPI] → ${method} ${config.url}`, {
      hasCsrfToken: !!sanctumApi.defaults.headers.common["X-XSRF-TOKEN"],
    });

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ⚡ REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
  async (config) => {
    // Bearer token support (backward compatibility)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || "get").toUpperCase();

    // Ensure CSRF token hanya untuk state-changing requests
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await ensureCsrfToken();
    } else if (!isCsrfTokenValid()) {
      syncXsrfFromCookie();
    }

    console.log(`[API] → ${method} ${config.url}`, {
      params: config.params,
      hasData: !!config.data,
      hasCsrfToken: !!api.defaults.headers.common["X-XSRF-TOKEN"],
      hasBearerToken: !!config.headers.Authorization,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 📥 RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
  (response) => {
    const method = (response.config.method || "get").toUpperCase();
    console.log(`[API] ← ${response.status} ${method} ${response.config.url}`);
    return response;
  },
  (error) => {
    const cfg = error.config || {};
    const method = (cfg.method || "get").toUpperCase();

    if (error.response) {
      const status = error.response.status;
      console.warn(`[API] ✖ ${status} ${method} ${cfg.url}`, {
        data: error.response.data,
      });

      // Handle 419 (CSRF token mismatch) - Retry once
      if (status === 419) {
        console.log("[API] 419 CSRF mismatch, retrying...");
        lastCsrfToken = null;
        csrfTokenTimestamp = null;

        if (method !== "GET" && !cfg._retry) {
          cfg._retry = true;
          return ensureCsrfToken().then(() => api(cfg));
        }
      }

      // Handle 401 Unauthenticated
      if (status === 401) {
        console.log("[API] 401 Unauthorized");

        const skipRoutes = ["/login", "/register", "/sanctum/csrf-cookie", "/me"];
        const isSkipRoute = skipRoutes.some((route) => cfg.url?.includes(route));

        if (!isSkipRoute) {
          localStorage.removeItem("token");
          handleSessionExpired();
        }
      }
    } else {
      console.error(`[API] ✖ ${method} ${cfg.url} failed:`, error.message);
    }

    return Promise.reject(error);
  }
);

// Same for sanctumApi
sanctumApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const cfg = error.config || {};

    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 419) {
        const skipRoutes = ["/login", "/register", "/sanctum/csrf-cookie", "/me", "/logout"];
        const isSkipRoute = skipRoutes.some((route) => cfg.url?.includes(route));

        if (!isSkipRoute) {
          handleSessionExpired();
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Handle session expired
 */
function handleSessionExpired() {
  if (window.location.pathname === "/login") return;

  const toast = useToast();

  localStorage.removeItem("user");
  localStorage.removeItem("selected_merchant_id");
  localStorage.removeItem("token");

  setXsrfTokenHeader(null);

  toast.error("Sesi Anda telah habis. Silakan login kembali.", {
    timeout: 4000,
    position: "top-center",
  });

  const currentPath = window.location.pathname;
  const redirectUrl =
    currentPath !== "/" && currentPath !== "/login"
      ? `?redirect=${encodeURIComponent(currentPath)}`
      : "";

  setTimeout(() => {
    window.location.href = `/login${redirectUrl}`;
  }, 500);
}

/**
 * Manually refresh CSRF token
 */
export function refreshCsrfToken() {
  lastCsrfToken = null;
  csrfTokenTimestamp = null;
  return ensureCsrfToken();
}

export default api;
export {
  sanctumApi,
  setXsrfTokenHeader,
  syncXsrfFromCookie,
  getCookie,
  handleSessionExpired,
  ensureCsrfToken,
};