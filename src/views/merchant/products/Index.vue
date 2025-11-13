<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";

const router = useRouter();
const toast = useToast();

// Emit untuk toggle sidebar dari parent layout
const emit = defineEmits(["toggle-sidebar"]);

// State
const products = ref([]);
const loading = ref(false);
const selectedProducts = ref([]);
const selectAll = ref(false);

// Modals
const showExportModal = ref(false);
const showFilterModal = ref(false);
const showBulkActionModal = ref(false); // NEW: Modal untuk bulk action

// Filters
const searchQuery = ref("");
const filters = ref({
  status: "",
  category: "",
  minPrice: null,
  maxPrice: null,
  minStock: null,
  maxStock: null,
  sortBy: "newest",
});

const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);
const merchantId = ref(1);

// Filter options
const statusOptions = [
  { label: "Semua Status", value: "" },
  { label: "Dipublish", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Diarsipkan", value: "archived" },
];

const sortOptions = [
  { label: "Terbaru", value: "newest" },
  { label: "Terlama", value: "oldest" },
  { label: "Nama A-Z", value: "name_asc" },
  { label: "Nama Z-A", value: "name_desc" },
  { label: "Harga Terendah", value: "price_asc" },
  { label: "Harga Tertinggi", value: "price_desc" },
  { label: "Stok Terendah", value: "stock_asc" },
  { label: "Stok Tertinggi", value: "stock_desc" },
];

const categoryOptions = [
  { label: "Semua Kategori", value: "" },
  { label: "Barang Pakai", value: "1" },
  { label: "Bahan Masakan", value: "2" },
  { label: "Makanan Cepat Saji", value: "3" },
  { label: "Makanan", value: "4" },
  { label: "Toiletries", value: "5" },
  { label: "Minuman", value: "6" },
  { label: "Makanan Instan", value: "7" },
];

// DUMMY DATA
const dummyProducts = [
  {
    id: 1,
    name: "Sandal Jepit",
    slug: "sandal-jepit-ba000001",
    sku: "BA000001",
    description: "Sandal jepit nyaman untuk sehari-hari",
    status: "published",
    total_stock: 30,
    min_price: 12000,
    max_price: 14000,
    variant_count: 2,
    cover_image: {
      id: 1,
      image_path: "https://via.placeholder.com/150/4A90E2/FFFFFF?text=Sandal",
      is_cover: true,
    },
    categories: [{ id: 1, category_name: "Barang Pakai" }],
    created_at: "2025-11-10T08:00:00.000Z",
    updated_at: "2025-11-12T10:30:00.000Z",
  },
  {
    id: 2,
    name: "Minyak Goreng",
    slug: "minyak-goreng-ba000002",
    sku: "BA000002",
    description: "Minyak goreng kemasan 1L",
    status: "published",
    total_stock: 14,
    min_price: 12000,
    max_price: 25000,
    variant_count: 0,
    cover_image: {
      id: 2,
      image_path: "https://via.placeholder.com/150/F5A623/FFFFFF?text=Minyak",
      is_cover: true,
    },
    categories: [{ id: 2, category_name: "Bahan Masakan" }],
    created_at: "2025-11-11T09:15:00.000Z",
    updated_at: "2025-11-12T11:00:00.000Z",
  },
  {
    id: 3,
    name: "Kecap Manis",
    slug: "kecap-manis-ba000003",
    sku: "BA000003",
    description: "Kecap manis cap jempol 600ml",
    status: "published",
    total_stock: 14,
    min_price: 12000,
    max_price: 25000,
    variant_count: 2,
    cover_image: {
      id: 3,
      image_path: "https://via.placeholder.com/150/8B572A/FFFFFF?text=Kecap",
      is_cover: true,
    },
    categories: [{ id: 3, category_name: "Makanan Cepat Saji" }],
    created_at: "2025-11-11T10:30:00.000Z",
    updated_at: "2025-11-12T12:00:00.000Z",
  },
  {
    id: 4,
    name: "Nasi Goreng Spesial Solo Sjjksd djKJSdj jdskjdk",
    slug: "nasi-goreng-spesial-ba000004",
    sku: "BA000004",
    description: "Nasi goreng dengan telur mata sapi",
    status: "draft",
    total_stock: 0,
    min_price: 15000,
    max_price: 20000,
    variant_count: 3,
    cover_image: {
      id: 4,
      image_path:
        "https://via.placeholder.com/150/E74C3C/FFFFFF?text=Nasi+Goreng",
      is_cover: true,
    },
    categories: [{ id: 4, category_name: "Makanan" }],
    created_at: "2025-11-12T07:00:00.000Z",
    updated_at: "2025-11-12T13:00:00.000Z",
  },
  {
    id: 5,
    name: "Sabun Mandi",
    slug: "sabun-mandi-ba000005",
    sku: "BA000005123123123123213",
    description: "Sabun mandi batangan wangi melati",
    status: "published",
    total_stock: 45,
    min_price: 5000,
    max_price: 8000,
    variant_count: 0,
    cover_image: {
      id: 5,
      image_path: "https://via.placeholder.com/150/9B59B6/FFFFFF?text=Sabun",
      is_cover: true,
    },
    categories: [{ id: 5, category_name: "Toiletries" }],
    created_at: "2025-11-10T14:20:00.000Z",
    updated_at: "2025-11-12T14:00:00.000Z",
  },
  {
    id: 6,
    name: "Teh Celup",
    slug: "teh-celup-ba000006",
    sku: "BA000006",
    description: "Teh celup isi 25 sachet",
    status: "archived",
    total_stock: 5,
    min_price: 800000000,
    max_price: 1200000000,
    variant_count: 1,
    cover_image: {
      id: 6,
      image_path: "https://via.placeholder.com/150/27AE60/FFFFFF?text=Teh",
      is_cover: true,
    },
    categories: [{ id: 6, category_name: "Minuman" }],
    created_at: "2025-11-09T11:00:00.000Z",
    updated_at: "2025-11-12T15:00:00.000Z",
  },
  {
    id: 7,
    name: "Indomie Goreng",
    slug: "indomie-goreng-ba000007",
    sku: "BA000007",
    description: "Mi instan rasa goreng",
    status: "published",
    total_stock: 1003123213,
    min_price: 3000,
    max_price: 3000,
    variant_count: 0,
    cover_image: {
      id: 7,
      image_path: "https://via.placeholder.com/150/E67E22/FFFFFF?text=Indomie",
      is_cover: true,
    },
    categories: [{ id: 7, category_name: "Makanan Instan" }],
    created_at: "2025-11-08T16:30:00.000Z",
    updated_at: "2025-11-12T16:00:00.000Z",
  },
  {
    id: 8,
    name: "Gula Pasir",
    slug: "gula-pasir-ba000008",
    sku: "BA000008",
    description: "Gula pasir putih 1kg",
    status: "published",
    total_stock: 25,
    min_price: 15000,
    max_price: 15000,
    variant_count: 0,
    cover_image: {
      id: 8,
      image_path: "https://via.placeholder.com/150/ECF0F1/000000?text=Gula",
      is_cover: true,
    },
    categories: [{ id: 2, category_name: "Bahan Masakan" }],
    created_at: "2025-11-07T13:45:00.000Z",
    updated_at: "2025-11-12T17:00:00.000Z",
  },
];

// Computed
const filteredProducts = computed(() => {
  let result = products.value;

  // Search
  if (searchQuery.value) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Status filter
  if (filters.value.status) {
    result = result.filter((p) => p.status === filters.value.status);
  }

  // Category filter
  if (filters.value.category) {
    result = result.filter((p) =>
      p.categories?.some((c) => c.id === parseInt(filters.value.category))
    );
  }

  // Price range
  if (filters.value.minPrice !== null) {
    result = result.filter((p) => p.min_price >= filters.value.minPrice);
  }
  if (filters.value.maxPrice !== null) {
    result = result.filter((p) => p.max_price <= filters.value.maxPrice);
  }

  // Stock range
  if (filters.value.minStock !== null) {
    result = result.filter((p) => p.total_stock >= filters.value.minStock);
  }
  if (filters.value.maxStock !== null) {
    result = result.filter((p) => p.total_stock <= filters.value.maxStock);
  }

  // Sort
  switch (filters.value.sortBy) {
    case "oldest":
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case "name_asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name_desc":
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price_asc":
      result.sort((a, b) => a.min_price - b.min_price);
      break;
    case "price_desc":
      result.sort((a, b) => b.max_price - a.max_price);
      break;
    case "stock_asc":
      result.sort((a, b) => a.total_stock - b.total_stock);
      break;
    case "stock_desc":
      result.sort((a, b) => b.total_stock - a.total_stock);
      break;
    case "newest":
    default:
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
  }

  return result;
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.status) count++;
  if (filters.value.category) count++;
  if (filters.value.minPrice !== null) count++;
  if (filters.value.maxPrice !== null) count++;
  if (filters.value.minStock !== null) count++;
  if (filters.value.maxStock !== null) count++;
  if (filters.value.sortBy !== "newest") count++;
  return count;
});

const hasSelectedProducts = computed(() => selectedProducts.value.length > 0);

// NEW: Selected products details
const selectedProductsCount = computed(() => selectedProducts.value.length);

const selectedProductsData = computed(() => {
  return products.value.filter((p) => selectedProducts.value.includes(p.id));
});

// Methods
const fetchProducts = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  products.value = dummyProducts;
  totalItems.value = dummyProducts.length;
  loading.value = false;
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchProducts();
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedProducts.value = filteredProducts.value.map((p) => p.id);
  } else {
    selectedProducts.value = [];
  }
};

// NEW: Bulk Actions
const bulkDelete = () => {
  if (
    confirm(
      `Hapus ${selectedProductsCount.value} produk yang dipilih?\n\nTindakan ini tidak dapat dibatalkan.`
    )
  ) {
    products.value = products.value.filter(
      (p) => !selectedProducts.value.includes(p.id)
    );
    totalItems.value = products.value.length;
    toast.success(`${selectedProductsCount.value} produk berhasil dihapus`);
    selectedProducts.value = [];
    selectAll.value = false;
  }
};

const bulkUpdateStatus = (status) => {
  const statusLabel = getStatusLabel(status);

  if (
    confirm(
      `Ubah status ${selectedProductsCount.value} produk menjadi "${statusLabel}"?`
    )
  ) {
    selectedProductsData.value.forEach((product) => {
      product.status = status;
    });

    toast.success(
      `${selectedProductsCount.value} produk berhasil diubah menjadi ${statusLabel}`
    );
    selectedProducts.value = [];
    selectAll.value = false;
    showBulkActionModal.value = false;
  }
};

const openBulkActionModal = () => {
  showBulkActionModal.value = true;
};

const closeBulkActionModal = () => {
  showBulkActionModal.value = false;
};

const cancelSelection = () => {
  selectedProducts.value = [];
  selectAll.value = false;
};

const openExportModal = () => {
  showExportModal.value = true;
};

const openFilterModal = () => {
  showFilterModal.value = true;
};

const applyFilters = () => {
  showFilterModal.value = false;
  fetchProducts();
};

const resetFilters = () => {
  filters.value = {
    status: "",
    category: "",
    minPrice: null,
    maxPrice: null,
    minStock: null,
    maxStock: null,
    sortBy: "newest",
  };
  fetchProducts();
};

const exportPDF = () => {
  showExportModal.value = false;
  toast.info("Export PDF dalam pengembangan");
};

const exportExcel = () => {
  showExportModal.value = false;
  toast.info("Export Excel dalam pengembangan");
};

const goToCreate = () => {
  toast.info("Navigasi ke halaman tambah produk");
};

const goToEdit = (product) => {
  toast.info(`Edit produk: ${product.name}`);
};

const goToDetail = (product) => {
  toast.info(`Detail produk: ${product.name}`);
};

const deleteProduct = (product) => {
  if (confirm(`Hapus produk "${product.name}"?`)) {
    products.value = products.value.filter((p) => p.id !== product.id);
    totalItems.value--;
    toast.success("Produk berhasil dihapus");
  }
};

const getStatusLabel = (status) => {
  const labels = {
    published: "Dipublish",
    draft: "Draft",
    archived: "Diarsipkan",
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    published: "bg-success-background text-success-foreground",
    draft: "bg-warning-background text-warning-foreground",
    archived: "bg-danger-background text-danger-foreground",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

// Add number formatter helper
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "jt";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "rb";
  }
  return num.toString();
};

// Update formatPrice to handle very long numbers
const formatPrice = (min, max) => {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Compact format for very large numbers
  const formatCompact = (num) => {
    if (num >= 1000000000) {
      return "Rp " + (num / 1000000000).toFixed(1) + "M";
    }
    if (num >= 1000000) {
      return "Rp " + (num / 1000000).toFixed(1) + "jt";
    }
    return formatter.format(num);
  };

  if (min === max) {
    return formatCompact(min);
  }

  return `${formatCompact(min)} - ${formatCompact(max)}`;
};

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="">
    <!-- Header -->
    <div class="flex justify-between items-center py-6 px-4 sm:px-6 bg-white">
      <div class="flex items-center gap-3">
        <!-- Hamburger Button (Mobile) - Emit event to parent -->
        <button
          @click="emit('toggle-sidebar')"
          class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-muted-background transition lg:hidden"
        >
          <i class="pi pi-bars text-gray-700"></i>
        </button>

        <div>
          <h1 class="text-base sm:text-2xl font-semibold text-merchant-primary">
            Daftar Produk
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground">
            {{ totalItems }} Produk
          </p>
        </div>
      </div>

      <div class="flex gap-2 sm:gap-3">
        <Button @click="goToCreate" variant="merchant" size="sm">
          <i class="pi pi-plus"></i>
          <span class="hidden sm:inline ml-2 text">Tambah Produk</span>
        </Button>
        <Button @click="openExportModal" variant="merchant-outline" size="sm">
          <i class="pi pi-download"></i>
          <span class="hidden sm:inline ml-2">Export</span>
        </Button>
      </div>
    </div>

    <!-- Search & Toolbar -->
    <div class="px-4 sm:px-6 space-y-2 sm:space-y-4 mb-1 bg-white">
      <!-- Search Bar -->
      <div class="sm:flex sm:items-center sm:gap-4">
        <div class="flex-1 mb-2 sm:mb-0">
          <TextField
            variant="merchant"
            v-model="searchQuery"
            placeholder="Cari produk"
            icon="pi-search"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- Desktop: Filter button inline -->
        <Button
          @click="openFilterModal"
          variant="muted-outline"
          size="md"
          custom-class="!hidden sm:!flex items-center gap-2 whitespace-nowrap relative !rounded-xl !py-2"
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

      <!-- Mobile: Toolbar (Pilih Semua + Filter) -->
      <div
        class="flex sm:hidden flex-row justify-between items-center p-3 rounded-lg gap-4"
      >
        <label class="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            v-model="selectAll"
            @change="toggleSelectAll"
            class="appearance-none w-4.5 h-4.5 border-1 border-muted-foreground rounded-sm bg-transparent cursor-pointer transition-all duration-200 checked:bg-merchant-primary checked:border-merchant-primary focus:outline-none focus:ring-2 focus:ring-merchant-primary focus:ring-offset-2 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDQuNUw0LjUgOEwxMSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
          />
          <span
            class="ml-2 text-xs text-muted-foreground group-hover:text-merchant-primary transition-colors"
          >
            Pilih Semua
          </span>
        </label>
        <Button
          @click="openFilterModal"
          variant="muted-outline"
          size="sm"
          custom-class="!flex sm:!hidden items-center gap-2 whitespace-nowrap relative"
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
        <!-- <button
          @click="openFilterModal"
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition text-xs relative"
        >
          <i class="pi pi-filter"></i>
          <span>Filter</span>
          <span
            v-if="activeFilterCount > 0"
            class="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold"
          >
            {{ activeFilterCount }}
          </span>
        </button> -->
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-20 bg-white rounded-lg mx-4 sm:mx-6"
    >
      <div
        class="w-10 h-10 border-4 border-muted-foreground border-t-merchant-primary rounded-full animate-spin"
      ></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredProducts.length === 0"
      class="flex flex-col items-center justify-center py-20 bg-white rounded-lg text-center mx-4 sm:mx-6"
    >
      <i class="pi pi-inbox text-5xl text-muted-foreground mb-4"></i>
      <p class="text-muted-foreground mb-4">
        Tidak ada produk yang sesuai dengan filter
      </p>
      <Button @click="resetFilters" variant="merchant">Reset Filter</Button>
    </div>

    <!-- Product List -->
    <div v-else class="px-4 sm:px-6">
      <!-- Mobile: Card List -->
      <div class="flex sm:hidden flex-col gap-2 py-2">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="flex flex-col gap-2 p-4 bg-white shadow hover:shadow-md transition"
        >
          <!-- Mobile layout (existing code) -->
          <div class="flex gap-3 items-center">
            <div class="flex-shrink-0 pt-1">
              <label class="cursor-pointer inline-block">
                <input
                  type="checkbox"
                  v-model="selectedProducts"
                  :value="product.id"
                  class="appearance-none w-4.5 h-4.5 border-1 border-muted-foreground rounded-sm bg-transparent cursor-pointer transition-all duration-200 checked:bg-merchant-primary checked:border-merchant-primary focus:outline-none focus:ring-2 focus:ring-merchant-primary focus:ring-offset-2 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDQuNUw0LjUgOEwxMSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
                />
              </label>
            </div>

            <div
              @click="goToDetail(product)"
              class="w-16 h-16 rounded-lg overflow-hidden bg-muted-background cursor-pointer flex-shrink-0"
            >
              <img
                :src="product.cover_image?.image_path"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="flex-1 min-w-0">
              <h3
                @click="goToDetail(product)"
                class="text-sm font-semibold text-merchant-primary truncate cursor-pointer hover:text-merchant-primary/80 transition"
                :title="product.name"
              >
                {{ product.name }}
              </h3>

              <p
                class="text-xs text-muted-foreground font-medium truncate mt-0.5"
                :title="product.sku"
              >
                {{ product.sku }}
              </p>

              <div class="flex items-center gap-2 mt-2">
                <span
                  class="inline-flex items-center px-2 py-1 bg-merchant-primary/10 text-merchant-primary rounded-md text-xs font-medium"
                >
                  <i class="pi pi-box mr-1"></i>
                  Stok: {{ formatNumber(product.total_stock) }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100"></div>

          <div class="space-y-3">
            <div class="flex justify-between items-center text-xs">
              <span class="text-muted-foreground flex-shrink-0">Kategori</span>
              <span
                class="font-medium text-right truncate ml-2"
                :title="product.categories?.[0]?.category_name"
              >
                {{ product.categories?.[0]?.category_name || "-" }}
              </span>
            </div>

            <div class="flex justify-between items-center text-xs">
              <span class="text-muted-foreground flex-shrink-0">Harga</span>
              <span
                class="text-merchant-primary font-semibold text-right truncate ml-2"
                :title="formatPrice(product.min_price, product.max_price)"
              >
                {{ formatPrice(product.min_price, product.max_price) }}
              </span>
            </div>

            <div class="flex flex-row justify-between items-center gap-2">
              <span class="text-xs text-muted-foreground flex-shrink-0">
                Status Produk
              </span>
              <div class="flex flex-col items-end gap-1">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                    getStatusClass(product.status),
                  ]"
                >
                  {{ getStatusLabel(product.status) }}
                </span>

                <span
                  v-if="product.variant_count > 0"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-warning-background text-warning-foreground rounded-full text-xs whitespace-nowrap"
                >
                  <i class="pi pi-exclamation-triangle text-[10px]"></i>
                  {{ product.variant_count }} varian habis
                </span>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100"></div>

          <div class="flex items-center justify-between">
            <button
              @click="deleteProduct(product)"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-danger-background text-danger-foreground transition text-sm font-medium"
            >
              <i class="pi pi-trash"></i>
            </button>

            <div class="flex gap-2">
              <button
                @click="goToDetail(product)"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-muted-foreground transition text-sm font-medium"
              >
                <i class="pi pi-eye"></i>
              </button>
              <button
                @click="goToEdit(product)"
                class="flex items-center gap-2 px-3 py-2 rounded-lg bg-merchant-primary/10 text-merchant-primary hover:bg-merchant-primary/20 transition text-sm font-medium"
              >
                <i class="pi pi-pencil"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Table Layout -->
      <div
        class="hidden sm:block py-4 bg-white rounded-lg shadow overflow-hidden"
      >
        <!-- Add container with max-width -->
        <div class="w-full overflow-x-auto">
          <div class="min-w-[1000px]">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="px-6 py-4 text-left w-12">
                    <label class="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        v-model="selectAll"
                        @change="toggleSelectAll"
                        class="appearance-none w-5 h-5 border-2 border-muted-foreground rounded-md bg-transparent cursor-pointer transition-all duration-200 checked:bg-merchant-primary checked:border-merchant-primary focus:outline-none focus:ring-2 focus:ring-merchant-primary focus:ring-offset-2 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDQuNUw0LjUgOEwxMSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
                      />
                    </label>
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Produk
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    SKU
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Kategori
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Stok
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Harga
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-32"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="hover:bg-gray-50 transition"
                >
                  <!-- Checkbox -->
                  <td class="px-6 py-4">
                    <label class="cursor-pointer inline-block">
                      <input
                        type="checkbox"
                        v-model="selectedProducts"
                        :value="product.id"
                        class="appearance-none w-5 h-5 border-2 border-muted-foreground rounded-md bg-transparent cursor-pointer transition-all duration-200 checked:bg-merchant-primary checked:border-merchant-primary focus:outline-none focus:ring-2 focus:ring-merchant-primary focus:ring-offset-2 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDQuNUw0LjUgOEwxMSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
                      />
                    </label>
                  </td>

                  <!-- Product Info -->
                  <td class="px-6 py-4">
                    <div
                      class="flex items-center gap-3 cursor-pointer group"
                      @click="goToDetail(product)"
                    >
                      <div
                        class="w-12 h-12 rounded-lg overflow-hidden bg-muted-background flex-shrink-0"
                      >
                        <img
                          :src="product.cover_image?.image_path"
                          :alt="product.name"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div class="min-w-0 max-w-xs">
                        <p
                          class="text-sm font-semibold text-merchant-primary truncate group-hover:text-merchant-primary/80 transition"
                          :title="product.name"
                        >
                          {{ product.name }}
                        </p>
                        <p
                          v-if="product.variant_count > 0"
                          class="text-xs text-warning-foreground mt-1"
                        >
                          <i class="pi pi-exclamation-triangle mr-1"></i>
                          {{ product.variant_count }} varian habis
                        </p>
                      </div>
                    </div>
                  </td>

                  <!-- SKU -->
                  <td class="px-6 py-4">
                    <p
                      class="text-sm text-gray-700 font-mono truncate max-w-[150px]"
                      :title="product.sku"
                    >
                      {{ product.sku }}
                    </p>
                  </td>

                  <!-- Category -->
                  <td class="px-6 py-4">
                    <p class="text-sm text-gray-700 truncate max-w-[120px]">
                      {{ product.categories?.[0]?.category_name || "-" }}
                    </p>
                  </td>

                  <!-- Stock -->
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2.5 py-1 bg-merchant-primary/10 text-merchant-primary rounded-md text-sm font-medium whitespace-nowrap"
                    >
                      {{ formatNumber(product.total_stock) }}
                    </span>
                  </td>

                  <!-- Price -->
                  <td class="px-6 py-4">
                    <p
                      class="text-sm font-semibold text-merchant-primary truncate max-w-[150px]"
                      :title="formatPrice(product.min_price, product.max_price)"
                    >
                      {{ formatPrice(product.min_price, product.max_price) }}
                    </p>
                  </td>

                  <!-- Status -->
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                        getStatusClass(product.status),
                      ]"
                    >
                      {{ getStatusLabel(product.status) }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="goToDetail(product)"
                        class="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground transition"
                        title="Lihat Detail"
                      >
                        <i class="pi pi-eye text-sm"></i>
                      </button>
                      <button
                        @click="goToEdit(product)"
                        class="p-2 rounded-lg bg-merchant-primary/10 text-merchant-primary hover:bg-merchant-primary/20 transition"
                        title="Edit Produk"
                      >
                        <i class="pi pi-pencil text-sm"></i>
                      </button>
                      <button
                        @click="deleteProduct(product)"
                        class="p-2 rounded-lg hover:bg-danger-background text-danger-foreground transition"
                        title="Hapus Produk"
                      >
                        <i class="pi pi-trash text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalItems > perPage" class="mt-4 text-center px-4 sm:px-6">
      <p class="text-sm text-muted-foreground">
        Menampilkan {{ filteredProducts.length }} dari {{ totalItems }} produk
      </p>
    </div>

    <!-- Floating Bulk Action Bar -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="hasSelectedProducts"
        class="fixed z-40"
        :class="[
          // Mobile: Bottom sticky (full width)
          'bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl',
          // Desktop: Floating centered
          'sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:min-w-xl sm:rounded-2xl  sm:shadow-lg',
        ]"
      >
        <div class="px-6 py-4">
          <div class="flex items-center justify-between gap-3">
            <!-- Selected Count -->
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 bg-merchant-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span class="text-merchant-primary font-bold text-sm">
                  {{ selectedProductsCount }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">
                  {{ selectedProductsCount }} Produk dipilih
                </p>
                <button
                  @click="cancelSelection"
                  class="text-xs text-muted-foreground hover:text-merchant-primary transition whitespace-nowrap"
                >
                  Batalkan Pilihan
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Delete Button -->
              <Button
                @click="bulkDelete"
                variant="danger-outline"
                custom-class=""
              >
                <i class="pi pi-trash"></i>
                <span class="hidden sm:inline text-sm">Hapus</span>
              </Button>

              <!-- Status Action Button -->
              <Button
                @click="openBulkActionModal"
                variant="merchant"
                custom-class=""
              >
                <i class="pi pi-pencil"></i>
                <span class="hidden sm:inline text-sm">Ubah Status</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- UPDATED: Bulk Status Action Modal -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="translate-y-full sm:scale-95 opacity-0"
      enter-to-class="translate-y-0 sm:scale-100 opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="translate-y-0 sm:scale-100 opacity-100"
      leave-to-class="translate-y-full sm:scale-95 opacity-0"
    >
      <div
        v-if="showBulkActionModal"
        class="fixed z-50"
        :class="[
          // Mobile: Bottom sheet
          'inset-x-0 bottom-0 rounded-t-2xl',
          // Desktop: Centered modal
          'sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4',
        ]"
        @click.self="closeBulkActionModal"
      >
        <div
          class="bg-white shadow-2xl w-full"
          :class="[
            // Mobile: Full width bottom sheet
            'rounded-t-2xl',
            // Desktop: Max width centered
            'sm:rounded-2xl sm:max-w-md sm:w-full',
          ]"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex justify-between items-center px-6 py-4 border-b border-gray-200"
          >
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-gray-800">
                Ubah Status Produk
              </h3>
              <p class="text-xs sm:text-sm text-muted-foreground mt-1">
                {{ selectedProductsCount }} produk akan diubah statusnya
              </p>
            </div>
            <button
              @click="closeBulkActionModal"
              class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
            >
              <i class="pi pi-times text-gray-600"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="px-6 py-4 space-y-3">
            <!-- Publish Action -->
            <button
              @click="bulkUpdateStatus('published')"
              class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-merchant-primary transition text-left group"
            >
              <div
                class="w-12 h-12 bg-success-background rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
              >
                <i
                  class="pi pi-check-circle text-2xl text-success-foreground"
                ></i>
              </div>
              <div>
                <h4 class="text-sm sm:text-base font-semibold text-gray-800">
                  Dipublish
                </h4>
                <p class="text-xs sm:text-sm text-muted-foreground">
                  Produk akan muncul di katalog dan dapat dibeli
                </p>
              </div>
            </button>

            <!-- Archive Action -->
            <button
              @click="bulkUpdateStatus('archived')"
              class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-merchant-primary transition text-left group"
            >
              <div
                class="w-12 h-12 bg-danger-background rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
              >
                <i class="pi pi-box text-2xl text-danger-foreground"></i>
              </div>
              <div>
                <h4 class="text-sm sm:text-base font-semibold text-gray-800">
                  Diarsipkan
                </h4>
                <p class="text-xs sm:text-sm text-muted-foreground">
                  Produk diarsipkan dan tidak aktif
                </p>
              </div>
            </button>
          </div>

          <!-- Safe Area Bottom Padding (Mobile only) -->
          <div class="h-6 sm:h-0"></div>
        </div>
      </div>
    </transition>

    <!-- UPDATED: Filter Modal -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="translate-y-full sm:scale-95 opacity-0"
      enter-to-class="translate-y-0 sm:scale-100 opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="translate-y-0 sm:scale-100 opacity-100"
      leave-to-class="translate-y-full sm:scale-95 opacity-0"
    >
      <div
        v-if="showFilterModal"
        class="fixed z-50"
        :class="[
          // Mobile: Bottom sheet
          'inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh]',
          // Desktop: Centered modal
          'sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 sm:max-h-none',
        ]"
        @click.self="showFilterModal = false"
      >
        <div
          class="bg-white shadow-2xl overflow-hidden w-full"
          :class="[
            // Mobile: Full width bottom sheet
            'rounded-t-2xl max-h-[90vh] flex flex-col',
            // Desktop: Max width centered
            'sm:rounded-2xl sm:max-w-lg sm:w-full sm:max-h-[90vh]',
          ]"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0"
          >
            <h3 class="text-base sm:text-lg font-semibold text-gray-800">
              Filter Produk
            </h3>
            <button
              @click="showFilterModal = false"
              class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
            >
              <i class="pi pi-times text-gray-600"></i>
            </button>
          </div>

          <!-- Content with scroll -->
          <div class="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            <!-- Status Filter -->
            <SelectField
              variant="merchant"
              v-model="filters.status"
              label="Status Produk"
              :options="statusOptions"
            />

            <!-- Category Filter -->
            <SelectField
              variant="merchant"
              v-model="filters.category"
              label="Kategori"
              :options="categoryOptions"
            />

            <!-- Sort By -->
            <SelectField
              variant="merchant"
              v-model="filters.sortBy"
              label="Urutkan Berdasarkan"
              :options="sortOptions"
            />

            <!-- Price Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rentang Harga
              </label>
              <div class="flex items-center gap-2">
                <TextField
                  variant="merchant"
                  v-model.number="filters.minPrice"
                  type="number"
                  placeholder="Min"
                />
                <span class="text-gray-600 font-medium">-</span>
                <TextField
                  variant="merchant"
                  v-model.number="filters.maxPrice"
                  type="number"
                  placeholder="Max"
                />
              </div>
            </div>

            <!-- Stock Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rentang Stok
              </label>
              <div class="flex items-center gap-2">
                <TextField
                  variant="merchant"
                  v-model.number="filters.minStock"
                  type="number"
                  placeholder="Min"
                />
                <span class="text-gray-600 font-medium">-</span>
                <TextField
                  variant="merchant"
                  v-model.number="filters.maxStock"
                  type="number"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div
            class="flex gap-3 px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0"
          >
            <Button
              @click="resetFilters"
              variant="merchant-outline"
              block
              custom-class="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Reset
            </Button>
            <Button @click="applyFilters" block variant="merchant">
              Terapkan Filter
            </Button>
          </div>
        </div>
      </div>
    </transition>

    <!-- UPDATED: Export Modal -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="translate-y-full sm:scale-95 opacity-0"
      enter-to-class="translate-y-0 sm:scale-100 opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="translate-y-0 sm:scale-100 opacity-100"
      leave-to-class="translate-y-full sm:scale-95 opacity-0"
    >
      <div
        v-if="showExportModal"
        class="fixed z-50"
        :class="[
          // Mobile: Bottom sheet
          'inset-x-0 bottom-0 rounded-t-2xl',
          // Desktop: Centered modal
          'sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4',
        ]"
        @click.self="showExportModal = false"
      >
        <div
          class="bg-white shadow-2xl w-full"
          :class="[
            // Mobile: Full width bottom sheet
            'rounded-t-2xl',
            // Desktop: Max width centered
            'sm:rounded-2xl sm:max-w-md sm:w-full',
          ]"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex justify-between items-center px-6 py-4 border-b border-gray-200"
          >
            <h3 class="text-base sm:text-lg font-semibold text-gray-800">
              Export Data
            </h3>
            <button
              @click="showExportModal = false"
              class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
            >
              <i class="pi pi-times text-muted-foreground"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="px-6 py-4 space-y-3">
            <button
              @click="exportPDF"
              class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-merchant-primary transition text-left group"
            >
              <div
                class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
              >
                <i class="pi pi-file-pdf text-2xl text-red-500"></i>
              </div>
              <div>
                <h4 class="text-sm sm:text-base font-semibold text-gray-800">
                  Export ke PDF
                </h4>
                <p class="text-xs sm:text-sm text-muted-foreground">
                  Download data produk dalam format PDF
                </p>
              </div>
            </button>

            <button
              @click="exportExcel"
              class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-merchant-primary transition text-left group"
            >
              <div
                class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
              >
                <i class="pi pi-file-excel text-2xl text-green-500"></i>
              </div>
              <div>
                <h4 class="text-sm sm:text-base font-semibold text-gray-800">
                  Export ke Excel
                </h4>
                <p class="text-xs sm:text-sm text-muted-foreground">
                  Download dalam format Excel (.xlsx)
                </p>
              </div>
            </button>
          </div>

          <!-- Safe Area Bottom Padding (Mobile only) -->
          <div class="h-6 sm:h-0"></div>
        </div>
      </div>
    </transition>

    <!-- UPDATED: Unified Backdrop -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showFilterModal || showExportModal || showBulkActionModal"
        @click="
          showFilterModal = false;
          showExportModal = false;
          showBulkActionModal = false;
        "
        class="fixed inset-0 bg-black/30 z-40"
      ></div>
    </transition>
  </div>
</template>

<style scoped>
/* Desktop table custom scrollbar */
@media (min-width: 640px) {
  .overflow-x-auto::-webkit-scrollbar {
    height: 8px;
  }

  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}
</style>
