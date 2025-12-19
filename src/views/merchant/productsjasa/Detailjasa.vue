<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/views/merchant/productsjasa/Detailjasa.vue

import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue"; // ✅ ADD
import Button from "@/components/common/Button.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { getImageUrl } from "@/libs/getImageUrl.js";
import { useJasa } from "@/composables/useJasa";

const { fetchJasaDetail } = useJasa();
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
    label: "Jasa",
    path: `/merchant-center/${currentMerchantId.value}/jasas`,
  },
  {
    label: "Detail Jasa",
  },
]);

const loading = ref(false);
const jasa = ref(null);
const currentImageIndex = ref(0);
const showAddOnsModal = ref(false);

// Lock body scroll when modal is open
useBodyScrollLock(showAddOnsModal);

// (removed unused `breadcrumbs` constant)

// ✅ Computed Properties
const coverImage = computed(() => {
  if (!jasa.value?.images) return null;
  return (
    jasa.value.images.find((img) => img.is_cover) || jasa.value.images[0]
  );
});

const currentImage = computed(() => {
  if (!jasa.value?.images) return null;
  return jasa.value.images[currentImageIndex.value];
});

const priceRange = computed(() => {
  if (!jasa.value?.variants || jasa.value.variants.length === 0) {
    return "Rp 0";
  }

  const prices = jasa.value.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return formatPrice(min);
  }

  return `${formatPrice(min)} - ${formatPrice(max)}`;
});

const stockRange = computed(() => {
  if (!jasa.value?.variants || jasa.value.variants.length === 0) {
    return { min: 0, max: 0, total: 0, display: "0" };
  }

  const stocks = jasa.value.variants.map((v) => v.stock);
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

// ✅ Add-ons
const totalAddOnGroups = computed(() => {
  return jasa.value?.addonGroups?.length || 0;
});

const totalAddOnOptions = computed(() => {
  if (!jasa.value?.addonGroups) return 0;
  return jasa.value.addonGroups.reduce(
    (total, group) => total + (group.options?.length || 0),
    0
  );
});

const addOnPriceRange = computed(() => {
  if (!jasa.value?.addonGroups || jasa.value.addonGroups.length === 0) {
    return null;
  }

  const prices = jasa.value.addonGroups.flatMap((group) =>
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

// Main image src: pakai relasi images dulu, fallback ke field legacy `image`
const mainImageSrc = computed(() => {
  if (!jasa.value) return "";

  const images = jasa.value.images || [];
  if (images.length) {
    const img = images[currentImageIndex.value] || images[0];
    return getImageUrl(img?.path || img?.id || jasa.value.image);
  }

  if (jasa.value.image) {
    return getImageUrl(jasa.value.image);
  }

  return "";
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
  if (!jasa.value?.images) return;
  currentImageIndex.value =
    (currentImageIndex.value + 1) % jasa.value.images.length;
};

const prevImage = () => {
  if (!jasa.value?.images) return;
  currentImageIndex.value =
    currentImageIndex.value === 0
      ? jasa.value.images.length - 1
      : currentImageIndex.value - 1;
};

const selectImage = (index) => {
  currentImageIndex.value = index;
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
    `/merchant-center/${currentMerchantId.value}/jasas/${route.params.id}/edit`
  );
};

const loadDetail = async () => {
  loading.value = true;
  jasa.value = null;
  try {
    const productId = route.params.id;
    console.log("[Detail] Loading jasa", productId);

    const data = await fetchJasaDetail(productId, true, currentMerchantId.value);
    jasa.value = data;

    if (jasa.value?.images && jasa.value.images.length > 0) {
      currentImageIndex.value = 0;
    }

    console.log("[Detail] Jasa loaded", jasa.value);
  } catch (err) {
    console.error("[Detail] Error loading jasa", err);
    const status = err?.response?.status;
    if (status === 404) {
      toast.error("Jasa tidak ditemukan");
      router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
    } else if (status === 403) {
      toast.error("Anda tidak memiliki akses ke jasa ini");
      router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
    } else {
      toast.error(err?.response?.data?.message || "Gagal memuat detail jasa");
    }
  } finally {
    loading.value = false;
  }
};

// ✅ Mount
onMounted(() => {
  loadDetail();
});

// Helper: return a human readable label for add-on group selection rules
const getSelectionTypeLabel = (group) => {
  if (!group) return "Opsional";
  const min = group.min_selection ?? 0;
  const max = group.max_selection ?? 0;

  if (min > 0 && max > 0) {
    return min === max ? `Pilih ${min}` : `Pilih ${min} - ${max}`;
  }
  if (min > 0) return `Minimal ${min}`;
  if (max > 0) return `Maksimal ${max}`;
  return "Opsional";
};
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
      <h1 class="text-lg font-semibold">Detail Jasa</h1>
    </div>

    <!-- Desktop Header -->
    <div class="hidden sm:block sticky top-0 left-0 right-0 z-30 py-6">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-y-2 items-center justify-between gap-x-4"
      >
        <div>
          <Breadcrumb
            :items="breadcrumbItems"
            :merchantId="currentMerchantId"
          />
          <p class="text-muted-foreground text-xs lg:text-sm">
            {{ jasa?.title || "Loading..." }}
          </p>
        </div>

        <div v-if="jasa" class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-3 mr-4 text-xs text-gray-500">
            <div class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
              <i class="pi pi-image text-gray-400 text-xs"></i>
              <span>Galeri</span>
            </div>
            <div class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
              <i class="pi pi-wallet text-gray-400 text-xs"></i>
              <span>Harga</span>
            </div>
            <div class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
              <i class="pi pi-check-circle text-gray-400 text-xs"></i>
              <span>Status</span>
            </div>
          </div>

          <Button @click="editProduct" variant="merchant" size="md">
            <i class="pi pi-pencil"></i>
            <span>Edit Jasa</span>
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
      <p class="text-sm text-muted-foreground">Memuat detail jasa...</p>
    </div>

    <!-- ✅ Error State (product not loaded) -->
    <div
      v-else-if="!jasa"
      class="flex flex-col items-center justify-center py-20"
    >
      <i
        class="pi pi-exclamation-triangle text-5xl text-danger-foreground mb-4"
      ></i>
      <p class="text-lg font-semibold text-black mb-2">
        Jasa Tidak Ditemukan
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
          <div v-if="(jasa.images && jasa.images.length > 0) || jasa.image">
            <!-- Main Image -->
            <div
              class="relative aspect-square max-w-2xl mx-auto bg-gray-100 overflow-hidden mb-4 shadow-sm -mt-4 sm:mt-0 sm:rounded-2xl flex items-center justify-center"
            >
              <img
                v-if="mainImageSrc"
                :src="mainImageSrc"
                :alt="jasa.title"
                class="max-w-full max-h-full object-contain"
                @error="(e) => (e.target.style.display = 'none')"
              />
              <!-- Navigation Arrows -->
              <button
                v-if="jasa.images.length > 1"
                @click="prevImage"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition shadow-lg backdrop-blur-sm active:scale-95"
              >
                <i class="pi pi-chevron-left text-sm font-bold"></i>
              </button>
              <button
                v-if="jasa.images.length > 1"
                @click="nextImage"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition shadow-lg backdrop-blur-sm active:scale-95"
              >
                <i class="pi pi-chevron-right text-sm font-bold"></i>
              </button>
            </div>

            <!-- Thumbnails -->
            <div v-if="jasa.images && jasa.images.length > 0" class="grid grid-cols-4 sm:grid-cols-6 gap-2">
              <button
                v-for="(image, index) in jasa.images"
                :key="image.id"
                @click="selectImage(index)"
                :class="{
                  'border-merchant-primary ring-2 ring-merchant-primary/20 scale-105':
                    currentImageIndex === index,
                  'border-gray-200 hover:border-merchant-primary/50 hover:scale-105':
                    currentImageIndex !== index,
                }"
                class="relative border rounded-lg overflow-hidden transition aspect-square flex items-center justify-center bg-gray-50"
              >
                <img
                  v-if="image.id || image.path"
                  :src="getImageUrl(image.path || image.id)"
                  :alt="`${jasa.title} ${index + 1}`"
                  class="max-w-full max-h-full object-contain"
                  @error="(e) => (e.target.style.display = 'none')"
                />
              </button>
            </div>
          </div>

          <!-- No Images State -->
          <div v-else class="flex items-center justify-center">
            <div class="inline-flex flex-col items-center justify-center px-4 py-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center max-w-xs">
              <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                <i class="pi pi-image text-gray-400 text-lg"></i>
              </div>
              <p class="text-sm font-medium text-gray-600">
                Tidak ada gambar untuk jasa ini.
              </p>
              <p class="text-xs text-gray-400 mt-1">
                Tambahkan gambar dari halaman edit agar pelanggan lebih mudah mengenali layanan.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column (Details) -->
        <div class="lg:col-span-1 space-y-2 sm:space-y-4">
          <!-- Product Name Card -->
          <div class="bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm">
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-full bg-merchant-primary/10 flex items-center justify-center flex-shrink-0"
              >
                <i class="pi pi-briefcase text-merchant-primary text-lg"></i>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
                  {{ jasa.title }}
                </h2>
                <p class="text-xs text-gray-500 flex items-center gap-2">
                  <i class="pi pi-tag text-gray-400 text-xs"></i>
                  <span class="truncate">{{ jasa.category?.name || 'Tanpa kategori' }}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Harga Card -->
          <div class="bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm">
            <h3 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <i class="pi pi-wallet text-gray-400"></i>
              Harga
            </h3>

            <!-- Kedua harga diisi -->
            <div v-if="jasa.fixed_price && jasa.fixed_price > 0 && jasa.base_price && jasa.base_price > 0" class="space-y-1">
              <div class="flex items-center justify-between gap-3">
                <span class="text-xs text-gray-500 flex items-center gap-1">
                  <i class="pi pi-check-circle text-emerald-500 text-xs"></i>
                  <span>Harga tetap</span>
                </span>
                <span class="text-lg sm:text-2xl font-bold text-merchant-primary">
                  {{ formatPrice(jasa.fixed_price) }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-xs text-gray-500 flex items-center gap-1">
                  <i class="pi pi-arrow-right text-gray-400 text-xs"></i>
                  <span>Mulai dari</span>
                </span>
                <span class="text-base sm:text-lg font-semibold text-gray-900">
                  {{ formatPrice(jasa.base_price) }}
                </span>
              </div>
            </div>

            <!-- Hanya fixed price -->
            <div v-else-if="jasa.fixed_price && jasa.fixed_price > 0">
              <p class="text-2xl font-bold text-merchant-primary">
                {{ formatPrice(jasa.fixed_price) }}
              </p>
              <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <i class="pi pi-check-circle text-emerald-500 text-xs"></i>
                <span>Harga tetap</span>
              </p>
            </div>

            <!-- Hanya base price -->
            <div v-else-if="jasa.base_price && jasa.base_price > 0">
              <p class="text-2xl font-bold text-merchant-primary">
                {{ formatPrice(jasa.base_price) }}
              </p>
              <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <i class="pi pi-arrow-right text-gray-400 text-xs"></i>
                <span>Mulai dari</span>
              </p>
            </div>

            <!-- Tidak ada harga -->
            <div v-else>
              <p class="text-sm text-gray-500 flex items-center gap-2">
                <i class="pi pi-info-circle text-gray-400 text-sm"></i>
                <span>Belum ada harga yang diatur.</span>
              </p>
            </div>
          </div>

          <!-- Description Card - Desktop Only -->
          <div
            v-if="jasa.description"
            class="bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
          >
            <h3
              class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"
            >
              <i class="pi pi-align-left text-gray-400"></i>
              Deskripsi Jasa
            </h3>
            <p
              class="text-sm text-gray-700 leading-relaxed whitespace-pre-line"
            >
              {{ jasa.description }}
            </p>
          </div>

          <!-- Status & Category Card -->
          <div class="bg-white p-4 sm:p-6 space-y-3 sm:rounded-xl sm:shadow-sm">
            <!-- Status -->
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-gray-600 flex items-center gap-2">
                <i class="pi pi-check-circle text-gray-400 text-sm"></i>
                <span>Status</span>
              </span>
              <StatusLabel
                :status="(jasa?.is_active ?? (jasa?.status === 'active')) ? 'success' : 'muted'"
                variant="general"
                :label="(jasa?.is_active ?? (jasa?.status === 'active')) ? 'Aktif' : 'Tidak Aktif'"
                size="md"
              />
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-100"></div>

            <!-- Main Category -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Kategori</span>
              <div class="text-sm font-medium text-gray-900 text-right">
                <div>{{ jasa.category?.name || "-" }}</div>
                <div v-if="jasa.subcategory?.name" class="text-xs text-gray-500">
                  {{ jasa.subcategory.name }}
                </div>
              </div>
            </div>

            <!-- Min Purchase -->
            <div v-if="jasa.min_purchase">
              <div class="border-t border-gray-100 mb-3"></div>
              <div class="flex items-start justify-between gap-3 mt-3">
                <span class="text-sm text-gray-600 flex-shrink-0"
                  >Minimal Pembelian</span
                >
                <span class="text-sm font-medium text-gray-900">
                  {{ jasa.min_purchase }} unit
                </span>
              </div>
            </div>
          </div>

          <!-- Lokasi & Layanan Card -->
          <div class="bg-white p-4 sm:p-6 space-y-3 sm:rounded-xl sm:shadow-sm">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i class="pi pi-map-marker text-gray-400"></i>
              Lokasi & Layanan
            </h3>
            
            <!-- Service Type -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Tipe Layanan</span>
              <span class="text-sm font-medium text-gray-900">
                <template v-if="jasa.service_type === 'at_location'">Di Tempat Saya</template>
                <template v-else-if="jasa.service_type === 'on_site'">Ke Rumah/Lokasi Pelanggan</template>
                <template v-else-if="jasa.service_type === 'online'">Online</template>
                <template v-else>{{ jasa.service_type || '-' }}</template>
              </span>
            </div>

            <!-- Location Address -->
            <div v-if="jasa.location_address">
              <div class="border-t border-gray-100 mb-3"></div>
              <div class="flex items-start justify-between gap-3">
                <span class="text-sm text-gray-600 flex-shrink-0">Alamat Tempat Layanan</span>
                <span class="text-sm font-medium text-gray-900 text-right">
                  {{ jasa.location_address }}
                </span>
              </div>
            </div>

            <!-- Service Area -->
            <div v-if="jasa.service_area">
              <div class="border-t border-gray-100 mb-3"></div>
              <div class="flex items-start justify-between gap-3">
                <span class="text-sm text-gray-600 flex-shrink-0">Area Layanan</span>
                <span class="text-sm font-medium text-gray-900 text-right">
                  {{ jasa.service_area }}
                </span>
              </div>
            </div>
          </div>

          <!-- Payment Methods Card -->
          <div class="bg-white p-4 sm:p-6 space-y-3 sm:rounded-xl sm:shadow-sm">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i class="pi pi-wallet text-gray-400"></i>
              Metode Pembayaran
            </h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="method in (jasa.payment_methods || '').split(',').filter(m => m.trim())" 
                :key="method"
                class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
              >
                <template v-if="method.trim() === 'cod'">COD (Bayar di Tempat)</template>
                <template v-else>{{ method.trim() }}</template>
              </span>
              <span v-if="!jasa.payment_methods || !jasa.payment_methods.trim()" class="text-sm text-gray-500">
                Tidak ada metode pembayaran
              </span>
            </div>
          </div>

          <!-- Special Notes Card -->
          <div v-if="jasa.special_notes" class="bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i class="pi pi-info-circle text-gray-400"></i>
              Catatan Khusus
            </h3>
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {{ jasa.special_notes }}
            </p>
          </div>

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

    <!-- ✅ Add-ons Modal -->
    <ResponsiveModal
      v-model:show="showAddOnsModal"
      title="Grup Add-on"
      show-footer
      footer-class="inline sm:hidden"
      @close="closeAddOnsModal"
    >
      <div v-if="jasa && jasa.addonGroups">
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
            v-for="(group, gIndex) in jasa.addonGroups"
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
