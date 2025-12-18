// src/libs/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

/**
 * 🛠 Helper untuk membaca cookie browser
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    // Kita harus men-decode karena cookie dari PHP biasanya di-URL-encode (ada %3D dll)
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
}

/**
 * ⚡ REQUEST INTERCEPTOR
 * Tugas: Ambil cookie XSRF-TOKEN, lalu tempel ke Header X-XSRF-TOKEN
 */
api.interceptors.request.use((config) => {
  const token = getCookie("XSRF-TOKEN");

  if (token) {
    config.headers["X-XSRF-TOKEN"] = token;
  }

  return config;
});

<<<<<<< HEAD
// Response Interceptor (Biarkan seperti kode Anda sebelumnya)
=======
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
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
<<<<<<< HEAD
      const status = error.response.status;
      if (status === 401) console.warn("Unauthenticated (401)");
      if (status === 419) console.warn("CSRF token mismatch (419)");
=======
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
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
    }
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
=======
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

>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
export default api;
