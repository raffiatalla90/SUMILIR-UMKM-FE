import api from "@/libs/axios";

/* =====================================================
 * PUBLIC PRODUCTS
 * ===================================================== */
export async function getPublicProductDetail(slug) {
  const { data } = await api.get(`/api/public/products/${slug}`);
  return data;
}

export async function getPublicProducts(params = {}) {
  const { data } = await api.get("/api/public/products", { params });
  return data;
}

// export async function getMerchantProducts(merchantSlug, params = {}) {
//   const { data } = await api.get(`/api/public/merchants/${merchantSlug}/products`, { params });
//   return data;
// }

/* =====================================================
 * ADMIN / MERCHANT PRODUCTS
 * ===================================================== */
export async function getProducts(params = {}) {
  const { data } = await api.get(`/api/products/`, {
    params,
  });
  return data;
}

export async function getProductDetail(slug) {
  const { data } = await api.get(`/api/products/${slug}`);
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post(`/api/products`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function editProduct(slug, payload) {
  const { data } = await api.post(`/api/products/${slug}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function editStatus(slug, status) {
  const { data } = await api.patch(`/api/products/${slug}/status`, { status });
  return data;
}
export async function deleteProduct(slug) {
  const { data } = await api.delete(`/api/products/${slug}`);
  return data;
}

export async function deleteBulk(productSlugs = []) {
  const { data } = await api.post(`/api/products/bulk-delete`, {
    product_slugs: productSlugs,
  });
  return data;
}

export async function editBulkStatus(productSlugs = [], status) {
  const { data } = await api.post(`/api/products/bulk-update-status`, {
    product_slugs: productSlugs,
    status,
  });
  return data;
}

export async function exportPDF(params = {}) {
  return api.get(`/api/products/export/pdf`, {
    params,
    responseType: "blob",
  });
}

export async function exportExcel(params = {}) {
  return api.get(`/api/products/export/excel`, {
    params,
    responseType: "blob",
  });
}
