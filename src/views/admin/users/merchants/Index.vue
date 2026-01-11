<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useMerchants } from "@/composables/useMerchants";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import AdminTable from "@/components/common/AdminTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import api from "@/libs/axios"; // ✅ Import axios

const router = useRouter();
const toast = useToast();

const { merchants, loading, pagination, fetchMerchants } = useMerchants();

// State
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(10);

// Modals
const showFilterModal = ref(false);
const showExportModal = ref(false);
const showApproveModal = ref(false); // ✅ NEW: Approve modal
const showRejectModal = ref(false); // ✅ NEW: Reject modal

// ✅ NEW: Selected merchant for approval/rejection
const selectedMerchant = ref(null);
const rejectionReason = ref("");
const processingAction = ref(false);

// Temp filters for modal
const tempFilters = ref({
  status: "",
  segmentation: "",
});

const activeFilters = ref({
  status: "",
  segmentation: "",
});

const isAnyModalOpen = computed(
  () =>
    showFilterModal.value ||
    showExportModal.value ||
    showApproveModal.value ||
    showRejectModal.value
);
useBodyScrollLock(isAnyModalOpen);

// Table config
const tableColumns = [
  { key: "logo", label: "Logo", sortable: false },
  { key: "name", label: "Merchant", sortable: true },
  { key: "owner", label: "Owner", sortable: false },
  { key: "segmentation", label: "Segmentasi", sortable: false },
  { key: "products_count", label: "Produk", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

// Safe pagination helpers
const totalPages = computed(() => pagination.value?.last_page ?? 1);
const totalItems = computed(() => pagination.value?.total ?? 0);
const currentPageFromApi = computed(
  () => pagination.value?.current_page ?? currentPage.value
);
const perPageFromApi = computed(
  () => pagination.value?.per_page ?? perPage.value
);

const paginationInfo = computed(() => {
  const start =
    totalItems.value === 0
      ? 0
      : (currentPageFromApi.value - 1) * perPageFromApi.value + 1;
  const end = Math.min(
    currentPageFromApi.value * perPageFromApi.value,
    totalItems.value
  );
  return {
    start,
    end,
    total: totalItems.value,
    current_page: currentPageFromApi.value,
    per_page: perPageFromApi.value,
  };
});

// Filter options
const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const segmentationOptions = [
  { value: "", label: "Semua Segmentasi" },
  { value: "1", label: "Toko" },
  { value: "2", label: "Jasa" },
  { value: "3", label: "Kuliner" },
];

const activeFilterCount = computed(() => {
  let count = 0;
  if (activeFilters.value.status) count++;
  if (activeFilters.value.segmentation) count++;
  return count;
});

// Load merchants with filters
const loadMerchants = async () => {
  try {
    await fetchMerchants({
      search: searchQuery.value,
      status: activeFilters.value.status,
      segmentation_id: activeFilters.value.segmentation,
      page: currentPage.value,
      per_page: perPage.value,
    });
  } catch (error) {
    console.error("Failed to load merchants:", error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadMerchants();
};

// Modals
const openFilterModal = () => {
  tempFilters.value = { ...activeFilters.value };
  showFilterModal.value = true;
};
const closeFilterModal = () => (showFilterModal.value = false);

const openExportModal = () => (showExportModal.value = true);
const closeExportModal = () => (showExportModal.value = false);

// Approve/Reject modal handlers
const openApproveModal = (merchant) => {
  selectedMerchant.value = merchant;
  showApproveModal.value = true;
};

const openRejectModal = (merchant) => {
  selectedMerchant.value = merchant;
  rejectionReason.value = "";
  showRejectModal.value = true;
};

const closeApproveModal = () => {
  showApproveModal.value = false;
  selectedMerchant.value = null;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  selectedMerchant.value = null;
  rejectionReason.value = "";
};

// Approve merchant
const approveMerchant = async () => {
  if (!selectedMerchant.value) return;

  processingAction.value = true;
  try {
    await api.patch(
      `/api/admin/merchants/${selectedMerchant.value.id}/approve`
    );

    toast.success(`Merchant "${selectedMerchant.value.name}" berhasil di-approve`);
    closeApproveModal();
    loadMerchants(); // Reload data
  } catch (error) {
    console.error("Failed to approve merchant:", error);
    toast.error(
      error.response?.data?.message || "Gagal approve merchant"
    );
  } finally {
    processingAction.value = false;
  }
};

// Reject merchant
const rejectMerchant = async () => {
  if (!selectedMerchant.value) return;

  if (!rejectionReason.value.trim()) {
    toast.error("Alasan penolakan harus diisi");
    return;
  }

  processingAction.value = true;
  try {
    await api.patch(
      `/api/admin/merchants/${selectedMerchant.value.id}/reject`,
      {
        rejection_reason: rejectionReason.value,
      }
    );

    toast.success(`Merchant "${selectedMerchant.value.name}" berhasil ditolak`);
    closeRejectModal();
    loadMerchants(); // Reload data
  } catch (error) {
    console.error("Failed to reject merchant:", error);
    toast.error(
      error.response?.data?.message || "Gagal reject merchant"
    );
  } finally {
    processingAction.value = false;
  }
};

const applyFilters = () => {
  activeFilters.value = { ...tempFilters.value };
  currentPage.value = 1;
  closeFilterModal();
  loadMerchants();
};

const resetFilters = () => {
  const defaults = { status: "", segmentation: "" };
  tempFilters.value = { ...defaults };
  activeFilters.value = { ...defaults };
  currentPage.value = 1;
  closeFilterModal();
  toast.success("Filter berhasil direset");
  loadMerchants();
};

// Export placeholders
const exportExcel = async () => {
  toast.info("Export Excel sedang dalam pengembangan");
  closeExportModal();
};
const exportPDF = async () => {
  toast.info("Export PDF sedang dalam pengembangan");
  closeExportModal();
};

// Actions
const goToDetail = (merchant) => {
  router.push({ name: "Admin - Merchant Detail", params: { id: merchant.id } });
};

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) goToPage(currentPage.value + 1);
};
const prevPage = () => {
  if (currentPage.value > 1) goToPage(currentPage.value - 1);
};

watch(currentPage, () => loadMerchants());
onMounted(() => loadMerchants());

defineExpose({
  openExportModal,
  goToCreate: () => toast.info("Tambah merchant sedang dalam pengembangan"),
});
</script>

<template>
  <div class="p-4 sm:p-6">
    <!-- Search & Toolbar -->
    <div class="space-y-2 sm:space-y-4 mb-4 bg-white">
      <div class="sm:flex sm:items-center sm:gap-4 pb-1">
        <div class="flex-1 mb-2 sm:mb-0">
          <TextField
            name="search"
            variant="merchant"
            v-model="searchQuery"
            placeholder="Cari merchant / owner..."
            icon="pi-search"
            @keyup.enter="handleSearch"
          />
        </div>

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

      <!-- Mobile toolbar -->
      <div class="flex sm:hidden flex-row justify-between items-center px-3 rounded-lg gap-4 pb-1">
        <div class="text-xs text-muted-foreground">
          Total: {{ totalItems }}
        </div>

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

    <!-- Desktop Table -->
    <div class="hidden sm:block">
      <AdminTable
        :items="merchants"
        :columns="tableColumns"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="totalPages"
        :pagination-info="paginationInfo"
        :show-checkbox="false"
        empty-message="Tidak ada merchant yang ditemukan"
        @row-click="goToDetail"
        @page-change="goToPage"
        @next-page="nextPage"
        @prev-page="prevPage"
      >
        <template #cell-logo="{ item }">
          <div class="flex items-center justify-center">
            <div v-if="item.logo_path" class="w-10 h-10 rounded-full overflow-hidden">
              <img :src="item.logo_path" :alt="item.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 rounded-full bg-merchant-primary/10 flex items-center justify-center">
              <span class="text-merchant-primary font-semibold text-sm">
                {{ item.name?.charAt(0)?.toUpperCase() }}
              </span>
            </div>
          </div>
        </template>

        <template #cell-owner="{ item }">
          <div>
            <p class="font-medium text-sm">{{ item.user?.name || "-" }}</p>
            <p class="text-xs text-gray-500">{{ item.user?.email || "-" }}</p>
          </div>
        </template>

        <template #cell-segmentation="{ item }">
          <StatusLabel
            :status="item.segmentation?.code || item.segmentation?.name?.toLowerCase().replace(/\s/g, '_')"
            variant="segmentation"
            size="sm"
          />
        </template>

        <template #cell-products_count="{ item }">
          <span class="font-semibold">{{ item.products_count || 0 }}</span>
        </template>

        <template #cell-status="{ item }">
          <StatusLabel
            :status="item.status"
            variant="merchant"
            size="sm"
          />
        </template>

        <!-- Actions cell dengan conditional buttons -->
        <template #cell-actions="{ item }">
          <div class="flex items-center gap-2">
            <Button
              @click.stop="goToDetail(item)"
              variant="outline"
              size="sm"
              title="Lihat Detail"
            >
              <i class="pi pi-eye"></i>
            </Button>

            <!-- Show approve/reject buttons only for pending -->
            <template v-if="item.status === 'pending'">
              <Button
                @click.stop="openApproveModal(item)"
                variant="outline"
                size="sm"
                custom-class="!border-green-500 !text-green-600 hover:!bg-green-50"
                title="Approve Merchant"
              >
                <i class="pi pi-check"></i>
              </Button>

              <Button
                @click.stop="openRejectModal(item)"
                variant="outline"
                size="sm"
                custom-class="!border-red-500 !text-red-600 hover:!bg-red-50"
                title="Reject Merchant"
              >
                <i class="pi pi-times"></i>
              </Button>
            </template>
          </div>
        </template>
      </AdminTable>
    </div>

    <!-- Mobile List -->
    <div class="sm:hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-merchant-primary"></i>
      </div>

      <div
        v-else-if="!merchants || merchants.length === 0"
        class="text-center py-12"
      >
        <i class="pi pi-building text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">Tidak ada merchant</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="m in merchants"
          :key="m.id"
          @click="goToDetail(m)"
          class="bg-white rounded-lg shadow-sm p-4 active:bg-gray-50 transition"
        >
          <div class="flex items-start gap-3 mb-3">
            <div v-if="m.logo_path" class="w-12 h-12 rounded-full overflow-hidden shrink-0">
              <img :src="m.logo_path" :alt="m.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-12 h-12 rounded-full bg-merchant-primary/10 flex items-center justify-center shrink-0">
              <span class="text-merchant-primary font-semibold">
                {{ m.name?.charAt(0)?.toUpperCase() }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ m.name }}</p>
              <p class="text-sm text-gray-600 truncate">Owner: {{ m.user?.name || "-" }}</p>
              <p class="text-xs text-gray-500 truncate">{{ m.user?.email || "-" }}</p>
            </div>

            <StatusLabel :status="m.status" variant="merchant" size="sm" />
          </div>

          <div class="flex items-center justify-between text-xs border-t pt-2">
            <StatusLabel
              :status="m.segmentation?.code || m.segmentation?.name?.toLowerCase().replace(/\s/g, '_')"
              :label="m.segmentation?.name"
              variant="segmentation"
              size="sm"
            />
            <span class="text-gray-600">
              <i class="pi pi-box mr-1"></i>
              {{ m.products_count || 0 }} Produk
            </span>
          </div>

          <!-- ✅ NEW: Mobile action buttons for pending -->
          <div
            v-if="m.status === 'pending'"
            class="flex gap-2 mt-3 pt-3 border-t"
            @click.stop
          >
            <Button
              @click="openApproveModal(m)"
              variant="outline"
              size="sm"
              custom-class="flex-1 !border-green-500 !text-green-600"
            >
              <i class="pi pi-check mr-1"></i>
              Approve
            </Button>
            <Button
              @click="openRejectModal(m)"
              variant="outline"
              size="sm"
              custom-class="flex-1 !border-red-500 !text-red-600"
            >
              <i class="pi pi-times mr-1"></i>
              Reject
            </Button>
          </div>
        </div>
      </div>

      <MobilePagination
        v-if="merchants && merchants.length > 0"
        class="mt-4"
        :current-page="currentPage"
        :total-pages="totalPages"
        @prev="prevPage"
        @next="nextPage"
        @go-to="goToPage"
      />
    </div>

    <!-- Filter Modal -->
    <ResponsiveModal
      :show="showFilterModal"
      @close="closeFilterModal"
      title="Filter Merchant"
      subtitle="Pilih filter yang diinginkan"
      :show-footer="true"
    >
      <div class="space-y-4">
        <SelectField
          name="filter-status"
          label="Status"
          v-model="tempFilters.status"
          :options="statusOptions"
          variant="merchant"
        />
        <SelectField
          name="filter-segmentation"
          label="Segmentasi"
          v-model="tempFilters.segmentation"
          :options="segmentationOptions"
          variant="merchant"
        />
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="resetFilters" variant="secondary">Reset</Button>
          <Button @click="applyFilters" variant="merchant">Terapkan</Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Export Modal (dipanggil dari parent header) -->
    <ResponsiveModal
      :show="showExportModal"
      @close="closeExportModal"
      title="Export Data"
      subtitle="Pilih format export"
    >
      <div class="space-y-3">
        <Button @click="exportExcel" variant="merchant" size="lg" customClass="w-full justify-start">
          <i class="pi pi-file-excel mr-3 text-xl"></i>
          <div class="text-left">
            <p class="font-semibold">Export ke Excel</p>
            <p class="text-xs opacity-80">Download .xlsx</p>
          </div>
        </Button>

        <Button @click="exportPDF" variant="merchant" size="lg" customClass="w-full justify-start">
          <i class="pi pi-file-pdf mr-3 text-xl"></i>
          <div class="text-left">
            <p class="font-semibold">Export ke PDF</p>
            <p class="text-xs opacity-80">Download .pdf</p>
          </div>
        </Button>
      </div>
    </ResponsiveModal>

    <!-- Approve Modal -->
    <ResponsiveModal
      :show="showApproveModal"
      @close="closeApproveModal"
      title="Approve Merchant"
      subtitle="Apakah Anda yakin ingin meng-approve merchant ini?"
    >
      <div class="text-center py-4">
        <i class="pi pi-check-circle text-green-500 text-4xl mb-4"></i>
        <p class="text-gray-800 font-semibold mb-2">
          Merchant "{{ selectedMerchant?.name }}" akan di-approve
        </p>
        <p class="text-sm text-gray-500">
          Merchant yang di-approve akan mendapatkan akses penuh ke platform.
        </p>
      </div>

      <div class="flex gap-3 justify-center">
        <Button @click="closeApproveModal" variant="secondary" size="lg" custom-class="w-full max-w-[150px]">
          Batal
        </Button>
        <Button
          @click="approveMerchant"
          variant="merchant"
          size="lg"
          custom-class="w-full max-w-[150px]"
          :loading="processingAction"
        >
          Setujui
        </Button>
      </div>
    </ResponsiveModal>

    <!-- Reject Modal -->
    <ResponsiveModal
      :show="showRejectModal"
      @close="closeRejectModal"
      title="Reject Merchant"
      subtitle="Berikan alasan penolakan"
    >
      <div class="space-y-4">
        <textarea
          v-model="rejectionReason"
          class="w-full p-3 border rounded-md focus:ring-1 focus:ring-primary focus:outline-none resize-none"
          rows="3"
          placeholder="Masukkan alasan penolakan di sini..."
        ></textarea>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="closeRejectModal" variant="secondary">Batal</Button>
          <Button
            @click="rejectMerchant"
            variant="merchant"
            :disabled="!rejectionReason.trim()"
          >
            Tolak Merchant
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>