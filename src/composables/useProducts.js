import { ref } from "vue";
import api from "@/libs/axios";

export function useProducts() {
  const products = ref([]);
  const loading = ref(true);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // ✅ Fetch Product Detail from API
  const fetchProductDetail = async (productId) => {
    // NOTE: composable tidak boleh mengakses router/toast/mounted state yang spesifik UI
    try {
      const response = await api.get(`/products/${productId}`);
      // backend mungkin mengembalikan object langsung atau wrapper. Normalisasi:
      const payload = response.data?.data ?? response.data;

      if (!payload) {
        throw new Error("Product data tidak ditemukan pada response");
      }

      // Transformasi ringan: addon_groups -> addonGroups (agar consumer konsisten)
      if (payload.addon_groups) {
        payload.addonGroups = payload.addon_groups;
        // optional: delete payload.addon_groups;
      }

      // Pastikan images adalah array (komponen mengandalkan images[])
      if (!Array.isArray(payload.images)) {
        payload.images = payload.images ? [payload.images] : [];
      }

      // Return raw payload; komponen akan memproses/menambahkan getImageUrl
      return payload;
    } catch (err) {
      console.error("[useProducts] fetchProductDetail error:", err);
      // biarkan error dilempar agar komponen dapat menanganinya (toast / redirect)
      throw err;
    }
  };

  /**
   * Fetch products dari backend
   */
  const fetchProducts = async (filters = {}) => {
    loading.value = true;
    try {
      // Map frontend filter keys to backend API keys
      const params = {
        q: filters.searchQuery || undefined,
        status: filters.status || undefined,
        category_id: filters.category || undefined, // FIXED: Use category_id
        min_price: filters.minPrice || undefined,
        max_price: filters.maxPrice || undefined,
        min_stock: filters.minStock || undefined,
        max_stock: filters.maxStock || undefined,
        sort_by: filters.sortBy || "newest",
        per_page: filters.perPage || 15,
        page: filters.page || 1,
      };

      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get("/products", { params });

      products.value = response.data.data || [];

      // Update pagination info
      pagination.value = {
        current_page: response.data.meta.current_page || 1,
        last_page: response.data.meta.last_page || 1,
        per_page: response.data.meta.per_page || 15,
        total: response.data.meta.total || 0,
      };

      return response.data;
    } catch (error) {
      console.error("[useProducts] Error fetching products:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update product status (single)
   */
  const updateProductStatus = async (productId, status) => {
    loading.value = true;
    try {
      // ✅ UPDATED: Gunakan endpoint khusus /products/{id}/status
      const response = await api.patch(`/products/${productId}/status`, {
        status,
      });

      // Update local state
      const index = products.value.findIndex((p) => p.id === productId);
      if (index !== -1) {
        products.value[index].status = status;
      }

      return response.data;
    } catch (error) {
      console.error("[useProducts] Error updating status:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete product
   */
  const deleteProduct = async (productId) => {
    loading.value = true;
    try {
      await api.delete(`/products/${productId}`);

      // Remove from local state
      products.value = products.value.filter((p) => p.id !== productId);
      pagination.value.total -= 1;

      return true;
    } catch (error) {
      console.error("[useProducts] Error deleting product:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Bulk delete products
   */
  const bulkDeleteProducts = async (productIds) => {
    loading.value = true;
    try {
      // Backend doesn't have bulk delete endpoint, so delete one by one
      await Promise.all(productIds.map((id) => api.delete(`/products/${id}`)));

      // Remove from local state
      products.value = products.value.filter((p) => !productIds.includes(p.id));
      pagination.value.total -= productIds.length;

      return true;
    } catch (error) {
      console.error("[useProducts] Error bulk deleting:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Bulk update status
   */
  const bulkUpdateStatus = async (productIds, status) => {
    loading.value = true;
    try {
      // ✅ UPDATED: Gunakan endpoint khusus /products/{id}/status
      await Promise.all(
        productIds.map((id) => api.patch(`/products/${id}/status`, { status }))
      );

      // Update local state
      products.value.forEach((product) => {
        if (productIds.includes(product.id)) {
          product.status = status;
        }
      });

      return true;
    } catch (error) {
      console.error("[useProducts] Error bulk updating status:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

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
  };
}
