<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import Button from "@/components/common/Button.vue";
import MerchantTable from "@/components/common/MerchantTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import { useReports } from "@/composables/useReports";

const router = useRouter();
const toast = useToast();

const { reports, loading, pagination, fetchReports } = useReports();

const breadcrumbItems = [{ label: "Content Reports" }];

// State
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(15);
const statusFilter = ref("");
const typeFilter = ref("");

// Load reports
const loadReports = async () => {
  const params = {
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
    reportable_type: typeFilter.value || undefined,
  };

  await fetchReports(params);
};

// Actions
const goToDetail = (report) => {
  router.push({ name: "Admin - Report Detail", params: { id: report.id } });
};

// Pagination
const goToPage = (page) => {
  currentPage.value = page;
  loadReports();
};
const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    currentPage.value++;
    loadReports();
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadReports();
  }
};

// Table config
const tableColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "reporter_name", label: "Pelapor", sortable: true },
  { key: "reportable_type", label: "Tipe Konten", sortable: true },
  { key: "reason", label: "Alasan", sortable: false },
  { key: "status", label: "Status", sortable: true },
  { key: "created_at", label: "Tanggal Lapor", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

// Computed pagination info
const paginationInfo = computed(() => ({
  start: (pagination.value.current_page - 1) * pagination.value.per_page + 1,
  end: Math.min(
    pagination.value.current_page * pagination.value.per_page,
    pagination.value.total
  ),
  total: pagination.value.total,
}));

const getContentTypeLabel = (type) => {
  const types = {
    "App\\Models\\Product": "Produk",
    "App\\Models\\Service": "Jasa",
    "App\\Models\\Merchant": "Merchant",
    "App\\Models\\Post": "Post",
    "App\\Models\\Comment": "Komentar",
  };
  return types[type] || type;
};

const handleRowClick = (report) => {
  goToDetail(report);
};

watch([searchQuery, statusFilter, typeFilter], () => {
  currentPage.value = 1;
  loadReports();
});

onMounted(() => {
  loadReports();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm sticky top-0 z-20 px-4 sm:px-6 py-4">
      <Breadcrumb :items="breadcrumbItems" />
      <h1 class="text-xl sm:text-2xl font-bold text-admin-primary mt-4">
        Content Reports
      </h1>
    </div>

    <!-- Content -->
    <div class="px-4 sm:px-6 py-6">
      <!-- ✅ Desktop Table -->
      <div class="hidden sm:block">
        <MerchantTable
          :items="reports"
          :columns="tableColumns"
          :loading="loading"
          :current-page="currentPage"
          :total-pages="pagination.last_page"
          :pagination-info="paginationInfo"
          :show-checkbox="false"
          empty-message="Tidak ada laporan konten saat ini"
          @row-click="goToDetail"
          @page-change="goToPage"
        >
          <!-- Custom cells -->
        </MerchantTable>
      </div>

      <!-- ✅ Mobile Cards -->
      <div class="sm:hidden">
        <div v-if="loading" class="flex justify-center py-12">
          <i class="pi pi-spin pi-spinner text-4xl text-admin-primary"></i>
        </div>

        <div v-else-if="reports.length === 0" class="text-center py-12">
          <i class="pi pi-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Tidak ada laporan</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Report cards -->
        </div>
      </div>
    </div>
  </div>
</template>