import { ref } from "vue";
import api from "@/libs/axios";

export function useProducts() {
  const products = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // ✅ ADD: Track last request to prevent duplicates
  let lastRequestParams = null;
  let pendingRequest = null;

  // ✅ Fetch Product Detail dari API menggunakan slug
  const fetchProductDetail = async (productSlug) => {
    try {
      const response = await api.get(`/products/${productSlug}`); // ✅ slug
      const payload = response.data?.data ?? response.data;
      if (!payload)
        throw new Error("Product data tidak ditemukan pada response");

      if (payload.addon_groups) {
        payload.addonGroups = payload.addon_groups;
      }
      if (!Array.isArray(payload.images)) {
        payload.images = payload.images ? [payload.images] : [];
      }
      return payload;
    } catch (err) {
      console.error("[useProducts] fetchProductDetail error:", err);
      throw err;
    }
  };

  /**
   * Fetch products dari backend
   */
  const fetchProducts = async ({
    merchantId, // ✅ NEW: Required parameter
    searchQuery = "",
    status = "",
    category = "",
    minPrice = null,
    maxPrice = null,
    minStock = null,
    maxStock = null,
    sortBy = "newest",
    perPage = 15,
    page = 1,
  } = {}) => {
    // ✅ ADD: Validate merchantId
    if (!merchantId) {
      console.error("[fetchProducts] merchantId is required");
      return;
    }

    // ✅ ADD: Create request signature
    const requestSignature = JSON.stringify({
      merchantId,
      searchQuery,
      status,
      category,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortBy,
      perPage,
      page,
    });

    // ✅ ADD: Check if same request is already in progress
    if (loading.value && lastRequestParams === requestSignature) {
      console.warn(
        "[fetchProducts] Duplicate request detected, waiting for pending request..."
      );
      return pendingRequest;
    }

    // ✅ ADD: Check if request is identical to last completed request
    if (lastRequestParams === requestSignature && !loading.value) {
      console.log("[fetchProducts] Using cached result");
      return { data: products.value, meta: pagination.value };
    }

    lastRequestParams = requestSignature;
    loading.value = true;

    const params = {
      merchant_id: merchantId,
      q: searchQuery || undefined,
      status: status || undefined,
      category_id: category || undefined,
      min_price: minPrice ?? undefined,
      max_price: maxPrice ?? undefined,
      min_stock: minStock ?? undefined,
      max_stock: maxStock ?? undefined,
      sort_by: sortBy || "newest",
      per_page: perPage,
      page,
    };

    // Remove undefined values
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    console.log("[fetchProducts] Request params:", params);

    try {
      // ✅ Store pending request promise
      pendingRequest = api.get("/products", { params });
      const { data } = await pendingRequest;

      products.value = data.data || [];

      if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
        };
      }

      console.log("[fetchProducts] Success:", {
        products: products.value.length,
        total: pagination.value.total,
      });

      return data;
    } catch (error) {
      console.error("[fetchProducts] Error:", error);
      lastRequestParams = null; // Reset on error
      throw error;
    } finally {
      loading.value = false;
      pendingRequest = null;
    }
  };

  /**
   * Delete product
   */
  const deleteProduct = async (productSlug) => {
    loading.value = true;
    try {
      await api.delete(`/products/${productSlug}`); // ✅ slug
      products.value = products.value.filter((p) => p.slug !== productSlug);
      pagination.value.total = Math.max(0, pagination.value.total - 1);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update product status (single)
   */
  const updateProductStatus = async (productSlug, status) => {
    loading.value = true;
    try {
      const { data } = await api.patch(`/products/${productSlug}/status`, {
        status,
      }); // ✅ slug
      const index = products.value.findIndex((p) => p.slug === productSlug);
      if (index !== -1) products.value[index].status = status;
      return data;
    } catch (error) {
      console.error("Error updating product status:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Bulk delete products
   */
  const bulkDeleteProducts = async (productSlugs) => {
    loading.value = true;
    try {
      await api.post("/products/bulk-delete", {
        product_slugs: productSlugs, // ✅ FIXED: use slugs not ids
      });

      // Remove deleted products from local state
      products.value = products.value.filter(
        (p) => !productSlugs.includes(p.slug) // ✅ FIXED: compare with slug
      );
      pagination.value.total -= productSlugs.length;
    } catch (error) {
      console.error("Error bulk deleting products:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Bulk update status
   */
  const bulkUpdateStatus = async (productSlugs, status) => {
    loading.value = true;
    try {
      await api.post("/products/bulk-update-status", {
        product_slugs: productSlugs, // ✅ FIXED: use slugs not ids
        status,
      });

      // Update local product statuses
      products.value.forEach((product) => {
        if (productSlugs.includes(product.slug)) {
          product.status = status;
        }
      });
    } catch (error) {
      console.error("Error bulk updating status:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch random products for Toko homepage
   */
  const fetchProductsToko = async (limit = 12) => {
    loading.value = true;
    try {
      const { data } = await api.get("/public/products/toko", {
        params: { limit },
      });

      return data.data || [];
    } catch (error) {
      console.error("[fetchProductsToko] Error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch random products for Kuliner homepage
   */
  const fetchProductsKuliner = async (limit = 12) => {
    loading.value = true;
    try {
      const { data } = await api.get("/public/products/kuliner", {
        params: { limit },
      });

      return data.data || [];
    } catch (error) {
      console.error("[fetchProductsKuliner] Error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // ✅ SINGLE RETURN STATEMENT AT THE END
  return {
    products,
    loading,
    pagination,
    fetchProducts,
    fetchProductDetail,
    updateProductStatus,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateStatus,
    fetchProductsToko,
    fetchProductsKuliner,
  };
}
