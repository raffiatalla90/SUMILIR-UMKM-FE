// composables/useProducts.js
// composables/useProducts.js
import { ref } from "vue";
import api from "@/libs/axios";
import { getImageUrl } from "@/libs/getImageUrl.js";

function buildImageUrl(img) {
  if (!img) return "";
  // Jika backend kirim object image dengan id → gunakan getImageUrl
  if (typeof img === "object") {
    // prioritas: id → getImageUrl, fallback ke url/path/image_path jika ada
    if (img.id) return getImageUrl(img.id);
    return img.url || img.path || img.image_path || "";
  }
  // Jika string (sudah berupa URL)
  return img;
}

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
  // Track last request to prevent duplicates
  let lastRequestParams = null;
  let pendingRequest = null;

  // Fetch Product Detail (admin scope?) -- pastikan endpoint sesuai
  const fetchProductDetail = async (productSlug) => {
    try {
      const response = await api.get(`/products/${productSlug}`);
      // Jika endpoint public, ganti ke: api.get(`/public/products/${productSlug}`)
      const payload = response.data?.data ?? response.data;
      if (!payload)
        throw new Error("Product data tidak ditemukan pada response");

      // normalisasi kecil
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

  /**
   * Fetch products dari backend
   */
  const fetchProducts = async ({
    merchantId,
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
      loading.value &&
      lastRequestParams === requestSignature &&
      pendingRequest
    ) {
      return pendingRequest;
    }

    // jika request sama dengan request terakhir yang selesai -> pakai cache lokal
    if (lastRequestParams === requestSignature && !loading.value) {
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
        const { data } = await api.get("/products", { params });
        const payload = data.data || data;

        products.value = payload.data || payload; // tergantung response shape
        if (data.meta) {
          pagination.value = {
            current_page: data.meta.current_page,
            last_page: data.meta.last_page,
            per_page: data.meta.per_page,
            total: data.meta.total,
          };
        }

        return data; // kembalikan bentuk yang sama seperti sebelumnya
      } catch (error) {
        toast.error("Gagal memuat produk");
        lastRequestParams = null;
        throw error;
      } finally {
        loading.value = false;
        pendingRequest = null;
      }
    })();

    return pendingRequest;
  };

  // Delete, update, bulk ops (tetap seperti yang kamu tulis)
  const deleteProduct = async (productSlug) => {
    loading.value = true;
    try {
      await api.delete(`/products/${productSlug}`);
      products.value = products.value.filter((p) => p.slug !== productSlug);
      pagination.value.total = Math.max(0, pagination.value.total - 1);
    } catch (error) {
      toast.error("Gagal menghapus produk");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateProductStatus = async (productSlug, status) => {
    loading.value = true;
    try {
      const { data } = await api.patch(`/products/${productSlug}/status`, {
        status,
      });
      const index = products.value.findIndex((p) => p.slug === productSlug);
      if (index !== -1) products.value[index].status = status;
      return data;
    } catch (error) {
      toast.error("Gagal memperbarui status produk");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteProducts = async (productSlugs) => {
    loading.value = true;
    try {
      await api.post("/products/bulk-delete", { product_slugs: productSlugs });
      products.value = products.value.filter(
        (p) => !productSlugs.includes(p.slug)
      );
      pagination.value.total = Math.max(
        0,
        pagination.value.total - productSlugs.length
      );
    } catch (error) {
      toast.error("Gagal menghapus produk secara massal");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const bulkUpdateStatus = async (productSlugs, status) => {
    loading.value = true;
    try {
      await api.post("/products/bulk-update-status", {
        product_slugs: productSlugs,
        status,
      });
      products.value.forEach((product) => {
        if (productSlugs.includes(product.slug)) product.status = status;
      });
    } catch (error) {
      toast.error("Gagal memperbarui status produk secara massal");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsToko = async (limit = 12) => {
    loading.value = true;
    try {
      const { data } = await api.get("/public/products/toko", {
        params: { limit },
      });
      return data.data || [];
    } catch (error) {
      toast.error("Gagal memuat produk toko");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsKuliner = async (limit = 12) => {
    loading.value = true;
    try {
      const { data } = await api.get("/public/products/kuliner", {
        params: { limit },
      });
      return data.data || [];
    } catch (error) {
      toast.error("Gagal memuat produk kuliner");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Public product detail (UI-friendly mapping)
   * Pastikan import buildImageUrl ada, dan axios support `signal` kalau kamu gunakan
   */
  const fetchPublicProductDetail = async (slug, { signal } = {}) => {
    if (!slug || typeof slug !== "string") throw new Error("Invalid slug");

    const res = await api.get(`/public/products/${encodeURIComponent(slug)}`, {
      signal,
    });
    const payload = res.data ?? {};
    const productObj = payload.product ?? null;
    if (!productObj) {
      return {
        product: null,
        price_range: { min: null, max: null },
        total_stock: 0,
        has_variants: false,
        has_addons: false,
        combinations: [],
        option_labels: { option1: null, option2: null },
        min_purchase: 1,
        merchant_address: null,
        related_products: [],
        productImages: [],
        sizes: [],
        variants: [],
        stockCombinations: [],
        selectedSize: null,
        selectedVariant: null,
        addonGroups: [],
        selectedAddons: [],
      };
    }

    // mapping (sama seperti implementasimu)
    const variantsFromBackend = productObj.variants ?? [];
    const priceRange = {
      min: variantsFromBackend.length
        ? Math.min(...variantsFromBackend.map((v) => Number(v.price ?? 0)))
        : null,
      max: variantsFromBackend.length
        ? Math.max(...variantsFromBackend.map((v) => Number(v.price ?? 0)))
        : null,
    };

    const imgs = Array.isArray(productObj.images)
      ? productObj.images.slice()
      : [];
    imgs.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const productImages = imgs.length
      ? imgs.map((img) =>
          typeof buildImageUrl === "function" ? buildImageUrl(img) : img
        )
      : productObj.cover_image
      ? [
          typeof buildImageUrl === "function"
            ? buildImageUrl(productObj.cover_image)
            : productObj.cover_image,
        ]
      : [];

    const options = Array.isArray(productObj.options) ? productObj.options : [];
    const opt1 = options[0] ?? null;
    const opt2 = options[1] ?? null;

    const sizesRes = (opt1?.values ?? [])
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((v) => ({ id: v.id, name: v.option_value, priceAdd: 0 }));
    const variantsRes = (opt2?.values ?? [])
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((v) => ({ id: v.id, name: v.option_value, priceAdd: 0 }));

    const rawCombinations = Array.isArray(payload.combinations)
      ? payload.combinations
      : [];
    const combinations = rawCombinations.map((c) => ({
      product_variant_id: c.product_variant_id ?? null,
      sizeId: Number(c.sizeId ?? 0),
      variantId: Number(c.variantId ?? 0),
      price: Number(c.price ?? productObj.price ?? 0),
      stock: Number(c.stock ?? 0),
      sku: c.sku ?? null,
    }));

    const stockCombinations = combinations.map((c) => ({ ...c }));

    const sizeWithStock = sizesRes.find((s) =>
      stockCombinations.some(
        (c) => Number(c.sizeId) === Number(s.id) && Number(c.stock) > 0
      )
    );
    const selectedSize = sizeWithStock ?? sizesRes[0] ?? null;

    let selectedVariant = null;
    if (variantsRes.length > 0) {
      const sizeKey = selectedSize?.id ?? 0;
      const variantWithStock = variantsRes.find((v) =>
        stockCombinations.some(
          (c) =>
            Number(c.sizeId) === Number(sizeKey) &&
            Number(c.variantId) === Number(v.id) &&
            Number(c.stock) > 0
        )
      );
      selectedVariant = variantWithStock ?? variantsRes[0] ?? null;
    }

    const addonGroups =
      Array.isArray(productObj.addon_groups) && productObj.addon_groups.length
        ? productObj.addon_groups.map((g) => ({
            id: g.id,
            name: g.addon_group_name || g.name,
            description: g.description || null,
            required: Number(g.min_selection ?? 0) > 0,
            maxSelection: Number(g.max_selection ?? 1),
            items: Array.isArray(g.options)
              ? g.options.map((opt) => ({
                  id: opt.id,
                  name: opt.addon?.addon_name || opt.name,
                  price: Number(opt.addon_price ?? 0),
                  description: opt.description || null,
                  available:
                    opt.addon_stock == null || Number(opt.addon_stock) > 0,
                }))
              : [],
          }))
        : [];

    const selectedAddons = [];
    if (addonGroups.length) {
      addonGroups.forEach((group) => {
        if (group.required && group.maxSelection === 1 && group.items.length) {
          const firstAvailable = group.items.find((it) => it.available);
          if (firstAvailable) selectedAddons.push(firstAvailable);
        }
      });
    }

    const addr = productObj.merchant?.primaryAddress ?? null;
    const merchant_address =
      addr?.full_address ??
      ([
        addr?.detail,
        addr?.village?.name,
        addr?.district?.name,
        addr?.city?.name,
        addr?.province?.name,
      ]
        .filter(Boolean)
        .join(", ") ||
        null);

    const related_products = Array.isArray(payload.related_products)
      ? payload.related_products
      : [];

    const total_stock = variantsFromBackend.reduce(
      (acc, v) => acc + Number(v.stock ?? 0),
      0
    );
    const has_variants = variantsFromBackend.length > 0;
    const has_addons =
      Array.isArray(productObj.addon_groups) &&
      productObj.addon_groups.length > 0;
    const option_labels = {
      option1: opt1 ? opt1.option_name : null,
      option2: opt2 ? opt2.option_name : null,
    };
    const min_purchase = Number(
      payload.min_purchase ?? productObj.min_purchase ?? 1
    );

    return {
      product: productObj,
      price_range: priceRange,
      total_stock,
      has_variants,
      has_addons,
      combinations,
      option_labels,
      min_purchase,
      merchant_address,
      related_products,

        productImages,
        sizes: sizesRes,
        // keep variantsRes (option2 values) in case other logic depends on it
        variantValues: variantsRes,
        // MAIN: normalizedVariants for UI usage (each variant includes .options array)
        variants: normalizedVariants,

        stockCombinations,
        selectedSize,
        selectedVariant,
        addonGroups,
        selectedAddons,
        optionDefinitions: normalizedOptions,
      };
    } catch (err) {
      toast.error("Gagal memuat detail produk");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // SINGLE RETURN STATEMENT AT THE END (tambahkan fetchPublicProductDetail)
  return {
    products,
    loadingExport,
    loadingFetchProducts,
    loading,
    pagination,
    fetchProducts,
    fetchProductDetail,
    fetchPublicProductDetail, // <-- expose function ini
    updateProductStatus,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateStatus,
    fetchProductsToko,
    fetchProductsKuliner,
  };
}
