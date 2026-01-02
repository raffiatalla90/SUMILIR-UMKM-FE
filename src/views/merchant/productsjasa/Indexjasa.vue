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
import { useChat } from "@/composables/useChat";
import ChatWindow from "@/components/common/ChatWindow.vue";
import { useCategories } from "@/composables/useCategories";
import { getImageUrlJasa } from "@/libs/getImageUrl.js";
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

// Watch for route query changes to trigger reload (e.g., after edit)
watch(() => route.query.t, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    console.log('[Indexjasa] Route query changed, reloading...');
    loadJasas();
  }
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

// Format operating days
const dayLabels = {
  1: 'Sen', 2: 'Sel', 3: 'Rab', 4: 'Kam', 5: 'Jum', 6: 'Sab', 7: 'Min'
};

const formatOperatingDays = (operatingDays) => {
  if (!operatingDays) return '-';
  const days = operatingDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
  if (days.length === 0) return '-';
  if (days.length === 7) return 'Setiap Hari';
  return days.map(d => dayLabels[d] || d).join(', ');
};

// Format single price (IDR)
const formatPriceId = (num) => {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(num || 0);
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

// Helper: pilih cover image dari relasi baru atau fallback ke field legacy `image`
const getPrimaryImageSrc = (jasaItem) => {
  if (!jasaItem) return "";
  const images = jasaItem.images || [];
  if (images.length) {
    const image = images.find((img) => img.is_cover) || images[0];
    return getImageUrlJasa(image?.path || image?.id || jasaItem.image);
  }
  if (jasaItem.image) {
    return getImageUrlJasa(jasaItem.image);
  }
  return "";
};

// =======================
// Chat (Daftar Percakapan)
// =======================
const { conversations, fetchConversations } = useChat();
const showChatPanel = ref(false);
const selectedConversationId = ref(null);

// Kunci scroll body ketika popup chat terbuka
useBodyScrollLock(showChatPanel);

const hasConversations = computed(() => {
  return Array.isArray(conversations.value) && conversations.value.length > 0;
});

const openChatModal = async () => {
  showChatPanel.value = true;
  try {
    await fetchConversations();
    if (!selectedConversationId.value && hasConversations.value) {
      selectedConversationId.value = conversations.value[0]?.id || null;
    }
  } catch (e) {
    console.error("Gagal memuat percakapan", e);
  }
};

const closeChatModal = () => {
  showChatPanel.value = false;
};

const selectConversation = (conversation) => {
  selectedConversationId.value = conversation.id;
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
      <div
        class="mb-4 flex flex-wrap items-center gap-2 justify-between"
      >
        <button
          @click="goToCreate"
          class="px-4 py-2 bg-merchant-primary text-white rounded"
        >
          Tambah Jasa
        </button>
        <button
          @click="openChatModal"
          class="inline-flex items-center gap-2 px-4 py-2 rounded border border-merchant-primary/50 text-merchant-primary bg-merchant-primary/5 hover:bg-merchant-primary/10 transition"
        >
          <i class="pi pi-comments text-sm"></i>
          <span class="text-sm font-medium">Chat Pembeli</span>
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="w-full min-w-[700px]">
          <thead>
            <tr class="border-b">
              <th class="p-4 text-left w-24">
                <div class="flex items-center gap-2">
                  <i class="pi pi-image text-gray-500"></i>
                  Gambar
                </div>
              </th>
              <th class="p-4 text-left">
                <div class="flex items-center gap-2">
                  <i class="pi pi-file-edit text-gray-500"></i>
                  Nama Jasa
                </div>
              </th>
              <th class="p-4 text-left">
                <div class="flex items-center gap-2">
                  <i class="pi pi-tag text-gray-500"></i>
                  Kategori
                </div>
              </th>
              <th class="p-4 text-left">
                <div class="flex items-center gap-2">
                  <i class="pi pi-wallet text-gray-500"></i>
                  Harga
                </div>
              </th>
              <th class="p-4 text-left">
                <div class="flex items-center gap-2">
                  <i class="pi pi-calendar text-gray-500"></i>
                  Hari Layanan
                </div>
              </th>
              <th class="p-4 text-left">
                <div class="flex items-center gap-2">
                  <i class="pi pi-circle-fill text-gray-500 text-xs"></i>
                  Status
                </div>
              </th>
              <th class="p-4 text-left">
                <div class="flex items-center gap-2">
                  <i class="pi pi-cog text-gray-500"></i>
                  Aksi
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="jasa in jasas" 
              :key="jasa.id" 
              :class="[
                'border-b hover:bg-gray-50',
                (!jasa.is_active || jasa.status === 'draft') ? 'opacity-50' : ''
              ]"
            >
              <td class="p-4">
                <div v-if="(jasa.images && jasa.images.length > 0) || jasa.image" class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    :src="getPrimaryImageSrc(jasa)"
                    :alt="jasa.title"
                    class="max-w-full max-h-full object-contain"
                    @error="(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect fill=%27%23f3f4f6%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%27 y=%2750%27 font-size=%2714%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%239ca3af%27%3ENo Image%3C/text%3E%3C/svg%3E'"
                  />
                </div>
                <div v-else class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                  <i class="pi pi-image text-gray-400 text-xl"></i>
                </div>
              </td>
              <td class="p-4">{{ jasa.title }}</td>
              <td class="p-4">
                <div class="text-sm">
                  <div class="font-medium text-gray-900">
                    {{ jasa.category?.name || '-' }}
                  </div>
                  <div v-if="jasa.subcategory?.name" class="text-xs text-gray-500 mt-0.5">
                    {{ jasa.subcategory.name }}
                  </div>
                </div>
              </td>
              <td class="p-4">
                <template v-if="jasa.fixed_price && jasa.fixed_price > 0">
                  {{ formatPriceId(jasa.fixed_price) }}
                </template>
                <template v-else-if="jasa.base_price && jasa.base_price > 0">
                  {{ formatPriceId(jasa.base_price) }}
                  <span class="text-xs text-gray-500">(Mulai dari)</span>
                </template>
                <template v-else>
                  -
                </template>
              </td>
              <td class="p-4">
                <span class="text-sm text-gray-700">
                  {{ formatOperatingDays(jasa.operating_days) }}
                </span>
              </td>
              <td class="p-4">
                <span :class="(jasa.status === 'active' && jasa.is_active) ? 'text-green-600' : 'text-gray-400'">
                  {{ (jasa.status === 'active' && jasa.is_active) ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    @click="goToEdit(jasa)"
                    class="inline-flex items-center justify-center px-2 py-1 rounded border border-merchant-primary/40 text-merchant-primary text-xs sm:text-sm bg-merchant-primary/5 hover:bg-merchant-primary/10 transition"
                    title="Edit jasa"
                  >
                    <i class="pi pi-pencil text-xs sm:text-sm mr-1"></i>
                    <span class="leading-none">Edit</span>
                  </button>
                  <button
                    @click="goToDetail(jasa)"
                    class="inline-flex items-center justify-center px-2 py-1 rounded border border-blue-500/30 text-blue-600 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 transition"
                    title="Lihat detail"
                  >
                    <i class="pi pi-eye text-xs sm:text-sm mr-1"></i>
                    <span class="leading-none">Detail</span>
                  </button>
                  <button
                    @click="deleteJasaAction(jasa)"
                    class="inline-flex items-center justify-center px-2 py-1 rounded border border-red-500/30 text-red-600 text-xs sm:text-sm bg-red-50 hover:bg-red-100 transition"
                    title="Hapus jasa"
                  >
                    <i class="pi pi-trash text-xs sm:text-sm mr-1"></i>
                    <span class="leading-none">Hapus</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Delete Confirmation Modal -->
      <ResponsiveModal
        v-model:show="showDeleteModal"
        title="Hapus Jasa"
        show-footer
        @close="closeDeleteModal"
      >
        <p class="text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus jasa
          <span class="font-semibold">{{ selectedJasaForDelete?.title }}</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <template #footer>
          <div class="flex gap-2 w-full">
            <Button
              variant="muted-outline"
              class="flex-1"
              @click="closeDeleteModal"
            >
              Batal
            </Button>
            <Button
              variant="danger"
              class="flex-1"
              @click="confirmDeleteJasa"
            >
              Hapus
            </Button>
          </div>
        </template>
      </ResponsiveModal>

      <!-- Chat Popup dengan blur background -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showChatPanel"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          @click.self="closeChatModal"
        >
          <div
            class="w-full max-w-full sm:max-w-4xl lg:max-w-5xl mx-0 sm:mx-4 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[70vh] sm:h-[80vh] sm:max-h-[85vh]"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl"
            >
              <div>
                <h2 class="text-xs sm:text-base font-semibold text-gray-900">
                  Chat Pembeli
                </h2>
                <p class="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                  Balas pertanyaan dan berikan penawaran harga ke pembeli.
                </p>
              </div>
              <button
                type="button"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
                @click="closeChatModal"
              >
                <i class="pi pi-times text-xs sm:text-sm"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="p-2 sm:p-4 flex-1 flex flex-col overflow-hidden">
              <div class="flex flex-col md:flex-row gap-2 sm:gap-4 flex-1 min-h-0 overflow-hidden">
                <!-- Daftar percakapan -->
                <div
                  class="w-full h-28 sm:h-auto md:w-1/3 border border-gray-200 rounded-lg sm:rounded-xl bg-white overflow-hidden flex flex-col shrink-0 md:shrink"
                >
                  <div class="px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-200 bg-gray-50">
                    <p
                      class="text-[10px] sm:text-xs font-semibold text-gray-700 flex items-center gap-1 sm:gap-2"
                    >
                      <i class="pi pi-inbox text-gray-500 text-[10px] sm:text-xs"></i>
                      Daftar Percakapan
                    </p>
                  </div>
                  <div
                    class="flex-1 overflow-y-auto divide-y divide-gray-100"
                  >
                    <div
                      v-if="!hasConversations"
                      class="px-2 sm:px-3 py-2 sm:py-4 text-[10px] sm:text-xs text-gray-500 text-center"
                    >
                      Belum ada percakapan dari pembeli.
                    </div>
                    <button
                      v-else
                      v-for="convo in conversations"
                      :key="convo.id"
                      type="button"
                      @click="selectConversation(convo)"
                      :class="[
                        'w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 flex flex-col gap-0.5 hover:bg-gray-50 transition',
                        selectedConversationId === convo.id
                          ? 'bg-merchant-primary/5 border-l-2 sm:border-l-4 border-merchant-primary'
                          : '',
                      ]"
                    >
                      <p
                        class="text-[10px] sm:text-xs font-semibold text-gray-900 truncate"
                      >
                        {{ convo?.buyer?.name || 'Pembeli' }}
                      </p>
                      <p class="text-[9px] sm:text-[11px] text-gray-500 truncate hidden sm:block">
                        Jasa:
                        {{ convo?.jasa?.title || convo?.jasa?.name || '-' }}
                      </p>
                      <p
                        v-if="convo?.last_message"
                        class="text-[9px] sm:text-[11px] text-gray-400 truncate hidden sm:block"
                      >
                        {{ convo.last_message.body || 'Pesan terbaru' }}
                      </p>
                    </button>
                  </div>
                </div>

                <!-- Chat window -->
                <div class="w-full md:flex-1 flex-1 min-h-0">
                  <div
                    v-if="!selectedConversationId && !hasConversations"
                    class="h-full text-[10px] sm:text-xs text-gray-500 text-center border border-dashed border-gray-300 rounded-lg sm:rounded-xl bg-gray-50/60 px-2 sm:px-4 py-4 sm:py-6 flex items-center justify-center"
                  >
                    <span>
                      Belum ada percakapan.
                      <br class="hidden sm:block" />
                      <span class="hidden sm:inline">Saat ada pembeli yang menghubungi Anda, percakapan akan muncul di sini.</span>
                    </span>
                  </div>
                  <div
                    v-else-if="!selectedConversationId && hasConversations"
                    class="h-full text-[10px] sm:text-xs text-gray-500 text-center border border-dashed border-gray-300 rounded-lg sm:rounded-xl bg-gray-50/60 px-2 sm:px-4 py-4 sm:py-6 flex items-center justify-center"
                  >
                    <span>
                      Pilih percakapan <span class="hidden sm:inline">di sebelah kiri</span> untuk membalas pesan.
                    </span>
                  </div>
                  <div v-else class="h-full">
                    <ChatWindow
                      :conversation-id="selectedConversationId"
                      mode="merchant"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
      
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
