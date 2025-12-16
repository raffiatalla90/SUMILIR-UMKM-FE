<script setup>
// =======================
// 1. IMPORTS
// =======================
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue"; // ✅ ADD
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import MerchantTable from "@/components/common/MerchantTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import JasaCard from "@/components/common/ProductCard.vue"; // reuse ProductCard for jasa listing
import MobilePagination from "@/components/common/MobilePagination.vue";
import BulkActionBar from "@/components/common/BulkActionBar.vue";
import { useJasa } from "@/composables/useJasa"; // ✅ GANTI: import useJasa
import { useCategories } from "@/composables/useCategories";
import { getImageUrl } from "@/libs/getImageUrl.js";
import api from "@/libs/axios";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

// ✅ Get merchantId from route
const currentMerchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : null;
});

// ✅ Breadcrumb items
const breadcrumbItems = computed(() => [
  {
    label: "List Jasa", // ✅ GANTI: List Produk menjadi List Jasa
  },
]);

// ✅ ADD: Get merchant name for display
const currentMerchantName = computed(() => {
  const merchant = authStore.getMerchantById(currentMerchantId.value);
  return merchant?.name || "UMKM";
});

// Pagination / totals
const totalItems = computed(() => pagination.value?.total ?? jasas.value.length);
const totalPages = computed(() => pagination.value?.last_page ?? 1);
const paginationInfo = computed(() => ({
  from: pagination.value?.from ?? 0,
  to: pagination.value?.to ?? 0,
  total: pagination.value?.total ?? jasas.value.length,
}));

// Active filter count
const activeFilterCount = computed(() => {
  const f = activeFilters.value;
  let count = 0;
  if (f.status) count++;
  if (f.category) count++;
  if (f.minPrice != null || f.maxPrice != null) count++;
  if (f.minStock != null || f.maxStock != null) count++;
  if (f.sortByDate) count++;
  if (f.sortByName) count++;
  if (f.sortByPrice) count++;
  if (f.sortByStock) count++;
  return count;
});

// ✅ Use categories composable (declare before using categoryOptions)
const { categoriesLevel1, loadingLevel1, fetchLevel1Categories } =
  useCategories();

// Options used in template
const statusOptions = [
  { label: "Semua", value: "" },
  { label: "Dipublish", value: "published" },
  { label: "Diarsipkan", value: "archived" },
  { label: "Draft", value: "draft" },
  { label: "Stok Habis", value: "out_of_stock" },
];

const categoryOptions = categoriesLevel1;

// ✅ Use jasa composable
const {
  jasas, // ✅ GANTI: products menjadi jasas
  loading,
  pagination,
  fetchJasas, // ✅ GANTI: fetchProducts menjadi fetchJasas
  deleteJasa, // ✅ GANTI: deleteProduct menjadi deleteJasa
  updateJasaStatus, // ✅ GANTI: updateProductStatus menjadi updateJasaStatus
  bulkDeleteJasas, // ✅ GANTI: bulkDeleteProducts menjadi bulkDeleteJasas
  bulkUpdateStatus,
} = useJasa(); // ✅ GANTI: useProducts menjadi useJasa

// Emit untuk toggle sidebar dari parent layout
const emit = defineEmits(["toggle-sidebar"]);

// State
const selectedJasas = ref([]); // ✅ GANTI: selectedProducts menjadi selectedJasas
const selectAll = ref(false);

// Modals
const showExportModal = ref(false);
const showFilterModal = ref(false);
const showBulkActionModal = ref(false);
const showVisibilityModal = ref(false);
const showDeleteModal = ref(false);
const showBulkDeleteModal = ref(false);
// ✅ ADD: Status change confirmation modals
const showStatusChangeModal = ref(false);
const showBulkStatusChangeModal = ref(false);

// Selected items for actions
const selectedJasaForVisibility = ref(null); // ✅ GANTI: selectedProductForVisibility menjadi selectedJasaForVisibility
const selectedJasaForDelete = ref(null); // ✅ GANTI: selectedProductForDelete menjadi selectedJasaForDelete
// ✅ ADD: Selected jasa and new status for confirmation
const selectedJasaForStatusChange = ref(null); // ✅ GANTI: selectedProductForStatusChange menjadi selectedJasaForStatusChange
const newStatusForChange = ref(null);
const newBulkStatus = ref(null);

// Combined modal state for body scroll lock
const isAnyModalOpen = computed(() => {
  return (
    showExportModal.value ||
    showFilterModal.value ||
    showBulkActionModal.value ||
    showVisibilityModal.value ||
    showDeleteModal.value ||
    showBulkDeleteModal.value ||
    showStatusChangeModal.value || // ✅ ADD
    showBulkStatusChangeModal.value // ✅ ADD
  );
});

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
  sortByDate: "",
  sortByName: "",
  sortByPrice: "",
  sortByStock: "",
});

const activeFilters = ref({
  status: "",
  category: "",
  minPrice: null,
  maxPrice: null,
  minStock: null,
  maxStock: null,
  sortByDate: "",
  sortByName: "",
  sortByPrice: "",
  sortByStock: "",
});

const currentPage = ref(1);
const perPage = ref(10);

// ✅ NEW: Build sort_by parameter untuk API
const buildSortByParam = (filters) => {
  if (filters.sortByDate) return filters.sortByDate;
  if (filters.sortByName) return filters.sortByName;
  if (filters.sortByPrice) return filters.sortByPrice;
  if (filters.sortByStock) return filters.sortByStock;
  return "newest";
};

// ✅ ADD: Initialize data on mount
onMounted(async () => {
  console.log("[Indexjasa] Component mounted");
  console.log("[Indexjasa] Merchant ID:", currentMerchantId.value);

  // Validate merchant ID
  if (!currentMerchantId.value) {
    toast.error("Merchant ID tidak ditemukan");
    router.push("/merchant-center");
    return;
  }

  // Load categories
  await fetchLevel1Categories();

  // Load jasa data
  await loadJasas();
});

// ✅ UPDATED: Load jasas dengan merchantId dari route
const loadJasas = async () => {
  // ✅ Validate merchantId exists
  if (!currentMerchantId.value) {
    toast.error("Merchant ID tidak ditemukan");
    return;
  }

  // ✅ ADD: Prevent duplicate calls
  if (loading.value) {
    console.warn("[loadJasas] Already loading, skipping...");
    return;
  }

  console.log("[loadJasas] Starting...", {
    merchantId: currentMerchantId.value,
    page: currentPage.value,
    filters: activeFilters.value,
  });

  try {
    const sortBy = buildSortByParam(activeFilters.value);

    await fetchJasas({
      merchantId: currentMerchantId.value,
      searchQuery: searchQuery.value,
      status: activeFilters.value.status,
      category: activeFilters.value.category,
      minPrice: activeFilters.value.minPrice,
      maxPrice: activeFilters.value.maxPrice,
      minStock: activeFilters.value.minStock,
      maxStock: activeFilters.value.maxStock,
      sortBy: sortBy,
      perPage: perPage.value,
      page: currentPage.value,
    });

  } catch (error) {
    const serverMsg = error.response?.data?.message || "";
    if (error.response?.status === 403 && serverMsg && (serverMsg.includes("Segment") || serverMsg.includes("UMKM"))) {
      router.push(`/merchant-center/${currentMerchantId.value}`);
    } else {
      toast.error(serverMsg || "Gagal memuat jasa");
    }
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadJasas();
};

// ✅ ADD: Missing method for toggling jasa selection
const toggleJasaSelection = (jasaId) => { // ✅ GANTI: toggleProductSelection menjadi toggleJasaSelection
  const index = selectedJasas.value.indexOf(jasaId);

  if (index > -1) {
    // Remove from selection
    selectedJasas.value.splice(index, 1);
  } else {
    // Add to selection
    selectedJasas.value.push(jasaId);
  }

  // Update selectAll checkbox state
  selectAll.value = selectedJasas.value.length === jasas.value.length;
};

// ✅ UPDATE: toggleSelectAll method
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedJasas.value = jasas.value.map((j) => j.id);
  } else {
    selectedJasas.value = [];
  }
};

// ✅ Bulk Actions - Use real API
const bulkDelete = () => {
  showBulkDeleteModal.value = true;
};

// ✅ NEW: Confirm bulk delete
const confirmBulkDelete = async () => {
  try {
    await bulkDeleteJasas(selectedJasas.value); // ✅ GANTI: bulkDeleteProducts menjadi bulkDeleteJasas
    toast.success(`${selectedJasasCount.value} jasa berhasil dihapus`);
    selectedJasas.value = [];
    selectAll.value = false;
    closeBulkDeleteModal();
  } catch (error) {
    toast.error(error.response?.data?.message || "Gagal menghapus jasa");
  }
};

// ✅ NEW: Close bulk delete modal
const closeBulkDeleteModal = () => {
  showBulkDeleteModal.value = false;
};

// Modal methods (unchanged)
const openExportModal = () => {
  showExportModal.value = true;
};

const openFilterModal = () => {
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
  selectedJasas.value = [];
  selectAll.value = false;
};

const applyFilters = () => {
  console.log("[Filter] Applying filters:", tempFilters.value);

  activeFilters.value = { ...tempFilters.value };
  currentPage.value = 1;
  closeFilterModal();

  console.log("[Filter] Active filters:", activeFilters.value);

  loadJasas();
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
  loadJasas();
};

// Helper: buat URL params dari filter aktif
const buildExportParams = () => {
  const params = {
    q: searchQuery.value || undefined,
    status: activeFilters.value.status || undefined,
    category_id: activeFilters.value.category || undefined,
    min_price: activeFilters.value.minPrice ?? undefined,
    max_price: activeFilters.value.maxPrice ?? undefined,
    min_stock: activeFilters.value.minStock ?? undefined,
    max_stock: activeFilters.value.maxStock ?? undefined,
    sort_by: buildSortByParam(activeFilters.value) || "newest",
  };
  Object.keys(params).forEach(
    (k) => params[k] === undefined && delete params[k]
  );
  return params;
};

// Helper: unduh Blob ke file
const saveBlob = (blob, fallbackName) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// Export Excel (via BE)
const exportExcel = async () => {
  try {
    const params = buildExportParams();
    const res = await api.get("/jasas/export/excel", { // ✅ GANTI: products/export/excel menjadi jasas/export/excel
      params,
      responseType: "blob",
    });

    // Ambil nama file dari header jika ada
    const disposition = res.headers["content-disposition"] || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename =
      match?.[1] ||
      `jasas-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "")}.xlsx`;

    saveBlob(res.data, filename);
    toast.success("Export Excel berhasil diunduh");
  } catch (err) {
    toast.error(err.response?.data?.message || "Gagal export Excel");
  } finally {
    closeExportModal();
  }
};

// Export PDF (via BE)
const exportPDF = async () => {
  try {
    const params = buildExportParams();
    const res = await api.get("/jasas/export/pdf", { // ✅ GANTI: products/export/pdf menjadi jasas/export/pdf
      params,
      responseType: "blob",
    });

    // Ambil nama file dari header jika ada
    const disposition = res.headers["content-disposition"] || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename =
      match?.[1] ||
      `jasas-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "")}.pdf`;

    saveBlob(res.data, filename);
    toast.success("Export PDF berhasil diunduh");
  } catch (err) {
    toast.error(err.response?.data?.message || "Gagal export PDF");
  } finally {
    closeExportModal();
  }
};

// ✅ UPDATED: goToCreate with merchantId
const goToCreate = () => {
  console.log("[Indexjasa] goToCreate called");
  console.log("[Indexjasa] Current merchant ID:", currentMerchantId.value);
  if (!currentMerchantId.value) {
    console.error("[Indexjasa] No merchant ID - cannot create");
    return;
  }
  // Route parent sudah punya merchantId di params, jadi pass ke child route
  router.push({
    name: "Merchant - Jasa Create",
    params: { merchantId: currentMerchantId.value },
  });
};

// ✅ UPDATED: goToEdit with merchantId
const goToEdit = (jasa) => { // ✅ GANTI: goToEdit(product) menjadi goToEdit(jasa)
  router.push({
    name: "Merchant - Jasa Edit", // ✅ GANTI: Merchant - Product Edit menjadi Merchant - Jasa Edit
    params: {
      merchantId: currentMerchantId.value,
      id: jasa.id,
    },
  });
};

// ✅ UPDATED: goToDetail with merchantId
const goToDetail = (jasa) => { // ✅ GANTI: goToDetail(product) menjadi goToDetail(jasa)
  router.push({
    name: "Merchant - Jasa Detail", // ✅ GANTI: Merchant - Product Detail menjadi Merchant - Jasa Detail
    params: {
      merchantId: currentMerchantId.value,
      id: jasa.id,
    },
  });
};

// ✅ Delete jasa - Use real API
const deleteJasaAction = (jasa) => { // ✅ GANTI: deleteProductAction menjadi deleteJasaAction
  selectedJasaForDelete.value = jasa;
  showDeleteModal.value = true;
};

// ✅ NEW: Confirm single delete
const confirmDeleteJasa = async () => { // ✅ GANTI: confirmDeleteProduct menjadi confirmDeleteJasa
  if (!selectedJasaForDelete.value) return;

  try {
    await deleteJasa(selectedJasaForDelete.value.id); // ✅ GANTI: deleteProduct menjadi deleteJasa
    toast.success("Jasa berhasil dihapus");
    closeDeleteModal();
  } catch (error) {
    toast.error(error.response?.data?.message || "Gagal menghapus jasa");
  }
};

const hasSelectedJasas = computed(() => { // ✅ GANTI: hasSelectedProducts menjadi hasSelectedJasas
  return selectedJasas.value.length > 0;
});

const selectedJasasCount = computed(() => { // ✅ GANTI: selectedProductsCount menjadi selectedJasasCount
  return selectedJasas.value.length;
});

// ✅ ADD: Computed untuk mendapatkan data jasa yang dipilih (untuk modal preview)
const selectedJasasData = computed(() => { // ✅ GANTI: selectedProductsData menjadi selectedJasasData
  return jasas.value.filter((j) => selectedJasas.value.includes(j.id));
});

// ✅ ADD: Missing method - Close visibility modal
const closeVisibilityModal = () => {
  showVisibilityModal.value = false;
  selectedJasaForVisibility.value = null;
};

// ✅ NEW: Clear individual filter group
const clearFilterGroup = (group) => {
  switch (group) {
    case "sort_date":
      activeFilters.value.sortByDate = "";
      tempFilters.value.sortByDate = "";
      break;
    case "sort_name":
      activeFilters.value.sortByName = "";
      tempFilters.value.sortByName = "";
      break;
    case "sort_price":
      activeFilters.value.sortByPrice = "";
      tempFilters.value.sortByPrice = "";
      break;
    case "sort_stock":
      activeFilters.value.sortByStock = "";
      tempFilters.value.sortByStock = "";
      break;
  }
  loadJasas();
};

// ✅ NEW: Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedJasaForDelete.value = null;
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

const formatPrice = (min, max) => {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

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

// ✅ UPDATED: Pagination methods - sync dengan backend pagination
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
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

// Helper functions for status
const getStatusLabel = (status) => {
  const labels = {
    published: "Dipublish",
    archived: "Diarsipkan",
    draft: "Draft",
    out_of_stock: "Stok Habis",
  };
  return labels[status] || status;
};

// Toggle visibility method
const toggleJasaVisibility = (jasa) => { // ✅ GANTI: toggleProductVisibility menjadi toggleJasaVisibility
  selectedJasaForVisibility.value = jasa;
  showVisibilityModal.value = true;
};

// ✅ UPDATED: Confirm visibility change - Show final confirmation
const confirmVisibilityChange = (newStatus) => {
  if (!selectedJasaForVisibility.value) return;

  selectedJasaForStatusChange.value = selectedJasaForVisibility.value;
  newStatusForChange.value = newStatus;
  showVisibilityModal.value = false;
  showStatusChangeModal.value = true;
};

// ✅ NEW: Confirm single status change (final step)
const confirmSingleStatusChange = async () => {
  if (!selectedJasaForStatusChange.value || !newStatusForChange.value)
    return;

  try {
    await updateJasaStatus(
      selectedJasaForStatusChange.value.id,
      newStatusForChange.value
    );
    const statusLabel = getStatusLabel(newStatusForChange.value);
    toast.success(`Status jasa berhasil diubah menjadi ${statusLabel}`);
    closeStatusChangeModal();
  } catch (error) {
    toast.error(error.response?.data?.message || "Gagal mengubah status");
  }
};

// ✅ NEW: Close status change modal
const closeStatusChangeModal = () => {
  showStatusChangeModal.value = false;
  selectedJasaForStatusChange.value = null;
  newStatusForChange.value = null;
  selectedJasaForVisibility.value = null;
};

// ✅ UPDATED: Bulk update status - Show selection modal first
const bulkUpdateStatusAction = (status) => {
  newBulkStatus.value = status;
  showBulkActionModal.value = false;
  showBulkStatusChangeModal.value = true;
};

// ✅ NEW: Confirm bulk status change
const confirmBulkStatusChange = async () => {
  if (!newBulkStatus.value) return;

  try {
    await bulkUpdateStatus(selectedJasas.value, newBulkStatus.value);
    const statusLabel = getStatusLabel(newBulkStatus.value);
    toast.success(
      `${selectedJasasCount.value} jasa berhasil diubah menjadi ${statusLabel}`
    );
    selectedJasas.value = [];
    selectAll.value = false;
    closeBulkStatusChangeModal();
  } catch (error) {
    toast.error(error.response?.data?.message || "Gagal mengubah status");
  }
};

// ✅ NEW: Close bulk status change modal
const closeBulkStatusChangeModal = () => {
  showBulkStatusChangeModal.value = false;
  newBulkStatus.value = null;
};
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Daftar Jasa</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-merchant-primary"></div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="jasas.length === 0" class="text-center py-20">
      <p class="text-gray-500 mb-4">Belum ada jasa</p>
      <button @click="goToCreate" class="px-4 py-2 bg-merchant-primary text-white rounded">
        Tambah Jasa
      </button>
    </div>
    
    <!-- Data Table -->
    <div v-else>
      <div class="mb-4">
        <button @click="goToCreate" class="px-4 py-2 bg-merchant-primary text-white rounded">
          Tambah Jasa
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="p-4 text-left">Nama Jasa</th>
              <th class="p-4 text-left">Harga</th>
              <th class="p-4 text-left">Status</th>
              <th class="p-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="jasa in jasas" :key="jasa.id" class="border-b hover:bg-gray-50">
              <td class="p-4">{{ jasa.title }}</td>
              <td class="p-4">Rp {{ jasa.price?.toLocaleString('id-ID') }}</td>
              <td class="p-4">
                <span :class="jasa.is_active ? 'text-green-600' : 'text-gray-400'">
                  {{ jasa.is_active ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              <td class="p-4">
                <button @click="goToDetail(jasa)" class="text-blue-600 hover:underline mr-2">
                  Detail
                </button>
                <button @click="deleteJasaAction(jasa)" class="text-red-600 hover:underline">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex justify-center gap-2">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page; loadJasas()"
          :class="['px-3 py-1 rounded', page === currentPage ? 'bg-merchant-primary text-white' : 'bg-gray-200']"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>
