import { ref } from "vue";
import { searchProducts, searchMerchants } from "@/services/api/search";
import { useToast } from "vue-toastification";

export function useSearch() {
  const toast = useToast();

  // Produk
  const products = ref([]);
  const productsMeta = ref({});
  const loadingProducts = ref(false);

  // Jasa (returned by /api/public/search)
  const jasas = ref([]);
  const jasasMeta = ref({});

  // Merchant
  const merchants = ref([]);
  const merchantsMeta = ref({});
  const loadingMerchants = ref(false);

  // Search produk
  const fetchProducts = async (params = {}, append = false) => {
    loadingProducts.value = true;
    try {
      const data = await searchProducts(params);
      if (append) {
        products.value.push(...(data.data ?? []));
      } else {
        products.value = data.data ?? [];
      }
      productsMeta.value = data.meta ?? {};

      // Also hydrate jasa results if present
      if (append) {
        jasas.value.push(...(data.jasas ?? []));
      } else {
        jasas.value = data.jasas ?? [];
      }
      jasasMeta.value = data.jasas_meta ?? {};
    } catch (err) {
      toast.error("Gagal memuat produk.");
      if (!append) {
        products.value = [];
        jasas.value = [];
        jasasMeta.value = {};
      }
    } finally {
      loadingProducts.value = false;
    }
  };

  // Search merchant
  const fetchMerchants = async (params = {}, append = false) => {
    loadingMerchants.value = true;
    try {
      const data = await searchMerchants(params);
      if (append) {
        merchants.value.push(...(data.data ?? []));
      } else {
        merchants.value = data.data ?? [];
      }
      merchantsMeta.value = data.meta ?? {};
    } catch (err) {
      toast.error("Gagal memuat UMKM.");
      if (!append) merchants.value = [];
    } finally {
      loadingMerchants.value = false;
    }
  };

  return {
    // Produk
    products,
    productsMeta,
    loadingProducts,
    fetchProducts,
    // Jasa
    jasas,
    jasasMeta,
    // Merchant
    merchants,
    merchantsMeta,
    loadingMerchants,
    fetchMerchants,
  };
}
