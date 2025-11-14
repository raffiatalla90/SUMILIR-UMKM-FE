<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Button from "@/components/common/Button.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const currentImageIndex = ref(0);
const showVariantsModal = ref(false);

// Lock body scroll when modal is open
useBodyScrollLock(showVariantsModal);

// DUMMY DATA - Replace with API call
const product = ref({
  id: 1,
  name: "Sandal Jept asdasdja sa;djklaskdj asdas;lkdjasdj",
  sku: "BA000001",
  status: "published",
  description:
    "Ready cosplay dan pilihan untuk variety yang luas. Bahan paling nyaman, bisa dimakan. Cocok untuk kebutuhan rumah tangga sehari-hari, warung makan, maupun kebutuhan industri. Tersediah 4 kg yang praktis dan mudah disimpan.",
  categories: [
    { id: 1, category_name: "Benda Pakai", level: 1 },
    { id: 2, category_name: "Alas Kaki", level: 2, parent_id: 1 },
    { id: 3, category_name: "Sandal", level: 3, parent_id: 2 },
    { id: 4, category_name: "Produk Lokal", level: 3, parent_id: 2 },
  ],
  images: [
    {
      id: 1,
      image_path: "https://via.placeholder.com/400/4A90E2/FFFFFF?text=Sandal+1",
      is_cover: true,
    },
    {
      id: 2,
      image_path: "https://via.placeholder.com/400/E74C3C/FFFFFF?text=Sandal+2",
      is_cover: false,
    },
    {
      id: 3,
      image_path: "https://via.placeholder.com/400/F5A623/FFFFFF?text=Sandal+3",
      is_cover: false,
    },
    {
      id: 4,
      image_path: "https://via.placeholder.com/400/9B59B6/FFFFFF?text=Sandal+4",
      is_cover: false,
    },
  ],
  variants: [
    {
      id: 1,
      variant_name: "Merah - S",
      sku: "BA000001-RED-S",
      price: 1250,
      stock: 9999,
      attributes: [
        { name: "Warna", value: "Merah" },
        { name: "Ukuran", value: "S" },
      ],
    },
    {
      id: 2,
      variant_name: "Biru - M",
      sku: "BA000001-BLUE-M",
      price: 14000,
      stock: 9999,
      attributes: [
        { name: "Warna", value: "Biru" },
        { name: "Ukuran", value: "M" },
      ],
    },
    {
      id: 3,
      variant_name: "Hijau - L",
      sku: "BA000001-GREEN-L",
      price: 15000,
      stock: 9999,
      attributes: [
        { name: "Warna", value: "Hijau" },
        { name: "Ukuran", value: "L" },
      ],
    },
  ],
  discount: {
    type: "percentage",
    value: 5000,
  },
});

// Computed
const coverImage = computed(() => {
  return (
    product.value.images.find((img) => img.is_cover) || product.value.images[0]
  );
});

const currentImage = computed(() => {
  return product.value.images[currentImageIndex.value];
});

const mainCategory = computed(() => {
  return product.value.categories.find((cat) => cat.level === 1);
});

const subCategories = computed(() => {
  return product.value.categories.filter((cat) => cat.level > 1);
});

const priceRange = computed(() => {
  const prices = product.value.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return `Rp ${formatNumber(min)}`;
  }

  return `Rp ${formatNumber(min)} - Rp ${formatNumber(max)}`;
});

const stockRange = computed(() => {
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

const statusConfig = computed(() => {
  const statusMap = {
    published: {
      label: "Tersedia",
      class: "bg-success-background text-success-foreground",
      icon: "pi-check-circle",
    },
    draft: {
      label: "Draft",
      class: "bg-warning-background text-warning-foreground",
      icon: "pi-clock",
    },
    archived: {
      label: "Diarsipkan",
      class: "bg-muted-background text-muted-foreground",
      icon: "pi-archive",
    },
  };

  return statusMap[product.value.status] || statusMap.draft;
});

// Methods
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
  currentImageIndex.value =
    (currentImageIndex.value + 1) % product.value.images.length;
};

const prevImage = () => {
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

const goBack = () => {
  router.back();
};

onMounted(() => {
  // Fetch product detail from API
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div
      class="bg-merchant-primary text-white px-4 py-6 flex items-center justify-center sticky top-0 z-20 rounded-b-2xl"
    >
      <!-- Back Button - Absolute Left -->
      <button
        @click="goBack"
        class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
      >
        <i class="pi pi-arrow-left"></i>
      </button>

      <!-- Title - Centered -->
      <h1 class="text-lg font-semibold">Detail Produk</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div
        class="w-10 h-10 border-4 border-gray-300 border-t-merchant-primary rounded-full animate-spin"
      ></div>
    </div>

    <!-- Content -->
    <div v-else class="pb-6">
      <!-- Image Gallery Card -->
      <div class="bg-white mb-2 p-4">
        <!-- Main Image Carousel -->
        <div
          class="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-sm"
        >
          <img
            :src="currentImage.image_path"
            :alt="product.name"
            class="w-full h-full object-cover"
          />

          <!-- Cover Badge (Top Left) -->
          <div
            v-if="currentImage.is_cover"
            class="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-merchant-primary text-white rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm"
          >
            <i class="pi pi-star-fill text-xs"></i>
            <span>Cover</span>
          </div>

          <!-- Image Counter (Top Right) -->
          <div
            class="absolute top-3 right-3 px-3 py-1.5 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm"
          >
            {{ currentImageIndex + 1 }} / {{ product.images.length }}
          </div>

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

          <!-- Dot Indicators (Bottom Center) - Alternative to thumbnails -->
          <div
            v-if="product.images.length > 1"
            class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            <button
              v-for="(image, index) in product.images"
              :key="image.id"
              @click="selectImage(index)"
              :class="[
                'transition-all',
                currentImageIndex === index
                  ? 'w-6 h-2 bg-white rounded-full'
                  : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/75',
              ]"
            ></button>
          </div>
        </div>

        <!-- Thumbnail Grid -->
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="(image, index) in product.images"
            :key="image.id"
            @click="selectImage(index)"
            :class="[
              'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
              currentImageIndex === index
                ? 'border-merchant-primary ring-2 ring-merchant-primary/20 scale-105'
                : 'border-gray-200 hover:border-merchant-primary/50 hover:scale-105',
            ]"
          >
            <img
              :src="image.image_path"
              :alt="`${product.name} ${index + 1}`"
              class="w-full h-full object-cover"
            />

            <!-- Cover Badge on Thumbnail -->
            <div
              v-if="image.is_cover"
              class="absolute top-1 right-1 w-5 h-5 bg-merchant-primary rounded-full flex items-center justify-center shadow-md"
            >
              <i class="pi pi-star-fill text-white text-[8px]"></i>
            </div>

            <!-- Active Overlay -->
            <div
              v-if="currentImageIndex === index"
              class="absolute inset-0 bg-merchant-primary/10 backdrop-blur-[1px]"
            ></div>
          </button>
        </div>
      </div>

      <!-- Product Name Card -->
      <div class="bg-white mb-2 p-4">
        <h2 class="text-lg font-bold text-gray-900 mb-1">
          {{ product.name }}
        </h2>
        <p class="text-sm text-gray-500 font-mono">{{ product.sku }}</p>
      </div>

      <!-- Status & Category Card -->
      <div class="bg-white mb-2 p-4 space-y-3">
        <!-- Status -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Status</span>
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
              statusConfig.class,
            ]"
          >
            <i :class="['pi text-[10px]', statusConfig.icon]"></i>
            {{ statusConfig.label }}
          </span>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-100"></div>

        <!-- Main Category -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Kategori</span>
          <span class="text-sm font-medium text-gray-900">
            {{ mainCategory?.category_name || "-" }}
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
                {{ cat.category_name }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Variants, Price & Stock Card (Clickable) -->
      <button
        @click="openVariantsModal"
        class="w-full bg-white mb-2 p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-merchant-primary/10 flex items-center justify-center"
          >
            <i class="pi pi-box text-merchant-primary"></i>
          </div>
          <div class="text-left">
            <p class="text-sm font-semibold text-gray-900">
              Variasi, Harga & Stok
            </p>
            <p class="text-xs text-gray-500">
              {{ product.variants.length }} varian •
              {{ formatNumber(stockRange.total) }} stok
            </p>
          </div>
        </div>
        <i class="pi pi-chevron-right text-gray-400"></i>
      </button>

      <!-- Description Card -->
      <div class="bg-white mb-2 p-4">
        <h3
          class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"
        >
          <i class="pi pi-align-left text-gray-400"></i>
          Deskripsi Produk
        </h3>
        <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {{ product.description }}
        </p>
      </div>
    </div>

    <!-- Variants Bottom Sheet Modal -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showVariantsModal"
        @click="closeVariantsModal"
        class="fixed inset-0 bg-black/50 z-40 flex items-end"
      ></div>
    </transition>

    <!-- Modal Content -->
    <transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="showVariantsModal"
        @click.stop
        class="bg-white w-full rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col z-50 fixed inset-x-0 bottom-0"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-muted-background sticky top-0 bg-white rounded-t-2xl z-10"
        >
          <h2 class="text-base sm:text-lg font-semibold text-black">
            Variasi, Harga & Stok
          </h2>
          <button
            @click="closeVariantsModal"
            class="w-8 h-8 rounded-full hover:bg-muted-background flex items-center justify-center transition"
          >
            <i class="pi pi-times text-muted-foreground"></i>
          </button>
        </div>

        <!-- Modal Body - Scrollable -->
        <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <!-- Summary Card - IMPROVED LAYOUT -->
          <div
            class="bg-merchant-primary/5 rounded-xl p-4 border border-merchant-primary/20"
          >
            <!-- Harga (Full Width) -->
            <div class="mb-3">
              <p class="text-xs text-muted-foreground mb-1">Rentang Harga</p>
              <p class="text-base font-semibold text-merchant-primary truncate">
                {{ priceRange }}
              </p>
            </div>

            <!-- Varian & Stok (Side by Side) -->
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

          <!-- Variant List -->
          <div class="space-y-3">
            <h3
              class="text-sm font-semibold text-black sticky -top-4 bg-white py-2 -mt-2"
            >
              Daftar Varian
            </h3>

            <div
              v-for="variant in product.variants"
              :key="variant.id"
              class="bg-white border border-muted-background rounded-xl p-4 hover:border-merchant-primary/50 transition"
            >
              <!-- Variant Header -->
              <div class="flex justify-between items-start gap-3 mb-3">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-black mb-1 truncate">
                    {{ variant.variant_name }}
                  </h4>
                  <p class="text-xs text-muted-foreground font-mono truncate">
                    {{ variant.sku }}
                  </p>
                </div>
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0',
                    variant.stock > 0
                      ? 'bg-success-background text-success-foreground'
                      : 'bg-danger-background text-danger-foreground',
                  ]"
                >
                  {{ variant.stock > 0 ? "Tersedia" : "Habis" }}
                </span>
              </div>

              <!-- Variant Details Grid -->
              <div class="grid grid-cols-2 gap-3">
                <!-- Price -->
                <div class="bg-muted-background rounded-lg p-3">
                  <p class="text-xs text-muted-foreground mb-1">Harga</p>
                  <p class="text-sm font-bold text-merchant-primary truncate">
                    {{ formatPrice(variant.price) }}
                  </p>
                </div>

                <!-- Stock -->
                <div class="bg-muted-background rounded-lg p-3">
                  <p class="text-xs text-muted-foreground mb-1">Stok</p>
                  <p
                    :class="[
                      'text-sm font-bold truncate',
                      variant.stock > 0
                        ? 'text-success-foreground'
                        : 'text-danger-foreground',
                    ]"
                  >
                    {{ formatNumber(variant.stock) }} unit
                  </p>
                </div>
              </div>

              <!-- Attributes -->
              <div
                v-if="variant.attributes && variant.attributes.length > 0"
                class="mt-3 pt-3 border-t border-muted-background"
              >
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(attr, index) in variant.attributes"
                    :key="index"
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-muted-background rounded-md text-xs"
                  >
                    <span class="text-muted-foreground">{{ attr.name }}:</span>
                    <span class="font-medium text-black">{{ attr.value }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer - NEW -->
        <div
          class="border-t border-muted-background p-4 bg-white sticky bottom-0"
        >
          <Button @click="closeVariantsModal" block variant="merchant">
            Tutup
          </Button>
        </div>
      </div>
    </transition>
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
