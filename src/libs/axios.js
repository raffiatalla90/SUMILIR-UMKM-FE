// libs/axios.js
import axios from "axios";
import { useToast } from "vue-toastification";
const toast = useToast();

const baseURL =
  (import.meta.env.VITE_API_BASE_URL || "").trim() ||
  "http://localhost:8000/api";

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
  } else {
    delete sanctumApi.defaults.headers.common["X-XSRF-TOKEN"];
    delete api.defaults.headers.common["X-XSRF-TOKEN"];
    lastCsrfToken = null;
    csrfTokenTimestamp = null;
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
    return false;
  }

  // Check if token matches cached token
  if (lastCsrfToken && cookieToken !== lastCsrfToken) {
    return false;
  }

  // Check if token is expired (2 hours)
  if (csrfTokenTimestamp) {
    const age = Date.now() - csrfTokenTimestamp;
    if (age > CSRF_TOKEN_VALIDITY) {
      return false;
    }
  }

  return true;
}

// ✅ FIXED: Smarter CSRF token fetching
async function ensureCsrfToken() {
  // Check if token is valid
  if (isCsrfTokenValid()) {
    syncXsrfFromCookie();
    return lastCsrfToken;
  }

  // If already fetching, wait for that request
  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }

  // Fetch new CSRF token
  csrfFetchPromise = sanctumApi
    .get("/sanctum/csrf-cookie")
    .then(() => {
      syncXsrfFromCookie();
      const token = readCookie("XSRF-TOKEN");
      csrfFetchPromise = null;
      return token;
    })
    .catch((err) => {
      csrfFetchPromise = null;
      toast.error("Gagal mengambil token CSRF: " + (err?.message || err));
      throw err;
    });

  return csrfFetchPromise;
}

// Sinkronisasi saat module di-import
try {
  syncXsrfFromCookie();
} catch (e) {
  toast.warning(
    "Gagal sinkronisasi token XSRF dari cookie :" + e?.message || e
  );
}

// ✅ FIXED: Only ensure CSRF for non-GET requests
api.interceptors.request.use(
  async (config) => {
    const method = (config.method || "get").toUpperCase();

    // ✅ Only ensure CSRF token for state-changing requests
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await ensureCsrfToken();
    } else {
      // For GET requests, just sync existing token
      if (!isCsrfTokenValid()) {
        syncXsrfFromCookie();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const cfg = error.config || {};
    const full = resolveFullUrl(cfg);
    const method = (cfg.method || "get").toUpperCase();

    if (error.response) {
      // ✅ Handle 419 (CSRF token mismatch) - Retry once
      if (error.response.status === 419) {
        toast.error("Token CSRF tidak valid. Mencoba memperbarui sesi...");

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
        toast.error("Sesi Anda telah habis. Silakan login kembali.");

        const skipRoutes = [
          "/login",
          "/register",
          "/sanctum/csrf-cookie",
          "/me",
        ];
        const isSkipRoute = skipRoutes.some((route) => full.includes(route));

        if (!isSkipRoute) {
          handleSessionExpired();
        }
      }
    } else {
      toast.error("Koneksi ke server gagal. Silakan coba lagi.");
    }

    return Promise.reject(error);
  }
);

// ✅ Same for sanctumApi
sanctumApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const cfg = error.config || {};
    const full = resolveFullUrl(cfg);
    const method = (cfg.method || "get").toUpperCase();

    if (error.response) {
      if (error.response.status === 401 || error.response.status === 419) {
        const skipRoutes = [
          "/login",
          "/register",
          "/sanctum/csrf-cookie",
          "/me",
          "/logout",
        ];
        const isSkipRoute = skipRoutes.some((route) => full.includes(route));

        if (!isSkipRoute) {
          handleSessionExpired();
        }
      }
    } else {
      toast.error("Koneksi ke server gagal. Silakan coba lagi.");
    }

    return Promise.reject(error);
  }
);

// ✅ Function untuk handle session expired
function handleSessionExpired() {
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
