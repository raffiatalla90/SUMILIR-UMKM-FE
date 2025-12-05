// composables/useProducts.js
import { ref } from "vue";
import { getVariantImageUrl } from "@/libs/getVariantImageUrl.js";
import * as ProductService from "@/services/api/product";
import { useToast } from "vue-toastification";
import { saveBlob } from "@/libs/saveBlob.js";

export function useProducts() {
  const toast = useToast();
  const products = ref([]);
  const loading = ref(false);
  const loadingFetchProducts = ref(true);
  const loadingExport = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Track last request to prevent duplicates
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
    merchantId,
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
    if (!merchantId) {
      toast.error("Merchant ID diperlukan untuk memuat produk");
      return;
    }

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

    // jika request sedang berjalan dengan signature sama, kembalikan promise yang sama
    if (
      loadingFetchProducts.value &&
      lastRequestParams === requestSignature &&
      pendingRequest
    ) {
      return pendingRequest;
    }

    // jika request sama dengan request terakhir yang selesai -> pakai cache lokal
    if (lastRequestParams === requestSignature && !loadingFetchProducts.value) {
      return { data: products.value, meta: pagination.value };
    }

    lastRequestParams = requestSignature;
    loadingFetchProducts.value = true;

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
    Object.keys(params).forEach(
      (k) => params[k] === undefined && delete params[k]
    );

    // Buat pendingRequest sebagai promise yang mengembalikan `data` (konsisten)
    pendingRequest = (async () => {
      try {
        const data = await ProductService.getProducts(params);
        const payload = data.data || data;

        products.value = payload.data || payload;

        if (data.meta) {
          pagination.value = {
            current_page: data.meta.current_page,
            last_page: data.meta.last_page,
            per_page: data.meta.per_page,
            total: data.meta.total,
          };
        }

        return data;
      } catch (error) {
        toast.error("Gagal memuat produk");
        lastRequestParams = null;
        throw error;
      } finally {
        loadingFetchProducts.value = false;
        pendingRequest = null;
      }
    })();

    return pendingRequest;
  };

  const fetchProductDetail = async (productSlug) => {
    try {
      const payload = await ProductService.getProductDetail(productSlug);
      if (!payload) throw new Error("Product data tidak ditemukan");

      if (payload.addon_groups) payload.addonGroups = payload.addon_groups;
      if (!Array.isArray(payload.images)) {
        payload.images = payload.images ? [payload.images] : [];
      }

      return payload;
    } catch (err) {
      toast.error("Gagal memuat detail produk");
      throw err;
    }
  };

  const exportPDF = async (params = {}) => {
    if (loadingExport.value) return;
    loadingExport.value = true;
    try {
      const res = await ProductService.exportPDF(params);

      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename =
        match?.[1] ||
        `products-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:T]/g, "")}.pdf`;

      saveBlob(res.data, filename);
      toast.success("Export PDF berhasil diunduh");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal export PDF");
    }
    loadingExport.value = false;
  };

  const exportExcel = async (params = {}) => {
    if (loadingExport.value) return;
    loadingExport.value = true;
    try {
      const res = await ProductService.exportExcel(params);

      // Ambil nama file dari header jika ada
      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename =
        match?.[1] ||
        `products-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:T]/g, "")}.xlsx`;

      saveBlob(res.data, filename);
      toast.success("Export Excel berhasil diunduh");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal export Excel");
    } finally {
      loadingExport.value = false;
    }
  };

  const deleteProduct = async (productSlug) => {
    loading.value = true;
    try {
      await ProductService.deleteProduct(productSlug);
      products.value = products.value.filter((p) => p.slug !== productSlug);
      pagination.value.total = Math.max(0, pagination.value.total - 1);
      toast.success("Produk berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus produk");
      throw error;
    } finally {
      loading.value = false;
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
      toast.error("Gagal memperbarui status produk");
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
      toast.error("Gagal menghapus produk secara massal");
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
      toast.error("Gagal memperbarui status produk secara massal");
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
    loadingExport,
    loadingFetchProducts,
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
