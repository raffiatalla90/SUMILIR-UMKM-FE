// libs/axios.js
import axios from "axios";

// ✅ Base URL untuk API Laravel (resource API biasanya di /api)
const baseURL =
  (import.meta.env.VITE_API_BASE_URL || "").trim() ||
  "http://localhost:8000/api";
console.log("[API] Using baseURL     =", baseURL);

window.__API_BASE__ = baseURL;

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
  // axios built-in xsrf options (cookie/header names)
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// ✅ API instance untuk Sanctum routes (tanpa prefix `/api`)
const sanctumApi = axios.create({
  // NOTE: this should be the SPA origin (no /api prefix).
  // Ensure VITE_BASE_URL is e.g. "http://localhost:8000"
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
 * - set header X-XSRF-TOKEN di sanctumApi & api
 * - if xsrfToken is falsy, headers are removed
 */
function setXsrfTokenHeader(xsrfToken) {
  if (xsrfToken) {
    sanctumApi.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
    api.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
    console.log("[API] XSRF token synced to axios instances");
  } else {
    delete sanctumApi.defaults.headers.common["X-XSRF-TOKEN"];
    delete api.defaults.headers.common["X-XSRF-TOKEN"];
    console.log("[API] XSRF token cleared from axios instances");
  }
}

/**
 * Helper: baca cookie XSRF-TOKEN dan sinkronkan header
 * - ini dipanggil pada load module agar refresh halaman tetap punya header jika cookie ada
 */
function syncXsrfFromCookie() {
  const xsrf = readCookie("XSRF-TOKEN");
  if (xsrf) {
    setXsrfTokenHeader(xsrf);
  } else {
    // tidak ada cookie, pastikan header cleared
    setXsrfTokenHeader(null);
  }
}

// lakukan sinkronisasi saat module di-import (berguna setelah reload halaman)
try {
  syncXsrfFromCookie();
} catch (e) {
  // ignore for SSR / non-browser env
  console.warn(
    "[API] syncXsrfFromCookie failed (non-browser?):",
    e?.message || e
  );
}

// Request interceptor utk logging
api.interceptors.request.use(
  (config) => {
    const full = resolveFullUrl(config);
    const method = (config.method || "get").toUpperCase();
    console.log(`[API] → ${method} ${full}`, {
      params: config.params,
      hasData: !!config.data,
      contentType:
        config.headers?.["Content-Type"] || config.headers?.["content-type"],
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor utk logging / handling common errors
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
      if (error.response.status === 401) {
        console.log("[API] Unauthorized - session may be expired");
      }
    } else {
      console.error(`[API] ✖ ${method} ${full} failed:`, error.message);
    }
    return Promise.reject(error);
  }
);

// Export instances + helpers
export default api;
export { sanctumApi, setXsrfTokenHeader, syncXsrfFromCookie, readCookie };
