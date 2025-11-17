<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/views/merchant/products/Detail.vue
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Button from "@/components/common/Button.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const currentImageIndex = ref(0);
const showVariantsModal = ref(false);

// Lock body scroll when modal is open
useBodyScrollLock(showVariantsModal);

// Breadcrumb
const breadcrumbs = [
  { label: "Produk", path: "/merchant-center/products" },
  { label: "Detail Produk", path: null },
];

// UPDATED DUMMY DATA - Dengan variant images
const product = ref({
  id: 1,
  name: "Sandal Jepit Premium",
  sku: "BA000001",
  status: "published",
  description:
    "Ready cosplay dan pilihan untuk variety yang luas. Bahan paling nyaman, bisa dimakan. Cocok untuk kebutuhan rumah tangga sehari-hari, warung makan, maupun kebutuhan industri. Tersedia kemasan 4 kg yang praktis dan mudah disimpan.",
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
  // NEW: Variant Options dengan gambar
  variant_options: [
    {
      id: 1,
      option_name: "Warna",
      values: [
        {
          id: 1,
          value: "Merah",
          image: "https://via.placeholder.com/80/FF0000/FFFFFF?text=R",
        },
        {
          id: 2,
          value: "Biru",
          image: "https://via.placeholder.com/80/0000FF/FFFFFF?text=B",
        },
        {
          id: 3,
          value: "Hijau",
          image: "https://via.placeholder.com/80/00FF00/FFFFFF?text=H",
        },
        {
          id: 4,
          value: "Kuning",
          image: "https://via.placeholder.com/80/FFFF00/FFFFFF?text=K",
        },
      ],
    },
    {
      id: 2,
      option_name: "Ukuran",
      values: [
        { id: 5, value: "S", image: null },
        { id: 6, value: "M", image: null },
        { id: 7, value: "L", image: null },
        { id: 8, value: "XL", image: null },
      ],
    },
  ],
  variants: [
    {
      id: 1,
      variant_name: "Merah - S",
      sku: "BA000001-RED-S",
      price: 12500,
      stock: 50,
      image: "https://via.placeholder.com/100/FF0000/FFFFFF?text=Red+S",
      attributes: [
        { name: "Warna", value: "Merah", value_id: 1 },
        { name: "Ukuran", value: "S", value_id: 5 },
      ],
    },
    {
      id: 2,
      variant_name: "Merah - M",
      sku: "BA000001-RED-M",
      price: 13000,
      stock: 75,
      image: "https://via.placeholder.com/100/FF0000/FFFFFF?text=Red+M",
      attributes: [
        { name: "Warna", value: "Merah", value_id: 1 },
        { name: "Ukuran", value: "M", value_id: 6 },
      ],
    },
    {
      id: 3,
      variant_name: "Biru - M",
      sku: "BA000001-BLUE-M",
      price: 14000,
      stock: 0,
      image: "https://via.placeholder.com/100/0000FF/FFFFFF?text=Blue+M",
      attributes: [
        { name: "Warna", value: "Biru", value_id: 2 },
        { name: "Ukuran", value: "M", value_id: 6 },
      ],
    },
    {
      id: 4,
      variant_name: "Hijau - L",
      sku: "BA000001-GREEN-L",
      price: 15000,
      stock: 120,
      image: "https://via.placeholder.com/100/00FF00/FFFFFF?text=Green+L",
      attributes: [
        { name: "Warna", value: "Hijau", value_id: 3 },
        { name: "Ukuran", value: "L", value_id: 7 },
      ],
    },
    {
      id: 5,
      variant_name: "Kuning - XL",
      sku: "BA000001-YELLOW-XL",
      price: 16000,
      stock: 30,
      image: "https://via.placeholder.com/100/FFFF00/FFFFFF?text=Yellow+XL",
      attributes: [
        { name: "Warna", value: "Kuning", value_id: 4 },
        { name: "Ukuran", value: "XL", value_id: 8 },
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

// NEW: Group variants by option combinations
const variantsByOptionValue = computed(() => {
  const grouped = {};

  product.value.variants.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      const key = `${attr.name}_${attr.value_id}`;
      if (!grouped[key]) {
        grouped[key] = {
          optionName: attr.name,
          value: attr.value,
          valueId: attr.value_id,
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

const editProduct = () => {
  router.push(`/merchant-center/products/${route.params.id}/edit`);
};

onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
    <!-- Header - RESPONSIVE -->
    <!-- Mobile Header (< 640px) -->
    <div
      class="fixed sm:hidden top-0 left-0 right-0 bg-merchant-primary text-white px-4 py-6 flex items-center justify-center z-50 rounded-b-2xl shadow-lg"
    >
      <button
        @click="goBack"
        class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
      >
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-lg font-semibold">Detail Produk</h1>
    </div>

    <!-- Desktop Header (>= 640px) -->
    <div class="hidden sm:block sticky top-0 left-0 right-0 z-30 py-6">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-y-2 items-center justify-between gap-x-4"
      >
        <!-- Left: Breadcrumb -->
        <div>
          <nav class="flex items-center gap-2 text-sm">
            <template v-for="(crumb, index) in breadcrumbs" :key="index">
              <router-link
                v-if="crumb.path"
                :to="crumb.path"
                class="text-muted-foreground hover:text-merchant-primary transition flex items-center gap-2 text-base lg:text-2xl"
              >
                {{ crumb.label }}
              </router-link>
              <span
                v-else
                class="text-merchant-primary font-bold text-base lg:text-2xl whitespace-nowrap"
              >
                {{ crumb.label }}
              </span>
              <i
                v-if="index < breadcrumbs.length - 1"
                class="pi pi-chevron-right text-gray-400 text-xs"
              ></i>
            </template>
          </nav>
          <p class="text-muted-foreground text-xs lg:text-sm">
            {{ product.name }}
          </p>
        </div>

        <!-- Right: Action Buttons -->
        <div class="flex items-center gap-3">
          <Button @click="editProduct" variant="merchant" size="md">
            <i class="pi pi-pencil"></i>
            <span>Edit Produk</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile -->
    <div class="h-[72px] sm:h-0"></div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div
        class="w-10 h-10 border-4 border-gray-300 border-t-merchant-primary rounded-full animate-spin"
      ></div>
    </div>

    <!-- Content - RESPONSIVE GRID -->
    <div v-else class="mx-auto px-0 sm:px-4 lg:px-6 pb-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Left Column (Images + Basic Info) - Mobile: Full Width, Desktop: 2 cols -->
        <div class="lg:col-span-1 space-y-2 sm:space-y-4">
          <!-- Image Gallery Card -->
          <div class="bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm">
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

              <!-- Dot Indicators (Bottom Center) -->
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
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
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
        </div>

        <!-- Right Column (Details) - Mobile: Full Width, Desktop: 1 col -->
        <div class="lg:col-span-1 space-y-2 sm:space-y-4">
          <!-- Product Name Card -->
          <div class="bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              {{ product.name }}
            </h2>
            <p class="text-sm text-gray-500 font-mono">{{ product.sku }}</p>
          </div>

          <!-- Description Card - Desktop Only -->
          <div
            class="hidden sm:block bg-white p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
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

          <!-- Description Card - Mobile Only -->
          <div class="sm:hidden bg-white p-4 sm:rounded-xl sm:shadow-sm">
            <h3
              class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"
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
        </div>
      </div>
    </div>

    <!-- UPDATED: Variants Modal menggunakan ResponsiveModal -->
    <ResponsiveModal
      v-model:show="showVariantsModal"
      title="Variasi, Harga & Stok"
      size="xl"
      max-height="85vh"
      desktop-max-height="85vh"
      show-footer
      footer-class="inline sm:hidden"
      @close="closeVariantsModal"
    >
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

      <!-- NEW: Variant Options Section -->
      <div
        v-if="product.variant_options && product.variant_options.length > 0"
        class="space-y-4 mb-6"
      >
        <h3 class="text-sm font-semibold text-black">Opsi Variasi</h3>

        <div
          v-for="option in product.variant_options"
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
              option.values.some((v) => v.image)
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
                v-if="optionValue.image"
                class="flex flex-col items-center gap-2"
              >
                <div
                  class="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 group-hover:ring-2 group-hover:ring-merchant-primary/30 transition"
                >
                  <img
                    :src="optionValue.image"
                    :alt="optionValue.value"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="text-center w-full">
                  <p class="text-xs font-medium text-black truncate">
                    {{ optionValue.value }}
                  </p>
                  <p
                    v-if="
                      variantsByOptionValue[
                        `${option.option_name}_${optionValue.id}`
                      ]
                    "
                    class="text-[10px] text-muted-foreground mt-0.5"
                  >
                    {{
                      formatNumber(
                        variantsByOptionValue[
                          `${option.option_name}_${optionValue.id}`
                        ].totalStock
                      )
                    }}
                    unit
                  </p>
                </div>
              </div>

              <!-- Without Image (Text Only) -->
              <div
                v-else
                class="flex flex-col items-center justify-center py-2"
              >
                <p class="text-sm font-medium text-black text-center">
                  {{ optionValue.value }}
                </p>
                <p
                  v-if="
                    variantsByOptionValue[
                      `${option.option_name}_${optionValue.id}`
                    ]
                  "
                  class="text-[10px] text-muted-foreground mt-1"
                >
                  {{
                    formatNumber(
                      variantsByOptionValue[
                        `${option.option_name}_${optionValue.id}`
                      ].totalStock
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
            <!-- Variant Image -->
            <div
              v-if="variant.image"
              class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
            >
              <img
                :src="variant.image"
                :alt="variant.variant_name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Variant Info -->
            <div class="flex-1 min-w-0">
              <!-- Header -->
              <div class="flex justify-between items-start gap-3 mb-2">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-black mb-1 truncate">
                    {{ variant.variant_name }}
                  </h4>
                  <p class="text-xs text-muted-foreground font-mono truncate">
                    {{ variant.sku }}
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
                class="flex flex-wrap gap-1.5"
              >
                <span
                  v-for="(attr, index) in variant.attributes"
                  :key="index"
                  class="inline-flex items-center gap-1 px-2 py-0.5 bg-muted-background rounded-md text-xs"
                >
                  <span class="text-muted-foreground">{{ attr.name }}:</span>
                  <span class="font-medium text-black">{{ attr.value }}</span>
                </span>
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

/* Grid responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
