// libs/axios.js
import axios from "axios";
import { useToast } from "vue-toastification";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL || "").trim() ||
  "http://localhost:8000/api";
console.log("[API] Using baseURL     =", baseURL);

window.__API_BASE__ = baseURL;

// ✅ FIXED: Better CSRF token management
let csrfFetchPromise = null;
let lastCsrfToken = null;
let csrfTokenTimestamp = null;
const CSRF_TOKEN_VALIDITY = 2 * 60 * 60 * 1000; // 2 hours in ms

function resolveFullUrl(cfg) {
  const u = cfg.url || "";
  if (/^https?:\/\//i.test(u)) return u;
  const b = (cfg.baseURL || "").replace(/\/+$/, "");
  const p = String(u).startsWith("/") ? u : `/${u}`;
  return `${b}${p}`;
}

// ✅ API instance untuk routes dengan prefix `/api`
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

// ✅ API instance untuk Sanctum routes
const sanctumApi = axios.create({
  baseURL:
    (import.meta.env.VITE_BASE_URL || "").trim() || "http://localhost:8000",
  withCredentials: true,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/**
 * Read cookie value by name (safe for browser)
 */
function readCookie(name) {
  if (typeof document === "undefined") return null;
  const pattern = `(?:^|; )${name.replace(
    /([.*+?^${}()|[\]\\])/g,
    "\\$1"
  )}=([^;]*)`;
  const match = document.cookie.match(new RegExp(pattern));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Helper: sinkronkan XSRF token ke semua axios instances
 */
function setXsrfTokenHeader(xsrfToken) {
  if (xsrfToken) {
    sanctumApi.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
    api.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
    lastCsrfToken = xsrfToken;
    csrfTokenTimestamp = Date.now();
    console.log("[API] XSRF token synced to axios instances");
  } else {
    delete sanctumApi.defaults.headers.common["X-XSRF-TOKEN"];
    delete api.defaults.headers.common["X-XSRF-TOKEN"];
    lastCsrfToken = null;
    csrfTokenTimestamp = null;
    console.log("[API] XSRF token cleared from axios instances");
  }
}

/**
 * Helper: baca cookie XSRF-TOKEN dan sinkronkan header
 */
function syncXsrfFromCookie() {
  const xsrf = readCookie("XSRF-TOKEN");
  if (xsrf) {
    setXsrfTokenHeader(xsrf);
  } else {
    setXsrfTokenHeader(null);
  }
}

// ✅ FIXED: Better CSRF token validation
function isCsrfTokenValid() {
  // Check if token exists in cookie
  const cookieToken = readCookie("XSRF-TOKEN");
  if (!cookieToken) {
    console.log("[API] No CSRF token in cookie");
    return false;
  }

  // Check if token matches cached token
  if (lastCsrfToken && cookieToken !== lastCsrfToken) {
    console.log("[API] CSRF token mismatch, needs refresh");
    return false;
  }

  // Check if token is expired (2 hours)
  if (csrfTokenTimestamp) {
    const age = Date.now() - csrfTokenTimestamp;
    if (age > CSRF_TOKEN_VALIDITY) {
      console.log("[API] CSRF token expired");
      return false;
    }
  }

  return true;
}

// ✅ FIXED: Smarter CSRF token fetching
async function ensureCsrfToken() {
  // Check if token is valid
  if (isCsrfTokenValid()) {
    console.log("[API] Using existing valid CSRF token");
    syncXsrfFromCookie();
    return lastCsrfToken;
  }

  // If already fetching, wait for that request
  if (csrfFetchPromise) {
    console.log("[API] CSRF fetch already in progress, waiting...");
    return csrfFetchPromise;
  }

  console.log("[API] Fetching new CSRF token...");

  // Fetch new CSRF token
  csrfFetchPromise = sanctumApi
    .get("/sanctum/csrf-cookie")
    .then(() => {
      syncXsrfFromCookie();
      const token = readCookie("XSRF-TOKEN");
      csrfFetchPromise = null;
      console.log("[API] New CSRF token fetched successfully");
      return token;
    })
    .catch((err) => {
      console.error("[API] CSRF fetch failed:", err);
      csrfFetchPromise = null;
      throw err;
    });

  return csrfFetchPromise;
}

// ✅ Restore auth token from localStorage on module load
function initAuthToken() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("[API] ✅ Auth token restored from localStorage");
    }
  }
}

// Call on module load
initAuthToken();

// Sinkronisasi saat module di-import
try {
  syncXsrfFromCookie();
} catch (e) {
  console.warn(
    "[API] syncXsrfFromCookie failed (non-browser?):",
    e?.message || e
  );
}

// ✅ FIXED: Only ensure CSRF for non-GET requests
api.interceptors.request.use(
  async (config) => {
    const method = (config.method || "get").toUpperCase();

    // Jika payload adalah FormData, biarkan browser yang menentukan
    // header Content-Type (multipart/form-data + boundary)
    if (config.data instanceof FormData) {
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    }

    // ✅ Add Authorization header if token exists in localStorage
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API] Authorization header added");
    }

    // ✅ Only ensure CSRF token for state-changing requests
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await ensureCsrfToken();
    } else {
      // For GET requests, just sync existing token
      if (!isCsrfTokenValid()) {
        console.warn("[API] CSRF token invalid for GET request, syncing...");
        syncXsrfFromCookie();
      }
    }

    const full = resolveFullUrl(config);
    console.log(`[API] → ${method} ${full}`, {
      params: config.params,
      hasData: !!config.data,
      hasCsrfToken: !!api.defaults.headers.common["X-XSRF-TOKEN"],
      hasAuthToken: !!token,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const full = resolveFullUrl(response.config);
    const method = (response.config.method || "get").toUpperCase();
    console.log(`[API] ← ${response.status} ${method} ${full}`);
    return response;
  },
  (error) => {
    const cfg = error.config || {};
    const full = resolveFullUrl(cfg);
    const method = (cfg.method || "get").toUpperCase();

    if (error.response) {
      console.warn(`[API] ✖ ${error.response.status} ${method} ${full}`, {
        data: error.response.data,
      });

      // ✅ Handle 419 (CSRF token mismatch) - Retry once
      if (error.response.status === 419) {
        console.log(
          "[API] 419 CSRF token mismatch, clearing cache and retrying..."
        );

        // Clear cached token
        lastCsrfToken = null;
        csrfTokenTimestamp = null;

        // Don't retry GET requests
        if (method === "GET") {
          return Promise.reject(error);
        }

        // Retry once with new token
        if (!cfg._retry) {
          cfg._retry = true;
          return ensureCsrfToken().then(() => api(cfg));
        }
      }

      // Handle 401 Unauthenticated
        if (error.response.status === 401) {
          console.log("[API] 401 Unauthorized - skipping auto-logout");
          return Promise.reject(error);
      }
    } else {
      console.error(`[API] ✖ ${method} ${full} failed:`, error.message);
    }

    return Promise.reject(error);
  }
);

// ✅ Same for sanctumApi
sanctumApi.interceptors.response.use(
  (response) => {
    const full = resolveFullUrl(response.config);
    const method = (response.config.method || "get").toUpperCase();
    console.log(`[Sanctum API] ← ${response.status} ${method} ${full}`);
    return response;
  },
  (error) => {
    const cfg = error.config || {};
    const full = resolveFullUrl(cfg);
    const method = (cfg.method || "get").toUpperCase();

    if (error.response) {
      console.warn(
        `[Sanctum API] ✖ ${error.response.status} ${method} ${full}`,
        {
          data: error.response.data,
        }
      );

      if (error.response.status === 401 || error.response.status === 419) {
        console.log("[Sanctum API] 401/419 - skipping auto-logout");
        return Promise.reject(error);
      }
    } else {
      console.error(`[Sanctum API] ✖ ${method} ${full} failed:`, error.message);
    }

    return Promise.reject(error);
  }
);

// ✅ Function untuk handle session expired
function handleSessionExpired() {
  // ✅ Only act if we actually have a logged-in session stored
  const hasUserSession = !!localStorage.getItem("user");
  if (!hasUserSession) {
    console.log("[API] Session-expired handler skipped (no stored user)");
    return;
  }

  if (window.location.pathname === "/login") {
    return;
  }

  const toast = useToast();

  localStorage.removeItem("user");
  localStorage.removeItem("selected_merchant_id");

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

// Helper: detect public endpoints
function isPublicEndpoint(fullUrl = "") {
  return fullUrl.includes("/api/public/");
}

// ✅ Export utility to manually refresh CSRF token
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
  readCookie,
  handleSessionExpired,
  ensureCsrfToken,
};
