<script setup>
import { ref, computed, onMounted } from "vue";
import ProductCard from "@/components/Card/ProductCard.vue";
import ProductCardSkeleton from "@/components/Card/ProductCardSkeleton.vue"; // Tambahkan ini
import MerchantCard from "@/components/Card/MerchantCard.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import TextField from "@/components/forms/TextField.vue";
import Button from "@/components/common/Button.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function goBack() {
  router.back();
}

function submitSearch() {
  if (!searchInput.value.trim()) return;
  keyword.value = searchInput.value.trim();
}

/* ================= BASIC ================= */
const keyword = ref("kopi");
const activeTab = ref("products");

/* ================= MODAL ================= */
const showFilterModal = ref(false);

/* ================= INSTANT SORT ================= */
const activeInstantSorts = ref([]);

/* ================= DETAIL FILTER ================= */
const detailFilters = ref({
  minPrice: null,
  maxPrice: null,
  categories: [],
  segments: [],
});

const tempDetailFilters = ref({ ...detailFilters.value });
const searchInput = ref(keyword.value);

/* ================= AVAILABLE CATEGORIES ================= */
const availableCategories = [
  { key: "kopi", label: "Kopi" },
  { key: "teh", label: "Teh" },
  { key: "herbal", label: "Herbal" },
];
/* ================= AVAILABLE SEGMENTS ================= */
const availableSegments = [
  { key: "toko", label: "Toko" },
  { key: "kuliner", label: "Kuliner" },
  { key: "jasa", label: "Jasa" },
];

/* ================= SORT OPTIONS ================= */
const instantSortOptions = [
  { key: "latest", label: "Terbaru", conflict: ["oldest"] },
  { key: "oldest", label: "Terlama", conflict: ["latest"] },
  { key: "nearest", label: "Terdekat" },
  {
    key: "cheapest",
    label: "Termurah",
    productOnly: true,
    conflict: ["expensive"],
  },
  {
    key: "expensive",
    label: "Termahal",
    productOnly: true,
    conflict: ["cheapest"],
  },
];

const filteredInstantSorts = computed(() =>
  instantSortOptions.filter(
    (i) => !i.productOnly || activeTab.value === "products"
  )
);

/* ================= DUMMY DATA ================= */
const products = ref([
  {
    id: 1,
    name: "Kopi Arabika Banyuanyar",
    min_price: 25000,
    max_price: 35000,
    distance: 1.2,
    category: "kopi",
    created_at: "2024-01-10",
    merchant: { name: "Toko Kopi Sumilir", segmentation: { name: "Toko" } },
  },
  {
    id: 2,
    name: "Kopi Robusta Premium",
    min_price: 20000,
    max_price: 20000,
    distance: 2.5,
    category: "kopi",
    created_at: "2023-12-01",
    merchant: {
      name: "Warung Kopi Pak Darto",
      segmentation: { name: "Kuliner" },
    },
  },
  {
    id: 3,
    name: "Teh Herbal Tradisional",
    min_price: 15000,
    max_price: 18000,
    distance: 0.8,
    category: "teh",
    created_at: "2023-11-15",
    merchant: { name: "UMKM Teh Desa", segmentation: { name: "Toko" } },
  },
]);

const merchants = ref([
  {
    id: 1,
    name: "Toko Kopi Sumilir",
    segmentation: {
      name: "Toko",
    },
    distance: 1.4,
    created_at: "2024-01-05",
  },
  {
    id: 2,
    name: "Warung Kopi Pak Darto",
    segmentation: {
      name: "Kuliner",
    },
    distance: 0.9,
    created_at: "2023-10-10",
  },
]);

/* ================= INSTANT SORT HANDLER ================= */
function toggleInstantSort(key) {
  const option = instantSortOptions.find((o) => o.key === key);
  if (!option) return;

  if (option.conflict) {
    activeInstantSorts.value = activeInstantSorts.value.filter(
      (k) => !option.conflict.includes(k)
    );
  }

  if (activeInstantSorts.value.includes(key)) {
    activeInstantSorts.value = activeInstantSorts.value.filter(
      (k) => k !== key
    );
  } else {
    activeInstantSorts.value.push(key);
  }
}
function toggleSegment(key) {
  const index = tempDetailFilters.value.segments.indexOf(key);
  if (index > -1) {
    tempDetailFilters.value.segments.splice(index, 1);
  } else {
    tempDetailFilters.value.segments.push(key);
  }
}

/* ================= DETAIL FILTER HANDLER ================= */
function toggleCategory(key) {
  const index = tempDetailFilters.value.categories.indexOf(key);
  if (index > -1) {
    tempDetailFilters.value.categories.splice(index, 1);
  } else {
    tempDetailFilters.value.categories.push(key);
  }
}

function applyDetailFilter() {
  detailFilters.value = {
    minPrice: tempDetailFilters.value.minPrice,
    maxPrice: tempDetailFilters.value.maxPrice,
    categories: [...tempDetailFilters.value.categories],
    segments: [...tempDetailFilters.value.segments],
  };
  showFilterModal.value = false;
}

function resetDetailFilter() {
  tempDetailFilters.value = {
    minPrice: null,
    maxPrice: null,
    categories: [],
    segments: [],
  };
}

/* ================= FILTER ENGINE ================= */
function applyFilters(list) {
  let filtered = [...list];

  if (detailFilters.value.minPrice !== null) {
    filtered = filtered.filter(
      (i) => i.min_price >= detailFilters.value.minPrice
    );
  }

  if (detailFilters.value.maxPrice !== null) {
    filtered = filtered.filter(
      (i) => i.max_price <= detailFilters.value.maxPrice
    );
  }

  if (detailFilters.value.categories.length) {
    filtered = filtered.filter((i) =>
      detailFilters.value.categories.includes(i.category)
    );
  }
  if (detailFilters.value.segments.length) {
    filtered = filtered.filter((item) => {
      let segmentName = "";
      if (activeTab.value === "products") {
        segmentName = item.merchant?.segmentation?.name?.toLowerCase();
      } else {
        segmentName = item.segmentation?.name?.toLowerCase();
      }
      return detailFilters.value.segments.includes(segmentName);
    });
  }

  if (activeInstantSorts.value.includes("latest")) {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (activeInstantSorts.value.includes("oldest")) {
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
  if (activeInstantSorts.value.includes("cheapest")) {
    filtered.sort((a, b) => a.min_price - b.min_price);
  }
  if (activeInstantSorts.value.includes("expensive")) {
    filtered.sort((a, b) => b.max_price - a.max_price);
  }
  if (activeInstantSorts.value.includes("nearest")) {
    filtered.sort((a, b) => a.distance - b.distance);
  }

  return filtered;
}

const finalProducts = computed(() => applyFilters(products.value));
const finalMerchants = computed(() => applyFilters(merchants.value));

const PAGE_SIZE = 2;
const visibleProductCount = ref(PAGE_SIZE);
const visibleMerchantCount = ref(PAGE_SIZE);

function loadMoreProducts() {
  visibleProductCount.value += PAGE_SIZE;
}
function loadMoreMerchants() {
  visibleMerchantCount.value += PAGE_SIZE;
}

const pagedProducts = computed(() =>
  finalProducts.value.slice(0, visibleProductCount.value)
);
const pagedMerchants = computed(() =>
  finalMerchants.value.slice(0, visibleMerchantCount.value)
);

const isLoading = ref(true); // State loading

onMounted(() => {
  // Simulasi loading, ganti dengan fetch API asli jika sudah ada
  setTimeout(() => {
    isLoading.value = false;
  }, 1200);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- ================= MOBILE STICKY SEARCH HEADER ================= -->
    <div class="sm:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
      <div class="flex items-center gap-2 px-3 py-3">
        <!-- BACK -->
        <button
          @click="goBack"
          class="p-2 px-3 rounded-full hover:bg-gray-100 transition"
        >
          <i class="pi pi-chevron-left text-sm"></i>
        </button>

        <!-- SEARCH INPUT -->
        <form @submit.prevent="submitSearch" class="flex-1">
          <div class="relative">
            <TextField
              v-model="searchInput"
              name="search"
              placeholder="Cari produk atau UMKM…"
              variant="primary"
            />
          </div>
        </form>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 py-4 space-y-5">
      <div>
        <h1 class="text-lg sm:text-xl font-semibold text-gray-900">
          Hasil pencarian untuk
          <span class="text-primary">"{{ keyword }}"</span>
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          Menampilkan produk dan UMKM terkait
        </p>
      </div>

      <!-- TAB -->
      <div class="flex group">
        <button
          @click="activeTab = 'products'"
          class="px-3 py-2 text-sm font-medium border-b-2 transition w-full group-hover:text-primary group-hover:border-primary cursor-pointer"
          :class="
            activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-muted-foreground text-muted-foreground '
          "
        >
          Produk
        </button>
        <button
          @click="activeTab = 'merchants'"
          class="px-3 py-2 text-sm font-medium border-b-2 transition w-full group-hover:text-primary group-hover:border-primary cursor-pointer"
          :class="
            activeTab === 'merchants'
              ? 'border-primary text-primary'
              : 'border-muted-foreground text-muted-foreground '
          "
        >
          UMKM
        </button>
      </div>

      <!-- FILTER BAR -->
      <div class="flex items-start gap-3">
        <div
          class="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div class="flex gap-2 py-0.5">
            <button
              v-for="item in filteredInstantSorts"
              :key="item.key"
              @click="toggleInstantSort(item.key)"
              class="px-3 py-1.5 text-xs rounded-full border whitespace-nowrap cursor-pointer transition duration-200"
              :class="
                activeInstantSorts.includes(item.key)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
              "
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <Button
          @click="
            tempDetailFilters = { ...detailFilters };
            showFilterModal = true;
          "
          variant="muted-outline"
          size="sm"
          custom-class="flex items-center gap-2 whitespace-nowrap !rounded-xl !py-2"
        >
          <i class="pi pi-filter"></i>
          <span>Filter</span>
          <span
            v-if="activeFilterCount > 0"
            class="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold"
          >
            {{ activeFilterCount }}
          </span>
        </Button>
      </div>

      <!-- PRODUCTS -->
      <section
        v-if="activeTab === 'products'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
      >
        <template v-if="isLoading">
          <ProductCardSkeleton v-for="i in PAGE_SIZE" :key="i" />
        </template>
        <template v-else>
          <ProductCard
            v-for="product in pagedProducts"
            :key="product.id"
            :product="product"
          />
        </template>
      </section>
      <div
        v-if="
          !isLoading &&
          activeTab === 'products' &&
          pagedProducts.length < finalProducts.length
        "
        class="flex justify-center mt-4"
      >
        <Button @click="loadMoreProducts" variant="primary-outline"
          >Muat Lebih Banyak</Button
        >
      </div>

      <!-- MERCHANTS -->
      <section
        v-if="activeTab === 'merchants'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
      >
        <template v-if="isLoading">
          <ProductCardSkeleton v-for="i in PAGE_SIZE" :key="i" />
        </template>
        <template v-else>
          <MerchantCard
            v-for="merchant in pagedMerchants"
            :key="merchant.id"
            :merchant="merchant"
          />
        </template>
      </section>
      <div
        v-if="
          activeTab === 'merchants' &&
          pagedMerchants.length < finalMerchants.length
        "
        class="flex justify-center mt-4"
      >
        <Button @click="loadMoreMerchants" variant="muted-outline"
          >Muat Lebih Banyak</Button
        >
      </div>
    </div>

    <!-- FILTER MODAL -->
    <ResponsiveModal
      v-model:show="showFilterModal"
      title="Filter Detail"
      subtitle="Atur lebih spesifik"
      :showFooter="true"
    >
      <div class="space-y-4">
        <!-- PRICE -->
        <div>
          <label class="text-sm font-medium">Rentang Harga</label>
          <div class="flex gap-2 mt-2 items-center">
            <TextField
              name="minPrice"
              type="number"
              v-model="tempDetailFilters.minPrice"
              placeholder="Min"
              prefix="Rp"
              variant="primary"
              class="w-full"
            />
            -
            <TextField
              name="maxPrice"
              type="number"
              v-model="tempDetailFilters.maxPrice"
              placeholder="Max"
              prefix="Rp"
              variant="primary"
              class="w-full"
            />
          </div>
        </div>
        <!-- SEGMENTASI MULTI -->
        <div>
          <label class="text-sm font-medium">Segmentasi</label>
          <div class="grid grid-cols-3 gap-2 mt-2">
            <button
              v-for="seg in availableSegments"
              :key="seg.key"
              @click="toggleSegment(seg.key)"
              class="px-3 py-2 text-xs rounded-xl border transition"
              :class="
                tempDetailFilters.segments.includes(seg.key)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted-foreground/80 border-gray-300'
              "
            >
              {{ seg.label }}
            </button>
          </div>
        </div>

        <!-- CATEGORY MULTI -->
        <div>
          <label class="text-sm font-medium">Kategori</label>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <button
              v-for="cat in availableCategories"
              :key="cat.key"
              @click="toggleCategory(cat.key)"
              class="px-3 py-2 text-xs rounded-xl border"
              :class="
                tempDetailFilters.categories.includes(cat.key)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted-foreground/80 border-gray-300'
              "
            >
              {{ cat.label }}
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2">
          <Button
            @click="resetDetailFilter"
            variant="muted-outline"
            class="w-full"
          >
            Reset
          </Button>
          <Button @click="applyDetailFilter" variant="primary" class="w-full">
            Terapkan
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>
