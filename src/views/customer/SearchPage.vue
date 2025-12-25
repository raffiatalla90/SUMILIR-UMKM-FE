<script setup>
import { ref, computed, onMounted, watch } from "vue";
import ProductCard from "@/components/Card/ProductCard.vue";
import ProductCardSkeleton from "@/components/Card/ProductCardSkeleton.vue"; // Tambahkan ini
import MerchantCard from "@/components/Card/MerchantCard.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import TextField from "@/components/forms/TextField.vue";
import Button from "@/components/common/Button.vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/libs/axios";
import { useCategories } from "@/composables/useCategories";
import { useSegmentations } from "@/composables/useSegmentations";

const products = ref([]);
const merchants = ref([]); // nanti endpoint sendiri
const isLoading = ref(false); // State loading

const page = ref(1);
const perPage = 12;
const hasMore = ref(false);

const merchantPage = ref(1);
const merchantPerPage = 12;
const merchantHasMore = ref(false);

const router = useRouter();
const route = useRoute();

const {
  categoriesLevel1,
  loadingLevel1,
  fetchLevel1Categories,
  categoriesLevel2Map,
  loadingLevel2,
  fetchMultiSubCategories,
} = useCategories();
const {
  segmentations,
  loading: loadingSegmentations,
  fetchSegmentations,
} = useSegmentations();
function goBack() {
  router.back();
}
const goToProductDetail = (product) => {
  router.push({
    name: "Product Detail",
    params: { slug: product.slug },
  });
};

/* ================= BASIC ================= */
const keyword = ref("");
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
  subCategories: [],
  segments: [],
});

const tempDetailFilters = ref({ ...detailFilters.value, subCategories: [] });
const searchInput = ref(keyword.value);

const isEmptyProducts = computed(
  () =>
    !isLoading.value &&
    activeTab.value === "products" &&
    products.value.length === 0
);

const isEmptyMerchants = computed(
  () =>
    !isLoading.value &&
    activeTab.value === "merchants" &&
    merchants.value.length === 0
);

/* ================= AVAILABLE CATEGORIES ================= */
const availableCategories = computed(() =>
  categoriesLevel1.value.map((cat) => ({
    key: cat.slug, // dipakai untuk filter & API
    label: cat.name, // teks di UI
    id: cat.id,
  }))
);
const availableSubCategories = computed(() => {
  return Object.values(categoriesLevel2Map.value)
    .flat()
    .map((cat) => ({
      key: cat.slug,
      label: cat.name,
      id: cat.id,
    }));
});

/* ================= AVAILABLE SEGMENTS ================= */
const availableSegments = computed(() =>
  segmentations.value.map((seg) => ({
    key: seg.key, // dikirim ke API search
    label: seg.label, // teks UI
    id: seg.id,
  }))
);

const activeFilterCount = computed(() => {
  let count = 0;

  if (detailFilters.value.minPrice !== null) count++;
  if (detailFilters.value.maxPrice !== null) count++;
  if (detailFilters.value.categories.length) count++;
  if (detailFilters.value.segments.length) count++;
  if (detailFilters.value.subCategories.length) count++;

  return count;
});

const hasActiveFilters = computed(() => activeFilterCount.value > 0);

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

async function fetchMerchants(reset = false) {
  if (isLoading.value) return;

  if (reset) {
    merchantPage.value = 1;
    merchants.value = [];
    merchantHasMore.value = true;
  }

  isLoading.value = true;

  try {
    const res = await api.get("/api/public/search-merchants", {
      params: buildMerchantQuery(),
    });

    const data = res.data.data;
    const meta = res.data.meta;

    merchants.value.push(...data);
    merchantHasMore.value = meta.current_page < meta.last_page;
  } catch (err) {
    console.error("Fetch merchants error:", err);
  } finally {
    isLoading.value = false;
  }
}

async function fetchProducts(reset = false) {
  if (isLoading.value) return;

  if (reset) {
    page.value = 1;
    products.value = [];
    hasMore.value = true;
  }

  isLoading.value = true;

  try {
    const res = await api.get("/api/public/search", {
      params: buildProductQuery(),
    });

    const data = res.data.data;
    const meta = res.data.meta;

    products.value.push(...data);
    hasMore.value = meta.current_page < meta.last_page;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
function buildMerchantQuery() {
  const sort = activeInstantSorts.value.find((s) =>
    ["latest", "oldest"].includes(s)
  );

  return {
    q: keyword.value || undefined,

    segments: detailFilters.value.segments.length
      ? detailFilters.value.segments
      : undefined,

    categories: detailFilters.value.subCategories.length
      ? detailFilters.value.subCategories
      : detailFilters.value.categories.length
      ? detailFilters.value.categories
      : undefined,

    min_price: detailFilters.value.minPrice ?? undefined,
    max_price: detailFilters.value.maxPrice ?? undefined,

    sort: sort || undefined,
    page: merchantPage.value,
    per_page: merchantPerPage,
  };
}

function buildProductQuery() {
  const sort = activeInstantSorts.value.find((s) =>
    ["latest", "oldest", "cheapest", "expensive"].includes(s)
  );

  return {
    q: keyword.value || undefined,
    min_price: detailFilters.value.minPrice ?? undefined,
    max_price: detailFilters.value.maxPrice ?? undefined,

    // 🔥 PRIORITAS SUB KATEGORI
    categories: detailFilters.value.subCategories.length
      ? detailFilters.value.subCategories
      : detailFilters.value.categories.length
      ? detailFilters.value.categories
      : undefined,

    segments: detailFilters.value.segments.length
      ? detailFilters.value.segments
      : undefined,

    sort: sort || undefined,
    page: page.value,
    per_page: perPage,
  };
}

function submitSearch() {
  if (!searchInput.value.trim()) return;
  router.push({
    path: "/search",
    query: {
      q: searchInput.value.trim(),
    },
  });
}

function applyDetailFilter() {
  detailFilters.value = {
    minPrice: tempDetailFilters.value.minPrice,
    maxPrice: tempDetailFilters.value.maxPrice,
    categories: [...tempDetailFilters.value.categories],
    subCategories: [...tempDetailFilters.value.subCategories],
    segments: [...tempDetailFilters.value.segments],
  };

  showFilterModal.value = false;
  if (activeTab.value === "products") {
    fetchProducts(true);
  }
  if (activeTab.value === "merchants") {
    fetchMerchants(true);
  }
}

watch(activeInstantSorts, () => {
  fetchProducts(true);
});

watch(activeTab, (tab) => {
  if (tab === "products") {
    fetchProducts(true);
  }

  if (tab === "merchants") {
    fetchMerchants(true);
  }
});
watch(activeTab, (tab) => {
  resetAllFilters();

  if (tab === "products") {
    fetchProducts(true);
  }

  if (tab === "merchants") {
    fetchMerchants(true);
  }
});
watch(
  () => tempDetailFilters.value.maxPrice,
  (newMax) => {
    if (
      newMax !== null &&
      newMax !== "" &&
      tempDetailFilters.value.minPrice === null
    ) {
      tempDetailFilters.value.minPrice = 0;
    }
  }
);

watch(
  () => route.query.q,
  (newQ, oldQ) => {
    if (newQ !== oldQ) {
      keyword.value = newQ || "";
      searchInput.value = newQ || "";

      fetchProducts(true);
      if (activeTab.value === "merchants") {
        fetchMerchants(true);
      }
    }
  },
  { immediate: true }
);

watch(
  () => [...tempDetailFilters.value.categories],
  async (newCategories, oldCategories = []) => {
    // kategori baru → fetch sub kategori
    const added = newCategories.filter((c) => !oldCategories.includes(c));

    for (const slug of added) {
      const category = categoriesLevel1.value.find((c) => c.slug === slug);
      if (category) {
        await fetchMultiSubCategories(category.id);
      }
    }

    // kategori dihapus → hapus sub kategori terkait
    const removed = oldCategories.filter((c) => !newCategories.includes(c));

    for (const slug of removed) {
      const category = categoriesLevel1.value.find((c) => c.slug === slug);
      if (category) {
        delete categoriesLevel2Map.value[category.id];

        // bersihkan sub kategori yang terpilih
        tempDetailFilters.value.subCategories =
          tempDetailFilters.value.subCategories.filter(
            (sub) =>
              !availableSubCategories.value.some(
                (s) => s.key === sub && s.id === category.id
              )
          );
      }
    }
  }
);

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
function toggleSubCategory(key) {
  const index = tempDetailFilters.value.subCategories.indexOf(key);
  if (index > -1) {
    tempDetailFilters.value.subCategories.splice(index, 1);
  } else {
    tempDetailFilters.value.subCategories.push(key);
  }
}

function resetAllFilters() {
  // reset filter aktif
  detailFilters.value = {
    minPrice: null,
    maxPrice: null,
    categories: [],
    subCategories: [],
    segments: [],
  };

  // reset filter modal
  tempDetailFilters.value = {
    minPrice: null,
    maxPrice: null,
    categories: [],
    subCategories: [],
    segments: [],
  };

  // reset sub category cache
  categoriesLevel2Map.value = {};
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
        segmentName = item.merchant?.segmentation?.name;
      } else {
        segmentName = item.segmentation?.name;
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

const finalMerchants = computed(() => applyFilters(merchants.value));

const PAGE_SIZE = 2;
const visibleMerchantCount = ref(PAGE_SIZE);

function loadMoreProducts() {
  page++;
  fetchProducts();
}
function loadMoreMerchants() {
  merchantPage.value++;
  fetchMerchants();
}

const pagedMerchants = computed(() =>
  finalMerchants.value.slice(0, visibleMerchantCount.value)
);

watch(
  () => (route && route.query ? route.query.q : ""),
  (newQ, oldQ) => {
    if (newQ !== oldQ) {
      keyword.value = newQ || "";
      searchInput.value = newQ || "";
      fetchProducts(true);
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (route.query.q) {
    keyword.value = route.query.q;
    searchInput.value = route.query.q;
  }
  fetchLevel1Categories();
  fetchSegmentations();
  fetchProducts(true);
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
          custom-class="relative flex items-center gap-2 whitespace-nowrap !rounded-xl !py-2"
        >
          <i class="pi pi-filter"></i>
          <span>Filter</span>

          <!-- BADGE -->
          <span
            v-if="hasActiveFilters"
            class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-semibold"
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
        <!-- LOADING -->
        <template v-if="isLoading">
          <ProductCardSkeleton v-for="i in PAGE_SIZE" :key="i" />
        </template>

        <!-- DATA -->
        <template v-else-if="products.length">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @click="goToProductDetail(product)"
          />
        </template>
      </section>

      <!-- EMPTY PRODUCTS -->
      <div
        v-if="isEmptyProducts"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <p class="text-primary text-sm">Produk tidak ditemukan</p>
        <p class="text-xs text-muted-foreground mt-1">
          Coba ubah kata kunci atau filter pencarian
        </p>
      </div>

      <div
        v-if="!isLoading && activeTab === 'products' && hasMore"
        class="flex justify-center mt-4"
      >
        <Button @click="loadMoreProducts" variant="primary-outline">
          Muat Lebih Banyak
        </Button>
      </div>

      <!-- MERCHANTS -->
      <section
        v-if="activeTab === 'merchants'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
      >
        <!-- LOADING -->
        <template v-if="isLoading">
          <ProductCardSkeleton v-for="i in PAGE_SIZE" :key="i" />
        </template>

        <!-- DATA -->
        <template v-else-if="pagedMerchants.length">
          <MerchantCard
            v-for="merchant in pagedMerchants"
            :key="merchant.id"
            :merchant="merchant"
          />
        </template>
      </section>

      <!-- EMPTY MERCHANTS -->
      <div
        v-if="isEmptyMerchants"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <p class="text-primary text-sm">UMKM tidak ditemukan</p>
        <p class="text-xs text-muted-foreground mt-1">
          Coba gunakan filter atau kata kunci lain
        </p>
      </div>

      <div
        v-if="!isLoading && activeTab === 'merchants' && merchantHasMore"
        class="flex justify-center mt-4"
      >
        <Button @click="loadMoreMerchants" variant="primary-outline">
          Muat Lebih Banyak
        </Button>
      </div>
    </div>

    <!-- FILTER MODAL -->
    <ResponsiveModal
      v-model:show="showFilterModal"
      title="Filter"
      subtitle="Atur lebih spesifik"
      :showFooter="true"
    >
      <div class="space-y-4">
        <!-- ===================== PRODUCTS FILTER ===================== -->
        <template v-if="activeTab === 'products'">
          <!-- PRICE -->
          <div>
            <label class="text-sm font-medium">Rentang Harga</label>
            <div class="flex gap-2 mt-2 items-center">
              <TextField
                type="number"
                v-model="tempDetailFilters.minPrice"
                placeholder="Min"
                prefix="Rp"
                class="w-full"
              />
              -
              <TextField
                type="number"
                v-model="tempDetailFilters.maxPrice"
                placeholder="Max"
                prefix="Rp"
                class="w-full"
              />
            </div>
          </div>

          <!-- SEGMENTASI -->
          <div>
            <label class="text-sm font-medium">
              <span v-if="isLoadingSegments">Memuat Jenis Produk...</span>
              <span v-else>Jenis Produk</span>
            </label>
            <div class="grid grid-cols-3 gap-2 mt-2">
              <button
                v-for="seg in availableSegments"
                :key="seg.key"
                @click="toggleSegment(seg.key)"
                class="px-3 py-2 text-xs rounded-xl border"
                :class="
                  tempDetailFilters.segments.includes(seg.key)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-gray-300'
                "
              >
                {{ seg.label }}
              </button>
            </div>
          </div>

          <!-- CATEGORY -->
          <div>
            <label class="text-sm font-medium">
              <span v-if="isLoadingCategories">Memuat Kategori...</span>
              <span v-else>Kategori</span>
            </label>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <button
                v-for="cat in availableCategories"
                :key="cat.key"
                @click="toggleCategory(cat.key)"
                class="px-3 py-2 text-xs rounded-xl border"
                :class="
                  tempDetailFilters.categories.includes(cat.key)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-gray-300'
                "
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- SUB CATEGORY -->
          <div v-if="availableSubCategories.length">
            <label class="text-sm font-medium">
              <span v-if="isLoadingSubCategories">Memuat Sub Kategori...</span>
              <span v-else>Sub Kategori</span>
            </label>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <button
                v-for="sub in availableSubCategories"
                :key="sub.key"
                @click="toggleSubCategory(sub.key)"
                class="px-3 py-2 text-xs rounded-xl border"
                :class="
                  tempDetailFilters.subCategories.includes(sub.key)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-gray-300'
                "
              >
                {{ sub.label }}
              </button>
            </div>
          </div>
        </template>

        <!-- ===================== MERCHANT FILTER ===================== -->
        <template v-else-if="activeTab === 'merchants'">
          <div>
            <label class="text-sm font-medium">
              <span v-if="isLoadingSegments">Memuat Segmentasi UMKM...</span>
              <span v-else>Segmentasi UMKM</span>
            </label>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <button
                v-for="seg in availableSegments"
                :key="seg.key"
                @click="toggleSegment(seg.key)"
                class="px-3 py-2 text-xs rounded-xl border"
                :class="
                  tempDetailFilters.segments.includes(seg.key)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-gray-300'
                "
              >
                {{ seg.label }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <template #footer>
        <div class="flex gap-2">
          <Button
            variant="muted-outline"
            class="w-full"
            @click="resetAllFilters"
          >
            Reset
          </Button>
          <Button variant="primary" class="w-full" @click="applyDetailFilter">
            Terapkan
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>
