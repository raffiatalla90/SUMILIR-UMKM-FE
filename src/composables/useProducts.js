// composables/useProducts.js
import { ref } from "vue";
import api from "@/libs/axios";
import { getVariantImageUrl } from "@/libs/getVariantImageUrl.js";
import * as ProductService from "@/services/api/product";

export function useProducts() {
  const products = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Track last request to prevent duplicates
  let lastRequestParams = null;
  let pendingRequest = null;

  // Fetch Product Detail (admin scope?) -- pastikan endpoint sesuai
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
      await ProductService.deleteProduct(productSlug);
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
      await ProductService.editStatus(productSlug, status);
      const index = products.value.findIndex((p) => p.slug === productSlug);
      if (index !== -1) products.value[index].status = status;
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
      await ProductService.deleteBulk(productSlugs);
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
      await ProductService.editBulkStatus(productSlugs, status);
      products.value.forEach((product) => {
        if (productSlugs.includes(product.slug)) {
          product.status = status;
        }
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
      const data = await ProductService.getPublicProducts({
        segments: ["UMKM Toko"],
        limit,
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
      const data = await ProductService.getPublicProducts({
        segments: ["UMKM Kuliner"],
        limit,
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
  const fetchPublicProductDetail = async (slug) => {
    loading.value = true;
    try {
      if (!slug || typeof slug !== "string") throw new Error("Invalid slug");

      const payload = await ProductService.getPublicProductDetail(slug);

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
        ? imgs.map((img) => img?.src_url || null).filter(Boolean)
        : productObj.cover_image?.src_url
        ? [productObj.cover_image.src_url]
        : [];

      const options = Array.isArray(productObj.options)
        ? productObj.options
        : [];
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
      // 1) normalisasi option values pada productObj.options (simpan image_url/image_path)
      const normalizedOptions = options.map((opt) => ({
        id: opt.id, // product_option id (group)
        product_id: opt.product_id,
        option_name: opt.option_name ?? opt.name,
        uses_image: !!opt.uses_image,
        values: (opt.values ?? []).map((v) => {
          const preview =
            v.image_url ||
            (v.image_path
              ? typeof absoluteImagePath === "function"
                ? absoluteImagePath(v.image_path)
                : _absoluteImagePath(v.image_path)
              : null) ||
            getVariantImageUrl(v.id) ||
            null;

          return {
            // KEEP db id here — this is the DB identifier we will use for image endpoint
            dbId: v.id, // <-- sangat penting: id dari DB (product_option_value.id)
            id: v.id, // juga keep id if other code expects it
            product_option_id: v.product_option_id,
            option_value: v.option_value,
            image_path: v.image_path ?? null,
            image_url: v.image_url ?? null,
            preview, // convenience
          };
        }),
      }));

      // 2) normalisasi variants: buat property `options` yang dipakai template
      // backend punya `option_values` (lihat payload). Map itu ke struktur yang template pakai.
      const normalizedVariants = (productObj.variants ?? []).map((v) => {
        const optionValues = v.option_values ?? v.optionValues ?? [];
        const optionsForTemplate = optionValues.map((val) => {
          const preview =
            val.image_url ||
            (val.image_path
              ? typeof absoluteImagePath === "function"
                ? absoluteImagePath(val.image_path)
                : _absoluteImagePath(val.image_path)
              : null) ||
            getVariantImageUrl(val.id) ||
            null;

          const imagesArray = [];
          if (preview) {
            imagesArray.push({
              preview,
              image_url: val.image_url ?? null,
              image_path: val.image_path ?? null,
              existing: true,
            });
          }

          return {
            // CRITICAL: use DB id here so getVariantImageUrl works with val.id
            dbId: val.id,
            id: val.id, // keep for compatibility
            name: val.option_value ?? val.name ?? "",
            image_path: val.image_path ?? null,
            image_url: val.image_url ?? null,
            images: imagesArray,
          };
        });

        return {
          ...v,
          display_image: v.display_image ?? null,
          options: optionsForTemplate,
        };
      });

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
                    addon_id: opt.addon_id,
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
          if (
            group.required &&
            group.maxSelection === 1 &&
            group.items.length
          ) {
            const firstAvailable = group.items.find((it) => it.available);
            if (firstAvailable) selectedAddons.push(firstAvailable);
          }
        });
      }

      const addr = productObj.merchant?.primary_address ?? null;
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
    loading,
    pagination,
    fetchProducts,
    fetchProductDetail,
    fetchPublicProductDetail,
    updateProductStatus,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateStatus,
    fetchProductsToko,
    fetchProductsKuliner,
  };
}
