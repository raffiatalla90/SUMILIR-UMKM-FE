import api from "@/libs/axios";

/**
 * Register merchant/UMKM
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} [payload.description]
 * @param {number} payload.segmentation_id
 * @param {Object} payload.address
 * @param {number} payload.address.province_id
 * @param {number} payload.address.city_id
 * @param {number} payload.address.district_id
 * @param {number} payload.address.village_id
 * @param {string|null} [payload.address.detail]
 * @param {number} payload.address.latitude
 * @param {number} payload.address.longitude
 * @param {Object} [config] axios config override (timeout, headers, dsb.)
 */
export async function registerMerchant(payload, config = {}) {
  const defaultTimeout = Number(import.meta.env.VITE_HTTP_TIMEOUT_MS) || 20000; // 20s default

  const { data } = await api.post("/api/merchant-register", payload, {
    timeout: config.timeout ?? defaultTimeout,
    ...config,
  });

  return data;
}
export async function getMerchants() {
  try {
    const res = await axios.get("http://localhost:8000/api/merchants");
    return res.data;
  } catch (err) {
    console.error("Gagal memuat merchants:", err);
    return [];
  }
}