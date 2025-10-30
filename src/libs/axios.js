import axios from "axios";

// Ambil dan log env
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const baseURL = rawBaseUrl || "http://localhost:8000/api";
console.log("[API] VITE_API_BASE_URL =", rawBaseUrl || "(empty)");
console.log("[API] Using baseURL     =", baseURL);
// Ekspos untuk dicek via Console
// eslint-disable-next-line no-undef
window.__API_BASE__ = baseURL;

// Helper: bentuk URL penuh untuk logging
function resolveFullUrl(cfg) {
  const u = cfg.url || "";
  if (/^https?:\/\//i.test(u)) return u; // sudah absolute
  const b = (cfg.baseURL || "").replace(/\/+$/, "");
  const p = String(u).startsWith("/") ? u : `/${u}`;
  return `${b}${p}`;
}

const api = axios.create({
  baseURL,
  withCredentials: String(import.meta.env.VITE_WITH_CREDENTIALS) === "true",
  timeout: Number(import.meta.env.VITE_HTTP_TIMEOUT_MS ?? 20000),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const full = resolveFullUrl(config);
    const method = (config.method || "get").toUpperCase();
    console.log(`[API] → ${method} ${full}`, {
      params: config.params,
      // Hindari log data besar: tampilkan ringkas
      hasData: !!config.data,
      contentType:
        config.headers?.["Content-Type"] || config.headers?.["content-type"],
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
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else {
      console.error(`[API] ✖ ${method} ${full} failed:`, error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
