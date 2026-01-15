import api from "@/libs/axios";

/**
 * Search produk publik
 * @param {Object} params - Query params (q, min_price, max_price, categories, segments, sort, page, per_page, dll)
 * @returns {Promise<Object>} - Response dari API
 */
export async function searchProducts(params = {}) {
  const res = await api.get("/api/public/search", { params });
  return res.data;
}

/**
 * Search merchant publik
 * @param {Object} params - Query params (q, categories, segments, sort, page, per_page, dll)
 * @returns {Promise<Object>} - Response dari API
 */
export async function searchMerchants(params = {}) {
  const res = await api.get("/api/public/search-merchants", { params });
  return res.data;
}
