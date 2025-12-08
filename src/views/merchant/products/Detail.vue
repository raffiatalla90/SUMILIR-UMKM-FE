<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/views/merchant/products/Detail.vue

import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue"; // ✅ ADD
import Button from "@/components/common/Button.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { getImageUrl } from "@/libs/getImageUrl.js";
import { useProducts } from "@/composables/useProducts";

const { fetchProductDetail } = useProducts();
const router = useRouter();
const route = useRoute();
const toast = useToast();

// ✅ Get merchantId from route
const currentMerchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : null;
});

// ✅ Breadcrumb items
const breadcrumbItems = computed(() => [
  {
    label: "Produk",
    path: `/merchant-center/${currentMerchantId.value}/products`,
  },
  {
    label: "Detail Produk",
  },
]);

const loading = ref(false);
const product = ref(null);
const currentImageIndex = ref(0);
const showVariantsModal = ref(false);
const showAddOnsModal = ref(false);

// Lock body scroll when modal is open
useBodyScrollLock(showVariantsModal);
useBodyScrollLock(showAddOnsModal);

// Breadcrumb
const breadcrumbs = [
  { label: "Produk", path: "/merchant-center/products" },
  { label: "Detail Produk", path: null },
];

// ✅ Computed Properties
const coverImage = computed(() => {
  if (!product.value?.images) return null;
  return (
    product.value.images.find((img) => img.is_cover) || product.value.images[0]
  );
});

const currentImage = computed(() => {
  if (!product.value?.images) return null;
  return product.value.images[currentImageIndex.value];
});

const mainCategory = computed(() => {
  if (!product.value?.categories) return null;
  return product.value.categories[0];
});

const subCategories = computed(() => {
  if (!product.value?.categories) return [];
  return product.value.categories.slice(1);
});

const priceRange = computed(() => {
  if (!product.value?.variants || product.value.variants.length === 0) {
    return "Rp 0";
  }

  const prices = product.value.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return formatPrice(min);
  }

  return `${formatPrice(min)} - ${formatPrice(max)}`;
});

const stockRange = computed(() => {
  if (!product.value?.variants || product.value.variants.length === 0) {
    return { min: 0, max: 0, total: 0, display: "0" };
  }

  const stocks = product.value.variants.map((v) => v.stock);
  const min = Math.min(...stocks);
  const max = Math.max(...stocks);
  const total = stocks.reduce((sum, stock) => sum + stock, 0);

  return {
    min,
    max,
    total,
    display: min === max ? `${min}` : `${min} - ${max}`,
  };
});

const totalAddOnGroups = computed(() => {
  return product.value?.addonGroups?.length || 0;
});

const totalAddOnOptions = computed(() => {
  if (!product.value?.addonGroups) return 0;
  return product.value.addonGroups.reduce(
    (total, group) => total + (group.options?.length || 0),
    0
  );
});

const addOnPriceRange = computed(() => {
  if (!product.value?.addonGroups || product.value.addonGroups.length === 0) {
    return null;
  }

  const prices = product.value.addonGroups.flatMap((group) =>
    (group.options || []).map((opt) => opt.addon_price || 0)
  );
  const nonZeroPrices = prices.filter((p) => p > 0);

  if (nonZeroPrices.length === 0) return null;

  const min = Math.min(...nonZeroPrices);
  const max = Math.max(...nonZeroPrices);

  if (min === max) {
    return `+${formatPrice(min)}`;
  }

  return `+${formatPrice(min)} - ${formatPrice(max)}`;
});

// ✅ Group variants by option value (for variant options display)
const variantsByOptionValue = computed(() => {
  if (!product.value?.variants) return {};

  const grouped = {};

  product.value.variants.forEach((variant) => {
    if (!variant.option_values) return;

    variant.option_values.forEach((optionValue) => {
      const key = `${optionValue.product_option_id}_${optionValue.id}`;
      if (!grouped[key]) {
        grouped[key] = {
          optionId: optionValue.product_option_id,
          optionName: optionValue.option_name,
          value: optionValue.option_value,
          valueId: optionValue.id,
          variants: [],
          totalStock: 0,
        };
      }
      grouped[key].variants.push(variant);
      grouped[key].totalStock += variant.stock;
    });
  });

  return grouped;
});

// ✅ Transform options data untuk display
const transformedOptions = computed(() => {
  if (!product.value?.options) return [];

  return product.value.options.map((option) => ({
    id: option.id,
    option_name: option.option_name,
    uses_image: option.uses_image,
    values: (option.values || []).map((value) => ({
      id: value.id,
      value: value.option_value,
      image: value.image_path,
    })),
  }));
});

// ✅ Methods
const formatNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "rb";
  }
  return num.toString();
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const nextImage = () => {
  if (!product.value?.images) return;
  currentImageIndex.value =
    (currentImageIndex.value + 1) % product.value.images.length;
};

const prevImage = () => {
  if (!product.value?.images) return;
  currentImageIndex.value =
    currentImageIndex.value === 0
      ? product.value.images.length - 1
      : currentImageIndex.value - 1;
};

const selectImage = (index) => {
  currentImageIndex.value = index;
};

const openVariantsModal = () => {
  showVariantsModal.value = true;
};

const closeVariantsModal = () => {
  showVariantsModal.value = false;
};

const openAddOnsModal = () => {
  showAddOnsModal.value = true;
};

const closeAddOnsModal = () => {
  showAddOnsModal.value = false;
};

const goBack = () => {
  router.back();
};

const editProduct = () => {
  router.push(
    `/merchant-center/${currentMerchantId.value}/products/${route.params.slug}/edit`
  );
};

const getSelectionTypeLabel = (group) => {
  if (group.min_selection === group.max_selection) {
    if (group.min_selection === 0) {
      return "Opsional";
    }
    return `Pilih ${group.min_selection}`;
  }
  return `${group.min_selection}-${group.max_selection} pilihan`;
};

const getVariantName = (variant) => {
  if (!variant.option_values || variant.option_values.length === 0) {
    return "Varian Default";
  }
  return variant.option_values.map((ov) => ov.option_value).join(" - ");
};

const loadDetail = async () => {
  loading.value = true;
  product.value = null;
  try {
    const slug = route.params.slug; // ✅ gunakan slug
    console.log("[Detail] Loading product", slug);

    const data = await fetchProductDetail(slug); // ✅ composable akan pakai slug
    product.value = data;

    // reset index jika ada images
    if (product.value?.images && product.value.images.length > 0) {
      currentImageIndex.value = 0;
    }

    console.log("[Detail] Product loaded", product.value);
  } catch (err) {
    console.error("[Detail] Error loading product", err);
    const status = err?.response?.status;
    if (status === 404) {
      toast.error("Produk tidak ditemukan");
      router.push("/merchant-center/products");
    } else if (status === 403) {
      toast.error("Anda tidak memiliki akses ke produk ini");
      router.push("/merchant-center/products");
    } else {
      toast.error(err?.response?.data?.message || "Gagal memuat detail produk");
    }
  } finally {
    loading.value = false;
  }
};

// ✅ Mount
onMounted(() => {
  loadDetail();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
    <!-- Mobile Header -->
    <div
      class="fixed sm:hidden top-0 left-0 right-0 bg-merchant-primary text-white px-4 py-6 flex items-center justify-center z-50 rounded-b-2xl shadow-lg"
    >
      <button
        @click="router.back()"
        class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
      >
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-lg font-semibold">Detail Produk</h1>
    </div>

    <!-- Desktop Header -->
    <div class="hidden sm:block sticky top-0 left-0 right-0 z-30 py-6">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-y-2 items-center justify-between gap-x-4"
      >
        <div>
          <!-- ✅ Use Breadcrumb Component -->
          <Breadcrumb
            :items="breadcrumbItems"
            :merchantId="currentMerchantId"
          />
          <p class="text-muted-foreground text-xs lg:text-sm">
            {{ product?.name || "Loading..." }}
          </p>
        </div>

        <div v-if="product" class="flex items-center gap-3">
          <Button @click="editProduct" variant="merchant" size="md">
            <i class="pi pi-pencil"></i>
            <span>Edit Produk</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile -->
    <div class="h-[72px] sm:h-0"></div>

    <!-- ✅ Loading State -->
    <div
      v-if="loading"
      class="flex flex-col justify-center items-center py-20 gap-3"
    >
      <div
        class="w-12 h-12 border-4 border-gray-300 border-t-merchant-primary rounded-full animate-spin"
      ></div>
      <p class="text-sm text-muted-foreground">Memuat detail produk...</p>
    </div>

    <!-- ✅ Error State (product not loaded) -->
    <div
      v-else-if="!product"
      class="flex flex-col items-center justify-center py-20"
    >
      <i
        class="pi pi-exclamation-triangle text-5xl text-danger-foreground mb-4"
      ></i>
      <p class="text-lg font-semibold text-black mb-2">
        Produk Tidak Ditemukan
      </p>
      <Button @click="goBack" variant="muted-outline">
        <i class="pi pi-arrow-left mr-2"></i>
        Kembali
      </Button>
    </div>

    <!-- ✅ Content - RESPONSIVE GRID -->
    <div v-else class="mx-auto px-0 sm:px-4 lg:px-6 pb-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Left Column (Images + Basic Info) -->
        <div class="lg:col-span-1 space-y-2 sm:space-y-4">
          <!-- Image Gallery Card -->
          <div v-if="product.images && product.images.length > 0">
            <!-- Main Image -->
            <div
              class="relative aspect-square max-w-2xl mx-auto bg-gray-100 overflow-hidden mb-4 shadow-sm -mt-4 sm:mt-0 sm:rounded-2xl"
            >
              <img
                v-if="product.images[currentImageIndex]?.id"
                :src="getImageUrl(product.images[currentImageIndex].id)"
                :alt="product.name"
                class="w-full h-full object-cover"
                @error="(e) => (e.target.style.display = 'none')"
              />
              <!-- Navigation Arrows -->
              <button
                v-if="product.images.length > 1"
                @click="prevImage"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition shadow-lg backdrop-blur-sm active:scale-95"
              >
                <i class="pi pi-chevron-left text-sm font-bold"></i>
              </button>
              <button
                v-if="product.images.length > 1"
                @click="nextImage"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition shadow-lg backdrop-blur-sm active:scale-95"
              >
                <i class="pi pi-chevron-right text-sm font-bold"></i>
              </button>
            </div>

            <!-- Thumbnails -->
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
              <button
                v-for="(image, index) in product.images"
                :key="image.id"
                @click="selectImage(index)"
                :class="{
                  'border-merchant-primary ring-2 ring-merchant-primary/20 scale-105':
                    currentImageIndex === index,
                  'border-gray-200 hover:border-merchant-primary/50 hover:scale-105':
                    currentImageIndex !== index,
                }"
                class="relative border rounded-lg overflow-hidden transition aspect-square"
              >
                <img
                  v-if="image.id"
                  :src="getImageUrl(image.id)"
                  :alt="`${product.name} ${index + 1}`"
                  class="w-full h-full object-cover"
                  @error="(e) => (e.target.style.display = 'none')"
                />
              </button>
            </div>
          </div>

          <!-- No Images State -->
          <div v-else>
            <p class="text-center text-gray-500">
              Tidak ada gambar untuk produk ini.
            </p>
          </div>
        </div>

        <!-- Right Column (Details) -->
        <div class="lg:col-span-1 space-y-2 sm:space-y-4">
          <!-- Product Name Card -->
          <div class="bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              {{ product.name }}
            </h2>
            <p class="text-sm text-gray-500 font-mono">
              SKU: {{ product.variants?.[0]?.sku || "-" }}
            </p>
          </div>

          <!-- Description Card - Desktop Only -->
          <div
            v-if="product.description"
            class="bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
          >
            <h3
              class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"
            >
              <i class="pi pi-align-left text-gray-400"></i>
              Deskripsi Produk
            </h3>
            <p
              class="text-sm text-gray-700 leading-relaxed whitespace-pre-line"
            >
              {{ product.description }}
            </p>
          </div>

          <!-- Status & Category Card -->
          <div class="bg-white p-4 sm:p-6 space-y-3 sm:rounded-xl sm:shadow-sm">
            <!-- Status -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Status</span>
              <StatusLabel
                :status="product.status"
                variant="product"
                size="md"
              />
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-100"></div>

            <!-- Main Category -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Kategori</span>
              <span class="text-sm font-medium text-gray-900">
                {{ mainCategory?.name || "-" }}
              </span>
            </div>

            <!-- Sub Categories -->
            <div v-if="subCategories.length > 0">
              <div class="border-t border-gray-100 mb-3"></div>
              <div class="flex items-start justify-between gap-3">
                <span class="text-sm text-gray-600 flex-shrink-0"
                  >Sub Kategori</span
                >
                <div class="flex flex-wrap gap-1.5 justify-end">
                  <span
                    v-for="cat in subCategories"
                    :key="cat.id"
                    class="inline-block px-2.5 py-1 bg-merchant-primary/10 text-merchant-primary rounded-md text-xs font-medium"
                  >
                    {{ cat.name }}
                  </span>
                </div>
              </div>
            </div>
            <!-- Min Purchase -->
            <div v-if="product.min_purchase">
              <div class="border-t border-gray-100 mb-3"></div>
              <div class="flex items-start justify-between gap-3 mt-3">
                <span class="text-sm text-gray-600 flex-shrink-0"
                  >Minimal Pembelian</span
                >
                <span class="text-sm font-medium text-gray-900">
                  {{ product.min_purchase }} unit
                </span>
              </div>
            </div>
          </div>

          <!-- Variants, Price & Stock Card -->
          <button
            v-if="product.variants && product.variants.length > 0"
            @click="openVariantsModal"
            class="w-full bg-white p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition sm:rounded-xl sm:shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-merchant-primary/10 flex items-center justify-center flex-shrink-0"
              >
                <i class="pi pi-box text-merchant-primary"></i>
              </div>
              <div class="text-left">
                <p class="text-sm font-semibold text-gray-900">
                  Variasi, Harga & Stok
                </p>
                <p class="text-xs text-gray-500">
                  {{ priceRange }} | {{ product.variants.length }} varian |
                  {{ formatNumber(stockRange.total) }} stok
                </p>
              </div>
            </div>
            <i class="pi pi-chevron-right text-gray-400"></i>
          </button>

          <!-- Add-ons Card -->
          <button
            v-if="totalAddOnGroups > 0"
            @click="openAddOnsModal"
            class="w-full bg-white p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition sm:rounded-xl sm:shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-merchant-primary/10 flex items-center justify-center flex-shrink-0"
              >
                <i class="pi pi-plus-circle text-merchant-primary"></i>
              </div>
              <div class="text-left">
                <p class="text-sm font-semibold text-gray-900">Grup Add-on</p>
                <p class="text-xs text-gray-500">
                  {{ totalAddOnGroups }} grup | {{ totalAddOnOptions }} opsi
                  <span v-if="addOnPriceRange"> | {{ addOnPriceRange }}</span>
                </p>
              </div>
            </div>
            <i class="pi pi-chevron-right text-gray-400"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ✅ Variants Modal -->
    <ResponsiveModal
      v-model:show="showVariantsModal"
      title="Variasi, Harga & Stok"
      show-footer
      footer-class="inline sm:hidden"
      @close="closeVariantsModal"
    >
      <div v-if="product">
        <!-- Summary Card -->
        <div
          class="bg-merchant-primary/5 rounded-xl p-4 border border-merchant-primary/20 mb-4"
        >
          <div class="mb-3">
            <p class="text-xs text-muted-foreground mb-1">Rentang Harga</p>
            <p class="text-base font-semibold text-merchant-primary truncate">
              {{ priceRange }}
            </p>
          </div>

          <div
            class="grid grid-cols-2 gap-4 pt-3 border-t border-merchant-primary/20"
          >
            <div>
              <p class="text-xs text-muted-foreground mb-1">Total Varian</p>
              <p class="text-lg font-bold text-merchant-primary">
                {{ product.variants.length }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">Total Stok</p>
              <p class="text-lg font-bold text-merchant-primary">
                {{ formatNumber(stockRange.total) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Variant Options Section -->
        <div v-if="transformedOptions.length > 0" class="space-y-4 mb-6">
          <h3 class="text-sm font-semibold text-black">Opsi Variasi</h3>

          <div
            v-for="option in transformedOptions"
            :key="option.id"
            class="space-y-3"
          >
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-700">
                {{ option.option_name }}
              </h4>
              <span class="text-xs text-muted-foreground">
                {{ option.values.length }} pilihan
              </span>
            </div>

            <!-- Option Values Grid -->
            <div
              class="grid gap-2"
              :class="
                option.uses_image
                  ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              "
            >
              <div
                v-for="optionValue in option.values"
                :key="optionValue.id"
                class="bg-white border border-muted-background rounded-xl p-3 hover:border-merchant-primary/50 transition group"
              >
                <!-- With Image -->
                <div
                  v-if="option.uses_image && optionValue.image"
                  class="flex flex-col items-center gap-2"
                >
                  <div
                    class="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 group-hover:ring-2 group-hover:ring-merchant-primary/30 transition"
                  >
                    <img
                      v-if="
                        optionValue.id &&
                        option.uses_image &&
                        optionValue.image_path === undefined
                      "
                      :src="getImageUrl(optionValue.id)"
                      :alt="optionValue.value"
                      class="w-full h-full object-cover"
                      @error="(e) => (e.target.style.display = 'none')"
                    />
                  </div>
                  <div class="text-center w-full">
                    <p class="text-xs font-medium text-black truncate">
                      {{ optionValue.value }}
                    </p>
                    <p
                      v-if="
                        variantsByOptionValue[`${option.id}_${optionValue.id}`]
                      "
                      class="text-[10px] text-muted-foreground mt-0.5"
                    >
                      {{
                        formatNumber(
                          variantsByOptionValue[
                            `${option.id}_${optionValue.id}`
                          ].totalStock
                        )
                      }}
                      unit
                    </p>
                  </div>
                </div>

                <!-- Without Image -->
                <div
                  v-else
                  class="flex flex-col items-center justify-center py-2"
                >
                  <p class="text-sm font-medium text-black text-center">
                    {{ optionValue.value }}
                  </p>
                  <p
                    v-if="
                      variantsByOptionValue[`${option.id}_${optionValue.id}`]
                    "
                    class="text-[10px] text-muted-foreground mt-1"
                  >
                    {{
                      formatNumber(
                        variantsByOptionValue[`${option.id}_${optionValue.id}`]
                          .totalStock
                      )
                    }}
                    unit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 my-6"></div>

        <!-- Variant List -->
        <div class="space-y-3">
          <h3
            class="text-sm font-semibold text-black sticky -top-4 bg-white py-2 -mt-2 z-[5]"
          >
            Daftar Kombinasi Varian
          </h3>

          <div
            v-for="variant in product.variants"
            :key="variant.id"
            class="bg-white border border-muted-background rounded-xl overflow-hidden hover:border-merchant-primary/50 transition"
          >
            <div class="flex gap-3 p-4 items-center">
              <!-- Variant Info -->
              <div class="flex-1 min-w-0">
                <!-- Header -->
                <div class="flex justify-between items-start gap-3 mb-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-black mb-1 truncate">
                      {{ getVariantName(variant) }}
                    </h4>
                    <p class="text-xs text-muted-foreground font-mono truncate">
                      {{ variant.sku || "-" }}
                    </p>
                  </div>
                  <StatusLabel
                    :status="variant.stock > 0 ? 'published' : 'out_of_stock'"
                    variant="product"
                    size="xs"
                    :label="variant.stock > 0 ? 'Tersedia' : 'Habis'"
                  />
                </div>

                <!-- Details Grid -->
                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div class="bg-muted-background rounded-lg p-2">
                    <p class="text-xs text-muted-foreground mb-0.5">Harga</p>
                    <p class="text-sm font-bold text-merchant-primary truncate">
                      {{ formatPrice(variant.price) }}
                    </p>
                  </div>

                  <div class="bg-muted-background rounded-lg p-2">
                    <p class="text-xs text-muted-foreground mb-0.5">Stok</p>
                    <p
                      :class="
                        variant.stock > 0
                          ? 'text-success-foreground'
                          : 'text-danger-foreground'
                      "
                      class="text-sm font-bold truncate"
                    >
                      {{ formatNumber(variant.stock) }} unit
                    </p>
                  </div>
                </div>

                <!-- Option Values -->
                <div
                  v-if="
                    variant.option_values && variant.option_values.length > 0
                  "
                  class="flex flex-wrap gap-1.5"
                >
                  <span
                    v-for="optionValue in variant.option_values"
                    :key="optionValue.id"
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-muted-background rounded-md text-xs"
                  >
                    <span class="font-medium text-black">{{
                      optionValue.option_value
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <Button @click="closeVariantsModal" block variant="merchant">
          Tutup
        </Button>
      </template>
    </ResponsiveModal>

    <!-- ✅ Add-ons Modal -->
    <ResponsiveModal
      v-model:show="showAddOnsModal"
      title="Grup Add-on"
      show-footer
      footer-class="inline sm:hidden"
      @close="closeAddOnsModal"
    >
      <div v-if="product && product.addonGroups">
        <!-- Summary Card -->
        <div
          class="bg-merchant-primary/5 rounded-xl p-4 border border-merchant-primary/20 mb-4"
        >
          <div class="mb-3">
            <p class="text-xs text-muted-foreground mb-1">
              Rentang Harga Add-on
            </p>
            <p class="text-base font-semibold text-merchant-primary truncate">
              {{ addOnPriceRange || "Semua Gratis" }}
            </p>
          </div>

          <div
            class="grid grid-cols-2 gap-4 pt-3 border-t border-merchant-primary/20"
          >
            <div>
              <p class="text-xs text-muted-foreground mb-1">Total Grup</p>
              <p class="text-lg font-bold text-merchant-primary">
                {{ totalAddOnGroups }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">Total Opsi</p>
              <p class="text-lg font-bold text-merchant-primary">
                {{ totalAddOnOptions }}
              </p>
            </div>
          </div>
        </div>

        <!-- Add-on Groups List -->
        <div class="space-y-4">
          <div
            v-for="(group, gIndex) in product.addonGroups"
            :key="group.id"
            class="bg-white border border-muted-background rounded-xl overflow-hidden"
          >
            <!-- Group Header -->
            <div
              class="bg-merchant-primary/5 border-b border-merchant-primary/20 p-4"
            >
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1">
                  <h3 class="text-sm font-bold text-black mb-2">
                    {{ gIndex + 1 }}. {{ group.addon_group_name }}
                  </h3>
                  <div class="flex items-center gap-2 flex-wrap">
                    <!-- Required Badge -->
                    <StatusLabel
                      v-if="group.min_selection > 0"
                      status="merchant"
                      variant="general"
                      label="Wajib"
                      size="xs"
                      :show-icon="false"
                    />

                    <!-- Selection Type -->
                    <StatusLabel
                      status="warning"
                      variant="general"
                      :label="getSelectionTypeLabel(group)"
                      size="xs"
                      :show-icon="false"
                    />

                    <!-- Options Count -->
                    <StatusLabel
                      status="muted"
                      variant="general"
                      :label="`${group.options?.length || 0} opsi`"
                      size="xs"
                      :show-icon="false"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Options List -->
            <div class="p-4 space-y-2">
              <div
                v-for="(option, oIndex) in group.options"
                :key="option.id"
                class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <!-- Number Badge -->
                  <StatusLabel
                    status="processing"
                    variant="custom"
                    :label="`${oIndex + 1}`"
                    custom-class="bg-merchant-primary text-white"
                    size="xs"
                    :show-icon="false"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-black truncate">
                      {{ option.addon?.addon_name || option.addon_name || "-" }}
                    </p>
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <!-- Price Badge -->
                  <StatusLabel
                    v-if="option.addon_price > 0"
                    status="primary"
                    variant="general"
                    :label="`+${formatPrice(option.addon_price)}`"
                    size="sm"
                    :show-icon="false"
                  />
                  <StatusLabel
                    v-else
                    status="success"
                    variant="general"
                    label="Gratis"
                    size="sm"
                    :show-icon="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <Button @click="closeAddOnsModal" block variant="merchant">
          Tutup
        </Button>
      </template>
    </ResponsiveModal>
  </div>
</template>

<style scoped>
/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth transitions */
img {
  transition: transform 0.3s ease;
}

button:active img {
  transform: scale(0.98);
}
</style>
