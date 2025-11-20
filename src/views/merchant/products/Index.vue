<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import MerchantTable from "@/components/common/MerchantTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import ProductCard from "@/components/common/ProductCard.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import BulkActionBar from "@/components/common/BulkActionBar.vue";

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
const showBulkActionModal = ref(false);
const showVisibilityModal = ref(false); // NEW

// NEW: Selected product for visibility toggle
const selectedProductForVisibility = ref(null);

// NEW: Combined modal state for body scroll lock
const isAnyModalOpen = computed(() => {
  return (
    showExportModal.value ||
    showFilterModal.value ||
    showBulkActionModal.value ||
    showVisibilityModal.value
  );
});

// Apply body scroll lock when any modal is open
useBodyScrollLock(isAnyModalOpen);

// Filters
const searchQuery = ref("");
const tempFilters = ref({
  status: "",
  category: "",
  minPrice: null,
  maxPrice: null,
  minStock: null,
  maxStock: null,
  sortBy: "newest",
});

const activeFilters = ref({
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

// NEW: Computed untuk pagination
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredProducts.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / perPage.value);
});

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * perPage.value + 1;
  const end = Math.min(
    currentPage.value * perPage.value,
    filteredProducts.value.length
  );
  return {
    start,
    end,
    total: filteredProducts.value.length,
  };
});

// Filter options
const statusOptions = [
  { label: "Semua Status", value: "" },
  { label: "Dipublish", value: "published" },
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
    status: "published",
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
  {
    id: 9,
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
      id: 9,
      image_path: "https://via.placeholder.com/150/ECF0F1/000000?text=Gula",
      is_cover: true,
    },
    categories: [{ id: 2, category_name: "Bahan Masakan" }],
    created_at: "2025-11-07T13:45:00.000Z",
    updated_at: "2025-11-12T17:00:00.000Z",
  },
  {
    id: 10,
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
      id: 10,
      image_path: "https://via.placeholder.com/150/ECF0F1/000000?text=Gula",
      is_cover: true,
    },
    categories: [{ id: 2, category_name: "Bahan Masakan" }],
    created_at: "2025-11-07T13:45:00.000Z",
    updated_at: "2025-11-12T17:00:00.000Z",
  },
  {
    id: 11,
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
      id: 11,
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

  // Status filter - GUNAKAN activeFilters
  if (activeFilters.value.status) {
    result = result.filter((p) => p.status === activeFilters.value.status);
  }

  // Category filter - GUNAKAN activeFilters
  if (activeFilters.value.category) {
    result = result.filter((p) =>
      p.categories?.some((c) => c.id === parseInt(activeFilters.value.category))
    );
  }

  // Price range - GUNAKAN activeFilters
  if (activeFilters.value.minPrice !== null) {
    result = result.filter((p) => p.min_price >= activeFilters.value.minPrice);
  }
  if (activeFilters.value.maxPrice !== null) {
    result = result.filter((p) => p.max_price <= activeFilters.value.maxPrice);
  }

  // Stock range - GUNAKAN activeFilters
  if (activeFilters.value.minStock !== null) {
    result = result.filter(
      (p) => p.total_stock >= activeFilters.value.minStock
    );
  }
  if (activeFilters.value.maxStock !== null) {
    result = result.filter(
      (p) => p.total_stock <= activeFilters.value.maxStock
    );
  }

  // Sort - GUNAKAN activeFilters
  switch (activeFilters.value.sortBy) {
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
  if (activeFilters.value.status) count++;
  if (activeFilters.value.category) count++;
  if (activeFilters.value.minPrice !== null) count++;
  if (activeFilters.value.maxPrice !== null) count++;
  if (activeFilters.value.minStock !== null) count++;
  if (activeFilters.value.maxStock !== null) count++;
  if (activeFilters.value.sortBy !== "newest") count++;
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
  currentPage.value = 1; // Reset ke halaman 1
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
    closeBulkActionModal();
  }
};

const openExportModal = () => {
  showExportModal.value = true;
};

const openFilterModal = () => {
  // Copy current active filters ke temp filters
  tempFilters.value = { ...activeFilters.value };
  showFilterModal.value = true;
};

const openBulkActionModal = () => {
  showBulkActionModal.value = true;
};

const closeBulkActionModal = () => {
  showBulkActionModal.value = false;
};

const closeFilterModal = () => {
  showFilterModal.value = false;
};

const closeExportModal = () => {
  showExportModal.value = false;
};

const cancelSelection = () => {
  selectedProducts.value = [];
  selectAll.value = false;
};

const applyFilters = () => {
  // Copy tempFilters ke activeFilters
  activeFilters.value = { ...tempFilters.value };
  currentPage.value = 1; // Reset ke halaman 1
  closeFilterModal();
  // fetchProducts(); // OPTIONAL: jika data dari API
};

const resetFilters = () => {
  const defaultFilters = {
    status: "",
    category: "",
    minPrice: null,
    maxPrice: null,
    minStock: null,
    maxStock: null,
    sortBy: "newest",
  };

  tempFilters.value = { ...defaultFilters };
  activeFilters.value = { ...defaultFilters };
  currentPage.value = 1;
  closeFilterModal();
  toast.success("Filter berhasil direset");
  // fetchProducts(); // OPTIONAL: jika data dari API
};

const exportPDF = () => {
  closeExportModal();
  toast.info("Export PDF dalam pengembangan");
};

const exportExcel = () => {
  closeExportModal();
  toast.info("Export Excel dalam pengembangan");
};

const goToCreate = () => {
  // toast.info("Navigasi ke halaman tambah produk");
  router.push({
    name: "Merchant - Buat Product",
  });
};

const goToEdit = (product) => {
  router.push({
    name: "Merchant - Product Edit",
    // params: { merchantId: merchantId.value, productId: product.id },
    params: { id: product.id },
  });
};

const goToDetail = (product) => {
  // toast.info(`Detail produk: ${product.name}`);
  router.push({
    name: "Merchant - Product Detail",
    // params: { merchantId: merchantId.value, productId: product.id },
    params: { id: product.id },
  });
};

const deleteProduct = (product) => {
  if (confirm(`Hapus produk "${product.name}"?`)) {
    products.value = products.value.filter((p) => p.id !== product.id);
    totalItems.value--;
    toast.success("Produk berhasil dihapus");
  }
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

// NEW: Generate page numbers untuk pagination
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    // Tampilkan semua halaman jika <= 7
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Tampilkan halaman dengan ellipsis
    if (current <= 3) {
      // Awal: 1 2 3 4 ... last
      pages.push(1, 2, 3, 4, "...", total);
    } else if (current >= total - 2) {
      // Akhir: 1 ... last-3 last-2 last-1 last
      pages.push(1, "...", total - 3, total - 2, total - 1, total);
    } else {
      // Tengah: 1 ... current-1 current current+1 ... last
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
  }

  return pages;
});

// NEW: Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // Scroll ke atas saat ganti halaman
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

onMounted(() => {
  fetchProducts();
});

// Table Configuration
const tableColumns = [
  { key: "name", label: "Produk", sortable: true },
  { key: "sku", label: "SKU", sortable: true, cellClass: "font-mono" },
  { key: "categories.0.category_name", label: "Kategori", sortable: false },
  { key: "total_stock", label: "Stok", sortable: true },
  { key: "price", label: "Harga", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

const tableActions = [
  {
    icon: "pi-eye",
    label: "Lihat Detail",
    handler: (product) => goToDetail(product),
    class: " hover:bg-muted-foreground/20 text-muted-foreground",
  },
  {
    icon: "pi-pencil",
    label: "Edit Produk",
    handler: (product) => goToEdit(product),
    class: " text-merchant-primary hover:bg-merchant-primary/20",
  },
  // UPDATED: Toggle Visibility Action - icon static
  {
    icon: "pi-cog",
    label: "Ubah Status",
    handler: (product) => toggleProductVisibility(product),
    class: "hover:bg-muted-foreground/20 text-warning-foreground",
  },
  {
    icon: "pi-trash",
    label: "Hapus Produk",
    handler: (product) => deleteProduct(product),
    class: "hover:bg-danger-background text-danger-foreground",
  },
];

// NEW: Helper functions for status (masih dibutuhkan untuk modal visibility)
const getStatusLabel = (status) => {
  const labels = {
    published: "Dipublish",
    archived: "Diarsipkan",
    out_of_stock: "Stok Habis",
  };
  return labels[status] || status;
};

// NEW: Toggle visibility method - open modal
const toggleProductVisibility = (product) => {
  selectedProductForVisibility.value = product;
  showVisibilityModal.value = true;
};

// NEW: Confirm visibility change
const confirmVisibilityChange = (newStatus) => {
  if (selectedProductForVisibility.value) {
    selectedProductForVisibility.value.status = newStatus;
    const statusLabel = getStatusLabel(newStatus);
    toast.success(`Status produk berhasil diubah menjadi ${statusLabel}`);
  }
  closeVisibilityModal();
};

// NEW: Close visibility modal
const closeVisibilityModal = () => {
  showVisibilityModal.value = false;
  selectedProductForVisibility.value = null;
};

// ADD: Toggle product selection method
const toggleProductSelection = (productId) => {
  const index = selectedProducts.value.indexOf(productId);

  if (index > -1) {
    // Remove from selection
    selectedProducts.value.splice(index, 1);
  } else {
    // Add to selection
    selectedProducts.value.push(productId);
  }

  // Update selectAll state
  selectAll.value =
    selectedProducts.value.length === filteredProducts.value.length;
};
</script>

<template>
  <div class="">
    <!-- Header - FIXED -->
    <div
      class="fixed sm:static top-0 left-0 right-0 flex justify-between items-center py-6 px-4 sm:px-6 bg-white"
    >
      <div class="flex items-center gap-3">
        <!-- Hamburger Button (Mobile) -->
        <button
          @click="emit('toggle-sidebar')"
          class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-muted-background transition sm:hidden"
        >
          <i class="pi pi-bars text-muted-foreground"></i>
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
        <Button
          @click="goToCreate"
          variant="merchant"
          size="sm"
          customClass="!hidden sm:!inline"
        >
          <i class="pi pi-plus"></i>
          <span class="hidden sm:inline ml-2 text">Tambah Produk</span>
        </Button>
        <Button
          @click="goToCreate"
          variant="merchant"
          size="md"
          customClass="sm:!hidden"
        >
          <i class="pi pi-plus"></i>
          <span class="hidden sm:inline ml-2 text">Tambah Produk</span>
        </Button>
        <Button
          @click="openExportModal"
          variant="merchant-outline"
          size="sm"
          customClass="!hidden sm:!inline"
        >
          <i class="pi pi-download"></i>
          <span class="hidden sm:inline ml-2">Export</span>
        </Button>
        <Button
          @click="openExportModal"
          variant="merchant-outline"
          size="md"
          customClass="sm:!hidden"
        >
          <i class="pi pi-download"></i>
          <span class="hidden sm:inline ml-2">Export</span>
        </Button>
      </div>
    </div>

    <!-- Spacer untuk kompensasi fixed header -->
    <div class="h-24 sm:h-0"></div>

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
        class="flex sm:hidden flex-row justify-between items-center px-3 rounded-lg gap-4"
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
      <!-- Mobile: Card List - UPDATE action buttons -->
      <div class="flex sm:hidden flex-col gap-2 py-2">
        <ProductCard
          v-for="product in paginatedProducts"
          :key="product.id"
          :product="product"
          :selected="selectedProducts.includes(product.id)"
          @toggle-select="toggleProductSelection"
          @view-detail="goToDetail"
          @edit="goToEdit"
          @delete="deleteProduct"
          @toggle-visibility="toggleProductVisibility"
        />
      </div>

      <!-- Desktop: Use MerchantTable Component -->
      <div class="hidden sm:block mb-4">
        <MerchantTable
          :items="paginatedProducts"
          :loading="loading"
          :columns="tableColumns"
          :selected-items="selectedProducts"
          :select-all="selectAll"
          :actions="tableActions"
          :current-page="currentPage"
          :total-pages="totalPages"
          :pagination-info="paginationInfo"
          empty-message="Tidak ada produk yang sesuai dengan filter"
          @update:selected-items="selectedProducts = $event"
          @update:select-all="
            selectAll = $event;
            toggleSelectAll();
          "
          @row-click="goToDetail"
          @page-change="goToPage"
          @next-page="nextPage"
          @prev-page="prevPage"
        >
          <!-- Custom Product Cell -->
          <template #cell-name="{ item }">
            <div class="flex items-center gap-3 cursor-pointer group">
              <div
                class="w-12 h-12 rounded-lg overflow-hidden bg-muted-background flex-shrink-0"
              >
                <img
                  :src="item.cover_image?.image_path"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="min-w-0 max-w-xs">
                <p
                  class="text-sm font-semibold text-merchant-primary truncate group-hover:text-merchant-primary/80 transition"
                  :title="item.name"
                >
                  {{ item.name }}
                </p>
              </div>
            </div>
          </template>

          <!-- Custom SKU Cell -->
          <template #cell-sku="{ value }">
            <p
              class="text-sm text-muted-foreground font-mono truncate max-w-[150px]"
              :title="value"
            >
              {{ value }}
            </p>
          </template>

          <!-- Custom Stock Cell -->
          <template #cell-total_stock="{ value }">
            <span
              class="inline-flex items-center px-2.5 py-1 bg-merchant-primary/10 text-merchant-primary rounded-md text-sm font-medium whitespace-nowrap"
            >
              {{ formatNumber(value) }}
            </span>
          </template>

          <!-- Custom Price Cell -->
          <template #cell-price="{ item }">
            <p
              class="text-sm font-semibold text-merchant-primary truncate max-w-[150px]"
              :title="formatPrice(item.min_price, item.max_price)"
            >
              {{ formatPrice(item.min_price, item.max_price) }}
            </p>
          </template>

          <!-- Custom Status Cell -->
          <template #cell-status="{ item }">
            <div class="flex flex-col gap-1">
              <StatusLabel :status="item.status" variant="product" size="sm" />
              <StatusLabel
                v-if="item.variant_count > 0"
                status="out_of_stock"
                variant="product"
                size="xs"
                :label="`${item.variant_count} varian habis`"
              />
            </div>
          </template>
        </MerchantTable>
      </div>
    </div>

    <!-- Mobile Pagination (Bottom) - TAMBAHKAN INI -->
    <div
      v-if="!loading && filteredProducts.length > 0"
      class="sm:hidden px-4 pb-4"
    >
      <MobilePagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @prev="prevPage"
        @next="nextPage"
        @go-to="goToPage"
      />
    </div>

    <!-- Spacer untuk Floating Bulk Action Bar (Mobile) -->
    <div v-if="hasSelectedProducts" class="h-20 sm:h-0"></div>

    <!-- UPDATED: Menggunakan BulkActionBar Component -->
    <BulkActionBar
      :selected-count="selectedProductsCount"
      :show="hasSelectedProducts"
      @cancel="cancelSelection"
      @delete="bulkDelete"
      @change-status="openBulkActionModal"
    />

    <!-- RESTORED: Bulk Status Action Modal (Manual Structure) -->
    <!-- Backdrop -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showBulkActionModal"
        @click="closeBulkActionModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4"
      ></div>
    </transition>

    <!-- UPDATED: Filter Modal - Single Footer untuk Mobile & Desktop -->
    <ResponsiveModal
      v-model:show="showFilterModal"
      title="Filter Produk"
      show-footer
      @close="closeFilterModal"
    >
      <!-- Content - BIND ke tempFilters -->
      <div class="space-y-4">
        <!-- Status Filter -->
        <SelectField
          variant="merchant"
          v-model="tempFilters.status"
          label="Status Produk"
          :options="statusOptions"
        />

        <!-- Category Filter -->
        <SelectField
          variant="merchant"
          v-model="tempFilters.category"
          label="Kategori"
          :options="categoryOptions"
        />

        <!-- Sort By -->
        <SelectField
          variant="merchant"
          v-model="tempFilters.sortBy"
          label="Urutkan Berdasarkan"
          :options="sortOptions"
        />

        <!-- Price Range -->
        <div class="w-full">
          <label class="block text-sm font-bold text-black mb-2">
            Rentang Harga
          </label>
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <TextField
              variant="merchant"
              v-model.number="tempFilters.minPrice"
              type="number"
              placeholder="Min"
              prefix="Rp"
              :hideLabel="true"
              label="Harga Minimum"
            />
            <span class="text-muted-foreground font-bold px-1">-</span>
            <TextField
              variant="merchant"
              v-model.number="tempFilters.maxPrice"
              type="number"
              placeholder="Max"
              prefix="Rp"
              :hideLabel="true"
              label="Harga Maximum"
            />
          </div>
        </div>

        <!-- Stock Range -->
        <div class="w-full">
          <label class="block text-sm font-bold text-black mb-2">
            Rentang Stok
          </label>
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <TextField
              variant="merchant"
              v-model.number="tempFilters.minStock"
              type="number"
              placeholder="Min"
              suffix="pcs"
              :hideLabel="true"
              label="Stok Minimum"
            />
            <span class="text-black font-bold px-1">-</span>
            <TextField
              variant="merchant"
              v-model.number="tempFilters.maxStock"
              type="number"
              placeholder="Max"
              suffix="pcs"
              :hideLabel="true"
              label="Stok Maximum"
            />
          </div>
        </div>
      </div>

      <!-- Footer Actions (Single for Mobile & Desktop) -->
      <template #footer>
        <div class="flex gap-3">
          <Button @click="resetFilters" variant="muted-outline" block>
            Reset
          </Button>
          <Button @click="applyFilters" block variant="merchant">
            <i class="pi pi-check mr-2"></i>
            Terapkan Filter
          </Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- UPDATED: Export Modal - Single Footer -->
    <ResponsiveModal
      v-model:show="showExportModal"
      title="Export Data"
      show-footer
      footer-class="sm:hidden"
      @close="closeExportModal"
    >
      <!-- Content -->
      <div class="space-y-3">
        <button
          @click="exportPDF"
          class="w-full flex items-center gap-4 p-4 border border-muted-background rounded-xl hover:bg-muted-background hover:border-merchant-primary transition text-left group"
        >
          <div
            class="w-12 h-12 bg-danger-background rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
          >
            <i class="pi pi-file-pdf text-2xl text-danger-foreground"></i>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-semibold text-black">
              Export ke PDF
            </h4>
            <p class="text-xs sm:text-sm text-muted-foreground">
              Download data produk dalam format PDF
            </p>
          </div>
        </button>

        <button
          @click="exportExcel"
          class="w-full flex items-center gap-4 p-4 border border-muted-background rounded-xl hover:bg-muted-background hover:border-merchant-primary transition text-left group"
        >
          <div
            class="w-12 h-12 bg-success-background rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
          >
            <i class="pi pi-file-excel text-2xl text-success-foreground"></i>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-semibold text-black">
              Export ke Excel
            </h4>
            <p class="text-xs sm:text-sm text-muted-foreground">
              Download dalam format Excel (.xlsx)
            </p>
          </div>
        </button>
      </div>

      <!-- Footer Actions -->
      <template #footer>
        <Button @click="closeExportModal" block variant="merchant">
          Tutup
        </Button>
      </template>
    </ResponsiveModal>

    <!-- UPDATED: Bulk Action Modal - Single Footer -->
    <ResponsiveModal
      v-model:show="showBulkActionModal"
      title="Ubah Status Produk"
      :subtitle="`${selectedProductsCount} produk akan diubah statusnya`"
      show-footer
      footer-class="sm:hidden"
      @close="closeBulkActionModal"
    >
      <!-- Body -->
      <div class="space-y-3">
        <!-- Publish Action -->
        <button
          @click="bulkUpdateStatus('published')"
          class="w-full flex items-center gap-4 p-4 border border-muted-background rounded-xl hover:bg-muted-background hover:border-merchant-primary transition text-left group"
        >
          <div
            class="w-12 h-12 bg-success-background rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
          >
            <i class="pi pi-check-circle text-2xl text-success-foreground"></i>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-semibold text-black">
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
          class="w-full flex items-center gap-4 p-4 border border-muted-background rounded-xl hover:bg-muted-background hover:border-merchant-primary transition text-left group"
        >
          <div
            class="w-12 h-12 bg-danger-background rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
          >
            <i class="pi pi-box text-2xl text-danger-foreground"></i>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-semibold text-black">
              Diarsipkan
            </h4>
            <p class="text-xs sm:text-sm text-muted-foreground">
              Produk diarsipkan dan tidak aktif
            </p>
          </div>
        </button>
      </div>

      <!-- Footer Actions -->
      <template #footer>
        <Button @click="closeBulkActionModal" block variant="merchant">
          Tutup
        </Button>
      </template>
    </ResponsiveModal>

    <!-- UPDATED: Visibility Modal - Single Footer -->
    <ResponsiveModal
      v-model:show="showVisibilityModal"
      title="Ubah Status Produk"
      :subtitle="selectedProductForVisibility?.name"
      size="md"
      show-footer
      footer-class="sm:hidden"
      @close="closeVisibilityModal"
    >
      <!-- Content -->
      <div class="space-y-3">
        <!-- Current Status Info -->
        <div
          v-if="selectedProductForVisibility"
          class="p-4 bg-muted-background rounded-xl"
        >
          <p class="text-xs text-muted-foreground mb-2">Status Saat Ini</p>
          <StatusLabel
            :status="selectedProductForVisibility.status"
            variant="product"
            size="md"
          />
        </div>

        <!-- Publish Action -->
        <button
          @click="confirmVisibilityChange('published')"
          :disabled="selectedProductForVisibility?.status === 'published'"
          class="w-full flex items-center gap-4 p-4 border border-muted-background rounded-xl transition text-left group"
          :class="
            selectedProductForVisibility?.status === 'published'
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-muted-background hover:border-merchant-primary'
          "
        >
          <div
            class="w-12 h-12 bg-success-background rounded-lg flex items-center justify-center flex-shrink-0 transition-transform"
            :class="
              selectedProductForVisibility?.status !== 'published' &&
              'group-hover:scale-110'
            "
          >
            <i class="pi pi-check-circle text-2xl text-success-foreground"></i>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-semibold text-black">
              Dipublish
            </h4>
            <p class="text-xs sm:text-sm text-muted-foreground">
              Produk akan muncul di katalog dan dapat dibeli
            </p>
          </div>
        </button>

        <!-- Archive Action -->
        <button
          @click="confirmVisibilityChange('archived')"
          :disabled="selectedProductForVisibility?.status === 'archived'"
          class="w-full flex items-center gap-4 p-4 border border-muted-background rounded-xl transition text-left group"
          :class="
            selectedProductForVisibility?.status === 'archived'
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-muted-background hover:border-merchant-primary'
          "
        >
          <div
            class="w-12 h-12 bg-danger-background rounded-lg flex items-center justify-center flex-shrink-0 transition-transform"
            :class="
              selectedProductForVisibility?.status !== 'archived' &&
              'group-hover:scale-110'
            "
          >
            <i class="pi pi-box text-2xl text-danger-foreground"></i>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-semibold text-black">
              Diarsipkan
            </h4>
            <p class="text-xs sm:text-sm text-muted-foreground">
              Produk diarsipkan dan tidak aktif
            </p>
          </div>
        </button>
      </div>

      <!-- Footer Actions -->
      <template #footer>
        <Button @click="closeVisibilityModal" block variant="merchant">
          Tutup
        </Button>
      </template>
    </ResponsiveModal>

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
        v-if="isAnyModalOpen"
        @click="
          showFilterModal = false;
          showExportModal = false;
          showBulkActionModal = false;
          showVisibilityModal = false;
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
